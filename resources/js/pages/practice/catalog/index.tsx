import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Search,
    Package,
    Tag,
    Boxes,
    Info,
    X,
    Barcode,
    Layers,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Check,
    Palette,
} from 'lucide-react';
import { useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import { formatRp } from '@/lib/format';
import type { Paginated, Product } from '@/types';
import practice from '@/routes/practice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
    products: Paginated<Product>;
    categories: string[];
    filters: {
        search?: string;
        category?: string;
        per_page?: number;
    };
};

export default function CatalogIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category ?? '');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const visibleIds = products.data.map((product) => product.id).filter((id): id is number => Boolean(id));
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    function toggleProduct(id?: number) {
        if (!id) return;
        setSelectedIds((current) => current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id]);
    }

    function toggleVisibleProducts() {
        setSelectedIds((current) => allVisibleSelected
            ? current.filter((id) => !visibleIds.includes(id))
            : [...new Set([...current, ...visibleIds])]);
    }

    function openBrochure() {
        if (selectedIds.length === 0) return;
        const query = selectedIds.map((id) => `products[]=${id}`).join('&');
        window.location.href = `/praktik/katalog/brosur?${query}`;
    }

    function applyFilters(newCategory?: string) {
        const cat = newCategory !== undefined ? newCategory : selectedCategory;
        router.get(
            '/praktik/katalog',
            {
                search: search || undefined,
                category: cat || undefined,
                per_page: filters.per_page,
            },
            { preserveState: true, replace: true }
        );
    }

    function handleCategoryClick(cat: string) {
        const next = selectedCategory === cat ? '' : cat;
        setSelectedCategory(next);
        applyFilters(next);
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        applyFilters();
    }

    return (
        <PracticeLayout title="Katalog Barang">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Katalog Barang
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Katalog produk aktif ruang praktik
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{products.total} Produk</span>
                        </div>
                        {selectedIds.length > 0 && (
                            <button type="button" onClick={openBrochure} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm">
                                <Palette className="h-3.5 w-3.5" />
                                Brosur ({selectedIds.length})
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-semibold text-foreground">Pilih produk untuk dibuatkan brosur</p>
                        <p className="text-muted-foreground">Bisa memilih satu per satu atau semua produk pada filter saat ini.</p>
                    </div>
                    <button type="button" onClick={toggleVisibleProducts} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-background px-3 py-2 font-semibold text-primary">
                        <Check className="h-3.5 w-3.5" />
                        {allVisibleSelected ? 'Batalkan Pilihan' : 'Pilih Semua'}
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kode atau nama barang..."
                        className="w-full rounded-2xl border border-input bg-card py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                router.get(
                                    '/praktik/katalog',
                                    { category: selectedCategory || undefined },
                                    { preserveState: true }
                                );
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </form>

                {/* Category Chips */}
                {categories.length > 0 && (
                    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                        <button
                            type="button"
                            onClick={() => handleCategoryClick('')}
                            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                                !selectedCategory
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-card text-muted-foreground hover:bg-muted border border-border/60'
                            }`}
                        >
                            Semua
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryClick(cat)}
                                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                                    selectedCategory === cat
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-card text-muted-foreground hover:bg-muted border border-border/60'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Catalog Grid */}
                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 p-8 text-center">
                        <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
                        <p className="text-base font-semibold text-foreground">
                            Tidak ada barang ditemukan
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Coba ubah kata kunci pencarian atau kategori filter
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                        {products.data.map((product) => {
                            const isAvailable = product.stock_good > 0;
                            return (
                                <div
                                    key={product.id}
                                    className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
                                >
                                    <button
                                        type="button"
                                        aria-label={`Pilih ${product.name}`}
                                        onClick={() => toggleProduct(product.id)}
                                        className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg border-2 transition-colors ${product.id && selectedIds.includes(product.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-white bg-white/90 text-transparent shadow-sm'}`}
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <div>
                                        {/* Top Image / Placeholder */}
                                        <div className="relative mb-3 flex h-36 w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/5 via-muted to-primary/10 overflow-hidden">
                                            {product.photo_url ? (
                                                <img
                                                    src={product.photo_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground/60">
                                                    <Package className="h-10 w-10 text-primary/40 group-hover:scale-110 transition-transform" />
                                                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
                                                        {product.code}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Stock Status Badge */}
                                            <div className="absolute top-2.5 right-2.5">
                                                {isAvailable ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 backdrop-blur-sm border border-emerald-500/20">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Tersedia
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 backdrop-blur-sm border border-rose-500/20">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                        Habis
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="text-[11px] font-mono text-muted-foreground">
                                                    {product.code}
                                                </span>
                                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                    {product.category}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
                                                {product.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="mt-4 pt-3 border-t border-border/40">
                                        <div className="flex items-baseline justify-between mb-3">
                                            <span className="text-[11px] text-muted-foreground">
                                                Harga Jual
                                            </span>
                                            <span className="text-base font-extrabold text-foreground">
                                                {formatRp(product.selling_price)}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedProduct(product)}
                                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-primary-foreground py-2 text-xs font-semibold text-primary transition-all active:scale-[0.98]"
                                        >
                                            <Info className="h-3.5 w-3.5" />
                                            <span>Lihat Detail</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-border/60 pt-4">
                        <p className="text-xs text-muted-foreground">
                            Halaman {products.current_page} dari {products.last_page} ({products.total} item)
                        </p>
                        <div className="flex items-center gap-2">
                            {products.prev_page_url && (
                                <Link
                                    href={products.prev_page_url}
                                    preserveState
                                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-input bg-card px-2.5 text-xs font-medium hover:bg-muted"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    <span>Sebelumnya</span>
                                </Link>
                            )}
                            {products.next_page_url && (
                                <Link
                                    href={products.next_page_url}
                                    preserveState
                                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-input bg-card px-2.5 text-xs font-medium hover:bg-muted"
                                >
                                    <span>Selanjutnya</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent className="max-w-md rounded-2xl p-6">
                    {selectedProduct && (
                        <div className="space-y-5">
                            <DialogHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {selectedProduct.code}
                                            </span>
                                            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                {selectedProduct.category}
                                            </span>
                                        </div>
                                        <DialogTitle className="mt-1 text-lg font-bold">
                                            {selectedProduct.name}
                                        </DialogTitle>
                                    </div>
                                    <div>
                                        {selectedProduct.stock_good > 0 ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Tersedia
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 border border-rose-500/20">
                                                <XCircle className="h-3.5 w-3.5" />
                                                Habis
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Details Grid */}
                            <div className="space-y-3 rounded-xl bg-muted/40 p-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Satuan Dasar</span>
                                    <span className="font-semibold text-foreground uppercase">
                                        {selectedProduct.base_unit}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Harga Jual</span>
                                    <span className="font-bold text-foreground text-sm">
                                        {formatRp(selectedProduct.selling_price)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Stok Baik Tersedia</span>
                                    <span className="font-bold text-emerald-600 text-sm">
                                        {selectedProduct.stock_good} {selectedProduct.base_unit}
                                    </span>
                                </div>
                                {selectedProduct.specification && (
                                    <div className="border-t border-border/40 pt-2 text-xs">
                                        <span className="text-muted-foreground block mb-1">Spesifikasi</span>
                                        <p className="text-foreground leading-relaxed">
                                            {selectedProduct.specification}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link
                                    href={practice.products.show.url({ product: selectedProduct.id })}
                                    className="flex items-center justify-center gap-1.5 rounded-xl bg-card border border-input hover:bg-muted py-2.5 text-xs font-semibold text-foreground transition-all"
                                >
                                    <Package className="h-4 w-4 text-primary" />
                                    <span>Detail Master</span>
                                </Link>
                                <Link
                                    href={`/praktik/barcode?code=${selectedProduct.code}`}
                                    className="flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 text-xs font-semibold transition-all"
                                >
                                    <Barcode className="h-4 w-4" />
                                    <span>Cetak Barcode</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PracticeLayout>
    );
}
