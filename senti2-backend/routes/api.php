<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;

Route::prefix('v1')->group(function () {
    Route::post('/auth/verify', [AuthController::class, 'verifyToken']);
    
    Route::middleware('auth:supabase')->group(function () {
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::patch('/profile', [ProfileController::class, 'update']);
    });
});

