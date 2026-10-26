import { Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    GraduationCap,
    Plus,
    Search,
    Users,
    Activity,
    Boxes,
} from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import InputError from '@/components/input-error';
import PaginationLinks from '@/components/pagination-links';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { dashboard } from '@/routes/admin';
import { show, store } from '@/routes/admin/classrooms';
import type { Classroom, PageData } from '@/types/classroom';

type Props = {
    classrooms: PageData<Classroom>;
    stats: {
        classroom_count: number;
        student_count: number;
        active_today: number;
        started_count: number;
    };
    filters: { search: string };
};
const inputClass =
    'min-h-11 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none';

export default function Dashboard({ classrooms, stats, filters }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [search, setSearch] = useState(filters.search);
    const now = new Date();
    const year =
        now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const form = useForm({ name: '', academic_year: `${year}/${year + 1}` });
    const cards = [
        {
            label: 'Kelas dikelola',
            value: stats.classroom_count,
            icon: BookOpen,
        },
        { label: 'Siswa terdaftar', value: stats.student_count, icon: Users },
        { label: 'Aktif hari ini', value: stats.active_today, icon: Activity },
        {
            label: 'Sudah mengisi barang',
            value: stats.started_count,
            icon: Boxes,
        },
    ];

    return (
        <AdminLayout title="Dashboard Guru">
            <div className="space-y-7">
                <section className="rounded-2xl border border-primary/15 bg-primary/5 p-5 sm:p-7">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary">
                        <GraduationCap className="size-3.5" />
                        Admin (Guru)
                    </span>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                        Pembelajaran logistik, dalam pantauan.
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Kelola kelas, lihat aktivitas siswa, dan temukan langkah
                        praktik yang masih perlu didampingi.
                    </p>
                </section>
                <section
                    aria-label="Ringkasan pembelajaran"
                    className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                >
                    {cards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl border bg-card p-4 sm:p-5"
                        >
                            <card.icon className="mb-3 size-5 text-primary" />
                            <p className="text-2xl font-bold">{card.value}</p>
                            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                {card.label}
                            </p>
                        </div>
                    ))}
                </section>
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold">Kelas Saya</h2>
                            <p className="text-xs text-muted-foreground">
                                Setiap kelas memiliki daftar siswa dan
                                progresnya sendiri.
                            </p>
                        </div>
                        <button
                            onClick={() => setCreateOpen(true)}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                        >
                            <Plus className="size-4" />
                            Buat Kelas
                        </button>
                    </div>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                dashboard.url(),
                                { search },
                                { preserveState: true, preserveScroll: true },
                            );
                        }}
                        className="flex gap-2"
                    >
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
                            <input
                                aria-label="Cari nama kelas"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari nama kelas..."
                                className={`${inputClass} pl-10`}
                            />
                        </div>
                        <button className="min-h-11 rounded-xl border bg-card px-4 text-sm">
                            Cari
                        </button>
                    </form>
                    {classrooms.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-card px-5 py-12 text-center">
                            <BookOpen className="mx-auto mb-3 size-9 text-primary/50" />
                            <h3 className="font-semibold">
                                {filters.search
                                    ? 'Kelas tidak ditemukan'
                                    : 'Kelas pertama dimulai di sini'}
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                                {filters.search
                                    ? 'Coba kata kunci lain untuk mencari kelas.'
                                    : 'Buat kelas, lalu minta siswa memilih kelas tersebut saat mendaftar. Akun siswa lama juga dapat ditambahkan melalui email.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {classrooms.data.map((classroom) => (
                                <Link
                                    key={classroom.id}
                                    href={show(classroom.id)}
                                    className="group rounded-2xl border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="rounded-lg bg-primary/10 p-2.5 text-primary">
                                            <BookOpen className="size-5" />
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${classroom.is_active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}
                                        >
                                            {classroom.is_active
                                                ? 'Pendaftaran dibuka'
                                                : 'Pendaftaran ditutup'}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-lg font-bold break-words">
                                        {classroom.name}
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Tahun ajaran {classroom.academic_year} ·{' '}
                                        {classroom.code}
                                    </p>
                                    <div className="mt-5 flex items-end justify-between gap-2 border-t pt-4">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {classroom.students_count} siswa
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {
                                                    classroom.active_students_count
                                                }{' '}
                                                aktif hari ini
                                            </p>
                                        </div>
                                        <ChevronRight className="size-5 text-primary transition group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <PaginationLinks page={classrooms} />
                </section>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-h-[85svh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Buat Kelas Baru</DialogTitle>
                        <DialogDescription>
                            Siswa dapat memilih kelas ini saat membuat akun.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post(store.url(), {
                                onSuccess: () => {
                                    setCreateOpen(false);
                                    form.reset();
                                },
                            });
                        }}
                    >
                        <div className="space-y-2">
                            <label
                                htmlFor="class-name"
                                className="text-sm font-medium"
                            >
                                Nama kelas
                            </label>
                            <input
                                id="class-name"
                                autoFocus
                                required
                                maxLength={100}
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                placeholder="Contoh: XI Logistik 1"
                                className={inputClass}
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="academic-year"
                                className="text-sm font-medium"
                            >
                                Tahun ajaran
                            </label>
                            <input
                                id="academic-year"
                                required
                                value={form.data.academic_year}
                                onChange={(event) =>
                                    form.setData(
                                        'academic_year',
                                        event.target.value,
                                    )
                                }
                                placeholder="2026/2027"
                                className={inputClass}
                            />
                            <InputError message={form.errors.academic_year} />
                        </div>
                        <button
                            disabled={form.processing}
                            className="min-h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                        >
                            {form.processing
                                ? 'Membuat kelas...'
                                : 'Buat Kelas'}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
