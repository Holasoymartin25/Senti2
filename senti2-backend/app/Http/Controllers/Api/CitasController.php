<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitasController extends Controller
{
    private function formatCita(Appointment $c): array
    {
        return [
            'id'         => $c->id,
            'paciente'   => $c->paciente ? [
                'id'    => $c->paciente->id,
                'name'  => $c->paciente->name,
                'email' => $c->paciente->email,
            ] : null,
            'fecha_hora' => $c->fecha_hora->format('Y-m-d\TH:i'),
            'duracion'   => $c->duracion,
            'modalidad'  => $c->modalidad,
            'estado'     => $c->estado,
            'notas'      => $c->notas ?? '',
            'created_at' => $c->created_at->toDateString(),
        ];
    }

    /** Listado de citas del psicólogo autenticado */
    public function index(Request $request): JsonResponse
    {
        $citas = Appointment::where('psicologo_id', $request->user()->id)
            ->with('paciente')
            ->orderByDesc('fecha_hora')
            ->get()
            ->map(fn($c) => $this->formatCita($c));

        return response()->json(['citas' => $citas]);
    }

    /** Crear una cita con uno de los pacientes asignados */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'paciente_id' => 'required|integer',
            'fecha_hora'  => 'required|date|after:now',
            'duracion'    => 'integer|min:15|max:240',
            'modalidad'   => 'in:presencial,online',
            'notas'       => 'nullable|string|max:2000',
        ]);

        // Solo se puede crear cita con pacientes asignados a este psicólogo
        $paciente = User::where('id', $data['paciente_id'])
            ->where('psicologo_id', $request->user()->id)
            ->first();

        if (!$paciente) {
            return response()->json(['error' => 'Paciente no encontrado o no asignado a usted'], 422);
        }

        $cita = Appointment::create([
            'psicologo_id' => $request->user()->id,
            'paciente_id'  => $data['paciente_id'],
            'fecha_hora'   => $data['fecha_hora'],
            'duracion'     => $data['duracion'] ?? 60,
            'modalidad'    => $data['modalidad'] ?? 'presencial',
            'estado'       => 'pendiente',
            'notas'        => $data['notas'] ?? null,
        ]);

        $cita->load('paciente');

        return response()->json([
            'message' => 'Cita creada correctamente',
            'cita'    => $this->formatCita($cita),
        ], 201);
    }

    /** Actualizar estado y/o notas de una cita propia */
    public function update(Request $request, int $id): JsonResponse
    {
        $cita = Appointment::where('id', $id)
            ->where('psicologo_id', $request->user()->id)
            ->first();

        if (!$cita) {
            return response()->json(['error' => 'Cita no encontrada'], 404);
        }

        $data = $request->validate([
            'fecha_hora' => 'sometimes|date|after:now',
            'duracion'   => 'sometimes|integer|min:15|max:240',
            'modalidad'  => 'sometimes|in:presencial,online',
            'estado'     => 'sometimes|in:pendiente,confirmada,cancelada,completada',
            'notas'      => 'nullable|string|max:2000',
        ]);

        $cita->update($data);
        $cita->load('paciente');

        return response()->json([
            'message' => 'Cita actualizada',
            'cita'    => $this->formatCita($cita),
        ]);
    }

    /** Eliminar una cita propia */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $cita = Appointment::where('id', $id)
            ->where('psicologo_id', $request->user()->id)
            ->first();

        if (!$cita) {
            return response()->json(['error' => 'Cita no encontrada'], 404);
        }

        $cita->delete();

        return response()->json(['message' => 'Cita eliminada']);
    }
}
