<?php

namespace App\Http\Requests\Practice;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JoinClassroomRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && ! $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'classroom_id' => ['required', 'integer', Rule::exists('classrooms', 'id')->where('is_active', true)->whereNotNull('teacher_id')],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['classroom_id.required' => 'Pilih kelas yang diberikan guru.', 'classroom_id.exists' => 'Kelas tidak tersedia untuk bergabung.'];
    }
}
