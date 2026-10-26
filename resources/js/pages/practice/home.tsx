import { Link } from '@inertiajs/react';
import StudentClassroomCard from '@/components/student-classroom-card';
import type { Classroom } from '@/types/classroom';
import { Package, ArrowDownToLine, ArrowUpFromLine, Boxes } from 'lucide-react';
import PracticeLayout from '@/layouts/practice/practice-layout';

type Stats = {
    product_count: number;
    total_inbound: number;
    total_outbound: number;
    total_stock_good: number;
    total_stock_damaged: number;
    total_stock_physical: number;
};

type Props = {
    stats: Stats;
    classrooms: Classroom[];
};

export default function PracticeHome({ stats, classrooms }: Props) {
    const statCards = [
        {
            label: 'Jumlah Barang',
            value: stats.product_count,
            sublabel: 'SKU aktif',
            icon: Package,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Total Barang Masuk',
            value: stats.total_inbound,
            sublabel: 'unit masuk',
            icon: ArrowDownToLine,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
        },
        {
            label: 'Total Barang Keluar',
            value: stats.total_outbound,
            sublabel: 'unit keluar',
            icon: ArrowUpFromLine,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            label: 'Total Stok',
            value: stats.total_stock_physical,
            sublabel: `Baik ${stats.total_stock_good} / Rusak ${stats.total_stock_damaged}`,
            icon: Boxes,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
        },
    ];

    const quickActions = [
        { label: 'Data Barang', href: '/praktik/barang', icon: Package },
        {
            label: 'Barang Masuk',
            href: '/praktik/barang-masuk',
            icon: ArrowDownToLine,
        },
        {
            label: 'Barang Keluar',
            href: '/praktik/barang-keluar',
            icon: ArrowUpFromLine,
        },
    ];

    return (
        <PracticeLayout title="Beranda">
            <div className="space-y-6">
                <StudentClassroomCard classrooms={classrooms} />
                {/* Welcome */}
                <div className="rounded-xl bg-card p-5 shadow-sm">
                    <h1 className="text-xl font-bold text-foreground">
                        Selamat Datang di LOGISTIK LAB
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Latih keterampilanmu dalam pencatatan dan pengelolaan
                        barang, mulai dari gudang hingga pengiriman.
                    </p>
                    <div className="mt-3 rounded-lg bg-primary/5 px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                            Hasil praktik tersimpan di akunmu dan dapat
                            dilanjutkan dari perangkat lain.
                        </p>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="rounded-xl bg-card p-4 shadow-sm"
                            >
                                <div
                                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}
                                >
                                    <Icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {card.value}
                                </p>
                                <p className="text-xs font-medium text-foreground">
                                    {card.label}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {card.sublabel}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Quick actions */}
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                        Akses Cepat
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="flex flex-col items-center gap-2 rounded-xl bg-card p-4 shadow-sm transition-colors hover:bg-accent"
                                >
                                    <Icon className="h-6 w-6 text-primary" />
                                    <span className="text-center text-xs font-medium">
                                        {action.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PracticeLayout>
    );
}
