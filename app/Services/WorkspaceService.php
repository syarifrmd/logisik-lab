<?php

namespace App\Services;

use App\Models\PracticeWorkspace;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class WorkspaceService
{
    /**
     * Get or create the practice workspace for the given user.
     *
     * Uses a unique constraint on user_id to ensure only one workspace per user
     * is ever created, even under concurrent logins from multiple devices.
     */
    public function getOrCreateForUser(User $user): PracticeWorkspace
    {
        $workspace = $user->workspace()->first();

        if ($workspace !== null) {
            return $workspace;
        }

        try {
            return DB::transaction(function () use ($user) {
                return PracticeWorkspace::firstOrCreate(
                    ['user_id' => $user->id],
                    ['last_activity_at' => now()],
                );
            });
        } catch (QueryException $e) {
            // Concurrent insert hit the unique constraint; fetch the existing one
            return PracticeWorkspace::where('user_id', $user->id)->firstOrFail();
        }
    }
}
