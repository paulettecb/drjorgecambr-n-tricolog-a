/*
 * Página de producto Jauiri: revelado suave al hacer scroll y
 * barra de compra fija en móvil (aparece al pasar el hero y se
 * oculta al llegar a la sección de compra).
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.jv-reveal');

  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('jv-reveal--on'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('jv-reveal--on'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  var bar = document.querySelector('.jv-sticky');
  var hero = document.querySelector('.jv-hero');
  var buy = document.getElementById('comprar');
  if (!bar || !hero || !buy || !('IntersectionObserver' in window)) return;

  var pastHero = false;
  var atBuy = false;
  var atScene = false;
  var scene = document.getElementById('jvx-escena');
  if (scene) new IntersectionObserver(function (e) { atScene = e[0].isIntersecting; update(); }).observe(scene);
  function update() {
    var on = pastHero && !atBuy && !atScene;
    bar.classList.toggle('jv-sticky--on', on);
    bar.setAttribute('aria-hidden', on ? 'false' : 'true');
    var link = bar.querySelector('a');
    if (link) link.tabIndex = on ? 0 : -1;
  }
  new IntersectionObserver(function (e) { pastHero = !e[0].isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(function (e) { atBuy = e[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(buy);
})();
