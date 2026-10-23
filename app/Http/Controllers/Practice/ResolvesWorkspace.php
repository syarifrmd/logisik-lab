<?php

namespace App\Http\Controllers\Practice;

use App\Models\PracticeWorkspace;
use Illuminate\Http\Request;

trait ResolvesWorkspace
{
    /**
     * Get the authenticated user's workspace.
     */
    protected function workspace(Request $request): PracticeWorkspace
    {
        $workspace = $request->user()->workspace;

        if ($workspace === null) {
            throw new \RuntimeException('Workspace not found for authenticated user.');
        }

        return $workspace;
    }
}
