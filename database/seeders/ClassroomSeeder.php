<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClassroomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teacher = User::where('role', UserRole::Admin)->first();
        if ($teacher !== null) {
            $year = now()->month >= 7 ? now()->year : now()->year - 1;
            $teacher->teachingClassrooms()->firstOrCreate(['name' => 'Kelas Praktik', 'academic_year' => $year.'/'.($year + 1)]);
        }
    }
}
