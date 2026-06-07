<label for="name">{{ __('admin.name') }}</label>
<input id="name" type="text" name="name" value="{{ old('name', $user->name ?? '') }}">

<label for="email">{{ __('admin.email') }}</label>
<input id="email" type="email" name="email" value="{{ old('email', $user->email ?? '') }}" required>

<label for="password">{{ __('admin.password') }} @if(!empty($edit))<small>(opcional)</small>@endif</label>
<input id="password" type="password" name="password" @empty($edit) required @endempty>

<label for="password_confirmation">{{ __('admin.password_confirm') }}</label>
<input id="password_confirmation" type="password" name="password_confirmation" @empty($edit) required @endempty>

<label for="role">{{ __('admin.role') }}</label>
<select id="role" name="role" required>
    @foreach (['user', 'admin', 'psicologo'] as $role)
        <option value="{{ $role }}" @selected(old('role', $user->role ?? 'user') === $role)>
            {{ __("admin.role_{$role}") }}
        </option>
    @endforeach
</select>
