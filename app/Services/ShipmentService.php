<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\PracticeWorkspace;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\ShipmentDocument;
use App\Models\ShipmentItem;
use App\Models\ShipmentStatusHistory;
use App\Models\StockTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityException;

class ShipmentService
{
    public function __construct(
        private readonly NumberingService $numberingService,
    ) {}

    /**
     * Create a new shipment with items atomically (FR-07).
     */
    public function createShipment(PracticeWorkspace $workspace, array $data): Shipment
    {
        return DB::transaction(function () use ($workspace, $data): Shipment {
            // Check idempotency
            $existing = Shipment::where('workspace_id', $workspace->id)
                ->where('idempotency_key', $data['idempotency_key'])
                ->first();

            if ($existing) {
                return $existing;
            }

            $shippingDate = Carbon::parse($data['shipping_date']);
            $shipmentNumber = $this->numberingService->generateNumber($workspace, 'KRM', $shippingDate);

            $shipment = Shipment::create([
                'workspace_id' => $workspace->id,
                'shipment_number' => $shipmentNumber,
                'shipment_type' => $data['shipment_type'],
                'origin' => $data['origin'],
                'destination' => $data['destination'],
                'origin_country' => $data['origin_country'] ?? 'Indonesia',
                'destination_country' => $data['destination_country'] ?? 'Indonesia',
                'incoterms' => $data['incoterms'] ?? null,
                'customs_document_type' => $data['customs_document_type'] ?? null,
                'customs_document_number' => $data['customs_document_number'] ?? null,
                'tariffs_and_taxes' => $data['tariffs_and_taxes'] ?? 0,
                'transport_mode' => $data['transport_mode'],
                'fleet_type' => $data['fleet_type'],
                'driver_name' => $data['driver_name'] ?? null,
                'carrier_service' => $data['carrier_service'] ?? null,
                'tracking_number' => $data['tracking_number'] ?? null,
                'mode_selection_reason' => $data['mode_selection_reason'],
                'estimated_cost' => $data['estimated_cost'] ?? 0,
                'cargo_type' => $data['cargo_type'],
                'cargo_type_details' => $data['cargo_type_details'] ?? null,
                'total_weight_kg' => $data['total_weight_kg'],
                'volume_m3' => $data['volume_m3'] ?? null,
                'packaging_type' => $data['packaging_type'],
                'packaging_type_details' => $data['packaging_type_details'] ?? null,
                'handling_instructions' => $data['handling_instructions'],
                'special_notes' => $data['special_notes'] ?? null,
                'shipping_date' => $shippingDate,
                'estimated_arrival_date' => Carbon::parse($data['estimated_arrival_date']),
                'status' => 'scheduled',
                'idempotency_key' => $data['idempotency_key'],
            ]);

            // Save items with allocation validation
            $this->saveShipmentItems($workspace, $shipment, $data['items']);

            // Initial status history
            ShipmentStatusHistory::create([
                'shipment_id' => $shipment->id,
                'from_status' => null,
                'to_status' => 'scheduled',
                'notes' => 'Pengiriman berhasil dijadwalkan.',
            ]);

            return $shipment;
        });
    }

    /**
     * Validate and save shipment items.
     */
    private function saveShipmentItems(PracticeWorkspace $workspace, Shipment $shipment, array $items): void
    {
        if (empty($items)) {
            throw new UnprocessableEntityException('Pengiriman harus memiliki minimal satu barang.');
        }

        if ($shipment->shipment_type === 'import') {
            // Import: uses products master directly
            foreach ($items as $item) {
                $product = Product::where('workspace_id', $workspace->id)
                    ->where('id', $item['product_id'])
                    ->firstOrFail();

                ShipmentItem::create([
                    'shipment_id' => $shipment->id,
                    'stock_transaction_id' => null,
                    'product_id' => $product->id,
                    'product_code_snapshot' => $product->code,
                    'product_name_snapshot' => $product->name,
                    'category_snapshot' => $product->category,
                    'base_unit_snapshot' => $product->base_unit,
                    'stock_condition' => $item['stock_condition'] ?? 'good',
                    'quantity' => (int) $item['quantity'],
                ]);
            }
        } else {
            // Domestic & Export: allocates from active outbound transactions
            // Lock outbound transactions in consistent ID order to prevent deadlock
            $txIds = collect($items)->pluck('stock_transaction_id')->unique()->sort()->values();
            $outbounds = StockTransaction::where('workspace_id', $workspace->id)
                ->whereIn('id', $txIds)
                ->where('type', TransactionType::Outbound->value)
                ->whereNull('voided_at')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($items as $item) {
                $txId = $item['stock_transaction_id'];
                if (! isset($outbounds[$txId])) {
                    throw new UnprocessableEntityException("Transaksi keluar #{$txId} tidak valid atau sudah dibatalkan.");
                }

                $tx = $outbounds[$txId];
                $qty = (int) $item['quantity'];

                if ($qty <= 0) {
                    throw new UnprocessableEntityException('Jumlah alokasi barang harus lebih dari 0.');
                }

                // Check remaining unallocated quantity
                $alreadyAllocated = ShipmentItem::where('stock_transaction_id', $tx->id)
                    ->whereHas('shipment', function ($q) use ($shipment): void {
                        $q->where('id', '!=', $shipment->id)
                            ->where('status', '!=', 'cancelled');
                    })
                    ->sum('quantity');

                $available = $tx->quantity - $alreadyAllocated;
                if ($qty > $available) {
                    throw new UnprocessableEntityException(
                        "Jumlah alokasi ({$qty}) melebihi sisa kuantitas transaksi keluar {$tx->transaction_number} (Tersisa: {$available} {$tx->product_snapshot['base_unit']})."
                    );
                }

                ShipmentItem::create([
                    'shipment_id' => $shipment->id,
                    'stock_transaction_id' => $tx->id,
                    'product_id' => $tx->product_id,
                    'product_code_snapshot' => $tx->product_snapshot['code'],
                    'product_name_snapshot' => $tx->product_snapshot['name'],
                    'category_snapshot' => $tx->product_snapshot['category'],
                    'base_unit_snapshot' => $tx->product_snapshot['base_unit'],
                    'stock_condition' => $tx->stock_condition,
                    'quantity' => $qty,
                ]);
            }
        }
    }

    /**
     * Update shipment status according to PRD normal flow (FR-07).
     */
    public function updateStatus(PracticeWorkspace $workspace, Shipment $shipment, string $newStatus, ?string $receivedDate = null): Shipment
    {
        return DB::transaction(function () use ($workspace, $shipment, $newStatus, $receivedDate): Shipment {
            $locked = Shipment::where('id', $shipment->id)
                ->where('workspace_id', $workspace->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status === 'cancelled') {
                throw new ConflictException('Pengiriman yang sudah dibatalkan tidak dapat diubah statusnya.');
            }

            $current = $locked->status;

            if ($current === 'scheduled' && $newStatus === 'shipped') {
                if ($locked->shipping_date->isFuture()) {
                    throw new UnprocessableEntityException('Pengiriman belum dapat diberangkatkan karena tanggal pengiriman berada di masa depan.');
                }
            } elseif ($current === 'shipped' && $newStatus === 'in_transit') {
                // valid
            } elseif ($current === 'in_transit' && $newStatus === 'received') {
                if (! $receivedDate) {
                    throw new UnprocessableEntityException('Tanggal diterima wajib diisi saat status Diterima.');
                }
                $rDate = Carbon::parse($receivedDate);
                if ($rDate->lt($locked->shipping_date)) {
                    throw new UnprocessableEntityException('Tanggal diterima tidak boleh lebih awal dari tanggal pengiriman.');
                }
                if ($rDate->isFuture()) {
                    throw new UnprocessableEntityException('Tanggal diterima tidak boleh di masa depan.');
                }
                $locked->received_date = $rDate;
            } else {
                throw new UnprocessableEntityException("Transisi status dari {$current} ke {$newStatus} tidak diizinkan.");
            }

            $locked->status = $newStatus;
            $locked->save();

            ShipmentStatusHistory::create([
                'shipment_id' => $locked->id,
                'from_status' => $current,
                'to_status' => $newStatus,
                'notes' => "Status diperbarui menjadi {$newStatus}.",
            ]);

            return $locked;
        });
    }

    /**
     * Cancel a scheduled shipment (FR-07).
     */
    public function cancelShipment(PracticeWorkspace $workspace, Shipment $shipment, string $reason): Shipment
    {
        return DB::transaction(function () use ($workspace, $shipment, $reason): Shipment {
            $locked = Shipment::where('id', $shipment->id)
                ->where('workspace_id', $workspace->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== 'scheduled') {
                throw new ConflictException('Hanya pengiriman berstatus Dijadwalkan yang dapat dibatalkan.');
            }

            $locked->status = 'cancelled';
            $locked->cancellation_reason = $reason;
            $locked->cancelled_at = now();
            $locked->save();

            ShipmentStatusHistory::create([
                'shipment_id' => $locked->id,
                'from_status' => 'scheduled',
                'to_status' => 'cancelled',
                'notes' => "Pengiriman dibatalkan: {$reason}",
            ]);

            return $locked;
        });
    }

    /**
     * Add a document to a shipment.
     */
    public function addDocument(PracticeWorkspace $workspace, Shipment $shipment, array $data): ShipmentDocument
    {
        return DB::transaction(function () use ($workspace, $shipment, $data): ShipmentDocument {
            if ($shipment->workspace_id !== $workspace->id) {
                abort(404);
            }

            return ShipmentDocument::create([
                'shipment_id' => $shipment->id,
                'document_type' => $data['document_type'],
                'document_number' => $data['document_number'],
                'document_date' => isset($data['document_date']) ? Carbon::parse($data['document_date']) : null,
                'notes' => $data['notes'] ?? null,
                'attachment_path' => $data['attachment_path'] ?? null,
                'attachment_name' => $data['attachment_name'] ?? null,
            ]);
        });
    }
}
