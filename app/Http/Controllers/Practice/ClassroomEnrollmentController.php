<?php

namespace App\Http\Controllers\Practice;

use App\Http\Controllers\Controller;
use App\Http\Requests\Practice\JoinClassroomRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ClassroomEnrollmentController extends Controller
{
    public function store(JoinClassroomRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $student = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();

            if ($student->classroom_id !== null) {
                throw ValidationException::withMessages(['classroom_id' => 'Kamu sudah terdaftar di kelas. Hubungi guru untuk pindah kelas.']);
            }

            $student->update(['classroom_id' => $request->validated()['classroom_id']]);
        });

        return back()->with('toast', ['type' => 'success', 'message' => 'Berhasil bergabung dengan kelas.']);
    }
}
