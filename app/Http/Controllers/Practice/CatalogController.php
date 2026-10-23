<?php

namespace App\Http\Controllers\Practice;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    use ResolvesWorkspace;

    /**
     * Display the product catalog for the practice workspace (FR-08).
     */
    public function index(Request $request): Response
    {
        $workspace = $this->workspace($request);

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50], true)) {
            $perPage = 10;
        }

        $products = Product::where('workspace_id', $workspace->id)
            ->whereNull('archived_at')
            ->when($request->input('search'), function ($query, $search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->when($request->input('category'), function ($query, $category): void {
                $query->where('category', $category);
            })
            ->orderBy('name', 'asc')
            ->paginate($perPage, ['*'], 'page', $request->input('page'));

        $categories = Product::where('workspace_id', $workspace->id)
            ->whereNull('archived_at')
            ->distinct()
            ->pluck('category')
            ->toArray();

        return Inertia::render('practice/catalog/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'per_page']),
        ]);
    }
}
