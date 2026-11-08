import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import ClassroomSelect from '@/components/classroom-select';
import type { Classroom } from '@/types/classroom';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    classrooms: Classroom[];
};

export default function Login({ status, canResetPassword, classrooms }: Props) {
    const [role, setRole] = useState<'student' | 'admin'>('student');
    return (
        <>
            <Head title="Masuk" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div
                                className="grid grid-cols-2 gap-2"
                                aria-label="Peran akun"
                            >
                                {(
                                    [
                                        {
                                            value: 'student',
                                            label: 'Siswa',
                                            icon: GraduationCap,
                                        },
                                        {
                                            value: 'admin',
                                            label: 'Admin (Guru)',
                                            icon: ShieldCheck,
                                        },
                                    ] as const
                                ).map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={role === option.value}
                                        onClick={() => setRole(option.value)}
                                        className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-2 py-3 text-sm font-semibold ${role === option.value ? 'border-primary bg-primary/10 text-primary' : 'border-input text-muted-foreground'}`}
                                    >
                                        <option.icon className="size-4" />
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="hidden"
                                name="login_role"
                                value={role}
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="email">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {role === 'student' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="classroom_id">Kelas</Label>
                                    <ClassroomSelect
                                        classrooms={classrooms}
                                        allowUnassigned
                                    />
                                    <InputError message={errors.classroom_id} />
                                    <p className="text-xs text-muted-foreground">
                                        Pilih kelas yang sama dengan kelas saat
                                        mendaftar.
                                    </p>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Kata Sandi</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder="Kata Sandi"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" />
                                <Label htmlFor="remember">Ingat saya</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Belum punya akun?{' '}
                            <TextLink href={register()}>
                                Daftar di sini
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Masuk ke AS LogiEdu',
    description: 'Pilih peran untuk melanjutkan pembelajaran logistik',
};
