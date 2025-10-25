<!-- partials/navbar.blade.php -->
<nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
        <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
        </li>
        <li class="nav-item d-none d-sm-inline-block">
            <a href="/inicio" class="nav-link"><i class="fa fa-home"></i></a>
        </li>
    </ul>

    <!-- Navbar Right -->
    <ul class="navbar-nav ml-auto">
        <!-- User Avatar y nombre -->
        <li class="nav-item d-flex align-items-center">
            @php
                $name = Auth::user()->name;
                $words = explode(' ', $name);
                $initials = '';
                foreach ($words as $word) {
                    $initials .= mb_substr($word, 0, 1, 'UTF-8');
                }
                $initials = mb_strtoupper($initials, 'UTF-8');
            @endphp

            <div class="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-2"
                style="width:32px; height:32px; font-weight:bold;">
                {{ $initials }}
            </div>
            <span>{{ $name }}</span>
        </li>
    </ul>
</nav>