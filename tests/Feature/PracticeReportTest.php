<?php

use App\Models\Product;
use App\Models\User;
use App\Services\WorkspaceService;

test('authenticated user can view report preview for all 5 tabs', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG301',
        'name' => 'Report Test Product',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 5000,
        'selling_price' => 7500,
        'stock_good' => 10,
        'stock_damaged' => 0,
    ]);

    foreach (['products', 'inbound', 'outbound', 'stock', 'shipments'] as $tab) {
        $response = $this->get(route('practice.reports.index', ['tab' => $tab]));
        $response->assertOk();
    }
});

test('user can export XLSX reports for products and stock', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG302',
        'name' => 'Export Product',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 5000,
        'selling_price' => 7500,
        'stock_good' => 10,
        'stock_damaged' => 0,
    ]);

    // Export products
    $response = $this->get(route('practice.reports.export', ['tab' => 'products']));
    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Export stock
    $stockResponse = $this->get(route('practice.reports.export', ['tab' => 'stock']));
    $stockResponse->assertOk();
    $stockResponse->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Export shipments
    $shipmentsResponse = $this->get(route('practice.reports.export', ['tab' => 'shipments']));
    $shipmentsResponse->assertOk();
    $shipmentsResponse->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});
