import { Link, router } from '@inertiajs/react';
import { ArrowUpFromLine, ChevronRight, Search, X, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import { formatDate, formatRp } from '@/lib/format';
import type { StockTransaction, Paginated } from '@/types';
import practice from '@/routes/practice';

const reasonLabel: Record<string, string> = { sale: 'Penjualan', usage: 'Pemakaian', return: 'Retur' };

type Props = {
    transactions: Paginated<StockTransaction>;
    filters: { search?: string; status?: string };
};

export default function OutboundIndex({ transactions, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [debounced, setDebounced] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        if (debounced === (filters.search ?? '')) return;
        router.get(
            practice.outbound.index.url(),
            { ...filters, search: debounced || undefined, page: undefined },
            { preserveState: true, replace: true },
        );
    }, [debounced]);

    function applyFilter(extra: Record<string, string | undefined>) {
        router.get(
            practice.outbound.index.url(),
            { ...filters, ...extra, page: undefined },
            { preserveState: true, replace: true },
        );
    }

    return (
        <PracticeLayout title="Barang Keluar">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold">Barang Keluar</h1>
                    <Link
                        href={practice.outbound.create.url()}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm active:scale-95 transition-transform"
                    >
                        <Plus className="h-4 w-4" />
                        Catat
                    </Link>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari no. dokumen, penerima..."
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm focus:border-primary focus:outline-none"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    {[
                        { label: 'Semua', value: undefined },
                        { label: 'Aktif', value: 'active' },
                        { label: 'Dibatalkan', value: 'voided' },
                    ].map((f) => (
                        <button
                            key={String(f.value)}
                            onClick={() => applyFilter({ status: f.value })}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                filters.status === f.value ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {transactions.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl bg-card py-16 text-center">
                        <ArrowUpFromLine className="h-12 w-12 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">Belum ada transaksi keluar.</p>
                        <Link href={practice.outbound.create.url()} className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white">
                            Catat Barang Keluar
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {transactions.data.map((tx) => (
                            <Link
                                key={tx.id}
                                href={practice.outbound.show.url({ transaction: tx.id })}
                                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm"
                            >
                                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${tx.voided_at ? 'bg-muted' : 'bg-amber-100'}`}>
                                    <ArrowUpFromLine className={`h-5 w-5 ${tx.voided_at ? 'text-muted-foreground' : 'text-amber-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-semibold">{tx.transaction_number}</p>
                                        {tx.voided_at && (
                                            <span className="flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600">Batal</span>
                                        )}
                                    </div>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {formatDate(tx.transaction_date)} · {tx.product?.name ?? '-'} · {tx.recipient ?? '-'}
                                    </p>
                                    <p className="text-xs font-medium text-amber-600">
                                        -{tx.quantity} {tx.product?.base_unit}
                                        {tx.reason ? ` · ${reasonLabel[tx.reason] ?? tx.reason}` : ''}
                                        {' · '}{formatRp(tx.total_amount)}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            </Link>
                        ))}
                    </div>
                )}

                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {transactions.links.map((link, i) => (
                            link.url ? (
                                <Link key={i} href={link.url}
                                    className={`min-w-[36px] rounded-lg px-2.5 py-1.5 text-center text-sm font-medium ${link.active ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ) : (
                                <span key={i} className="min-w-[36px] rounded-lg px-2.5 py-1.5 text-center text-sm text-muted-foreground"
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            )
                        ))}
                    </div>
                )}
            </div>
        </PracticeLayout>
    );
}
