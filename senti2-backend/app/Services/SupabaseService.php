<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupabaseService
{
    private string $url;
    private string $key;

    public function __construct()
    {
        $this->url = (string) (config('services.supabase.url') ?? '');
        $this->key = (string) (config('services.supabase.key') ?? '');
    }

    public function isConfigured(): bool
    {
        return $this->url !== '' && $this->key !== '';
    }

    public function signUp(string $email, string $password): array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->key,
                'Content-Type' => 'application/json',
            ])->post("{$this->url}/auth/v1/signup", [
                'email' => $email,
                'password' => $password,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'error' => null,
                ];
            }

            return [
                'success' => false,
                'data' => null,
                'error' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Error en signUp: ' . $e->getMessage());
            return [
                'success' => false,
                'data' => null,
                'error' => ['message' => 'Error al registrar usuario'],
            ];
        }
    }

    public function signIn(string $email, string $password): array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->key,
                'Content-Type' => 'application/json',
            ])->post("{$this->url}/auth/v1/token?grant_type=password", [
                'email' => $email,
                'password' => $password,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'error' => null,
                ];
            }

            return [
                'success' => false,
                'data' => null,
                'error' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Error en signIn: ' . $e->getMessage());
            return [
                'success' => false,
                'data' => null,
                'error' => ['message' => 'Error al iniciar sesión'],
            ];
        }
    }

    public function getUser(string $token): ?array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->key,
                'Authorization' => 'Bearer ' . $token,
            ])->get("{$this->url}/auth/v1/user");

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error obteniendo usuario: ' . $e->getMessage());
            return null;
        }
    }

    public function signOut(string $token): bool
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->key,
                'Authorization' => 'Bearer ' . $token,
            ])->post("{$this->url}/auth/v1/logout");

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Error en signOut: ' . $e->getMessage());
            return false;
        }
    }

    public function getGoogleOAuthUrl(string $redirectUrl): string
    {
        $redirectUri = urlencode($redirectUrl);
        $url = "{$this->url}/auth/v1/authorize?provider=google&redirect_to={$redirectUri}&response_type=code";
        Log::info('URL de OAuth generada', ['url' => $url, 'redirect_to' => $redirectUrl]);
        return $url;
    }

    public function exchangeCodeForSession(string $code, string $redirectUrl): ?array
    {
        try {
            $response = Http::asForm()->withHeaders([
                'apikey' => $this->key,
                'Content-Type' => 'application/x-www-form-urlencoded',
            ])->post("{$this->url}/auth/v1/token?grant_type=authorization_code", [
                'code' => $code,
                'redirect_to' => $redirectUrl,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Sesión obtenida exitosamente', [
                    'has_access_token' => isset($data['access_token']),
                    'has_refresh_token' => isset($data['refresh_token'])
                ]);
                return $data;
            }

            $errorBody = $response->body();
            Log::error('Error al intercambiar código', [
                'status' => $response->status(),
                'body' => $errorBody,
                'code' => $code,
                'redirect_url' => $redirectUrl
            ]);
            return null;
        } catch (\Exception $e) {
            Log::error('Error intercambiando código: ' . $e->getMessage(), [
                'code' => $code,
                'redirect_url' => $redirectUrl,
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Base URL para REST API (tablas).
     */
    private function restUrl(string $table): string
    {
        return rtrim($this->url, '/') . '/rest/v1/' . $table;
    }

    private function restHeaders(): array
    {
        return [
            'apikey' => $this->key,
            'Authorization' => 'Bearer ' . $this->key,
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Insertar resultado de test emocional.
     */
    public function insertTestResult(string $userId, array $data): ?array
    {
        try {
            $body = [
                'user_id' => $userId,
                'test_id' => $data['test_id'],
                'test_title' => $data['test_title'],
                'score' => (int) $data['score'],
                'display_score' => (int) $data['display_score'],
                'display_max' => (int) $data['display_max'],
                'level' => $data['level'],
            ];
            $response = Http::withHeaders($this->restHeaders())
                ->withHeaders(['Prefer' => 'return=representation'])
                ->post($this->restUrl('test_results'), $body);

            if ($response->successful()) {
                $json = $response->json();
                return is_array($json) && isset($json[0]) ? $json[0] : $json;
            }
            Log::error('Supabase insertTestResult failed', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Supabase insertTestResult: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener resultados de tests del usuario (más recientes primero).
     */
    public function getTestResults(string $userId): array
    {
        try {
            $url = $this->restUrl('test_results') . '?user_id=eq.' . $userId . '&order=created_at.desc';
            $response = Http::withHeaders($this->restHeaders())->get($url);
            if ($response->successful()) {
                $list = $response->json();
                return is_array($list) ? $list : [];
            }
            return [];
        } catch (\Exception $e) {
            Log::error('Supabase getTestResults: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Insertar entrada del diario emocional.
     */
    public function insertDiaryEntry(string $userId, array $data): ?array
    {
        try {
            $body = [
                'user_id' => $userId,
                'date' => $data['date'],
                'mood' => (int) $data['mood'],
                'emotions' => $data['emotions'] ?? [],
                'note' => $data['note'] ?? '',
            ];
            $response = Http::withHeaders($this->restHeaders())
                ->withHeaders(['Prefer' => 'return=representation'])
                ->post($this->restUrl('diary_entries'), $body);

            if ($response->successful()) {
                $json = $response->json();
                return is_array($json) && isset($json[0]) ? $json[0] : $json;
            }
            Log::error('Supabase insertDiaryEntry failed', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Supabase insertDiaryEntry: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener entradas del diario del usuario (más recientes primero).
     */
    public function getDiaryEntries(string $userId): array
    {
        try {
            $url = $this->restUrl('diary_entries') . '?user_id=eq.' . $userId . '&order=date.desc';
            $response = Http::withHeaders($this->restHeaders())->get($url);
            if ($response->successful()) {
                $list = $response->json();
                return is_array($list) ? $list : [];
            }
            return [];
        } catch (\Exception $e) {
            Log::error('Supabase getDiaryEntries: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener TODOS los resultados de tests (solo con service_role, para panel admin).
     */
    public function getAllTestResults(): array
    {
        try {
            $url = $this->restUrl('test_results') . '?order=created_at.desc';
            $response = Http::withHeaders($this->restHeaders())->get($url);
            if ($response->successful()) {
                $list = $response->json();
                return is_array($list) ? $list : [];
            }
            return [];
        } catch (\Exception $e) {
            Log::error('Supabase getAllTestResults: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener TODAS las entradas del diario (solo con service_role, para panel admin).
     */
    public function getAllDiaryEntries(): array
    {
        try {
            $url = $this->restUrl('diary_entries') . '?order=date.desc';
            $response = Http::withHeaders($this->restHeaders())->get($url);
            if ($response->successful()) {
                $list = $response->json();
                return is_array($list) ? $list : [];
            }
            return [];
        } catch (\Exception $e) {
            Log::error('Supabase getAllDiaryEntries: ' . $e->getMessage());
            return [];
        }
    }
}

