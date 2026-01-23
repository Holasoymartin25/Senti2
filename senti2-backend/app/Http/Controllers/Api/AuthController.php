<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function verifyToken(Request $request)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        }

        $supabaseUrl = config('services.supabase.url');
        $supabaseKey = config('services.supabase.key');

        try {
            $response = Http::withHeaders([
                'apikey' => $supabaseKey,
                'Authorization' => 'Bearer ' . $token,
            ])->get("{$supabaseUrl}/auth/v1/user");

            if ($response->successful()) {
                return response()->json([
                    'user' => $response->json(),
                    'authenticated' => true
                ]);
            }

            return response()->json(['error' => 'Token inválido'], 401);
        } catch (\Exception $e) {
            Log::error('Error verificando token: ' . $e->getMessage());
            return response()->json(['error' => 'Error al verificar token'], 500);
        }
    }
}
