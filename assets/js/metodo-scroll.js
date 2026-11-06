/*
 * Método · escena con scroll.
 * 0.00–0.16  Intro: "Tratamos la causa de raíz." (sube y se va)
 * 0.16–0.37  Paso 1: el cabello con su raíz entra girando
 * 0.37–0.58  Paso 2: la tricoscopia se abre como lente
 * 0.58–0.79  Paso 3: laboratorios suben
 * 0.79–1.00  Paso 4: cortina antes → después
 * Sin soporte o con "reducir movimiento" queda como lista estática.
 */
(function () {
  'use strict';
  var root = document.querySelector('[data-raiz]');
  if (!root) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { root.classList.add('lp-raiz--static'); return; }

  var stage = root.querySelector('.lp-raiz__stage');
  var bg = root.querySelector('.lp-raiz__bg img');
  var intro = root.querySelector('.lp-raiz__intro');
  var v = [1, 2, 3, 4].map(function (i) { return root.querySelector('.lp-raiz__v--' + i); });
  var steps = Array.prototype.slice.call(root.querySelectorAll('.lp-raiz__step'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.lp-raiz__dots span'));

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(p, a, b) { return clamp((p - a) / (b - a)); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function set(el, k, val) { el.style.setProperty(k, val); }

  var A = [0.16, 0.37, 0.58, 0.79, 1.0];

  function render(p) {
    if (bg) { set(bg, '--bgx', (-p * 3).toFixed(2) + 'vw'); set(bg, '--bgy', (-p * 4).toFixed(2) + 'vh'); }

    var io = seg(p, 0.08, 0.17);
    set(intro, '--intro-o', (1 - io).toFixed(3));
    set(intro, '--intro-y', (-io * 80).toFixed(1) + 'px');
    set(stage, '--dots-o', seg(p, 0.14, 0.2).toFixed(3));

    v.forEach(function (el, i) {
      var a = A[i], b = A[i + 1];
      var inn = ease(seg(p, a - 0.03, a + 0.06));
      var out = i < 3 ? seg(p, b - 0.04, b + 0.02) : 0;
      var o = inn * (1 - out);
      var t = seg(p, a, b);
      set(el, '--o', o.toFixed(3));
      if (i === 0) {
        set(el, '--x', ((1 - inn) * -12).toFixed(2) + 'vw');
        set(el, '--r', ((1 - inn) * -24 + t * 8).toFixed(1) + 'deg');
        set(el, '--s', (0.85 + 0.15 * inn + 0.12 * t - 0.2 * out).toFixed(3));
      } else if (i === 1) {
        set(el, '--scope', (ease(seg(p, a - 0.02, a + 0.1)) * 71).toFixed(1) + '%');
        set(el, '--scope-z', (1.45 - 0.35 * t).toFixed(3));
        set(el, '--s', (1 - 0.15 * out).toFixed(3));
      } else if (i === 2) {
        set(el, '--y', ((1 - inn) * 14 - out * 6).toFixed(2) + 'vh');
        set(el, '--s', (0.92 + 0.08 * inn + 0.05 * t).toFixed(3));
      } else {
        set(el, '--y', ((1 - inn) * 10).toFixed(2) + 'vh');
        var w = ease(seg(p, a + 0.04, 0.97));
        set(el, '--wipe', (100 - w * 100).toFixed(1) + '%');
        set(el, '--tag-b', seg(p, a + 0.08, a + 0.12).toFixed(3));
      }
    });

    var on = p < A[0] - 0.01 ? 0 : p < A[1] ? 1 : p < A[2] ? 2 : p < A[3] ? 3 : 4;
    steps.forEach(function (s, i) { s.classList.toggle('is-on', i + 1 === on); });
    dots.forEach(function (d, i) { d.classList.toggle('is-on', i + 1 === on); });
  }

  function progress() {
    var r = root.getBoundingClientRect();
    var range = root.offsetHeight - stage.offsetHeight;
    return range > 0 ? clamp(-r.top / range) : 0;
  }

  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; render(progress()); }); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  render(progress());
})();
