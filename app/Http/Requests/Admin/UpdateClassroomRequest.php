<?php

namespace App\Http\Requests\Admin;

use App\Models\Classroom;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class UpdateClassroomRequest extends StoreClassroomRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $classroom = $this->route('classroom');
        abort_unless($classroom instanceof Classroom && $classroom->teacher_id === $this->user()?->id, 404);

        return parent::authorize();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();
        $academicYear = $this->input('academic_year');
        $rules['name'] = ['bail', 'required', 'string', 'max:100', Rule::unique('classrooms')->where('teacher_id', $this->user()?->id)->where('academic_year', is_string($academicYear) ? $academicYear : null)->ignore($this->route('classroom'))];

        return $rules;
    }
}
