<?php

use App\Models\Classroom;
use App\Models\PracticeWorkspace;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

test('workspace is created automatically during registration', function () {
    $classroom = Classroom::factory()->create();
    $response = $this->post(route('register.store'), [
        'name' => 'Siswa Test',
        'email' => 'siswa@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'classroom_id' => $classroom->id,
    ]);

    $response->assertRedirect(route('practice.home', absolute: false));

    $user = User::where('email', 'siswa@example.com')->firstOrFail();
    assertDatabaseHas('practice_workspaces', [
        'user_id' => $user->id,
    ]);
});

test('workspace is created idempotently when accessing practice home', function () {
    $user = User::factory()->create();
    expect($user->workspace)->toBeNull();

    $response = $this->actingAs($user)->get(route('practice.home'));

    $response->assertOk();
    assertDatabaseHas('practice_workspaces', [
        'user_id' => $user->id,
    ]);
});

test('user only has one workspace even after multiple logins', function () {
    $user = User::factory()->create();
    PracticeWorkspace::create([
        'user_id' => $user->id,
        'last_activity_at' => now(),
    ]);

    // Access practice home multiple times
    $this->actingAs($user)->get(route('practice.home'));
    $this->actingAs($user)->get(route('practice.home'));

    expect(PracticeWorkspace::where('user_id', $user->id)->count())->toBe(1);
});

test('two users have separate workspaces', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $this->actingAs($user1)->get(route('practice.home'));
    $this->actingAs($user2)->get(route('practice.home'));

    expect(PracticeWorkspace::count())->toBe(2);
    expect(PracticeWorkspace::where('user_id', $user1->id)->first())
        ->id->not->toBe(PracticeWorkspace::where('user_id', $user2->id)->first()->id);
});
