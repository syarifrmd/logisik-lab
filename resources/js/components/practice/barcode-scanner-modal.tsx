import { useEffect, useRef, useState } from "react";
import {
    Camera,
    Image as ImageIcon,
    AlertCircle,
    CheckCircle2,
    Search,
    Loader2,
    RefreshCw,
} from "lucide-react";
import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats,
    type Html5QrcodeResult,
    type CameraDevice,
} from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    onCodeDetected?: (code: string) => void;
    title?: string;
};

type ZoomCapabilities = MediaTrackCapabilities & {
    zoom?: {
        min: number;
        max: number;
    };
};

const CAMERA_STORAGE_KEY = "practice.barcode.selected-camera";
const SCANNER_ELEMENT_ID = "barcode-scanner-viewport";

const SCAN_FORMATS = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.AZTEC,
    Html5QrcodeSupportedFormats.CODABAR,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.CODE_93,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
    Html5QrcodeSupportedFormats.MAXICODE,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.PDF_417,
    Html5QrcodeSupportedFormats.RSS_14,
    Html5QrcodeSupportedFormats.RSS_EXPANDED,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.UPC_EAN_EXTENSION,
];

export default function BarcodeScannerModal({
    open,
    onClose,
    onSelectProduct,
    onCodeDetected,
    title = "Pindai Barcode",
}: Props) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isStoppingRef = useRef(false);
    // Use a ref (not state) so the guard value is always current inside async
    // callbacks and is never stale due to React batching.
    const isStartingRef = useRef(false);
    const scanDoneRef = useRef(false);
    const scanSessionRef = useRef(0);
    const scanReadyAtRef = useRef(0);

    const [isScanning, setIsScanning] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [manualCode, setManualCode] = useState("");
    const [isLoadingLookup, setIsLoadingLookup] = useState(false);
    const [foundProduct, setFoundProduct] = useState<ScannedProduct | null>(null);
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState("");
    const [isLoadingCameras, setIsLoadingCameras] = useState(false);
    const [zoomSupported, setZoomSupported] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const videoTrackRef = useRef<MediaStreamTrack | null>(null);

    /** Helper: stop every MediaStreamTrack the browser is still holding. */
    const releaseAllTracks = () => {
        // 1. Tracks held by html5-qrcode internally
        const scanner = scannerRef.current;
        if (scanner) {
            try {
                const stream = (scanner as any)._localMediaStream as MediaStream | undefined;
                stream?.getTracks().forEach((t) => t.stop());
            } catch {
                // best-effort
            }
        }
        // 2. Tracks attached to any <video> element inside the scanner container
        const el = document.getElementById(SCANNER_ELEMENT_ID);
        el?.querySelectorAll("video").forEach((v) => {
            const src = v.srcObject;
            if (src instanceof MediaStream) {
                src.getTracks().forEach((t) => t.stop());
            }
            v.srcObject = null;
        });
    };

    const stopScanner = async () => {
        // Invalidate callbacks from the previous html5-qrcode instance
        // immediately, before waiting for its asynchronous stop operation.
        scanSessionRef.current += 1;
        scanReadyAtRef.current = Number.MAX_SAFE_INTEGER;
        if (isStoppingRef.current) return;
        isStoppingRef.current = true;
        try {
            const scanner = scannerRef.current;
            if (scanner) {
                const state = scanner.getState();
                // 2 = SCANNING, 3 = PAUSED
                if (state === 2 || state === 3) {
                    await scanner.stop();
                }
                scanner.clear();
            }
            // Explicitly release hardware tracks that html5-qrcode may not free
            releaseAllTracks();
        } catch {
            // ignore stop errors — still clean up below
            releaseAllTracks();
        } finally {
            scannerRef.current = null;
            videoTrackRef.current = null;
            isStoppingRef.current = false;
            setIsScanning(false);
            // Wipe the container's innerHTML so the next Html5Qrcode instance
            // can mount cleanly without conflicting with leftover video/canvas nodes.
            const el = document.getElementById(SCANNER_ELEMENT_ID);
            if (el) el.innerHTML = "";
            // Give the OS/browser ~300 ms to physically release the camera
            // before a new getUserMedia call can succeed.
            await new Promise((r) => setTimeout(r, 300));
        }
    };

    /**
     * Enumerate available cameras.  Browser only returns device labels after
     * camera permission has been granted, so we briefly call getUserMedia first
     * to trigger the permission prompt, then enumerate.
     */
    const loadCameras = async (): Promise<CameraDevice[]> => {
        setIsLoadingCameras(true);
        try {
            // Html5Qrcode.getCameras() internally requests permission via getUserMedia
            // so labels will be populated after the first successful call.
            const devices = await Html5Qrcode.getCameras();
            setCameras(devices);
            return devices;
        } catch {
            return [];
        } finally {
            setIsLoadingCameras(false);
        }
    };

    const startScanner = async (requestedCameraId?: string) => {
        // Ref-based guard prevents stale-closure false-positives that caused
        // camera-switch to silently no-op when isStarting state was still true.
        if (isStartingRef.current) return;
        isStartingRef.current = true;
        setCameraError(null);
        setFoundProduct(null);
        setLookupError(null);
        scanDoneRef.current = false;
        setIsStarting(true);

        if (
            typeof navigator === "undefined" ||
            !window.isSecureContext ||
            !navigator.mediaDevices?.getUserMedia
        ) {
            const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(
                window.location.hostname,
            );
            setCameraError(
                isLocalhost
                    ? "Browser ini tidak mendukung akses kamera. Gunakan input kode atau upload foto."
                    : "Kamera diblokir karena halaman belum HTTPS. Buka melalui https:// atau localhost.",
            );
            setIsStarting(false);
            return;
        }

        await stopScanner();

        try {
            const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
                formatsToSupport: SCAN_FORMATS,
                useBarCodeDetectorIfSupported: false,
                verbose: false,
            });
            scannerRef.current = scanner;
            const sessionId = ++scanSessionRef.current;
            // DroidCam/virtual cameras can briefly replay their last frame
            // while the new source is being attached.
            scanReadyAtRef.current = Date.now() + 1000;

            const storedId = localStorage.getItem(CAMERA_STORAGE_KEY) ?? "";
            const cameraId = requestedCameraId ?? selectedCameraId ?? storedId;
            const onScanSuccess = (decodedText: string, _result: Html5QrcodeResult) => {
                if (
                    scanDoneRef.current ||
                    sessionId !== scanSessionRef.current ||
                    scannerRef.current !== scanner ||
                    Date.now() < scanReadyAtRef.current
                ) {
                    return;
                }
                scanDoneRef.current = true;

                void stopScanner().finally(() => {
                    if (onCodeDetected) {
                        onCodeDetected(decodedText.trim());
                        onClose();
                        return;
                    }

                    void lookupCode(decodedText);
                });
            };

            const cameraConfig = cameraId
                ? { deviceId: { exact: cameraId } }
                : { facingMode: "environment" };

            // html5-qrcode gives `videoConstraints` precedence over
            // cameraIdOrConfig. Keep the selected device in this object too,
            // otherwise the browser silently falls back to the integrated
            // camera whenever resolution constraints are present.
            const videoConstraints: MediaTrackConstraints = cameraId
                ? {
                    deviceId: { exact: cameraId },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                }
                : {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                };

            await scanner.start(
                cameraConfig,
                {
                    // Keep a large decoding region so the barcode on a
                    // monitor is isolated from the surrounding UI/noise.
                    fps: 15,
                    qrbox: (viewfinderWidth, viewfinderHeight) => ({
                        width: Math.floor(viewfinderWidth * 0.9),
                        height: Math.floor(viewfinderHeight * 0.8),
                    }),
                    aspectRatio: 16 / 9,
                    disableFlip: false,
                    videoConstraints,
                },
                onScanSuccess,
                () => {
                    // onScanFailure fires every frame with no barcode -- ignore
                },
            );

            setIsScanning(true);

            try {
                const track = (scanner as any)._localMediaStream?.getVideoTracks()[0];
                videoTrackRef.current = track ?? null;
                const activeCameraId = track?.getSettings()?.deviceId;

                if (track?.applyConstraints) {
                    try {
                        const capabilities = track.getCapabilities?.() as ZoomCapabilities | undefined;
        const zoom = (capabilities as ZoomCapabilities | undefined)?.zoom;
                        if (zoom && zoom.max > zoom.min) {
                            setZoomSupported(true);
                            setZoomLevel(Math.max(1, zoom.min));
                        } else {
                            setZoomSupported(false);
                        }
                        const cameraEnhancements = {
                            advanced: [
                                { focusMode: "continuous" },
                                { exposureMode: "continuous" },
                                { whiteBalanceMode: "continuous" },
                            ],
                        } as unknown as MediaTrackConstraints;
                        await track.applyConstraints(cameraEnhancements);
                    } catch {
                        // Virtual cameras may not expose focus/exposure
                        // controls; scanning remains valid without them.
                    }
                }

                if (activeCameraId) {
                    setSelectedCameraId(activeCameraId);
                    localStorage.setItem(CAMERA_STORAGE_KEY, activeCameraId);
                }
            } catch {
                // best-effort only
            }

            await loadCameras();
        } catch (err: unknown) {
            await stopScanner();

            const name = err instanceof DOMException ? err.name : "";
            const msg = err instanceof Error ? err.message : String(err);

            if (name === "NotAllowedError" || name === "PermissionDeniedError") {
                setCameraError("Izin kamera ditolak. Silakan izinkan kamera di browser lalu coba lagi.");
            } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
                setCameraError("Kamera tidak ditemukan pada perangkat ini.");
            } else if (name === "OverconstrainedError" && requestedCameraId) {
                // Saved camera ID no longer valid — clear it and retry without constraint
                setSelectedCameraId("");
                localStorage.removeItem(CAMERA_STORAGE_KEY);
                isStartingRef.current = false;
                setIsStarting(false);
                await startScanner(undefined);
                return;
            } else if (
                name === "NotReadableError" ||
                (msg ?? "").toLowerCase().includes("could not start video")
            ) {
                // Camera hardware is still physically held by the previous stream.
                // Force-release then show an actionable error — do NOT auto-retry
                // because the root cause (another app holding the camera) won't
                // resolve by itself and would create an infinite retry loop.
                releaseAllTracks();
                setCameraError(
                    "Kamera gagal dibuka (sedang dipakai aplikasi lain). " +
                    "Tutup aplikasi kamera lain atau pilih kamera yang berbeda, lalu tekan Coba Lagi.",
                );
            } else {
                setCameraError("Gagal mengakses kamera: " + (msg || "Kamera tidak tersedia."));
            }
        } finally {
            isStartingRef.current = false;
            setIsStarting(false);
        }
    };

    const handleCameraChange = async (cameraId: string) => {
        setSelectedCameraId(cameraId);
        setZoomSupported(false);
        setZoomLevel(1);
        setFoundProduct(null);
        setLookupError(null);
        setIsLoadingLookup(false);
        scanDoneRef.current = false;
        localStorage.setItem(CAMERA_STORAGE_KEY, cameraId);
        // Fully stop the current session and reset the guard so startScanner
        // is not blocked by a leftover isStartingRef from the previous camera.
        await stopScanner();
        isStartingRef.current = false;
        setIsStarting(false);
        await startScanner(cameraId);
    };

    const handleZoomChange = async (nextZoom: number) => {
        const track = videoTrackRef.current;
        const capabilities = track?.getCapabilities?.() as ZoomCapabilities | undefined;
        const zoom = capabilities?.zoom;

        if (!track?.applyConstraints || !zoom) {
            return;
        }

        const clampedZoom = Math.min(zoom.max, Math.max(zoom.min, nextZoom));
        try {
            await track.applyConstraints({
                advanced: [{ zoom: clampedZoom }],
            } as unknown as MediaTrackConstraints);
            setZoomLevel(clampedZoom);
        } catch {
            setCameraError("Zoom kamera tidak dapat digunakan pada perangkat ini.");
        }
    };

    const handleRescan = async () => {
        setFoundProduct(null);
        setLookupError(null);
        scanDoneRef.current = false;

        await stopScanner();

        // The result card unmounts the scanner container. Wait for React to
        // commit that DOM change before html5-qrcode mounts a new session.
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        await startScanner(selectedCameraId || undefined);
    };

    const lookupCode = async (code: string) => {
        if (!code.trim()) return;
        setIsLoadingLookup(true);
        setLookupError(null);
        setFoundProduct(null);

        try {
            const res = await fetch(
                `/praktik/barcode/lookup?code=${encodeURIComponent(code.trim())}`,
                { headers: { Accept: "application/json" } },
            );
            const data = await res.json();

            if (res.ok && data.found) {
                setFoundProduct(data.product);
            } else {
                setLookupError(data.message || `Barang dengan kode "${code}" tidak ditemukan.`);
            }
        } catch {
            setLookupError("Terjadi kesalahan saat memeriksa kode barang.");
        } finally {
            setIsLoadingLookup(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCameraError(null);
        setLookupError(null);
        setFoundProduct(null);
        setIsLoadingLookup(true);

        const tempId = "barcode-scanner-temp-img";
        let tempDiv: HTMLDivElement | null = document.createElement("div");
        tempDiv.id = tempId;
        tempDiv.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;";
        document.body.appendChild(tempDiv);

        try {
            const tempScanner = new Html5Qrcode(tempId, {
                formatsToSupport: SCAN_FORMATS,
                verbose: false,
            });
            const result = await tempScanner.scanFile(file, false);
            tempScanner.clear();
            lookupCode(result);
        } catch {
            setIsLoadingLookup(false);
            setLookupError("Barcode tidak terdeteksi pada gambar. Pastikan gambar jelas dan barcode terlihat penuh.");
        } finally {
            tempDiv?.remove();
            tempDiv = null;
        }
    };

    useEffect(() => {
        if (open) {
            setFoundProduct(null);
            setLookupError(null);
            setManualCode("");
            // Load camera list eagerly so the selector is populated even if
            // the scanner itself fails to start.
            // Then start the scanner with a small delay so the Dialog DOM is mounted.
            const timer = setTimeout(async () => {
                await loadCameras();
                await startScanner();
            }, 120);
            return () => clearTimeout(timer);
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
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
                    {!foundProduct && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                            {/*
                             * html5-qrcode mounts its <video> and <canvas> inside here.
                             * We suppress the default QR-box overlay with CSS and show our own.
                             */}
                            <div
                                id={SCANNER_ELEMENT_ID}
                                className="h-full w-full [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover [&_img]:hidden [&_#qr-shaded-region]:hidden"
                            />

                            {/* Custom scan guide overlay */}
                            {isScanning && (
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
                                    <div className="relative h-24 w-[90%] rounded-lg border-2 border-primary/80 bg-primary/5">
                                        <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-primary" />
                                        <div className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-primary" />
                                        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary" />
                                        <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary" />
                                        <div className="absolute inset-x-2 top-1/2 h-0.5 animate-pulse bg-primary/80 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                    </div>
                                    <span className="mt-2 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white/80">
                                        Dekatkan barcode sampai memenuhi area biru
                                    </span>
                                    <span className="mt-1 text-[10px] text-emerald-300">Scanner aktif</span>
                                </div>
                            )}

                            {/* Loading while camera starts */}
                            {isStarting && !cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="text-xs">Memulai kamera...</span>
                                </div>
                            )}

                            {/* Camera error */}
                            {cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2">
                                    <AlertCircle className="h-8 w-8 text-amber-400" />
                                    <p className="text-xs leading-relaxed text-white/90">{cameraError}</p>
                                    <button
                                        type="button"
                                        onClick={() => startScanner()}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                                    >
                                        Coba Lagi
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Camera selector */}
                    {!foundProduct && !cameraError && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 flex-shrink-0 text-primary" />
                            <select
                                value={selectedCameraId}
                                onChange={(e) => handleCameraChange(e.target.value)}
                                disabled={isLoadingCameras || cameras.length === 0}
                                className="min-w-0 flex-1 rounded-lg border border-input bg-card px-2 py-1.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                aria-label="Pilih kamera"
                            >
                                {cameras.length === 0 ? (
                                    <option value="">Kamera otomatis</option>
                                ) : (
                                    cameras.map((cam, idx) => (
                                        <option key={cam.id} value={cam.id}>
                                            {cam.label || `Kamera ${idx + 1}`}
                                        </option>
                                    ))
                                )}
                            </select>
                            <button
                                type="button"
                                onClick={() => loadCameras()}
                                disabled={isLoadingCameras}
                                className="rounded-lg border border-input p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50"
                                aria-label="Muat ulang daftar kamera"
                                title="Muat ulang daftar kamera"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingCameras ? "animate-spin" : ""}`} />
                            </button>
                            </div>
                            {zoomSupported && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="w-12 flex-shrink-0">Zoom</span>
                                    <input
                                        type="range"
                                        min={1}
                                        max={Math.max(2, Math.round(((videoTrackRef.current?.getCapabilities?.() as ZoomCapabilities | undefined)?.zoom?.max ?? 2)))}
                                        step={0.1}
                                        value={zoomLevel}
                                        onChange={(event) => void handleZoomChange(Number(event.target.value))}
                                        className="min-w-0 flex-1 accent-primary"
                                        aria-label="Zoom kamera"
                                    />
                                    <span className="w-8 text-right font-mono">{zoomLevel.toFixed(1)}x</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lookup loading */}
                    {isLoadingLookup && (
                        <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 text-xs font-medium text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Mencari barang di ruang praktik...</span>
                        </div>
                    )}

                    {/* Found product */}
                    {foundProduct && (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                            <div className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-emerald-600" />
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
                                    onClick={() => void handleRescan()}
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

                    {/* Lookup error */}
                    {lookupError && (
                        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 space-y-1">
                            <p className="text-xs font-semibold text-destructive">{lookupError}</p>
                            <p className="text-[11px] text-muted-foreground">
                                Periksa apakah kode sesuai atau tambahkan barang di menu Data Barang.
                            </p>
                        </div>
                    )}

                    {/* Manual input & image upload */}
                    {!foundProduct && (
                        <div className="space-y-3 border-t border-border/40 pt-1">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (onCodeDetected && manualCode.trim()) {
                                        onCodeDetected(manualCode.trim());
                                        onClose();
                                        return;
                                    }
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
                                        autoFocus
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

                            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-input py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50">
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
