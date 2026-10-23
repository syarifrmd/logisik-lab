/**
 * Format angka sebagai Rupiah Indonesia.
 * Contoh: formatRp(15000) → "Rp 15.000"
 */
export function formatRp(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

/**
 * Format tanggal ke format lokal Indonesia (singkat).
 * Contoh: formatDate("2026-10-22") → "22 Okt 2026"
 */
export function formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}

/**
 * Hasilkan UUID v4 sederhana untuk idempotency key.
 */
export function generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
