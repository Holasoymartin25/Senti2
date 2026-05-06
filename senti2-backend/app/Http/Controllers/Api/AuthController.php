<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function signUp(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'name'     => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'name'     => $validated['name'] ?? null,
        ]);

        Profile::create(['user_id' => $user->id]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message'      => 'Registro exitoso.',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $this->formatUser($user),
        ], 201);
    }

    public function signIn(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales inválidas.'],
            ])->status(401);
        }

        $user  = Auth::user();
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'access_token'  => $token,
            'refresh_token' => null,
            'token_type'    => 'Bearer',
            'user'          => $this->formatUser($user),
        ]);
    }

    public function signOut(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }

    public function getCurrentUser(Request $request)
    {
        return response()->json(['user' => $this->formatUser($request->user())]);
    }

    public function verifyToken(Request $request)
    {
        $user = $request->user('sanctum');

        if (!$user) {
            return response()->json(['error' => 'Token inválido'], 401);
        }

        return response()->json([
            'user'          => $this->formatUser($user),
            'authenticated' => true,
        ]);
    }

    public function refresh(Request $request)
    {
        $user = $request->user('sanctum');

        if (!$user) {
            return response()->json(['error' => 'Token inválido o expirado'], 401);
        }

        $user->currentAccessToken()->delete();
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'access_token'  => $token,
            'refresh_token' => null,
            'token_type'    => 'Bearer',
            'user'          => $this->formatUser($user),
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id'    => $user->id,
            'email' => $user->email,
            'name'  => $user->name,
        ];
    }
}
