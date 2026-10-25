import { Link, useForm, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Truck,
    Ship,
    Plane,
    Package,
    ShieldAlert,
    CheckCircle2,
    Calendar,
    Loader2,
    Info,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import { formatRp, generateUuid } from '@/lib/format';
import type { Product } from '@/types';
import practice from '@/routes/practice';

type AvailableOutbound = {
    id: number;
    transaction_number: string;
    transaction_date: string;
    recipient: string;
    quantity: number;
    allocated: number;
    remaining: number;
    product_snapshot: {
        code: string;
        name: string;
        category: string;
        base_unit: string;
    };
    stock_condition: 'good' | 'damaged';
};

type Props = {
    availableOutbounds: AvailableOutbound[];
    products: Array<Pick<Product, 'id' | 'code' | 'name' | 'category' | 'base_unit' | 'stock_good'>>;
    initialOutboundId?: number | null;
};

type ItemInput = {
    stock_transaction_id?: number;
    product_id?: number;
    quantity: number;
    stock_condition?: 'good' | 'damaged';
    display_name?: string;
    display_code?: string;
    unit?: string;
    max_qty?: number;
};

const shipmentTypes: Array<{
    val: 'domestic' | 'export' | 'import';
    label: string;
}> = [
    { val: 'domestic', label: 'Domestik' },
    { val: 'export', label: 'Ekspor' },
    { val: 'import', label: 'Impor' },
];

export default function ShipmentCreate({ availableOutbounds, products, initialOutboundId }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const [currentStep, setCurrentStep] = useState(1);

    const { data, setData, post, processing } = useForm({
        idempotency_key: generateUuid(),
        shipment_type: 'domestic' as 'domestic' | 'export' | 'import',
        origin: 'Gudang Utama - Jakarta',
        destination: '',
        origin_country: 'Indonesia',
        destination_country: 'Indonesia',
        incoterms: '',
        customs_document_type: '',
        customs_document_number: '',
        tariffs_and_taxes: '0',
        transport_mode: 'land' as 'land' | 'sea' | 'air',
        fleet_type: 'Truk Box CDD (Colt Diesel Double)',
        driver_name: '',
        carrier_service: '',
        tracking_number: '',
        mode_selection_reason: 'Pengiriman darat lebih ekonomis dan efisien untuk jarak tempuh antar kota.',
        estimated_cost: '250000',
        cargo_type: 'general' as 'general' | 'fragile' | 'liquid' | 'perishable' | 'other',
        cargo_type_details: '',
        total_weight_kg: '15',
        volume_m3: '0.1',
        packaging_type: 'box' as 'box' | 'pallet' | 'crate' | 'container' | 'other',
        packaging_type_details: '',
        handling_instructions: 'Hindari basah dan tumpukan maksimal 5 karton.',
        special_notes: '',
        shipping_date: new Date().toISOString().slice(0, 10),
        estimated_arrival_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        items: [] as ItemInput[],
    });

    // Helper for adding an outbound item (domestic/export)
    function handleToggleOutbound(tx: AvailableOutbound) {
        const exists = data.items.some((it) => it.stock_transaction_id === tx.id);
        if (exists) {
            setData('items', data.items.filter((it) => it.stock_transaction_id !== tx.id));
        } else {
            // Auto-fill destination from first transaction recipient if destination is empty
            if (!data.destination && tx.recipient) {
                setData('destination', tx.recipient);
            }

            useEffect(() => {
                if (initialOutboundId === null || initialOutboundId === undefined || data.items.length > 0) {
                    return;
                }

                const outbound = availableOutbounds.find((tx) => tx.id === initialOutboundId);
                if (outbound) {
                    handleToggleOutbound(outbound);
                }
            }, [initialOutboundId, availableOutbounds]);
            setData('items', [
                ...data.items,
                {
                    stock_transaction_id: tx.id,
                    product_id: undefined,
                    quantity: tx.remaining,
                    stock_condition: tx.stock_condition,
                    display_name: tx.product_snapshot.name,
                    display_code: tx.product_snapshot.code,
                    unit: tx.product_snapshot.base_unit,
                    max_qty: tx.remaining,
                },
            ]);
        }
    }

    // Helper for adding an import product item
    function handleAddImportProduct(prodId: number) {
        const prod = products.find((p) => p.id === prodId);
        if (!prod) return;
        const exists = data.items.some((it) => it.product_id === prod.id);
        if (!exists) {
            setData('items', [
                ...data.items,
                {
                    product_id: prod.id,
                    stock_transaction_id: undefined,
                    quantity: 1,
                    stock_condition: 'good',
                    display_name: prod.name,
                    display_code: prod.code,
                    unit: prod.base_unit,
                },
            ]);
        }
    }

    function handleItemQtyChange(index: number, qtyStr: string) {
        const q = parseInt(qtyStr) || 1;
        const newItems = [...data.items];
        newItems[index].quantity = q;
        setData('items', newItems);
    }

    function handleRemoveItem(index: number) {
        setData('items', data.items.filter((_, i) => i !== index));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/praktik/transportasi');
    }

    return (
        <PracticeLayout title="Jadwalkan Pengiriman">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <Link href="/praktik/transportasi" className="rounded-lg p-1.5 hover:bg-muted">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">Jadwalkan Pengiriman</h1>
                        <p className="text-xs text-muted-foreground">Langkah {currentStep} dari 5</p>
                    </div>
                </div>

                {/* 5-Step Indicator */}
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                                step <= currentStep ? 'bg-primary' : 'bg-muted'
                            }`}
                        />
                    ))}
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* STEP 1: Pemilihan Moda & Jenis */}
                    {currentStep === 1 && (
                        <div className="rounded-2xl bg-card p-4 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-foreground">1. Pemilihan Moda & Rute</h2>

                            {/* Shipment Type */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Jenis Pengiriman *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {shipmentTypes.map((t) => (
                                        <button
                                            key={t.val}
                                            type="button"
                                            onClick={() => {
                                                setData((prev) => ({
                                                    ...prev,
                                                    shipment_type: t.val,
                                                    items: [], // reset items on type switch
                                                    origin_country: t.val === 'import' ? 'Tiongkok' : 'Indonesia',
                                                    destination_country: t.val === 'export' ? 'Singapura' : 'Indonesia',
                                                }));
                                            }}
                                            className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                                                data.shipment_type === t.val
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border text-muted-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Transport Mode */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Moda Transportasi *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { val: 'land', label: 'Darat', icon: Truck },
                                        { val: 'sea', label: 'Laut', icon: Ship },
                                        { val: 'air', label: 'Udara', icon: Plane },
                                    ].map((m) => {
                                        const Icon = m.icon;
                                        return (
                                            <button
                                                key={m.val}
                                                type="button"
                                                onClick={() => setData('transport_mode', m.val as any)}
                                                className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                                                    data.transport_mode === m.val
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span>{m.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Origin & Destination */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Lokasi Asal *</label>
                                    <input
                                        type="text"
                                        value={data.origin}
                                        onChange={(e) => setData('origin', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium focus:border-primary focus:outline-none"
                                        placeholder="Misal: Gudang Cakung, Jakarta"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Lokasi Tujuan *</label>
                                    <input
                                        type="text"
                                        value={data.destination}
                                        onChange={(e) => setData('destination', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium focus:border-primary focus:outline-none"
                                        placeholder="Misal: Toko Mitra Jaya, Bandung"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Export / Import fields */}
                            {data.shipment_type !== 'domestic' && (
                                <div className="rounded-xl bg-muted/40 p-3 space-y-3 border border-border/60">
                                    <p className="text-xs font-bold text-foreground">Parameter Perdagangan Internasional</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[11px] text-muted-foreground">Negara Asal</label>
                                            <input
                                                type="text"
                                                value={data.origin_country}
                                                onChange={(e) => setData('origin_country', e.target.value)}
                                                className="w-full rounded-lg border border-input bg-background p-2 text-xs"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] text-muted-foreground">Negara Tujuan</label>
                                            <input
                                                type="text"
                                                value={data.destination_country}
                                                onChange={(e) => setData('destination_country', e.target.value)}
                                                className="w-full rounded-lg border border-input bg-background p-2 text-xs"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[11px] text-muted-foreground">Incoterms *</label>
                                            <input
                                                type="text"
                                                value={data.incoterms}
                                                onChange={(e) => setData('incoterms', e.target.value.toUpperCase())}
                                                className="w-full rounded-lg border border-input bg-background p-2 text-xs font-mono uppercase"
                                                placeholder="FOB / CIF / EXW"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] text-muted-foreground">Estimasi Bea & Pajak (Rp)</label>
                                            <input
                                                type="number"
                                                value={data.tariffs_and_taxes}
                                                onChange={(e) => setData('tariffs_and_taxes', e.target.value)}
                                                className="w-full rounded-lg border border-input bg-background p-2 text-xs"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fleet & Selection Reason */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Jenis Kendaraan / Armada *</label>
                                <input
                                    type="text"
                                    value={data.fleet_type}
                                    onChange={(e) => setData('fleet_type', e.target.value)}
                                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium focus:border-primary focus:outline-none"
                                    placeholder="Misal: Truk Fuso Box, Kapal Kontainer, Pesawat Kargo"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Dasar Pemilihan Moda *</label>
                                <textarea
                                    value={data.mode_selection_reason}
                                    onChange={(e) => setData('mode_selection_reason', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium focus:border-primary focus:outline-none"
                                    placeholder="Jelaskan alasan memilih moda ini berdasarkan jarak, biaya, waktu tempuh, dan sifat barang."
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Alokasi Barang */}
                    {currentStep === 2 && (
                        <div className="rounded-2xl bg-card p-4 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-foreground">2. Alokasi Barang</h2>
                                    <p className="text-xs text-muted-foreground">
                                        {data.shipment_type === 'import'
                                            ? 'Pilih produk master yang diimpor'
                                            : 'Pilih transaksi Barang Keluar aktif untuk dialokasikan'}
                                    </p>
                                </div>
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                                    {data.items.length} Terpilih
                                </span>
                            </div>

                            {/* Selected Items List */}
                            {data.items.length > 0 && (
                                <div className="space-y-2 border-b border-border/60 pb-3">
                                    <p className="text-xs font-semibold text-muted-foreground">Daftar Muatan Pengiriman:</p>
                                    {data.items.map((it, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-2 rounded-xl bg-primary/5 border border-primary/20 p-2.5 text-xs"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-foreground truncate">{it.display_name}</p>
                                                <p className="text-muted-foreground text-[11px] font-mono">{it.display_code}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={it.quantity}
                                                        onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                                                        min="1"
                                                        max={it.max_qty}
                                                        className="w-16 rounded-lg border border-input bg-background px-2 py-1 text-center font-bold text-xs"
                                                    />
                                                    <span className="text-[11px] text-muted-foreground">{it.unit}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="p-1 text-destructive hover:bg-destructive/10 rounded"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Source Selection List */}
                            {data.shipment_type === 'import' ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground">Pilih Produk Master:</label>
                                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                                        {products.map((p) => {
                                            const isSelected = data.items.some((it) => it.product_id === p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => handleAddImportProduct(p.id)}
                                                    disabled={isSelected}
                                                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all ${
                                                        isSelected
                                                            ? 'bg-muted/50 border-transparent opacity-60'
                                                            : 'bg-card border-border/80 hover:border-primary'
                                                    }`}
                                                >
                                                    <div>
                                                        <span className="font-mono text-[10px] text-muted-foreground">{p.code}</span>
                                                        <p className="font-semibold text-foreground">{p.name}</p>
                                                    </div>
                                                    <span className="text-primary font-bold text-xs">+ Tambah</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground">
                                        Pilih Transaksi Keluar ({availableOutbounds.length} tersedia):
                                    </label>
                                    {availableOutbounds.length === 0 ? (
                                        <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                                            Belum ada transaksi Barang Keluar dengan sisa kuantitas belum teralokasi.
                                            Silakan catat Barang Keluar terlebih dahulu.
                                        </div>
                                    ) : (
                                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                                            {availableOutbounds.map((tx) => {
                                                const isSelected = data.items.some((it) => it.stock_transaction_id === tx.id);
                                                return (
                                                    <div
                                                        key={tx.id}
                                                        onClick={() => handleToggleOutbound(tx)}
                                                        className={`cursor-pointer rounded-xl border p-3 text-xs transition-all ${
                                                            isSelected
                                                                ? 'border-primary bg-primary/10 shadow-sm'
                                                                : 'border-border/80 bg-card hover:border-primary/50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-mono font-bold text-foreground">
                                                                {tx.transaction_number}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground">
                                                                {tx.transaction_date}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 font-semibold text-foreground">
                                                            {tx.product_snapshot.name}
                                                        </p>
                                                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                                                            <span>Penerima: <strong className="text-foreground">{tx.recipient}</strong></span>
                                                            <span>Tersisa: <strong className="text-primary">{tx.remaining} {tx.product_snapshot.base_unit}</strong></span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Penanganan Muatan */}
                    {currentStep === 3 && (
                        <div className="rounded-2xl bg-card p-4 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-foreground">3. Penanganan Muatan</h2>

                            {/* Cargo Type */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Jenis Muatan *</label>
                                <select
                                    value={data.cargo_type}
                                    onChange={(e) => setData('cargo_type', e.target.value as any)}
                                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium focus:border-primary focus:outline-none"
                                >
                                    <option value="general">Umum (General Cargo)</option>
                                    <option value="fragile">Mudah Pecah (Fragile)</option>
                                    <option value="liquid">Cair (Liquid)</option>
                                    <option value="perishable">Mudah Rusak / Basi (Perishable)</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>

                            {data.cargo_type === 'other' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Rincian Muatan Lainnya *</label>
                                    <input
                                        type="text"
                                        value={data.cargo_type_details}
                                        onChange={(e) => setData('cargo_type_details', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs"
                                        required
                                    />
                                </div>
                            )}

                            {/* Weight & Volume */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Berat Total (kg) *</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={data.total_weight_kg}
                                        onChange={(e) => setData('total_weight_kg', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-bold"
                                        min="0.001"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Volume (m³)</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={data.volume_m3}
                                        onChange={(e) => setData('volume_m3', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Packaging Type */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Jenis Kemasan *</label>
                                <select
                                    value={data.packaging_type}
                                    onChange={(e) => setData('packaging_type', e.target.value as any)}
                                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium focus:border-primary focus:outline-none"
                                >
                                    <option value="box">Dus / Karton</option>
                                    <option value="pallet">Palet Kayu / Plastik</option>
                                    <option value="crate">Peti Kayu (Crate)</option>
                                    <option value="container">Kontainer</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>

                            {/* Handling Instructions */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Cara Penanganan *</label>
                                <textarea
                                    value={data.handling_instructions}
                                    onChange={(e) => setData('handling_instructions', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs"
                                    placeholder="Misal: Jangan ditindih barang berat, gunakan forklift, simpan di tempat kering"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Catatan Khusus</label>
                                <input
                                    type="text"
                                    value={data.special_notes}
                                    onChange={(e) => setData('special_notes', e.target.value)}
                                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs"
                                    placeholder="Catatan tambahan bagi tim operasional"
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Jadwal & Ekspedisi */}
                    {currentStep === 4 && (
                        <div className="rounded-2xl bg-card p-4 shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-foreground">4. Jadwal & Ekspedisi</h2>

                            {/* Shipping & Arrival Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Tanggal Kirim *</label>
                                    <input
                                        type="date"
                                        value={data.shipping_date}
                                        onChange={(e) => setData('shipping_date', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Estimasi Tiba *</label>
                                    <input
                                        type="date"
                                        value={data.estimated_arrival_date}
                                        onChange={(e) => setData('estimated_arrival_date', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-medium"
                                        min={data.shipping_date}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Carrier & Tracking */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Jasa Pengangkut / Ekspedisi</label>
                                    <input
                                        type="text"
                                        value={data.carrier_service}
                                        onChange={(e) => setData('carrier_service', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs"
                                        placeholder="Misal: Armada Internal / JNE Trucking / Samudera Logistics"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Nomor Resi / Referensi</label>
                                    <input
                                        type="text"
                                        value={data.tracking_number}
                                        onChange={(e) => setData('tracking_number', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-mono uppercase"
                                        placeholder="Nomor resi dari pengangkut"
                                    />
                                </div>
                            </div>

                            {/* Driver Name & Estimated Cost */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Nama Pengemudi / Operator</label>
                                    <input
                                        type="text"
                                        value={data.driver_name}
                                        onChange={(e) => setData('driver_name', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs"
                                        placeholder="Nama pengemudi truk / kapten armada"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Estimasi Biaya Pengiriman (Rp) *</label>
                                    <input
                                        type="number"
                                        value={data.estimated_cost}
                                        onChange={(e) => setData('estimated_cost', e.target.value)}
                                        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-bold"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Konfirmasi / Ringkasan */}
                    {currentStep === 5 && (
                        <div className="rounded-2xl bg-card p-4 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <CheckCircle2 className="h-5 w-5" />
                                <h2 className="text-sm font-bold text-foreground">5. Ringkasan Pengiriman</h2>
                            </div>

                            {/* Recap Cards */}
                            <div className="space-y-2.5 text-xs">
                                <div className="rounded-xl bg-muted/40 p-3 space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Rute & Moda</span>
                                    <p className="font-bold text-foreground text-sm">
                                        {data.origin} → {data.destination}
                                    </p>
                                    <p className="text-muted-foreground">
                                        Jenis: {data.shipment_type.toUpperCase()} · Moda: {data.transport_mode.toUpperCase()} ({data.fleet_type})
                                    </p>
                                </div>

                                <div className="rounded-xl bg-muted/40 p-3 space-y-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Barang Muatan ({data.items.length} item)</span>
                                    <div className="divide-y divide-border/40">
                                        {data.items.map((it, i) => (
                                            <div key={i} className="flex justify-between py-1">
                                                <span>{it.display_name}</span>
                                                <strong className="text-foreground">{it.quantity} {it.unit}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-xl bg-muted/40 p-3 grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">Jadwal Kirim</span>
                                        <strong className="text-foreground">{data.shipping_date}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">Estimasi Tiba</span>
                                        <strong className="text-foreground">{data.estimated_arrival_date}</strong>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">Berat Total</span>
                                        <strong className="text-foreground">{data.total_weight_kg} kg</strong>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-muted-foreground block">Estimasi Biaya</span>
                                        <strong className="text-foreground">{formatRp(data.estimated_cost)}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Submission Error */}
                            {errors.store && (
                                <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                                    {errors.store}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing || data.items.length === 0}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-all disabled:opacity-50"
                            >
                                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                <span>Simpan & Jadwalkan Pengiriman</span>
                            </button>
                        </div>
                    )}

                    {/* Step Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentStep((s) => s - 1)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Sebelumnya</span>
                            </button>
                        ) : <div />}

                        {currentStep < 5 && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (currentStep === 1 && (!data.origin || !data.destination)) {
                                        alert('Asal dan tujuan pengiriman wajib diisi.');
                                        return;
                                    }
                                    if (currentStep === 2 && data.items.length === 0) {
                                        alert('Pilih minimal satu barang untuk dialokasikan ke pengiriman.');
                                        return;
                                    }
                                    setCurrentStep((s) => s + 1);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                            >
                                <span>Lanjutkan</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </PracticeLayout>
    );
}
