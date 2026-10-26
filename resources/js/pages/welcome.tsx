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
            <Head title="LOGISTIK LAB" />
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 via-white to-teal-50">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4">
                    <span className="text-lg font-bold tracking-tight text-primary">
                        LOGISTIK LAB
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

                {/* Hero */}
                <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                        <Boxes className="h-10 w-10 text-primary" />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Selamat Datang di LOGISTIK LAB
                    </h1>
                    <p className="mt-2 text-lg font-medium text-primary/80">
                        Website Praktik Manajemen Logistik
                    </p>
                    <p className="mt-4 max-w-lg text-sm text-muted-foreground">
                        Latih keterampilanmu dalam pencatatan dan pengelolaan
                        barang, mulai dari gudang hingga pengiriman.
                    </p>

                    <Link
                        href={isLoggedIn ? dashboard() : '/register'}
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
                    >
                        {isLoggedIn ? continueLabel : 'Mulai Praktik'}
                        <ArrowRight className="h-5 w-5" />
                    </Link>

                    {!isLoggedIn && (
                        <p className="mt-3 text-xs text-muted-foreground">
                            Belum punya akun?{' '}
                            <Link
                                href="/register"
                                className="font-medium text-primary underline underline-offset-2"
                            >
                                Daftar di sini
                            </Link>
                        </p>
                    )}

                    {/* Features */}
                    <div className="mt-12 grid w-full gap-4 sm:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.label}
                                    className="rounded-xl bg-card p-5 text-left shadow-sm"
                                >
                                    <Icon className="mb-3 h-7 w-7 text-primary" />
                                    <h3 className="text-sm font-semibold text-foreground">
                                        {feature.label}
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {feature.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <p className="mt-8 text-xs text-muted-foreground">
                        Hasil praktik tersimpan di akunmu dan dapat dilanjutkan
                        dari perangkat lain.
                    </p>
                </main>

                <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
                    LOGISTIK LAB &middot; Media Pembelajaran Manajemen Logistik
                </footer>
            </div>
        </>
    );
}
