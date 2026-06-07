@extends('layouts.admin')

@section('title', __('admin.login_title'))

@section('content')
<div class="login-page">
    <div class="lang-switch login-lang" aria-label="{{ __('admin.language') }}">
        <a href="{{ route('admin.locale', 'es') }}" @class(['active' => app()->getLocale() === 'es'])>ES</a>
        <a href="{{ route('admin.locale', 'en') }}" @class(['active' => app()->getLocale() === 'en'])>EN</a>
    </div>

    <div class="login-wrapper">
        <div class="login-left">
            <h2 class="login-left__title">Senti2</h2>
            <p class="login-left__subtitle">{{ __('admin.login_brand_subtitle') }}</p>
            <div class="login-features">
                <div class="login-feature">{{ __('admin.login_feature_secure') }}</div>
                <div class="login-feature">{{ __('admin.login_feature_pros') }}</div>
                <div class="login-feature">{{ __('admin.login_feature_care') }}</div>
            </div>
        </div>

        <div class="login-right">
            <div class="login-form-card">
                <h1>{{ __('admin.login_title') }}</h1>
                <p class="login-form-card__subtitle">{{ __('admin.login_welcome') }}</p>

                <x-admin.alert />

                <form method="POST" action="{{ route('admin.login.submit') }}">
                    @csrf
                    <label for="email">{{ __('admin.email') }}</label>
                    <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus autocomplete="email" placeholder="admin@senti2.com">

                    <label for="password">{{ __('admin.password') }}</label>
                    <input id="password" type="password" name="password" required autocomplete="current-password">

                    <label class="checkbox-row">
                        <input type="checkbox" name="remember">
                        {{ __('admin.remember') }}
                    </label>

                    <button type="submit" class="btn btn-primary" style="width:100%">{{ __('admin.login') }}</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
