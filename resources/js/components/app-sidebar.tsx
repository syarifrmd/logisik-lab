import { Link, usePage } from '@inertiajs/react';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    LayoutGrid,
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    Truck,
    BookOpen,
    ScanLine,
    FileSpreadsheet,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Beranda',
        href: '/praktik',
        icon: LayoutGrid,
    },
    {
        title: 'Data Barang',
        href: '/praktik/barang',
        icon: Package,
    },
    {
        title: 'Barang Masuk',
        href: '/praktik/barang-masuk',
        icon: ArrowDownToLine,
    },
    {
        title: 'Barang Keluar',
        href: '/praktik/barang-keluar',
        icon: ArrowUpFromLine,
    },
    {
        title: 'Transportasi',
        href: '/praktik/transportasi',
        icon: Truck,
    },
    {
        title: 'Katalog Barang',
        href: '/praktik/katalog',
        icon: BookOpen,
    },
    {
        title: 'Barcode',
        href: '/praktik/barcode',
        icon: ScanLine,
    },
    {
        title: 'Laporan',
        href: '/praktik/laporan',
        icon: FileSpreadsheet,
    },
];

export function AppSidebar() {
    const isTeacher = usePage().props.auth.user.role === 'admin';
    const navigation = isTeacher
        ? [{ title: 'Kelas Saya', href: adminDashboard(), icon: LayoutGrid }]
        : mainNavItems;
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={isTeacher ? adminDashboard() : '/praktik'}
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navigation} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
