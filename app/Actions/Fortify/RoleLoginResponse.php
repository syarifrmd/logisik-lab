<?php

namespace App\Actions\Fortify;

use Laravel\Fortify\Contracts\LoginResponse;
use Symfony\Component\HttpFoundation\Response;

class RoleLoginResponse implements LoginResponse
{
    public function toResponse(mixed $request): Response
    {
        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended(route($request->user()->isAdmin() ? 'admin.dashboard' : 'practice.home', absolute: false));
    }
}
