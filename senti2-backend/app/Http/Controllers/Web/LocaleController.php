<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function switch(Request $request, string $locale): RedirectResponse
    {
        if (! in_array($locale, ['es', 'en'], true)) {
            $locale = 'es';
        }

        if ($request->hasSession()) {
            $request->session()->put('locale', $locale);
        }

        return redirect()
            ->back(fallback: route('admin.login'))
            ->withCookie(cookie('senti2_locale', $locale, 60 * 24 * 365));
    }
}
