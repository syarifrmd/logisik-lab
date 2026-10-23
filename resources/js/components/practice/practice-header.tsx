export function PracticeHeader({ userName }: { userName: string }) {
    return (
        <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-sm lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
                <span className="text-lg font-bold tracking-tight text-primary">
                    LOGISTIK LAB
                </span>
                <span className="max-w-[40vw] truncate text-sm text-muted-foreground">
                    {userName}
                </span>
            </div>
        </header>
    );
}
