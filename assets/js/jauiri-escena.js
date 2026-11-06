/* Jauiri · escena con scroll: el frasco entra, la tapa sube, salen las cápsulas y llegan los ingredientes. */
(function () {
    var root = document.getElementById('jvx-escena');
    if (!root) return;
    var stage = root.querySelector('.jvx__stage');
    var jar = root.querySelector('[data-jar]');
    var caps = Array.prototype.slice.call(root.querySelectorAll('[data-cap]'));
    var ings = Array.prototype.slice.call(root.querySelectorAll('[data-ing]'));
    var lines = Array.prototype.slice.call(root.querySelectorAll('[data-line]'));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function seg(p, a, b) { return clamp((p - a) / (b - a)); }
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function easeIO(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function set(el, k, v) { el.style.setProperty(k, v); }

    // Destino de cada cápsula (en vw/vh relativos al centro del frasco)
    var capTo = [[-30, -16, -38], [26, -24, 24], [-24, 18, 62], [30, 14, -20]];
    // Desde dónde entra cada ingrediente
    var ingFrom = [[-40, -20, -25], [40, -24, 22], [-42, 24, 18], [44, 22, -16]];

    function render(p) {
      var mobile = window.innerWidth < 750;
      // Fondo y halo
      set(stage, '--bg-s', (1.18 - 0.14 * ease(seg(p, 0, 1))).toFixed(4));
      set(stage, '--glow-o', (ease(seg(p, 0.02, 0.14))).toFixed(3));
      set(stage, '--hint-o', (1 - seg(p, 0.01, 0.05)).toFixed(3));

      // 1 · Entrada
      var a = ease(seg(p, 0, 0.13));
      var word = a * (1 - 0.86 * seg(p, 0.34, 0.44));
      set(stage, '--word-o', word.toFixed(3));
      set(stage, '--word-s', (1.12 - 0.12 * a + 0.06 * seg(p, 0.34, 0.5)).toFixed(4));
      set(stage, '--word-b', (6 * seg(p, 0.34, 0.5)).toFixed(2) + 'px');
      var shrink = 0.12 * easeIO(seg(p, 0.36, 0.5));
      set(jar, '--jar-o', a.toFixed(3));
      set(jar, '--jar-s', (0.72 + 0.28 * a - shrink).toFixed(4));
      set(jar, '--jar-y', ((1 - a) * 8).toFixed(2) + 'vh');

      // 2 · Se abre
      var sw = seg(p, 0.17, 0.19);
      set(jar, '--closed-o', (1 - sw).toFixed(3));
      set(jar, '--open-o', sw.toFixed(3));
      var l = easeIO(seg(p, 0.18, 0.32));
      set(jar, '--lid-o', (sw * (1 - seg(p, 0.27, 0.33))).toFixed(3));
      set(jar, '--lid-y', (-l * (mobile ? 34 : 46)).toFixed(2) + 'vh');
      set(jar, '--lid-x', (l * 6).toFixed(2) + 'vw');
      set(jar, '--lid-r', (l * 22).toFixed(2) + 'deg');

      caps.forEach(function (c, i) {
        var t = ease(seg(p, 0.2 + i * 0.02, 0.34 + i * 0.02));
        var drift = seg(p, 0.38, 0.6);
        var to = capTo[i];
        var k = mobile ? 1.15 : 1;
        set(c, '--cx', (to[0] * t * k * (1 + 0.35 * drift)).toFixed(2) + 'vw');
        set(c, '--cy', (to[1] * t * (1 + 0.35 * drift)).toFixed(2) + 'vh');
        set(c, '--cr', (to[2] * t + 40 * drift * (i % 2 ? 1 : -1)).toFixed(1) + 'deg');
        set(c, '--cs', (0.2 + 0.8 * t + 0.2 * drift).toFixed(3));
        set(c, '--co', (t * (1 - 0.7 * drift)).toFixed(3));
        set(c, '--cb', (5 * drift).toFixed(2) + 'px');
      });

      // 3 · Ingredientes
      ings.forEach(function (el, i) {
        var s0 = 0.4 + i * 0.1;
        var t = ease(seg(p, s0, s0 + 0.1));
        var f = ingFrom[i % 4];
        set(el, '--fx', ((1 - t) * f[0]).toFixed(2) + 'vw');
        set(el, '--fy', ((1 - t) * f[1]).toFixed(2) + 'vh');
        set(el, '--fr', ((1 - t) * f[2]).toFixed(1) + 'deg');
        set(el, '--fs', (0.45 + 0.55 * t).toFixed(3));
        set(el, '--fo', t.toFixed(3));
        set(el, '--fb', ((1 - t) * 14).toFixed(2) + 'px');
        set(el, '--to', seg(p, s0 + 0.06, s0 + 0.1).toFixed(3));
      });

      // Frases
      var on = p < 0.16 ? 1 : p < 0.36 ? 2 : p < 0.86 ? 3 : 4;
      lines.forEach(function (ln) { ln.classList.toggle('is-on', Number(ln.dataset.line) === on); });
    }

    function progress() {
      var r = root.getBoundingClientRect();
      var range = root.offsetHeight - window.innerHeight;
      return range > 0 ? clamp(-r.top / range) : 1;
    }

    if (reduce) { render(1); return; }

    var ticking = false;
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; render(progress()); }); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render(progress());

    // La escena sigue un poco al cursor (solo con mouse)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      root.querySelectorAll('[data-depth]').forEach(function (el) { el.style.setProperty('--d', el.dataset.depth); });
      stage.addEventListener('pointermove', function (e) {
        var x = (e.clientX / window.innerWidth - 0.5) * -36;
        var y = (e.clientY / window.innerHeight - 0.5) * -24;
        set(stage, '--mx', x.toFixed(2)); set(stage, '--my', y.toFixed(2));
        set(stage, '--px', (x * 0.25).toFixed(2) + 'px'); set(stage, '--py', (y * 0.25).toFixed(2) + 'px');
      });
    }
  })();
