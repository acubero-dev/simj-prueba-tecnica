@extends('layouts.app')

@section('title', 'Control de proyectos')
@section('page-title', 'Control de proyectos')

@section('content')
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

    <!-- Panel de proyectos -->
    <div class="card shadow-sm col-span-1">
      <div class="card-body">
        <!-- Cabecera -->
        <div class="flex justify-between items-center w-full pb-3 border-b mb-4">
          <h5 class="mb-0 text-lg font-semibold text-gray-700">Proyectos</h5>
          <div class="space-x-2">
            <button id="btn-create-project" class="btn btn-sm btn-primary" title="Nuevo proyecto">
              <i class="fas fa-plus"></i>
            </button>
            <button id="btn-generate-pdf" class="btn btn-sm btn-info" title="Exportar a PDF">
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
    <div class="card shadow-sm col-span-1 md:col-span-2">
      <div class="card-body">
        <div class="flex justify-between items-center pb-3 border-b mb-4">
          <h5 class="mb-0 text-lg font-semibold text-gray-700">Calendario de tareas</h5>
        </div>
        <div>
          <select name="users" id="users"></select>
        </div>
        <div id="calendar" class="max-h-[600px]"></div>
      </div>
    </div>
    <!-- /Calendario -->

  </div>

  <!-- Modal crear proyecto -->
  <div id="modal-create-project" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Crear nuevo proyecto</h5>
        </div>
        <div class="modal-body">
          <form id="form-create-project">
            <div class="mb-3">
              <input type="hidden" id="project_id">
              
              <label for="name" class="form-label">Nombre del proyecto</label>
              <input type="text" class="form-control" id="name" required>
            </div>
            <div class="flex justify-end space-x-2">
              <button type="submit" class="btn btn-primary">Guardar</button>
              <button type="reset" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal crear proyecto -->

  <!-- Modal crear tarea -->
  <div id="modal-create-task" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Crear nuevo tarea</h5>
        </div>
        <div class="modal-body">
          <form id="form-create-task">
            <div class="mb-3">   
              <label for="start_at" class="form-label">Inicio tarea</label>
              <input type="datetime-local" class="form-control" id="start_at" step="1800" required>
              
              <label for="description" class="form-label">Descripción</label>
              <input type="textarea" class="form-control" id="description" required>
              
              <label for="end_at" class="form-label">Fin tarea</label>
              <input type="datetime-local" class="form-control" id="end_at" step="1800" required>
            </div>
            <div class="flex justify-end space-x-2">
              <button type="submit" class="btn btn-primary">Guardar</button>
              <button type="reset" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal crear tarea -->

<!-- Modal crear pdf -->
  <div id="modal-generate-pdf" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Opciones de informe</h5>
        </div>
        <div class="modal-body">
          <form id="form-generate-pdf">
            <div class="mb-3">              
              <label for="start_at" class="form-label">Fecha desde</label>
              <input type="date" class="form-control" id="start_at">

              <label for="end_at" class="form-label">Fecha hasta</label>
              <input type="date" class="form-control" id="end_at">

              <label for="project" class="form-label">Proyecto</label>
              <select name="project" id="project" required></select>
              
              <label for="user" class="form-label">Usuario</label>
              <select name="user" id="user" required></select>
            </div>
            <div class="flex justify-end space-x-2">
              <button type="submit" class="btn btn-primary">Generar</button>
              <button type="reset" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal crear pdf -->


  <!-- Variables JS -->
  <script>
      const IS_ADMIN = @json(auth()->user()?->is_admin);
      const currentUserId = {{ auth()->id() }};
  </script>

  <!-- Vite JS -->
  @vite(['resources/js/ajax/projects.js'])
@endsection