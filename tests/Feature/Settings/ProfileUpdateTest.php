<?php

use App\Models\InventoryMovement;
use App\Models\PracticeWorkspace;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\ShipmentDocument;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});

test('student can reset their practice progress without deleting their account', function () {
    Storage::fake('private');

    $user = User::factory()->create();
    $workspace = PracticeWorkspace::factory()->create(['user_id' => $user->id]);
    $product = Product::factory()->create([
        'workspace_id' => $workspace->id,
        'photo_path' => 'products/reset-photo.jpg',
    ]);
    Storage::disk('private')->put('products/reset-photo.jpg', 'photo');
    $transaction = StockTransaction::factory()->create([
        'workspace_id' => $workspace->id,
        'product_id' => $product->id,
    ]);
    InventoryMovement::factory()->create([
        'workspace_id' => $workspace->id,
        'product_id' => $product->id,
        'stock_transaction_id' => $transaction->id,
    ]);
    $shipment = Shipment::create([
        'workspace_id' => $workspace->id,
        'shipment_number' => 'KRM-RESET-001',
        'shipment_type' => 'domestic',
        'origin' => 'Gudang',
        'destination' => 'Sekolah',
        'origin_country' => 'Indonesia',
        'destination_country' => 'Indonesia',
        'transport_mode' => 'land',
        'fleet_type' => 'Truk',
        'mode_selection_reason' => 'Pengujian',
        'estimated_cost' => 0,
        'cargo_type' => 'general',
        'total_weight_kg' => 1,
        'packaging_type' => 'box',
        'handling_instructions' => 'Tidak ada',
        'shipping_date' => today(),
        'estimated_arrival_date' => today(),
        'status' => 'scheduled',
        'idempotency_key' => 'reset-test',
    ]);
    ShipmentDocument::create([
        'shipment_id' => $shipment->id,
        'document_type' => 'invoice',
        'document_number' => 'INV-RESET-001',
        'attachment_path' => 'documents/reset-document.pdf',
        'attachment_name' => 'reset-document.pdf',
    ]);
    Storage::disk('private')->put('documents/reset-document.pdf', 'document');

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.reset-progress'), ['password' => 'password']);

    $response
        ->assertSessionHasNoErrors()
        ->assertSessionHas('resetProgress', true)
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull()
        ->and($user->workspace()->exists())->toBeFalse()
        ->and(Product::where('workspace_id', $workspace->id)->exists())->toBeFalse()
        ->and(StockTransaction::where('workspace_id', $workspace->id)->exists())->toBeFalse()
        ->and(Shipment::where('workspace_id', $workspace->id)->exists())->toBeFalse();
    Storage::disk('private')->assertMissing('products/reset-photo.jpg');
    Storage::disk('private')->assertMissing('documents/reset-document.pdf');
});

test('correct password must be provided to reset practice progress', function () {
    $user = User::factory()->create();
    $workspace = PracticeWorkspace::factory()->create(['user_id' => $user->id]);
    Product::factory()->create(['workspace_id' => $workspace->id]);

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.reset-progress'), ['password' => 'wrong-password']);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->workspace()->exists())->toBeTrue()
        ->and(Product::where('workspace_id', $workspace->id)->exists())->toBeTrue();
});

test('teacher cannot reset practice progress', function () {
    $user = User::factory()->admin()->create();

    $this
        ->actingAs($user)
        ->delete(route('profile.reset-progress'), ['password' => 'password'])
        ->assertForbidden();
});
