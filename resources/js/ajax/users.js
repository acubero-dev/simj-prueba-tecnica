import 'datatables.net-bs4';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';

document.addEventListener("DOMContentLoaded", function () {
    const modalElement = document.getElementById("userModal");
    const modal = new bootstrap.Modal(modalElement);
    const userForm = document.getElementById("userForm");

    //  Crear tabla de usuarios con DataTables
    const table = $('#users-table').DataTable({
        ajax: {
            url: '/data/users',
            dataSrc: 'data'
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
                render: (data, type, row) => `
                    <button class="btn btn-sm btn-edit btn-primary" data-id="${row.id}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${row.id}">Eliminar</button>
                `
            }
        ],
        language: {
            url: '/datatables/es-ES.json',
        },
    });

    // Abrir modal para crear usuario
    document.getElementById("btn-add-user").addEventListener("click", () => {
        userForm.reset();
        document.getElementById("user_id").value = "";
        modal.show();
    });

    // Cerrar modal
    document.getElementById("btn-close-modal").addEventListener("click", () => {
        modal.hide();
    });

    // Editar usuario
    $('#users-table').on('click', '.btn-edit', function () {
        const id = $(this).data('id');
        fetch(`/data/users`)
            .then(res => res.json())
            .then(json => {
                const user = json.data.find(u => u.id == id);
                if (!user) return;

                document.getElementById("user_id").value = user.id;
                document.getElementById("name").value = user.name;
                document.getElementById("email").value = user.email;
                document.getElementById("is_admin").checked = user.is_admin;
                
                modal.show();
            });
    });

    // Guardar usuario
    userForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const id = document.getElementById("user_id").value;
        const method = id ? "PUT" : "POST";

        fetch("/data/users", {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({
                id: id,
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value,
                is_admin: document.getElementById("is_admin").checked ? 1 : 0
            })
        })
        .then(res => res.json())
        .then(() => {
            modal.hide();
            table.ajax.reload();
            window.Toast?.fire({ icon: "success", title: "Usuario guardado" });
        })
        .catch(() => {
            window.Toast?.fire({ icon: "error", title: "Error al guardar usuario" });
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
                fetch("/data/users", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ id })
                })
                .then(res => res.json())
                .then(() => {
                    table.ajax.reload();
                    window.Toast?.fire({ icon: "success", title: "Usuario eliminado" });
                })
                .catch(() => {
                    window.Swal.fire({ icon: "error", title: "Error al eliminar usuario" });
                });
            }
        });
    });
});
