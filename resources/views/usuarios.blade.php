@extends('layouts.app')

@section('page-title', 'Usuarios')
@section('title', 'Gestión de Usuarios')

@section('content')
  <div class="row">
    <div class="col-12">
      <div class="card shadow-sm">
        <div class="card-body">
          <!-- Botón crear -->
          <div class="mb-3 flex">
            <button class="btn btn-primary w-[150px]" id="btn-add-user">Añadir Usuario</button>
          </div>
          <!-- Botón crear -->

          <!-- Tabla -->
          <div class="table-responsive">
            <table id="users-table" class="table table-bordered table-hover table-sm mb-3 mt-2">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Administrador</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
          <!-- Tabla -->
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Crear/Editar -->
  <div class="modal fade" id="userModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <form id="userForm">
          <div class="modal-header">
            <h5 class="modal-title">Usuario</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="user_id">
            <div class="mb-3">
              <label for="name" class="form-label">Nombre</label>
              <input type="text" id="name" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input type="password" id="password" class="form-control">
              <small class="text-muted">Dejar vacío si no se quiere cambiar</small>
            </div>
            <div class="form-check mb-3">
              <input type="checkbox" id="is_admin" class="form-check-input">
              <label for="is_admin" class="form-check-label">Administrador</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="submit" class="btn btn-primary">Guardar</button>
            <button type="reset" id="btn-close-modal" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- Modal Crear/Editar -->
  
  <!-- Vite JS -->
  @vite(['resources/js/ajax/users.js'])
@endsection
