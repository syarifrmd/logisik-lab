<?php

use App\Enums\UserRole;
use App\Models\Classroom;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('registration assigns the selected class and cannot create an admin from public input', function () {
    $classroom = Classroom::factory()->create();

    $response = $this->post(route('register.store'), [
        'name' => 'Siswa Baru', 'email' => 'siswa-baru@example.com', 'password' => 'password', 'password_confirmation' => 'password',
        'classroom_id' => $classroom->id, 'role' => 'admin',
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect('/praktik');
    $this->assertDatabaseHas('users', ['email' => 'siswa-baru@example.com', 'role' => 'student', 'classroom_id' => $classroom->id]);
    $student = User::where('email', 'siswa-baru@example.com')->firstOrFail();
    $this->assertDatabaseHas('practice_workspaces', ['user_id' => $student->id]);
});

test('registration rejects a missing or closed classroom', function (bool $hasClassroom) {
    $classroom = Classroom::factory()->create(['is_active' => false]);

    $response = $this->post(route('register.store'), [
        'name' => 'Siswa', 'email' => 'rejected@example.com', 'password' => 'password', 'password_confirmation' => 'password',
        'classroom_id' => $hasClassroom ? $classroom->id : null,
    ]);

    $response->assertSessionHasErrors(['classroom_id' => $hasClassroom ? 'Kelas tidak tersedia untuk pendaftaran.' : 'Pilih kelas yang diberikan guru.']);
    $this->assertDatabaseMissing('users', ['email' => 'rejected@example.com']);
})->with(['missing class' => false, 'closed class' => true]);

test('student login checks membership in the selected classroom', function () {
    $classroom = Classroom::factory()->create();
    $student = User::factory()->for($classroom)->create();

    $response = $this->post(route('login.store'), ['email' => $student->email, 'password' => 'password', 'login_role' => 'student', 'classroom_id' => $classroom->id]);

    $response->assertSessionHasNoErrors()->assertRedirect('/praktik');
    $this->assertAuthenticatedAs($student);
});

test('student login rejects the wrong classroom even with the correct password', function () {
    $classroom = Classroom::factory()->create();
    $otherClassroom = Classroom::factory()->create();
    $student = User::factory()->for($classroom)->create();

    $response = $this->post(route('login.store'), ['email' => $student->email, 'password' => 'password', 'login_role' => 'student', 'classroom_id' => $otherClassroom->id]);

    $response->assertSessionHasErrors(['classroom_id' => 'Kelas tidak sesuai dengan akun siswa.']);
    $this->assertGuest();
    $this->assertDatabaseHas('users', ['id' => $student->id, 'classroom_id' => $classroom->id]);
});

test('teacher login redirects to the teacher dashboard without needing a class', function () {
    $teacher = User::factory()->admin()->create();

    $response = $this->post(route('login.store'), ['email' => $teacher->email, 'password' => 'password', 'login_role' => 'admin']);

    $response->assertSessionHasNoErrors()->assertRedirect('/admin');
    $this->assertAuthenticatedAs($teacher);
});

test('selecting the teacher login tab does not grant a student teacher access', function () {
    $student = User::factory()->create();

    $response = $this->post(route('login.store'), ['email' => $student->email, 'password' => 'password', 'login_role' => 'admin']);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
    $this->assertDatabaseHas('users', ['id' => $student->id, 'role' => 'student']);
});

test('closed classrooms remain available for existing students to log in', function () {
    $classroom = Classroom::factory()->create(['is_active' => false]);
    $student = User::factory()->for($classroom)->create();

    $response = $this->post(route('login.store'), ['email' => $student->email, 'password' => 'password', 'classroom_id' => $classroom->id]);

    $response->assertSessionHasNoErrors()->assertRedirect('/praktik');
    $this->assertAuthenticatedAs($student);
    $this->post(route('logout'));
    $this->get(route('register'))->assertInertia(fn (Assert $page) => $page->has('classrooms', 0));
});

test('a legacy student can log in without a class then join once without losing their workspace', function () {
    $classroom = Classroom::factory()->create();
    $otherClassroom = Classroom::factory()->create();
    $student = User::factory()->create();

    $this->post(route('login.store'), ['email' => $student->email, 'password' => 'password'])->assertSessionHasNoErrors();
    $this->get(route('practice.home'))->assertOk();
    $workspaceId = $student->workspace()->firstOrFail()->id;
    $this->post(route('practice.classroom.join'), ['classroom_id' => $classroom->id])->assertSessionHasNoErrors()->assertRedirect();
    $this->post(route('practice.classroom.join'), ['classroom_id' => $otherClassroom->id])->assertSessionHasErrors('classroom_id');

    $this->assertDatabaseHas('users', ['id' => $student->id, 'classroom_id' => $classroom->id]);
    $this->assertDatabaseHas('practice_workspaces', ['id' => $workspaceId, 'user_id' => $student->id]);
});

test('teacher provisioning preserves an existing password and creates only one initial class', function () {
    $user = User::factory()->create(['email' => 'guru@example.com']);
    $password = $user->password;

    $this->artisan('app:make-teacher', ['email' => $user->email])->assertSuccessful();
    $this->artisan('app:make-teacher', ['email' => $user->email])->assertSuccessful();

    expect($user->fresh()->role)->toBe(UserRole::Admin);
    expect($user->fresh()->password)->toBe($password);
    expect(Hash::check('password', $user->fresh()->password))->toBeTrue();
    $this->assertDatabaseCount('classrooms', 1);
    $this->assertDatabaseHas('classrooms', ['teacher_id' => $user->id, 'name' => 'Kelas Praktik']);
});
