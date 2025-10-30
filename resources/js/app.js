// Bootstrap & AdminLTE
import * as bootstrap from 'bootstrap';
import 'admin-lte';

window.bootstrap = bootstrap;

// JQuery y configuración AJAX
import './ajax/jquery-setup';

// select2
import select2 from "select2";
select2($);

// SweetAlert2 para notificaciones
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

window.Swal = Swal;
window.Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
});


// // Alpine.js
// import Alpine from 'alpinejs';
// window.Alpine = Alpine;
// Alpine.start();