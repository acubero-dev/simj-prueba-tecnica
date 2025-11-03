# Prueba Técnica – Soluciones Informáticas MJ

Este proyecto ha sido desarrollado como prueba técnica para la empresa Soluciones Informáticas MJ (SIMJ).

El objetivo es desarrollar una aplicación web con el framework `Laravel` utilizando la plantilla `AdminLTE 3`, que implemente autenticación, gestión de usuarios, proyectos y tareas mediante un calendario, además de generar informes en formato PDF.

---

## Tecnologías utilizadas

-   **Frontend:** Jquery 3.7.1 / Ajax
-   **Backend:** Laravel 12.35.1 (PHP 8.2.12)
-   **Base de datos:** MariaDB 10.4.32
-   **Vistas:** Blade + Bootstrap 4.6.2 + AdminLTE 3.2.0
-   **Generación de PDF:** jsPDF 3.0.3 + jspdf-autotable 5.0.2
-   **Autenticación:** Laravel Breeze 2.3
-   **Gestión de tareas:** FullCalendar 6.1.19
-   **Control de roles:** Middleware personalizado (Administrador / Usuario)

---

## Instalación y configuración

### 1. Requisitos previos

Antes de comenzar, asegúrate de tener las siguientes dependencias instaladas en tu sistema:

-   **Git:** Para clonar el proyecto
-   **PHP >= 8.2:** Para ejecutar Laravel
-   **Composer >= 2.8.12:** Gestor de dependencias de PHP
-   **Node.js >= 25.0.0 y NPM >= 11.6.2:** Para instalar y compilar los archivos del frontend
-   **Servidor de base de datos:** MySQL o MariaDB

### 2. Pasos de instalación

1.  Clonar el repositorio:

    ```bash
    git clone https://github.com/acubero-dev/simj-prueba-tecnica.git
    cd simj-prueba-tecnica
    ```

2.  Instalar dependencias de la aplicación:

    ```bash
    composer install && npm install
    ```

3.  Copiar el archivo de entorno `.env.example` como `.env` y configurarlo:

    ```bash
    cp .env.example .env
    ```

    Editar los valores de `.env` **(pueden variar según tu entorno)**:

    ```env
    APP_NAME=SIMJ
    APP_DEBUG=true
    APP_URL=http://localhost

    APP_LOCALE=es
    APP_FALLBACK_LOCALE=es
    APP_FAKER_LOCALE=es_ES

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=simj_prueba
    DB_USERNAME=db_user
    DB_PASSWORD=db_password
    ```

4.  Generar la clave de la aplicación:

    ```bash
    php artisan key:generate
    ```

5.  Ejecutar las migraciones y seeders :
    Antes de ejecutarlo, asegúrate de que la base de datos indicada en el archivo `.env` ya exista y esté limpia. **CUIDADO: Esto borrará el contenido previo de la base de datos**.

    ```bash
    php artisan migrate:fresh --seed
    ```

6.  Iniciar el servidor local:
    Primero ejecuta el servidor de Laravel con:

    ```bash
    php artisan serve
    ```

    En otra terminal, ejecuta para cargar los scripts del frontend:

    ```bash
    npm run dev
    ```

    Esto iniciará la aplicación en http://localhost:8000

---

## Partes y funcionalidad

### Autenticación

La aplicación utiliza el sistema por defecto de Laravel `Breeze` para iniciar y cerrar sesión.  
Cada usuario cuenta con un atributo booleano que define su rol, dando lugar a los siguientes tipos:

-   **Administrador:** Tiene acceso a todas las partes y funcionalidades
-   **Usuario estándar:** No tiene acceso a la gestión de usuarios y no puede editar ni eliminar tareas.

Se incluyen dos usuarios de ejemplo para realizar pruebas:

-   **Admin:**

    -   Correo: admin@example.com
    -   Contraseña: admin

-   **User:**
    -   Correo: user@example.com
    -   Contraseña: user

### Inicio

-   Muestra accesos directos a las principales secciones de la aplicación.
-   Según el rol del usuario, se mostrará únicamente **Gestión de proyectos** o todas las secciones disponibles.

### Gestión de usuarios

-   Listado de usuarios implementado con `DataTables` con paginación y búsqueda.
-   Creación, edición y eliminación mediante modales y peticiones `Ajax`.
-   Acceso restringido exclusivamente a administradores.

### Gestión de proyectos

Esta página cuenta con las siguientes partes:

#### 1. Proyectos

-   Listado de proyectos en forma de tarjetas, ordenadas según la última tarea registrada.
-   Creación, edición y eliminación mediante modales y peticiones `Ajax`.
-   Los usuarios no administradores solo pueden crear proyectos.
-   Incluye un botón para generar informes PDF. **(Más detalles a continuación)**

#### 2. Calendario de tareas

-   Implementado con `FullCalendar`.
-   Permite seleccionar el usuario con un `select2` del cual cargar sus tareas en el calendario mediante `Ajax`.
-   Los proyectos pueden arrastrarse al calendario para crear tareas en el día y hora donde se suelten.
-   Cada tarea se guarda asociada a un proyecto y a un usuario.
-   Las tareas pueden moverse o redimensionarse en el calendario para para ajustar su hora de inicio y fin.

### Informe PDF de tareas

-   Generado con `jsPDF` y `jspdf-autotable`.
-   Permite aplicar filtros por:
    -   Proyecto (específico o cualquiera)
    -   Usuario
    -   Fecha desde / hasta
-   Muestra las tareas agrupadas por proyecto, incluyendo:
    -   Duración de cada tarea
    -   Total de tiempo invertido por proyecto
-   Descarga directa del informe.
-   Nombre del fichero: `informe-USUARIO-FECHAINFORME.pdf`

---

## Estructura del proyecto

El proyecto mantiene la estructura típica de Laravel, organizada de la siguiente forma:

-   **app/**

    -   **Http/Controllers/** - Lógica del backend.
    -   **Models/** - Modelos de base de datos (`User`, `Project`, `Task`).
    -   **Middleware/** - Control de roles para las rutas (Administrador / Usuario).

-   **database/**

    -   **factories/** – Generadores de datos de prueba.
    -   **migrations/** Tablas de usuarios, proyectos y tareas.
    -   **seeders/** - Datos iniciales (usuario administrador de ejemplo).

-   **public/**

    -   **img/** - Logos de la aplicación.
    -   **datatables/** - Traducción al español para la librería DataTables.

-   **resources/**

    -   **css/** - Estilos personalizados.
    -   **js/ajax/** - Scripts personalizados (Ajax, FullCalendar, generación PDF).
    -   **views/** - Páginas de la aplicación.
        -   **auth/** - Login y registro (Breeze).
        -   **layouts/** - Plantilla base con AdminLTE y plantilla de login.
        -   **errors/:** - Vistas de errores personalizados.
        -   **partials/** - Elementos del layout (header, footer y aside).

-   **routes/**

    -   **web.php** - Rutas principales de la aplicación (proyectos, tareas, usuarios y PDF).
    -   **auth.php** - Rutas para la autenticación.

-   **.env** - Configuración del entorno (base de datos, app, etc).
-   **composer.json** / **package.json** - Dependencias de PHP y JavaScript.

---

## Manual de uso

1. Inicia la aplicación desde la raíz del proyecto:
Ejecuta los siguientes comandos en **dos terminales separadas** (o en segundo plano uno de ellos):
    ```bash
    # Terminal 1 – Servidor PHP
    php artisan serve
    ```

    ```bash
    # Terminal 2 – Compilación de assets
    npm run dev
    ```

2. Inicia sesión con una de las cuentas disponibles **(ver sección de autenticación)**.

3. Si accedes como **Administrador**:
    - Puedes entrar en **Gestión de usuarios** para crear, editar o eliminar usuarios.
    - En **Control de proyectos**, puedes crear, modificar o eliminar proyectos o crear y modificar tareas.

4. Si accedes como **Usuario estándar**:
    - Solo tienes acceso a **Control de proyectos**.
    - Puedes ver los proyectos **(pero no editarlos)** y tareas de todos los usuarios.
    - Puedes crear proyectos propios y asignar tareas a otros usuarios.

5. En **Control de proyectos**:
    - El **calendario** muestra las tareas según el usuario seleccionado (parte superior).
    - Arrastra un proyecto sobre una hora para crear una tarea.
    - Completa los datos y guarda.
    - Usa el botón **“Generar PDF”** (junto al de crear proyecto) para descargar un informe de tareas. Antes de generar el informe, selecciona los filtros deseados (**usuario**, **rango de fechas** y **proyecto**, si lo deseas).

---

## Base de datos

Relaciones principales:

-   **Usuario (1:N) Proyectos**
-   **Usuario (1:N) Tareas**
-   **Proyecto (1:N) Tareas**

Tablas:

-   `users`: id, name, email, password, is_admin
-   `projects`: id, name, user_id
-   `tasks`: id, project_id, user_id, description, start_at, end_at

---

## Entorno de desarrollo

-   **Sistema operativo:** Windows 11
-   **Servidor de desarrollo:** Laravel Artisan (`php artisan serve`)
-   **Entorno local:** XAMPP (solo para MariaDB)
-   **Base de datos:** MariaDB 10.4.32
-   **Editor:** Visual Studio Code
-   **PHP:** 8.2.12
-   **Node.js:** 25.0.0 (ejecutando `npm run dev` para los recursos frontend)

---

## Mejoras futuras

-   Integrar sistema de correo electrónico para notificaciones.
-   Implementar la edición completa y eliminación de tareas (incluida la descripción).
-   Migrar vistas a `Vue 3`.

---

## Autor

**Ángel Cubero Olivares**  
Desarrollador Web Junior