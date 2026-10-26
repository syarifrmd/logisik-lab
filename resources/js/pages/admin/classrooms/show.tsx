import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronRight,
    Search,
    Settings2,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import InputError from '@/components/input-error';
import PaginationLinks from '@/components/pagination-links';
import StudentProgressBar from '@/components/student-progress-bar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { dashboard } from '@/routes/admin';
import { show, update } from '@/routes/admin/classrooms';
import { store } from '@/routes/admin/classrooms/students';
import { show as showStudent } from '@/routes/admin/students';
import type { Classroom, PageData, StudentSummary } from '@/types/classroom';

type Props = {
    classroom: Classroom;
    students: PageData<StudentSummary>;
    filters: { search: string };
};
const inputClass =
    'min-h-11 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none';

export default function ClassroomShow({ classroom, students, filters }: Props) {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [search, setSearch] = useState(filters.search);
    const enrollment = useForm({ email: '' });
    const settings = useForm({
        name: classroom.name,
        academic_year: classroom.academic_year,
        is_active: classroom.is_active,
    });

    return (
        <AdminLayout title={classroom.name}>
            <div className="space-y-6">
                <Link
                    href={dashboard()}
                    className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke kelas saya
                </Link>
                <section className="rounded-2xl border bg-card p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                                Tahun ajaran {classroom.academic_year}
                            </p>
                            <h1 className="mt-2 text-2xl font-bold break-words">
                                {classroom.name}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Kode kelas{' '}
                                <span className="font-mono font-semibold text-foreground">
                                    {classroom.code}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
                        >
                            <Settings2 className="size-4" />
                            Pengaturan
                        </button>
                    </div>
                    <div className="mt-5 rounded-xl bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
                        {classroom.is_active
                            ? 'Pendaftaran dibuka. Minta siswa memilih nama kelas dan tahun ajaran ini saat mendaftar atau masuk.'
                            : 'Pendaftaran ditutup. Siswa yang sudah terdaftar tetap dapat masuk dan melanjutkan praktik.'}
                    </div>
                </section>
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <section className="min-w-0 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-lg font-bold">Daftar Siswa</h2>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                {students.total} siswa
                            </span>
                        </div>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                router.get(
                                    show.url(classroom.id),
                                    { search },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                            className="flex gap-2"
                        >
                            <div className="relative min-w-0 flex-1">
                                <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
                                <input
                                    aria-label="Cari siswa"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari nama atau email siswa..."
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                            <button className="min-h-11 rounded-xl border bg-card px-4 text-sm">
                                Cari
                            </button>
                        </form>
                        {students.data.length === 0 ? (
                            <div className="rounded-2xl border border-dashed bg-card px-5 py-12 text-center">
                                <Users className="mx-auto mb-3 size-9 text-primary/50" />
                                <p className="font-semibold">
                                    {filters.search
                                        ? 'Siswa tidak ditemukan'
                                        : 'Belum ada siswa di kelas ini'}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {filters.search
                                        ? 'Coba nama atau email lain.'
                                        : 'Siswa akan muncul setelah memilih kelas saat mendaftar. Tambahkan akun siswa yang sudah ada melalui email.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {students.data.map((student) => (
                                    <Link
                                        href={showStudent(student.id)}
                                        key={student.id}
                                        className="block rounded-2xl border bg-card p-4 transition hover:border-primary/40 sm:p-5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                {student.name
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold break-words">
                                                    {student.name}
                                                </h3>
                                                <p className="mt-0.5 text-xs break-all text-muted-foreground">
                                                    {student.email}
                                                </p>
                                            </div>
                                            <ChevronRight className="size-5 shrink-0 text-primary" />
                                        </div>
                                        <div className="mt-4">
                                            <StudentProgressBar
                                                progress={student.progress}
                                            />
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span>
                                                {student.progress.product_count}{' '}
                                                barang
                                            </span>
                                            <span>
                                                {student.progress
                                                    .inbound_count +
                                                    student.progress
                                                        .outbound_count}{' '}
                                                transaksi aktif
                                            </span>
                                            <span>
                                                {
                                                    student.progress
                                                        .shipment_count
                                                }{' '}
                                                pengiriman
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[11px] text-muted-foreground">
                                            Aktivitas terakhir:{' '}
                                            {student.progress.last_activity_at
                                                ? new Date(
                                                      student.progress
                                                          .last_activity_at,
                                                  ).toLocaleString('id-ID', {
                                                      dateStyle: 'medium',
                                                      timeStyle: 'short',
                                                  })
                                                : 'Belum ada aktivitas'}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                        <PaginationLinks page={students} />
                    </section>
                    <aside className="space-y-4">
                        <div className="rounded-2xl border bg-card p-5">
                            <UserPlus className="mb-3 size-6 text-primary" />
                            <h2 className="font-bold">Tambahkan Siswa</h2>
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                Masukkan email akun siswa lama yang belum punya
                                kelas, atau pindahkan siswa dari kelas lain yang
                                Anda kelola.
                            </p>
                            <form
                                className="mt-4 space-y-3"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    enrollment.post(store.url(classroom.id), {
                                        preserveScroll: true,
                                        onSuccess: () => enrollment.reset(),
                                    });
                                }}
                            >
                                <label
                                    htmlFor="student-email"
                                    className="text-xs font-medium"
                                >
                                    Email siswa
                                </label>
                                <input
                                    id="student-email"
                                    type="email"
                                    required
                                    value={enrollment.data.email}
                                    onChange={(event) =>
                                        enrollment.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="siswa@sekolah.sch.id"
                                    className={inputClass}
                                    disabled={!classroom.is_active}
                                />
                                <InputError message={enrollment.errors.email} />
                                <button
                                    disabled={
                                        enrollment.processing ||
                                        !classroom.is_active
                                    }
                                    className="min-h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
                                >
                                    Tambahkan ke Kelas
                                </button>
                            </form>
                        </div>
                        <div className="rounded-2xl bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
                            <strong className="block text-foreground">
                                Tentang progres praktik
                            </strong>
                            <p className="mt-2">
                                Progres menunjukkan lima langkah aktivitas yang
                                sudah dikerjakan. Angka ini membantu
                                pendampingan dan bukan nilai akhir siswa.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="max-h-[85svh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Pengaturan Kelas</DialogTitle>
                        <DialogDescription>
                            Menutup pendaftaran tidak menghapus siswa atau hasil
                            praktik.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            settings.patch(update.url(classroom.id), {
                                preserveScroll: true,
                                onSuccess: () => setSettingsOpen(false),
                            });
                        }}
                    >
                        <div className="space-y-2">
                            <label
                                htmlFor="edit-class-name"
                                className="text-sm font-medium"
                            >
                                Nama kelas
                            </label>
                            <input
                                id="edit-class-name"
                                required
                                maxLength={100}
                                value={settings.data.name}
                                onChange={(event) =>
                                    settings.setData('name', event.target.value)
                                }
                                className={inputClass}
                            />
                            <InputError message={settings.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="edit-class-year"
                                className="text-sm font-medium"
                            >
                                Tahun ajaran
                            </label>
                            <input
                                id="edit-class-year"
                                required
                                value={settings.data.academic_year}
                                onChange={(event) =>
                                    settings.setData(
                                        'academic_year',
                                        event.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                            <InputError
                                message={settings.errors.academic_year}
                            />
                        </div>
                        <label className="flex min-h-11 items-center gap-3 text-sm">
                            <input
                                type="checkbox"
                                checked={settings.data.is_active}
                                onChange={(event) =>
                                    settings.setData(
                                        'is_active',
                                        event.target.checked,
                                    )
                                }
                                className="size-4 accent-primary"
                            />
                            Buka pendaftaran siswa
                        </label>
                        <InputError message={settings.errors.is_active} />
                        <button
                            disabled={settings.processing}
                            className="min-h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
                        >
                            Simpan Pengaturan
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
