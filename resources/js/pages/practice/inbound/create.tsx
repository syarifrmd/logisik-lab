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
    supplier: string;
    stock_condition: 'good' | 'damaged';
    storage_location: string;
    quantity: string;
    unit_price: string;
    notes: string;
    idempotency_key: string;
};

export default function InboundCreate({ products }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const preselectedId = new URLSearchParams(window.location.search).get('product_id') ?? '';
    const [scannerOpen, setScannerOpen] = useState(false);

    const { data, setData, post, processing } = useForm<FormData>({
        product_id: preselectedId,
        transaction_date: new Date().toISOString().slice(0, 10),
        external_document_number: '',
        supplier: '',
        stock_condition: 'good',
        storage_location: '',
        quantity: '',
        unit_price: '',
        notes: '',
        idempotency_key: generateUuid(),
    });

    const selectedProduct = products.find((p) => String(p.id) === data.product_id);

    // Auto-fill unit price from product cost_price when product selected
    useEffect(() => {
        if (selectedProduct && !data.unit_price) {
            setData('unit_price', selectedProduct.cost_price);
        }
    }, [data.product_id]);

    const totalAmount =
        data.quantity && data.unit_price
            ? parseInt(data.quantity) * parseFloat(data.unit_price)
            : 0;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(practice.inbound.store.url());
    }

    return (
        <PracticeLayout title="Catat Barang Masuk">
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Link href={practice.inbound.index.url()} className="rounded-lg p-1.5 hover:bg-muted">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-lg font-bold">Catat Barang Masuk</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Pilih Barang */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pilih Barang</h2>

                        <Field label="Barang *" error={errors.product_id}>
                            <div className="flex gap-2">
                                <select
                                    value={data.product_id}
                                    onChange={(e) => {
                                        setData((prev) => ({ ...prev, product_id: e.target.value, unit_price: '' }));
                                    }}
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
                            <div className="rounded-xl bg-teal-50 px-3 py-2 text-xs space-y-0.5">
                                <p className="font-medium text-teal-800">{selectedProduct.name}</p>
                                <p className="text-teal-600">Stok saat ini: {selectedProduct.stock_good} baik · {selectedProduct.stock_damaged} rusak</p>
                                <p className="text-teal-600">HPP: {formatRp(selectedProduct.cost_price)}</p>
                            </div>
                        )}
                    </section>

                    {/* Detail Transaksi */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Detail Penerimaan</h2>

                        <Field label="Tanggal Masuk *" error={errors.transaction_date}>
                            <input
                                type="date"
                                value={data.transaction_date}
                                onChange={(e) => setData('transaction_date', e.target.value)}
                                max={new Date().toISOString().slice(0, 10)}
                                className={inputClass(errors.transaction_date)}
                                required
                            />
                        </Field>

                        <Field label="No. Dokumen / Surat Jalan *" error={errors.external_document_number}>
                            <input
                                type="text"
                                value={data.external_document_number}
                                onChange={(e) => setData('external_document_number', e.target.value)}
                                placeholder="Contoh: SJ-001/X/2026"
                                className={inputClass(errors.external_document_number)}
                                required
                            />
                        </Field>

                        <Field label="Supplier *" error={errors.supplier}>
                            <input
                                type="text"
                                value={data.supplier}
                                onChange={(e) => setData('supplier', e.target.value)}
                                placeholder="Nama supplier / pemasok"
                                className={inputClass(errors.supplier)}
                                required
                            />
                        </Field>

                        <Field label="Lokasi Penyimpanan *" error={errors.storage_location}>
                            <input
                                type="text"
                                value={data.storage_location}
                                onChange={(e) => setData('storage_location', e.target.value)}
                                placeholder="Contoh: Gudang A, Rak 3"
                                className={inputClass(errors.storage_location)}
                                required
                            />
                        </Field>

                        <Field label="Kondisi Barang *" error={errors.stock_condition}>
                            <div className="flex gap-2">
                                {([
                                    { value: 'good', label: '✅ Baik' },
                                    { value: 'damaged', label: '⚠️ Rusak' },
                                ] as const).map((opt) => (
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
                        </Field>
                    </section>

                    {/* Jumlah & Harga */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Jumlah & Harga</h2>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label={`Jumlah (${selectedProduct?.base_unit ?? 'unit'}) *`} error={errors.quantity}>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
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

                        {/* Total preview */}
                        {totalAmount > 0 && (
                            <div className="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3">
                                <span className="text-sm text-teal-700">Total</span>
                                <span className="text-base font-bold text-teal-700">{formatRp(totalAmount)}</span>
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
                        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {errors.stock}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-base font-semibold text-white shadow-md disabled:opacity-60"
                    >
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Simpan Barang Masuk
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
                            unit_price: String(scanned.cost_price),
                        }));
                    }}
                    title="Pindai Barang Masuk"
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
