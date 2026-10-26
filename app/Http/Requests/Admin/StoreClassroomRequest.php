<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassroomRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $academicYear = $this->input('academic_year');

        return [
            'name' => ['bail', 'required', 'string', 'max:100', Rule::unique('classrooms')->where('teacher_id', $this->user()?->id)->where('academic_year', is_string($academicYear) ? $academicYear : null)],
            'academic_year' => ['bail', 'required', 'string', 'regex:/^\d{4}\/\d{4}$/', function (string $attribute, mixed $value, \Closure $fail): void {
                if (is_string($value) && preg_match('/^(\d{4})\/(\d{4})$/', $value, $years) && (int) $years[2] !== (int) $years[1] + 1) {
                    $fail('Tahun ajaran harus berurutan, misalnya 2026/2027.');
                }
            }],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['name.required' => 'Nama kelas wajib diisi.', 'name.unique' => 'Nama kelas sudah digunakan pada tahun ajaran ini.', 'academic_year.required' => 'Tahun ajaran wajib diisi.', 'academic_year.regex' => 'Gunakan format tahun ajaran 2026/2027.'];
    }
}
