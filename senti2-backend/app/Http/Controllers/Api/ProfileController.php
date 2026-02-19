<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->get('supabase_user');
        $userId = $user['id'] ?? null;
        
        if (!$userId) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $profile = Profile::where('user_id', $userId)->first();

        if (!$profile) {
            $profile = Profile::create([
                'user_id' => $userId,
                'nombre' => '',
                'apellidos' => '',
                'telefono' => '',
                'fecha_nacimiento' => null,
            ]);
        }

        return response()->json($profile);
    }

    public function update(Request $request)
    {
        $user = $request->get('supabase_user');
        $userId = $user['id'] ?? null;
        
        if (!$userId) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
            'role' => ['nullable', Rule::in([Profile::ROLE_USER, Profile::ROLE_PSICOLOGO, Profile::ROLE_ADMIN])],
        ]);

        $profile = Profile::where('user_id', $userId)->first();

        if (!$profile) {
            $profile = Profile::create([
                'user_id' => $userId,
                'nombre' => $validated['nombre'] ?? '',
                'apellidos' => $validated['apellidos'] ?? '',
                'telefono' => $validated['telefono'] ?? '',
                'fecha_nacimiento' => $validated['fecha_nacimiento'] ?? null,
                'role' => $validated['role'] ?? Profile::ROLE_USER,
            ]);
        } else {
            $profile->update(array_filter($validated, fn ($v) => $v !== null));
        }

        return response()->json($profile);
    }
}
