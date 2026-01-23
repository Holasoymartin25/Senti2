<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:supabase');
    }

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
        ]);

        $profile = Profile::where('user_id', $userId)->first();

        if (!$profile) {
            $profile = Profile::create([
                'user_id' => $userId,
                ...$validated
            ]);
        } else {
            $profile->update($validated);
        }

        return response()->json($profile);
    }
}
