<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', __('admin.panel_title')) — Senti2</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ route('admin.css') }}">
</head>
<body>
    @auth
    <header class="navbar">
        <div>
            <a class="navbar__brand" href="{{ route('admin.users.index') }}">Senti2</a>
            <span class="navbar__subtitle">{{ __('admin.panel_title') }}</span>
        </div>
        <nav class="navbar__nav">
            <a href="{{ route('admin.users.index') }}" @class(['is-active' => request()->routeIs('admin.users.*')])>{{ __('admin.users') }}</a>
            <a href="/docs/api" target="_blank" rel="noopener">{{ __('admin.api_docs') }}</a>
            <span class="lang-switch" aria-label="{{ __('admin.language') }}">
                <a href="{{ route('admin.locale', 'es') }}" @class(['active' => app()->getLocale() === 'es'])>ES</a>
                <a href="{{ route('admin.locale', 'en') }}" @class(['active' => app()->getLocale() === 'en'])>EN</a>
            </span>
            <form action="{{ route('admin.logout') }}" method="POST">
                @csrf
                <button type="submit" class="btn-logout">{{ __('admin.logout') }}</button>
            </form>
        </nav>
    </header>

    <main class="admin-main">
        <x-admin.alert />
        @yield('content')
    </main>
    @else
        @yield('content')
    @endauth
</body>
</html>
