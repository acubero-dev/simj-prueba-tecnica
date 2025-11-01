import jsPDF from "jspdf";

export function PdfManager() {
    const btnGeneratePdf = $("#btn-generate-pdf");
    const pdfModalElement = $("#modal-generate-pdf");
    const pdfModal = new bootstrap.Modal(pdfModalElement[0]);
    const pdfForm = $("#form-generate-pdf");

    // Select2 de usuarios
    $("#user").select2({
        width: "100%",
    });

    // Select2 de proyectos
    $("#project").select2({
        width: "100%",
    });

    // Cargar usuarios
    const userSelec2 = () => {
        $.ajax({
            url: "/data/users",
            method: "GET",
            dataType: "json",
            success: function(data) {
                $("#user").empty();
                data.forEach((user) => {
                    $("#user").append(new Option(user.name, user.id));
                });
                $("#user").val(currentUserId).trigger("change");
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error cargando usuarios"});
            }
        });
    };

    // Cargar proyectos
    const projectSelec2 = () => {
        $.ajax({
            url: "/data/projects",
            method: "GET",
            dataType: "json",
            success: function(data) {
                $("#project").empty();
                $("#project").append(new Option("Todos los proyectos", "all", true));
                data.forEach((project) => {
                    $("#project").append(new Option(project.name, project.id));
                });
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error cargando proyectos"});
            }
        });
    };

    // Abrir modal
    btnGeneratePdf.on("click", function() {
        pdfForm[0].reset();
        userSelec2();
        projectSelec2();
        pdfModal.show();
    });

    // Cerrar modal
    pdfForm.on("reset", function() {
        userSelec2();
        projectSelec2();
        pdfModal.hide();
    });

    // PDF con tabla de proyectos
    pdfForm.on("submit", function(e) {
        e.preventDefault();

        // Validación manual de fechas
        if (!$(this).find("#start_at").val() || !$(this).find("#end_at").val()) {
            window.Toast.fire({icon: "error", title: "Ambas fechas son obligatorias"});
            return;
        }

        // Validar que fecha hasta sea posterior a fecha desde
        if ($(this).find("#end_at").val() <= $(this).find("#start_at").val()) {
            window.Toast.fire({icon: "error", title: "La fecha hasta debe ser posterior a la fecha desde"});
            return;
        }

        // Recoger valores del formulario
        const filters = {
            user_id: $(this).find("#user").val(),
            project_id: $(this).find("#project").val(),
            start_date: $(this).find("#start_at").val(),
            end_date: $(this).find("#end_at").val()
        };

        $.ajax({
            url: '/data/tasks/pdf',
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: filters,
            dataType: 'json',
            success: function(tasksData) {
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
                if (filters.project_id && filters.project_id !== "all") {
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
                    if (startY > 270) {
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

                window.Toast.fire({icon: "success", title: "PDF generado correctamente"});
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error al generar PDF"});
            }
        });
    });
}