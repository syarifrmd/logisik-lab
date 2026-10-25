<?php

namespace Database\Seeders;

use App\Models\PracticeWorkspace;
use App\Models\Product;
use App\Services\StockService;
use Illuminate\Database\Seeder;
use RuntimeException;

class PracticeProductSeeder extends Seeder
{
    /**
     * Seed 20 sample products into the first practice workspace.
     */
    public function run(): void
    {
        $workspace = PracticeWorkspace::query()->first();

        if ($workspace === null) {
            throw new RuntimeException('Belum ada workspace praktik. Buat atau login sebagai user praktik terlebih dahulu.');
        }

        $products = [
            ['code' => 'DEMO001', 'name' => 'Pulpen Gel Hitam', 'category' => 'ATK', 'specification' => 'Mata 0.5 mm', 'base_unit' => 'pcs', 'cost_price' => 3500, 'selling_price' => 5000, 'stock_good' => 40],
            ['code' => 'DEMO002', 'name' => 'Buku Tulis A5', 'category' => 'ATK', 'specification' => '80 lembar', 'base_unit' => 'pcs', 'cost_price' => 7000, 'selling_price' => 10000, 'stock_good' => 35],
            ['code' => 'DEMO003', 'name' => 'Pensil 2B', 'category' => 'ATK', 'specification' => 'Kayu, ujung runcing', 'base_unit' => 'pcs', 'cost_price' => 2000, 'selling_price' => 3000, 'stock_good' => 50],
            ['code' => 'DEMO004', 'name' => 'Penghapus Putih', 'category' => 'ATK', 'specification' => 'Ukuran sedang', 'base_unit' => 'pcs', 'cost_price' => 1500, 'selling_price' => 2500, 'stock_good' => 45],
            ['code' => 'DEMO005', 'name' => 'Spidol Permanen', 'category' => 'ATK', 'specification' => 'Warna hitam', 'base_unit' => 'pcs', 'cost_price' => 5000, 'selling_price' => 7500, 'stock_good' => 25],
            ['code' => 'DEMO006', 'name' => 'Kertas HVS A4', 'category' => 'ATK', 'specification' => '80 gsm, 500 lembar', 'base_unit' => 'rim', 'cost_price' => 48000, 'selling_price' => 60000, 'stock_good' => 12],
            ['code' => 'DEMO007', 'name' => 'Map Plastik', 'category' => 'ATK', 'specification' => 'Ukuran folio', 'base_unit' => 'pcs', 'cost_price' => 2500, 'selling_price' => 4000, 'stock_good' => 30],
            ['code' => 'DEMO008', 'name' => 'Stapler Kecil', 'category' => 'ATK', 'specification' => 'Kapasitas 20 lembar', 'base_unit' => 'pcs', 'cost_price' => 18000, 'selling_price' => 25000, 'stock_good' => 10],
            ['code' => 'DEMO009', 'name' => 'Keyboard USB', 'category' => 'Elektronik', 'specification' => 'Layout QWERTY', 'base_unit' => 'unit', 'cost_price' => 85000, 'selling_price' => 120000, 'stock_good' => 8],
            ['code' => 'DEMO010', 'name' => 'Mouse Wireless', 'category' => 'Elektronik', 'specification' => 'Koneksi 2.4 GHz', 'base_unit' => 'unit', 'cost_price' => 65000, 'selling_price' => 95000, 'stock_good' => 10],
            ['code' => 'DEMO011', 'name' => 'Kabel HDMI', 'category' => 'Elektronik', 'specification' => 'Panjang 2 meter', 'base_unit' => 'pcs', 'cost_price' => 45000, 'selling_price' => 70000, 'stock_good' => 15],
            ['code' => 'DEMO012', 'name' => 'Flashdisk 32GB', 'category' => 'Elektronik', 'specification' => 'USB 3.0', 'base_unit' => 'pcs', 'cost_price' => 65000, 'selling_price' => 90000, 'stock_good' => 7],
            ['code' => 'DEMO013', 'name' => 'Headset Kabel', 'category' => 'Elektronik', 'specification' => 'Dengan mikrofon', 'base_unit' => 'unit', 'cost_price' => 55000, 'selling_price' => 80000, 'stock_good' => 9],
            ['code' => 'DEMO014', 'name' => 'Kabel Extension', 'category' => 'Elektronik', 'specification' => '4 lubang, 3 meter', 'base_unit' => 'pcs', 'cost_price' => 75000, 'selling_price' => 105000, 'stock_good' => 6],
            ['code' => 'DEMO015', 'name' => 'Kursi Lipat', 'category' => 'Furnitur', 'specification' => 'Bahan besi dan plastik', 'base_unit' => 'unit', 'cost_price' => 180000, 'selling_price' => 250000, 'stock_good' => 8],
            ['code' => 'DEMO016', 'name' => 'Meja Belajar', 'category' => 'Furnitur', 'specification' => 'Ukuran 100 x 50 cm', 'base_unit' => 'unit', 'cost_price' => 450000, 'selling_price' => 600000, 'stock_good' => 4],
            ['code' => 'DEMO017', 'name' => 'Rak Buku Besi', 'category' => 'Furnitur', 'specification' => '4 tingkat', 'base_unit' => 'unit', 'cost_price' => 650000, 'selling_price' => 850000, 'stock_good' => 3],
            ['code' => 'DEMO018', 'name' => 'Lemari Arsip', 'category' => 'Furnitur', 'specification' => '2 pintu', 'base_unit' => 'unit', 'cost_price' => 1200000, 'selling_price' => 1500000, 'stock_good' => 2],
            ['code' => 'DEMO019', 'name' => 'Lampu Meja LED', 'category' => 'Elektronik', 'specification' => 'Daya 10 watt', 'base_unit' => 'unit', 'cost_price' => 90000, 'selling_price' => 130000, 'stock_good' => 6],
            ['code' => 'DEMO020', 'name' => 'Papan Tulis Mini', 'category' => 'Furnitur', 'specification' => 'Ukuran 60 x 40 cm', 'base_unit' => 'unit', 'cost_price' => 95000, 'selling_price' => 140000, 'stock_good' => 5],
        ];

        $stockService = app(StockService::class);
        $created = 0;

        foreach ($products as $productData) {
            if (Product::where('workspace_id', $workspace->id)->where('code', $productData['code'])->exists()) {
                continue;
            }

            $productData['stock_date'] = now()->toDateString();
            $stockService->createProductWithOpeningBalance($workspace, $productData);
            $created++;
        }

        $this->command?->info("Berhasil menambahkan {$created} barang demo ke workspace #{$workspace->id}.");
    }
}
