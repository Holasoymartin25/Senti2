<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiaryEntry;
use App\Models\TestResult;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    public function index(): JsonResponse
    {
        $users = Cache::remember('admin.users', 60, fn () =>
            User::select('id', 'name', 'email', 'role', 'created_at')->orderBy('id')->get()
        );

        return response()->json(['users' => $users]);
    }

    public function updateRole(Request $request, int $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'role' => 'required|string|in:user,admin,psicologo',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['error' => $e->errors()], 422);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $user->update(['role' => $data['role']]);
        Cache::forget('admin.users');

        return response()->json([
            'message' => 'Rol actualizado correctamente',
            'user'    => [
                'id'    => $user->id,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }

    public function getUserData(int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $diary = DiaryEntry::where('user_id', $id)
            ->orderByDesc('date')
            ->get()
            ->map(fn($e) => [
                'id'       => $e->id,
                'date'     => $e->date->format('Y-m-d'),
                'mood'     => $e->mood,
                'emotions' => $e->emotions ?? [],
                'note'     => $e->note ?? '',
            ]);

        $tests = TestResult::where('user_id', $id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($r) => [
                'testTitle'    => $r->test_title,
                'displayScore' => $r->display_score,
                'displayMax'   => $r->display_max,
                'level'        => $r->level,
                'date'         => $r->created_at->toDateString(),
            ]);

        return response()->json([
            'user'  => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
            'diary' => $diary,
            'tests' => $tests,
        ]);
    }
}
