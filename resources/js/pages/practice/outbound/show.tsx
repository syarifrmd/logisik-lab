import { Link, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ArrowUpFromLine, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import { formatDate, formatRp } from '@/lib/format';
import type { StockTransaction } from '@/types';
import practice from '@/routes/practice';

type Props = { transaction: StockTransaction };

const conditionLabel = (c: string) => (c === 'good' ? 'Baik' : 'Rusak');
const reasonLabel: Record<string, string> = { sale: 'Penjualan', usage: 'Pemakaian', return: 'Retur' };

export default function OutboundShow({ transaction }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const [showVoidForm, setShowVoidForm] = useState(false);
    const { data, setData, post, processing } = useForm({ reason: '' });
    const isVoided = !!transaction.voided_at;

    function handleVoid(e: React.FormEvent) {
        e.preventDefault();
        if (!confirm('Yakin ingin membatalkan transaksi ini? Stok akan dikembalikan.')) return;
        post(practice.outbound.void.url({ transaction: transaction.id }), {
            onSuccess: () => setShowVoidForm(false),
        });
    }

    return (
        <PracticeLayout title={transaction.transaction_number}>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Link href={practice.outbound.index.url()} className="rounded-lg p-1.5 hover:bg-muted">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="truncate text-base font-bold">{transaction.transaction_number}</h1>
                        <p className="text-xs text-muted-foreground">Barang Keluar</p>
                    </div>
                    {isVoided ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">Dibatalkan</span>
                    ) : (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Aktif</span>
                    )}
                </div>

                {isVoided && (
                    <div className="rounded-xl bg-red-50 p-4 space-y-1">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <p className="text-sm font-semibold text-red-600">Transaksi Dibatalkan</p>
                        </div>
                        <p className="text-xs text-red-500">Tanggal: {formatDate(transaction.voided_at)}</p>
                        {transaction.void_reason && <p className="text-xs text-red-500">Alasan: {transaction.void_reason}</p>}
                    </div>
                )}

                {transaction.product && (
                    <Link
                        href={practice.products.show.url({ product: transaction.product.id })}
                        className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
                            <ArrowUpFromLine className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{transaction.product.name}</p>
                            <p className="text-xs text-muted-foreground">{transaction.product.code} · {transaction.product.category}</p>
                        </div>
                    </Link>
                )}

                <div className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                    <h2 className="text-sm font-semibold">Detail Transaksi</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <InfoItem label="Tanggal" value={formatDate(transaction.transaction_date)} />
                        <InfoItem label="No. Dokumen" value={transaction.external_document_number ?? '-'} />
                        <InfoItem label="Alasan" value={transaction.reason ? (reasonLabel[transaction.reason] ?? transaction.reason) : '-'} />
                        <InfoItem label="Kondisi" value={conditionLabel(transaction.stock_condition)} />
                        <InfoItem label="Penerima / Tujuan" value={transaction.recipient ?? '-'} />
                        <InfoItem label="Dibuat" value={formatDate(transaction.created_at)} />
                    </div>
                </div>

                {/* Amount */}
                <div className="rounded-2xl bg-amber-500 p-4 shadow-sm text-white">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-sm text-amber-100">Jumlah Keluar</p>
                            <p className="text-3xl font-bold">-{transaction.quantity}</p>
                            <p className="text-sm text-amber-100">{transaction.product?.base_unit ?? 'unit'} · {conditionLabel(transaction.stock_condition)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-amber-100">Total Nilai</p>
                            <p className="text-xl font-bold">{formatRp(transaction.total_amount)}</p>
                            <p className="text-xs text-amber-200">{formatRp(transaction.unit_price)} / unit</p>
                        </div>
                    </div>
                </div>

                {transaction.notes && (
                    <div className="rounded-2xl bg-card p-4 shadow-sm">
                        <p className="text-xs text-muted-foreground mb-1">Catatan</p>
                        <p className="text-sm text-foreground">{transaction.notes}</p>
                    </div>
                )}

                {!isVoided && (
                    <Link
                        href={`${practice.shipments.create.url()}?outbound_id=${transaction.id}`}
                        className="flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
                    >
                        Lanjut ke Pengiriman
                    </Link>
                )}

                {!isVoided && (
                    <div className="rounded-2xl bg-card p-4 shadow-sm space-y-3">
                        {!showVoidForm ? (
                            <button
                                onClick={() => setShowVoidForm(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive py-2.5 text-sm font-medium text-destructive"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                Batalkan Transaksi
                            </button>
                        ) : (
                            <form onSubmit={handleVoid} className="space-y-3">
                                <p className="text-sm font-semibold text-destructive">Konfirmasi Pembatalan</p>
                                <p className="text-xs text-muted-foreground">Stok yang keluar akan dikembalikan ke gudang.</p>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Alasan Pembatalan *</label>
                                    <textarea
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        rows={2}
                                        placeholder="Jelaskan alasan pembatalan..."
                                        className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-destructive bg-background"
                                        required
                                    />
                                    {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
                                    {errors.void && <p className="text-xs text-destructive">{errors.void}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowVoidForm(false)}
                                        className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium">
                                        Batal
                                    </button>
                                    <button type="submit" disabled={processing}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Konfirmasi
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                <div className="pb-4" />
            </div>
        </PracticeLayout>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-muted/40 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground break-words">{value}</p>
        </div>
    );
}
