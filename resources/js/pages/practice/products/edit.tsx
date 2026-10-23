import { Link, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import type { Product } from '@/types';
import practice from '@/routes/practice';

type Props = {
    product: Product;
    categories: string[];
};

type FormData = {
    name: string;
    category: string;
    specification: string;
    base_unit: string;
    cost_price: string;
    selling_price: string;
    photo: File | null;
    _method: string;
};

export default function ProductEdit({ product, categories }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const { data, setData, post, processing } = useForm<FormData>({
        name: product.name,
        category: product.category,
        specification: product.specification ?? '',
        base_unit: product.base_unit,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        photo: null,
        _method: 'PUT',
    });

    const [categoryInput, setCategoryInput] = useState(product.category);
    const [showCatList, setShowCatList] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const filteredCats = categories.filter(
        (c) => c.toLowerCase().includes(categoryInput.toLowerCase()) && c !== categoryInput,
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
        post(practice.products.update.url({ barang: product.id }), { forceFormData: true });
    }

    return (
        <PracticeLayout title={`Edit: ${product.name}`}>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Link href={practice.products.show.url({ barang: product.id })} className="rounded-lg p-1.5 hover:bg-muted">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="flex-1 truncate text-lg font-bold">Edit Barang</h1>
                    <span className="text-xs text-muted-foreground">{product.code}</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                    {/* Info Dasar */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Info Dasar</h2>

                        <Field label="Nama Barang *" error={errors.name}>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={inputClass(errors.name)}
                                required
                            />
                        </Field>

                        <Field label="Kategori *" error={errors.category}>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={categoryInput}
                                    onChange={(e) => handleCategoryInput(e.target.value)}
                                    onFocus={() => setShowCatList(true)}
                                    onBlur={() => setTimeout(() => setShowCatList(false), 150)}
                                    className={inputClass(errors.category)}
                                    required
                                />
                                {showCatList && filteredCats.length > 0 && (
                                    <ul className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-card shadow-lg">
                                        {filteredCats.map((c) => (
                                            <li key={c}>
                                                <button type="button" onMouseDown={() => selectCategory(c)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted">
                                                    {c}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Field>

                        <Field label="Satuan Dasar *" error={errors.base_unit}>
                            <input
                                type="text"
                                value={data.base_unit}
                                onChange={(e) => setData('base_unit', e.target.value)}
                                className={inputClass(errors.base_unit)}
                                required
                            />
                        </Field>

                        <Field label="Spesifikasi" error={errors.specification}>
                            <textarea
                                value={data.specification}
                                onChange={(e) => setData('specification', e.target.value)}
                                rows={2}
                                className={inputClass(errors.specification)}
                            />
                        </Field>
                    </section>

                    {/* Harga */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Harga</h2>
                        <p className="text-xs text-muted-foreground bg-amber-50 rounded-lg px-3 py-2 text-amber-700">
                            ⚠️ Perubahan harga tidak mempengaruhi transaksi yang sudah ada.
                        </p>

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
                                    className={`${inputClass(errors.selling_price)} pl-9`}
                                    required
                                />
                            </div>
                        </Field>
                    </section>

                    {/* Foto */}
                    <section className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ganti Foto (Opsional)</h2>
                        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                        {photoPreview ? (
                            <div className="relative">
                                <img src={photoPreview} alt="Preview" className="h-40 w-full rounded-xl object-cover" />
                                <button type="button" onClick={() => { setPhotoPreview(null); setData('photo', null); if (fileRef.current) fileRef.current.value = ''; }}
                                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white">✕</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => fileRef.current?.click()}
                                className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                                📷 Pilih atau Ambil Foto Baru
                            </button>
                        )}
                        {errors.photo && <p className="text-xs text-destructive">{errors.photo}</p>}
                    </section>

                    <button
                        type="submit"
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-md disabled:opacity-60"
                    >
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Simpan Perubahan
                    </button>
                    <div className="pb-4" />
                </form>
            </div>
        </PracticeLayout>
    );
}

function inputClass(error?: string) {
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
