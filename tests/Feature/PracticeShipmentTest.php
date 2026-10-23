<?php

use App\Enums\StockCondition;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\StockTransaction;
use App\Models\User;
use App\Services\WorkspaceService;
use Illuminate\Support\Str;

test('authenticated user can visit shipments index and create page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('practice.shipments.index'));
    $response->assertOk();

    $createResponse = $this->get(route('practice.shipments.create'));
    $createResponse->assertOk();
});

test('user can schedule a domestic shipment from an outbound transaction', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG201',
        'name' => 'Produk Transportasi',
        'category' => 'Elektronik',
        'base_unit' => 'unit',
        'cost_price' => 50000,
        'selling_price' => 75000,
        'stock_good' => 20,
        'stock_damaged' => 0,
    ]);

    // Record outbound transaction
    $this->post(route('practice.outbound.store'), [
        'idempotency_key' => (string) Str::uuid(),
        'product_id' => $product->id,
        'transaction_date' => now()->toDateString(),
        'external_document_number' => 'DO-201',
        'recipient' => 'Toko Mitra Bandung',
        'quantity' => 10,
        'reason' => 'sale',
        'stock_condition' => StockCondition::Good->value,
        'unit_price' => 75000,
    ]);

    $outbound = StockTransaction::where('product_id', $product->id)->firstOrFail();

    // Schedule shipment
    $response = $this->post(route('practice.shipments.store'), [
        'idempotency_key' => (string) Str::uuid(),
        'shipment_type' => 'domestic',
        'origin' => 'Gudang Jakarta',
        'destination' => 'Toko Mitra Bandung',
        'origin_country' => 'Indonesia',
        'destination_country' => 'Indonesia',
        'transport_mode' => 'land',
        'fleet_type' => 'Truk CDD',
        'mode_selection_reason' => 'Efisien untuk jalur darat Jawa Barat',
        'estimated_cost' => 350000,
        'cargo_type' => 'general',
        'total_weight_kg' => 25,
        'packaging_type' => 'box',
        'handling_instructions' => 'Jangan dibanting',
        'shipping_date' => now()->toDateString(),
        'estimated_arrival_date' => now()->addDays(2)->toDateString(),
        'items' => [
            [
                'stock_transaction_id' => $outbound->id,
                'quantity' => 10,
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('shipments', [
        'workspace_id' => $workspace->id,
        'destination' => 'Toko Mitra Bandung',
        'status' => 'scheduled',
    ]);
});

test('user can update shipment status progression and complete it', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG202',
        'name' => 'Produk Status Test',
        'category' => 'ATK',
        'base_unit' => 'box',
        'cost_price' => 10000,
        'selling_price' => 15000,
        'stock_good' => 50,
        'stock_damaged' => 0,
    ]);

    $shipment = Shipment::create([
        'workspace_id' => $workspace->id,
        'shipment_number' => 'KRM-20261022-0099',
        'shipment_type' => 'domestic',
        'origin' => 'Asal',
        'destination' => 'Tujuan',
        'origin_country' => 'Indonesia',
        'destination_country' => 'Indonesia',
        'transport_mode' => 'land',
        'fleet_type' => 'Truk Box',
        'mode_selection_reason' => 'Uji status',
        'estimated_cost' => 100000,
        'cargo_type' => 'general',
        'total_weight_kg' => 10,
        'packaging_type' => 'box',
        'handling_instructions' => 'Hati-hati',
        'shipping_date' => now()->toDateString(),
        'estimated_arrival_date' => now()->addDay()->toDateString(),
        'status' => 'scheduled',
        'idempotency_key' => (string) Str::uuid(),
    ]);

    // Advance to shipped
    $this->post(route('practice.shipments.status', $shipment), [
        'status' => 'shipped',
    ])->assertRedirect();
    $this->assertEquals('shipped', $shipment->fresh()->status);

    // Advance to in_transit
    $this->post(route('practice.shipments.status', $shipment), [
        'status' => 'in_transit',
    ])->assertRedirect();
    $this->assertEquals('in_transit', $shipment->fresh()->status);

    // Advance to received
    $this->post(route('practice.shipments.status', $shipment), [
        'status' => 'received',
        'received_date' => now()->toDateString(),
    ])->assertRedirect();
    $this->assertEquals('received', $shipment->fresh()->status);
    $this->assertNotNull($shipment->fresh()->received_date);
});

test('user can cancel a scheduled shipment and add documents', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $shipment = Shipment::create([
        'workspace_id' => $workspace->id,
        'shipment_number' => 'KRM-20261022-0098',
        'shipment_type' => 'domestic',
        'origin' => 'Asal',
        'destination' => 'Tujuan',
        'origin_country' => 'Indonesia',
        'destination_country' => 'Indonesia',
        'transport_mode' => 'land',
        'fleet_type' => 'Truk Box',
        'mode_selection_reason' => 'Uji cancel',
        'estimated_cost' => 100000,
        'cargo_type' => 'general',
        'total_weight_kg' => 10,
        'packaging_type' => 'box',
        'handling_instructions' => 'Hati-hati',
        'shipping_date' => now()->toDateString(),
        'estimated_arrival_date' => now()->addDay()->toDateString(),
        'status' => 'scheduled',
        'idempotency_key' => (string) Str::uuid(),
    ]);

    // Add document
    $docResponse = $this->post(route('practice.shipments.document', $shipment), [
        'document_type' => 'surat_jalan',
        'document_number' => 'SJ-TEST-001',
        'document_date' => now()->toDateString(),
    ]);
    $docResponse->assertRedirect();
    $this->assertDatabaseHas('shipment_documents', [
        'shipment_id' => $shipment->id,
        'document_number' => 'SJ-TEST-001',
    ]);

    // Cancel
    $cancelResponse = $this->post(route('practice.shipments.cancel', $shipment), [
        'reason' => 'Armada mengalami kendala teknis',
    ]);
    $cancelResponse->assertRedirect();
    $this->assertEquals('cancelled', $shipment->fresh()->status);
    $this->assertEquals('Armada mengalami kendala teknis', $shipment->fresh()->cancellation_reason);
});
