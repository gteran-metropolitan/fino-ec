<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    // Perfil: todos pueden ver, pero solo no-digitadores pueden editar
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])
        ->middleware('deny_data_entry')
        ->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Eliminar cuenta: solo no-digitadores
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])
        ->middleware('deny_data_entry')
        ->name('profile.destroy');

    // Contraseña: solo no-digitadores
    Route::get('settings/password', [PasswordController::class, 'edit'])
        ->middleware('deny_data_entry')
        ->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware(['throttle:6,1', 'deny_data_entry'])
        ->name('user-password.update');

    // Apariencia: todos pueden cambiar
    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    // Two-factor: solo no-digitadores
    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->middleware('deny_data_entry')
        ->name('two-factor.show');
});
