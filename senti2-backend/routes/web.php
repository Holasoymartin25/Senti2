<?php

use App\Http\Controllers\Web\AdminAuthController;
use App\Http\Controllers\Web\AdminUserController;
use App\Http\Controllers\Web\LocaleController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/panel-admin/login');

Route::get('panel-admin/css/admin.css', function () {
    return response()->file(public_path('css/admin.css'), [
        'Content-Type' => 'text/css; charset=UTF-8',
    ]);
})->name('admin.css');

Route::prefix('panel-admin')->name('admin.')->group(function () {
    Route::get('locale/{locale}', [LocaleController::class, 'switch'])->name('locale');

    Route::middleware('guest')->group(function () {
        Route::get('login', [AdminAuthController::class, 'showLogin'])->name('login');
        Route::post('login', [AdminAuthController::class, 'login'])->name('login.submit');
    });

    Route::middleware(['auth', 'role:admin'])->group(function () {
        Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');
        Route::resource('users', AdminUserController::class)->except(['show']);
    });
});
