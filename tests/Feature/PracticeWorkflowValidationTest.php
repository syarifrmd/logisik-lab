<?php

use App\Models\PracticeWorkspace;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\StockTransaction;
use App\Models\User;
use App\Services\WorkspaceService;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

function createWorkflowProduct(PracticeWorkspace $workspace): Product
{
    return Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG-QA-001',
        'name' => 'Produk QA',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 5000,
        'selling_price' => 10000,
        'stock_good' => 5,
        'stock_damaged' => 0,
    ]);
}

function createWorkflowOutbound(Product $product, string $transactionNumber = 'BK-QA-001'): StockTransaction
{
    return StockTransaction::create([
        'workspace_id' => $product->workspace_id,
        'product_id' => $product->id,
        'transaction_number' => $transactionNumber,
        'type' => 'outbound',
        'transaction_date' => today()->toDateString(),
        'quantity' => 5,
        'stock_condition' => 'good',
        'unit_price' => 10000,
        'total_amount' => 50000,
        'recipient' => 'Toko Bandung',
        'idempotency_key' => (string) Str::uuid(),
        'product_snapshot' => ['code' => $product->code, 'name' => $product->name, 'category' => $product->category, 'base_unit' => $product->base_unit],
    ]);
}

/**
 * @param  array<int, array<string, int|string>>  $items
 * @return array<string, mixed>
 */
function shipmentWorkflowPayload(array $items): array
{
    return [
        'idempotency_key' => (string) Str::uuid(),
        'shipment_type' => 'domestic',
        'origin' => 'Gudang Jakarta',
        'destination' => 'Toko Bandung',
        'origin_country' => 'Indonesia',
        'destination_country' => 'Indonesia',
        'transport_mode' => 'land',
        'fleet_type' => 'Truk Box',
        'mode_selection_reason' => 'Pengiriman antar kota melalui jalur darat.',
        'estimated_cost' => 100000,
        'cargo_type' => 'general',
        'total_weight_kg' => 10,
        'packaging_type' => 'box',
        'handling_instructions' => 'Hindari basah.',
        'shipping_date' => today()->toDateString(),
        'estimated_arrival_date' => today()->addDays(2)->toDateString(),
        'items' => $items,
    ];
}

test('shipment selection includes the requested outbound and excludes voided and foreign transactions', function () {
    $user = User::factory()->create();
    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);
    $product = createWorkflowProduct($workspace);
    $outbound = createWorkflowOutbound($product);
    $voidedOutbound = createWorkflowOutbound($product, 'BK-QA-002');
    $voidedOutbound->update(['voided_at' => now()]);
    $otherUser = User::factory()->create();
    $otherWorkspace = app(WorkspaceService::class)->getOrCreateForUser($otherUser);
    $otherProduct = createWorkflowProduct($otherWorkspace);
    createWorkflowOutbound($otherProduct);

    $response = $this->actingAs($user)->get(route('practice.shipments.create', ['outbound_id' => $outbound->id]));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('practice/shipments/create')
        ->where('initialOutboundId', $outbound->id)
        ->has('availableOutbounds', 1)
        ->where('availableOutbounds.0.id', $outbound->id)
        ->where('availableOutbounds.0.remaining', 5)
        ->where('availableOutbounds.0.recipient', 'Toko Bandung')
        ->where('availableOutbounds.0.product_snapshot.name', $product->name));
});

test('insufficient stock returns a useful error without recording an outbound transaction', function () {
    $user = User::factory()->create();
    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);
    $product = createWorkflowProduct($workspace);

    $response = $this->actingAs($user)->from(route('practice.outbound.create'))->post(route('practice.outbound.store'), [
        'idempotency_key' => (string) Str::uuid(),
        'product_id' => $product->id,
        'transaction_date' => today()->toDateString(),
        'external_document_number' => 'DO-QA-001',
        'recipient' => 'Toko Bandung',
        'quantity' => 6,
        'reason' => 'sale',
        'stock_condition' => 'good',
        'unit_price' => 10000,
    ]);

    $response->assertRedirect(route('practice.outbound.create'))
        ->assertSessionHasErrors(['stock' => 'Stok tersedia saat ini 5 pcs. Sesuaikan jumlah barang keluar.']);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock_good' => 5]);
    $this->assertDatabaseCount('stock_transactions', 0);
    $this->assertDatabaseCount('inventory_movements', 0);
});

test('excess shipment allocation returns an error and rolls back the shipment', function () {
    $user = User::factory()->create();
    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);
    $product = createWorkflowProduct($workspace);
    $outbound = createWorkflowOutbound($product);

    $response = $this->actingAs($user)->from(route('practice.shipments.create'))
        ->post(route('practice.shipments.store'), shipmentWorkflowPayload([
            ['stock_transaction_id' => $outbound->id, 'quantity' => 6],
        ]));

    $response->assertRedirect(route('practice.shipments.create'))
        ->assertSessionHasErrors(['store' => 'Jumlah alokasi (6) melebihi sisa kuantitas transaksi keluar BK-QA-001 (Tersisa: 5 pcs).']);
    $this->assertDatabaseCount('shipments', 0);
    $this->assertDatabaseCount('shipment_items', 0);
    $this->assertDatabaseCount('shipment_status_histories', 0);
});

test('shipment status cannot skip steps or change after cancellation', function (string $initialStatus, string $expectedError) {
    $user = User::factory()->create();
    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);
    $shipment = Shipment::create([
        ...shipmentWorkflowPayload([]),
        'workspace_id' => $workspace->id,
        'shipment_number' => 'KRM-QA-001',
        'status' => $initialStatus,
    ]);

    $response = $this->actingAs($user)->from(route('practice.shipments.show', $shipment))
        ->post(route('practice.shipments.status', $shipment), ['status' => 'received', 'received_date' => today()->toDateString()]);

    $response->assertRedirect(route('practice.shipments.show', $shipment))
        ->assertSessionHasErrors(['status' => $expectedError]);
    $this->assertDatabaseHas('shipments', ['id' => $shipment->id, 'status' => $initialStatus, 'received_date' => null]);
    $this->assertDatabaseCount('shipment_status_histories', 0);
})->with([
    'skipped step' => ['scheduled', 'Transisi status dari scheduled ke received tidak diizinkan.'],
    'cancelled shipment' => ['cancelled', 'Pengiriman yang sudah dibatalkan tidak dapat diubah statusnya.'],
]);

test('an import shipment can be scheduled from a master product without an outbound transaction', function () {
    $user = User::factory()->create();
    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);
    $product = createWorkflowProduct($workspace);
    $payload = shipmentWorkflowPayload([['product_id' => $product->id, 'quantity' => 2, 'stock_condition' => 'good']]);
    $payload['shipment_type'] = 'import';
    $payload['origin_country'] = 'Tiongkok';
    $payload['transport_mode'] = 'sea';

    $response = $this->actingAs($user)->post(route('practice.shipments.store'), $payload);

    $shipment = Shipment::where('workspace_id', $workspace->id)->firstOrFail();
    $response->assertSessionHasNoErrors()->assertRedirect(route('practice.shipments.show', $shipment));
    $this->assertDatabaseHas('shipment_items', ['shipment_id' => $shipment->id, 'product_id' => $product->id, 'stock_transaction_id' => null, 'quantity' => 2]);
    $this->assertDatabaseHas('shipments', ['id' => $shipment->id, 'shipment_type' => 'import', 'transport_mode' => 'sea', 'status' => 'scheduled']);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock_good' => 5]);
});

test('an export shipment can be scheduled and cancellation releases its outbound allocation', function () {
    $user = User::factory()->create();
    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);
    $product = createWorkflowProduct($workspace);
    $outbound = createWorkflowOutbound($product);
    $payload = shipmentWorkflowPayload([['stock_transaction_id' => $outbound->id, 'quantity' => 3]]);
    $payload['shipment_type'] = 'export';
    $payload['destination_country'] = 'Singapura';
    $payload['transport_mode'] = 'air';

    $response = $this->actingAs($user)->post(route('practice.shipments.store'), $payload);

    $shipment = Shipment::where('workspace_id', $workspace->id)->firstOrFail();
    $response->assertSessionHasNoErrors()->assertRedirect(route('practice.shipments.show', $shipment));
    $this->assertDatabaseHas('shipment_items', ['shipment_id' => $shipment->id, 'stock_transaction_id' => $outbound->id, 'quantity' => 3]);
    $this->assertDatabaseHas('shipments', ['id' => $shipment->id, 'shipment_type' => 'export', 'transport_mode' => 'air']);
    $this->get(route('practice.shipments.create'))->assertInertia(fn (Assert $page) => $page->where('availableOutbounds.0.remaining', 2));

    $this->post(route('practice.shipments.cancel', $shipment), ['reason' => 'Pengiriman uji dibatalkan.'])
        ->assertRedirect()->assertSessionHasNoErrors();

    $this->assertDatabaseHas('shipments', ['id' => $shipment->id, 'status' => 'cancelled']);
    $this->get(route('practice.shipments.create'))->assertInertia(fn (Assert $page) => $page->where('availableOutbounds.0.remaining', 5));
});

test('every report exports a real XLSX archive', function (string $tab) {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('practice.reports.export', ['tab' => $tab]));

    $response->assertOk()->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect($response->streamedContent())->toStartWith('PK');
})->with(['products', 'inbound', 'outbound', 'stock', 'shipments']);
