<?php

namespace App\Http\Controllers\Practice;

use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Practice\StoreInboundRequest;
use App\Http\Requests\Practice\VoidTransactionRequest;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Services\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class InboundController extends Controller
{
    use ResolvesWorkspace;

    public function __construct(
        private readonly StockService $stockService,
    ) {}

    /**
     * Display a listing of inbound transactions.
     */
    public function index(Request $request): Response
    {
        $workspace = $this->workspace($request);

        $transactions = StockTransaction::where('workspace_id', $workspace->id)
            ->where('type', TransactionType::Inbound->value)
            ->when($request->input('search'), function ($query, $search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('transaction_number', 'like', "%{$search}%")
                        ->orWhere('external_document_number', 'like', "%{$search}%")
                        ->orWhere('supplier', 'like', "%{$search}%");
                });
            })
            ->when($request->input('status'), function ($query, $status): void {
                if ($status === 'voided') {
                    $query->whereNotNull('voided_at');
                } elseif ($status === 'active') {
                    $query->whereNull('voided_at');
                }
            })
            ->with('product:id,code,name,base_unit')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($request->input('per_page', 10));

        return Inertia::render('practice/inbound/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new inbound transaction.
     */
    public function create(Request $request): Response
    {
        $workspace = $this->workspace($request);

        $products = Product::where('workspace_id', $workspace->id)
            ->whereNull('archived_at')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'category', 'specification', 'base_unit', 'cost_price', 'stock_good', 'stock_damaged']);

        return Inertia::render('practice/inbound/create', [
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created inbound transaction.
     */
    public function store(StoreInboundRequest $request): RedirectResponse
    {
        $workspace = $this->workspace($request);
        $validated = $request->validated();

        try {
            $transaction = $this->stockService->postInbound($workspace, $validated);

            return redirect()->route('practice.inbound.show', $transaction)
                ->with('toast', ['type' => 'success', 'message' => 'Barang masuk berhasil dicatat.']);
        } catch (ConflictHttpException $e) {
            return back()->withErrors(['stock' => $e->getMessage()])
                ->withInput();
        } catch (UnprocessableEntityHttpException $e) {
            return back()->withErrors(['stock' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified inbound transaction.
     */
    public function show(Request $request, StockTransaction $transaction): Response
    {
        $workspace = $this->workspace($request);

        if ($transaction->workspace_id !== $workspace->id || $transaction->type !== TransactionType::Inbound->value) {
            abort(404);
        }

        $transaction->load('product:id,code,name,base_unit,category,specification');
        $transaction->load('inventoryMovements');

        return Inertia::render('practice/inbound/show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Void the specified inbound transaction.
     */
    public function void(VoidTransactionRequest $request, StockTransaction $transaction): RedirectResponse
    {
        $workspace = $this->workspace($request);

        if ($transaction->workspace_id !== $workspace->id || $transaction->type !== TransactionType::Inbound->value) {
            abort(404);
        }

        try {
            $this->stockService->voidTransaction($workspace, $transaction->id, $request->validated()['reason']);

            return back()->with('toast', ['type' => 'success', 'message' => 'Transaksi berhasil dibatalkan.']);
        } catch (ConflictHttpException $e) {
            return back()->withErrors(['void' => $e->getMessage()]);
        } catch (UnprocessableEntityHttpException $e) {
            return back()->withErrors(['void' => $e->getMessage()]);
        }
    }
}
