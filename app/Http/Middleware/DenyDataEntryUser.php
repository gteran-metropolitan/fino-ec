<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware que deniega el acceso a usuarios digitadores.
 * Útil para proteger rutas que los digitadores no deben usar
 * (cambiar contraseña, eliminar cuenta, etc.)
 */
class DenyDataEntryUser
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->isDataEntryUser()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Acción no permitida para tu rol.'], 403);
            }

            abort(403, 'No tienes permiso para realizar esta acción.');
        }

        return $next($request);
    }
}
