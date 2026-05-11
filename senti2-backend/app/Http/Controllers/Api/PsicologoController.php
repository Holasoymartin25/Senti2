<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PatientRequest;
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

    /** Usuarios sin psicólogo asignado y sin solicitud pendiente de este psicólogo */
    public function getSinAsignar(Request $request): JsonResponse
    {
        $psicologoId = $request->user()->id;

        $conSolicitudPendiente = PatientRequest::where('psicologo_id', $psicologoId)
            ->where('status', 'pending')
            ->pluck('user_id');

        $users = User::whereNull('psicologo_id')
            ->where('role', 'user')
            ->whereNotIn('id', $conSolicitudPendiente)
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

    /** Enviar solicitud a un usuario para ser su psicólogo */
    public function solicitar(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $user = User::where('id', $id)
            ->where('role', 'user')
            ->whereNull('psicologo_id')
            ->first();

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado o ya tiene psicólogo asignado'], 422);
        }

        $existe = PatientRequest::where('psicologo_id', $request->user()->id)
            ->where('user_id', $id)
            ->exists();

        if ($existe) {
            return response()->json(['error' => 'Ya existe una solicitud para este usuario'], 422);
        }

        $solicitud = PatientRequest::create([
            'psicologo_id' => $request->user()->id,
            'user_id'      => $id,
            'message'      => $request->input('message'),
            'status'       => 'pending',
        ]);

        return response()->json([
            'message'   => 'Solicitud enviada correctamente',
            'solicitud' => $this->formatSolicitud($solicitud),
        ], 201);
    }

    /** Solicitudes enviadas por este psicólogo */
    public function getSolicitudes(Request $request): JsonResponse
    {
        $solicitudes = PatientRequest::where('psicologo_id', $request->user()->id)
            ->with('usuario')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($s) => $this->formatSolicitud($s));

        return response()->json(['solicitudes' => $solicitudes]);
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

        // Limpiar solicitudes anteriores para permitir reenvío
        PatientRequest::where('psicologo_id', $request->user()->id)
            ->where('user_id', $id)
            ->delete();

        return response()->json(['message' => 'Paciente desvinculado correctamente']);
    }

    private function formatSolicitud(PatientRequest $s): array
    {
        return [
            'id'         => $s->id,
            'user'       => $s->usuario ? [
                'id'    => $s->usuario->id,
                'name'  => $s->usuario->name,
                'email' => $s->usuario->email,
            ] : null,
            'message'    => $s->message,
            'status'     => $s->status,
            'created_at' => $s->created_at->toDateString(),
        ];
    }
}
