@extends('layouts.app')

@section('title', 'Control de proyectos')
@section('page-title', 'Control de proyectos')

@section('content')
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    
    <!-- Panel de proyectos -->
    <div class="card shadow-sm">
      <div class="card-body">
        <!-- Cabecera -->
        <div class="flex justify-between items-center w-full pb-3 border-b mb-4">
          <h5 class="mb-0 text-lg font-semibold text-gray-700">Proyectos</h5>
          <div class="space-x-2">
            <button class="btn btn-sm btn-primary" title="Nuevo proyecto">
              <i class="fas fa-plus"></i>
            </button>
            <button class="btn btn-sm btn-info" id="btn-generate-pdf" title="Exportar a PDF">
              <i class="fas fa-file-pdf"></i>
            </button>
          </div>
        </div>

        <!-- Lista de proyectos -->
        <div id="projects" class="space-y-3 overflow-y-auto max-h-[600px]"></div>
      </div>
    </div>
    <!-- /Panel de proyectos -->

    <!-- Calendario -->
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="flex justify-between items-center pb-3 border-b mb-4">
          <h5 class="mb-0 text-lg font-semibold text-gray-700">Calendario de tareas</h5>
        </div>
        <div id="calendar" class="min-h-[500px]"></div>
      </div>
    </div>
    <!-- /Calendario -->

  </div>
@endsection
