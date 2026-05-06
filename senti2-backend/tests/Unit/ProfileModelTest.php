<?php

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('tiene los atributos fillable esperados', function () {
    $profile = new Profile;
    expect($profile->getFillable())
        ->toContain('user_id', 'nombre', 'apellidos', 'telefono', 'fecha_nacimiento')
        ->toHaveCount(5);
});

test('fecha_nacimiento se castea a date', function () {
    $user = User::factory()->create();

    $profile = Profile::create([
        'user_id'          => $user->id,
        'fecha_nacimiento' => '1990-05-15',
    ]);

    $loaded = Profile::find($profile->id);
    expect($loaded->fecha_nacimiento)->toBeInstanceOf(\Carbon\Carbon::class);
    expect($loaded->fecha_nacimiento->format('Y-m-d'))->toBe('1990-05-15');
});

test('se puede crear y recuperar un perfil con todos los campos', function () {
    $user = User::factory()->create();

    $profile = Profile::create([
        'user_id'          => $user->id,
        'nombre'           => 'María',
        'apellidos'        => 'García López',
        'telefono'         => '612345678',
        'fecha_nacimiento' => '1985-03-20',
    ]);

    expect($profile->id)->not->toBeNull();
    expect($profile->nombre)->toBe('María');
    expect($profile->apellidos)->toBe('García López');
    expect($profile->telefono)->toBe('612345678');
    expect($profile->fecha_nacimiento->format('Y-m-d'))->toBe('1985-03-20');
});
