import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ProjectsManager } from "./ProjectsManager";

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

            drop: function(info) {
                // info.date tiene la fecha/hora exacta donde soltaste
                const dropDate = info.date;
                const project_id = info.draggedEl.dataset.projectId;
                const title = info.draggedEl.dataset.projectName;
                
                console.log('Fecha donde soltaste:', dropDate);
                console.log('Project ID:', project_id);
                
                // Hacer lo que necesites con estos datos
                $(taskForm).data("project_id", project_id);
                $(taskForm).data("start_date", dropDate);
                taskModal.show();
            },

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

    // Logica de arrastrar al calendario
    // Cambiar estilo del cursor al pasar por encima
    $(calendarEl).on("dragover", function(e) {
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = "move";
    });

    // Cerrar el modal de tareas
    $(taskForm).on("reset", function() {
        taskModal.hide();
    });

    // Recoger los datos al soltar la tarjeta
    $(calendarEl).on("drop", function(e) {
        e.preventDefault();

        const project_id = e.originalEvent.dataTransfer.getData("project_id");
        const title = e.originalEvent.dataTransfer.getData("project_name");
        const user_id = $("#users").val();

        // Obtener fecha y hora del punto donde se soltó
        const dropInfo = getDateTimeFromCalendar(e.originalEvent);

        // Establecemos en el formulario los datos recogidos
        $(taskForm).data("project_id", project_id);
        $(taskForm).data("user_id", user_id);
        $(taskForm).data("title", title);

        // Prellenar el formulario con fecha y hora
        $(taskForm).find("#task_date").val(dropInfo.date);
        $(taskForm).find("#start_time").val(dropInfo.time);

        // Calcular hora de fin (1 hora después)
        const [hours, minutes] = dropInfo.time.split(':').map(Number);
        const endHour = (hours + 1) % 24;
        const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        $(taskForm).find("#end_time").val(endTime);

        taskModal.show();
    });

    // Función para obtener fecha y hora usando la API de FullCalendar
    const getDateTimeFromCalendar = (event) => {
        try {
            // Obtener el elemento de tiempo más cercano al cursor
            const timeSlot = document.elementFromPoint(event.clientX, event.clientY);
            const slotEl = timeSlot.closest(".fc-timegrid-slot");
            
            if (!slotEl) { throw new Error("Slot no encontrado"); }

            // Obtener la hora del slot
            const timeAttr = slotEl.getAttribute("data-time");
            const time = timeAttr.substring(0, 5); // Formato HH:mm
            
            // Obtener la fecha actual del calendario
            const currentDate = calendar.getDate();
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const day = currentDate.getDate().toString().padStart(2, '0');
            const date = `${year}-${month}-${day}`;
            
            return { date, time };
        } catch (error) {
            window.Toast.fire({icon: "error", title: error.message});
        }
    };

    // Guardar tarea
    $(taskForm).on("submit", function(event) {
        event.preventDefault();

        const taskDate = $(this).find("#task_date").val();
        const startTime = $(this).find("#start_time").val();
        const endTime = $(this).find("#end_time").val();

        // Validar que la hora de fin sea posterior a la de inicio
        if (startTime >= endTime) {
            window.Toast?.fire({
                icon: "error",
                title: "La hora de fin debe ser posterior a la de inicio"
            });
            return;
        }

        // Validar que no sea fin de semana
        const dateObj = new Date(taskDate);
        const day = dateObj.getDay();
        if (day === 0 || day === 6) {
            window.Toast?.fire({
                icon: "error",
                title: "No se pueden crear tareas los fines de semana"
            });
            return;
        }

        // Construir fecha para MySQL
        const start_at = `${taskDate} ${startTime}:00`;
        const end_at = `${taskDate} ${endTime}:00`;

        const data = {
            project_id: $(this).data("project_id"),
            user_id: $(this).data("user_id"),
            title: $(this).data("title"),
            description: $(this).find("#description").val(),
            start_at: start_at,
            end_at: end_at
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

                ProjectsManager();

                window.Toast.fire({icon: "success", title: "Tarea creada correctamente"});
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error al crear tarea"});
            }
        });
    });
}