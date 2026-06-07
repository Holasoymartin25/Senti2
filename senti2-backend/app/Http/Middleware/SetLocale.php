<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->query('lang');

        if (! $locale && $request->hasSession()) {
            $locale = $request->session()->get('locale');
        }

        if (! $locale) {
            $locale = $request->getPreferredLanguage(['es', 'en']) ?? config('app.locale', 'es');
        }

        if (! in_array($locale, ['es', 'en'], true)) {
            $locale = 'es';
        }

        App::setLocale($locale);

        if ($request->hasSession()) {
            $request->session()->put('locale', $locale);
        }

        return $next($request);
    }
}
