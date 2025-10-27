<aside class="main-sidebar bg-[#000723] elevation-4 flex flex-col h-screen">
    <!-- Brand Logo -->
    <a href="{{ url('/') }}" class="block w-full text-xl whitespace-nowrap px-2 py-3 transition-width">
        <img src="{{ asset('img/Logotipo-White.png') }}" alt="SIMJ-logo" class="block mx-auto max-h-[33px] w-auto">
    </a>

    <!-- Sidebar -->
    <div class="sidebar flex flex-col flex-1 justify-between">
        <!-- Sidebar Menu -->
        <nav class="mt-2 flex-1">
            <ul class="nav nav-pills nav-sidebar flex-column h-full" data-widget="treeview" role="menu"
                data-accordion="false">
                <li class="nav-item">
                    <a href="{{ url('/inicio') }}" class="nav-link {{ request()->is('inicio') ? 'active' : '' }}">
                        <i class="nav-icon fa fa-home"></i>
                        <p>Inicio</p>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ url('/control') }}" class="nav-link {{ request()->is('control*') ? 'active' : '' }}">
                        <i class="nav-icon fa fa-share-alt"></i>
                        <p>Control de Proyectos</p>
                    </a>
                </li>

                @auth
                    @if (auth()->user()->is_admin)
                        <li class="nav-item">
                            <a href="{{ url('/usuarios') }}" class="nav-link {{ request()->is('usuarios*') ? 'active' : '' }}">
                                <i class="nav-icon fa fa-user"></i>
                                <p>Gestión de Usuarios</p>
                            </a>
                        </li>
                    @endif
                @endauth
            </ul>
        </nav>


        <!-- Logout button al fondo -->
        <nav class="mb-2 ">
            <ul class="nav nav-pills nav-sidebar flex-column h-full" data-widget="treeview" role="menu"
                data-accordion="false">
                <li class="nav-item bg-red-600 hover:bg-red-700 rounded bottom-0">
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="nav-link text-white text-left">
                            <i class="nav-icon fa fa-sign-out-alt inline"></i>
                            <p class="inline text-white">Cerrar sesión</p>
                        </button>
                    </form>
                </li>
            </ul>
        </nav>
    </div>
</aside>