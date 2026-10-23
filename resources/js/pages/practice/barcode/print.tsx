import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { Printer } from 'lucide-react';
import type { Product } from '@/types';

type Props = {
    product: Product;
    barcodeSvg: string;
};

export default function BarcodePrint({ product, barcodeSvg }: Props) {
    useEffect(() => {
        // Auto-open print dialog on load
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title={`Cetak Barcode - ${product.code}`} />

            <style>{`
                @page {
                    size: 60mm 35mm;
                    margin: 0;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: #fff !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .label-container {
                        width: 60mm !important;
                        height: 35mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        page-break-inside: avoid;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-neutral-100 p-4 flex flex-col items-center justify-center font-sans">
                {/* Screen-only Controls */}
                <div className="no-print mb-4 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak Label Sekarang</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => window.close()}
                        className="rounded-xl border border-input bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                        Tutup
                    </button>
                </div>

                {/* 60 x 35 mm Physical Label */}
                <div
                    className="label-container flex flex-col justify-between items-center bg-white p-2.5 text-black shadow-md border border-neutral-300 rounded"
                    style={{
                        width: '60mm',
                        height: '35mm',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Header / Product Name */}
                    <div className="w-full text-center">
                        <p
                            className="font-bold text-neutral-900 leading-tight truncate"
                            style={{ fontSize: '9pt' }}
                        >
                            {product.name}
                        </p>
                    </div>

                    {/* Barcode SVG */}
                    <div
                        className="w-full flex justify-center items-center overflow-hidden my-0.5"
                        style={{ maxHeight: '18mm' }}
                        dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                    />

                    {/* Footer / Code */}
                    <div className="w-full text-center">
                        <p
                            className="font-mono font-bold tracking-widest text-neutral-900 leading-none"
                            style={{ fontSize: '10pt' }}
                        >
                            {product.code}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
