@extends('layouts.admin')

@section('title', __('admin.users_list'))

@section('content')
<div class="page-header">
    <h1>{{ __('admin.users_list') }}</h1>
    <a href="{{ route('admin.users.create') }}" class="btn btn-primary">{{ __('admin.new_user') }}</a>
</div>

<div class="card">
    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>{{ __('admin.name') }}</th>
                    <th>{{ __('admin.email') }}</th>
                    <th>{{ __('admin.role') }}</th>
                    <th>{{ __('admin.actions') }}</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($users as $user)
                <tr>
                    <td>{{ $user->id }}</td>
                    <td>{{ $user->name ?? '—' }}</td>
                    <td>{{ $user->email }}</td>
                    <td><span class="role-badge">{{ __("admin.role_{$user->role}") }}</span></td>
                    <td>
                        <div class="actions-cell">
                            <a href="{{ route('admin.users.edit', $user) }}" class="btn btn-secondary">{{ __('admin.edit') }}</a>
                            <form action="{{ route('admin.users.destroy', $user) }}" method="POST" onsubmit="return confirm(@json(__('admin.confirm_delete')))">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger">{{ __('admin.delete') }}</button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr><td colspan="5" class="empty-state">—</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if ($users->hasPages())
    {{ $users->links('pagination.admin') }}
    @endif
</div>
@endsection
