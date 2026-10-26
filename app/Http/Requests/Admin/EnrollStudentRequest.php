<?php

namespace App\Http\Requests\Admin;

use App\Models\Classroom;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class EnrollStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $classroom = $this->route('classroom');
        abort_unless($classroom instanceof Classroom && $classroom->teacher_id === $this->user()?->id, 404);

        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['email' => $this->string('email')->lower()->trim()->toString()]);
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['email.required' => 'Email siswa wajib diisi.', 'email.email' => 'Masukkan email siswa yang valid.'];
    }
}
