import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    Package,
    ArrowLeftRight,
    Truck,
    MoreHorizontal,
    ScanLine,
    BookOpen,
    FileSpreadsheet,
    User,
    LogOut,
    ArrowDownToLine,
    ArrowUpFromLine,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useState } from 'react';

type NavItem = {
    label: string;
    href: string;
    icon: typeof Home;
};

const mainNavItems: NavItem[] = [
    { label: 'Beranda', href: '/praktik', icon: Home },
    { label: 'Barang', href: '/praktik/barang', icon: Package },
    { label: 'Pengiriman', href: '/praktik/transportasi', icon: Truck },
];

const transaksiItems: NavItem[] = [
    { label: 'Barang Masuk', href: '/praktik/barang-masuk', icon: ArrowDownToLine },
    { label: 'Barang Keluar', href: '/praktik/barang-keluar', icon: ArrowUpFromLine },
];

const lainnyaItems: NavItem[] = [
    { label: 'Katalog', href: '/praktik/katalog', icon: BookOpen },
    { label: 'Barcode', href: '/praktik/barcode', icon: ScanLine },
    { label: 'Laporan', href: '/praktik/laporan', icon: FileSpreadsheet },
    { label: 'Profil', href: '/praktik/profil', icon: User },
];

function isPathActive(currentPath: string, href: string): boolean {
    if (href === '/praktik') {
        return currentPath === '/praktik';
    }
    return currentPath.startsWith(href);
}

function NavButton({
    item,
    active,
    onClick,
}: {
    item: NavItem;
    active: boolean;
    onClick?: () => void;
}) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 transition-colors ${
                active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
            }`}
        >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
            <span className="text-[11px] font-medium leading-tight">
                {item.label}
            </span>
        </Link>
    );
}

function SubmenuItem({ item, onClick }: { item: NavItem; onClick?: () => void }) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className="flex min-h-[48px] items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-accent"
        >
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{item.label}</span>
        </Link>
    );
}

export function BottomNav() {
    const { url: currentPath } = usePage();
    const [transaksiOpen, setTransaksiOpen] = useState(false);
    const [lainnyaOpen, setLainnyaOpen] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
        setLainnyaOpen(false);
    };

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t bg-card lg:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
                {/* Beranda */}
                <NavButton
                    item={mainNavItems[0]}
                    active={isPathActive(currentPath, '/praktik')}
                />

                {/* Barang */}
                <NavButton
                    item={mainNavItems[1]}
                    active={isPathActive(currentPath, '/praktik/barang')}
                />

                {/* Transaksi - opens submenu */}
                <Sheet open={transaksiOpen} onOpenChange={setTransaksiOpen}>
                    <SheetTrigger asChild>
                        <button
                            className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 transition-colors ${
                                isPathActive(currentPath, '/praktik/barang-masuk') ||
                                isPathActive(currentPath, '/praktik/barang-keluar')
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <ArrowLeftRight
                                className="h-5 w-5"
                                strokeWidth={
                                    isPathActive(currentPath, '/praktik/barang-masuk') ||
                                    isPathActive(currentPath, '/praktik/barang-keluar')
                                        ? 2.5
                                        : 2
                                }
                            />
                            <span className="text-[11px] font-medium leading-tight">
                                Transaksi
                            </span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-2xl">
                        <div className="flex flex-col gap-1 p-4">
                            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                                Transaksi
                            </h3>
                            {transaksiItems.map((item) => (
                                <SubmenuItem
                                    key={item.href}
                                    item={item}
                                    onClick={() => setTransaksiOpen(false)}
                                />
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Pengiriman */}
                <NavButton
                    item={mainNavItems[2]}
                    active={isPathActive(currentPath, '/praktik/transportasi')}
                />

                {/* Lainnya - opens submenu */}
                <Sheet open={lainnyaOpen} onOpenChange={setLainnyaOpen}>
                    <SheetTrigger asChild>
                        <button
                            className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 transition-colors ${
                                isPathActive(currentPath, '/praktik/katalog') ||
                                isPathActive(currentPath, '/praktik/barcode') ||
                                isPathActive(currentPath, '/praktik/laporan') ||
                                isPathActive(currentPath, '/praktik/profil')
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <MoreHorizontal
                                className="h-5 w-5"
                                strokeWidth={2}
                            />
                            <span className="text-[11px] font-medium leading-tight">
                                Lainnya
                            </span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-2xl">
                        <div className="flex flex-col gap-1 p-4">
                            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                                Lainnya
                            </h3>
                            {lainnyaItems.map((item) => (
                                <SubmenuItem
                                    key={item.href}
                                    item={item}
                                    onClick={() => setLainnyaOpen(false)}
                                />
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex min-h-[48px] items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-destructive/10"
                            >
                                <LogOut className="h-5 w-5 text-destructive" />
                                <span className="text-sm font-medium text-destructive">
                                    Keluar
                                </span>
                            </button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}
