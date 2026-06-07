<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', __('admin.panel_title')) — Senti2</title>
    <style>
        :root { --green: #6B8554; --cream: #FAF7F2; --text: #2C2C2C; --border: #E8E3DB; }
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; margin: 0; background: var(--cream); color: var(--text); }
        header { background: var(--green); color: #fff; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem; }
        header a { color: #fff; text-decoration: none; margin-left: 1rem; }
        main { max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
        .card { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: .6rem .5rem; border-bottom: 1px solid var(--border); text-align: left; }
        .btn { display: inline-block; padding: .45rem .9rem; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; font-size: .9rem; }
        .btn-primary { background: var(--green); color: #fff; }
        .btn-danger { background: #c0392b; color: #fff; }
        .btn-secondary { background: #eee; color: var(--text); }
        .alert { padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
        .alert-success { background: #e8f5e9; color: #2e7d32; }
        .alert-error { background: #fdecea; color: #c62828; }
        label { display: block; margin-bottom: .25rem; font-weight: 600; }
        input, select { width: 100%; padding: .5rem; margin-bottom: 1rem; border: 1px solid var(--border); border-radius: 6px; }
        .lang-switch a { margin-left: .5rem; opacity: .85; }
        .lang-switch a.active { font-weight: bold; text-decoration: underline; }
    </style>
</head>
<body>
    @auth
    <header>
        <strong>Senti2 — {{ __('admin.panel_title') }}</strong>
        <nav>
            <a href="{{ route('admin.users.index') }}">{{ __('admin.users') }}</a>
            <a href="/docs/api" target="_blank" rel="noopener">{{ __('admin.api_docs') }}</a>
            <span class="lang-switch">
                <a href="?lang=es" @class(['active' => app()->getLocale() === 'es'])>ES</a>
                <a href="?lang=en" @class(['active' => app()->getLocale() === 'en'])>EN</a>
            </span>
            <form action="{{ route('admin.logout') }}" method="POST" style="display:inline">
                @csrf
                <button type="submit" class="btn btn-secondary">{{ __('admin.logout') }}</button>
            </form>
        </nav>
    </header>
    @endauth

    <main>
        <x-admin.alert />
        @yield('content')
    </main>
</body>
</html>
