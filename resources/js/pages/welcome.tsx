import { Head, Link, usePage } from '@inertiajs/react';
import { Boxes, ArrowRight, Truck, FileSpreadsheet } from 'lucide-react';
import { dashboard } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;
    const continueLabel =
        auth?.user?.role === 'admin'
            ? 'Buka Dashboard Guru'
            : 'Lanjutkan Praktik';

    const features = [
        {
            icon: Boxes,
            label: 'Kelola Barang & Stok',
            desc: 'Catat barang masuk dan keluar dengan akurat',
        },
        {
            icon: Truck,
            label: 'Transportasi & Pengiriman',
            desc: 'Kelola moda, muatan, jadwal, dan dokumen',
        },
        {
            icon: FileSpreadsheet,
            label: 'Laporan & Barcode',
            desc: 'Unduh laporan Excel dan buat barcode',
        },
    ];

    return (
        <>
            <Head title="AS LogiEdu" />
            <div className="flex min-h-screen flex-col bg-slate-50">
                <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
                    <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
                        <img src="/images/logo.png" alt="" className="size-9 rounded-xl object-cover" />
                        AS LogiEdu
                    </span>
                    {isLoggedIn ? (
                        <Link
                            href={dashboard()}
                            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            {continueLabel}
                        </Link>
                    ) : (
                        <div className="flex gap-3">
                            <Link
                                href="/login"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}
                </header>

                <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-14">
                    <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
                        <section>
                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                                Platform praktik logistik
                            </p>
                            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
                                Belajar mengelola barang dengan cara yang nyata.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                                AS LogiEdu membantu siswa mencatat stok, mengikuti
                                alur pengiriman, dan menyelesaikan praktik dengan
                                data yang rapi.
                            </p>
                            <Link
                                href={isLoggedIn ? dashboard() : '/register'}
                                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                            >
                                {isLoggedIn ? continueLabel : 'Mulai Praktik'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </section>
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                                <img src="/images/logo.png" alt="" className="size-12 rounded-2xl object-cover" />
                                <div>
                                    <p className="font-semibold text-slate-900">Ruang praktik</p>
                                    <p className="text-sm text-slate-500">Satu tempat untuk seluruh alur logistik</p>
                                </div>
                            </div>
                            <div className="mt-5 space-y-3">
                                {features.map((feature) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div key={feature.label} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                                            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900">{feature.label}</h3>
                                                <p className="mt-1 text-xs leading-5 text-slate-500">{feature.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                </main>

                <footer className="mx-auto w-full max-w-6xl px-6 py-6 text-xs text-slate-500">
                    AS LogiEdu · Media pembelajaran manajemen logistik
                </footer>
            </div>
        </>
    );
}
