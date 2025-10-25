<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ControlController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect(route('inicio'));
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/inicio', function () {
        return view('inicio');
    })->name('inicio');

    Route::get('/control', function () {
        return view('control');
    })->name('control');

    Route::get('/usuarios', function () {
        return view('usuarios');
    })->name('usuarios');
});

// Rutas protegidas con auth
Route::middleware(['auth', 'verified'])->group(function () {
    // Perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

