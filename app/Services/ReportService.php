<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\InventoryMovement;
use App\Models\PracticeWorkspace;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\StockTransaction;
use App\Models\User;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ReportService
{
    /**
     * Get preview data for the given tab and filters (FR-10).
     */
    public function getPreviewData(PracticeWorkspace $workspace, string $tab, array $filters): array
    {
        return match ($tab) {
            'inbound' => $this->getInboundData($workspace, $filters),
            'outbound' => $this->getOutboundData($workspace, $filters),
            'stock' => $this->getStockData($workspace, $filters),
            'shipments' => $this->getShipmentsData($workspace, $filters),
            default => $this->getProductsData($workspace, $filters),
        };
    }

    /**
     * Build and return Spreadsheet instance for Excel download (FR-10).
     */
    public function buildSpreadsheet(PracticeWorkspace $workspace, User $user, string $tab, array $filters): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        match ($tab) {
            'inbound' => $this->buildInboundSheet($sheet, $workspace, $user, $filters),
            'outbound' => $this->buildOutboundSheet($sheet, $workspace, $user, $filters),
            'stock' => $this->buildStockSheet($sheet, $workspace, $user, $filters),
            'shipments' => $this->buildShipmentsWorkbook($spreadsheet, $workspace, $user, $filters),
            default => $this->buildProductsSheet($sheet, $workspace, $user, $filters),
        };

        return $spreadsheet;
    }

    /* -------------------------------------------------------------------------- */
    /* 1. DATA BARANG */
    /* -------------------------------------------------------------------------- */

    public function getProductsData(PracticeWorkspace $workspace, array $filters): array
    {
        $query = Product::where('workspace_id', $workspace->id)
            ->when($filters['search'] ?? null, function ($q, $search): void {
                $q->where(function ($sub) use ($search): void {
                    $sub->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->when($filters['category'] ?? null, fn ($q, $cat) => $q->where('category', $cat))
            ->when(($filters['status'] ?? null) === 'archived', fn ($q) => $q->whereNotNull('archived_at'))
            ->when(($filters['status'] ?? null) === 'active', fn ($q) => $q->whereNull('archived_at'))
            ->orderBy('code', 'asc');

        $rows = $query->get()->map(function ($p) {
            return [
                'code' => $p->code,
                'name' => $p->name,
                'category' => $p->category,
                'specification' => $p->specification ?? '-',
                'base_unit' => $p->base_unit,
                'cost_price' => (float) $p->cost_price,
                'selling_price' => (float) $p->selling_price,
                'stock_good' => $p->stock_good,
                'stock_damaged' => $p->stock_damaged,
                'stock_physical' => $p->stock_good + $p->stock_damaged,
                'status' => $p->archived_at ? 'Diarsipkan' : 'Aktif',
            ];
        })->toArray();

        return [
            'tab' => 'products',
            'title' => 'Laporan Data Barang',
            'total_rows' => count($rows),
            'rows' => $rows,
        ];
    }

    private function buildProductsSheet($sheet, PracticeWorkspace $workspace, User $user, array $filters): void
    {
        $sheet->setTitle('Data Barang');
        $this->writeHeaderInfo($sheet, 'LAPORAN DATA BARANG', $user, 'Kondisi Saat Ini');

        $headers = [
            'Kode Barang', 'Nama Barang', 'Kategori', 'Spesifikasi', 'Satuan',
            'Harga Pokok (Rp)', 'Harga Jual (Rp)', 'Stok Baik', 'Stok Rusak', 'Total Stok Fisik', 'Status',
        ];
        $this->writeTableHeaders($sheet, 5, $headers);

        $data = $this->getProductsData($workspace, $filters)['rows'];
        $rowIdx = 6;

        foreach ($data as $item) {
            $sheet->setCellValueExplicit("A{$rowIdx}", $this->sanitizeForExcel($item['code']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("B{$rowIdx}", $this->sanitizeForExcel($item['name']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("C{$rowIdx}", $this->sanitizeForExcel($item['category']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("D{$rowIdx}", $this->sanitizeForExcel($item['specification']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("E{$rowIdx}", $this->sanitizeForExcel($item['base_unit']), DataType::TYPE_STRING);
            $sheet->setCellValue("F{$rowIdx}", $item['cost_price']);
            $sheet->setCellValue("G{$rowIdx}", $item['selling_price']);
            $sheet->setCellValue("H{$rowIdx}", $item['stock_good']);
            $sheet->setCellValue("I{$rowIdx}", $item['stock_damaged']);
            $sheet->setCellValue("J{$rowIdx}", $item['stock_physical']);
            $sheet->setCellValueExplicit("K{$rowIdx}", $item['status'], DataType::TYPE_STRING);
            $rowIdx++;
        }

        $this->formatTable($sheet, 5, $rowIdx - 1, 'K');
    }

    /* -------------------------------------------------------------------------- */
    /* 2. BARANG MASUK */
    /* -------------------------------------------------------------------------- */

    public function getInboundData(PracticeWorkspace $workspace, array $filters): array
    {
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        $query = StockTransaction::where('workspace_id', $workspace->id)
            ->where('type', TransactionType::Inbound->value)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->when($filters['product_id'] ?? null, fn ($q, $pid) => $q->where('product_id', $pid))
            ->when($filters['stock_condition'] ?? null, fn ($q, $sc) => $q->where('stock_condition', $sc))
            ->when(($filters['status'] ?? null) === 'active', fn ($q) => $q->whereNull('voided_at'))
            ->when(($filters['status'] ?? null) === 'voided', fn ($q) => $q->whereNotNull('voided_at'))
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc');

        $rows = $query->get()->map(function ($tx) {
            return [
                'transaction_number' => $tx->transaction_number,
                'transaction_date' => $tx->transaction_date->toDateString(),
                'external_doc' => $tx->external_document_number ?? '-',
                'product_code' => $tx->product_snapshot['code'] ?? '-',
                'product_name' => $tx->product_snapshot['name'] ?? '-',
                'category' => $tx->product_snapshot['category'] ?? '-',
                'base_unit' => $tx->product_snapshot['base_unit'] ?? '-',
                'quantity' => $tx->quantity,
                'condition' => $tx->stock_condition === 'good' ? 'Baik' : 'Rusak',
                'supplier' => $tx->supplier ?? '-',
                'location' => $tx->storage_location ?? '-',
                'unit_price' => (float) $tx->unit_price,
                'total_amount' => (float) $tx->total_amount,
                'notes' => $tx->notes ?? '-',
                'status' => $tx->voided_at ? 'Dibatalkan' : 'Aktif',
                'voided_at' => $tx->voided_at ? Carbon::parse($tx->voided_at)->format('Y-m-d H:i') : '-',
                'void_reason' => $tx->void_reason ?? '-',
            ];
        })->toArray();

        return [
            'tab' => 'inbound',
            'title' => 'Laporan Barang Masuk',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_rows' => count($rows),
            'rows' => $rows,
        ];
    }

    private function buildInboundSheet($sheet, PracticeWorkspace $workspace, User $user, array $filters): void
    {
        $sheet->setTitle('Barang Masuk');
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();
        $this->writeHeaderInfo($sheet, 'LAPORAN BARANG MASUK', $user, "Periode: {$startDate} s/d {$endDate}");

        $headers = [
            'No. Transaksi', 'Tanggal', 'No. Dokumen', 'Kode Barang', 'Nama Barang', 'Kategori', 'Satuan',
            'Jumlah', 'Kondisi', 'Supplier', 'Lokasi', 'Harga Pokok (Rp)', 'Total Nilai (Rp)',
            'Keterangan', 'Status', 'Waktu Pembatalan', 'Alasan Pembatalan',
        ];
        $this->writeTableHeaders($sheet, 5, $headers);

        $data = $this->getInboundData($workspace, $filters)['rows'];
        $rowIdx = 6;

        foreach ($data as $item) {
            $sheet->setCellValueExplicit("A{$rowIdx}", $this->sanitizeForExcel($item['transaction_number']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("B{$rowIdx}", $item['transaction_date'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("C{$rowIdx}", $this->sanitizeForExcel($item['external_doc']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("D{$rowIdx}", $this->sanitizeForExcel($item['product_code']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("E{$rowIdx}", $this->sanitizeForExcel($item['product_name']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("F{$rowIdx}", $this->sanitizeForExcel($item['category']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("G{$rowIdx}", $this->sanitizeForExcel($item['base_unit']), DataType::TYPE_STRING);
            $sheet->setCellValue("H{$rowIdx}", $item['quantity']);
            $sheet->setCellValueExplicit("I{$rowIdx}", $item['condition'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("J{$rowIdx}", $this->sanitizeForExcel($item['supplier']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("K{$rowIdx}", $this->sanitizeForExcel($item['location']), DataType::TYPE_STRING);
            $sheet->setCellValue("L{$rowIdx}", $item['unit_price']);
            $sheet->setCellValue("M{$rowIdx}", $item['total_amount']);
            $sheet->setCellValueExplicit("N{$rowIdx}", $this->sanitizeForExcel($item['notes']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("O{$rowIdx}", $item['status'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("P{$rowIdx}", $item['voided_at'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("Q{$rowIdx}", $this->sanitizeForExcel($item['void_reason']), DataType::TYPE_STRING);
            $rowIdx++;
        }

        $this->formatTable($sheet, 5, $rowIdx - 1, 'Q');
    }

    /* -------------------------------------------------------------------------- */
    /* 3. BARANG KELUAR */
    /* -------------------------------------------------------------------------- */

    public function getOutboundData(PracticeWorkspace $workspace, array $filters): array
    {
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        $query = StockTransaction::where('workspace_id', $workspace->id)
            ->where('type', TransactionType::Outbound->value)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->when($filters['product_id'] ?? null, fn ($q, $pid) => $q->where('product_id', $pid))
            ->when($filters['reason'] ?? null, fn ($q, $r) => $q->where('reason', $r))
            ->when($filters['stock_condition'] ?? null, fn ($q, $sc) => $q->where('stock_condition', $sc))
            ->when(($filters['status'] ?? null) === 'active', fn ($q) => $q->whereNull('voided_at'))
            ->when(($filters['status'] ?? null) === 'voided', fn ($q) => $q->whereNotNull('voided_at'))
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc');

        $reasonLabels = ['sale' => 'Penjualan', 'usage' => 'Pemakaian', 'return' => 'Retur'];

        $rows = $query->get()->map(function ($tx) use ($reasonLabels) {
            return [
                'transaction_number' => $tx->transaction_number,
                'transaction_date' => $tx->transaction_date->toDateString(),
                'external_doc' => $tx->external_document_number ?? '-',
                'product_code' => $tx->product_snapshot['code'] ?? '-',
                'product_name' => $tx->product_snapshot['name'] ?? '-',
                'category' => $tx->product_snapshot['category'] ?? '-',
                'base_unit' => $tx->product_snapshot['base_unit'] ?? '-',
                'quantity' => $tx->quantity,
                'condition' => $tx->stock_condition === 'good' ? 'Baik' : 'Rusak',
                'recipient' => $tx->recipient ?? '-',
                'reason' => $reasonLabels[$tx->reason] ?? $tx->reason,
                'unit_price' => (float) $tx->unit_price,
                'total_amount' => (float) $tx->total_amount,
                'notes' => $tx->notes ?? '-',
                'status' => $tx->voided_at ? 'Dibatalkan' : 'Aktif',
                'voided_at' => $tx->voided_at ? Carbon::parse($tx->voided_at)->format('Y-m-d H:i') : '-',
                'void_reason' => $tx->void_reason ?? '-',
            ];
        })->toArray();

        return [
            'tab' => 'outbound',
            'title' => 'Laporan Barang Keluar',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_rows' => count($rows),
            'rows' => $rows,
        ];
    }

    private function buildOutboundSheet($sheet, PracticeWorkspace $workspace, User $user, array $filters): void
    {
        $sheet->setTitle('Barang Keluar');
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();
        $this->writeHeaderInfo($sheet, 'LAPORAN BARANG KELUAR', $user, "Periode: {$startDate} s/d {$endDate}");

        $headers = [
            'No. Transaksi', 'Tanggal', 'No. Dokumen', 'Kode Barang', 'Nama Barang', 'Kategori', 'Satuan',
            'Jumlah', 'Kondisi', 'Tujuan / Penerima', 'Alasan', 'Harga Jual (Rp)', 'Total Nilai (Rp)',
            'Keterangan', 'Status', 'Waktu Pembatalan', 'Alasan Pembatalan',
        ];
        $this->writeTableHeaders($sheet, 5, $headers);

        $data = $this->getOutboundData($workspace, $filters)['rows'];
        $rowIdx = 6;

        foreach ($data as $item) {
            $sheet->setCellValueExplicit("A{$rowIdx}", $this->sanitizeForExcel($item['transaction_number']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("B{$rowIdx}", $item['transaction_date'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("C{$rowIdx}", $this->sanitizeForExcel($item['external_doc']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("D{$rowIdx}", $this->sanitizeForExcel($item['product_code']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("E{$rowIdx}", $this->sanitizeForExcel($item['product_name']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("F{$rowIdx}", $this->sanitizeForExcel($item['category']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("G{$rowIdx}", $this->sanitizeForExcel($item['base_unit']), DataType::TYPE_STRING);
            $sheet->setCellValue("H{$rowIdx}", $item['quantity']);
            $sheet->setCellValueExplicit("I{$rowIdx}", $item['condition'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("J{$rowIdx}", $this->sanitizeForExcel($item['recipient']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("K{$rowIdx}", $item['reason'], DataType::TYPE_STRING);
            $sheet->setCellValue("L{$rowIdx}", $item['unit_price']);
            $sheet->setCellValue("M{$rowIdx}", $item['total_amount']);
            $sheet->setCellValueExplicit("N{$rowIdx}", $this->sanitizeForExcel($item['notes']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("O{$rowIdx}", $item['status'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("P{$rowIdx}", $item['voided_at'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("Q{$rowIdx}", $this->sanitizeForExcel($item['void_reason']), DataType::TYPE_STRING);
            $rowIdx++;
        }

        $this->formatTable($sheet, 5, $rowIdx - 1, 'Q');
    }

    /* -------------------------------------------------------------------------- */
    /* 4. MUTASI STOK / LEDGER */
    /* -------------------------------------------------------------------------- */

    public function getStockData(PracticeWorkspace $workspace, array $filters): array
    {
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        $products = Product::where('workspace_id', $workspace->id)
            ->when($filters['category'] ?? null, fn ($q, $c) => $q->where('category', $c))
            ->orderBy('code', 'asc')
            ->get();

        $rows = [];

        foreach ($products as $p) {
            // 1. Balance prior to start_date
            $beforeGood = (int) InventoryMovement::where('product_id', $p->id)
                ->where('stock_condition', 'good')
                ->where('effective_date', '<', $startDate)
                ->sum('quantity_delta');

            $beforeDamaged = (int) InventoryMovement::where('product_id', $p->id)
                ->where('stock_condition', 'damaged')
                ->where('effective_date', '<', $startDate)
                ->sum('quantity_delta');

            // 2. Initial stock of products created within the period
            $initialGood = (int) InventoryMovement::where('product_id', $p->id)
                ->where('stock_condition', 'good')
                ->where('reference_type', 'opening')
                ->whereBetween('effective_date', [$startDate, $endDate])
                ->sum('quantity_delta');

            // 3. Inbound during period
            $inboundGood = (int) InventoryMovement::where('product_id', $p->id)
                ->where('stock_condition', 'good')
                ->where('reference_type', 'inbound')
                ->whereBetween('effective_date', [$startDate, $endDate])
                ->sum('quantity_delta');

            $inboundDamaged = (int) InventoryMovement::where('product_id', $p->id)
                ->where('stock_condition', 'damaged')
                ->where('reference_type', 'inbound')
                ->whereBetween('effective_date', [$startDate, $endDate])
                ->sum('quantity_delta');

            // 4. Outbound during period
            $outboundGood = (int) abs(InventoryMovement::where('product_id', $p->id)
                ->where('stock_condition', 'good')
                ->where('reference_type', 'outbound')
                ->whereBetween('effective_date', [$startDate, $endDate])
                ->sum('quantity_delta'));

            $outboundDamaged = (int) abs(InventoryMovement::where('product_id', $p->id)
                ->where('stock_condition', 'damaged')
                ->where('reference_type', 'outbound')
                ->whereBetween('effective_date', [$startDate, $endDate])
                ->sum('quantity_delta'));

            // 5. Reversals (void)
            $reversalGood = (int) InventoryMovement::where('product_id', $p->id)
                ->where('stock_condition', 'good')
                ->where('reference_type', 'reversal')
                ->whereBetween('effective_date', [$startDate, $endDate])
                ->sum('quantity_delta');

            $reversalDamaged = (int) InventoryMovement::where('product_id', $p->id)
                ->where('stock_condition', 'damaged')
                ->where('reference_type', 'reversal')
                ->whereBetween('effective_date', [$startDate, $endDate])
                ->sum('quantity_delta');

            // 6. Ending balance calculated from ledger formula
            $endGood = $beforeGood + $initialGood + $inboundGood - $outboundGood + $reversalGood;
            $endDamaged = $beforeDamaged + $inboundDamaged - $outboundDamaged + $reversalDamaged;

            $rows[] = [
                'code' => $p->code,
                'name' => $p->name,
                'base_unit' => $p->base_unit,
                'before_good' => $beforeGood,
                'before_damaged' => $beforeDamaged,
                'initial_good' => $initialGood,
                'inbound_good' => $inboundGood,
                'inbound_damaged' => $inboundDamaged,
                'outbound_good' => $outboundGood,
                'outbound_damaged' => $outboundDamaged,
                'reversal_good' => $reversalGood,
                'reversal_damaged' => $reversalDamaged,
                'end_good' => $endGood,
                'end_damaged' => $endDamaged,
                'end_physical' => $endGood + $endDamaged,
            ];
        }

        return [
            'tab' => 'stock',
            'title' => 'Laporan Rekonsiliasi & Mutasi Stok',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_rows' => count($rows),
            'rows' => $rows,
        ];
    }

    private function buildStockSheet($sheet, PracticeWorkspace $workspace, User $user, array $filters): void
    {
        $sheet->setTitle('Mutasi Stok');
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();
        $this->writeHeaderInfo($sheet, 'LAPORAN REKONSILIASI & MUTASI STOK', $user, "Periode Ledger: {$startDate} s/d {$endDate}");

        $headers = [
            'Kode Barang', 'Nama Barang', 'Satuan',
            'Saldo Awal Baik', 'Saldo Awal Rusak',
            'Saldo Awal Produk Baru',
            'Masuk Baik', 'Masuk Rusak',
            'Keluar Baik', 'Keluar Rusak',
            'Koreksi Baik', 'Koreksi Rusak',
            'Saldo Akhir Baik', 'Saldo Akhir Rusak', 'Total Stok Fisik',
        ];
        $this->writeTableHeaders($sheet, 5, $headers);

        $data = $this->getStockData($workspace, $filters)['rows'];
        $rowIdx = 6;

        foreach ($data as $item) {
            $sheet->setCellValueExplicit("A{$rowIdx}", $this->sanitizeForExcel($item['code']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("B{$rowIdx}", $this->sanitizeForExcel($item['name']), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit("C{$rowIdx}", $this->sanitizeForExcel($item['base_unit']), DataType::TYPE_STRING);
            $sheet->setCellValue("D{$rowIdx}", $item['before_good']);
            $sheet->setCellValue("E{$rowIdx}", $item['before_damaged']);
            $sheet->setCellValue("F{$rowIdx}", $item['initial_good']);
            $sheet->setCellValue("G{$rowIdx}", $item['inbound_good']);
            $sheet->setCellValue("H{$rowIdx}", $item['inbound_damaged']);
            $sheet->setCellValue("I{$rowIdx}", $item['outbound_good']);
            $sheet->setCellValue("J{$rowIdx}", $item['outbound_damaged']);
            $sheet->setCellValue("K{$rowIdx}", $item['reversal_good']);
            $sheet->setCellValue("L{$rowIdx}", $item['reversal_damaged']);
            $sheet->setCellValue("M{$rowIdx}", $item['end_good']);
            $sheet->setCellValue("N{$rowIdx}", $item['end_damaged']);
            $sheet->setCellValue("O{$rowIdx}", $item['end_physical']);
            $rowIdx++;
        }

        $this->formatTable($sheet, 5, $rowIdx - 1, 'O');
    }

    /* -------------------------------------------------------------------------- */
    /* 5. PENGIRIMAN & TRANSPORTASI */
    /* -------------------------------------------------------------------------- */

    public function getShipmentsData(PracticeWorkspace $workspace, array $filters): array
    {
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        $query = Shipment::where('workspace_id', $workspace->id)
            ->whereBetween('shipping_date', [$startDate, $endDate])
            ->when($filters['shipment_type'] ?? null, fn ($q, $t) => $q->where('shipment_type', $t))
            ->when($filters['transport_mode'] ?? null, fn ($q, $m) => $q->where('transport_mode', $m))
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->with(['items', 'documents'])
            ->orderBy('shipping_date', 'desc')
            ->orderBy('id', 'desc');

        $rows = $query->get()->map(function ($s) {
            return [
                'shipment_number' => $s->shipment_number,
                'shipment_type' => strtoupper($s->shipment_type),
                'origin' => $s->origin,
                'destination' => $s->destination,
                'origin_country' => $s->origin_country,
                'destination_country' => $s->destination_country,
                'transport_mode' => strtoupper($s->transport_mode),
                'fleet_type' => $s->fleet_type,
                'carrier_service' => $s->carrier_service ?? '-',
                'tracking_number' => $s->tracking_number ?? '-',
                'cargo_type' => strtoupper($s->cargo_type),
                'total_weight_kg' => (float) $s->total_weight_kg,
                'packaging_type' => strtoupper($s->packaging_type),
                'shipping_date' => $s->shipping_date->toDateString(),
                'estimated_arrival' => $s->estimated_arrival_date->toDateString(),
                'received_date' => $s->received_date ? $s->received_date->toDateString() : '-',
                'status' => strtoupper($s->status),
                'estimated_cost' => (float) $s->estimated_cost,
                'incoterms' => $s->incoterms ?? '-',
                'tariffs_and_taxes' => (float) $s->tariffs_and_taxes,
                'items_count' => $s->items->count(),
                'documents_count' => $s->documents->count(),
            ];
        })->toArray();

        return [
            'tab' => 'shipments',
            'title' => 'Laporan Pengiriman & Transportasi',
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_rows' => count($rows),
            'rows' => $rows,
        ];
    }

    private function buildShipmentsWorkbook(Spreadsheet $spreadsheet, PracticeWorkspace $workspace, User $user, array $filters): void
    {
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? now()->toDateString();

        // 1. Sheet 1: Pengiriman
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Pengiriman');
        $this->writeHeaderInfo($sheet1, 'LAPORAN PENGIRIMAN & TRANSPORTASI', $user, "Periode: {$startDate} s/d {$endDate}");

        $headers1 = [
            'No. Pengiriman', 'Jenis', 'Asal', 'Tujuan', 'Negara Asal', 'Negara Tujuan',
            'Moda', 'Armada', 'Pengangkut', 'No. Resi', 'Muatan', 'Berat (kg)', 'Kemasan',
            'Tgl Kirim', 'Est. Tiba', 'Tgl Terima', 'Status', 'Biaya (Rp)', 'Incoterms', 'Pajak (Rp)',
        ];
        $this->writeTableHeaders($sheet1, 5, $headers1);

        $shipments = Shipment::where('workspace_id', $workspace->id)
            ->whereBetween('shipping_date', [$startDate, $endDate])
            ->when($filters['shipment_type'] ?? null, fn ($q, $t) => $q->where('shipment_type', $t))
            ->when($filters['transport_mode'] ?? null, fn ($q, $m) => $q->where('transport_mode', $m))
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->with(['items.stockTransaction', 'documents'])
            ->orderBy('shipping_date', 'desc')
            ->get();

        $rowIdx1 = 6;
        foreach ($shipments as $s) {
            $sheet1->setCellValueExplicit("A{$rowIdx1}", $this->sanitizeForExcel($s->shipment_number), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("B{$rowIdx1}", strtoupper($s->shipment_type), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("C{$rowIdx1}", $this->sanitizeForExcel($s->origin), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("D{$rowIdx1}", $this->sanitizeForExcel($s->destination), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("E{$rowIdx1}", $this->sanitizeForExcel($s->origin_country), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("F{$rowIdx1}", $this->sanitizeForExcel($s->destination_country), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("G{$rowIdx1}", strtoupper($s->transport_mode), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("H{$rowIdx1}", $this->sanitizeForExcel($s->fleet_type), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("I{$rowIdx1}", $this->sanitizeForExcel($s->carrier_service ?? '-'), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("J{$rowIdx1}", $this->sanitizeForExcel($s->tracking_number ?? '-'), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("K{$rowIdx1}", strtoupper($s->cargo_type), DataType::TYPE_STRING);
            $sheet1->setCellValue("L{$rowIdx1}", (float) $s->total_weight_kg);
            $sheet1->setCellValueExplicit("M{$rowIdx1}", strtoupper($s->packaging_type), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("N{$rowIdx1}", $s->shipping_date->toDateString(), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("O{$rowIdx1}", $s->estimated_arrival_date->toDateString(), DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("P{$rowIdx1}", $s->received_date ? $s->received_date->toDateString() : '-', DataType::TYPE_STRING);
            $sheet1->setCellValueExplicit("Q{$rowIdx1}", strtoupper($s->status), DataType::TYPE_STRING);
            $sheet1->setCellValue("R{$rowIdx1}", (float) $s->estimated_cost);
            $sheet1->setCellValueExplicit("S{$rowIdx1}", $s->incoterms ?? '-', DataType::TYPE_STRING);
            $sheet1->setCellValue("T{$rowIdx1}", (float) $s->tariffs_and_taxes);
            $rowIdx1++;
        }
        $this->formatTable($sheet1, 5, $rowIdx1 - 1, 'T');

        // 2. Sheet 2: Detail Barang
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Detail Barang');
        $this->writeHeaderInfo($sheet2, 'RINCIAN BARANG PENGIRIMAN', $user, "Periode: {$startDate} s/d {$endDate}");

        $headers2 = ['No. Pengiriman', 'Referensi Keluar', 'Kode Barang', 'Nama Barang', 'Satuan', 'Kondisi', 'Jumlah'];
        $this->writeTableHeaders($sheet2, 5, $headers2);

        $rowIdx2 = 6;
        foreach ($shipments as $s) {
            foreach ($s->items as $it) {
                $ref = $it->stockTransaction ? $it->stockTransaction->transaction_number : '-';
                $sheet2->setCellValueExplicit("A{$rowIdx2}", $this->sanitizeForExcel($s->shipment_number), DataType::TYPE_STRING);
                $sheet2->setCellValueExplicit("B{$rowIdx2}", $this->sanitizeForExcel($ref), DataType::TYPE_STRING);
                $sheet2->setCellValueExplicit("C{$rowIdx2}", $this->sanitizeForExcel($it->product_code_snapshot), DataType::TYPE_STRING);
                $sheet2->setCellValueExplicit("D{$rowIdx2}", $this->sanitizeForExcel($it->product_name_snapshot), DataType::TYPE_STRING);
                $sheet2->setCellValueExplicit("E{$rowIdx2}", $this->sanitizeForExcel($it->base_unit_snapshot), DataType::TYPE_STRING);
                $sheet2->setCellValueExplicit("F{$rowIdx2}", $it->stock_condition === 'good' ? 'Baik' : 'Rusak', DataType::TYPE_STRING);
                $sheet2->setCellValue("G{$rowIdx2}", $it->quantity);
                $rowIdx2++;
            }
        }
        $this->formatTable($sheet2, 5, $rowIdx2 - 1, 'G');

        // 3. Sheet 3: Dokumen
        $sheet3 = $spreadsheet->createSheet();
        $sheet3->setTitle('Dokumen');
        $this->writeHeaderInfo($sheet3, 'RINCIAN DOKUMEN PENGIRIMAN', $user, "Periode: {$startDate} s/d {$endDate}");

        $headers3 = ['No. Pengiriman', 'Jenis Dokumen', 'Nomor Dokumen', 'Tanggal Dokumen', 'Ada Lampiran Berkas'];
        $this->writeTableHeaders($sheet3, 5, $headers3);

        $rowIdx3 = 6;
        foreach ($shipments as $s) {
            foreach ($s->documents as $doc) {
                $sheet3->setCellValueExplicit("A{$rowIdx3}", $this->sanitizeForExcel($s->shipment_number), DataType::TYPE_STRING);
                $sheet3->setCellValueExplicit("B{$rowIdx3}", strtoupper(str_replace('_', ' ', $doc->document_type)), DataType::TYPE_STRING);
                $sheet3->setCellValueExplicit("C{$rowIdx3}", $this->sanitizeForExcel($doc->document_number), DataType::TYPE_STRING);
                $sheet3->setCellValueExplicit("D{$rowIdx3}", $doc->document_date ? $doc->document_date->toDateString() : '-', DataType::TYPE_STRING);
                $sheet3->setCellValueExplicit("E{$rowIdx3}", $doc->attachment_path ? 'Ya' : 'Tidak', DataType::TYPE_STRING);
                $rowIdx3++;
            }
        }
        $this->formatTable($sheet3, 5, $rowIdx3 - 1, 'E');

        // Return to first sheet
        $spreadsheet->setActiveSheetIndex(0);
    }

    /* -------------------------------------------------------------------------- */
    /* HELPER METHODS FOR EXCEL FORMATTING */
    /* -------------------------------------------------------------------------- */

    private function writeHeaderInfo($sheet, string $title, User $user, string $filterSummary): void
    {
        $sheet->setCellValue('A1', 'LOGISTIK LAB - '.$title);
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        $sheet->setCellValue('A2', 'Nama Siswa: '.$user->name.' ('.$user->email.')');
        $sheet->setCellValue('A3', 'Waktu Unduh: '.now()->format('d/m/Y H:i:s').' WIB | '.$filterSummary);
        $sheet->getStyle('A2:A3')->getFont()->setSize(10)->getColor()->setRGB('555555');
    }

    private function writeTableHeaders($sheet, int $row, array $headers): void
    {
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue("{$col}{$row}", $header);
            $col++;
        }

        $lastCol = chr(ord('A') + count($headers) - 1);
        $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1E293B'], // Slate 800
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(24);
    }

    private function formatTable($sheet, int $headerRow, int $lastRow, string $lastCol): void
    {
        if ($lastRow < $headerRow + 1) {
            $sheet->setCellValue('A'.($headerRow + 1), 'Tidak ada data untuk filter ini.');
            $sheet->mergeCells('A'.($headerRow + 1).":{$lastCol}".($headerRow + 1));
            $sheet->getStyle('A'.($headerRow + 1))->getFont()->setItalic(true);
            $lastRow = $headerRow + 1;
        }

        // Freeze panes
        $sheet->freezePane('A'.($headerRow + 1));

        // Auto filter
        $sheet->setAutoFilter("A{$headerRow}:{$lastCol}{$headerRow}");

        // Border styling
        $sheet->getStyle("A{$headerRow}:{$lastCol}{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'CBD5E1'],
                ],
            ],
        ]);

        // Auto-fit column widths
        foreach (range('A', $lastCol) as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    /**
     * Prevent CSV/Excel injection per PRD Rule 8:
     * If text starts with =, +, -, or @, prepend a single quote or space.
     */
    private function sanitizeForExcel(?string $text): string
    {
        if ($text === null || $text === '') {
            return '';
        }

        $firstChar = substr($text, 0, 1);
        if (in_array($firstChar, ['=', '+', '-', '@'], true)) {
            return "'".$text;
        }

        return $text;
    }
}
