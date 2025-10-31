import jsPDF from "jspdf";

export function PdfManager() {
    const btnGeneratePdf = document.getElementById("btn-generate-pdf");

    const pdfModalElement = document.getElementById("modal-generate-pdf");
    const pdfModal = new bootstrap.Modal(pdfModalElement);
    const pdfForm = document.getElementById("form-generate-pdf");

    // Select2 de usuarios
    $("#user").select2({
        width: "100%",
    });


    // Cargar usuarios, seleccionar el actual y renderizar su calendario
    const userSelec2 = async () => {
        fetch("/data/users")
            .then((res) => res.json())
            .then((data) => {
                $("#user").empty();

                data.data.forEach((user) => {
                    $("#user").append(new Option(user.name, user.id));
                });

                // Seleccionar usuario actual
                $("#user").val(currentUserId).trigger("change");
            });
    };

    // Select2 de proyectos
    $("#project").select2({
        width: "100%",
    });

    // Cargar usuarios, seleccionar el actual y renderizar su calendario
    const projectSelec2 = async () => {
    fetch("/data/projects")
        .then((res) => res.json())
        .then((data) => {
            $("#project").empty();

            $("#project").append(new Option("Todos los proyectos", "all", true));
            
            data.forEach((project) => {
                $("#project").append(new Option(project.name, project.id));
            });
        });
    }


    // Abrir modal
    btnGeneratePdf.addEventListener("click", () => {
        pdfForm.reset();
        userSelec2();
        projectSelec2();
        pdfModal.show();
    });

    // Cerrar modal
    pdfForm.addEventListener("reset", () => {
        userSelec2();
        projectSelec2();
        pdfModal.hide();
    })

   
    // PDF con tabla de proyectos
    pdfForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validación manual de fechas
        if (!e.target.start_at.value || !e.target.end_at.value) {
            window.Toast?.fire({
                icon: "error",
                title: "Ambas fechas son obligatorias",
            });
            return;
        }

        // Validar que fecha hasta sea posterior a fecha desde
        if (e.target.end_at.value <= e.target.start_at.value) {
            window.Toast?.fire({
                icon: "error", 
                title: "La fecha hasta debe ser posterior a la fecha desde",
            });
            return;
        }

        // Recoger valores del formulario
        const filters = {
            user_id: $("#user").val(),
            project_id: $("#project").val(),
            start_date: e.target.start_at.value,
            end_date: e.target.end_at.value
        };

        try {
            // Obtener datos filtrados del backend
            const response = await fetch('/data/tasks/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(filters)
            });

            const tasksData = await response.json();

            // Crear PDF
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(20);
            doc.text('Informe de Tareas', 20, 20);
            
            // Filtros aplicados
            doc.setFontSize(10);
            let yPosition = 35;
            
            if (filters.start_date) {
                doc.text(`Desde: ${filters.start_date}`, 20, yPosition);
                yPosition += 7;
            }
            if (filters.end_date) {
                doc.text(`Hasta: ${filters.end_date}`, 20, yPosition);
                yPosition += 7;
            }
            if (filters.project_id) {
                const projectName = $("#project option:selected").text();
                doc.text(`Proyecto: ${projectName}`, 20, yPosition);
                yPosition += 7;
            }
            
            doc.text(`Usuario: ${$("#user option:selected").text()}`, 20, yPosition);
            yPosition += 15;

            // Tabla de tareas
            doc.setFontSize(12);
            doc.text('Tareas:', 20, yPosition);
            yPosition += 10;

            let startY = yPosition;
            tasksData.tasks.forEach((task, index) => {
                if (startY > 270) { // Nueva página si se llena
                    doc.addPage();
                    startY = 20;
                }
                
                doc.setFontSize(10);
                doc.text(`${task.project} - ${task.description}`, 20, startY);
                doc.text(`${task.start_at} a ${task.end_at} (${task.duration} min)`, 20, startY + 5);
                
                startY += 12;
            });

            // Totales por proyecto
            startY += 10;
            doc.setFontSize(12);
            doc.text('Resumen por proyecto:', 20, startY);
            startY += 10;

            Object.entries(tasksData.totals).forEach(([projectName, totalMinutes]) => {
                if (startY > 270) {
                    doc.addPage();
                    startY = 20;
                }
                
                doc.setFontSize(10);
                doc.text(`${projectName}: ${totalMinutes} minutos`, 20, startY);
                startY += 7;
            });

            // Guardar
            doc.save(`informe-tareas-${new Date().toISOString().split('T')[0]}.pdf`);
            pdfModal.hide();

            window.Toast?.fire({
                icon: "success",
                title: "PDF generado correctamente",
            });

        } catch (error) {
            console.error('Error generando PDF:', error);
            window.Toast?.fire({
                icon: "error",
                title: "Error al generar PDF",
            });
        }
    });

}