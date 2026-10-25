<?php

namespace App\Http\Controllers\Practice;

use App\Http\Controllers\Controller;
use App\Http\Requests\Practice\StoreProductRequest;
use App\Http\Requests\Practice\UpdateProductRequest;
use App\Models\Product;
use App\Services\BarcodeService;
use App\Services\NumberingService;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpKernel\Exception\ConflictException;

class ProductController extends Controller
{
    use ResolvesWorkspace;

    public function __construct(
        private readonly StockService $stockService,
        private readonly NumberingService $numberingService,
        private readonly BarcodeService $barcodeService,
    ) {}

    /**
     * Display a listing of products.
     */
    public function index(Request $request): Response
    {
        $workspace = $this->workspace($request);

        $products = Product::where('workspace_id', $workspace->id)
            ->when($request->input('search'), function ($query, $search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->when($request->input('category'), function ($query, $category): void {
                $query->where('category', $category);
            })
            ->when($request->input('status') === 'archived', function ($query): void {
                $query->whereNotNull('archived_at');
            }, function ($query): void {
                $query->whereNull('archived_at');
            })
            ->withExists('stockTransactions')
            ->orderBy('created_at', 'desc')
            ->paginate(
                $request->input('per_page', 10),
                [
                    'id',
                    'workspace_id',
                    'code',
                    'name',
                    'category',
                    'specification',
                    'base_unit',
                    'cost_price',
                    'selling_price',
                    'photo_path',
                    'stock_good',
                    'stock_damaged',
                    'archived_at',
                    'created_at',
                    'updated_at',
                ],
                'page',
                $request->input('page'),
            );

        $categories = Product::where('workspace_id', $workspace->id)
            ->distinct()
            ->pluck('category')
            ->toArray();

        return Inertia::render('practice/products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(Request $request): Response
    {
        $workspace = $this->workspace($request);
        $suggestedCode = $this->numberingService->generateProductCode($workspace);

        $categories = Product::where('workspace_id', $workspace->id)
            ->distinct()
            ->pluck('category')
            ->toArray();

        return Inertia::render('practice/products/create', [
            'suggestedCode' => $suggestedCode,
            'categories' => $categories,
            'barcodeMode' => $request->input('barcode_mode') === 'existing' ? 'existing' : 'automatic',
        ]);
    }

    /**
     * Store a newly created product with optional opening balance.
     */
    public function store(StoreProductRequest $request)
    {
        $workspace = $this->workspace($request);
        $validated = $request->validated();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('products', 'private');
        }

        try {
            $product = $this->stockService->createProductWithOpeningBalance($workspace, $validated);

            return redirect()->route('practice.products.show', $product)
                ->with('toast', ['type' => 'success', 'message' => 'Barang berhasil dibuat.']);
        } catch (ConflictException $e) {
            return back()->withErrors(['code' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified product.
     */
    public function show(Request $request, Product $product): Response
    {
        $workspace = $this->workspace($request);

        if ($product->workspace_id !== $workspace->id) {
            abort(404);
        }

        $product->load(['stockTransactions' => function ($query): void {
            $query->orderBy('transaction_date', 'desc')->orderBy('id', 'desc');
        }]);

        return Inertia::render('practice/products/show', [
            'product' => $product,
            'barcodeSvg' => $this->barcodeService->svg($product->code, 2, 80),
        ]);
    }

    /**
     * Display a product photo stored on the private disk.
     */
    public function photo(Request $request, Product $product): BinaryFileResponse
    {
        $workspace = $this->workspace($request);

        if ($product->workspace_id !== $workspace->id || $product->photo_path === null) {
            abort(404);
        }

        $disk = Storage::disk('private');

        if (! $disk->exists($product->photo_path)) {
            abort(404);
        }

        return response()->file($disk->path($product->photo_path));
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Request $request, Product $product): Response
    {
        $workspace = $this->workspace($request);

        if ($product->workspace_id !== $workspace->id) {
            abort(404);
        }

        $categories = Product::where('workspace_id', $workspace->id)
            ->distinct()
            ->pluck('category')
            ->toArray();

        return Inertia::render('practice/products/edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $workspace = $this->workspace($request);

        if ($product->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validated();

        if ($request->hasFile('photo')) {
            if ($product->photo_path !== null) {
                Storage::disk('private')->delete($product->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('products', 'private');
        }

        $product->update($validated);

        return redirect()->route('practice.products.show', $product)
            ->with('toast', ['type' => 'success', 'message' => 'Barang berhasil diperbarui.']);
    }

    /**
     * Remove the specified product (only if no transactions).
     */
    public function destroy(Request $request, Product $product)
    {
        $workspace = $this->workspace($request);

        if ($product->workspace_id !== $workspace->id) {
            abort(404);
        }

        if ($product->stock_good > 0 || $product->stock_damaged > 0) {
            return back()->withErrors([
                'delete' => sprintf(
                    'Barang masih memiliki stok %d baik dan %d rusak. Habiskan atau keluarkan stok terlebih dahulu sebelum menghapus barang.',
                    $product->stock_good,
                    $product->stock_damaged,
                ),
            ]);
        }

        $hasTransactions = $product->stockTransactions()->exists();

        if ($hasTransactions) {
            return back()->withErrors([
                'delete' => 'Stok barang sudah 0, tetapi barang ini memiliki riwayat transaksi. Barang tidak dapat dihapus agar riwayat tetap aman. Gunakan Arsipkan sebagai gantinya.',
            ]);
        }

        if ($product->photo_path !== null) {
            Storage::disk('private')->delete($product->photo_path);
        }

        $product->delete();

        return redirect()->route('practice.products.index')
            ->with('toast', ['type' => 'success', 'message' => 'Barang berhasil dihapus.']);
    }

    /**
     * Archive the specified product.
     */
    public function archive(Request $request, Product $product)
    {
        $workspace = $this->workspace($request);

        if ($product->workspace_id !== $workspace->id) {
            abort(404);
        }

        $product->update(['archived_at' => now()]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Barang berhasil diarsipkan.']);
    }

    /**
     * Reactivate an archived product.
     */
    public function reactivate(Request $request, Product $product)
    {
        $workspace = $this->workspace($request);

        if ($product->workspace_id !== $workspace->id) {
            abort(404);
        }

        $product->update(['archived_at' => null]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Barang berhasil diaktifkan kembali.']);
    }
}
