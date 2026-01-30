<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Recibe el formulario de contacto y envía un correo al buzón corporativo.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nombre' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'mensaje' => ['required', 'string', 'max:5000'],
            'cv' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'], // 10 MB
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'Introduce un email válido.',
            'mensaje.required' => 'El mensaje es obligatorio.',
            'cv.mimes' => 'El CV debe ser PDF, DOC o DOCX.',
            'cv.max' => 'El CV no puede superar 10 MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $cvPath = null;
        $cvOriginalName = null;

        if ($request->hasFile('cv')) {
            $file = $request->file('cv');
            $cvPath = $file->store('contact-cv', 'local');
            $cvPath = storage_path('app/' . $cvPath);
            $cvOriginalName = $file->getClientOriginalName();
        }

        $corporateEmail = config('mail.contact_to', 'senti2soporte@gmail.com');

        try {
            Mail::to($corporateEmail)->send(new ContactFormMail(
                nombre: $data['nombre'],
                apellidos: $data['apellidos'],
                email: $data['email'],
                mensaje: $data['mensaje'],
                cvPath: $cvPath,
                cvOriginalName: $cvOriginalName
            ));
        } catch (\Throwable $e) {
            if ($cvPath && is_file($cvPath)) {
                @unlink($cvPath);
            }
            report($e);
            return response()->json([
                'message' => 'No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.',
            ], 500);
        }

        if ($cvPath && is_file($cvPath)) {
            @unlink($cvPath);
        }

        return response()->json([
            'message' => 'Mensaje enviado correctamente. Te responderemos lo antes posible.',
        ], 200);
    }
}
