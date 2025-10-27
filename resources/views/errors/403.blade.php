<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>403 — Acceso Denegado</title>
        @vite(['resources/css/app.css']) <!-- Si usas Vite/Tailwind -->
    </head>

    <body class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="row justify-content-center">
                <div class="card card-outline card-danger">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-shield-alt text-danger mr-2"></i>
                            Permisos insuficientes
                        </h3>
                    </div>

                    <div class="card-body text-center">
                        <div class="error-page">
                            <h2 class="headline text-danger">403</h2>

                            <div class="error-content">
                                <h3><i class="fas fa-lock text-danger"></i> Acceso restringido</h3>
                                <p class="mb-3">
                                    No tienes permisos para ver esta sección. Esto puede ocurrir si intentas acceder a una
                                    zona
                                    restringida o si tu sesión no tiene los privilegios necesarios.
                                </p>

                                <div class="mb-3">
                                    <a href="{{ route('inicio') }}" class="btn btn-primary btn-lg mr-2">
                                        <i class="fas fa-home mr-1"></i> Volver al inicio
                                    </a>
                                </div>

                                <p class="text-muted small mb-0">
                                    Consejo: Si eres administrador, revisa la configuración de roles o la documentación
                                    interna.
                                </p>

                                <p class="text-muted small mt-3 mb-0">
                                    Código: <strong>403</strong> • Hora: <time
                                        datetime="{{ now()->toISOString() }}">{{ now()->format('Y-m-d H:i:s') }} UTC</time>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="card-footer text-center text-muted small">
                        © {{ date('Y') }} {{ config('app.name', 'Tu App') }} — Todos los derechos reservados.
                    </div>
            </div>
        </div>
    </body>
</html>