import { Head, Link, router } from '@inertiajs/react';
import {
    Truck,
    Ship,
    Plane,
    Plus,
    Search,
    X,
    Filter,
    ChevronRight,
    Calendar,
    MapPin,
    Package,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import { formatDate, formatRp } from '@/lib/format';
import type { Paginated, Shipment } from '@/types';
import practice from '@/routes/practice';

type Props = {
    shipments: Paginated<Shipment>;
    filters: {
        search?: string;
        shipment_type?: string;
        transport_mode?: string;
        status?: string;
        shipping_date?: string;
    };
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    scheduled: { label: 'Dijadwalkan', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    shipped: { label: 'Dikirim', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    in_transit: { label: 'Dalam Perjalanan', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
    received: { label: 'Diterima', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'Dibatalkan', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
};

const typeLabel: Record<string, string> = {
    domestic: 'Domestik',
    export: 'Ekspor',
    import: 'Impor',
};

const ModeIcon = ({ mode, className = 'h-4 w-4' }: { mode: string; className?: string }) => {
    if (mode === 'sea') return <Ship className={className} />;
    if (mode === 'air') return <Plane className={className} />;
    return <Truck className={className} />;
};

export default function ShipmentIndex({ shipments, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedType, setSelectedType] = useState(filters.shipment_type ?? '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status ?? '');
    const [selectedMode, setSelectedMode] = useState(filters.transport_mode ?? '');

    function applyFilter(key: string, val: string) {
        const nextFilters = {
            search: search || undefined,
            shipment_type: selectedType || undefined,
            status: selectedStatus || undefined,
            transport_mode: selectedMode || undefined,
            [key]: val || undefined,
        };
        router.get('/praktik/transportasi', nextFilters, { preserveState: true });
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        applyFilter('search', search);
    }

    return (
        <PracticeLayout title="Transportasi & Pengiriman">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Pengiriman
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Manajemen transportasi barang logistik
                        </p>
                    </div>
                    <Link
                        href="/praktik/transportasi/create"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Jadwalkan</span>
                    </Link>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nomor pengiriman, asal, atau tujuan..."
                        className="w-full rounded-2xl border border-input bg-card py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                applyFilter('search', '');
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </form>

                {/* Filter Chips: Shipment Type */}
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                    {[
                        { val: '', label: 'Semua Jenis' },
                        { val: 'domestic', label: 'Domestik' },
                        { val: 'export', label: 'Ekspor' },
                        { val: 'import', label: 'Impor' },
                    ].map((t) => (
                        <button
                            key={t.val}
                            type="button"
                            onClick={() => {
                                setSelectedType(t.val);
                                applyFilter('shipment_type', t.val);
                            }}
                            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                                selectedType === t.val
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-card text-muted-foreground hover:bg-muted border border-border/60'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Secondary Filter: Status */}
                <div className="flex gap-2 items-center">
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            applyFilter('status', e.target.value);
                        }}
                        className="rounded-xl border border-input bg-card py-1.5 px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    >
                        <option value="">Semua Status</option>
                        <option value="scheduled">Dijadwalkan</option>
                        <option value="shipped">Dikirim</option>
                        <option value="in_transit">Dalam Perjalanan</option>
                        <option value="received">Diterima</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>

                    <select
                        value={selectedMode}
                        onChange={(e) => {
                            setSelectedMode(e.target.value);
                            applyFilter('transport_mode', e.target.value);
                        }}
                        className="rounded-xl border border-input bg-card py-1.5 px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                    >
                        <option value="">Semua Moda</option>
                        <option value="land">Darat</option>
                        <option value="sea">Laut</option>
                        <option value="air">Udara</option>
                    </select>

                    {(selectedStatus || selectedMode || selectedType || search) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setSelectedType('');
                                setSelectedStatus('');
                                setSelectedMode('');
                                router.get('/praktik/transportasi', {}, { preserveState: true });
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline ml-auto"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>

                {/* Shipment List */}
                {shipments.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 p-8 text-center space-y-2">
                        <Truck className="h-12 w-12 text-muted-foreground/40" />
                        <h3 className="text-sm font-semibold text-foreground">
                            Belum Ada Data Pengiriman
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            Jadwalkan pengiriman pertama Anda untuk mengalokasikan barang keluar dan melatih manajemen transportasi.
                        </p>
                        <Link
                            href="/praktik/transportasi/create"
                            className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Buat Jadwal Pengiriman</span>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {shipments.data.map((shipment) => {
                            const status = statusConfig[shipment.status] ?? {
                                label: shipment.status,
                                color: 'text-muted-foreground',
                                bg: 'bg-muted border-border',
                            };
                            const totalQty = shipment.items?.reduce((sum, it) => sum + it.quantity, 0) ?? 0;

                            return (
                                <Link
                                    key={shipment.id}
                                    href={`/praktik/transportasi/${shipment.id}`}
                                    className="group block rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                                >
                                    {/* Top Row: Number, Type & Status */}
                                    <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-foreground">
                                                {shipment.shipment_number}
                                            </span>
                                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                                                {typeLabel[shipment.shipment_type] ?? shipment.shipment_type}
                                            </span>
                                        </div>
                                        <span
                                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${status.color} ${status.bg}`}
                                        >
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Route Section */}
                                    <div className="my-3 space-y-1.5">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <span className="truncate max-w-[130px]">{shipment.origin}</span>
                                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                            <span className="truncate max-w-[130px]">{shipment.destination}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <ModeIcon mode={shipment.transport_mode} className="h-3.5 w-3.5 text-primary" />
                                                <span>{shipment.fleet_type}</span>
                                            </div>
                                            <span>·</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{formatDate(shipment.shipping_date)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Meta & Arrow */}
                                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className="text-muted-foreground">
                                                Muatan: <strong className="text-foreground">{totalQty} unit ({parseFloat(shipment.total_weight_kg)} kg)</strong>
                                            </span>
                                            <span className="text-muted-foreground">
                                                Biaya: <strong className="text-foreground">{formatRp(shipment.estimated_cost)}</strong>
                                            </span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {shipments.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-border/60 pt-4">
                        <p className="text-xs text-muted-foreground">
                            Halaman {shipments.current_page} dari {shipments.last_page} ({shipments.total} pengiriman)
                        </p>
                        <div className="flex items-center gap-2">
                            {shipments.prev_page_url && (
                                <Link
                                    href={shipments.prev_page_url}
                                    preserveState
                                    className="rounded-lg border border-input bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted"
                                >
                                    Sebelumnya
                                </Link>
                            )}
                            {shipments.next_page_url && (
                                <Link
                                    href={shipments.next_page_url}
                                    preserveState
                                    className="rounded-lg border border-input bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted"
                                >
                                    Selanjutnya
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PracticeLayout>
    );
}
