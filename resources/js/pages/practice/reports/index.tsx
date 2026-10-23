import { Head, Link, router } from '@inertiajs/react';
import {
    FileSpreadsheet,
    Download,
    Filter,
    Calendar,
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    Boxes,
    Truck,
    Search,
    RotateCcw,
    ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import { formatDate, formatRp } from '@/lib/format';
import type { Product } from '@/types';

type Props = {
    tab: 'products' | 'inbound' | 'outbound' | 'stock' | 'shipments';
    preview: {
        tab: string;
        title: string;
        start_date?: string;
        end_date?: string;
        total_rows: number;
        rows: any[];
    };
    categories: string[];
    productList: Array<Pick<Product, 'id' | 'code' | 'name'>>;
    filters: {
        tab: string;
        search: string;
        start_date: string;
        end_date: string;
        category: string;
        status: string;
        product_id: string;
        stock_condition: string;
        reason: string;
        shipment_type: string;
        transport_mode: string;
    };
};

const tabs = [
    { key: 'products', label: 'Data Barang', icon: Package },
    { key: 'inbound', label: 'Barang Masuk', icon: ArrowDownToLine },
    { key: 'outbound', label: 'Barang Keluar', icon: ArrowUpFromLine },
    { key: 'stock', label: 'Mutasi Stok', icon: Boxes },
    { key: 'shipments', label: 'Pengiriman', icon: Truck },
];

export default function ReportIndex({ tab, preview, categories, productList, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [startDate, setStartDate] = useState(filters.start_date ?? '');
    const [endDate, setEndDate] = useState(filters.end_date ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [productId, setProductId] = useState(filters.product_id ?? '');
    const [condition, setCondition] = useState(filters.stock_condition ?? '');
    const [reason, setReason] = useState(filters.reason ?? '');
    const [shipmentType, setShipmentType] = useState(filters.shipment_type ?? '');
    const [transportMode, setTransportMode] = useState(filters.transport_mode ?? '');

    function handleTabChange(nextTab: string) {
        router.get(
            '/praktik/laporan',
            {
                tab: nextTab,
                start_date: startDate,
                end_date: endDate,
            },
            { preserveState: true }
        );
    }

    function applyFilters() {
        router.get(
            '/praktik/laporan',
            {
                tab,
                search: search || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                category: category || undefined,
                status: status || undefined,
                product_id: productId || undefined,
                stock_condition: condition || undefined,
                reason: reason || undefined,
                shipment_type: shipmentType || undefined,
                transport_mode: transportMode || undefined,
            },
            { preserveState: true }
        );
    }

    function handleReset() {
        setSearch('');
        setCategory('');
        setStatus('');
        setProductId('');
        setCondition('');
        setReason('');
        setShipmentType('');
        setTransportMode('');
        router.get(
            '/praktik/laporan',
            {
                tab,
                start_date: startDate,
                end_date: endDate,
            },
            { preserveState: true }
        );
    }

    // Build URL for downloading Excel
    const downloadParams = new URLSearchParams({
        tab,
        ...(search ? { search } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
        ...(category ? { category } : {}),
        ...(status ? { status } : {}),
        ...(productId ? { product_id: productId } : {}),
        ...(condition ? { stock_condition: condition } : {}),
        ...(reason ? { reason } : {}),
        ...(shipmentType ? { shipment_type: shipmentType } : {}),
        ...(transportMode ? { transport_mode: transportMode } : {}),
    });

    const exportUrl = `/praktik/laporan/export?${downloadParams.toString()}`;

    return (
        <PracticeLayout title="Laporan & Ekspor Excel">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Laporan & Excel
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Pratinjau data dan unduh berkas XLSX resmi
                        </p>
                    </div>

                    <a
                        href={exportUrl}
                        download
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98]"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span className="hidden sm:inline">Download Excel</span>
                        <span className="sm:hidden">Excel</span>
                    </a>
                </div>

                {/* 5 Tab Navigation Bar */}
                <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        const isActive = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => handleTabChange(t.key)}
                                className={`flex items-center gap-1.5 flex-shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-card text-muted-foreground hover:bg-muted border border-border/60'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{t.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Filter Controls Card */}
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                        <span className="font-bold text-foreground">Filter Laporan</span>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset Filter</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {/* Date Range (except products tab) */}
                        {tab !== 'products' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2 text-xs font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2 text-xs font-medium"
                                    />
                                </div>
                            </>
                        )}

                        {/* Search keyword for products */}
                        {tab === 'products' && (
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-[11px] font-medium text-muted-foreground">Pencarian Barang</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari kode atau nama..."
                                    className="w-full rounded-xl border border-input bg-background p-2 text-xs"
                                />
                            </div>
                        )}

                        {/* Category filter */}
                        {(tab === 'products' || tab === 'stock') && (
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground">Kategori</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-xl border border-input bg-background p-2 text-xs"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Product filter for transactions */}
                        {(tab === 'inbound' || tab === 'outbound') && (
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground">Barang</label>
                                <select
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    className="w-full rounded-xl border border-input bg-background p-2 text-xs"
                                >
                                    <option value="">Semua Barang</option>
                                    {productList.map((p) => (
                                        <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Condition filter for transactions */}
                        {(tab === 'inbound' || tab === 'outbound') && (
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground">Kondisi</label>
                                <select
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    className="w-full rounded-xl border border-input bg-background p-2 text-xs"
                                >
                                    <option value="">Semua Kondisi</option>
                                    <option value="good">Baik</option>
                                    <option value="damaged">Rusak</option>
                                </select>
                            </div>
                        )}

                        {/* Reason filter for outbound */}
                        {tab === 'outbound' && (
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground">Alasan Pengeluaran</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full rounded-xl border border-input bg-background p-2 text-xs"
                                >
                                    <option value="">Semua Alasan</option>
                                    <option value="sale">Penjualan</option>
                                    <option value="usage">Pemakaian</option>
                                    <option value="return">Retur</option>
                                </select>
                            </div>
                        )}

                        {/* Shipment Type filter */}
                        {tab === 'shipments' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">Jenis Pengiriman</label>
                                    <select
                                        value={shipmentType}
                                        onChange={(e) => setShipmentType(e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2 text-xs"
                                    >
                                        <option value="">Semua Jenis</option>
                                        <option value="domestic">Domestik</option>
                                        <option value="export">Ekspor</option>
                                        <option value="import">Impor</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">Moda Transportasi</label>
                                    <select
                                        value={transportMode}
                                        onChange={(e) => setTransportMode(e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2 text-xs"
                                    >
                                        <option value="">Semua Moda</option>
                                        <option value="land">Darat</option>
                                        <option value="sea">Laut</option>
                                        <option value="air">Udara</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Status filter */}
                        {tab !== 'stock' && (
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-xl border border-input bg-background p-2 text-xs"
                                >
                                    <option value="">Semua Status</option>
                                    {tab === 'products' && (
                                        <>
                                            <option value="active">Aktif</option>
                                            <option value="archived">Diarsipkan</option>
                                        </>
                                    )}
                                    {(tab === 'inbound' || tab === 'outbound') && (
                                        <>
                                            <option value="active">Aktif</option>
                                            <option value="voided">Dibatalkan</option>
                                        </>
                                    )}
                                    {tab === 'shipments' && (
                                        <>
                                            <option value="scheduled">Dijadwalkan</option>
                                            <option value="shipped">Dikirim</option>
                                            <option value="in_transit">Dalam Perjalanan</option>
                                            <option value="received">Diterima</option>
                                            <option value="cancelled">Dibatalkan</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="pt-1 flex justify-end">
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>

                {/* Preview Table Header & Summary */}
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{preview.title}</span>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                            {preview.total_rows} Baris Data
                        </span>
                    </div>
                </div>

                {/* Preview Table Content */}
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="max-h-[500px] overflow-auto">
                        {preview.rows.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                Tidak ada data yang sesuai dengan filter yang dipilih.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="sticky top-0 bg-muted/80 backdrop-blur border-b border-border/60 text-muted-foreground font-semibold">
                                    {tab === 'products' && (
                                        <tr>
                                            <th className="p-3">Kode</th>
                                            <th className="p-3">Nama</th>
                                            <th className="p-3">Kategori</th>
                                            <th className="p-3">Satuan</th>
                                            <th className="p-3 text-right">Harga Pokok</th>
                                            <th className="p-3 text-right">Harga Jual</th>
                                            <th className="p-3 text-center">Stok Baik</th>
                                            <th className="p-3 text-center">Stok Rusak</th>
                                            <th className="p-3 text-center">Total Fisik</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    )}

                                    {tab === 'inbound' && (
                                        <tr>
                                            <th className="p-3">No. Transaksi</th>
                                            <th className="p-3">Tanggal</th>
                                            <th className="p-3">No. Dokumen</th>
                                            <th className="p-3">Barang</th>
                                            <th className="p-3">Supplier</th>
                                            <th className="p-3 text-center">Jumlah</th>
                                            <th className="p-3">Kondisi</th>
                                            <th className="p-3 text-right">Total Nilai</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    )}

                                    {tab === 'outbound' && (
                                        <tr>
                                            <th className="p-3">No. Transaksi</th>
                                            <th className="p-3">Tanggal</th>
                                            <th className="p-3">Barang</th>
                                            <th className="p-3">Penerima</th>
                                            <th className="p-3">Alasan</th>
                                            <th className="p-3 text-center">Jumlah</th>
                                            <th className="p-3">Kondisi</th>
                                            <th className="p-3 text-right">Total Nilai</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    )}

                                    {tab === 'stock' && (
                                        <tr>
                                            <th className="p-3">Kode</th>
                                            <th className="p-3">Nama Barang</th>
                                            <th className="p-3">Satuan</th>
                                            <th className="p-3 text-center">Saldo Awal</th>
                                            <th className="p-3 text-center">Produk Baru</th>
                                            <th className="p-3 text-center">Masuk</th>
                                            <th className="p-3 text-center">Keluar</th>
                                            <th className="p-3 text-center">Koreksi</th>
                                            <th className="p-3 text-center font-bold text-foreground">Saldo Akhir</th>
                                        </tr>
                                    )}

                                    {tab === 'shipments' && (
                                        <tr>
                                            <th className="p-3">No. Pengiriman</th>
                                            <th className="p-3">Jenis</th>
                                            <th className="p-3">Rute</th>
                                            <th className="p-3">Moda</th>
                                            <th className="p-3">Tanggal Kirim</th>
                                            <th className="p-3">Estimasi Tiba</th>
                                            <th className="p-3 text-right">Biaya</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-border/40 font-medium">
                                    {tab === 'products' &&
                                        preview.rows.map((row: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                                <td className="p-3 font-mono font-bold">{row.code}</td>
                                                <td className="p-3 font-semibold">{row.name}</td>
                                                <td className="p-3 text-muted-foreground">{row.category}</td>
                                                <td className="p-3">{row.base_unit}</td>
                                                <td className="p-3 text-right font-mono">{formatRp(row.cost_price)}</td>
                                                <td className="p-3 text-right font-mono">{formatRp(row.selling_price)}</td>
                                                <td className="p-3 text-center text-emerald-600 font-bold">{row.stock_good}</td>
                                                <td className="p-3 text-center text-amber-600 font-bold">{row.stock_damaged}</td>
                                                <td className="p-3 text-center font-extrabold">{row.stock_physical}</td>
                                                <td className="p-3">
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                    {tab === 'inbound' &&
                                        preview.rows.map((row: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                                <td className="p-3 font-mono font-bold">{row.transaction_number}</td>
                                                <td className="p-3 text-muted-foreground">{row.transaction_date}</td>
                                                <td className="p-3 font-mono text-[11px]">{row.external_doc}</td>
                                                <td className="p-3">
                                                    <p className="font-semibold">{row.product_name}</p>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{row.product_code}</span>
                                                </td>
                                                <td className="p-3">{row.supplier}</td>
                                                <td className="p-3 text-center font-bold text-teal-600">+{row.quantity} {row.base_unit}</td>
                                                <td className="p-3">{row.condition}</td>
                                                <td className="p-3 text-right font-mono font-bold">{formatRp(row.total_amount)}</td>
                                                <td className="p-3">
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.status === 'Aktif' ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                    {tab === 'outbound' &&
                                        preview.rows.map((row: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                                <td className="p-3 font-mono font-bold">{row.transaction_number}</td>
                                                <td className="p-3 text-muted-foreground">{row.transaction_date}</td>
                                                <td className="p-3">
                                                    <p className="font-semibold">{row.product_name}</p>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{row.product_code}</span>
                                                </td>
                                                <td className="p-3">{row.recipient}</td>
                                                <td className="p-3">{row.reason}</td>
                                                <td className="p-3 text-center font-bold text-amber-600">-{row.quantity} {row.base_unit}</td>
                                                <td className="p-3">{row.condition}</td>
                                                <td className="p-3 text-right font-mono font-bold">{formatRp(row.total_amount)}</td>
                                                <td className="p-3">
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${row.status === 'Aktif' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                    {tab === 'stock' &&
                                        preview.rows.map((row: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                                <td className="p-3 font-mono font-bold">{row.code}</td>
                                                <td className="p-3 font-semibold">{row.name}</td>
                                                <td className="p-3">{row.base_unit}</td>
                                                <td className="p-3 text-center">{row.before_good} / {row.before_damaged}</td>
                                                <td className="p-3 text-center">+{row.initial_good}</td>
                                                <td className="p-3 text-center text-teal-600 font-bold">+{row.inbound_good + row.inbound_damaged}</td>
                                                <td className="p-3 text-center text-amber-600 font-bold">-{row.outbound_good + row.outbound_damaged}</td>
                                                <td className="p-3 text-center text-rose-600 font-bold">
                                                    {row.reversal_good + row.reversal_damaged !== 0 ? (row.reversal_good + row.reversal_damaged) : '-'}
                                                </td>
                                                <td className="p-3 text-center font-extrabold text-foreground bg-primary/5">
                                                    {row.end_physical} {row.base_unit} ({row.end_good} baik / {row.end_damaged} rusak)
                                                </td>
                                            </tr>
                                        ))}

                                    {tab === 'shipments' &&
                                        preview.rows.map((row: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-muted/40 transition-colors">
                                                <td className="p-3 font-mono font-bold">{row.shipment_number}</td>
                                                <td className="p-3">
                                                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase">{row.shipment_type}</span>
                                                </td>
                                                <td className="p-3 font-medium">{row.origin} → {row.destination}</td>
                                                <td className="p-3">{row.transport_mode} ({row.fleet_type})</td>
                                                <td className="p-3 text-muted-foreground">{row.shipping_date}</td>
                                                <td className="p-3 text-muted-foreground">{row.estimated_arrival}</td>
                                                <td className="p-3 text-right font-mono font-bold">{formatRp(row.estimated_cost)}</td>
                                                <td className="p-3">
                                                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary">
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </PracticeLayout>
    );
}
