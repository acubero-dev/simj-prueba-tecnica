@extends('layouts.app')

@section('title', 'Inicio')
@section('page-title', 'Inicio')

@section('content')
<div class="row">
    @php
        $usersCard = auth()->user()->is_admin;
        $colClass = $usersCard ? 'col-lg-6 col-md-12 mb-4' : 'col-12 mb-4';
    @endphp

    <!-- Card de Usuarios -->
    @if($usersCard)
    <div class="col-lg-6 col-md-12 mb-4">
        <div class="card border-primary shadow-sm h-100">
            <div class="card-body d-flex flex-column justify-content-between">
                <div>
                    <h5 class="card-title text-primary"><i class="fas fa-users mr-2"></i> Gestión de Usuarios</h5>
                    <p class="card-text">Crea, edita y administra los usuarios de la aplicación.</p>
                </div>
                <a href="{{ route('usuarios') }}" class="btn btn-primary mt-3">Ir a Gestión de Usuarios</a>
            </div>
        </div>
    </div>
    @endif

    <!-- Card de Proyectos -->
    <div class="{{ $colClass }}">
        <div class="card border-success shadow-sm h-100">
            <div class="card-body d-flex flex-column justify-content-between">
                <div>
                    <h5 class="card-title text-success"><i class="fas fa-tasks mr-2"></i> Gestor de Proyectos</h5>
                    <p class="card-text">Visualiza y gestiona los proyectos y tareas asignadas a los usuarios.</p>
                </div>
                <a href="{{ route('control') }}" class="btn btn-success mt-3">Ir a Control de Proyectos</a>
            </div>
        </div>
    </div>
</div>
@endsection
