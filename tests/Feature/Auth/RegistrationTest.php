<?php

use App\Models\Classroom;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $classroom = Classroom::factory()->create();
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'classroom_id' => $classroom->id,
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('practice.home', absolute: false));
});

test('new users can register with gmail', function () {
    $classroom = Classroom::factory()->create();
    $response = $this->post(route('register.store'), [
        'name' => 'Siswa Gmail',
        'email' => 'siswa@gmail.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'classroom_id' => $classroom->id,
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('practice.home', absolute: false));
});
