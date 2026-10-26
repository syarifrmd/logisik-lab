<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClassroomRequest;
use App\Http\Requests\Admin\UpdateClassroomRequest;
use App\Models\Classroom;
use App\Models\User;
use App\Services\StudentProgressService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher = $request->user();
        $search = $request->string('search')->trim()->toString();
        $students = User::where('role', UserRole::Student)->whereHas('classroom', fn ($query) => $query->where('teacher_id', $teacher->id));

        return Inertia::render('admin/dashboard', [
            'classrooms' => $teacher->teachingClassrooms()
                ->withCount(['students', 'students as active_students_count' => fn ($query) => $query->whereHas('workspace', fn ($workspace) => $workspace->where('last_activity_at', '>=', today()))])
                ->when($search, fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
                ->latest()->paginate(12)->withQueryString(),
            'stats' => [
                'classroom_count' => $teacher->teachingClassrooms()->count(),
                'student_count' => (clone $students)->count(),
                'active_today' => (clone $students)->whereHas('workspace', fn ($query) => $query->where('last_activity_at', '>=', today()))->count(),
                'started_count' => (clone $students)->whereHas('workspace.products', fn ($query) => $query->whereNull('archived_at'))->count(),
            ],
            'filters' => ['search' => $search],
        ]);
    }

    public function store(StoreClassroomRequest $request): RedirectResponse
    {
        $classroom = $request->user()->teachingClassrooms()->create($request->validated());

        return to_route('admin.classrooms.show', $classroom)->with('toast', ['type' => 'success', 'message' => 'Kelas berhasil dibuat. Siswa dapat memilih kelas ini saat mendaftar.']);
    }

    public function show(Request $request, Classroom $classroom, StudentProgressService $progress): Response
    {
        abort_unless($classroom->teacher_id === $request->user()->id, 404);
        $search = $request->string('search')->trim()->toString();
        $students = $progress->withProgress(User::where('classroom_id', $classroom->id)->where('role', UserRole::Student))
            ->when($search, fn ($query) => $query->where(fn ($names) => $names->where('name', 'like', '%'.$search.'%')->orWhere('email', 'like', '%'.$search.'%')))
            ->orderBy('name')->paginate(15)->withQueryString()
            ->through(fn (User $student) => [...$student->only(['id', 'name', 'email']), 'progress' => $progress->summarize($student)]);

        return Inertia::render('admin/classrooms/show', ['classroom' => $classroom, 'students' => $students, 'filters' => ['search' => $search]]);
    }

    public function update(UpdateClassroomRequest $request, Classroom $classroom): RedirectResponse
    {
        $classroom->update($request->validated());

        return back()->with('toast', ['type' => 'success', 'message' => 'Pengaturan kelas berhasil diperbarui.']);
    }
}
