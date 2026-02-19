<?php

namespace App\Http\Middleware;

use App\Models\Profile;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireAdminOrPsicologo
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->get('supabase_user');
        $userId = $user['id'] ?? null;

        if (!$userId) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $profile = Profile::where('user_id', $userId)->first();

        if (!$profile || !in_array($profile->role, [Profile::ROLE_ADMIN, Profile::ROLE_PSICOLOGO])) {
            return response()->json(['error' => 'Acceso denegado. Se requieren permisos de administrador o psicólogo.'], 403);
        }

        $request->merge(['profile' => $profile]);

        return $next($request);
    }
}
