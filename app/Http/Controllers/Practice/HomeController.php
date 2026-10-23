<?php

namespace App\Http\Controllers\Practice;

use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    use ResolvesWorkspace;

    /**
     * Display the practice home (Beranda) page.
     *
     * Shows four statistics computed from the workspace's data.
     */
    public function index(Request $request): Response
    {
        $workspace = $this->workspace($request);

        $stats = [
            'product_count' => Product::where('workspace_id', $workspace->id)
                ->whereNull('archived_at')
                ->count(),
            'total_inbound' => StockTransaction::where('workspace_id', $workspace->id)
                ->where('type', TransactionType::Inbound->value)
                ->whereNull('voided_at')
                ->sum('quantity'),
            'total_outbound' => StockTransaction::where('workspace_id', $workspace->id)
                ->where('type', TransactionType::Outbound->value)
                ->whereNull('voided_at')
                ->sum('quantity'),
            'total_stock_good' => (int) Product::where('workspace_id', $workspace->id)
                ->sum('stock_good'),
            'total_stock_damaged' => (int) Product::where('workspace_id', $workspace->id)
                ->sum('stock_damaged'),
        ];
        $stats['total_stock_physical'] = $stats['total_stock_good'] + $stats['total_stock_damaged'];

        return Inertia::render('practice/home', [
            'stats' => $stats,
        ]);
    }
}
