import { Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    Truck,
    Ship,
    Plane,
    Calendar,
    MapPin,
    Package,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Plus,
    X,
    Upload,
    Paperclip,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import { formatDate, formatRp } from '@/lib/format';
import type { Shipment, ShipmentDocument } from '@/types';
import practice from '@/routes/practice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
    shipment: Shipment;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    scheduled: { label: 'Dijadwalkan', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    shipped: { label: 'Dikirim', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    in_transit: { label: 'Dalam Perjalanan', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
    received: { label: 'Diterima', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'Dibatalkan', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
};

const documentTypesByMode: Record<string, Array<{ val: string; label: string }>> = {
    land: [
        { val: 'surat_jalan', label: 'Surat Jalan' },
        { val: 'invoice', label: 'Faktur / Invoice' },
        { val: 'packing_list', label: 'Packing List' },
        { val: 'delivery_receipt', label: 'Bukti Terima' },
    ],
    sea: [
        { val: 'surat_jalan', label: 'Surat Jalan' },
        { val: 'bill_of_lading', label: 'Bill of Lading (B/L)' },
        { val: 'invoice', label: 'Faktur / Invoice' },
        { val: 'packing_list', label: 'Packing List' },
        { val: 'delivery_receipt', label: 'Bukti Terima' },
    ],
    air: [
        { val: 'surat_jalan', label: 'Surat Jalan' },
        { val: 'airway_bill', label: 'Airway Bill (AWB)' },
        { val: 'invoice', label: 'Faktur / Invoice' },
        { val: 'packing_list', label: 'Packing List' },
        { val: 'delivery_receipt', label: 'Bukti Terima' },
    ],
};

export default function ShipmentShow({ shipment }: Props) {
    const { errors } = usePage().props as { errors: Record<string, string> };

    // Dialog states
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
    const [docDialogOpen, setDocDialogOpen] = useState(false);

    // Cancel form
    const cancelForm = useForm({
        reason: '',
    });

    // Receive form
    const receiveForm = useForm({
        status: 'received',
        received_date: new Date().toISOString().slice(0, 10),
    });

    // Document form
    const docForm = useForm({
        document_type: 'surat_jalan',
        document_number: '',
        document_date: new Date().toISOString().slice(0, 10),
        notes: '',
        file: null as File | null,
    });

    const status = statusConfig[shipment.status] ?? {
        label: shipment.status,
        color: 'text-muted-foreground',
        bg: 'bg-muted border-border',
    };

    function handleAdvanceStatus(newStatus: string) {
        if (!confirm(`Konfirmasi pembaruan status ke ${newStatus}?`)) return;
        router.post(`/praktik/transportasi/${shipment.id}/status`, {
            status: newStatus,
        });
    }

    function handleCancelSubmit(e: React.FormEvent) {
        e.preventDefault();
        cancelForm.post(`/praktik/transportasi/${shipment.id}/batal`, {
            onSuccess: () => setCancelDialogOpen(false),
        });
    }

    function handleReceiveSubmit(e: React.FormEvent) {
        e.preventDefault();
        receiveForm.post(`/praktik/transportasi/${shipment.id}/status`, {
            onSuccess: () => setReceiveDialogOpen(false),
        });
    }

    function handleDocSubmit(e: React.FormEvent) {
        e.preventDefault();
        docForm.post(`/praktik/transportasi/${shipment.id}/dokumen`, {
            onSuccess: () => {
                setDocDialogOpen(false);
                docForm.reset();
            },
        });
    }

    const availableDocTypes = documentTypesByMode[shipment.transport_mode] ?? documentTypesByMode.land;

    return (
        <PracticeLayout title={shipment.shipment_number}>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <Link href="/praktik/transportasi" className="rounded-lg p-1.5 hover:bg-muted">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="truncate text-base font-bold font-mono">{shipment.shipment_number}</h1>
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                                {shipment.shipment_type}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Detail Pengiriman</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${status.color} ${status.bg}`}>
                        {status.label}
                    </span>
                </div>

                {/* Cancellation notice */}
                {shipment.status === 'cancelled' && (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-1">
                        <div className="flex items-center gap-2 text-destructive font-bold text-xs">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Pengiriman Dibatalkan</span>
                        </div>
                        <p className="text-xs text-destructive/80">Alasan: {shipment.cancellation_reason}</p>
                        <p className="text-[11px] text-muted-foreground">Waktu: {formatDate(shipment.cancelled_at)}</p>
                    </div>
                )}

                {/* Status Progression Bar */}
                {shipment.status !== 'cancelled' && (
                    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/60 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground">Alur Status</span>
                            <span className="text-muted-foreground text-[11px]">4 Tahap Normal</span>
                        </div>

                        {/* Tracker steps */}
                        <div className="grid grid-cols-4 gap-1.5">
                            {[
                                { key: 'scheduled', label: 'Dijadwalkan' },
                                { key: 'shipped', label: 'Dikirim' },
                                { key: 'in_transit', label: 'Di Perjalanan' },
                                { key: 'received', label: 'Diterima' },
                            ].map((step, idx) => {
                                const stepOrder = ['scheduled', 'shipped', 'in_transit', 'received'];
                                const currentIndex = stepOrder.indexOf(shipment.status);
                                const isDone = idx <= currentIndex;
                                const isCurrent = idx === currentIndex;

                                return (
                                    <div key={step.key} className="flex flex-col items-center gap-1 text-center">
                                        <div
                                            className={`h-2 w-full rounded-full transition-all ${
                                                isDone ? 'bg-primary' : 'bg-muted'
                                            } ${isCurrent ? 'ring-2 ring-primary/40' : ''}`}
                                        />
                                        <span
                                            className={`text-[10px] leading-tight ${
                                                isCurrent ? 'font-bold text-primary' : isDone ? 'font-medium text-foreground' : 'text-muted-foreground'
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Buttons depending on status */}
                        <div className="pt-2 border-t border-border/40 flex gap-2">
                            {shipment.status === 'scheduled' && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleAdvanceStatus('shipped')}
                                        className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
                                    >
                                        Konfirmasi Dikirim
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCancelDialogOpen(true)}
                                        className="rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10 px-3 py-2.5 text-xs font-semibold"
                                    >
                                        Batalkan
                                    </button>
                                </>
                            )}

                            {shipment.status === 'shipped' && (
                                <button
                                    type="button"
                                    onClick={() => handleAdvanceStatus('in_transit')}
                                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
                                >
                                    Mulai Perjalanan
                                </button>
                            )}

                            {shipment.status === 'in_transit' && (
                                <button
                                    type="button"
                                    onClick={() => setReceiveDialogOpen(true)}
                                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
                                >
                                    Konfirmasi Barang Diterima
                                </button>
                            )}

                            {shipment.status === 'received' && (
                                <div className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Pengiriman Telah Selesai Diterima pada {formatDate(shipment.received_date)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section: Route & Transport */}
                <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/60 space-y-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rute & Kendaraan</h3>
                    <div className="rounded-xl bg-muted/40 p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Asal:</span>
                            <strong className="text-foreground">{shipment.origin} ({shipment.origin_country})</strong>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Tujuan:</span>
                            <strong className="text-foreground">{shipment.destination} ({shipment.destination_country})</strong>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                            <span className="text-muted-foreground">Moda & Armada:</span>
                            <strong className="text-foreground">{shipment.transport_mode.toUpperCase()} · {shipment.fleet_type}</strong>
                        </div>
                        {shipment.carrier_service && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Pengangkut:</span>
                                <span className="text-foreground font-medium">{shipment.carrier_service}</span>
                            </div>
                        )}
                        {shipment.tracking_number && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">No. Resi:</span>
                                <span className="font-mono font-bold text-primary">{shipment.tracking_number}</span>
                            </div>
                        )}
                        {shipment.driver_name && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Pengemudi:</span>
                                <span className="text-foreground">{shipment.driver_name}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Estimasi Biaya:</span>
                            <strong className="text-foreground text-sm">{formatRp(shipment.estimated_cost)}</strong>
                        </div>
                    </div>
                </div>

                {/* Section: Allocated Items */}
                <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Barang Muatan ({shipment.items?.length ?? 0})
                        </h3>
                        <span className="text-xs font-bold text-foreground">
                            Total {parseFloat(shipment.total_weight_kg)} kg
                        </span>
                    </div>

                    <div className="divide-y divide-border/40">
                        {shipment.items?.map((it) => (
                            <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-[10px] text-muted-foreground">{it.product_code_snapshot}</span>
                                        <span className="rounded bg-muted px-1 py-0.2 text-[9px] font-medium text-muted-foreground">{it.category_snapshot}</span>
                                    </div>
                                    <p className="font-bold text-foreground mt-0.5">{it.product_name_snapshot}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Kondisi: {it.stock_condition === 'good' ? 'Baik' : 'Rusak'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <strong className="text-sm font-extrabold text-foreground">
                                        {it.quantity} {it.base_unit_snapshot}
                                    </strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Documents */}
                <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Dokumen Pengiriman ({shipment.documents?.length ?? 0})
                            </h3>
                            <p className="text-[11px] text-muted-foreground">Lampiran berkas dan bukti perjalanan</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDocDialogOpen(true)}
                            className="inline-flex items-center gap-1 rounded-xl bg-primary/10 hover:bg-primary hover:text-primary-foreground px-2.5 py-1 text-xs font-bold text-primary transition-all"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Tambah</span>
                        </button>
                    </div>

                    {shipment.documents && shipment.documents.length > 0 ? (
                        <div className="space-y-2">
                            {shipment.documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 text-xs"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                        <div>
                                            <p className="font-bold text-foreground">{doc.document_type.replace('_', ' ').toUpperCase()}</p>
                                            <p className="font-mono text-[11px] text-muted-foreground">{doc.document_number}</p>
                                        </div>
                                    </div>
                                    {doc.attachment_path ? (
                                        <a
                                            href={`/storage/${doc.attachment_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                        >
                                            <Paperclip className="h-3.5 w-3.5" />
                                            <span>Unduh</span>
                                        </a>
                                    ) : (
                                        <span className="text-[10px] text-muted-foreground italic">Tanpa lampiran</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                            Belum ada dokumen yang dilampirkan. Klik tombol Tambah di atas untuk mencatat nomor Surat Jalan atau dokumen lainnya.
                        </div>
                    )}
                </div>

                {/* Section: Status History Timeline */}
                {shipment.status_histories && shipment.status_histories.length > 0 && (
                    <div className="rounded-2xl bg-card p-4 shadow-sm border border-border/60 space-y-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Histori Perubahan Status</h3>
                        <div className="space-y-2 text-xs">
                            {shipment.status_histories.map((hist) => (
                                <div key={hist.id} className="flex items-start gap-2 border-l-2 border-primary/40 pl-3 py-1">
                                    <div className="flex-1">
                                        <span className="font-bold text-foreground">
                                            {statusConfig[hist.to_status]?.label ?? hist.to_status}
                                        </span>
                                        {hist.notes && <p className="text-[11px] text-muted-foreground">{hist.notes}</p>}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        {formatDate(hist.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl p-5">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold text-destructive">
                            Batalkan Pengiriman
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCancelSubmit} className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                            Pembatalan hanya diperbolehkan saat status Dijadwalkan. Alokasi kuantitas barang keluar akan dilepaskan kembali.
                        </p>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-foreground">Alasan Pembatalan *</label>
                            <textarea
                                value={cancelForm.data.reason}
                                onChange={(e) => cancelForm.setData('reason', e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-input p-2.5 text-xs focus:border-destructive focus:outline-none"
                                placeholder="Jelaskan alasan pembatalan (minimal 5 karakter)..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={cancelForm.processing || cancelForm.data.reason.length < 5}
                            className="w-full rounded-xl bg-destructive py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50"
                        >
                            Konfirmasi Pembatalan
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Receive Dialog */}
            <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl p-5">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold text-emerald-600">
                            Konfirmasi Barang Diterima
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReceiveSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-foreground">Tanggal Diterima *</label>
                            <input
                                type="date"
                                value={receiveForm.data.received_date}
                                onChange={(e) => receiveForm.setData('received_date', e.target.value)}
                                className="w-full rounded-xl border border-input p-2.5 text-xs"
                                max={new Date().toISOString().slice(0, 10)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={receiveForm.processing}
                            className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm"
                        >
                            Konfirmasi Selesai Diterima
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Document Dialog */}
            <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl p-5">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-bold text-foreground">
                            Tambah Dokumen Pengiriman
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleDocSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Jenis Dokumen *</label>
                            <select
                                value={docForm.data.document_type}
                                onChange={(e) => docForm.setData('document_type', e.target.value)}
                                className="w-full rounded-xl border border-input p-2.5 text-xs font-medium"
                            >
                                {availableDocTypes.map((dt) => (
                                    <option key={dt.val} value={dt.val}>
                                        {dt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Nomor Dokumen *</label>
                            <input
                                type="text"
                                value={docForm.data.document_number}
                                onChange={(e) => docForm.setData('document_number', e.target.value)}
                                className="w-full rounded-xl border border-input p-2.5 text-xs font-mono"
                                placeholder="Misal: SJ/2026/10/001"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Tanggal Dokumen</label>
                            <input
                                type="date"
                                value={docForm.data.document_date}
                                onChange={(e) => docForm.setData('document_date', e.target.value)}
                                className="w-full rounded-xl border border-input p-2.5 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Lampiran Berkas (PDF / JPEG / PNG, maks 5 MB)</label>
                            <input
                                type="file"
                                accept="application/pdf,image/jpeg,image/png"
                                onChange={(e) => docForm.setData('file', e.target.files?.[0] || null)}
                                className="w-full rounded-xl border border-input p-2 text-xs"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={docForm.processing || !docForm.data.document_number}
                            className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm disabled:opacity-50"
                        >
                            Simpan Dokumen
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </PracticeLayout>
    );
}
