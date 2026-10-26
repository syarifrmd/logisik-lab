import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowDownToLine,
    ArrowUpFromLine,
    Boxes,
    CheckCircle2,
    Circle,
    Package,
    Search,
    Truck,
} from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import PaginationLinks from '@/components/pagination-links';
import StudentProgressBar from '@/components/student-progress-bar';
import { show as showClassroom } from '@/routes/admin/classrooms';
import { show } from '@/routes/admin/students';
import { formatDate, formatRp } from '@/lib/format';
import type { Product, Shipment, StockTransaction } from '@/types';
import type { Classroom, PageData, StudentProgress } from '@/types/classroom';

type Transaction = StockTransaction & {
    product_snapshot: { name?: string; code?: string; base_unit?: string };
};
type RecordItem = Product | Transaction | Shipment;
type Tab = 'products' | 'inbound' | 'outbound' | 'shipments';
type Props = {
    student: { id: number; name: string; email: string; created_at: string };
    classroom: Classroom;
    progress: StudentProgress;
    records: PageData<RecordItem>;
    filters: { tab: Tab; search: string };
};
const tabs = [
    { key: 'products', label: 'Barang & Stok', icon: Package },
    { key: 'inbound', label: 'Barang Masuk', icon: ArrowDownToLine },
    { key: 'outbound', label: 'Barang Keluar', icon: ArrowUpFromLine },
    { key: 'shipments', label: 'Pengiriman', icon: Truck },
] as const;
const statusLabels: Record<string, string> = {
    scheduled: 'Dijadwalkan',
    shipped: 'Dikirim',
    in_transit: 'Di perjalanan',
    received: 'Diterima',
    cancelled: 'Dibatalkan',
    domestic: 'Domestik',
    export: 'Ekspor',
    import: 'Impor',
    land: 'Darat',
    sea: 'Laut',
    air: 'Udara',
};

function RecordCard({ record }: { record: RecordItem }) {
    if ('stock_good' in record)
        return (
            <article className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                        <span className="font-mono text-xs text-muted-foreground">
                            {record.code}
                        </span>
                        <h3 className="mt-1 font-semibold break-words">
                            {record.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {record.category}
                            {record.archived_at ? ' · Diarsipkan' : ''}
                        </p>
                    </div>
                    <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
                        {record.stock_good + record.stock_damaged}{' '}
                        {record.base_unit}
                    </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3 text-xs">
                    <p>
                        Baik{' '}
                        <strong className="ml-1">{record.stock_good}</strong>
                    </p>
                    <p>
                        Rusak{' '}
                        <strong className="ml-1">{record.stock_damaged}</strong>
                    </p>
                    <p>
                        Harga pokok
                        <br />
                        <strong>{formatRp(record.cost_price)}</strong>
                    </p>
                    <p>
                        Harga jual
                        <br />
                        <strong>{formatRp(record.selling_price)}</strong>
                    </p>
                </div>
            </article>
        );
    if ('shipment_number' in record)
        return (
            <article className="rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-mono text-sm font-bold">
                        {record.shipment_number}
                    </h3>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {statusLabels[record.status]}
                    </span>
                </div>
                <p className="mt-3 text-sm font-semibold break-words">
                    {record.origin} → {record.destination}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {statusLabels[record.shipment_type]} ·{' '}
                    {statusLabels[record.transport_mode]} · {record.fleet_type}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <dt className="text-muted-foreground">Tanggal kirim</dt>
                        <dd className="mt-1 font-medium">
                            {formatDate(record.shipping_date)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">
                            Estimasi biaya
                        </dt>
                        <dd className="mt-1 font-medium">
                            {formatRp(record.estimated_cost)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Estimasi tiba</dt>
                        <dd className="mt-1 font-medium">
                            {formatDate(record.estimated_arrival_date)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">
                            Tanggal diterima
                        </dt>
                        <dd className="mt-1 font-medium">
                            {record.received_date
                                ? formatDate(record.received_date)
                                : 'Belum diterima'}
                        </dd>
                    </div>
                </dl>
                <details className="mt-4 border-t pt-3 text-xs">
                    <summary className="min-h-8 cursor-pointer font-semibold text-primary">
                        Rincian muatan & penanganan
                    </summary>
                    <ul className="mt-2 space-y-2">
                        {record.items?.map((item) => (
                            <li key={item.id}>
                                {item.product_name_snapshot} · {item.quantity}{' '}
                                {item.base_unit_snapshot}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 text-muted-foreground">
                        {record.handling_instructions}
                    </p>
                    {record.special_notes && (
                        <p className="mt-2">{record.special_notes}</p>
                    )}
                    {record.cancellation_reason && (
                        <p className="mt-2 text-destructive">
                            Alasan pembatalan: {record.cancellation_reason}
                        </p>
                    )}
                </details>
            </article>
        );
    return (
        <article className="rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-sm font-bold">
                    {record.transaction_number}
                </h3>
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${record.voided_at ? 'bg-muted text-muted-foreground' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'}`}
                >
                    {record.voided_at ? 'Dibatalkan' : 'Aktif'}
                </span>
            </div>
            <h4 className="mt-3 font-semibold">
                {record.product_snapshot.name ?? 'Barang'}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(record.transaction_date)} · Kondisi{' '}
                {record.stock_condition === 'good' ? 'baik' : 'rusak'}
            </p>
            <div className="mt-4 flex flex-wrap justify-between gap-3 rounded-xl bg-muted/40 p-3 text-sm">
                <strong>
                    {record.type === 'inbound' ? '+' : '−'}
                    {record.quantity} {record.product_snapshot.base_unit}
                </strong>
                <strong>{formatRp(record.total_amount)}</strong>
            </div>
            <details className="mt-3 border-t pt-3 text-xs">
                <summary className="min-h-8 cursor-pointer font-semibold text-primary">
                    Rincian transaksi
                </summary>
                <dl className="mt-2 space-y-2">
                    <div>
                        <dt className="text-muted-foreground">Dokumen</dt>
                        <dd>{record.external_document_number ?? '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">
                            {record.type === 'inbound' ? 'Pemasok' : 'Penerima'}
                        </dt>
                        <dd>{record.supplier ?? record.recipient ?? '—'}</dd>
                    </div>
                    {record.storage_location && (
                        <div>
                            <dt className="text-muted-foreground">
                                Lokasi penyimpanan
                            </dt>
                            <dd>{record.storage_location}</dd>
                        </div>
                    )}
                    {record.notes && (
                        <div>
                            <dt className="text-muted-foreground">Catatan</dt>
                            <dd>{record.notes}</dd>
                        </div>
                    )}
                    {record.void_reason && (
                        <div>
                            <dt className="text-muted-foreground">
                                Alasan pembatalan
                            </dt>
                            <dd>{record.void_reason}</dd>
                        </div>
                    )}
                </dl>
            </details>
        </article>
    );
}

export default function StudentShow({
    student,
    classroom,
    progress,
    records,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const steps = [
        { label: 'Mengisi master barang', count: progress.product_count },
        { label: 'Mencatat barang masuk', count: progress.inbound_count },
        { label: 'Mencatat barang keluar', count: progress.outbound_count },
        { label: 'Membuat pengiriman', count: progress.shipment_count },
        { label: 'Menyelesaikan pengiriman', count: progress.received_count },
    ];
    return (
        <AdminLayout title={student.name}>
            <div className="space-y-6">
                <Link
                    href={showClassroom(classroom.id)}
                    className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke {classroom.name}
                </Link>
                <section className="rounded-2xl border bg-card p-5 sm:p-6">
                    <p className="text-xs font-semibold text-primary">
                        {classroom.name} · {classroom.academic_year}
                    </p>
                    <h1 className="mt-2 text-2xl font-bold break-words">
                        {student.name}
                    </h1>
                    <p className="mt-1 text-sm break-all text-muted-foreground">
                        {student.email}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Aktivitas terakhir:{' '}
                        {progress.last_activity_at
                            ? new Date(
                                  progress.last_activity_at,
                              ).toLocaleString('id-ID', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                              })
                            : 'Belum ada aktivitas'}
                    </p>
                </section>
                <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="rounded-2xl border bg-card p-5">
                        <h2 className="mb-4 font-bold">Progres Pembelajaran</h2>
                        <StudentProgressBar progress={progress} />
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {steps.map((step) => (
                                <div
                                    key={step.label}
                                    className={`flex items-center gap-2 text-xs ${step.count > 0 ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    {step.count > 0 ? (
                                        <CheckCircle2 className="size-4 shrink-0" />
                                    ) : (
                                        <Circle className="size-4 shrink-0" />
                                    )}
                                    <span>{step.label}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
                            Indikator aktivitas praktik, bukan nilai akhir.
                            Transaksi yang dibatalkan dan pengiriman batal tidak
                            dihitung.
                        </p>
                    </div>
                    <div className="rounded-2xl border bg-card p-5">
                        <Boxes className="mb-3 size-6 text-primary" />
                        <p className="text-xs text-muted-foreground">
                            Total stok fisik saat ini
                        </p>
                        <p className="mt-1 text-3xl font-bold">
                            {progress.stock_good + progress.stock_damaged}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs">
                            <span className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:text-emerald-400">
                                Baik: {progress.stock_good}
                            </span>
                            <span className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-700 dark:text-amber-400">
                                Rusak: {progress.stock_damaged}
                            </span>
                        </div>
                        <p className="mt-3 text-[11px] text-muted-foreground">
                            Akumulasi unit dari seluruh barang.
                        </p>
                    </div>
                </section>
                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-bold">
                            Hasil Praktik Siswa
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Lihat rincian data yang dikerjakan siswa.
                        </p>
                    </div>
                    <nav
                        aria-label="Kategori hasil praktik"
                        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                    >
                        {tabs.map((tab) => (
                            <Link
                                key={tab.key}
                                href={show(student.id, {
                                    query: { tab: tab.key },
                                })}
                                preserveScroll
                                aria-current={
                                    filters.tab === tab.key ? 'page' : undefined
                                }
                                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold sm:text-sm ${filters.tab === tab.key ? 'border-primary bg-primary/10 text-primary' : 'bg-card text-muted-foreground'}`}
                            >
                                <tab.icon className="size-4" />
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                    <form
                        className="flex gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                show.url(student.id),
                                { tab: filters.tab, search },
                                { preserveScroll: true, preserveState: true },
                            );
                        }}
                    >
                        <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
                            <input
                                aria-label="Cari hasil praktik"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder={
                                    filters.tab === 'products'
                                        ? 'Cari nama atau kode barang...'
                                        : 'Cari nomor transaksi atau dokumen...'
                                }
                                className="min-h-11 w-full rounded-xl border bg-background py-2 pr-3 pl-10 text-sm"
                            />
                        </div>
                        <button className="min-h-11 rounded-xl border bg-card px-4 text-sm">
                            Cari
                        </button>
                    </form>
                    <p className="text-xs text-muted-foreground">
                        {records.total} data ditemukan
                    </p>
                    {records.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-card py-12 text-center">
                            <Package className="mx-auto mb-3 size-9 text-primary/40" />
                            <p className="text-sm text-muted-foreground">
                                {filters.search
                                    ? 'Tidak ada data yang sesuai pencarian.'
                                    : 'Siswa belum memiliki data pada bagian ini.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid items-start gap-3 sm:grid-cols-2">
                            {records.data.map((record) => (
                                <RecordCard
                                    key={`${filters.tab}-${record.id}`}
                                    record={record}
                                />
                            ))}
                        </div>
                    )}
                    <PaginationLinks page={records} />
                </section>
            </div>
        </AdminLayout>
    );
}
