import { Head, Link, router } from '@inertiajs/react';
import {
    ScanLine,
    Download,
    Printer,
    Package,
    Camera,
    CheckCircle2,
    ArrowRight,
    ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import BarcodeScannerModal from '@/components/practice/barcode-scanner-modal';
import type { Product } from '@/types';
import practice from '@/routes/practice';
import { formatRp } from '@/lib/format';

type Props = {
    products: Array<Pick<Product, 'id' | 'code' | 'name' | 'category' | 'selling_price' | 'stock_good' | 'base_unit'>>;
    selectedProduct: Product | null;
    barcodeSvg: string | null;
};

export default function BarcodeIndex({ products, selectedProduct, barcodeSvg }: Props) {
    const [scannerOpen, setScannerOpen] = useState(false);

    function handleProductChange(productId: string) {
        if (!productId) {
            router.get('/praktik/barcode', {}, { preserveState: true });
            return;
        }
        router.get('/praktik/barcode', { product_id: productId }, { preserveState: true });
    }

    function handleScannedProduct(scanned: any) {
        router.get('/praktik/barcode', { code: scanned.code }, { preserveState: true });
    }

    return (
        <PracticeLayout title="Barcode">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            Barcode Generator & Scanner
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Buat label Code 128 dan pindai menggunakan kamera ponsel
                        </p>
                    </div>
                </div>

                {/* Selection & Scan Button */}
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground">
                        Pilih Barang
                    </label>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={selectedProduct?.id ?? ''}
                                onChange={(e) => handleProductChange(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-input bg-card py-2.5 pl-3 pr-8 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">-- Pilih Barang Aktif --</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.code} - {p.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        </div>

                        <button
                            type="button"
                            onClick={() => setScannerOpen(true)}
                            className="flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-primary-foreground px-3.5 py-2.5 text-xs font-semibold text-primary transition-all active:scale-[0.98]"
                        >
                            <Camera className="h-4 w-4" />
                            <span className="hidden sm:inline">Pindai</span>
                        </button>
                    </div>
                </div>

                {/* Barcode Preview Card */}
                {selectedProduct && barcodeSvg ? (
                    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-border/40 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                    {selectedProduct.code}
                                </span>
                                <h3 className="text-sm font-bold text-foreground">
                                    {selectedProduct.name}
                                </h3>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                Format: Code 128
                            </span>
                        </div>

                        {/* Visual Label 60 x 35 mm Preview */}
                        <div className="flex justify-center p-3 bg-muted/30 rounded-xl">
                            <div
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-dashed border-border bg-white p-4 shadow-sm text-black"
                                style={{
                                    width: '260px',
                                    minHeight: '150px',
                                }}
                            >
                                <p className="text-[11px] font-bold text-center text-neutral-800 line-clamp-1 w-full">
                                    {selectedProduct.name}
                                </p>

                                <div
                                    className="my-2 flex justify-center w-full overflow-hidden"
                                    dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                                />

                                <p className="text-xs font-mono font-bold tracking-widest text-neutral-900">
                                    {selectedProduct.code}
                                </p>
                            </div>
                        </div>

                        {/* Product Meta */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="rounded-xl bg-muted/40 p-2.5">
                                <span className="text-muted-foreground block text-[10px]">Kategori</span>
                                <span className="font-medium text-foreground">{selectedProduct.category}</span>
                            </div>
                            <div className="rounded-xl bg-muted/40 p-2.5">
                                <span className="text-muted-foreground block text-[10px]">Satuan</span>
                                <span className="font-medium text-foreground">{selectedProduct.base_unit}</span>
                            </div>
                            <div className="rounded-xl bg-muted/40 p-2.5">
                                <span className="text-muted-foreground block text-[10px]">Harga Jual</span>
                                <span className="font-bold text-foreground">{formatRp(selectedProduct.selling_price)}</span>
                            </div>
                            <div className="rounded-xl bg-muted/40 p-2.5">
                                <span className="text-muted-foreground block text-[10px]">Stok Baik</span>
                                <span className="font-bold text-emerald-600">
                                    {selectedProduct.stock_good} {selectedProduct.base_unit}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                            <a
                                href={`/praktik/barcode/${selectedProduct.id}/download`}
                                download
                                className="flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 text-xs font-semibold shadow-sm transition-all"
                            >
                                <Download className="h-4 w-4" />
                                <span>Unduh SVG</span>
                            </a>

                            <a
                                href={`/praktik/barcode/${selectedProduct.id}/cetak`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 rounded-xl border border-input bg-card hover:bg-muted py-2.5 text-xs font-semibold text-foreground transition-all"
                            >
                                <Printer className="h-4 w-4 text-primary" />
                                <span>Cetak Label (60x35mm)</span>
                            </a>

                            <Link
                                href={practice.products.show.url({ product: selectedProduct.id })}
                                className="flex items-center justify-center gap-2 rounded-xl border border-input bg-card hover:bg-muted py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                            >
                                <Package className="h-4 w-4" />
                                <span>Detail Barang</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 p-8 text-center space-y-2">
                        <ScanLine className="h-12 w-12 text-muted-foreground/40" />
                        <h3 className="text-sm font-semibold text-foreground">
                            Belum Ada Barang Dipilih
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            Pilih barang dari menu di atas atau gunakan kamera untuk memindai barcode fisik yang telah ada.
                        </p>
                    </div>
                )}
            </div>

            {/* Camera Scanner Modal */}
            <BarcodeScannerModal
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onSelectProduct={handleScannedProduct}
                title="Pindai Barcode Barang"
            />
        </PracticeLayout>
    );
}
