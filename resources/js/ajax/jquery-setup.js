/**
 * jquery-setup.js
 * - Exponer jQuery globalmente y configurar X-CSRF-TOKEN si existe la meta tag.
 * - Importar este archivo primero en app.js.
 */

import jQuery from 'jquery';

window.$ = window.jQuery = jQuery;

// Configurar CSRF para todas las llamadas AJAX si la meta existe
const csrfMeta = document.querySelector('meta[name="csrf-token"]');

if (csrfMeta && (csrfMeta.getAttribute || csrfMeta.content)) {
  const token = csrfMeta.getAttribute ? csrfMeta.getAttribute('content') : csrfMeta.content;
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': token
    }
  });
} else {
  // No romper la app si falta la meta; avisar en consola para depuración.
  // Esto evita el error "Cannot read properties of null (reading 'getAttribute')".
  // Si ves este warning, añade <meta name="csrf-token" content="{{ csrf_token() }}"> en tu layout.
  console.warn('CSRF meta tag no encontrada: añade <meta name="csrf-token" content=\"{{ csrf_token() }}\"> en el <head> de tu layout.');
}

export default jQuery;