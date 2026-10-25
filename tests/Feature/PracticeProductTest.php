<?php

use App\Enums\StockCondition;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\User;
use App\Services\WorkspaceService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

test('authenticated user can view product show page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG999',
        'name' => 'Buku Tulis Test',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 5000,
        'selling_price' => 7000,
        'stock_good' => 10,
        'stock_damaged' => 0,
    ]);

    $response = $this->get(route('practice.products.show', $product));
    $response->assertOk();
});

test('user can list products with filters', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG001',
        'name' => 'Pulpen Gel',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 2000,
        'selling_price' => 3500,
        'stock_good' => 5,
        'stock_damaged' => 0,
    ]);

    $response = $this->get(route('practice.products.index', ['search' => 'Pulpen']));
    $response->assertOk();
});

test('user can create a product with opening balance', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('practice.products.store'), [
        'code' => 'BRG002',
        'name' => 'Kertas A4',
        'category' => 'ATK',
        'base_unit' => 'rim',
        'cost_price' => 45000,
        'selling_price' => 55000,
        'stock_good' => 10,
        'stock_date' => now()->toDateString(),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('products', [
        'code' => 'BRG002',
        'name' => 'Kertas A4',
        'stock_good' => 10,
    ]);
});

test('user can create a product with a photo', function () {
    Storage::fake('private');

    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('practice.products.store'), [
        'code' => 'BRG008',
        'name' => 'Foto Barang',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 5000,
        'selling_price' => 7500,
        'stock_good' => 0,
        'photo' => UploadedFile::fake()->image('barang.png'),
    ]);

    $response->assertRedirect();

    $product = Product::where('code', 'BRG008')->firstOrFail();

    expect($product->photo_path)->not->toBeNull();
    Storage::disk('private')->assertExists($product->photo_path);
});

test('user can archive and reactivate a product', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG003',
        'name' => 'Penghapus',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 1000,
        'selling_price' => 2000,
        'stock_good' => 0,
        'stock_damaged' => 0,
    ]);

    $archiveResponse = $this->post(route('practice.products.archive', $product));
    $archiveResponse->assertRedirect();
    $this->assertNotNull($product->fresh()->archived_at);

    $reactivateResponse = $this->post(route('practice.products.reactivate', $product));
    $reactivateResponse->assertRedirect();
    $this->assertNull($product->fresh()->archived_at);
});

test('user can delete a product without transactions', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);
    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG010',
        'name' => 'Produk Hapus',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 1000,
        'selling_price' => 1500,
        'stock_good' => 0,
        'stock_damaged' => 0,
    ]);

    $response = $this->delete(route('practice.products.destroy', $product));

    $response->assertRedirect(route('practice.products.index'));
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

test('product with transactions cannot be deleted', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('practice.products.store'), [
        'code' => 'BRG011',
        'name' => 'Produk Bertransaksi',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 1000,
        'selling_price' => 1500,
        'stock_good' => 1,
        'stock_date' => now()->toDateString(),
    ]);

    $product = Product::where('code', 'BRG011')->firstOrFail();
    $deleteResponse = $this->delete(route('practice.products.destroy', $product));

    $deleteResponse->assertRedirect();
    $deleteResponse->assertSessionHasErrors('delete');
    $this->assertDatabaseHas('products', ['id' => $product->id]);
});

test('product with remaining stock cannot be deleted', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);
    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG012',
        'name' => 'Produk Masih Stok',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 1000,
        'selling_price' => 1500,
        'stock_good' => 2,
        'stock_damaged' => 1,
    ]);

    $response = $this->delete(route('practice.products.destroy', $product));

    $response->assertRedirect();
    $response->assertSessionHasErrors('delete');
    $this->assertDatabaseHas('products', ['id' => $product->id]);
});

test('user can create inbound transaction and increase stock', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG004',
        'name' => 'Spidol Papan',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 8000,
        'selling_price' => 10000,
        'stock_good' => 5,
        'stock_damaged' => 0,
    ]);

    $response = $this->post(route('practice.inbound.store'), [
        'idempotency_key' => (string) Str::uuid(),
        'product_id' => $product->id,
        'transaction_date' => now()->toDateString(),
        'external_document_number' => 'SJ-001',
        'supplier' => 'PT Sumber ATK',
        'storage_location' => 'Rak A-1',
        'quantity' => 15,
        'stock_condition' => StockCondition::Good->value,
        'unit_price' => 8000,
    ]);

    $response->assertRedirect();
    $this->assertEquals(20, $product->fresh()->stock_good);
});

test('user can create outbound transaction and decrease stock', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG005',
        'name' => 'Gunting',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 12000,
        'selling_price' => 15000,
        'stock_good' => 10,
        'stock_damaged' => 0,
    ]);

    $response = $this->post(route('practice.outbound.store'), [
        'idempotency_key' => (string) Str::uuid(),
        'product_id' => $product->id,
        'transaction_date' => now()->toDateString(),
        'external_document_number' => 'DO-001',
        'recipient' => 'Toko Makmur',
        'quantity' => 4,
        'reason' => 'sale',
        'stock_condition' => StockCondition::Good->value,
        'unit_price' => 15000,
    ]);

    $response->assertRedirect();
    $this->assertEquals(6, $product->fresh()->stock_good);
});

test('user can void an inbound transaction and reverse stock', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG006',
        'name' => 'Penggaris',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 3000,
        'selling_price' => 5000,
        'stock_good' => 0,
        'stock_damaged' => 0,
    ]);

    $this->post(route('practice.inbound.store'), [
        'idempotency_key' => (string) Str::uuid(),
        'product_id' => $product->id,
        'transaction_date' => now()->toDateString(),
        'external_document_number' => 'SJ-002',
        'supplier' => 'PT Penggaris',
        'storage_location' => 'Rak B-1',
        'quantity' => 10,
        'stock_condition' => StockCondition::Good->value,
        'unit_price' => 3000,
    ]);

    $this->assertEquals(10, $product->fresh()->stock_good);

    $transaction = StockTransaction::where('product_id', $product->id)->firstOrFail();

    $voidResponse = $this->post(route('practice.inbound.void', $transaction), [
        'reason' => 'Salah input jumlah barang masuk',
    ]);

    $voidResponse->assertRedirect();
    $this->assertNotNull($transaction->fresh()->voided_at);
    $this->assertEquals(0, $product->fresh()->stock_good);
});

test('user can browse product catalog', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG007',
        'name' => 'Katalog Item Test',
        'category' => 'Elektronik',
        'base_unit' => 'unit',
        'cost_price' => 100000,
        'selling_price' => 150000,
        'stock_good' => 3,
        'stock_damaged' => 0,
    ]);

    $response = $this->get(route('practice.catalog.index'));
    $response->assertOk();
});
