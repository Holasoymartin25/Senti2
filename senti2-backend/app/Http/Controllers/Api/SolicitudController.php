<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PatientRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SolicitudController extends Controller
{
    /** Solicitudes pendientes recibidas por el usuario autenticado */
    public function index(Request $request): JsonResponse
    {
        $solicitudes = PatientRequest::where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->with('psicologo')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($s) => [
                'id'      => $s->id,
                'message' => $s->message,
                'psicologo' => [
                    'id'    => $s->psicologo->id,
                    'name'  => $s->psicologo->name,
                    'email' => $s->psicologo->email,
                ],
                'created_at' => $s->created_at->toDateString(),
            ]);

        return response()->json(['solicitudes' => $solicitudes]);
    }

    /** Aceptar una solicitud pendiente */
    public function aceptar(Request $request, int $id): JsonResponse
    {
        $solicitud = PatientRequest::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->first();

        if (!$solicitud) {
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        }

        $solicitud->update(['status' => 'accepted']);
        $request->user()->update(['psicologo_id' => $solicitud->psicologo_id]);

        // Rechazar automáticamente otras solicitudes pendientes del mismo usuario
        PatientRequest::where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->where('id', '!=', $id)
            ->update(['status' => 'rejected']);

        return response()->json(['message' => 'Solicitud aceptada. Ya tienes psicólogo asignado.']);
    }

    /** Rechazar una solicitud pendiente */
    public function rechazar(Request $request, int $id): JsonResponse
    {
        $solicitud = PatientRequest::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->first();

        if (!$solicitud) {
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        }

        $solicitud->update(['status' => 'rejected']);

        return response()->json(['message' => 'Solicitud rechazada.']);
    }
}
