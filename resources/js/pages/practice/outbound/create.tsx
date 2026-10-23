import { Link, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, Loader2, Camera } from 'lucide-react';
import { useEffect, useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import BarcodeScannerModal from '@/components/practice/barcode-scanner-modal';
import { formatRp, generateUuid } from '@/lib/format';
import type { Product } from '@/types';
import practice from '@/routes/practice';

type Props = {
    products: Product[];
};

type FormData = {
    product_id: string;
    transaction_date: string;
    external_document_number: string;
    reason: 'sale' | 'usage' | 'return';
    stock_condition: 'good' | 'damaged';
    quantity: string;
    unit_price: string;
    recipient: string;
    notes: string;
    idempotency_key: string;
};

const reasonOptions = [
    { value: 'sale' as const, label: '🛒 Penjualan' },
    { value: 'usage' as const, label: '🔧 Pemakaian' },
    { value: 'return' as const, label: '↩️ Retur' },
];

export default function OutboundCreate({ products }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const preselectedId = new URLSearchParams(window.location.search).get('product_id') ?? '';
    const [scannerOpen, setScannerOpen] = useState(false);

    const { data, setData, post, processing } = useForm<FormData>({
        product_id: preselectedId,
        transaction_date: new Date().toISOString().slice(0, 10),
        external_document_number: '',
        reason: 'sale',
        stock_condition: 'good',
        quantity: '',
        unit_price: '',
        recipient: '',
        notes: '',
        idempotency_key: generateUuid(),
    });

    const selectedProduct = products.find((p) => String(p.id) === data.product_id);

    useEffect(() => {
        if (selectedProduct && !data.unit_price) {
            setData('unit_price', selectedProduct.selling_price);
        }
    }, [data.product_id]);

    // PRD D-07: Damaged only for return
    const conditionOptions = data.reason === 'return'
        ? [
            { value: 'good' as const, label: '✅ Baik' },
            { value: 'damaged' as const, label: '⚠️ Rusak' },
          ]
        : [{ value: 'good' as const, label: '✅ Baik' }];

    // Reset condition if reason changes away from return
    useEffect(() => {
        if (data.reason !== 'return' && data.stock_condition === 'damaged') {
            setData('stock_condition', 'good');
        }
    }, [data.reason]);

    const maxQty = data.stock_condition === 'good'
        ? selectedProduct?.stock_good
        : selectedProduct?.stock_damaged;

    const totalAmount =
        data.quantity && data.unit_price
            ? parseInt(data.quantity) * parseFloat(data.unit_price)
            : 0;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(practice.outbound.store.url());
    }

    return (
        <PracticeLayout title="Catat Barang Keluar">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Link href={practice.outbound.index.url()} className="rounded-lg p-1.5 hover:bg-muted">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-lg font-bold">Catat Barang Keluar</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Pilih Barang */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pilih Barang</h2>

                        <Field label="Barang *" error={errors.product_id}>
                            <div className="flex gap-2">
                                <select
                                    value={data.product_id}
                                    onChange={(e) => setData((prev) => ({ ...prev, product_id: e.target.value, unit_price: '' }))}
                                    className={`${selectClass(errors.product_id)} flex-1`}
                                    required
                                >
                                    <option value="">-- Pilih Barang --</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={String(p.id)}>
                                            {p.code} · {p.name} ({p.base_unit})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setScannerOpen(true)}
                                    className="flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-primary-foreground px-3 py-2 text-xs font-semibold text-primary transition-all active:scale-[0.98]"
                                    title="Pindai Barcode"
                                >
                                    <Camera className="h-4 w-4" />
                                    <span className="hidden sm:inline">Pindai</span>
                                </button>
                            </div>
                        </Field>

                        {selectedProduct && (
                            <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs space-y-0.5">
                                <p className="font-medium text-amber-800">{selectedProduct.name}</p>
                                <div className="flex gap-4 text-amber-600">
                                    <span>Stok baik: {selectedProduct.stock_good}</span>
                                    <span>Rusak: {selectedProduct.stock_damaged}</span>
                                </div>
                                <p className="text-amber-600">Harga jual: {formatRp(selectedProduct.selling_price)}</p>
                            </div>
                        )}
                    </section>

                    {/* Detail */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Detail Pengeluaran</h2>

                        <Field label="Tanggal Keluar *" error={errors.transaction_date}>
                            <input
                                type="date"
                                value={data.transaction_date}
                                onChange={(e) => setData('transaction_date', e.target.value)}
                                max={new Date().toISOString().slice(0, 10)}
                                className={inputClass(errors.transaction_date)}
                                required
                            />
                        </Field>

                        <Field label="No. Dokumen / Bukti Keluar *" error={errors.external_document_number}>
                            <input
                                type="text"
                                value={data.external_document_number}
                                onChange={(e) => setData('external_document_number', e.target.value)}
                                placeholder="Contoh: BK-001/X/2026"
                                className={inputClass(errors.external_document_number)}
                                required
                            />
                        </Field>

                        <Field label="Alasan Keluar *" error={errors.reason}>
                            <div className="flex gap-2">
                                {reasonOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setData('reason', opt.value)}
                                        className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-colors ${
                                            data.reason === opt.value
                                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                                : 'border-border text-muted-foreground'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        <Field label="Penerima / Tujuan *" error={errors.recipient}>
                            <input
                                type="text"
                                value={data.recipient}
                                onChange={(e) => setData('recipient', e.target.value)}
                                placeholder={data.reason === 'sale' ? 'Nama pelanggan' : data.reason === 'usage' ? 'Departemen / keperluan' : 'Pemasok asal'}
                                className={inputClass(errors.recipient)}
                                required
                            />
                        </Field>

                        <Field label="Kondisi Stok *" error={errors.stock_condition}>
                            <div className="flex gap-2">
                                {conditionOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setData('stock_condition', opt.value)}
                                        className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                                            data.stock_condition === opt.value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border text-muted-foreground'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {data.reason !== 'return' && (
                                <p className="text-[11px] text-muted-foreground">Pengeluaran barang rusak hanya untuk Retur.</p>
                            )}
                        </Field>
                    </section>

                    {/* Jumlah & Harga */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Jumlah & Harga</h2>

                        {maxQty !== undefined && (
                            <p className="text-xs text-muted-foreground">
                                Stok {data.stock_condition === 'good' ? 'baik' : 'rusak'} tersedia: <strong>{maxQty}</strong> {selectedProduct?.base_unit}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <Field label={`Jumlah (${selectedProduct?.base_unit ?? 'unit'}) *`} error={errors.quantity}>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    max={maxQty}
                                    step="1"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    placeholder="0"
                                    className={inputClass(errors.quantity)}
                                    required
                                />
                            </Field>

                            <Field label="Harga Satuan *" error={errors.unit_price}>
                                <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min="0"
                                        step="1"
                                        value={data.unit_price}
                                        onChange={(e) => setData('unit_price', e.target.value)}
                                        placeholder="0"
                                        className={`${inputClass(errors.unit_price)} pl-7`}
                                        required
                                    />
                                </div>
                            </Field>
                        </div>

                        {totalAmount > 0 && (
                            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                                <span className="text-sm text-amber-700">Total</span>
                                <span className="text-base font-bold text-amber-700">{formatRp(totalAmount)}</span>
                            </div>
                        )}

                        <Field label="Catatan" error={errors.notes}>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={2}
                                placeholder="Catatan tambahan (opsional)"
                                className={inputClass(errors.notes)}
                            />
                        </Field>
                    </section>

                    {errors.stock && (
                        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{errors.stock}</div>
                    )}
                    {errors.stock_condition && (
                        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{errors.stock_condition}</div>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-base font-semibold text-white shadow-md disabled:opacity-60"
                    >
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Simpan Barang Keluar
                    </button>
                    <div className="pb-4" />
                </form>

                <BarcodeScannerModal
                    open={scannerOpen}
                    onClose={() => setScannerOpen(false)}
                    onSelectProduct={(scanned) => {
                        setData((prev) => ({
                            ...prev,
                            product_id: String(scanned.id),
                            unit_price: String(scanned.selling_price),
                        }));
                    }}
                    title="Pindai Barang Keluar"
                />
            </div>
        </PracticeLayout>
    );
}

function inputClass(error?: string) {
    return `w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
        error ? 'border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-primary'
    } bg-background`;
}

function selectClass(error?: string) {
    return `w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
        error ? 'border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-primary'
    } bg-background`;
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">{label}</label>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
