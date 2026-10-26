import { Head, Link, usePage } from '@inertiajs/react';
import {
    GraduationCap,
    LayoutDashboard,
    LogOut,
    UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { dashboard } from '@/routes/admin';
import { edit } from '@/routes/profile';
import { logout } from '@/routes';

export default function AdminLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    const { auth } = usePage().props;
    return (
        <>
            <Head title={`${title} · Ruang Guru`} />
            <div className="min-h-svh bg-muted/30">
                <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                        <Link
                            href={dashboard()}
                            className="flex min-w-0 items-center gap-2.5"
                        >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <GraduationCap className="size-6" />
                            </span>
                            <span>
                                <span className="block text-sm font-bold tracking-tight text-primary">
                                    LOGISTIK LAB
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                    Ruang Guru
                                </span>
                            </span>
                        </Link>
                        <div className="flex min-w-0 items-center gap-4">
                            <span className="max-w-32 truncate text-sm font-medium sm:max-w-48">
                                {auth.user.name}
                            </span>
                            <Link
                                href={edit()}
                                className="hidden min-h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-muted md:flex"
                            >
                                <UserRound className="size-4" />
                                Profil
                            </Link>
                            <Link
                                href={logout()}
                                method="post"
                                as="button"
                                className="hidden min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted md:flex"
                            >
                                <LogOut className="size-4" />
                                Keluar
                            </Link>
                        </div>
                    </div>
                </header>
                <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 sm:pt-8 md:pb-10">
                    {children}
                </main>
                <nav
                    aria-label="Navigasi guru"
                    className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t bg-background px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
                >
                    <Link
                        href={dashboard()}
                        className="flex min-h-12 min-w-20 flex-col items-center justify-center gap-1 text-xs font-semibold text-primary"
                    >
                        <LayoutDashboard className="size-5" />
                        Kelas Saya
                    </Link>
                    <Link
                        href={edit()}
                        className="flex min-h-12 min-w-20 flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
                    >
                        <UserRound className="size-5" />
                        Profil
                    </Link>
                    <Link
                        href={logout()}
                        method="post"
                        as="button"
                        className="flex min-h-12 min-w-20 flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
                    >
                        <LogOut className="size-5" />
                        Keluar
                    </Link>
                </nav>
            </div>
        </>
    );
}
