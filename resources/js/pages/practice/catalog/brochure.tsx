import { Link } from '@inertiajs/react';
import { ArrowLeft, Download, Image as ImageIcon, Palette, RotateCcw, SlidersHorizontal, Type, Upload, Trash2, LayoutGrid, Settings2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useMemo, useRef, useState } from 'react';
import PracticeLayout from '@/layouts/practice/practice-layout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatRp } from '@/lib/format';
import type { Product } from '@/types';

type Props = { products: Product[] };
type Template = 'grid' | 'catalog';
type CanvasSize = 'square' | 'portrait' | 'story' | 'landscape';
type Alignment = 'left' | 'center' | 'right';
type HeaderPlacement = 'top' | 'center' | 'bottom';
type ContentMode = 'fit' | 'fixed';
type CardDensity = 'compact' | 'standard' | 'spacious';
type CardLayout = 'photo-top' | 'photo-left' | 'text-only';
type CanvasAsset = { id: number; type: 'image' | 'text'; value: string; x: number; y: number; width: number };
type EditorSection = 'layout' | 'theme' | 'text' | 'content' | 'assets' | null;

const colors = [
    { name: 'Merah Promo', value: '#b91c1c', soft: '#fee2e2' },
    { name: 'Biru Modern', value: '#1d4ed8', soft: '#dbeafe' },
    { name: 'Hijau Fresh', value: '#047857', soft: '#d1fae5' },
    { name: 'Ungu Elegan', value: '#7e22ce', soft: '#f3e8ff' },
    { name: 'Hitam Premium', value: '#18181b', soft: '#e4e4e7' },
];

const canvasSizes: Record<CanvasSize, { label: string; ratio: number; width: number; height: number }> = {
    square: { label: 'Kotak 1:1', ratio: 1, width: 2160, height: 2160 },
    portrait: { label: 'Poster 4:5', ratio: 0.8, width: 2160, height: 2700 },
    story: { label: 'Story 9:16', ratio: 0.5625, width: 2160, height: 3840 },
    landscape: { label: 'Landscape 16:9', ratio: 1.7778, width: 3840, height: 2160 },
};

export default function Brochure({ products }: Props) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [template, setTemplate] = useState<Template>('grid');
    const [canvasSize, setCanvasSize] = useState<CanvasSize>('portrait');
    const [color, setColor] = useState(colors[0]);
    const [customColor, setCustomColor] = useState(colors[0].value);
    const [title, setTitle] = useState('PROMO SPESIAL');
    const [subtitle, setSubtitle] = useState('Produk pilihan dengan harga terbaik');
    const [footer, setFooter] = useState('Hubungi kami untuk informasi lebih lanjut');
    const [columns, setColumns] = useState(4);
    const [gap, setGap] = useState(8);
    const [padding, setPadding] = useState(18);
    const [titleSize, setTitleSize] = useState(32);
    const [alignment, setAlignment] = useState<Alignment>('left');
    const [headerPlacement, setHeaderPlacement] = useState<HeaderPlacement>('top');
    const [showPhoto, setShowPhoto] = useState(true);
    const [showCategory, setShowCategory] = useState(true);
    const [showCode, setShowCode] = useState(false);
    const [showStock, setShowStock] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [assets, setAssets] = useState<CanvasAsset[]>([]);
    const [assetText, setAssetText] = useState('');
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [zoom, setZoom] = useState(1);
    const [contentMode, setContentMode] = useState<ContentMode>('fit');
    const [cardDensity, setCardDensity] = useState<CardDensity>('compact');
    const [cardLayout, setCardLayout] = useState<CardLayout>('photo-top');
    const [photoSize, setPhotoSize] = useState(30);
    const [showDescription, setShowDescription] = useState(false);
    const [showUnit, setShowUnit] = useState(false);
    const [priceBadge, setPriceBadge] = useState(true);
    const [headerHeight, setHeaderHeight] = useState(16);
    const [activeSection, setActiveSection] = useState<EditorSection>(null);
    const [productNameSize, setProductNameSize] = useState(8);
    const [metadataSize, setMetadataSize] = useState(6);
    const [descriptionSize, setDescriptionSize] = useState(6);
    const [priceSize, setPriceSize] = useState(8);
    const [subtitleSize, setSubtitleSize] = useState(8);

    const displayColumns = template === 'catalog' ? 1 : columns;
    const displayRows = useMemo(() => Math.max(1, Math.ceil(products.length / displayColumns)), [displayColumns, products.length]);
    const visibleProducts = products;
    const activeColor = customColor || color.value;

    function reset() {
        setTemplate('grid');
        setCanvasSize('portrait');
        setColor(colors[0]);
        setCustomColor(colors[0].value);
        setTitle('PROMO SPESIAL');
        setSubtitle('Produk pilihan dengan harga terbaik');
        setFooter('Hubungi kami untuk informasi lebih lanjut');
        setColumns(3);
        setGap(8);
        setPadding(18);
        setTitleSize(32);
        setAlignment('left');
        setHeaderPlacement('top');
        setShowPhoto(true);
        setShowCategory(true);
        setShowCode(false);
        setShowStock(false);
        setAssets([]);
        setSelectedAssetId(null);
        setZoom(1);
        setContentMode('fit');
        setCardDensity('compact');
        setCardLayout('photo-top');
        setPhotoSize(30);
        setShowDescription(false);
        setShowUnit(false);
        setPriceBadge(true);
        setHeaderHeight(16);
        setProductNameSize(8);
        setMetadataSize(6);
        setDescriptionSize(6);
        setPriceSize(8);
        setSubtitleSize(8);
    }

    function addTextAsset() {
        const value = assetText.trim();
        if (!value) return;
        const id = Date.now();
        setAssets((current) => [...current, { id, type: 'text', value, x: 8, y: 35, width: 32 }]);
        setSelectedAssetId(id);
        setAssetText('');
    }

    function addImageAsset(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const id = Date.now();
            setAssets((current) => [...current, { id, type: 'image', value: String(reader.result), x: 8, y: 35, width: 24 }]);
            setSelectedAssetId(id);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    }

    function moveAsset(event: React.PointerEvent<HTMLDivElement>, asset: CanvasAsset) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const startX = event.clientX;
        const startY = event.clientY;
        const startAsset = { x: asset.x, y: asset.y };
        const move = (moveEvent: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const nextX = startAsset.x + ((moveEvent.clientX - startX) / rect.width) * 100;
            const nextY = startAsset.y + ((moveEvent.clientY - startY) / rect.height) * 100;
            setAssets((current) => current.map((item) => item.id === asset.id
                ? { ...item, x: Math.max(0, Math.min(100 - item.width, nextX)), y: Math.max(0, Math.min(94, nextY)) }
                : item));
        };
        const stop = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', stop);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', stop);
    }

    function deleteSelectedAsset() {
        if (selectedAssetId === null) return;
        setAssets((current) => current.filter((asset) => asset.id !== selectedAssetId));
        setSelectedAssetId(null);
    }

    async function downloadPng() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsExporting(true);
        try {
            const targetWidth = canvasSizes[canvasSize].width;
            const layoutWidth = Math.max(1, canvas.offsetWidth);
            const layoutHeight = Math.max(1, canvas.offsetHeight);
            const dataUrl = await toPng(canvas, {
                cacheBust: true,
                width: layoutWidth,
                height: layoutHeight,
                pixelRatio: targetWidth / layoutWidth,
                style: {
                    width: `${layoutWidth}px`,
                    height: `${layoutHeight}px`,
                    transform: 'none',
                },
            });
            const link = document.createElement('a');
            link.download = `brosur-${canvasSize}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Gagal mengekspor brosur sebagai PNG.', error);
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <PracticeLayout title="Buat Brosur">
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="flex items-center gap-2">
                        <Link href="/praktik/katalog" className="rounded-xl p-2 hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
                        <div><h1 className="text-lg font-bold">Editor Brosur</h1><p className="text-xs text-muted-foreground">{products.length} produk dipilih</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
                        <button type="button" onClick={downloadPng} disabled={isExporting} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"><Download className="h-3.5 w-3.5" /> {isExporting ? 'Mengekspor...' : 'Unduh PNG'}</button>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="rounded-2xl bg-card p-8 text-center shadow-sm"><p className="font-semibold">Belum ada produk yang dipilih.</p><Link href="/praktik/katalog" className="mt-3 inline-block text-sm font-semibold text-primary">Kembali ke katalog</Link></div>
                ) : (
                    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(250px,340px)_minmax(0,1fr)]">
                        <aside className="print:hidden">
                            <div className="rounded-2xl bg-card p-4 shadow-sm">
                                <p className="mb-3 text-xs text-muted-foreground">Atur brosur melalui menu berikut. Preview berubah langsung.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        ['layout', <LayoutGrid className="h-4 w-4" />, 'Layout & Grid', `${template === 'grid' ? 'Promo Grid' : 'Daftar Harga'} · ${displayColumns} kolom`],
                                        ['theme', <Palette className="h-4 w-4" />, 'Tema & Template', `${headerPlacement === 'top' ? 'Judul atas' : headerPlacement === 'center' ? 'Judul tengah' : 'Judul bawah'}`],
                                        ['text', <Type className="h-4 w-4" />, 'Teks & Ukuran', `Judul ${titleSize}px · Harga ${priceSize}px`],
                                        ['content', <Settings2 className="h-4 w-4" />, 'Isi Kartu', `${showPhoto ? 'Foto' : 'Tanpa foto'} · ${cardDensity}`],
                                        ['assets', <Upload className="h-4 w-4" />, 'Aset Kanvas', `${assets.length} aset`],
                                    ].map(([section, icon, label, summary]) => <button key={String(section)} type="button" onClick={() => setActiveSection(section as EditorSection)} className="flex min-h-20 flex-col items-start justify-between rounded-xl border border-border p-3 text-left transition hover:border-primary hover:bg-primary/5"><span className="flex items-center gap-2 text-sm font-semibold text-primary">{icon}{label}</span><span className="line-clamp-2 text-[11px] text-muted-foreground">{summary}</span></button>)}
                                </div>
                            </div>
                            <Dialog open={activeSection !== null} onOpenChange={(open) => { if (!open) setActiveSection(null); }}>
                                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                                    <DialogHeader><DialogTitle>{activeSection === 'layout' ? 'Layout & Grid' : activeSection === 'theme' ? 'Tema & Template' : activeSection === 'text' ? 'Teks & Ukuran Font' : activeSection === 'content' ? 'Isi Kartu Produk' : 'Aset Kanvas'}</DialogTitle><DialogDescription>Pengaturan diterapkan langsung ke preview brosur.</DialogDescription></DialogHeader>
                                    {activeSection === 'layout' && <div className="space-y-4"><Select label="Ukuran kanvas" value={canvasSize} onChange={(value) => setCanvasSize(value as CanvasSize)} options={Object.entries(canvasSizes).map(([value, item]) => ({ value, label: `${item.label} (${item.width}×${item.height})` }))} /><div className="grid grid-cols-2 gap-3"><NumberInput label="Kolom" value={columns} min={1} max={6} onChange={setColumns} /><NumberInput label="Jarak" value={gap} min={4} max={40} onChange={setGap} /><NumberInput label="Padding" value={padding} min={8} max={80} onChange={setPadding} /><Select label="Tinggi kanvas" value={contentMode} onChange={(value) => setContentMode(value as ContentMode)} options={[{ value: 'fit', label: 'Ikuti isi' }, { value: 'fixed', label: 'Rasio tetap' }]} /></div><p className="text-xs text-muted-foreground">{displayColumns} kolom · {displayRows} baris otomatis · {products.length} produk</p></div>}
                                    {activeSection === 'theme' && <div className="space-y-4"><div className="flex flex-wrap gap-2">{colors.map((item) => <button key={item.value} type="button" aria-label={item.name} onClick={() => { setColor(item); setCustomColor(item.value); }} className={`h-8 w-8 rounded-full border-2 ${activeColor === item.value ? 'border-foreground ring-2 ring-primary/30' : 'border-white'}`} style={{ backgroundColor: item.value }} />)}<label className="h-8 w-8 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border"><input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="h-10 w-10 -translate-x-1 -translate-y-1" /></label></div><div className="grid grid-cols-2 gap-3"><Select label="Template" value={template} onChange={(value) => setTemplate(value as Template)} options={[{ value: 'grid', label: 'Promo Grid' }, { value: 'catalog', label: 'Daftar Harga' }]} /><Select label="Posisi judul" value={headerPlacement} onChange={(value) => setHeaderPlacement(value as HeaderPlacement)} options={[{ value: 'top', label: 'Atas' }, { value: 'center', label: 'Tengah' }, { value: 'bottom', label: 'Bawah' }]} /><NumberInput label="Tinggi header (%)" value={headerHeight} min={12} max={45} onChange={setHeaderHeight} /></div></div>}
                                    {activeSection === 'text' && <div className="space-y-3"><TextInput label="Judul" value={title} onChange={setTitle} /><TextInput label="Subjudul" value={subtitle} onChange={setSubtitle} /><TextInput label="Footer" value={footer} onChange={setFooter} /><div className="grid grid-cols-2 gap-3"><NumberInput label="Ukuran judul" value={titleSize} min={20} max={90} onChange={setTitleSize} /><NumberInput label="Ukuran subjudul" value={subtitleSize} min={8} max={36} onChange={setSubtitleSize} /><NumberInput label="Ukuran nama produk" value={productNameSize} min={8} max={40} onChange={setProductNameSize} /><NumberInput label="Ukuran metadata" value={metadataSize} min={6} max={24} onChange={setMetadataSize} /><NumberInput label="Ukuran deskripsi" value={descriptionSize} min={7} max={28} onChange={setDescriptionSize} /><NumberInput label="Ukuran harga" value={priceSize} min={8} max={44} onChange={setPriceSize} /></div><Select label="Perataan teks" value={alignment} onChange={(value) => setAlignment(value as Alignment)} options={[{ value: 'left', label: 'Kiri' }, { value: 'center', label: 'Tengah' }, { value: 'right', label: 'Kanan' }]} /></div>}
                                    {activeSection === 'content' && <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><Select label="Kepadatan kartu" value={cardDensity} onChange={(value) => setCardDensity(value as CardDensity)} options={[{ value: 'compact', label: 'Ringkas' }, { value: 'standard', label: 'Standar' }, { value: 'spacious', label: 'Lapang' }]} /><Select label="Susunan kartu" value={cardLayout} onChange={(value) => setCardLayout(value as CardLayout)} options={[{ value: 'photo-top', label: 'Foto atas' }, { value: 'photo-left', label: 'Foto kiri' }, { value: 'text-only', label: 'Tanpa foto' }]} /></div><NumberInput label="Ukuran gambar (%)" value={photoSize} min={10} max={60} onChange={setPhotoSize} /><p className="text-[11px] text-muted-foreground">Mengatur lebar foto kiri atau tinggi foto atas relatif terhadap kartu.</p><Toggle label="Foto produk" checked={showPhoto} onChange={setShowPhoto} /><Toggle label="Deskripsi" checked={showDescription} onChange={setShowDescription} /><Toggle label="Kategori" checked={showCategory} onChange={setShowCategory} /><Toggle label="Kode produk" checked={showCode} onChange={setShowCode} /><Toggle label="Satuan" checked={showUnit} onChange={setShowUnit} /><Toggle label="Stok tersedia" checked={showStock} onChange={setShowStock} /><Toggle label="Harga berbentuk badge" checked={priceBadge} onChange={setPriceBadge} /></div>}
                                    {activeSection === 'assets' && <div className="space-y-3"><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-3 text-xs font-semibold text-primary"><Upload className="h-4 w-4" /> Upload logo / gambar<input type="file" accept="image/*" onChange={addImageAsset} className="hidden" /></label><div className="flex gap-2"><TextInput label="Teks bebas" value={assetText} onChange={setAssetText} /><button type="button" onClick={addTextAsset} className="mt-6 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Tambah</button></div>{selectedAssetId !== null && <div className="border-t pt-3"><NumberInput label="Lebar aset (%)" value={assets.find((asset) => asset.id === selectedAssetId)?.width ?? 20} min={5} max={80} onChange={(value) => setAssets((current) => current.map((asset) => asset.id === selectedAssetId ? { ...asset, width: value } : asset))} /><button type="button" onClick={deleteSelectedAsset} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-destructive"><Trash2 className="h-3.5 w-3.5" /> Hapus aset</button></div>}</div>}
                                </DialogContent>
                            </Dialog>
                        </aside>

                        <main className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 print:hidden">
                                <p className="text-xs font-semibold text-muted-foreground">Preview kanvas</p>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setZoom((value) => Math.max(0.6, value - 0.1))} className="rounded-md border px-2 py-1 text-xs">−</button>
                                    <span className="min-w-12 text-center text-[11px] text-muted-foreground">{Math.round(zoom * 100)}%</span>
                                    <button type="button" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} className="rounded-md border px-2 py-1 text-xs">+</button>
                                    <button type="button" onClick={() => setZoom(1)} className="text-[11px] font-semibold text-primary">Fit</button>
                                    <span className="text-[11px] text-muted-foreground">{canvasSizes[canvasSize].width} × {canvasSizes[canvasSize].height}px</span>
                                </div>
                            </div>
                            <div className="min-w-0 overflow-auto rounded-2xl bg-muted/50 p-2 sm:p-6">
                                <div className="mx-auto w-full max-w-[760px]" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', marginBottom: `${(zoom - 1) * 100}%` }}>
                                <div ref={canvasRef} className="brochure-canvas relative mx-auto flex w-full flex-col overflow-hidden bg-white shadow-xl" style={{ aspectRatio: contentMode === 'fixed' ? `${canvasSizes[canvasSize].ratio}` : undefined, height: contentMode === 'fit' ? 'auto' : undefined, '--brand': activeColor, '--soft': color.soft, containerType: 'inline-size' } as React.CSSProperties}>
                                    <header className={`flex flex-col justify-center px-6 py-5 text-white sm:px-10 ${headerPlacement === 'top' ? 'justify-start pt-8' : headerPlacement === 'bottom' ? 'justify-end pb-8' : 'justify-center'}`} style={{ order: headerPlacement === 'bottom' ? 2 : 1, backgroundColor: activeColor, textAlign: alignment, minHeight: `${headerHeight}%` }}>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.25em] opacity-80">Katalog Produk</p>
                                        <h2 className="mt-2 font-black tracking-tight" style={{ fontSize: `clamp(24px, ${titleSize / 10}cqw, ${titleSize}px)` }}>{title || 'PROMO SPESIAL'}</h2>
                                        <p className="mt-2 opacity-90" style={{ fontSize: `${subtitleSize}px` }}>{subtitle}</p>
                                    </header>
                                    <div className={`product-grid ${template === 'catalog' ? 'price-list-grid' : ''} ${contentMode === 'fixed' ? 'fixed-size-grid flex-1' : 'fit-content-grid flex-none'} min-h-0 grid`} style={{ order: headerPlacement === 'bottom' ? 1 : 2, alignContent: contentMode === 'fixed' ? 'stretch' : 'start', gridTemplateColumns: `repeat(${displayColumns}, minmax(0, 1fr))`, gridTemplateRows: contentMode === 'fixed' ? `repeat(${displayRows}, minmax(0, 1fr))` : `repeat(${displayRows}, minmax(145px, max-content))`, gap, padding } as React.CSSProperties}>
                                        {visibleProducts.map((product) => (
                                            <div key={product.id} className="product-card-shell min-w-0" style={{ containerType: 'inline-size' }}>
                                            <article className={`product-card min-h-0 h-full overflow-hidden rounded-xl border ${template === 'catalog' || cardLayout === 'photo-left' ? 'flex items-stretch gap-3' : 'flex flex-col'} ${cardDensity === 'compact' ? 'p-2' : cardDensity === 'spacious' ? 'p-4' : 'p-3'}`} style={{ borderColor: `${activeColor}35`, backgroundColor: `${color.soft}35` }}>
                                                {showPhoto && cardLayout !== 'text-only' && <div className={`product-photo shrink-0 flex items-center justify-center overflow-hidden rounded-lg ${template === 'catalog' || cardLayout === 'photo-left' ? 'aspect-square' : 'w-full'}`} style={{ width: template === 'catalog' || cardLayout === 'photo-left' ? `${photoSize}%` : undefined, height: template === 'catalog' || cardLayout === 'photo-left' ? undefined : `${photoSize}%`, backgroundColor: color.soft }}>{product.photo_url ? <img src={product.photo_url} alt={product.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 opacity-30" style={{ color: activeColor }} />}</div>}
                                                <div className="product-info flex min-h-0 min-w-0 flex-1 flex-col">{showCategory && <p className="truncate font-semibold uppercase tracking-wide" style={{ color: activeColor, fontSize: `${metadataSize}px` }}>{product.category}</p>}<h3 className="mt-1 line-clamp-3 font-bold leading-tight text-zinc-800" style={{ fontSize: `${productNameSize}px` }}>{product.name}</h3>{showDescription && product.specification && <p className="mt-1 line-clamp-2 leading-tight text-zinc-600" style={{ fontSize: `${descriptionSize}px` }}>{product.specification}</p>}{showCode && <p className="mt-1 truncate text-zinc-500" style={{ fontSize: `${metadataSize}px` }}>{product.code}</p>}{showStock && <p className="mt-1 truncate text-zinc-500" style={{ fontSize: `${metadataSize}px` }}>{product.stock_good > 0 ? `Tersedia ${product.stock_good} ${product.base_unit}` : 'Stok habis'}</p>} {showUnit && <p className="mt-1 text-zinc-500" style={{ fontSize: `${metadataSize}px` }}>per {product.base_unit}</p>}<p className={`product-price mt-auto pt-2 font-black ${priceBadge ? 'rounded-lg px-2 py-1' : ''}`} style={{ color: priceBadge ? 'white' : activeColor, backgroundColor: priceBadge ? activeColor : undefined, fontSize: `${priceSize}px` }}>{formatRp(product.selling_price)}</p></div>
                                            </article>
                                            </div>
                                        ))}
                                    </div>
                                    <footer className="px-5 py-3 text-center text-[10px] font-medium text-white" style={{ order: 3, backgroundColor: activeColor }}>{footer}</footer>
                                    {assets.map((asset) => (
                                        <div
                                            key={asset.id}
                                            onPointerDown={(event) => { setSelectedAssetId(asset.id); moveAsset(event, asset); }}
                                            className={`absolute z-20 cursor-move select-none overflow-hidden rounded-lg border-2 p-1 ${selectedAssetId === asset.id ? 'border-white ring-2 ring-primary' : 'border-transparent'}`}
                                            style={{ left: `${asset.x}%`, top: `${asset.y}%`, width: `${asset.width}%`, color: activeColor, backgroundColor: asset.type === 'text' ? 'rgba(255,255,255,.85)' : 'transparent' }}
                                        >
                                            {asset.type === 'image' ? <img src={asset.value} alt="Aset tambahan" className="pointer-events-none h-auto w-full object-contain" /> : <span className="block break-words text-center text-[clamp(12px,2.5cqw,34px)] font-black">{asset.value}</span>}
                                        </div>
                                    ))}
                                </div>
                                </div>
                            </div>
                        </main>
                    </div>
                )}
            </div>
            <style>{` .product-price { display: block; width: fit-content; max-width: 100%; overflow-wrap: anywhere; white-space: normal; line-height: 1.1; } .price-list-grid .product-card { min-height: 116px; } .price-list-grid .product-card .product-photo { max-width: 150px; aspect-ratio: 1; } @container (max-width: 110px) { .product-card { align-items: stretch !important; flex-direction: column !important; gap: 4px !important; } .product-card .product-photo { aspect-ratio: auto !important; } .product-card .product-info { width: 100% !important; } .product-card .product-price { margin-top: auto; padding: 2px 4px; } } @media print { @page { size: auto; margin: 0; } body { background: white !important; } .brochure-canvas { max-width: none !important; width: 100% !important; box-shadow: none !important; } }`}</style>
        </PracticeLayout>
    );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
    return <label className="block text-xs font-medium">{label}<input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>;
}

function NumberInput({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
    return <label className="block text-xs font-medium">{label}<input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
    return <label className="block text-xs font-medium">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-xs">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
    return <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between text-left text-xs">{label}<span className={`flex h-5 w-9 items-center rounded-full p-0.5 ${checked ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}><span className="h-4 w-4 rounded-full bg-white shadow-sm" /></span></button>;
}
