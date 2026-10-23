<?php

use App\Models\Product;
use App\Models\User;
use App\Services\WorkspaceService;

test('authenticated user can visit barcode index and generate barcode', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG101',
        'name' => 'Barcode Test Product',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 5000,
        'selling_price' => 7500,
        'stock_good' => 10,
        'stock_damaged' => 0,
    ]);

    $response = $this->get(route('practice.barcode.index'));
    $response->assertOk();

    $generateResponse = $this->get(route('practice.barcode.index', ['code' => 'BRG101']));
    $generateResponse->assertOk();
});

test('user can download barcode svg', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG102',
        'name' => 'Download Barcode Product',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 5000,
        'selling_price' => 7500,
        'stock_good' => 10,
        'stock_damaged' => 0,
    ]);

    $response = $this->get(route('practice.barcode.download', $product));
    $response->assertOk();
    $response->assertHeader('Content-Type', 'image/svg+xml');
    $response->assertHeader('Content-Disposition', 'attachment; filename="barcode-BRG102.svg"');
    $this->assertStringContainsString('BRG102', $response->getContent());
});

test('user can view print label page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG103',
        'name' => 'Print Label Product',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 5000,
        'selling_price' => 7500,
        'stock_good' => 10,
        'stock_damaged' => 0,
    ]);

    $response = $this->get(route('practice.barcode.print', $product));
    $response->assertOk();
});

test('barcode lookup endpoint returns product for scanner', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $workspace = app(WorkspaceService::class)->getOrCreateForUser($user);

    $product = Product::create([
        'workspace_id' => $workspace->id,
        'code' => 'BRG104',
        'name' => 'Lookup Product',
        'category' => 'ATK',
        'base_unit' => 'pcs',
        'cost_price' => 5000,
        'selling_price' => 7500,
        'stock_good' => 10,
        'stock_damaged' => 0,
    ]);

    $response = $this->getJson(route('practice.barcode.lookup', ['code' => 'BRG104']));
    $response->assertOk();
    $response->assertJson([
        'found' => true,
        'product' => [
            'id' => $product->id,
            'code' => 'BRG104',
            'name' => 'Lookup Product',
        ],
    ]);

    $notFoundResponse = $this->getJson(route('practice.barcode.lookup', ['code' => 'UNKNOWN']));
    $notFoundResponse->assertNotFound();
});
