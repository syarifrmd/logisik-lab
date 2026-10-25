import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Camera, ChevronLeft, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import practice from '@/routes/practice';
import BarcodeScannerModal from '@/components/practice/barcode-scanner-modal';

type Props = {
    suggestedCode: string;
    categories: string[];
    barcodeMode: 'automatic' | 'existing';
};

type FormData = {
    code: string;
    name: string;
    category: string;
    specification: string;
    base_unit: string;
    cost_price: string;
    selling_price: string;
    stock_good: string;
    stock_date: string;
    photo: File | null;
};

export default function ProductCreate({ suggestedCode, categories, barcodeMode }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const { data, setData, post, processing } = useForm<FormData>({
        code: suggestedCode,
        name: '',
        category: '',
        specification: '',
        base_unit: '',
        cost_price: '',
        selling_price: '',
        stock_good: '0',
        stock_date: '',
        photo: null,
    });

    const [categoryInput, setCategoryInput] = useState('');
    const [showCatList, setShowCatList] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [codeMode, setCodeMode] = useState<'automatic' | 'existing'>(barcodeMode);
    const [scannerOpen, setScannerOpen] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const filteredCats = categories.filter((c) =>
        c.toLowerCase().includes(categoryInput.toLowerCase()),
    );

    function handleCategoryInput(val: string) {
        setCategoryInput(val);
        setData('category', val);
        setShowCatList(true);
    }

    function selectCategory(cat: string) {
        setData('category', cat);
        setCategoryInput(cat);
        setShowCatList(false);
    }

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('photo', file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(null);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(practice.products.store.url(), {
            forceFormData: true,
        });
    }

    function handleCodeModeChange(mode: 'automatic' | 'existing') {
        setCodeMode(mode);
        setData('code', mode === 'automatic' ? suggestedCode : '');
    }

    return (
        <PracticeLayout title="Tambah Barang">
            <div className="space-y-4">
                {/* Back + Title */}
                <div className="flex items-center gap-2">
                    <Link href={practice.products.index.url()} className="rounded-lg p-1.5 hover:bg-muted">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-lg font-bold">Tambah Barang</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                    {/* Card: Info Dasar */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Info Dasar</h2>

                        <Field label="Barcode Produk *" error={errors.code}>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleCodeModeChange('automatic')}
                                    className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors ${codeMode === 'automatic' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}
                                >
                                    <span className="block font-semibold">Buat otomatis</span>
                                    <span className="mt-0.5 block text-[10px]">Kode {suggestedCode}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleCodeModeChange('existing')}
                                    className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors ${codeMode === 'existing' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}
                                >
                                    <span className="block font-semibold">Barcode sudah ada</span>
                                    <span className="mt-0.5 block text-[10px]">Masukkan kode fisik</span>
                                </button>
                            </div>
                            <input
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                placeholder={codeMode === 'automatic' ? suggestedCode : 'Contoh: 8991234567890'}
                                readOnly={codeMode === 'automatic'}
                                className={inputClass(errors.code)}
                                required
                            />
                            {codeMode === 'existing' && (
                                <button
                                    type="button"
                                    onClick={() => setScannerOpen(true)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10"
                                >
                                    <Camera className="h-4 w-4" />
                                    Scan Barcode dari Produk
                                </button>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {codeMode === 'automatic'
                                    ? 'Sistem membuat barcode Code 128 baru untuk barang ini.'
                                    : 'Masukkan angka/huruf yang tercetak pada barcode produk. Kode harus unik.'}
                            </p>
                        </Field>

                        <Field label="Nama Barang *" error={errors.name}>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Beras Premium 5kg"
                                className={inputClass(errors.name)}
                                required
                            />
                        </Field>

                        {/* Category with autocomplete */}
                        <Field label="Kategori *" error={errors.category}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={categoryInput}
                                    onChange={(e) => handleCategoryInput(e.target.value)}
                                    onFocus={() => setShowCatList(true)}
                                    onBlur={() => setTimeout(() => setShowCatList(false), 150)}
                                    placeholder="Contoh: Sembako"
                                    className={inputClass(errors.category)}
                                    required
                                />
                                {showCatList && filteredCats.length > 0 && (
                                    <ul className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card shadow-lg">
                                        {filteredCats.map((c) => (
                                            <li key={c}>
                                                <button
                                                    type="button"
                                                    onMouseDown={() => selectCategory(c)}
                                                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted"
                                                >
                                                    {c}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Field>

                        <Field label="Satuan Dasar *" hint="Contoh: pcs, kg, dus, liter" error={errors.base_unit}>
                            <input
                                type="text"
                                value={data.base_unit}
                                onChange={(e) => setData('base_unit', e.target.value)}
                                placeholder="pcs"
                                className={inputClass(errors.base_unit)}
                                required
                            />
                        </Field>

                        <Field label="Spesifikasi" hint="Opsional" error={errors.specification}>
                            <textarea
                                value={data.specification}
                                onChange={(e) => setData('specification', e.target.value)}
                                rows={2}
                                placeholder="Deskripsi singkat barang..."
                                className={inputClass(errors.specification)}
                            />
                        </Field>
                    </section>

                    {/* Card: Harga */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Harga</h2>

                        <Field label="Harga Pokok (HPP) *" error={errors.cost_price}>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    step="1"
                                    value={data.cost_price}
                                    onChange={(e) => setData('cost_price', e.target.value)}
                                    placeholder="0"
                                    className={`${inputClass(errors.cost_price)} pl-9`}
                                    required
                                />
                            </div>
                        </Field>

                        <Field label="Harga Jual *" error={errors.selling_price}>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    step="1"
                                    value={data.selling_price}
                                    onChange={(e) => setData('selling_price', e.target.value)}
                                    placeholder="0"
                                    className={`${inputClass(errors.selling_price)} pl-9`}
                                    required
                                />
                            </div>
                        </Field>
                    </section>

                    {/* Card: Stok Awal */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Stok Awal</h2>
                        <p className="text-xs text-muted-foreground">Stok awal dianggap kondisi baik. Setelah disimpan, perubahan stok hanya melalui transaksi.</p>

                        <Field label="Jumlah Stok Awal *" error={errors.stock_good}>
                            <input
                                type="number"
                                inputMode="numeric"
                                min="0"
                                step="1"
                                value={data.stock_good}
                                onChange={(e) => setData('stock_good', e.target.value)}
                                className={inputClass(errors.stock_good)}
                                required
                            />
                        </Field>

                        {parseInt(data.stock_good) > 0 && (
                            <Field label="Tanggal Saldo Awal *" error={errors.stock_date}>
                                <input
                                    type="date"
                                    value={data.stock_date}
                                    onChange={(e) => setData('stock_date', e.target.value)}
                                    max={new Date().toISOString().slice(0, 10)}
                                    className={inputClass(errors.stock_date)}
                                    required
                                />
                            </Field>
                        )}
                    </section>

                    {/* Card: Foto */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Foto (Opsional)</h2>
                        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                        {photoPreview ? (
                            <div className="relative">
                                <img src={photoPreview} alt="Preview" className="h-40 w-full rounded-xl object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setPhotoPreview(null); setData('photo', null); if (fileRef.current) fileRef.current.value = ''; }}
                                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="flex h-28 w-full items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                                📷 Pilih atau Ambil Foto
                            </button>
                        )}
                        {errors.photo && <p className="text-xs text-destructive">{errors.photo}</p>}
                    </section>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-opacity disabled:opacity-60"
                    >
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Simpan Barang
                    </button>

                    <div className="pb-4" />
                </form>
            </div>
            <BarcodeScannerModal
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onSelectProduct={() => undefined}
                onCodeDetected={(code) => setData('code', code)}
                title="Scan Barcode Produk"
            />
        </PracticeLayout>
    );
}

function inputClass(error?: string) {
    return `w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${
        error ? 'border-destructive focus:ring-destructive' : 'border-border focus:border-primary focus:ring-primary'
    } bg-background`;
}

function Field({
    label,
    hint,
    error,
    children,
}: {
    label: string;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">{label}</label>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
