import { Head, Link, router, usePage } from '@inertiajs/react';
import { Package, Plus, Search, X, ChevronRight, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import { formatRp } from '@/lib/format';
import type { Product, Paginated } from '@/types';
import practice from '@/routes/practice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
    products: Paginated<Product>;
    categories: string[];
    filters: { search?: string; category?: string; status?: string };
};

export default function ProductsIndex({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [debounced, setDebounced] = useState(search);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const isArchived = filters.status === 'archived';

    // debounce search input
    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        if (debounced === (filters.search ?? '')) return;
        router.get(
            practice.products.index.url(),
            { ...filters, search: debounced || undefined, page: undefined },
            { preserveState: true, replace: true },
        );
    }, [debounced]);

    function applyFilter(extra: Record<string, string | undefined>) {
        router.get(
            practice.products.index.url(),
            { ...filters, ...extra, page: undefined },
            { preserveState: true, replace: true },
        );
    }

    function handleArchiveToggle(product: Product) {
        if (!product.id) {
            return;
        }

        const url = isArchived
            ? `/praktik/barang/${product.id}/reactivate`
            : `/praktik/barang/${product.id}/archive`;
        router.post(url, {}, { preserveScroll: true });
    }

    function handleDelete(product: Product) {
        if (!product.id) {
            return;
        }

        setDeleteTarget(product);
        setDeleteError(null);
    }

    function confirmDelete() {
        if (!deleteTarget?.id) {
            return;
        }

        setIsDeleting(true);
        router.delete(`/praktik/barang/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: (errors) => {
                setDeleteError(
                    errors.delete ??
                    'Barang tidak dapat dihapus. Jika sudah memiliki transaksi, gunakan Arsipkan.',
                );
            },
            onFinish: () => setIsDeleting(false),
        });
    }

    return (
        <PracticeLayout title="Data Barang">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-foreground">Data Barang</h1>
                    <Link
                        href={practice.products.create.url()}
                        className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm active:scale-95 transition-transform"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah
                    </Link>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kode atau nama barang..."
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        onClick={() => applyFilter({ status: undefined })}
                        className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!isArchived ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                        Aktif ({!isArchived ? products.total : '…'})
                    </button>
                    <button
                        onClick={() => applyFilter({ status: 'archived' })}
                        className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isArchived ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >
                        Diarsipkan
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => applyFilter({ category: filters.category === cat ? undefined : cat })}
                            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filters.category === cat ? 'bg-teal-600 text-white' : 'bg-muted text-muted-foreground'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Cards */}
                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-card py-16 text-center">
                        <Package className="h-12 w-12 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">Belum ada barang.</p>
                        {!isArchived && (
                            <Link
                                href={practice.products.create.url()}
                                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                            >
                                Tambah Barang Pertama
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {products.data.map((product) => {
                            const canDelete =
                                product.stock_good === 0 &&
                                product.stock_damaged === 0 &&
                                !product.stock_transactions_exists;

                            return (
                            <div key={product.id ?? product.code} className="group relative overflow-hidden rounded-2xl bg-card shadow-sm">
                                <Link
                                    href={product.id ? `/praktik/barang/${product.id}` : '#'}
                                    className="flex items-center gap-3 p-4"
                                >
                                    {/* Icon placeholder */}
                                    <div className="flex items-center gap-4">
                                        {product.photo_url ? (
                                            <img src={product.photo_url} alt={product.name} className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover" />
                                        ) : (
                                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                                                <Package className="h-8 w-8 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{product.code} · {product.category}</p>
                                            </div>
                                            {product.archived_at && (
                                                <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                                    Arsip
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1.5 flex items-center gap-3">
                                            <span className={`text-xs font-medium ${product.stock_good === 0 ? 'text-destructive' : 'text-foreground'}`}>
                                                Stok: {product.stock_good} {product.base_unit}
                                            </span>
                                            {product.stock_damaged > 0 && (
                                                <span className="text-xs text-amber-600">Rusak: {product.stock_damaged}</span>
                                            )}
                                            <span className="ml-auto text-xs text-muted-foreground">{formatRp(product.selling_price)}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                </Link>

                                {/* Swipe action row */}
                                <div className="flex border-t border-border/50">
                                    <Link
                                        href={product.id ? `/praktik/barang/${product.id}/edit` : '#'}
                                        className="flex-1 py-2.5 text-center text-xs font-medium text-primary"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleArchiveToggle(product)}
                                        className="flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-medium text-amber-600"
                                    >
                                        {isArchived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                                        {isArchived ? 'Aktifkan' : 'Arsipkan'}
                                    </button>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(product)}
                                            className="flex flex-1 items-center justify-center gap-1 py-2.5 text-xs font-medium text-destructive"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {products.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`min-w-[36px] rounded-lg px-2.5 py-1.5 text-center text-sm font-medium transition-colors ${link.active ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
                                >
                                    {getPaginationLabel(link.label)}
                                </Link>
                            ) : (
                                <span
                                    key={i}
                                    className="min-w-[36px] rounded-lg px-2.5 py-1.5 text-center text-sm text-muted-foreground"
                                >
                                    {getPaginationLabel(link.label)}
                                </span>
                            )
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}>
                <DialogContent className="max-w-md rounded-2xl p-5">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold text-destructive">
                            Hapus Barang?
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Barang <strong className="text-foreground">{deleteTarget?.name}</strong> akan dihapus permanen.
                            Barang hanya dapat dihapus jika stoknya sudah 0 dan belum memiliki riwayat transaksi.
                            Jika sudah pernah digunakan, gunakan Arsipkan.
                        </p>
                        {deleteError && (
                            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                {deleteError}
                            </p>
                        )}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold"
                                disabled={isDeleting}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="flex-1 rounded-xl text-white bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground disabled:opacity-60"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </PracticeLayout>
    );
}

function getPaginationLabel(label: string): string {
    const normalized = label.replace(/<[^>]*>/g, '').trim().toLowerCase();

    if (normalized.includes('pagination.previous') || normalized.includes('previous')) {
        return 'Sebelumnya';
    }

    if (normalized.includes('pagination.next') || normalized.includes('next')) {
        return 'Berikutnya';
    }

    return label
        .replace(/<[^>]*>/g, '')
        .replace(/&laquo;/gi, '«')
        .replace(/&raquo;/gi, '»')
        .trim();
}
