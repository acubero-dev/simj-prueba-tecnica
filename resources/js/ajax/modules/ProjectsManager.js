export function ProjectsManager() {
    const projectsContainer = document.getElementById("projects");

    const projestsModalElement = document.getElementById("modal-create-project");
    const projectsModal = new bootstrap.Modal(projestsModalElement);

    // Abrir modal para crear proyecto
    $("#btn-create-project").on("click", function () {
        $("#form-create-project")[0].reset();
        projectsModal.show();
    });
    
    // Cerrar modal de crear proyecto
    $("#form-create-project").on("reset", () => {
        projectsModal.hide();
    });

    // Guardar proyecto
    $("#form-create-project").on("submit", function (event) {
        event.preventDefault();

        const id = event.target.project_id.value;
        const method = id ? "PUT" : "POST";

        $.ajax({
            url: "/data/projects",
            method: method,
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr('content'),
            },
            data: {
                id: id,
                name: $(this).find("#name").val()
            },
            dataType: "json",
            success: function() {
                projectsModal.hide();
                $("#form-create-project")[0].reset();
                $("#project_id").val("");
                loadProjects();

                refreshCalendar();

                window.Toast.fire({icon: "success", title: "Proyecto guardado"});
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error al guardar proyecto"});
            },
        });
    });

    // Cargar y mostrar proyectos
    const loadProjects = () => {
        projectsContainer.innerHTML = ``;
        
        $.ajax({
            url: "/data/projects",
            method: "GET",
            dataType: "json",
            success: function(projects) {
                if (projects.length === 0) {
                    projectsContainer.innerHTML = `<p class="text-gray-500">No hay proyectos disponibles.</p>`;
                    return;
                }

                projects.forEach((project) => {
                    card(project);
                });
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error al cargar proyectos"});
            }
        });
    };



    // Creación de la tarjeta
    const card = (project) => {
        const div = document.createElement("div");
        div.className ="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-move";

        div.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-800 text-lg mb-2">${
                        project.name
                    }</h3>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <i class="fas fa-user text-gray-400"></i>
                        <span>${project.user.name}</span>
                    </div>
                </div>
                <span class="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                    <i class="fas fa-calendar mr-1"></i>
                    ${new Date(project.created_at).toLocaleDateString()}
                </span>
            </div>
        `;

        if (IS_ADMIN == 1) {
            div.innerHTML += `
                <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <button class="btn btn-sm btn-outline-primary btn-edit flex items-center gap-1" data-id="${project.id}">
                        <i class="fas fa-edit text-xs"></i>
                        Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete flex items-center gap-1" data-id="${project.id}">
                        <i class="fas fa-trash text-xs"></i>
                        Borrar
                    </button>
                </div>
            `;
        }

        div.setAttribute("project_id", project.id);
        div.setAttribute("project_name", project.name);

        arrastable(div);
        projectsContainer.appendChild(div);
    };

    // Hacer tarjeta de proyecto arrastrable
    const arrastable = (element) => {
        element.setAttribute("draggable", "true");

        element.addEventListener("dragstart", (e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("project_id", element.getAttribute("project_id"));
            e.dataTransfer.setData("project_name", element.getAttribute("project_name"));                    
            e.target.classList.add("dragging");
        });

        element.addEventListener("dragend", (e) => {
            e.target.classList.remove("dragging");
        });
    };

    // Editar proyecto con jQuery
    $("#projects").on("click", ".btn-edit", function () {
        const id = $(this).data("id");
        
        $.ajax({
            url: "/data/projects",
            method: "GET",
            dataType: "json",
            success: function(projects) {
                const project = projects.find((p) => p.id == id);
                if (!project) return;

                $("#name").val(project.name);
                $("#project_id").val(project.id);

                projectsModal.show();
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error cargando proyectos"});
            }
        });
    });

    // Borrar proyecto con jQuery
    $("#projects").on("click", ".btn-delete", function () {
        const id = $(this).data("id");

        window.Swal.fire({
            title: "¿Seguro que quieres eliminar este proyecto?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (!result.isConfirmed) {return}

            $.ajax({
                url: "/data/projects",
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr('content'),
                },
                data: {
                    id: id
                },
                dataType: "json",
                success: function() {
                    loadProjects();

                    // Refrescamos el calendario para quitar las tareas de este proyecto de la interfaz
                    refreshCalendar();

                    window.Toast.fire({icon: "success",title: "Proyecto eliminado"});
                },
                error: function() {
                    window.Swal.fire({icon: "error", title: "Error al eliminar proyecto"});
                }
            });
        });
    });

    loadProjects();


    window.refreshProjects = loadProjects;
}