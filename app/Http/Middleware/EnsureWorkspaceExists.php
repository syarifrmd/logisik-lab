<?php

namespace App\Http\Middleware;

use App\Services\WorkspaceService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceExists
{
    public function __construct(private readonly WorkspaceService $workspaceService) {}

    /**
     * Ensure the authenticated user has a practice workspace.
     *
     * Creates one idempotently if it doesn't exist (e.g. login from a new device).
     * The unique constraint on user_id prevents duplicate creation under concurrency.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null && $user->workspace === null) {
            $this->workspaceService->getOrCreateForUser($user);
            // Refresh the user to load the new workspace relation
            $user->load('workspace');
        }

        return $next($request);
    }
}
