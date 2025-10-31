import jsPDF from "jspdf";

export function PdfManager() {
    const btnGeneratePdf = document.getElementById("btn-generate-pdf");

    const pdfModalElement = document.getElementById("modal-generate-pdf");
    const pdfModal = new bootstrap.Modal(pdfModalElement);
    const pdfForm = document.getElementById("form-generate-pdf");

    // Abrir modal
    btnGeneratePdf.addEventListener("click", () => {
        pdfForm.reset();
        pdfModal.show();
    });

    // Cerrar modal
    pdfForm.addEventListener("reset", () => {
        pdfModal.hide();
    })

    // PDF con tabla de proyectos
    pdfForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const proyectos = [
            {
                name: "ElPana",
                user: {
                    name: "Dios Supremo",
                },
            },
            {
                name: "Lucia Quiere",
                user: {
                    name: "Mucho al Pana",
                },
            },
        ];
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Lista de Proyectos', 10, 10);
        
        let y = 30;
        proyectos.forEach((proyecto, index) => {
            doc.text(`${index + 1}. ${proyecto.name} - ${proyecto.user.name}`, 10, y);
            y += 10;
        });
        
        doc.save('proyectos.pdf');

        pdfModal.hide();
    });
}