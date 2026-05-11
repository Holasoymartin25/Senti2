<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PsicologoController extends Controller
{
    private function formatUser(User $u): array
    {
        return [
            'id'         => $u->id,
            'name'       => $u->name,
            'email'      => $u->email,
            'role'       => $u->role,
            'created_at' => $u->created_at->toDateString(),
        ];
    }

    private function formatDiary(User $u): array
    {
        return $u->diaryEntries()
            ->orderByDesc('date')
            ->get()
            ->map(fn($e) => [
                'id'       => $e->id,
                'date'     => $e->date->format('Y-m-d'),
                'mood'     => $e->mood,
                'emotions' => $e->emotions ?? [],
                'note'     => $e->note ?? '',
            ])->all();
    }

    private function formatTests(User $u): array
    {
        return $u->testResults()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($r) => [
                'testTitle'    => $r->test_title,
                'displayScore' => $r->display_score,
                'displayMax'   => $r->display_max,
                'level'        => $r->level,
                'date'         => $r->created_at->toDateString(),
            ])->all();
    }

    /** Usuarios sin psicólogo asignado (excluye psicólogos y admins) */
    public function getSinAsignar(): JsonResponse
    {
        $users = User::whereNull('psicologo_id')
            ->where('role', 'user')
            ->orderBy('id')
            ->get()
            ->map(fn($u) => $this->formatUser($u));

        return response()->json(['users' => $users]);
    }

    /** Pacientes asignados al psicólogo autenticado */
    public function getPacientes(Request $request): JsonResponse
    {
        $pacientes = User::where('psicologo_id', $request->user()->id)
            ->orderBy('id')
            ->get()
            ->map(fn($u) => $this->formatUser($u));

        return response()->json(['pacientes' => $pacientes]);
    }

    /** Datos completos de un paciente (solo si está asignado a este psicólogo) */
    public function getDatosPaciente(Request $request, int $id): JsonResponse
    {
        $paciente = User::where('id', $id)
            ->where('psicologo_id', $request->user()->id)
            ->first();

        if (!$paciente) {
            return response()->json(['error' => 'Paciente no encontrado o no asignado a usted'], 404);
        }

        return response()->json([
            'user'  => $this->formatUser($paciente),
            'diary' => $this->formatDiary($paciente),
            'tests' => $this->formatTests($paciente),
        ]);
    }

    /** Asignar un usuario sin psicólogo al psicólogo autenticado */
    public function asignar(Request $request, int $id): JsonResponse
    {
        $user = User::where('id', $id)
            ->where('role', 'user')
            ->whereNull('psicologo_id')
            ->first();

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado o ya tiene psicólogo asignado'], 422);
        }

        $user->update(['psicologo_id' => $request->user()->id]);

        return response()->json(['message' => 'Paciente asignado correctamente', 'user' => $this->formatUser($user)]);
    }

    /** Desvincular un paciente propio */
    public function desasignar(Request $request, int $id): JsonResponse
    {
        $user = User::where('id', $id)
            ->where('psicologo_id', $request->user()->id)
            ->first();

        if (!$user) {
            return response()->json(['error' => 'Paciente no encontrado o no asignado a usted'], 404);
        }

        $user->update(['psicologo_id' => null]);

        return response()->json(['message' => 'Paciente desvinculado correctamente']);
    }
}
