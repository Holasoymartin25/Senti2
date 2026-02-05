<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function ask(Request $request)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'history' => ['nullable', 'array']
        ]);

        $apiKey = config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-1.5-pro');

        if (!$apiKey) {
            return response()->json([
                'reply' => 'El chat está en modo demostración. Configura GEMINI_API_KEY en el backend para activar respuestas con IA.'
            ]);
        }

        $systemInstruction = 'Eres un asistente de apoyo emocional. Responde con empatía, en español, en 1-2 frases muy cortas. Recomienda buscar ayuda profesional si detectas crisis. No des diagnósticos.';

        $history = collect($data['history'] ?? [])
            ->take(-8)
            ->map(function ($item) {
                return [
                    'role' => $item['role'] === 'user' ? 'user' : 'model',
                    'parts' => [
                        ['text' => $item['content'] ?? '']
                    ]
                ];
            })
            ->filter(fn ($item) => trim($item['parts'][0]['text']) !== '')
            ->values()
            ->all();

        $contents = array_merge($history, [
            [
                'role' => 'user',
                'parts' => [
                    ['text' => $data['message']]
                ]
            ]
        ]);

        try {
            $response = Http::timeout(20)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
                [
                    'systemInstruction' => [
                        'parts' => [
                            ['text' => $systemInstruction]
                        ]
                    ],
                    'contents' => $contents,
                    'generationConfig' => [
                        'temperature' => 0.4,
                        'maxOutputTokens' => 60
                    ]
                ]
            );

            if (!$response->successful()) {
                Log::warning('Gemini API error', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                return response()->json([
                    'reply' => 'No se pudo conectar con el asistente en este momento.'
                ], 200);
            }

            $content = data_get($response->json(), 'candidates.0.content.parts.0.text', '');
            $content = trim($content ?? '');
            if ($content !== '') {
                $sentences = preg_split('/(?<=[.!?¿¡])\s+/u', $content) ?: [$content];
                $content = implode(' ', array_slice($sentences, 0, 2));
                $content = Str::limit($content, 240, '…');
            }

            return response()->json([
                'reply' => $content ?: 'No he podido generar respuesta ahora mismo.'
            ]);
        } catch (\Throwable $e) {
            Log::error('Gemini API exception', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'reply' => 'Ha ocurrido un error con el asistente.'
            ], 200);
        }
    }
}
