import { useEffect, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ScannedProduct = {
    id: number;
    code: string;
    name: string;
    category: string;
    base_unit: string;
    cost_price: number;
    selling_price: number;
    stock_good: number;
    stock_damaged: number;
    is_archived: boolean;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onSelectProduct: (product: ScannedProduct) => void;
    title?: string;
};

export default function BarcodeScannerModal({
    open,
    onClose,
    onSelectProduct,
    title = 'Pindai Barcode',
}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [isLoadingLookup, setIsLoadingLookup] = useState(false);
    const [foundProduct, setFoundProduct] = useState<ScannedProduct | null>(null);
    const [lookupError, setLookupError] = useState<string | null>(null);

    // Stop camera and cleanup tracks
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };

    // Start camera scanning with rear camera preferred
    const startCamera = async () => {
        setCameraError(null);
        setFoundProduct(null);
        setLookupError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsScanning(true);

                if (!codeReaderRef.current) {
                    codeReaderRef.current = new BrowserMultiFormatReader();
                }

                codeReaderRef.current.decodeFromVideoElement(videoRef.current, (result, err) => {
                    if (result) {
                        const text = result.getText();
                        stopCamera();
                        lookupCode(text);
                    }
                });
            }
        } catch (err: any) {
            stopCamera();
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setCameraError('Izin akses kamera ditolak. Silakan izinkan kamera atau gunakan input manual / upload foto.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setCameraError('Kamera tidak ditemukan pada perangkat ini.');
            } else {
                setCameraError('Gagal mengakses kamera: ' + (err.message || 'Kamera tidak tersedia.'));
            }
        }
    };

    // Handle lookup on backend server
    const lookupCode = async (code: string) => {
        if (!code.trim()) return;
        setIsLoadingLookup(true);
        setLookupError(null);
        setFoundProduct(null);

        try {
            const res = await fetch(`/praktik/barcode/lookup?code=${encodeURIComponent(code.trim())}`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await res.json();

            if (res.ok && data.found) {
                setFoundProduct(data.product);
            } else {
                setLookupError(data.message || `Barang dengan kode '${code}' tidak ditemukan.`);
            }
        } catch (e: any) {
            setLookupError('Terjadi kesalahan saat memeriksa kode barang.');
        } finally {
            setIsLoadingLookup(false);
        }
    };

    // Handle scan from image file upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCameraError(null);
        setLookupError(null);
        setFoundProduct(null);
        setIsLoadingLookup(true);

        try {
            const reader = new BrowserMultiFormatReader();
            const imageUrl = URL.createObjectURL(file);
            const img = new Image();
            img.src = imageUrl;

            img.onload = async () => {
                try {
                    const result = await reader.decodeFromImageElement(img);
                    URL.revokeObjectURL(imageUrl);
                    if (result) {
                        lookupCode(result.getText());
                    }
                } catch (decodeErr) {
                    URL.revokeObjectURL(imageUrl);
                    setIsLoadingLookup(false);
                    setLookupError('Barcode tidak terdeteksi pada gambar. Pastikan gambar jelas dan kontras.');
                }
            };
        } catch (err) {
            setIsLoadingLookup(false);
            setLookupError('Gagal memproses berkas gambar.');
        }
    };

    // Auto-start camera when dialog opens
    useEffect(() => {
        if (open) {
            setFoundProduct(null);
            setLookupError(null);
            setManualCode('');
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [open]);

    const handleConfirm = () => {
        if (foundProduct) {
            onSelectProduct(foundProduct);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md rounded-2xl p-5">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <Camera className="h-4 w-4 text-primary" />
                        <span>{title}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Viewfinder or Camera Error */}
                    {!foundProduct && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black flex items-center justify-center">
                            <video
                                ref={videoRef}
                                className={`h-full w-full object-cover ${!isScanning ? 'hidden' : ''}`}
                                playsInline
                                muted
                            />

                            {/* Scanning Guide Overlay */}
                            {isScanning && (
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
                                    <div className="relative h-28 w-48 rounded-lg border-2 border-primary/80 bg-primary/5">
                                        <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-primary" />
                                        <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-primary" />
                                        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary" />
                                        <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary" />
                                        {/* Scan laser line animation */}
                                        <div className="absolute inset-x-2 top-1/2 h-0.5 bg-primary/80 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                    </div>
                                    <span className="mt-2 text-[11px] font-medium text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
                                        Arahkan barcode ke dalam kotak
                                    </span>
                                </div>
                            )}

                            {/* Camera error/fallback message */}
                            {cameraError && (
                                <div className="p-4 text-center space-y-2">
                                    <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
                                    <p className="text-xs text-white/90 leading-relaxed">{cameraError}</p>
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                                    >
                                        Coba Lagi
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scanning / Loading Indicator */}
                    {isLoadingLookup && (
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 text-xs font-medium text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Mencari barang di ruang praktik...</span>
                        </div>
                    )}

                    {/* Found Product Card */}
                    {foundProduct && (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                                        {foundProduct.code}
                                    </span>
                                    <h4 className="font-bold text-foreground text-sm truncate">
                                        {foundProduct.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {foundProduct.category} · Satuan: {foundProduct.base_unit}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-500/20">
                                <span className="text-muted-foreground">Stok Baik:</span>
                                <span className="font-bold text-foreground">
                                    {foundProduct.stock_good} {foundProduct.base_unit}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFoundProduct(null);
                                        startCamera();
                                    }}
                                    className="rounded-lg border border-input bg-card py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                                >
                                    Pindai Ulang
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    className="rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all"
                                >
                                    Gunakan Barang Ini
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Lookup Error Message */}
                    {lookupError && (
                        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 space-y-1">
                            <p className="text-xs font-semibold text-destructive">{lookupError}</p>
                            <p className="text-[11px] text-muted-foreground">
                                Periksa apakah kode sesuai atau tambahkan barang terlebih dahulu di menu Data Barang.
                            </p>
                        </div>
                    )}

                    {/* Fallbacks: Manual Code Entry & Image Upload */}
                    {!foundProduct && (
                        <div className="space-y-3 pt-1 border-t border-border/40">
                            {/* Manual Input */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    lookupCode(manualCode);
                                }}
                                className="flex gap-2"
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                        placeholder="Ketik kode (misal BRG001)..."
                                        className="w-full rounded-xl border border-input bg-card py-2 pl-8 pr-3 text-xs font-mono uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!manualCode.trim() || isLoadingLookup}
                                    className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                                >
                                    Cari
                                </button>
                            </form>

                            {/* Scan from Image */}
                            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-input py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                                <span>Pindai dari Foto/Galeri</span>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
