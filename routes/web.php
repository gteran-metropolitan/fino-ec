<?php

use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => false, // Registro deshabilitado - app privada
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Rutas de gestión de usuarios - Solo Super Admin
    Route::middleware(['super_admin'])->group(function () {
        Route::resource('users', UserManagementController::class);
        Route::patch('users/{user}/toggle-active', [UserManagementController::class, 'toggleActive'])
            ->name('users.toggle-active');
    });

    // Rutas de gestión de proveedores
    Route::resource('suppliers', SupplierController::class);
    Route::patch('suppliers/{supplier}/toggle-active', [SupplierController::class, 'toggleActive'])
        ->name('suppliers.toggle-active');
});

require __DIR__.'/settings.php';
