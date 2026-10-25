<?php

use App\Http\Controllers\Practice\BarcodeController;
use App\Http\Controllers\Practice\CatalogController;
use App\Http\Controllers\Practice\HomeController;
use App\Http\Controllers\Practice\InboundController;
use App\Http\Controllers\Practice\OutboundController;
use App\Http\Controllers\Practice\ProductController;
use App\Http\Controllers\Practice\ReportController;
use App\Http\Controllers\Practice\ShipmentController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Legacy dashboard redirects to practice home
Route::redirect('/dashboard', '/praktik')->middleware('auth');

Route::middleware(['auth', 'workspace'])->prefix('praktik')->name('practice.')->group(function () {
    // Beranda
    Route::get('/', [HomeController::class, 'index'])->name('home');

    // Data Barang
    Route::get('barang/{product}/foto', [ProductController::class, 'photo'])->name('products.photo');
    Route::resource('barang', ProductController::class)
        ->parameters(['barang' => 'product'])
        ->names('products');
    Route::post('barang/{product}/archive', [ProductController::class, 'archive'])->name('products.archive');
    Route::post('barang/{product}/reactivate', [ProductController::class, 'reactivate'])->name('products.reactivate');

    // Barang Masuk
    Route::resource('barang-masuk', InboundController::class)
        ->only(['index', 'create', 'store', 'show'])
        ->parameters(['barang-masuk' => 'transaction'])
        ->names('inbound');
    Route::post('barang-masuk/{transaction}/void', [InboundController::class, 'void'])->name('inbound.void');

    // Barang Keluar
    Route::resource('barang-keluar', OutboundController::class)
        ->only(['index', 'create', 'store', 'show'])
        ->parameters(['barang-keluar' => 'transaction'])
        ->names('outbound');
    Route::post('barang-keluar/{transaction}/void', [OutboundController::class, 'void'])->name('outbound.void');

    // Katalog Barang (FR-08)
    Route::get('katalog', [CatalogController::class, 'index'])->name('catalog.index');
    Route::get('katalog/brosur', [CatalogController::class, 'brochure'])->name('catalog.brochure');

    // Barcode & Pemindai Mobile (FR-09)
    Route::get('barcode', [BarcodeController::class, 'index'])->name('barcode.index');
    Route::get('barcode/lookup', [BarcodeController::class, 'lookup'])->name('barcode.lookup');
    Route::get('barcode/{product}/download', [BarcodeController::class, 'download'])->name('barcode.download');
    Route::get('barcode/{product}/cetak', [BarcodeController::class, 'print'])->name('barcode.print');

    // Transportasi & Pengiriman (FR-07)
    Route::resource('transportasi', ShipmentController::class)
        ->only(['index', 'create', 'store', 'show'])
        ->parameters(['transportasi' => 'shipment'])
        ->names('shipments');
    Route::post('transportasi/{shipment}/status', [ShipmentController::class, 'updateStatus'])->name('shipments.status');
    Route::post('transportasi/{shipment}/batal', [ShipmentController::class, 'cancel'])->name('shipments.cancel');
    Route::post('transportasi/{shipment}/dokumen', [ShipmentController::class, 'storeDocument'])->name('shipments.document');

    // Laporan & Ekspor Excel (FR-10)
    Route::get('laporan', [ReportController::class, 'index'])->name('reports.index');
    Route::get('laporan/export', [ReportController::class, 'export'])->name('reports.export');

    // Profil Siswa
    Route::redirect('profil', '/settings/profile')->name('profile');
});

require __DIR__.'/settings.php';
