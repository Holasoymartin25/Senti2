<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('GET diary-entries sin token devuelve 401', function () {
    $this->getJson('/api/v1/area-personal/diary-entries')->assertStatus(401);
});

test('POST diary-entries sin token devuelve 401', function () {
    $this->postJson('/api/v1/area-personal/diary-entries', [
        'date'  => now()->format('Y-m-d'),
        'mood'  => 7,
        'note'  => 'Nota',
    ])->assertStatus(401);
});

test('GET diary-entries con token válido devuelve lista vacía', function () {
    $user  = User::factory()->create();
    $token = $user->createToken('api')->plainTextToken;

    $this->getJson('/api/v1/area-personal/diary-entries', ['Authorization' => "Bearer {$token}"])
        ->assertOk()
        ->assertJsonPath('data', []);
});

test('POST diary-entries con token válido crea entrada y devuelve 201', function () {
    $user  = User::factory()->create();
    $token = $user->createToken('api')->plainTextToken;

    $this->postJson('/api/v1/area-personal/diary-entries', [
        'date'     => now()->format('Y-m-d'),
        'mood'     => 8,
        'emotions' => ['Alegría', 'Calma'],
        'note'     => 'Día bueno.',
    ], ['Authorization' => "Bearer {$token}"])
        ->assertStatus(201)
        ->assertJsonStructure(['id', 'createdAt']);
});

test('POST diary-entries sin date devuelve 422', function () {
    $user  = User::factory()->create();
    $token = $user->createToken('api')->plainTextToken;

    $this->postJson('/api/v1/area-personal/diary-entries', [
        'mood' => 5,
    ], ['Authorization' => "Bearer {$token}"])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['date']);
});

test('GET test-results sin token devuelve 401', function () {
    $this->getJson('/api/v1/area-personal/test-results')->assertStatus(401);
});

test('POST test-results con token válido crea resultado y devuelve 201', function () {
    $user  = User::factory()->create();
    $token = $user->createToken('api')->plainTextToken;

    $this->postJson('/api/v1/area-personal/test-results', [
        'test_id'       => 'ansiedad',
        'test_title'    => 'Test de Ansiedad',
        'score'         => 15,
        'display_score' => 15,
        'display_max'   => 21,
        'level'         => 'Moderado',
    ], ['Authorization' => "Bearer {$token}"])
        ->assertStatus(201)
        ->assertJsonStructure(['id', 'date']);
});
