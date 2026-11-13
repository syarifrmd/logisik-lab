import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import ResetProgress from '@/components/reset-progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    flash?: {
        resetProgress?: boolean;
    };
};

export default function Profile() {
    const { auth, flash } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Pengaturan Profil" />

            <h1 className="sr-only">Pengaturan Profil</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={
                        auth.user.role === 'admin'
                            ? 'Profil Guru'
                            : 'Profil Siswa'
                    }
                    description="Perbarui nama lengkap dan alamat email akun Anda"
                />

                <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                    <p className="font-semibold">
                        {auth.user.role === 'admin'
                            ? 'Admin (Guru)'
                            : 'User (Siswa)'}
                    </p>
                    {auth.user.role === 'student' && (
                        <p className="mt-1 text-muted-foreground">
                            Kelas:{' '}
                            {auth.user.classroom
                                ? `${auth.user.classroom.name} · ${auth.user.classroom.academic_year}`
                                : 'Belum bergabung kelas'}
                        </p>
                    )}
                </div>

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Lengkap</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Nama siswa"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Alamat Email</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="nama@sekolah.sch.id"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
            {auth.user.role === 'student' && (
                <ResetProgress showSuccess={flash?.resetProgress} />
            )}
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Profil',
            href: edit(),
        },
    ],
};
