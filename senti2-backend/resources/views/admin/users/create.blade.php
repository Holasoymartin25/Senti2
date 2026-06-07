@extends('layouts.admin')

@section('title', __('admin.new_user'))

@section('content')
<h1>{{ __('admin.new_user') }}</h1>

<div class="card">
    <form method="POST" action="{{ route('admin.users.store') }}">
        @csrf
        @include('admin.users._form')
        <button type="submit" class="btn btn-primary">{{ __('admin.save') }}</button>
        <a href="{{ route('admin.users.index') }}" class="btn btn-secondary">{{ __('admin.cancel') }}</a>
    </form>
</div>
@endsection
