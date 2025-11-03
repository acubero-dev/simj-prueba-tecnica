import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

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

    // Formatear duración
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${Math.round(mins)}m`;
        if (mins === 0) return `${Math.round(hours)}h`;
        return `${Math.round(hours)}h ${Math.round(mins)}m`;
    };

    // PDF con tabla de proyectos
    pdfForm.on("submit", function(e) {
        e.preventDefault();

        // Validar que fecha hasta sea posterior a fecha desde
        if ($(this).find("#end_at").val() <= $(this).find("#start_at").val()) {
            window.Toast.fire({icon: "error", title: "La fecha final debe ser igual o posterior a la fecha de inicio"});
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
                // Verificar si hay tareas
                if (!tasksData.tasks || tasksData.tasks.length === 0) {
                    window.Toast.fire({
                        icon: "warning", 
                        title: "El usuario no tiene tareas en el período seleccionado"
                    });
                    return;
                }

                // Crear PDF
                const doc = new jsPDF();
                const userName = $("#user option:selected").text();
                const projectName = filters.project_id === "all" 
                    ? "Todos los proyectos" 
                    : $("#project option:selected").text();
                
                // Colores
                const primaryColor = [59, 130, 246]; // Azul
                const grayColor = [107, 114, 128];
                const lightGray = [243, 244, 246];
                
                // Encabezado con color
                doc.setFillColor(...primaryColor);
                doc.rect(0, 0, 210, 40, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(24);
                doc.setFont(undefined, 'bold');
                doc.text('Informe de Tareas', 20, 20);
                
                doc.setFontSize(11);
                doc.setFont(undefined, 'normal');
                doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
                
                // Información del informe
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                let yPosition = 50;
                
                doc.setFont(undefined, 'bold');
                doc.text('Usuario:', 20, yPosition);
                doc.setFont(undefined, 'normal');
                doc.text(userName, 50, yPosition);
                
                yPosition += 7;
                doc.setFont(undefined, 'bold');
                doc.text('Proyecto:', 20, yPosition);
                doc.setFont(undefined, 'normal');
                doc.text(projectName, 50, yPosition);
                
                yPosition += 7;
                doc.setFont(undefined, 'bold');
                doc.text('Período:', 20, yPosition);
                doc.setFont(undefined, 'normal');
                doc.text(`${filters.start_date} al ${filters.end_date}`, 50, yPosition);
                
                yPosition += 15;

                // Tabla de tareas usando autoTable
                const tableData = tasksData.tasks.map(task => [
                    task.project,
                    task.description || '-',
                    task.start_at,
                    task.end_at,
                    formatDuration(task.duration)
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Proyecto', 'Descripción', 'Inicio', 'Fin', 'Duración']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: {
                        fillColor: primaryColor,
                        fontSize: 10,
                        fontStyle: 'bold',
                        halign: 'left'
                    },
                    bodyStyles: {
                        fontSize: 9
                    },
                    alternateRowStyles: {
                        fillColor: lightGray
                    },
                    columnStyles: {
                        0: { cellWidth: 35 },
                        1: { cellWidth: 50 },
                        2: { cellWidth: 35 },
                        3: { cellWidth: 35 },
                        4: { cellWidth: 25, halign: 'center' }
                    },
                    margin: { left: 20, right: 20 }
                });

                // Resumen por proyecto
                yPosition = doc.lastAutoTable.finalY + 15;
                
                doc.setFillColor(...lightGray);
                doc.rect(20, yPosition - 5, 170, 10, 'F');
                
                doc.setTextColor(...primaryColor);
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text('Resumen por Proyecto', 25, yPosition + 2);
                
                yPosition += 12;
                
                // Tabla de totales
                const totalsData = Object.entries(tasksData.totals).map(([project, minutes]) => [
                    project,
                    formatDuration(minutes)
                ]);

                autoTable(doc, {
                    startY: yPosition,
                    head: [['Proyecto', 'Tiempo Total']],
                    body: totalsData,
                    theme: 'plain',
                    headStyles: {
                        fillColor: primaryColor,
                        fontSize: 10,
                        fontStyle: 'bold'
                    },
                    bodyStyles: {
                        fontSize: 9
                    },
                    columnStyles: {
                        0: { cellWidth: 120 },
                        1: { cellWidth: 50, halign: 'center', fontStyle: 'bold' }
                    },
                    margin: { left: 20, right: 20 }
                });

                // Calcular tiempo total
                const totalMinutes = Object.values(tasksData.totals).reduce((sum, m) => sum + m, 0);
                
                yPosition = doc.lastAutoTable.finalY + 10;
                
                doc.setFillColor(...primaryColor);
                doc.rect(20, yPosition - 5, 170, 12, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('TIEMPO TOTAL:', 25, yPosition + 3);
                doc.text(formatDuration(totalMinutes), 160, yPosition + 3);

                // Pie de página
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    doc.setTextColor(...grayColor);
                    doc.text(
                        `Página ${i} de ${pageCount}`,
                        doc.internal.pageSize.getWidth() / 2,
                        doc.internal.pageSize.getHeight() - 10,
                        { align: 'center' }
                    );
                }

                // Guardar
                const fileName = `informe-${userName.toLowerCase().replace(/\s+/g, '-')}-${filters.start_date}.pdf`;
                doc.save(fileName);
                pdfModal.hide();

                window.Toast.fire({icon: "success", title: "PDF generado correctamente"});
            },
            error: function() {
                window.Toast.fire({icon: "error", title: "Error al generar PDF"});
            }
        });
    });
}