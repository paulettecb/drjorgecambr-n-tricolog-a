/* Jauiri · banners cinematográficos: zoom lento con el scroll y texto que aparece. */
(function () {
    document.querySelectorAll('[data-jvc]').forEach(function (root) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { root.classList.add('is-in'); return; }
    var img = root.querySelector('.jvc__img');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { e.forEach(function (x) { if (x.isIntersecting) root.classList.add('is-in'); }); }, { threshold: 0.35 }).observe(root);
    } else { root.classList.add('is-in'); }
    var ticking = false;
    function update() {
      ticking = false;
      var r = root.getBoundingClientRect(), vh = window.innerHeight;
      var t = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      if (img) { img.style.setProperty('--z', (1.22 - 0.2 * t).toFixed(4)); img.style.setProperty('--y', ((t - 0.5) * -6).toFixed(2) + 'vh'); }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  });
  })();
