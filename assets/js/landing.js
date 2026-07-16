/*
 * Interacciones de la landing: envío del formulario de agenda por WhatsApp
 * (sitio estático, sin backend) y año dinámico en el footer.
 */
(function () {
  'use strict';

  // Un solo lugar para el número de WhatsApp de la clínica.
  const WHATSAPP = '524430000000';

  const waLink = (text) => 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);

  document.querySelectorAll('[data-wa-message]').forEach((a) => {
    a.href = waLink(a.dataset.waMessage);
  });

  const form = document.getElementById('agenda-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = form.elements.nombre.value.trim();
      const telefono = form.elements.telefono.value.trim();
      const msg =
        'Hola Dr. Cambrón, soy ' + nombre + '. ' +
        'Quiero agendar mi valoración capilar. Mi WhatsApp es ' + telefono + '.';
      const url = waLink(msg);
      const opened = window.open(url, '_blank', 'noopener');
      // Navegadores in-app (Instagram/Facebook) y bloqueadores de popups
      // agresivos devuelven null: navegamos la misma pestaña como respaldo.
      if (!opened) window.location.href = url;
    });
  }

  const year = document.getElementById('lp-year');
  if (year) year.textContent = new Date().getFullYear();
})();
