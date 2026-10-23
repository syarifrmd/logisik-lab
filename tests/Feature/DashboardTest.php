<?php

use App\Models\User;

test('guests visiting dashboard are redirected to login', function () {
    $response = $this->get('/dashboard');
    $response->assertRedirect(route('login'));
});

test('guests are redirected to the login page', function () {
    $response = $this->get(route('practice.home'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the practice home', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('practice.home'));
    $response->assertOk();
    $this->assertDatabaseHas('practice_workspaces', [
        'user_id' => $user->id,
    ]);
});

test('authenticated users visiting dashboard are redirected to practice home', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get('/dashboard');
    $response->assertRedirect('/praktik');
});
