<?php

use App\Models\Classroom;
use App\Models\PracticeWorkspace;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('teacher routes require authentication and reject student accounts', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create())->get(route('admin.dashboard'))->assertForbidden();
    $this->post(route('admin.classrooms.store'), ['name' => 'Unauthorized', 'academic_year' => '2026/2027'])->assertForbidden();
    $this->assertDatabaseCount('classrooms', 0);
});

test('teacher dashboard contains only owned classes and their student totals', function () {
    $teacher = User::factory()->admin()->create();
    $classroom = Classroom::factory()->for($teacher, 'teacher')->create(['name' => 'XI Logistik']);
    User::factory()->for($classroom)->count(2)->create();
    $foreignClass = Classroom::factory()->create(['name' => 'Kelas Guru Lain']);
    User::factory()->for($foreignClass)->count(3)->create();

    $response = $this->actingAs($teacher)->get(route('admin.dashboard'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/dashboard')
        ->where('stats.student_count', 2)->where('stats.classroom_count', 1)
        ->has('classrooms.data', 1)->where('classrooms.data.0.name', 'XI Logistik'));
});

test('teachers can create and close their classes without deleting enrolled students', function () {
    $teacher = User::factory()->admin()->create();

    $response = $this->actingAs($teacher)->post(route('admin.classrooms.store'), ['name' => 'XI Logistik 1', 'academic_year' => '2026/2027', 'teacher_id' => 999]);

    $classroom = Classroom::where('name', 'XI Logistik 1')->firstOrFail();
    $response->assertSessionHasNoErrors()->assertRedirect(route('admin.classrooms.show', $classroom));
    $this->assertDatabaseHas('classrooms', ['id' => $classroom->id, 'teacher_id' => $teacher->id, 'is_active' => true]);
    expect($classroom->code)->toStartWith('LL-');
    $student = User::factory()->for($classroom)->create();

    $this->patch(route('admin.classrooms.update', $classroom), ['name' => 'XI Logistik 1', 'academic_year' => '2026/2027', 'is_active' => false])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('classrooms', ['id' => $classroom->id, 'is_active' => false]);
    $this->assertDatabaseHas('users', ['id' => $student->id, 'classroom_id' => $classroom->id]);
});

test('class creation rejects invalid school years', function (string $year) {
    $teacher = User::factory()->admin()->create();

    $this->actingAs($teacher)->post(route('admin.classrooms.store'), ['name' => 'XI Logistik', 'academic_year' => $year])->assertSessionHasErrors('academic_year');

    $this->assertDatabaseCount('classrooms', 0);
})->with(['bad format' => '2026', 'nonconsecutive' => '2026/2030']);

test('a teacher cannot read edit or enroll students in another teachers class', function () {
    $teacher = User::factory()->admin()->create();
    $foreignClassroom = Classroom::factory()->create();
    $student = User::factory()->for($foreignClassroom)->create();

    $this->actingAs($teacher)->get(route('admin.classrooms.show', $foreignClassroom))->assertNotFound();
    $this->patch(route('admin.classrooms.update', $foreignClassroom), ['name' => 'Changed', 'academic_year' => '2026/2027'])->assertNotFound();
    $this->post(route('admin.classrooms.students.store', $foreignClassroom), ['email' => $student->email])->assertNotFound();
    $this->get(route('admin.students.show', $student))->assertNotFound();

    $this->assertDatabaseHas('classrooms', ['id' => $foreignClassroom->id, 'name' => $foreignClassroom->name]);
});

test('a teacher can enroll an unassigned student and transfer between their own classes', function () {
    $teacher = User::factory()->admin()->create();
    $firstClass = Classroom::factory()->for($teacher, 'teacher')->create();
    $secondClass = Classroom::factory()->for($teacher, 'teacher')->create();
    $student = User::factory()->create();

    $this->actingAs($teacher)->post(route('admin.classrooms.students.store', $firstClass), ['email' => $student->email])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('users', ['id' => $student->id, 'classroom_id' => $firstClass->id]);
    $this->post(route('admin.classrooms.students.store', $secondClass), ['email' => $student->email])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('users', ['id' => $student->id, 'classroom_id' => $secondClass->id, 'role' => 'student']);
});

test('a teacher cannot take a student from another teachers class or enroll an admin', function () {
    $teacher = User::factory()->admin()->create();
    $ownedClass = Classroom::factory()->for($teacher, 'teacher')->create();
    $foreignClass = Classroom::factory()->create();
    $student = User::factory()->for($foreignClass)->create();

    $this->actingAs($teacher)->post(route('admin.classrooms.students.store', $ownedClass), ['email' => $student->email])->assertSessionHasErrors('email');
    $this->post(route('admin.classrooms.students.store', $ownedClass), ['email' => $teacher->email])->assertSessionHasErrors('email');

    $this->assertDatabaseHas('users', ['id' => $student->id, 'classroom_id' => $foreignClass->id]);
    $this->assertDatabaseHas('users', ['id' => $teacher->id, 'classroom_id' => null, 'role' => 'admin']);
});

test('an empty student workspace shows zero progress without creating practice data', function () {
    $classroom = Classroom::factory()->create();
    $student = User::factory()->for($classroom)->create();

    $this->actingAs($classroom->teacher)->get(route('admin.students.show', $student))
        ->assertOk()->assertInertia(fn (Assert $page) => $page->component('admin/students/show')->where('progress.percentage', 0)->where('progress.stock_good', 0)->has('records.data', 0));

    $this->assertDatabaseCount('practice_workspaces', 0);
});

test('student monitoring scopes stock and transactions and excludes cancelled activity from progress', function () {
    $this->freezeTime();
    $classroom = Classroom::factory()->create();
    $student = User::factory()->for($classroom)->create();
    $workspace = PracticeWorkspace::factory()->for($student)->create(['last_activity_at' => now()->subDay()]);
    $product = Product::factory()->for($workspace, 'workspace')->withStock(9, 2)->create(['name' => 'Barang Siswa Terpantau']);
    StockTransaction::factory()->for($workspace, 'workspace')->for($product)->create(['type' => 'inbound', 'quantity' => 5, 'product_snapshot' => ['name' => $product->name, 'code' => $product->code, 'base_unit' => 'pcs']]);
    StockTransaction::factory()->for($workspace, 'workspace')->for($product)->create(['type' => 'outbound', 'voided_at' => now()]);
    $otherStudent = User::factory()->for($classroom)->create();
    $otherWorkspace = PracticeWorkspace::factory()->for($otherStudent)->create();
    Product::factory()->for($otherWorkspace, 'workspace')->withStock(100)->create();

    $this->actingAs($classroom->teacher)->get(route('admin.students.show', $student))
        ->assertOk()->assertInertia(fn (Assert $page) => $page->where('progress.product_count', 1)->where('progress.inbound_count', 1)
        ->where('progress.outbound_count', 0)->where('progress.stock_good', 9)->where('progress.stock_damaged', 2)->where('progress.percentage', 40)
        ->has('records.data', 1)->where('records.data.0.name', 'Barang Siswa Terpantau'));
    $this->get(route('admin.students.show', [$student, 'tab' => 'inbound']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page->has('records.data', 1)->where('records.data.0.product_snapshot.name', 'Barang Siswa Terpantau'));
    $this->get(route('admin.students.show', [$student, 'tab' => 'outbound']))->assertOk()->assertInertia(fn (Assert $page) => $page->has('records.data', 1));
    $this->get(route('admin.students.show', [$student, 'tab' => 'shipments']))->assertOk()->assertInertia(fn (Assert $page) => $page->has('records.data', 0));

    expect($workspace->fresh()->last_activity_at->toDateTimeString())->toBe(now()->subDay()->toDateTimeString());
});

test('teacher navigation redirects to the teacher dashboard without creating a student workspace', function () {
    $teacher = User::factory()->admin()->create();

    $this->actingAs($teacher)->get('/dashboard')->assertRedirect('/admin');
    $this->get(route('practice.home'))->assertRedirect(route('admin.dashboard'));

    $this->assertDatabaseCount('practice_workspaces', 0);
});

test('all five progress indicators are completed only when active practice records and a received shipment exist', function () {
    $classroom = Classroom::factory()->create();
    $student = User::factory()->for($classroom)->create();
    $workspace = PracticeWorkspace::factory()->for($student)->create();
    $product = Product::factory()->for($workspace, 'workspace')->create();
    StockTransaction::factory()->for($workspace, 'workspace')->for($product)->create(['type' => 'inbound']);
    StockTransaction::factory()->for($workspace, 'workspace')->for($product)->create(['type' => 'outbound']);
    $shipment = Shipment::create([
        'workspace_id' => $workspace->id, 'shipment_number' => 'KRM-TEST-001', 'shipment_type' => 'domestic',
        'origin' => 'Gudang', 'destination' => 'Toko', 'transport_mode' => 'land', 'fleet_type' => 'Truk',
        'mode_selection_reason' => 'Latihan pengiriman darat.', 'cargo_type' => 'general', 'total_weight_kg' => 5,
        'packaging_type' => 'box', 'handling_instructions' => 'Hindari basah', 'shipping_date' => today(),
        'estimated_arrival_date' => today(), 'received_date' => today(), 'status' => 'received', 'idempotency_key' => (string) Str::uuid(),
    ]);

    $this->actingAs($classroom->teacher)->get(route('admin.students.show', $student))->assertInertia(fn (Assert $page) => $page
        ->where('progress.completed_steps', 5)->where('progress.percentage', 100)->where('progress.received_count', 1));
    $this->get(route('admin.classrooms.show', $classroom))->assertInertia(fn (Assert $page) => $page
        ->where('students.data.0.progress.percentage', 100));
    $this->get(route('admin.students.show', [$student, 'tab' => 'shipments']))->assertInertia(fn (Assert $page) => $page
        ->has('records.data', 1)->where('records.data.0.shipment_number', $shipment->shipment_number)->missing('records.data.0.idempotency_key'));
});

test('teachers with managed classes cannot delete their account and orphan their classes', function () {
    $classroom = Classroom::factory()->create();

    $this->actingAs($classroom->teacher)->from(route('profile.edit'))->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertRedirect(route('profile.edit'))->assertSessionHasErrors(['password' => 'Akun guru yang masih mengelola kelas tidak dapat dihapus.']);

    $this->assertModelExists($classroom->teacher);
    $this->assertModelExists($classroom);
});

test('classroom forms reject an array school year without a server error', function () {
    $teacher = User::factory()->admin()->create();

    $this->actingAs($teacher)->post(route('admin.classrooms.store'), ['name' => 'Kelas Uji', 'academic_year' => ['2026', '2027']])
        ->assertSessionHasErrors('academic_year');

    $this->assertDatabaseCount('classrooms', 0);
});
