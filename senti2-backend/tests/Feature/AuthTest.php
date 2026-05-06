<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('signup sin email devuelve 422', function () {
    $this->postJson('/api/v1/auth/signup', ['password' => 'password123'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('signup con password menor a 6 caracteres devuelve 422', function () {
    $this->postJson('/api/v1/auth/signup', ['email' => 'new@example.com', 'password' => '12345'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

test('signup correcto crea usuario y devuelve token', function () {
    $response = $this->postJson('/api/v1/auth/signup', [
        'email'    => 'nuevo@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['access_token', 'user'])
        ->assertJsonPath('user.email', 'nuevo@example.com');

    $this->assertDatabaseHas('users', ['email' => 'nuevo@example.com']);
});

test('signup con email duplicado devuelve 422', function () {
    User::factory()->create(['email' => 'duplicado@example.com']);

    $this->postJson('/api/v1/auth/signup', [
        'email'    => 'duplicado@example.com',
        'password' => 'password123',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['email']);
});

test('signin sin email devuelve 422', function () {
    $this->postJson('/api/v1/auth/signin', ['password' => 'password123'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('signin sin password devuelve 422', function () {
    $this->postJson('/api/v1/auth/signin', ['email' => 'user@example.com'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

test('signin con credenciales inválidas devuelve 401', function () {
    User::factory()->create(['email' => 'user@example.com', 'password' => bcrypt('correctpassword')]);

    $this->postJson('/api/v1/auth/signin', [
        'email'    => 'user@example.com',
        'password' => 'wrongpassword',
    ])->assertStatus(422);
});

test('signin correcto devuelve access_token y user', function () {
    User::factory()->create(['email' => 'user@example.com', 'password' => bcrypt('password123')]);

    $response = $this->postJson('/api/v1/auth/signin', [
        'email'    => 'user@example.com',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['access_token', 'user'])
        ->assertJsonPath('user.email', 'user@example.com');
});

test('ruta protegida sin token devuelve 401', function () {
    $this->getJson('/api/v1/auth/user')->assertStatus(401);
});

test('ruta protegida con token válido devuelve el usuario', function () {
    $user  = User::factory()->create();
    $token = $user->createToken('api')->plainTextToken;

    $this->getJson('/api/v1/auth/user', ['Authorization' => "Bearer {$token}"])
        ->assertOk()
        ->assertJsonPath('user.email', $user->email);
});

test('signout revoca el token', function () {
    $user      = User::factory()->create();
    $tokenData = $user->createToken('api');
    $plain     = $tokenData->plainTextToken;

    $this->withHeaders(['Authorization' => "Bearer {$plain}"])
        ->postJson('/api/v1/auth/signout')
        ->assertOk();

    $this->assertDatabaseMissing('personal_access_tokens', [
        'tokenable_id' => $user->id,
    ]);
});
