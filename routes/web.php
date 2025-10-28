<?php

use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\IsAdmin;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect(route('inicio'));
});

// Rutas protegidas con auth
Route::middleware(['auth', 'verified'])->group(function () {
    // Rutas de la aplicación
    Route::get('/inicio', function () {
        return view('inicio');
    })->name('inicio');

    Route::get('/control', function () {
        return view('control');
    })->name('control');

    Route::get('/usuarios', function () {
        return view('usuarios');
    })->name('usuarios')->middleware([IsAdmin::class]);

    // Rutas de los Endpoints API
    Route::get('/data/users', [UserController::class, 'list'])->middleware([IsAdmin::class])->name('data.users');
    Route::post('/data/users', [UserController::class, 'create'])->middleware([IsAdmin::class])->name('data.users');
    Route::put('/data/users', [UserController::class, 'update'])->middleware([IsAdmin::class])->name('data.users');
    Route::delete('/data/users', [UserController::class, 'delete'])->middleware([IsAdmin::class])->name('data.users');

    Route::get('/data/projects', [ProjectController::class, 'list'])->name('data.projects');
    Route::post('/data/projects', [ProjectController::class, 'create'])->name('data.projects');
    Route::put('/data/projects', [ProjectController::class, 'update'])->middleware([IsAdmin::class])->name('data.projects');
    Route::delete('/data/projects', [ProjectController::class, 'delete'])->middleware([IsAdmin::class])->name('data.projects');

    Route::get('/data/tasks', [TaskController::class, 'list'])->name('data.tasks');
    Route::post('/data/tasks', [TaskController::class, 'create'])->name('data.tasks');
    Route::put('/data/tasks', [TaskController::class, 'update'])->name('data.tasks');
    Route::delete('/data/tasks', [TaskController::class, 'delete'])->name('data.tasks');
});

require __DIR__.'/auth.php';
