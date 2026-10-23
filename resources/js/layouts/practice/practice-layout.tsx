import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { BottomNav } from '@/components/practice/bottom-nav';
import { PracticeHeader } from '@/components/practice/practice-header';

type Props = {
    title?: string;
    children: ReactNode;
};

export default function PracticeLayout({ title, children }: Props) {
    const { auth } = usePage().props;
    const userName = auth?.user?.name ?? '';

    return (
        <>
            <Head title={title ?? 'Praktik'} />
            <div className="flex min-h-screen flex-col bg-muted/30">
                {/* Mobile header */}
                <PracticeHeader userName={userName} />

                {/* Desktop sidebar */}
                <div className="hidden lg:flex">
                    {/* TODO: sidebar for desktop in Phase 3 */}
                </div>

                {/* Main content */}
                <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-4 lg:pb-8">
                    {children}
                </main>

                {/* Bottom navigation - mobile only */}
                <BottomNav />
            </div>
        </>
    );
}
