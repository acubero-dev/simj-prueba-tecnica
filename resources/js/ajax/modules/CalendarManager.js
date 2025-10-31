import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export function CalendarManager() {
    const calendarEl = document.getElementById("calendar");

    const taskModalElement = document.getElementById("modal-create-task");
    const taskModal = new bootstrap.Modal(taskModalElement);
    const taskForm = document.getElementById("form-create-task");

    let calendar;

    // Creación del select2 de usuarios
    $("#users").select2({
        width: "100%",
    });

    // Cargar usuarios, seleccionar el actual y renderizar su calendario
    fetch("/data/users")
        .then((res) => res.json())
        .then((data) => {
            data.data.forEach((user) => {
                $("#users").append(new Option(user.name, user.id));
            });
            // Seleccionar usuario actual
            $("#users").val(currentUserId).trigger("change");

            renderCalendar(currentUserId);
        });

    

    // Cuando cambiamos el usuario cargamos su calendario
    $("#users").on('change', function() {
        const userId = $(this).val();        
        renderCalendar(userId);
    });


    // Renderizar el calendario
    const renderCalendar = (userId = null) => {
        calendarEl.innerHTML = "";
        calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            themeSystem: "bootstrap5",
            locale: "esLocale",
            initialView: "timeGridDay",

            // Configuración de horario
            // slotMinTime: "08:00:00",
            // slotMaxTime: "19:00:00",
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

            // Traducción manual de botones
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

            // Habilitar drop externo
            droppable: true,
            dropAccept: ".cursor-move", // Aceptar elementos con esta clase

            // Configuración adicional para mejorar la experiencia de arrastre
            dragScroll: true,
            editable: true,

            eventDrop: function(info) {
                updateTaskTime(info.event);
            },
            
            eventResize: function(info) {
                updateTaskTime(info.event);
            },

            // Estructura y contenidos de cada tarea
            eventContent: function(arg) {
                let container = document.createElement('div');

                // Horario
                let timeEl = document.createElement('div');
                timeEl.textContent = arg.timeText; // muestra "08:30 – 09:30"
                timeEl.classList.add('text-xs', 'text-gray-300');
                container.appendChild(timeEl);

                // Título
                let titleEl = document.createElement('div');
                titleEl.textContent = arg.event.title;
                titleEl.classList.add('font-semibold', 'text-sm');
                container.appendChild(titleEl);

                // Descripción
                if (arg.event.extendedProps.description) {
                    let descEl = document.createElement('div');
                    descEl.textContent = arg.event.extendedProps.description;
                    descEl.classList.add('text-xs', 'text-gray-200');
                    container.appendChild(descEl);
                }

                return { domNodes: [container] };
            }
        });

        calendar.render();
        loadTasksUser(calendar, userId);
    };

    // Cargar tareas en el calendario
    const loadTasksUser = async (calendar, userId) => {
        try {
            const response = await fetch('/data/tasks/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    user_id: userId
                })
            });

            const tasks = await response.json();
            
            // Limpiar eventos existentes
            calendar.getEvents().forEach(event => event.remove());
            
            // Añadir cada tarea al calendario
            tasks.forEach(task => {
                calendar.addEvent({
                    id: task.id,
                    title: task.title,
                    start: task.start_at,
                    end: task.end_at,
                    color: '#3b82f6',
                    textColor: '#ffffff',
                    extendedProps: {
                        description: task.description,
                        project: task.project?.name,
                        user: task.user?.name
                    }
                });
            });
            
        } catch (error) {
            console.error('Error cargando tareas:', error);
        }
    };

    const updateTaskTime = async (event) => {
        try {
            // Convertir a hora local
            const startLocal = new Date(event.start.getTime() - (event.start.getTimezoneOffset() * 60000));
            const endLocal = new Date(event.end.getTime() - (event.end.getTimezoneOffset() * 60000));

            const response = await fetch("/data/tasks", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    id: event.id,
                    start_at: startLocal.toISOString().replace('T', ' ').substring(0, 19),
                    end_at: endLocal.toISOString().replace('T', ' ').substring(0, 19)
                }),
            });

            if (!response.ok) throw new Error('Error en la respuesta');

            const result = await response.json();
        } catch (e) {
            console.error(e);
        }
    };

    // Logica de arrastrar del calendario
    // Recoger los datos al soltar la tarjeta
    calendarEl.addEventListener("drop", (e) => {
        e.preventDefault();

        const project_id = e.dataTransfer.getData("project_id");
        const title = e.dataTransfer.getData("project_name");
        const user_id = $("#users").val();

        // Establecemos en el formulario los datos recogidos
        taskForm.dataset.project_id = project_id;
        taskForm.dataset.user_id = user_id;
        taskForm.dataset.title = title;

        taskModal.show();
    });

    // Cambiar estilo del cursor al pasar por encima
    calendarEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    });

    // Logica para cerrar el modal
    taskForm.addEventListener("reset", () => {
        taskModal.hide();
    });

    // Guardar tarea
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            project_id: e.target.dataset.project_id,
            user_id: e.target.dataset.user_id,
            title: e.target.dataset.title,
            description: e.target.description.value,
            start_at: e.target.start_at.value,
            end_at: e.target.end_at.value,
        };

        try {
            const response = await fetch("/data/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Error en la respuesta');

            loadTasksUser(calendar, $("#users").val());

            taskModal.hide();
            taskForm.reset();

            window.Toast?.fire({
                icon: "success",
                title: "Tarea creada correctamente",
            });
        } catch (e) {
            console.error(e);
            window.Toast?.fire({
                icon: "error",
                title: "Error al crear tarea",
            });
        }
    });
}
