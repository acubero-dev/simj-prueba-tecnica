document.addEventListener("DOMContentLoaded", function () {
    let currentPage = 1;
    let searchQuery = "";

    const modalEl = document.getElementById("userModal");
    const modal = new bootstrap.Modal(modalEl);
    const tbody = document.getElementById("users-table-body");
    const paginationEl = document.getElementById("pagination");
    const searchInput = document.getElementById("search");
    const userForm = document.getElementById("userForm");

    // Función para listar usuarios
    const fetchUsers = (page = 1) => {
        currentPage = page;

        const params = new URLSearchParams({ page, search: searchQuery });
        fetch(`/data/users?${params}`)
            .then(res => res.json())
            .then(data => {
                tbody.innerHTML = "";
                data.data.forEach(user => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.is_admin ? "Sí" : "No"}</td>
                        <td>
                            <button class="btn btn-sm btn-edit" data-id="${user.id}">Editar</button>
                            <button class="btn btn-sm btn-danger btn-delete" data-id="${user.id}">Eliminar</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                // Paginación
                paginationEl.innerHTML = "";
                for (let i = 1; i <= data.last_page; i++) {
                    const li = document.createElement("li");
                    li.className = `page-item ${i === data.current_page ? "active" : ""}`;
                    li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
                    paginationEl.appendChild(li);
                }
            })
            .catch(err => console.error(err));
    };

    // Click en la paginación
    paginationEl.addEventListener("click", function (e) {
        if (e.target.matches(".page-link")) {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page, 10) || 1;
            fetchUsers(page);
        }
    });

    // Buscar usuarios
    searchInput.addEventListener("input", function () {
        searchQuery = this.value;
        fetchUsers();
    });

    // Abrir modal para crear usuario
    document.getElementById("btn-add-user").addEventListener("click", () => {
        userForm.reset();
        document.getElementById("user_id").value = "";
        modal.show();
    });

    // Cerrar modal con botón "Cancelar"
    modalEl.addEventListener("click", function (e) {
        if (e.target.classList.contains("btn-secondary")) {
            modal.hide();
        }
    });

    // Editar usuario
    tbody.addEventListener("click", function (e) {
        if (e.target.closest(".btn-edit")) {
            const id = e.target.closest(".btn-edit").dataset.id;

            fetch(`/data/users?page=1&search=`)
                .then(res => res.json())
                .then(data => {
                    const user = data.data.find(u => u.id == id);
                    if (user) {
                        document.getElementById("user_id").value = user.id;
                        document.getElementById("name").value = user.name;
                        document.getElementById("email").value = user.email;
                        document.getElementById("is_admin").checked = user.is_admin;
                        modal.show();
                    }
                });
        }
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
            fetchUsers(currentPage);
            window.Toast?.fire({ icon: "success", title: "Usuario guardado" });
        })
        .catch(err => {
            console.error(err);
            window.Toast?.fire({ icon: "error", title: "Error al guardar usuario" });
        });
    });

    // Eliminar usuario
    tbody.addEventListener("click", function (e) {
        if (e.target.closest(".btn-delete")) {
            const id = e.target.closest(".btn-delete").dataset.id;

            window.Swal.fire({
                title: "¿Seguro que quieres eliminar este usuario?",
                text: "Esta acción no se puede deshacer",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
                reverseButtons: true,
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
                        fetchUsers(currentPage);
                        window.Toast?.fire({ icon: "success", title: "Usuario eliminado" });
                    })
                    .catch(err => {
                        console.error(err);
                        window.Swal.fire({ icon: "error", title: "Error al eliminar usuario" });
                    });
                }
            });
        }
    });

    // Cargar usuarios al inicio
    fetchUsers();
});
