<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EnrollStudentRequest;
use App\Models\Classroom;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\StockTransaction;
use App\Models\User;
use App\Services\StudentProgressService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function store(EnrollStudentRequest $request, Classroom $classroom): RedirectResponse
    {
        if (! $classroom->is_active) {
            throw ValidationException::withMessages(['email' => 'Aktifkan kelas sebelum menambahkan siswa.']);
        }

        DB::transaction(function () use ($request, $classroom): void {
            $student = User::where('role', UserRole::Student)->where('email', $request->validated()['email'])
                ->where(fn ($query) => $query->whereNull('classroom_id')->orWhereHas('classroom', fn ($owned) => $owned->where('teacher_id', $request->user()->id)))
                ->lockForUpdate()->first();

            if ($student === null) {
                throw ValidationException::withMessages(['email' => 'Akun siswa tidak ditemukan atau sudah terdaftar di kelas guru lain.']);
            }

            $student->update(['classroom_id' => $classroom->id]);
        });

        return back()->with('toast', ['type' => 'success', 'message' => 'Siswa berhasil ditambahkan ke kelas.']);
    }

    public function show(Request $request, User $student, StudentProgressService $progress): Response
    {
        abort_unless($student->role === UserRole::Student && $student->classroom?->teacher_id === $request->user()->id, 404);
        $student = $progress->withProgress(User::whereKey($student->id))->firstOrFail();
        $tab = $request->string('tab', 'products')->toString();
        if (! in_array($tab, ['products', 'inbound', 'outbound', 'shipments'], true)) {
            $tab = 'products';
        }
        $search = $request->string('search')->trim()->toString();
        $workspaceId = $student->workspace?->id;

        if ($tab === 'products') {
            $records = Product::where('workspace_id', $workspaceId)
                ->when($search, fn ($query) => $query->where(fn ($names) => $names->where('name', 'like', '%'.$search.'%')->orWhere('code', 'like', '%'.$search.'%')))
                ->orderBy('name')->paginate(12, ['id', 'code', 'name', 'category', 'base_unit', 'stock_good', 'stock_damaged', 'cost_price', 'selling_price', 'archived_at'])->withQueryString();
        } elseif ($tab === 'shipments') {
            $records = Shipment::where('workspace_id', $workspaceId)->with('items')
                ->when($search, fn ($query) => $query->where(fn ($names) => $names->where('shipment_number', 'like', '%'.$search.'%')->orWhere('destination', 'like', '%'.$search.'%')))
                ->latest()->paginate(12)->withQueryString()
                ->through(fn (Shipment $shipment) => $shipment->makeHidden(['idempotency_key', 'workspace_id']));
        } else {
            $records = StockTransaction::where('workspace_id', $workspaceId)->where('type', $tab)
                ->when($search, fn ($query) => $query->where(fn ($names) => $names->where('transaction_number', 'like', '%'.$search.'%')->orWhere('external_document_number', 'like', '%'.$search.'%')))
                ->latest()->paginate(12)->withQueryString()
                ->through(fn (StockTransaction $transaction) => [...$transaction->makeHidden(['idempotency_key', 'request_hash', 'workspace_id'])->toArray(), 'product_snapshot' => $transaction->product_snapshot]);
        }

        return Inertia::render('admin/students/show', [
            'student' => $student->only(['id', 'name', 'email', 'created_at']),
            'classroom' => $student->classroom,
            'progress' => $progress->summarize($student),
            'records' => $records,
            'filters' => ['tab' => $tab, 'search' => $search],
        ]);
    }
}
