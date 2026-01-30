<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactFormMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ContactController extends Controller
{
    /**
     * Correo corporativo donde se reciben todas las consultas (configurable por .env).
     */
    private function getContactEmail(): string
    {
        return config('mail.contact_to', 'senti2soporte@gmail.com');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'mensaje' => 'required|string|max:5000',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:10240', // 10 MB
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser texto válido.',
            'nombre.max' => 'El nombre no puede exceder 255 caracteres.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'apellidos.string' => 'Los apellidos deben ser texto válido.',
            'apellidos.max' => 'Los apellidos no pueden exceder 255 caracteres.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'Introduce un email válido.',
            'email.max' => 'El email no puede exceder 255 caracteres.',
            'mensaje.required' => 'El mensaje es obligatorio.',
            'mensaje.string' => 'El mensaje debe ser texto válido.',
            'mensaje.max' => 'El mensaje no puede exceder 5000 caracteres.',
            'cv.file' => 'El CV debe ser un archivo válido.',
            'cv.mimes' => 'El CV debe ser un archivo PDF, DOC o DOCX.',
            'cv.max' => 'El CV no puede exceder 10 MB.',
        ]);

        $cvPath = null;

        try {
            if ($request->hasFile('cv')) {
                $cvPath = $request->file('cv')->store('contact-temp', 'local');
                $cvPath = storage_path('app/' . $cvPath);
            }

            Mail::to($this->getContactEmail())->send(new ContactFormMail(
                nombre: $validated['nombre'],
                apellidos: $validated['apellidos'],
                email: $validated['email'],
                mensaje: $validated['mensaje'],
                cvPath: $cvPath
            ));

            if ($cvPath && file_exists($cvPath)) {
                @unlink($cvPath);
            }

            return response()->json([
                'message' => 'Mensaje enviado correctamente. Te responderemos lo antes posible.',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error enviando formulario de contacto: ' . $e->getMessage());

            if ($cvPath && file_exists($cvPath)) {
                @unlink($cvPath);
            }

            return response()->json([
                'error' => 'No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.',
            ], 500);
        }
    }
}
