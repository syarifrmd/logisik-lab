<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

#[Signature('app:make-teacher {email : Email akun guru} {--name=Guru : Nama untuk akun baru}')]
#[Description('Siapkan akun admin/guru dan kelas praktik pertama tanpa mengganti sandi akun yang sudah ada')]
class MakeTeacher extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');
        $name = $this->option('name');
        if (! is_string($email) || ! is_string($name)) {
            $this->error('Email dan nama guru harus berupa teks.');

            return self::FAILURE;
        }
        $email = Str::lower(trim($email));
        $validator = Validator::make(['email' => $email, 'name' => $name], ['email' => ['required', 'email'], 'name' => ['required', 'string', 'max:255']]);
        if ($validator->fails()) {
            $this->error($validator->errors()->first());

            return self::FAILURE;
        }
        $password = null;

        DB::transaction(function () use ($email, $name, &$password): void {
            $teacher = User::firstOrNew(['email' => $email]);
            if (! $teacher->exists) {
                $password = Str::password(18);
                $teacher->name = $name;
                $teacher->password = $password;
            }
            $teacher->role = UserRole::Admin;
            $teacher->classroom_id = null;
            $teacher->save();

            if (! $teacher->teachingClassrooms()->exists()) {
                $year = now()->month >= 7 ? now()->year : now()->year - 1;
                $teacher->teachingClassrooms()->create(['name' => 'Kelas Praktik', 'academic_year' => $year.'/'.($year + 1)]);
            }
        });

        $this->info('Akun Admin (Guru) siap: '.$email);
        if ($password !== null) {
            $this->line('Kata sandi awal: '.$password);
            $this->comment('Simpan kata sandi ini dan ubah melalui pengaturan akun setelah masuk.');
        } else {
            $this->comment('Gunakan kata sandi akun yang sudah ada.');
        }

        return self::SUCCESS;
    }
}
