<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AreaPersonalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PsicologoController;
use App\Http\Controllers\Api\CitasController;
use App\Http\Controllers\Api\SolicitudController;

Route::prefix('v1')->group(function () {
    Route::post('/contact', [ContactController::class, 'store']);

    Route::post('/auth/signup', [AuthController::class, 'signUp']);
    Route::post('/auth/signin', [AuthController::class, 'signIn']);
    Route::post('/auth/verify', [AuthController::class, 'verifyToken']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/signout', [AuthController::class, 'signOut']);
        Route::get('/auth/user', [AuthController::class, 'getCurrentUser']);

        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::patch('/profile', [ProfileController::class, 'update']);

        Route::post('/area-personal/test-results', [AreaPersonalController::class, 'storeTestResult']);
        Route::get('/area-personal/test-results', [AreaPersonalController::class, 'getTestResults']);
        Route::post('/area-personal/diary-entries', [AreaPersonalController::class, 'storeDiaryEntry']);
        Route::get('/area-personal/diary-entries', [AreaPersonalController::class, 'getDiaryEntries']);

        // Solicitudes (accesible por cualquier usuario autenticado)
        Route::get('/solicitudes', [SolicitudController::class, 'index']);
        Route::post('/solicitudes/{id}/aceptar', [SolicitudController::class, 'aceptar']);
        Route::post('/solicitudes/{id}/rechazar', [SolicitudController::class, 'rechazar']);

        Route::middleware('role:admin,psicologo')->prefix('admin')->group(function () {
            Route::get('/users', [AdminController::class, 'index']);
            Route::get('/users/{id}/data', [AdminController::class, 'getUserData']);
        });

        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::patch('/users/{id}/role', [AdminController::class, 'updateRole']);
        });

        Route::middleware('role:psicologo')->prefix('psicologo')->group(function () {
            Route::get('/sin-asignar', [PsicologoController::class, 'getSinAsignar']);
            Route::get('/pacientes', [PsicologoController::class, 'getPacientes']);
            Route::get('/pacientes/{id}/datos', [PsicologoController::class, 'getDatosPaciente']);
            Route::post('/pacientes/{id}/solicitar', [PsicologoController::class, 'solicitar']);
            Route::get('/solicitudes-enviadas', [PsicologoController::class, 'getSolicitudes']);
            Route::delete('/pacientes/{id}/desasignar', [PsicologoController::class, 'desasignar']);

            Route::get('/citas', [CitasController::class, 'index']);
            Route::post('/citas', [CitasController::class, 'store']);
            Route::patch('/citas/{id}', [CitasController::class, 'update']);
            Route::delete('/citas/{id}', [CitasController::class, 'destroy']);

            //Mensajes entre psicólogo y paciente
            Route::get('/messages/{otherUserId}',     [MessageController::class, 'index']);
            Route::post('/messages',                   [MessageController::class, 'store']);
            Route::patch('/messages/{senderId}/read',  [MessageController::class, 'markAsRead']);

        });
    });
});
