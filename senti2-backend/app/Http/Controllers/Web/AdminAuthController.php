<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AdminAuthController extends Controller
{
    public function showLogin(): View
    {
        return view('admin.auth.login');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $locale = $this->resolveLocale($request);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()
                ->withErrors(['email' => __('auth.failed')])
                ->onlyInput('email');
        }

        $request->session()->regenerate();
        $this->storeLocale($request, $locale);

        if (! Auth::user()?->isAdmin()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()
                ->withErrors(['email' => __('admin.not_admin')])
                ->onlyInput('email')
                ->withCookie($this->localeCookie($locale));
        }

        return redirect()
            ->intended(route('admin.users.index'))
            ->withCookie($this->localeCookie($locale));
    }

    public function logout(Request $request): RedirectResponse
    {
        $locale = $this->resolveLocale($request);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('admin.login')
            ->withCookie($this->localeCookie($locale));
    }

    private function resolveLocale(Request $request): string
    {
        $locale = $request->session()->get('locale', $request->cookie('senti2_locale', 'es'));

        return in_array($locale, ['es', 'en'], true) ? $locale : 'es';
    }

    private function storeLocale(Request $request, string $locale): void
    {
        if ($request->hasSession()) {
            $request->session()->put('locale', $locale);
        }
    }

    private function localeCookie(string $locale): \Symfony\Component\HttpFoundation\Cookie
    {
        return cookie('senti2_locale', $locale, 60 * 24 * 365);
    }
}
