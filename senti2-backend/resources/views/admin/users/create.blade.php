@extends('layouts.admin')

@section('title', __('admin.new_user'))

@section('content')
<div class="page-header">
    <h1>{{ __('admin.new_user') }}</h1>
    <a href="{{ route('admin.users.index') }}" class="btn btn-secondary">{{ __('admin.cancel') }}</a>
</div>

<div class="card card--narrow">
    <form method="POST" action="{{ route('admin.users.store') }}">
        @csrf
        @include('admin.users._form')
        <div class="form-actions">
            <button type="submit" class="btn btn-primary">{{ __('admin.save') }}</button>
            <a href="{{ route('admin.users.index') }}" class="btn btn-secondary">{{ __('admin.cancel') }}</a>
        </div>
    </form>
</div>
@endsection
