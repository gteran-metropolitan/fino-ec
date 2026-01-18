<?php

use App\Http\Controllers\LocalFlowerController;
use App\Http\Controllers\ProductEntryController;
use App\Http\Controllers\StemClassificationController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => false,
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

    // Rutas de ingreso de productos
    Route::resource('product-entries', ProductEntryController::class);

    // Rutas de clasificaciones (Exportable)
    Route::get('/classifications', [StemClassificationController::class, 'index'])->name('classifications.index');
    Route::delete('/classifications/{classification}', [StemClassificationController::class, 'destroy'])->name('classifications.destroy');
    Route::get('/product-entries/{product_entry}/classify', [StemClassificationController::class, 'create'])->name('product-entries.classify');
    Route::post('/product-entries/{product_entry}/classify', [StemClassificationController::class, 'store'])->name('product-entries.classify.store');

    // Rutas de Flor Local
    Route::get('/local-flowers', [LocalFlowerController::class, 'index'])->name('local-flowers.index');
    Route::get('/product-entries/{product_entry}/local-flower', [LocalFlowerController::class, 'create'])->name('product-entries.local-flower');
    Route::post('/product-entries/{product_entry}/local-flower', [LocalFlowerController::class, 'store'])->name('product-entries.local-flower.store');
    Route::delete('/local-flowers/{classification}', [LocalFlowerController::class, 'destroy'])->name('local-flowers.destroy');
});

require __DIR__.'/settings.php';
