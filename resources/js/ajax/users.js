let currentPage = 1;
let searchQuery = "";

const fetchUsers = (page = 1) => {
    currentPage = page;
    $.get("/data/users", { page: page, search: searchQuery }, function (data) {
        const tbody = $("#users-table-body");
        tbody.empty();
        data.data.forEach((user) => {
            tbody.append(`
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.is_admin ? "Sí" : "No"}</td>
                <td>
                    <button class="btn btn-sm btn-edit" data-id="${
                        user.id
                    }">Editar</button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${
                        user.id
                    }">Eliminar</button>
                </td>
            </tr>
        `);
        });

        // Paginación
        const pagination = $("#pagination");
        pagination.empty();
        for (let i = 1; i <= data.last_page; i++) {
            pagination.append(`
                <li class="page-item ${i === data.current_page ? "active" : ""}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }
    });
};

$(document).on('click', '#pagination .page-link', function (e) {
    e.preventDefault();
    const page = parseInt($(this).data('page'), 10) || 1;
    fetchUsers(page);
});

$(document).ready(function () {
    fetchUsers();

    $("#search").on("input", function () {
        searchQuery = $(this).val();
        fetchUsers();
    });

    $("#btn-add-user").click(function () {
        $("#userForm")[0].reset();
        $("#user_id").val("");
        $("#userModal").modal("show");
    });

    $(document).on("click", ".btn-edit", function () {
        const id = $(this).data("id");
        $.get("/data/users", { page: 1, search: "" }, function (data) {
            const user = data.data.find((u) => u.id == id);
            if (user) {
                $("#user_id").val(user.id);
                $("#name").val(user.name);
                $("#email").val(user.email);
                $("#is_admin").prop("checked", user.is_admin);
                $("#userModal").modal("show");
            }
        });
    });

    $("#userForm").submit(function (e) {
        e.preventDefault();
        const id = $("#user_id").val();
        const method = id ? "PUT" : "POST";

        $.ajax({
            url: "/data/users",
            method: method,
            data: {
                id: id,
                name: $("#name").val(),
                email: $("#email").val(),
                password: $("#password").val(),
                is_admin: $("#is_admin").is(":checked") ? 1 : 0,
            },
            success: function () {
                $("#userModal").modal("hide");
                fetchUsers(currentPage);
                window.Toast?.fire({ icon: 'success', title: 'Usuario guardado' });
            },
            error: function (err) {
                window.Toast?.fire({ icon: 'error', title: 'Error al guardar usuario' });
                console.log(err);
            },
        });
    });

    $(document).on("click", ".btn-delete", function () {
    const id = $(this).data("id");

    window.Swal.fire({
        title: '¿Seguro que quieres eliminar este usuario?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: "/data/users",
                method: "DELETE",
                data: { id },
                success: function () {
                    fetchUsers(currentPage);
                    window.Toast?.fire({ icon: 'success', title: 'Usuario eliminado' });
                },
                error: function (err) {
                    window.Swal?.fire({ icon: 'error', title: 'Error al eliminar usuario', text: err.responseJSON?.message || '' });
                    console.log(err);
                },
            });
        }
    });
});
});
