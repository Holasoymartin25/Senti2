<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! app()->isProduction()) {
            return $next($request);
        }

        if (! str_starts_with((string) config('app.url'), 'https://')) {
            return $next($request);
        }

        if ($request->secure()) {
            return $next($request);
        }

        return redirect()->secure($request->getRequestUri());
    }
}
