import { Link, usePage } from '@inertiajs/react';
import StudentClassroomCard from '@/components/student-classroom-card';
import type { Classroom } from '@/types/classroom';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Boxes,
    ChevronRight,
    Package,
} from 'lucide-react';
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
    const { auth } = usePage().props;
    const statCards = [
        {
            label: 'Jumlah Barang',
            value: stats.product_count,
            sublabel: 'SKU aktif',
            icon: Package,
        },
        {
            label: 'Total Barang Masuk',
            value: stats.total_inbound,
            sublabel: 'unit masuk',
            icon: ArrowDownToLine,
        },
        {
            label: 'Total Barang Keluar',
            value: stats.total_outbound,
            sublabel: 'unit keluar',
            icon: ArrowUpFromLine,
        },
        {
            label: 'Total Stok',
            value: stats.total_stock_physical,
            sublabel: `Baik ${stats.total_stock_good} / Rusak ${stats.total_stock_damaged}`,
            icon: Boxes,
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
            <div className="space-y-5">
                <header className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            Beranda praktik
                        </p>
                        <h1 className="mt-1 text-xl font-bold tracking-tight">
                            Halo, {auth.user.name}
                        </h1>
                    </div>
                    <img
                        src="/images/logo.png"
                        alt="AS LogiEdu"
                        className="size-10 rounded-xl object-cover"
                    />
                </header>
                <StudentClassroomCard classrooms={classrooms} />
                <section className="overflow-hidden rounded-2xl border bg-card">
                    <div className="border-b px-4 py-3">
                        <h2 className="text-sm font-semibold">Ringkasan stok</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Kondisi data praktik saat ini
                        </p>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-y">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className="p-4">
                                <Icon className="mb-3 size-4 text-primary" />
                                <p className="text-2xl font-bold">
                                    {card.value}
                                </p>
                                <p className="mt-1 text-xs font-medium">
                                    {card.label}
                                </p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    {card.sublabel}
                                </p>
                            </div>
                        );
                    })}
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border bg-card">
                    <div className="border-b px-4 py-3">
                        <h2 className="text-sm font-semibold">Mulai dari sini</h2>
                    </div>
                    <div className="divide-y">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="flex min-h-14 items-center gap-3 px-4 transition-colors hover:bg-muted/60"
                                >
                                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Icon className="size-4" />
                                    </span>
                                    <span className="flex-1 text-sm font-medium">{action.label}</span>
                                    <ChevronRight className="size-4 text-muted-foreground" />
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </PracticeLayout>
    );
}
