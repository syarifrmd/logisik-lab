<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teacher = User::firstOrNew(['email' => 'guru@gmail.com']);
        $teacher->name = 'Guru';
        $teacher->password = 'password';
        $teacher->role = UserRole::Admin;
        $teacher->email_verified_at = now();
        $teacher->save();
    }
}
