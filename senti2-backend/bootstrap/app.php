<?php

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\ForceHttps;
use App\Http\Middleware\SetLocale;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['middleware' => ['auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->api(prepend: [
            HandleCors::class,
        ]);

        $middleware->api(append: [
            SetLocale::class,
        ]);

        $middleware->web(prepend: [
            ForceHttps::class,
        ]);

        $middleware->web(append: [
            SetLocale::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('api/*') || $request->is('broadcasting/*')) {
                return null;
            }
            if ($request->is('panel-admin') || $request->is('panel-admin/*')) {
                return route('admin.login');
            }

            return '/';
        });

        $middleware->alias([
            'role' => CheckRole::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'panel-admin/session-from-token',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, Request $request): ?Response {
            if (! $request->is('api/*') && ! $request->is('broadcasting/*')) {
                return null;
            }
            $allowedOrigins = array_values(array_filter(
                config('cors.allowed_origins', ['http://localhost:4200'])
            ));
            $origin = $request->header('Origin');
            $allowOrigin = in_array($origin, $allowedOrigins) ? $origin : ($allowedOrigins[0] ?? '*');
            if ($e instanceof ValidationException) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $e->errors(),
                ], 422)
                    ->withHeaders(['Access-Control-Allow-Origin' => $allowOrigin]);
            }
            if ($e instanceof AuthenticationException) {
                return response()->json(['error' => 'No autenticado'], 401)
                    ->withHeaders(['Access-Control-Allow-Origin' => $allowOrigin]);
            }
            $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
            $message = config('app.debug') ? $e->getMessage() : 'Error interno del servidor';

            return response()->json(['message' => $message, 'error' => $message], $status)
                ->withHeaders([
                    'Access-Control-Allow-Origin' => $allowOrigin,
                    'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept, X-Requested-With',
                    'Access-Control-Allow-Credentials' => 'true',
                ]);
        });
    })->create();
