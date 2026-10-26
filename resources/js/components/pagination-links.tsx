import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PageData } from '@/types/classroom';

export default function PaginationLinks({
    page,
}: {
    page: Omit<PageData<never>, 'data'>;
}) {
    if (page.last_page <= 1) return null;
    return (
        <nav
            aria-label="Paginasi"
            className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs text-muted-foreground"
        >
            <span>
                {page.from}–{page.to} dari {page.total}
            </span>
            <div className="flex items-center gap-3">
                {page.prev_page_url && (
                    <Link
                        href={page.prev_page_url}
                        preserveScroll
                        className="inline-flex min-h-11 items-center gap-1 rounded-lg border bg-card px-3"
                    >
                        <ChevronLeft className="size-4" />
                        Sebelumnya
                    </Link>
                )}
                <span>
                    {page.current_page}/{page.last_page}
                </span>
                {page.next_page_url && (
                    <Link
                        href={page.next_page_url}
                        preserveScroll
                        className="inline-flex min-h-11 items-center gap-1 rounded-lg border bg-card px-3"
                    >
                        Berikutnya
                        <ChevronRight className="size-4" />
                    </Link>
                )}
            </div>
        </nav>
    );
}
