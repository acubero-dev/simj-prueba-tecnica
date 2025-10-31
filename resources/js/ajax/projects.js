import { ProjectsManager } from "./modules/ProjectsManager";
import { PdfManager } from "./modules/PdfManager";
import { CalendarManager } from "./modules/CalendarManager";

document.addEventListener("DOMContentLoaded", () => {
    // Comportamiento del bloque de proyectos
    ProjectsManager();
    PdfManager();

    // Comportamiento del bloque del calendario
    CalendarManager();
});