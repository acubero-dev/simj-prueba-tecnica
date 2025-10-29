import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

document.addEventListener("DOMContentLoaded", function () {
    const projectsContainer = document.getElementById("projects");
    const calendarEl = document.getElementById("calendar");

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

            projects.forEach(project => {
                const div = document.createElement("div");
                div.className =
                    "flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 shadow-sm transition";

                div.innerHTML = `
                    <div>
                        <h6 class="font-medium text-gray-800">${project.name}</h6>
                        <p class="text-sm text-gray-500">Creado por <span class="font-medium text-gray-700">${project.user?.name || 'Desconocido'}</span></p>
                    </div>
                    <p class="text-sm text-gray-400 mt-2 sm:mt-0">${new Date(project.created_at).toLocaleDateString()}</p>
                `;

                projectsContainer.appendChild(div);
            });

            renderCalendar(projects);
        } catch (err) {
            console.error("Error cargando proyectos:", err);
        }
    };

    // Renderizar el calendario
    const renderCalendar = (projects) => {
        const calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            initialView: "timeGridDay",
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
            },
            selectable: true,
            editable: false,
            events: projects.map(p => ({
                title: p.name,
                start: p.created_at,
                color: "#3b82f6",
            })),
        });

        calendar.render();
    };

    fetchProjects();
});
