<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isSuperAdmin()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Acceso no autorizado.'], 403);
            }

            abort(403, 'Acceso no autorizado. Solo el Super Admin puede acceder a esta sección.');
        }

        return $next($request);
    }
}

