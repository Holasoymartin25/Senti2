@extends('layouts.admin')

@section('title', __('admin.edit_user'))

@section('content')
<h1>{{ __('admin.edit_user') }}</h1>

<div class="card">
    <form method="POST" action="{{ route('admin.users.update', $user) }}">
        @csrf
        @method('PUT')
        @include('admin.users._form', ['user' => $user, 'edit' => true])
        <button type="submit" class="btn btn-primary">{{ __('admin.save') }}</button>
        <a href="{{ route('admin.users.index') }}" class="btn btn-secondary">{{ __('admin.cancel') }}</a>
    </form>
</div>
@endsection
