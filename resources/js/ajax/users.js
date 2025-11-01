import 'datatables.net-bs4';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';

document.addEventListener("DOMContentLoaded", function () {
    const modalElement = document.getElementById("userModal");
    const modal = new bootstrap.Modal(modalElement);
    const userForm = document.getElementById("userForm");

    //  Crear tabla de usuarios con DataTables
    const table = $('#users-table').DataTable({
        ajax: {
            url: "/data/users",
            dataSrc: ""
        },
        columns: [
            { data: 'id' },
            { data: 'name' },
            { data: 'email' },
            {
                data: 'is_admin',
                render: (data) => data ? 'Sí' : 'No'
            },
            {
                data: null,
                render: (row) => `
                    <button class="btn btn-sm btn-outline-primary btn-edit flex items-center gap-1" data-id="${row.id}">
                        <i class="fas fa-edit text-xs"></i>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete flex items-center gap-1" data-id="${row.id}">
                        <i class="fas fa-trash text-xs"></i>
                        Borrar
                    </button>
                `
            }
        ],
        language: {
            url: "/datatables/es-ES.json",
        },
    });

    // Abrir modal para crear usuario
    $("#btn-add-user").on("click", function () {  
        userForm.reset();
        $("#user_id").value = "";
        modal.show();
    });

    // Cerrar modal
    $("#userForm").on("reset", function () {
        modal.hide();
    });

    // Editar usuario
    $('#users-table').on('click', '.btn-edit', function () {
        const id = $(this).data('id');
        $.ajax({
            url: "/data/users",
            method: "GET",
            dataType: "json",
            success: function(response) {
                const user = response.find(u => u.id == id);
                if (!user) return;

                document.getElementById("user_id").value = user.id;
                document.getElementById("name").value = user.name;
                document.getElementById("email").value = user.email;
                document.getElementById("is_admin").checked = user.is_admin;
                
                modal.show();
            },
            error: function(error) {
                console.error('Error:', error);
            }
        });
    });

    // Guardar usuario
    $("#userForm").on("submit", function (event) {
        event.preventDefault();

        const id = document.getElementById("user_id").value;
        const method = id ? "PUT" : "POST";

        $.ajax({
            url: "/data/users",
            method: method,
            headers: {
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
            },
            data: {
                id: id,
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value,
                is_admin: document.getElementById("is_admin").checked ? 1 : 0
            },
            dataType: "json",
            success: function() {
                modal.hide();
                table.ajax.reload();
                window.Toast?.fire({ icon: "success", title: "Usuario guardado" });
            },
            error: function() {
                window.Toast?.fire({ icon: "error", title: "Error al guardar usuario" });
            }
        });
    });

    // Eliminar usuario
    $('#users-table').on('click', '.btn-delete', function () {
        const id = $(this).data('id');

        window.Swal.fire({
            title: "¿Seguro que quieres eliminar este usuario?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(result => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/data/users",
                    method: "DELETE",
                    headers: {
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
                    },
                    data: {
                        id: id
                    },
                    dataType: "json",
                    success: function() {
                        table.ajax.reload();
                        window.Toast?.fire({ icon: "success", title: "Usuario eliminado" });
                    },
                    error: function() {
                        window.Swal.fire({ icon: "error", title: "Error al eliminar usuario" });
                    }
                });
            }
        });
    });
});
