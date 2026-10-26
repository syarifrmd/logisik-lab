<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\PracticeWorkspace;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'classroom_id' => ['required', 'integer', Rule::exists('classrooms', 'id')->where('is_active', true)->whereNotNull('teacher_id')],
        ], [
            'classroom_id.required' => 'Pilih kelas yang diberikan guru.',
            'classroom_id.exists' => 'Kelas tidak tersedia untuk pendaftaran.',
        ])->validate();

        return DB::transaction(function () use ($input): User {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'classroom_id' => $input['classroom_id'],
            ]);

            // Create the practice workspace atomically with the user
            PracticeWorkspace::create([
                'user_id' => $user->id,
                'last_activity_at' => now(),
            ]);

            return $user;
        });
    }
}
