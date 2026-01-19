<?php

use App\Http\Controllers\DeliveryFlowController;
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

    // ==========================================
    // MÓDULO PRINCIPAL: Entrega y Postcosecha
    // ==========================================
    Route::get('/delivery-flow', [DeliveryFlowController::class, 'index'])->name('delivery-flow.index');
    Route::get('/delivery-flow/create', [DeliveryFlowController::class, 'create'])->name('delivery-flow.create');
    Route::post('/delivery-flow', [DeliveryFlowController::class, 'store'])->name('delivery-flow.store');
    Route::post('/delivery-flow/search-supplier', [DeliveryFlowController::class, 'searchSupplier'])->name('delivery-flow.search-supplier');
    Route::post('/delivery-flow/quick-supplier', [DeliveryFlowController::class, 'storeQuickSupplier'])->name('delivery-flow.quick-supplier');
    Route::get('/delivery-flow/{delivery_flow}', [DeliveryFlowController::class, 'show'])->name('delivery-flow.show');
    Route::get('/delivery-flow/{delivery_flow}/edit', [DeliveryFlowController::class, 'edit'])->name('delivery-flow.edit');
    Route::put('/delivery-flow/{delivery_flow}', [DeliveryFlowController::class, 'update'])->name('delivery-flow.update');
    Route::patch('/delivery-flow/{delivery_flow}/info', [DeliveryFlowController::class, 'updateInfo'])->name('delivery-flow.update-info');
    Route::delete('/delivery-flow/{delivery_flow}', [DeliveryFlowController::class, 'destroy'])->name('delivery-flow.destroy');

    // ==========================================
    // Rutas secundarias (para edición individual)
    // ==========================================

    // Rutas de ingreso de productos
    Route::resource('product-entries', ProductEntryController::class);
    Route::get('suppliers/{supplier}/varieties', [ProductEntryController::class, 'getSupplierVarieties'])
        ->name('suppliers.varieties');

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
