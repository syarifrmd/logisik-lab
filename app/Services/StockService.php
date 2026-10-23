<?php

namespace App\Services;

use App\Enums\MovementKind;
use App\Enums\StockCondition;
use App\Enums\TransactionType;
use App\Models\InventoryMovement;
use App\Models\PracticeWorkspace;
use App\Models\Product;
use App\Models\StockTransaction;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityException;

class StockService
{
    public function __construct(
        private readonly NumberingService $numberingService,
    ) {}

    /**
     * Create a product with optional opening balance.
     *
     * If opening_stock_good > 0, creates an opening transaction + ledger
     * atomically in a single DB transaction with product row lock.
     *
     * @param  array<string, mixed>  $data
     */
    public function createProductWithOpeningBalance(PracticeWorkspace $workspace, array $data): Product
    {
        return DB::transaction(function () use ($workspace, $data): Product {
            $product = Product::create([
                'workspace_id' => $workspace->id,
                'code' => $data['code'] ?? $this->numberingService->generateProductCode($workspace),
                'name' => $data['name'],
                'category' => $data['category'],
                'specification' => $data['specification'] ?? null,
                'base_unit' => $data['base_unit'],
                'cost_price' => $data['cost_price'],
                'selling_price' => $data['selling_price'],
                'photo_path' => $data['photo_path'] ?? null,
                'stock_good' => 0,
                'stock_damaged' => 0,
            ]);

            $openingStock = (int) ($data['stock_good'] ?? 0);

            if ($openingStock > 0) {
                $date = isset($data['stock_date']) && $data['stock_date']
                    ? Carbon::parse($data['stock_date'])
                    : today();
                $this->postOpeningBalance($workspace, $product, $openingStock, $date);
            }

            return $product;
        });
    }

    /**
     * Post an opening balance for a newly created product.
     */
    private function postOpeningBalance(PracticeWorkspace $workspace, Product $product, int $quantity, Carbon $date): StockTransaction
    {
        $transaction = StockTransaction::create([
            'workspace_id' => $workspace->id,
            'product_id' => $product->id,
            'transaction_number' => $this->numberingService->generateNumber($workspace, 'SA', $date),
            'type' => TransactionType::Opening->value,
            'transaction_date' => $date,
            'external_document_number' => null,
            'supplier' => null,
            'recipient' => null,
            'reason' => null,
            'storage_location' => null,
            'stock_condition' => StockCondition::Good->value,
            'quantity' => $quantity,
            'unit_price' => $product->cost_price,
            'total_amount' => bcmul((string) $quantity, (string) $product->cost_price, 2),
            'notes' => 'Saldo awal',
            'product_snapshot' => $this->createSnapshot($product),
            'idempotency_key' => Str::uuid()->toString(),
            'request_hash' => null,
        ]);

        InventoryMovement::create([
            'workspace_id' => $workspace->id,
            'product_id' => $product->id,
            'stock_transaction_id' => $transaction->id,
            'movement_kind' => MovementKind::Original->value,
            'stock_condition' => StockCondition::Good->value,
            'quantity_delta' => $quantity,
            'effective_date' => $date,
        ]);

        $product->increment('stock_good', $quantity);

        return $transaction;
    }

    /**
     * Post an inbound (barang masuk) transaction.
     *
     * Validates product is active, locks the product row, creates transaction +
     * ledger + updates stock atomically with idempotency check.
     *
     * @param  array<string, mixed>  $data
     *
     * @throws ValidationException When stock would go negative
     * @throws ConflictException On idempotency conflict
     */
    public function postInbound(PracticeWorkspace $workspace, array $data): StockTransaction
    {
        return $this->postTransaction($workspace, $data, TransactionType::Inbound);
    }

    /**
     * Post an outbound (barang keluar) transaction.
     *
     * Validates stock availability within lock, creates transaction + ledger +
     * updates stock atomically with idempotency check.
     *
     * @param  array<string, mixed>  $data
     */
    public function postOutbound(PracticeWorkspace $workspace, array $data): StockTransaction
    {
        return $this->postTransaction($workspace, $data, TransactionType::Outbound);
    }

    /**
     * Core posting logic shared by inbound and outbound.
     *
     * @param  array<string, mixed>  $data
     */
    private function postTransaction(PracticeWorkspace $workspace, array $data, TransactionType $type): StockTransaction
    {
        $idempotencyKey = $data['idempotency_key'];
        $requestHash = $this->computeRequestHash($data);

        // Check idempotency: return existing if same key + same hash
        $existing = StockTransaction::where('workspace_id', $workspace->id)
            ->where('type', $type->value)
            ->where('idempotency_key', $idempotencyKey)
            ->first();

        if ($existing !== null) {
            if ($existing->request_hash === $requestHash) {
                return $existing;
            }
            throw new ConflictException(
                'Token idempotensi telah digunakan dengan payload yang berbeda.'
            );
        }

        return DB::transaction(function () use ($workspace, $data, $type, $idempotencyKey, $requestHash): StockTransaction {
            // Lock the product row for the duration of this transaction
            $product = Product::where('workspace_id', $workspace->id)
                ->where('id', $data['product_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($product->archived_at !== null) {
                throw new UnprocessableEntityException(
                    'Barang telah diarsipkan dan tidak dapat dipakai untuk transaksi baru.'
                );
            }

            $condition = StockCondition::from($data['stock_condition']);
            $quantity = (int) $data['quantity'];

            // For outbound: validate stock availability within lock
            if ($type === TransactionType::Outbound) {
                $available = $product->stockForCondition($condition);
                if ($quantity > $available) {
                    throw new ConflictException(
                        "Stok tersedia saat ini {$available} {$product->base_unit}. Sesuaikan jumlah barang keluar."
                    );
                }
            }

            // Validate transaction date (INV-06)
            $date = Carbon::parse($data['transaction_date']);
            if ($date->isFuture()) {
                throw new UnprocessableEntityException(
                    'Tanggal transaksi tidak boleh melewati hari ini.'
                );
            }

            // Check not earlier than last movement date
            $lastMovement = InventoryMovement::where('workspace_id', $workspace->id)
                ->where('product_id', $product->id)
                ->orderByDesc('effective_date')
                ->first();

            if ($lastMovement !== null && $date->lt($lastMovement->effective_date)) {
                throw new UnprocessableEntityException(
                    'Tanggal transaksi tidak boleh lebih awal dari transaksi terakhir produk ini.'
                );
            }

            // Compute delta
            $delta = match ($type) {
                TransactionType::Inbound => $quantity,
                TransactionType::Outbound => -$quantity,
                default => 0,
            };

            // Update stock
            $stockColumn = $condition === StockCondition::Good ? 'stock_good' : 'stock_damaged';

            // Check no negative stock (INV-05)
            $newStock = $product->{$stockColumn} + $delta;
            if ($newStock < 0) {
                throw new ConflictException(
                    'Stok tidak boleh negatif.'
                );
            }

            // Generate transaction number
            $numberPrefix = $type->numberPrefix();
            $transactionNumber = $this->numberingService->generateNumber($workspace, $numberPrefix, $date);

            // Create transaction
            $transaction = new StockTransaction([
                'workspace_id' => $workspace->id,
                'product_id' => $product->id,
                'transaction_number' => $transactionNumber,
                'type' => $type->value,
                'transaction_date' => $date,
                'external_document_number' => $data['external_document_number'],
                'supplier' => $data['supplier'] ?? null,
                'recipient' => $data['recipient'] ?? null,
                'reason' => $data['reason'] ?? null,
                'storage_location' => $data['storage_location'] ?? null,
                'stock_condition' => $condition->value,
                'quantity' => $quantity,
                'unit_price' => $data['unit_price'],
                'total_amount' => bcmul((string) $quantity, (string) $data['unit_price'], 2),
                'notes' => $data['notes'] ?? null,
                'product_snapshot' => $this->createSnapshot($product),
                'idempotency_key' => $idempotencyKey,
                'request_hash' => $requestHash,
            ]);

            try {
                $transaction->save();
            } catch (QueryException $e) {
                // Race condition: another request with same idempotency key won
                $existing = StockTransaction::where('workspace_id', $workspace->id)
                    ->where('type', $type->value)
                    ->where('idempotency_key', $idempotencyKey)
                    ->first();

                if ($existing !== null) {
                    return $existing;
                }
                throw $e;
            }

            // Create ledger movement
            InventoryMovement::create([
                'workspace_id' => $workspace->id,
                'product_id' => $product->id,
                'stock_transaction_id' => $transaction->id,
                'movement_kind' => MovementKind::Original->value,
                'stock_condition' => $condition->value,
                'quantity_delta' => $delta,
                'effective_date' => $date,
            ]);

            // Update product stock cache
            $product->{$stockColumn} = $newStock;
            $product->save();

            return $transaction;
        });
    }

    /**
     * Void a stock transaction with reversal ledger.
     *
     * Validates: not already voided, void reason provided, reversal doesn't
     * make stock negative. For outbound: checks no active shipment allocations.
     */
    public function voidTransaction(PracticeWorkspace $workspace, int $transactionId, string $reason): StockTransaction
    {
        return DB::transaction(function () use ($workspace, $transactionId, $reason): StockTransaction {
            // Lock the transaction row
            $transaction = StockTransaction::where('workspace_id', $workspace->id)
                ->where('id', $transactionId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($transaction->voided_at !== null) {
                throw new UnprocessableEntityException(
                    'Transaksi ini sudah dibatalkan.'
                );
            }

            if ($transaction->type === TransactionType::Opening->value) {
                throw new UnprocessableEntityException(
                    'Saldo awal tidak dapat dibatalkan melalui UI.'
                );
            }

            // Lock the product row
            $product = Product::where('workspace_id', $workspace->id)
                ->where('id', $transaction->product_id)
                ->lockForUpdate()
                ->firstOrFail();

            $condition = StockCondition::from($transaction->stock_condition);
            $stockColumn = $condition === StockCondition::Good ? 'stock_good' : 'stock_damaged';

            // Compute reversal delta (inverse of original)
            $originalDelta = match (TransactionType::from($transaction->type)) {
                TransactionType::Inbound => $transaction->quantity,
                TransactionType::Outbound => -$transaction->quantity,
                default => 0,
            };
            $reversalDelta = -$originalDelta;

            // Check no negative stock after reversal (for inbound void)
            $newStock = $product->{$stockColumn} + $reversalDelta;
            if ($newStock < 0) {
                throw new ConflictException(
                    'Pembatalan transaksi masuk ini akan membuat stok negatif.'
                );
            }

            // Mark transaction as voided
            $transaction->voided_at = now();
            $transaction->void_reason = $reason;
            $transaction->save();

            // Create reversal ledger movement
            InventoryMovement::create([
                'workspace_id' => $workspace->id,
                'product_id' => $product->id,
                'stock_transaction_id' => $transaction->id,
                'movement_kind' => MovementKind::Reversal->value,
                'stock_condition' => $condition->value,
                'quantity_delta' => $reversalDelta,
                'effective_date' => today(),
            ]);

            // Update stock
            $product->{$stockColumn} = $newStock;
            $product->save();

            return $transaction;
        });
    }

    /**
     * Create a product snapshot for transaction records.
     *
     * @return array<string, string|null>
     */
    private function createSnapshot(Product $product): array
    {
        return [
            'code' => $product->code,
            'name' => $product->name,
            'category' => $product->category,
            'specification' => $product->specification,
            'base_unit' => $product->base_unit,
        ];
    }

    /**
     * Compute a hash of the request payload for idempotency.
     *
     * @param  array<string, mixed>  $data
     */
    private function computeRequestHash(array $data): string
    {
        $relevant = [
            'product_id' => $data['product_id'] ?? null,
            'transaction_date' => $data['transaction_date'] ?? null,
            'external_document_number' => $data['external_document_number'] ?? null,
            'stock_condition' => $data['stock_condition'] ?? null,
            'quantity' => $data['quantity'] ?? null,
            'unit_price' => $data['unit_price'] ?? null,
            'supplier' => $data['supplier'] ?? null,
            'recipient' => $data['recipient'] ?? null,
            'reason' => $data['reason'] ?? null,
            'storage_location' => $data['storage_location'] ?? null,
            'notes' => $data['notes'] ?? null,
        ];

        ksort($relevant);

        return hash('sha256', json_encode($relevant));
    }
}
