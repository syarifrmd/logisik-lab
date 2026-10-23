<?php

namespace App\Http\Controllers\Practice;

use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Practice\CancelShipmentRequest;
use App\Http\Requests\Practice\StoreShipmentDocumentRequest;
use App\Http\Requests\Practice\StoreShipmentRequest;
use App\Http\Requests\Practice\UpdateShipmentStatusRequest;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\ShipmentItem;
use App\Models\StockTransaction;
use App\Services\ShipmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\ConflictException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityException;

class ShipmentController extends Controller
{
    use ResolvesWorkspace;

    public function __construct(
        private readonly ShipmentService $shipmentService,
    ) {}

    /**
     * Display a listing of shipments (FR-07).
     */
    public function index(Request $request): Response
    {
        $workspace = $this->workspace($request);

        $shipments = Shipment::where('workspace_id', $workspace->id)
            ->with(['items'])
            ->when($request->input('search'), function ($query, $search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('shipment_number', 'like', "%{$search}%")
                        ->orWhere('destination', 'like', "%{$search}%")
                        ->orWhere('origin', 'like', "%{$search}%");
                });
            })
            ->when($request->input('shipment_type'), fn ($q, $t) => $q->where('shipment_type', $t))
            ->when($request->input('transport_mode'), fn ($q, $m) => $q->where('transport_mode', $m))
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->when($request->input('shipping_date'), fn ($q, $d) => $q->whereDate('shipping_date', $d))
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 10), ['*'], 'page', $request->input('page'));

        return Inertia::render('practice/shipments/index', [
            'shipments' => $shipments,
            'filters' => $request->only(['search', 'shipment_type', 'transport_mode', 'status', 'shipping_date']),
        ]);
    }

    /**
     * Show the 5-step wizard form for creating a new shipment.
     */
    public function create(Request $request): Response
    {
        $workspace = $this->workspace($request);

        // Fetch active outbound transactions with remaining available quantity
        $outbounds = StockTransaction::where('workspace_id', $workspace->id)
            ->where('type', TransactionType::Outbound->value)
            ->whereNull('voided_at')
            ->orderBy('transaction_date', 'desc')
            ->get();

        $allocatedPerTx = ShipmentItem::whereIn('stock_transaction_id', $outbounds->pluck('id'))
            ->whereHas('shipment', fn ($q) => $q->where('status', '!=', 'cancelled'))
            ->groupBy('stock_transaction_id')
            ->selectRaw('stock_transaction_id, sum(quantity) as total_allocated')
            ->pluck('total_allocated', 'stock_transaction_id')
            ->toArray();

        $availableOutbounds = $outbounds->map(function ($tx) use ($allocatedPerTx) {
            $allocated = (int) ($allocatedPerTx[$tx->id] ?? 0);
            $remaining = $tx->quantity - $allocated;

            return [
                'id' => $tx->id,
                'transaction_number' => $tx->transaction_number,
                'transaction_date' => $tx->transaction_date->toDateString(),
                'recipient' => $tx->recipient,
                'quantity' => $tx->quantity,
                'allocated' => $allocated,
                'remaining' => $remaining,
                'product_snapshot' => $tx->product_snapshot,
                'stock_condition' => $tx->stock_condition,
            ];
        })->filter(fn ($item) => $item['remaining'] > 0)->values();

        // Products for Import
        $products = Product::where('workspace_id', $workspace->id)
            ->whereNull('archived_at')
            ->orderBy('code', 'asc')
            ->get(['id', 'code', 'name', 'category', 'base_unit', 'stock_good']);

        return Inertia::render('practice/shipments/create', [
            'availableOutbounds' => $availableOutbounds,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created shipment.
     */
    public function store(StoreShipmentRequest $request): RedirectResponse
    {
        $workspace = $this->workspace($request);

        try {
            $shipment = $this->shipmentService->createShipment($workspace, $request->validated());

            return redirect()->route('practice.shipments.show', $shipment)
                ->with('toast', ['type' => 'success', 'message' => 'Pengiriman berhasil dijadwalkan.']);
        } catch (ConflictException $e) {
            return back()->withErrors(['store' => $e->getMessage()])->withInput();
        } catch (UnprocessableEntityException $e) {
            return back()->withErrors(['store' => $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified shipment detail.
     */
    public function show(Request $request, Shipment $shipment): Response
    {
        $workspace = $this->workspace($request);

        if ($shipment->workspace_id !== $workspace->id) {
            abort(404);
        }

        $shipment->load([
            'items.stockTransaction',
            'documents',
            'statusHistories' => fn ($q) => $q->orderBy('created_at', 'asc'),
        ]);

        return Inertia::render('practice/shipments/show', [
            'shipment' => $shipment,
        ]);
    }

    /**
     * Update shipment status.
     */
    public function updateStatus(UpdateShipmentStatusRequest $request, Shipment $shipment): RedirectResponse
    {
        $workspace = $this->workspace($request);

        if ($shipment->workspace_id !== $workspace->id) {
            abort(404);
        }

        try {
            $validated = $request->validated();
            $this->shipmentService->updateStatus(
                $workspace,
                $shipment,
                $validated['status'],
                $validated['received_date'] ?? null
            );

            return back()->with('toast', ['type' => 'success', 'message' => 'Status pengiriman berhasil diperbarui.']);
        } catch (ConflictException|UnprocessableEntityException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }
    }

    /**
     * Cancel scheduled shipment.
     */
    public function cancel(CancelShipmentRequest $request, Shipment $shipment): RedirectResponse
    {
        $workspace = $this->workspace($request);

        if ($shipment->workspace_id !== $workspace->id) {
            abort(404);
        }

        try {
            $this->shipmentService->cancelShipment($workspace, $shipment, $request->validated()['reason']);

            return back()->with('toast', ['type' => 'success', 'message' => 'Pengiriman berhasil dibatalkan.']);
        } catch (ConflictException|UnprocessableEntityException $e) {
            return back()->withErrors(['cancel' => $e->getMessage()]);
        }
    }

    /**
     * Add document to shipment.
     */
    public function storeDocument(StoreShipmentDocumentRequest $request, Shipment $shipment): RedirectResponse
    {
        $workspace = $this->workspace($request);

        if ($shipment->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validated();

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $validated['attachment_path'] = $file->store('documents', 'private');
            $validated['attachment_name'] = $file->getClientOriginalName();
        }

        $this->shipmentService->addDocument($workspace, $shipment, $validated);

        return back()->with('toast', ['type' => 'success', 'message' => 'Dokumen berhasil ditambahkan.']);
    }
}
