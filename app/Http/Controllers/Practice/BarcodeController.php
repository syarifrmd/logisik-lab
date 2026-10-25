<?php

namespace App\Http\Controllers\Practice;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\BarcodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class BarcodeController extends Controller
{
    use ResolvesWorkspace;

    public function __construct(
        private readonly BarcodeService $barcodeService,
    ) {}

    /**
     * Display the barcode generation and scanner page (FR-09).
     */
    public function index(Request $request): Response
    {
        $workspace = $this->workspace($request);

        $products = Product::where('workspace_id', $workspace->id)
            ->whereNull('archived_at')
            ->orderBy('code', 'asc')
            ->get(['id', 'code', 'name', 'category', 'selling_price', 'stock_good', 'base_unit']);

        $selectedProduct = null;
        $barcodeSvg = null;

        $code = $request->input('code');
        $productId = $request->input('product_id');

        if ($code || $productId) {
            $selectedProduct = Product::where('workspace_id', $workspace->id)
                ->whereNull('archived_at')
                ->when($productId, fn ($q) => $q->where('id', $productId))
                ->when($code, fn ($q) => $q->where('code', $code))
                ->first();

            if ($selectedProduct) {
                $barcodeSvg = $this->barcodeService->svg($selectedProduct->code, 2, 80);
            }
        }

        return Inertia::render('practice/barcode/index', [
            'products' => $products,
            'selectedProduct' => $selectedProduct,
            'barcodeSvg' => $barcodeSvg,
        ]);
    }

    /**
     * Download the barcode SVG file (FR-09).
     */
    public function download(Request $request, Product $product): HttpResponse
    {
        $workspace = $this->workspace($request);

        if ($product->workspace_id !== $workspace->id) {
            abort(404);
        }

        $svg = $this->barcodeService->svg($product->code, 2, 80);

        // Wrap SVG with product name and code text
        $fullSvg = <<<SVG
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <text x="150" y="25" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#000000">{$product->name}</text>
    <g transform="translate(25, 35)">
        {$svg}
    </g>
    <text x="150" y="125" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle" fill="#000000">{$product->code}</text>
</svg>
SVG;

        $safeFilename = 'barcode-'.preg_replace('/[^A-Za-z0-9_-]/', '', $product->code).'.svg';

        return response($fullSvg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Content-Disposition' => 'attachment; filename="'.$safeFilename.'"',
        ]);
    }

    /**
     * Display printable label page for 60x35mm (FR-09).
     */
    public function print(Request $request, Product $product): Response
    {
        $workspace = $this->workspace($request);

        if ($product->workspace_id !== $workspace->id) {
            abort(404);
        }

        $barcodeSvg = $this->barcodeService->svg($product->code, 2, 80);

        return Inertia::render('practice/barcode/print', [
            'product' => $product,
            'barcodeSvg' => $barcodeSvg,
        ]);
    }

    /**
     * Search product by barcode/code for scanner lookups (FR-09).
     */
    public function lookup(Request $request): JsonResponse
    {
        $workspace = $this->workspace($request);
        $code = trim((string) $request->input('code'));

        if ($code === '') {
            return response()->json(['message' => 'Kode barang wajib diisi.'], 422);
        }

        $product = Product::where('workspace_id', $workspace->id)
            ->where('code', $code)
            ->first();

        if (! $product) {
            return response()->json([
                'found' => false,
                'message' => "Barang dengan kode '{$code}' tidak ditemukan di ruang praktik Anda.",
            ], 404);
        }

        return response()->json([
            'found' => true,
            'product' => [
                'id' => $product->id,
                'code' => $product->code,
                'name' => $product->name,
                'category' => $product->category,
                'base_unit' => $product->base_unit,
                'cost_price' => $product->cost_price,
                'selling_price' => $product->selling_price,
                'stock_good' => $product->stock_good,
                'stock_damaged' => $product->stock_damaged,
                'is_archived' => $product->archived_at !== null,
            ],
        ]);
    }
}
