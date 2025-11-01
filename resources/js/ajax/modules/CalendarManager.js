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
    $.ajax({
        url: "/data/users",
        method: "GET",
        dataType: "json",
        success: function(data) {
            data.forEach((user) => {
                $("#users").append(new Option(user.name, user.id));
            });
            // Seleccionar usuario actual
            $("#users").val(currentUserId).trigger("change");

            renderCalendar(currentUserId);
        },
        error: function() {
            window.Toast.fire({icon: "error", title: "Error cargando usuarios"});
        }
    });

    // Cuando cambiamos el usuario cargamos su calendario
    $("#users").on('change', function() {
        const userId = $(this).val();        
        renderCalendar(userId);
    });

    // Renderizar el calendario
    const renderCalendar = (userId) => {
        calendarEl.innerHTML = "";
        calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            themeSystem: "bootstrap5",
            locale: "esLocale",
            initialView: "timeGridDay",

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
                timeEl.textContent = arg.timeText;
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
    const loadTasksUser = (calendar, userId) => {
        $.ajax({
            url: '/data/tasks/user',
            method: 'POST',
            data: {
                user_id: userId
            },
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(tasks) {
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
                            user_id: userId,
                            description: task.description,
                            project: task.project?.name,
                            user: task.user?.name
                        }
                    });
                });
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error al cargar tareas"});
            }
        });
    };

    const updateTaskTime = (event) => {
        // Convertir a hora local
        const startLocal = new Date(event.start.getTime() - (event.start.getTimezoneOffset() * 60000));
        const endLocal = new Date(event.end.getTime() - (event.end.getTimezoneOffset() * 60000));

        $.ajax({
            url: "/data/tasks",
            method: "PUT",
            data: {
                id: event.id,
                start_at: startLocal.toISOString().replace('T', ' ').substring(0, 19),
                end_at: endLocal.toISOString().replace('T', ' ').substring(0, 19)
            },
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function() {
                // Refrescamos el calendario
                // renderCalendar(event.extendedProps.user_id);
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error al editar tarea"});
            }
        });
    };

    // Logica de arrastrar del calendario
    // Recoger los datos al soltar la tarjeta
    $(calendarEl).on("drop", function(e) {
        e.preventDefault();

        const project_id = e.originalEvent.dataTransfer.getData("project_id");
        const title = e.originalEvent.dataTransfer.getData("project_name");
        const user_id = $("#users").val();

        // Establecemos en el formulario los datos recogidos
        $(taskForm).data("project_id", project_id);
        $(taskForm).data("user_id", user_id);
        $(taskForm).data("title", title);

        taskModal.show();
    });

    // Cambiar estilo del cursor al pasar por encima
    $(calendarEl).on("dragover", function(e) {
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = "move";
    });

    // Logica para cerrar el modal
    $(taskForm).on("reset", function() {
        taskModal.hide();
    });

    // Guardar tarea
    $(taskForm).on("submit", function(event) {
        event.preventDefault();

        const data = {
            project_id: $(this).data("project_id"),
            user_id: $(this).data("user_id"),
            title: $(this).data("title"),
            description: $(this).find("#description").val(),
            start_at: $(this).find("#start_at").val(),
            end_at: $(this).find("#end_at").val(),
        };

        $.ajax({
            url: "/data/tasks",
            method: "POST",
            data: data,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function() {
                loadTasksUser(calendar, $("#users").val());

                taskModal.hide();
                taskForm.reset();

                window.Toast.fire({icon: "success", title: "Tarea creada correctamente"});
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error al crear tarea"});
            }
        });
    });
}