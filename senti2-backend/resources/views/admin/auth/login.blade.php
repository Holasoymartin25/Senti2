@extends('layouts.admin')

@section('title', __('admin.login_title'))

@section('content')
<div class="card" style="max-width:420px;margin:3rem auto">
    <h1>{{ __('admin.login_title') }}</h1>
    <p style="margin-bottom:1.5rem;color:#666">Senti2 / Laravel Blade</p>

    <form method="POST" action="{{ route('admin.login.submit') }}">
        @csrf
        <label for="email">{{ __('admin.email') }}</label>
        <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus>

        <label for="password">{{ __('admin.password') }}</label>
        <input id="password" type="password" name="password" required>

        <label style="display:flex;align-items:center;gap:.5rem;font-weight:normal">
            <input type="checkbox" name="remember" style="width:auto;margin:0">
            {{ __('admin.remember') }}
        </label>

        <button type="submit" class="btn btn-primary">{{ __('admin.login') }}</button>
    </form>

    <p style="margin-top:1rem;font-size:.85rem">
        <a href="?lang=es">ES</a> · <a href="?lang=en">EN</a>
    </p>
</div>
@endsection
