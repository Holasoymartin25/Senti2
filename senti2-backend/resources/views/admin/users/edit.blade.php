@extends('layouts.admin')

@section('title', __('admin.edit_user'))

@section('content')
<div class="page-header">
    <h1>{{ __('admin.edit_user') }}</h1>
    <a href="{{ route('admin.users.index') }}" class="btn btn-secondary">{{ __('admin.cancel') }}</a>
</div>

<div class="card card--narrow">
    <form method="POST" action="{{ route('admin.users.update', $user) }}">
        @csrf
        @method('PUT')
        @include('admin.users._form', ['user' => $user, 'edit' => true])
        <div class="form-actions">
            <button type="submit" class="btn btn-primary">{{ __('admin.save') }}</button>
            <a href="{{ route('admin.users.index') }}" class="btn btn-secondary">{{ __('admin.cancel') }}</a>
        </div>
    </form>
</div>
@endsection
