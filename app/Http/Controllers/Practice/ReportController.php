<?php

namespace App\Http\Controllers\Practice;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    use ResolvesWorkspace;

    public function __construct(
        private readonly ReportService $reportService,
    ) {}

    /**
     * Display report preview and tabs (FR-10).
     */
    public function index(Request $request): Response
    {
        $workspace = $this->workspace($request);

        $tab = $request->input('tab', 'products');
        if (! in_array($tab, ['products', 'inbound', 'outbound', 'stock', 'shipments'], true)) {
            $tab = 'products';
        }

        $filters = $request->all();
        $preview = $this->reportService->getPreviewData($workspace, $tab, $filters);

        $categories = Product::where('workspace_id', $workspace->id)
            ->distinct()
            ->pluck('category')
            ->toArray();

        $productList = Product::where('workspace_id', $workspace->id)
            ->orderBy('code', 'asc')
            ->get(['id', 'code', 'name']);

        return Inertia::render('practice/reports/index', [
            'tab' => $tab,
            'preview' => $preview,
            'categories' => $categories,
            'productList' => $productList,
            'filters' => [
                'tab' => $tab,
                'search' => $request->input('search', ''),
                'start_date' => $request->input('start_date', now()->startOfMonth()->toDateString()),
                'end_date' => $request->input('end_date', now()->toDateString()),
                'category' => $request->input('category', ''),
                'status' => $request->input('status', ''),
                'product_id' => $request->input('product_id', ''),
                'stock_condition' => $request->input('stock_condition', ''),
                'reason' => $request->input('reason', ''),
                'shipment_type' => $request->input('shipment_type', ''),
                'transport_mode' => $request->input('transport_mode', ''),
            ],
        ]);
    }

    /**
     * Export genuine XLSX file (FR-10).
     */
    public function export(Request $request): StreamedResponse
    {
        $workspace = $this->workspace($request);
        $user = $request->user();

        $tab = $request->input('tab', 'products');
        if (! in_array($tab, ['products', 'inbound', 'outbound', 'stock', 'shipments'], true)) {
            $tab = 'products';
        }

        $filters = $request->all();
        $spreadsheet = $this->reportService->buildSpreadsheet($workspace, $user, $tab, $filters);

        $datePart = now()->format('Ymd');
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $datePart = str_replace('-', '', $filters['start_date']).'-'.str_replace('-', '', $filters['end_date']);
        }

        $filename = "logistik-lab-{$tab}-{$datePart}.xlsx";

        return response()->streamDownload(function () use ($spreadsheet): void {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }
}
