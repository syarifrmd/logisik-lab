export function PracticeHeader({
    userName,
    classroomName,
}: {
    userName: string;
    classroomName?: string;
}) {
    return (
        <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-sm lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
                <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-primary">
                    <img src="/images/logo.png" alt="" className="size-8 rounded-lg object-cover" />
                    AS LogiEdu
                </span>
                <div className="max-w-[40vw] min-w-0 text-right">
                    <p className="truncate text-sm text-muted-foreground">
                        {userName}
                    </p>
                    {classroomName && (
                        <p className="mt-0.5 truncate text-[11px] font-medium text-primary">
                            {classroomName}
                        </p>
                    )}
                </div>
            </div>
        </header>
    );
}
