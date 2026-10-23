<?php

namespace App\Services;

use App\Models\PracticeWorkspace;
use App\Models\WorkspaceCounter;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class NumberingService
{
    /**
     * Generate the next transaction number for the given type and workspace.
     *
     * Format: PREFIX-YYYYMMDD-NNNN (e.g. BM-20261022-0001)
     * Uses row locking on workspace_counters to ensure atomic increment.
     */
    public function generateNumber(PracticeWorkspace $workspace, string $prefix, ?Carbon $date = null): string
    {
        $date ??= now();
        $dateStr = $date->format('Ymd');

        return DB::transaction(function () use ($workspace, $prefix, $date, $dateStr): string {
            $counter = WorkspaceCounter::where('workspace_id', $workspace->id)
                ->where('counter_type', $prefix)
                ->where('counter_date', $date->toDateString())
                ->lockForUpdate()
                ->first();

            if ($counter === null) {
                $counter = WorkspaceCounter::create([
                    'workspace_id' => $workspace->id,
                    'counter_type' => $prefix,
                    'counter_date' => $date->toDateString(),
                    'next_number' => 1,
                ]);
            }

            $number = $counter->next_number;
            $counter->increment('next_number');

            return sprintf('%s-%s-%04d', $prefix, $dateStr, $number);
        });
    }

    /**
     * Generate the next product code for a workspace.
     *
     * Auto-generates BRG001, BRG002, etc. by finding the max existing code.
     */
    public function generateProductCode(PracticeWorkspace $workspace): string
    {
        return DB::transaction(function () use ($workspace): string {
            $maxCode = DB::table('products')
                ->where('workspace_id', $workspace->id)
                ->where('code', 'like', 'BRG%')
                ->max('code');

            $nextNum = 1;
            if ($maxCode !== null) {
                $num = (int) substr($maxCode, 3);
                if ($num > 0) {
                    $nextNum = $num + 1;
                }
            }

            return 'BRG'.str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT);
        });
    }
}
