import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

document.addEventListener("DOMContentLoaded", function () {
    const projectsContainer = document.getElementById("projects");
    const calendarEl = document.getElementById("calendar");

    const btnCreateProject = document.getElementById("btn-create-project");
    const btnGeneratePDF = document.getElementById("btn-generate-pdf");

    const modalElement = document.getElementById("modal-create-project");
    const modal = new bootstrap.Modal(modalElement);
    const projectForm = document.getElementById("form-create-project");

    // Cargar proyectos
    const fetchProjects = async () => {
        try {
            const res = await fetch("/data/projects");
            const projects = await res.json();

            projectsContainer.innerHTML = "";

            if (projects.length === 0) {
                projectsContainer.innerHTML = `<p class="text-gray-500">No hay proyectos disponibles.</p>`;
                return;
            }

            projects.forEach((project) => {
                const div = document.createElement("div");
                div.className =
                    "flex flex-row justify-between items-center border rounded-lg p-3 hover:bg-gray-100";

                div.innerHTML = `
                    <div class=" sm:mb-0 flex flex-col gap-3">
                        <h6 class="font-medium text-gray-800 m-0">${
                            project.name
                        }</h6>
                        <p class="text-sm text-gray-500 m-0">Creado por <span class="font-medium text-gray-700">${
                            project.user?.name || "Desconocido"
                        }</span></p>
                    </div>
                    <div>
                    <p class="text-sm text-gray-400 text-right">${new Date(
                        project.created_at
                    ).toLocaleDateString()}</p>

                    ${
                        IS_ADMIN == 1
                            ? `
                        <div class="flex gap-2">
                            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${project.id}">
                                Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${project.id}">
                                Borrar
                            </button>
                        </div>
                    `
                            : ""
                    }
                    </div>
                `;
                projectsContainer.appendChild(div);
            });

            renderCalendar(projects);
        } catch (e) {
            console.error(e);
            window.Toast?.fire({
                icon: "error",
                title: "Error al cargar proyectos",
            });
        }
    };

    // Abrir modal para crear proyecto
    btnCreateProject.addEventListener("click", () => {
        projectForm.reset();
        modal.show();
    });

    // Cerrar modal al enviar el formulario
    projectForm.addEventListener("reset", async (e) => {
        modal.hide();
        await fetchProjects();
    });

    // Editar proyecto
    $("#projects").on("click", ".btn-edit", function () {
        const id = $(this).data("id");
        fetch(`/data/projects`)
            .then((res) => res.json())
            .then((json) => {
                const project = json.find((p) => p.id == id);
                if (!project) return;

                document.getElementById("name").value = project.name;
                document.getElementById("project_id").value = project.id;

                modal.show();
            });
    });

    // Borrar proyecto
    $("#projects").on("click", ".btn-delete", function () {
        const id = $(this).data("id");
        
        window.Swal.fire({
            title: "¿Seguro que quieres eliminar este proyecto?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(result => {
            if (result.isConfirmed) {
                fetch("/data/projects", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ id })
                })
                .then(res => res.json())
                .then(() => {
                    fetchProjects();
                    window.Toast?.fire({ icon: "success", title: "Proyecto eliminado" });
                })
                .catch((e) => {
                    console.error(e);
                    window.Swal.fire({ icon: "error", title: "Error al eliminar proyecto" });
                });
            }
        });
    });

    // Guardar proyecto
    projectForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("project_id").value;
        const method = id ? "PUT" : "POST";

        fetch("/data/projects", {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector(
                    'meta[name="csrf-token"]'
                ).content,
            },
            body: JSON.stringify({
                id: id,
                name: document.getElementById("name").value,
            }),
        })
            .then((res) => res.json())
            .then(() => {
                modal.hide();
                fetchProjects();
                window.Toast?.fire({
                    icon: "success",
                    title: "Proyecto guardado",
                });
            })
            .catch((e) => {
                console.error(e);
                window.Toast?.fire({
                    icon: "error",
                    title: "Error al guardar proyecto",
                });
            });
    });

    // Generar PDF
    btnGeneratePDF.addEventListener("click", () => {});

    // Renderizar el calendario
    const renderCalendar = (projects) => {
        const calendar = new Calendar(calendarEl, {
            initialView: "timeGridDay",
            locale: "esLocale",
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            themeSystem: "bootstrap5",

            // Configuración de horario
            slotMinTime: "08:00:00",
            slotMaxTime: "19:00:00",
            slotDuration: "00:30:00",
            slotLabelInterval: "00:30:00",

            // Configuración de visualización
            allDaySlot: false,
            nowIndicator: true,

            // Configuración de herramientas del encabezado
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
            },

            buttonText: {
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
            },

            // Configuración de formato de etiquetas de tiempo
            slotLabelFormat: {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            },

            // events: "/data/tasks",
        });

        calendar.render();
    };

    fetchProjects();
});
