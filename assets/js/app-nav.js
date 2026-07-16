/*
 * Modo app para móvil (≤768px): agrupa las secciones de la landing en
 * "pantallas" navegables desde la barra inferior tipo app, con
 * transiciones direccionales. En escritorio no interviene: la página
 * vuelve a su flujo normal de scroll.
 */
(function () {
  'use strict';

  var BP = window.matchMedia('(max-width: 768px)');

  var SCREENS = [
    { id: 'inicio', els: ['.lp-hero-wrap'] },
    { id: 'metodo', els: ['#metodo', '#tratamientos'] },
    { id: 'resultados', els: ['#resultados', '#testimonios'] },
    { id: 'doctor', els: ['#doctor', '#ubicaciones'] },
    { id: 'agenda', els: ['#faq', '#agenda', '.lp-footer'] }
  ];

  // sección (id de ancla) → pantalla que la contiene
  var SECTION_TO_SCREEN = {
    metodo: 'metodo',
    tratamientos: 'metodo',
    resultados: 'resultados',
    testimonios: 'resultados',
    doctor: 'doctor',
    ubicaciones: 'doctor',
    faq: 'agenda',
    agenda: 'agenda'
  };

  var nav = document.querySelector('.lp-appnav');
  var appbar = document.querySelector('.lp-appbar');
  if (!nav) return;
  var tabs = Array.prototype.slice.call(nav.querySelectorAll('.lp-appnav-tab'));
  var order = SCREENS.map(function (s) { return s.id; });
  var current = 'inicio';

  function elsOf(screen) {
    return screen.els.reduce(function (acc, sel) {
      return acc.concat(Array.prototype.slice.call(document.querySelectorAll(sel)));
    }, []);
  }

  function apply(screenId, dir) {
    SCREENS.forEach(function (s) {
      var show = s.id === screenId;
      elsOf(s).forEach(function (el) {
        el.classList.remove('app-screen-enter', 'app-screen-enter-back');
        el.classList.toggle('app-screen-hidden', !show);
        if (show && dir) {
          void el.offsetWidth; // reinicia la animación
          el.classList.add(dir > 0 ? 'app-screen-enter' : 'app-screen-enter-back');
        }
      });
    });
    tabs.forEach(function (t) {
      var active = t.dataset.screen === screenId;
      t.classList.toggle('active', active);
      if (active) { t.setAttribute('aria-current', 'page'); } else { t.removeAttribute('aria-current'); }
    });
    if (appbar) appbar.classList.toggle('lp-appbar--visible', screenId !== 'inicio');
    document.body.classList.toggle('app-on-inicio', screenId === 'inicio');
    current = screenId;
  }

  function go(screenId, animate) {
    if (!document.body.classList.contains('app-mode')) return;
    var dir = 0;
    if (animate !== false) {
      dir = order.indexOf(screenId) >= order.indexOf(current) ? 1 : -1;
    }
    apply(screenId, dir);
    window.scrollTo(0, 0);
  }

  function enterAppMode() {
    document.body.classList.add('app-mode');
    var hash = location.hash.replace('#', '');
    apply(SECTION_TO_SCREEN[hash] || 'inicio', 0);
    if (hash && SECTION_TO_SCREEN[hash]) window.scrollTo(0, 0);
  }

  function exitAppMode() {
    document.body.classList.remove('app-mode', 'app-on-inicio');
    if (appbar) appbar.classList.remove('lp-appbar--visible');
    SCREENS.forEach(function (s) {
      elsOf(s).forEach(function (el) {
        el.classList.remove('app-screen-hidden', 'app-screen-enter', 'app-screen-enter-back');
      });
    });
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { go(t.dataset.screen); });
  });
  if (appbar) appbar.addEventListener('click', function () { go('inicio'); });

  // En modo app, las anclas internas cambian de pantalla en vez de hacer scroll.
  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('app-mode')) return;
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    e.preventDefault();
    if (!id) { go('inicio'); return; }
    var screen = SECTION_TO_SCREEN[id];
    if (!screen) return;
    go(screen);
    var target = document.getElementById(id);
    if (target) {
      requestAnimationFrame(function () {
        var y = target.getBoundingClientRect().top + window.scrollY - 64;
        if (y > 32) window.scrollTo(0, y);
      });
    }
  });

  function sync() { if (BP.matches) { enterAppMode(); } else { exitAppMode(); } }
  if (BP.addEventListener) { BP.addEventListener('change', sync); }
  else if (BP.addListener) { BP.addListener(sync); }
  sync();
})();
