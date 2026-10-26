import type { StudentProgress } from '@/types/classroom';

export default function StudentProgressBar({
    progress,
}: {
    progress: StudentProgress;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                    {progress.completed_steps === 0
                        ? 'Belum memulai praktik'
                        : `${progress.completed_steps} dari ${progress.total_steps} langkah praktik`}
                </span>
                <span className="font-semibold text-primary">
                    {progress.percentage}%
                </span>
            </div>
            <div
                role="progressbar"
                aria-label="Progres praktik"
                aria-valuenow={progress.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 overflow-hidden rounded-full bg-primary/10"
            >
                <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${progress.percentage}%` }}
                />
            </div>
        </div>
    );
}
