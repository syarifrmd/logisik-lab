import { Link, router } from '@inertiajs/react';
import { ChevronLeft, Package, Archive, ArchiveRestore, ArrowDownToLine, ArrowUpFromLine, Pencil, Barcode } from 'lucide-react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import { formatRp, formatDate } from '@/lib/format';
import type { Product, StockTransaction } from '@/types';
import practice from '@/routes/practice';

type Props = {
    product: Product & { stock_transactions: StockTransaction[] };
    barcodeSvg: string;
};

const conditionLabel = (c: string) => (c === 'good' ? 'Baik' : 'Rusak');
const typeLabel = (t: string) => (t === 'opening' ? 'Saldo Awal' : t === 'inbound' ? 'Masuk' : 'Keluar');
const reasonLabel: Record<string, string> = { sale: 'Penjualan', usage: 'Pemakaian', return: 'Retur' };

export default function ProductShow({ product, barcodeSvg }: Props) {
    const transactions = product.stock_transactions ?? [];

    function handleArchiveToggle() {
        const isArchived = !!product.archived_at;
        const url = isArchived
            ? practice.products.reactivate.url({ product: product.id })
            : practice.products.archive.url({ product: product.id });
        router.post(url, {}, { preserveScroll: true });
    }

    return (
        <PracticeLayout title={product.name}>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <Link href={practice.products.index.url()} className="rounded-lg p-1.5 hover:bg-muted">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="flex-1 truncate text-lg font-bold">{product.name}</h1>
                    <Link href={practice.products.edit.url({ product: product.id })} className="rounded-lg p-2 hover:bg-muted text-primary">
                        <Pencil className="h-4 w-4" />
                    </Link>
                </div>

                {/* Info Card */}
                <div className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                    {product.archived_at && (
                        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
                            <Archive className="h-4 w-4 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700">Diarsipkan pada {formatDate(product.archived_at)}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        {product.photo_url ? (
                            <img src={product.photo_url} alt={product.name} className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover" />
                        ) : (
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                                <Package className="h-8 w-8 text-primary" />
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-muted-foreground">{product.code}</p>
                            <p className="font-semibold text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-card p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Barcode Barang</h2>
                            <Barcode className="h-4 w-4 text-primary" />
                        </div>
                        <div className="overflow-x-auto flex justify-center rounded-xl border border-border bg-white p-3 [&>svg]:mx-auto" dangerouslySetInnerHTML={{ __html: barcodeSvg }} />
                        <div className="mt-3 flex gap-2">
                            <a href={`/praktik/barcode/${product.id}/download`} className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-semibold text-primary-foreground">
                                Unduh Barcode
                            </a>
                            <a href={`/praktik/barcode/${product.id}/cetak`} className="flex-1 rounded-xl border border-border py-2 text-center text-xs font-semibold">
                                Cetak
                            </a>
                        </div>
                    </div>

                    {product.specification && (
                        <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">{product.specification}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <InfoItem label="Satuan" value={product.base_unit} />
                        <InfoItem label="Harga Pokok" value={formatRp(product.cost_price)} />
                        <InfoItem label="Harga Jual" value={formatRp(product.selling_price)} />
                        <InfoItem label="Dibuat" value={formatDate(product.created_at)} />
                    </div>
                </div>

                {/* Stock Card */}
                <div className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                    <h2 className="text-sm font-semibold">Stok Fisik</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <StockBox
                            label="Baik"
                            value={product.stock_good}
                            unit={product.base_unit}
                            color={product.stock_good === 0 ? 'text-destructive' : 'text-teal-600'}
                            bg="bg-teal-50"
                        />
                        <StockBox
                            label="Rusak"
                            value={product.stock_damaged}
                            unit={product.base_unit}
                            color="text-amber-600"
                            bg="bg-amber-50"
                        />
                        <StockBox
                            label="Total"
                            value={product.stock_good + product.stock_damaged}
                            unit={product.base_unit}
                            color="text-indigo-600"
                            bg="bg-indigo-50"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link
                        href={`${practice.inbound.create.url()}?product_id=${product.id}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-sm"
                    >
                        <ArrowDownToLine className="h-4 w-4" />
                        Barang Masuk
                    </Link>
                    <Link
                        href={`${practice.outbound.create.url()}?product_id=${product.id}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white shadow-sm"
                    >
                        <ArrowUpFromLine className="h-4 w-4" />
                        Barang Keluar
                    </Link>
                </div>

                {/* Transaction History */}
                <div className="rounded-2xl bg-card shadow-sm">
                    <div className="border-b border-border p-4">
                        <h2 className="text-sm font-semibold">Riwayat Transaksi ({transactions.length})</h2>
                    </div>
                    {transactions.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">Belum ada transaksi.</p>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {transactions.map((tx) => {
                                const content = (
                                    <>
                                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${tx.type === 'opening' ? 'bg-indigo-100' : tx.type === 'inbound' ? 'bg-teal-100' : 'bg-amber-100'}`}>
                                            {tx.type === 'opening'
                                                ? <Package className="h-4 w-4 text-indigo-600" />
                                                : tx.type === 'inbound'
                                                    ? <ArrowDownToLine className="h-4 w-4 text-teal-600" />
                                                    : <ArrowUpFromLine className="h-4 w-4 text-amber-600" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">{tx.transaction_number}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(tx.transaction_date)} · {typeLabel(tx.type)}
                                                {tx.reason ? ` (${reasonLabel[tx.reason] ?? tx.reason})` : ''}
                                                {' · '}{conditionLabel(tx.stock_condition)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${tx.type === 'outbound' ? 'text-amber-600' : 'text-teal-600'}`}>
                                                {tx.type === 'outbound' ? '-' : '+'}{tx.quantity} {product.base_unit}
                                            </p>
                                            {tx.voided_at && <span className="text-[10px] text-destructive">Dibatalkan</span>}
                                        </div>
                                    </>
                                );

                                return tx.type === 'opening' ? (
                                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3">{content}</div>
                                ) : (
                                    <Link
                                        key={tx.id}
                                        href={tx.type === 'inbound'
                                            ? practice.inbound.show.url({ transaction: tx.id })
                                            : practice.outbound.show.url({ transaction: tx.id })}
                                        className="flex items-center gap-3 px-4 py-3"
                                    >
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Archive action */}
                <button
                    onClick={handleArchiveToggle}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium transition-colors ${
                        product.archived_at
                            ? 'border-teal-600 text-teal-600 hover:bg-teal-50'
                            : 'border-amber-500 text-amber-600 hover:bg-amber-50'
                    }`}
                >
                    {product.archived_at ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    {product.archived_at ? 'Aktifkan Kembali' : 'Arsipkan Barang'}
                </button>

                <div className="pb-4" />
            </div>

        </PracticeLayout>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-muted/40 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value}</p>
        </div>
    );
}

function StockBox({ label, value, unit, color, bg }: { label: string; value: number; unit: string; color: string; bg: string }) {
    return (
        <div className={`rounded-xl ${bg} px-3 py-3 text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{unit}</p>
            <p className="text-[11px] font-medium text-foreground">{label}</p>
        </div>
    );
}
