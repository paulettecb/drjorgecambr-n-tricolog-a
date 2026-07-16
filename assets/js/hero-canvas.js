/*
 * Animación del hero — port vanilla JS del componente del template
 * templates/landing/Landing.dc.html ("Tricología Cambrón — Design System").
 * Variantes: orbe (default) | hebras | constelacion | crecimiento.
 * Props por data-attributes en el canvas:
 *   data-variant, data-strands, data-speed, data-interactive
 */
(function () {
  'use strict';

  class HeroCanvas {
    constructor(wrap, canvas) {
      this.wrap = wrap;
      this.canvas = canvas;
      this.variant = canvas.dataset.variant || 'orbe';
      this.strands = parseInt(canvas.dataset.strands, 10) || 164;
      this.speed = parseFloat(canvas.dataset.speed) || 0.4;
      this.interactive = canvas.dataset.interactive !== 'false';

      this._t = Math.random() * 100;
      this._raf = 0;
      this._strands = []; this._pts = []; this._shoots = [];
      this._opts = []; this._links = [];
      this._pox = 0; this._poy = 0;
      this._px = -9999; this._py = -9999; this._pk = 0; this._ptk = 0;

      this._reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      this._tick = this._tick.bind(this);
      this._onMove = this._onMove.bind(this);
      this._onLeave = this._onLeave.bind(this);

      this._ro = new ResizeObserver(() => this._resize());
      this._ro.observe(this.wrap);
      this._resize();

      if (this.interactive) {
        this.wrap.addEventListener('pointermove', this._onMove);
        this.wrap.addEventListener('pointerleave', this._onLeave);
      }
      if (!this._reduced.matches) {
        this._raf = requestAnimationFrame(this._tick);
      }
      this._reduced.addEventListener('change', (e) => {
        cancelAnimationFrame(this._raf);
        if (!e.matches) this._raf = requestAnimationFrame(this._tick);
      });
    }

    _resize() {
      const c = this.canvas, w = this.wrap;
      if (!c || !w) return;
      const r = w.getBoundingClientRect();
      this._w = r.width; this._h = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.max(1, r.width * dpr);
      c.height = Math.max(1, r.height * dpr);
      this._ctx = c.getContext('2d');
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._build();
      this._draw();
    }

    _build() {
      const n = Math.max(4, Math.round(this.strands));
      const w = this._w || 1200, h = this._h || 800;
      const R = (s) => { s = Math.sin(s * 127.1) * 43758.5453; return s - Math.floor(s); };
      this._variant = this.variant;
      if (this._variant === 'orbe') {
        const N = Math.max(120, Math.round(n * 3));
        const GA = Math.PI * (3 - Math.sqrt(5));
        this._R = Math.min(w, h) * 0.30;
        this._ocx = w * 0.72; this._ocy = h * 0.52;
        this._opts = Array.from({ length: N }, (_, i) => {
          const y = 1 - 2 * (i + 0.5) / N;
          const rr = Math.sqrt(Math.max(0, 1 - y * y));
          const th = GA * i;
          const p = [Math.cos(th) * rr, y, Math.sin(th) * rr];
          const tl = Math.hypot(p[2], p[0]) || 1;
          return {
            p,
            tan: [p[2] / tl, 0, -p[0] / tl],
            gold: (i % 9) === 4,
            fil: (i % 3) === 0,
            flen: 0.06 + 0.13 * R(i + 31),
            ph: R(i + 32) * 6.283,
            sp: 0.5 + 0.9 * R(i + 33)
          };
        });
        this._links = [];
        const cnt = new Array(N).fill(0), THR = 0.30;
        for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
          if (cnt[i] > 2 || cnt[j] > 2) continue;
          const a = this._opts[i].p, b = this._opts[j].p;
          const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
          if (dx * dx + dy * dy + dz * dz < THR * THR) { this._links.push([i, j]); cnt[i]++; cnt[j]++; }
        }
        const pick = (f) => { let k = Math.round(N * f); k = k - (((k - 4) % 9) + 9) % 9; return Math.max(4, Math.min(N - 1, k)); };
        this._tags = [
          { i: pick(0.18), label: 'Densidad · 148 fol/cm²' },
          { i: pick(0.52), label: 'Fase anágena · 87%' },
          { i: pick(0.84), label: 'Zona corona · estable' }
        ];
        return;
      }
      if (this._variant === 'constelacion') {
        this._pts = Array.from({ length: n }, (_, i) => ({
          x: w * (0.32 + 0.66 * Math.sqrt(R(i + 11))),
          y: h * (0.06 + 0.88 * R(i + 12)),
          ax: 6 + 11 * R(i + 13), ay: 5 + 9 * R(i + 14),
          ph: R(i + 15) * 6.283, sp: 0.4 + 0.8 * R(i + 16),
          r: 1.4 + 1.6 * R(i + 17),
          gold: (i % 9) === 4
        }));
        return;
      }
      if (this._variant === 'crecimiento') {
        this._rootY = h * 0.62;
        const x0 = w * 0.50, x1 = w * 0.965;
        this._rootX0 = x0; this._rootX1 = x1;
        this._shoots = Array.from({ length: n }, (_, i) => ({
          x: x0 + (x1 - x0) * ((i + 0.5) / n) + (R(i + 21) - 0.5) * 20,
          len: 48 + 175 * R(i + 22),
          curl: (R(i + 23) - 0.5) * 0.9,
          amp: 4 + 9 * R(i + 24),
          ph: R(i + 25) * 6.283, sp: 0.5 + 0.8 * R(i + 26),
          cyc: R(i + 27),
          al: 0.15 + 0.16 * R(i + 28),
          gold: (i % 9) === 4
        }));
        return;
      }
      this._cx = w * 0.86; this._cy = h * 0.30;
      this._strands = Array.from({ length: n }, (_, i) => {
        const u = n > 1 ? i / (n - 1) : 0.5;
        return {
          th: (0.44 + 0.72 * u) * Math.PI + (R(i + 1) - 0.5) * 0.12,
          len: (0.40 + 0.55 * R(i + 2)) * Math.max(w, h) * 0.78,
          curl: (R(i + 3) - 0.5) * 1.15,
          amp: 6 + 15 * R(i + 4),
          ph: R(i + 5) * Math.PI * 2,
          sp: 0.5 + R(i + 6) * 0.9,
          al: 0.09 + 0.14 * R(i + 7),
          gold: (i % 9) === 4,
          dot: (i % 3) === 0
        };
      });
    }

    _repel(x, y, amp, u) {
      if (this._pk < 0.01) return [x, y];
      const dx = x - this._px, dy = y - this._py, d2 = dx * dx + dy * dy;
      const f = Math.exp(-d2 / 26000) * amp * this._pk * (u == null ? 1 : u);
      if (f > 0.05) { const d = Math.sqrt(d2) || 1; return [x + dx / d * f, y + dy / d * f]; }
      return [x, y];
    }

    _draw() {
      const ctx = this._ctx; if (!ctx) return;
      ctx.clearRect(0, 0, this._w, this._h);
      this._pk += (this._ptk - this._pk) * 0.07;
      if (this._variant === 'orbe') return this._drawOrbe(ctx);
      if (this._variant === 'constelacion') return this._drawConst(ctx);
      if (this._variant === 'crecimiento') return this._drawGrow(ctx);
      this._drawHebras(ctx);
    }

    _drawHebras(ctx) {
      const t = this._t, SEG = 26, HPI = Math.PI / 2;
      for (const s of this._strands) {
        ctx.beginPath();
        let tx = 0, ty = 0;
        for (let j = 0; j <= SEG; j++) {
          const u = j / SEG;
          const a = s.th + s.curl * u * u;
          let x = this._cx + Math.cos(a) * s.len * u;
          let y = this._cy + Math.sin(a) * s.len * u;
          const sw = Math.sin(u * 3.1 + s.ph + t * s.sp) * s.amp * u;
          x += Math.cos(a + HPI) * sw; y += Math.sin(a + HPI) * sw;
          const p = this._repel(x, y, 30, u); x = p[0]; y = p[1];
          j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          tx = x; ty = y;
        }
        ctx.strokeStyle = s.gold ? 'rgba(200,147,49,' + (0.28 + s.al) + ')' : 'rgba(31,78,107,' + s.al + ')';
        ctx.lineWidth = s.gold ? 1.4 : 1.1;
        ctx.lineCap = 'round';
        ctx.stroke();
        if (s.dot) {
          ctx.beginPath(); ctx.arc(tx, ty, s.gold ? 2.2 : 1.7, 0, 6.2832);
          ctx.fillStyle = s.gold ? 'rgba(200,147,49,.55)' : 'rgba(31,78,107,' + (s.al + 0.12) + ')';
          ctx.fill();
        }
      }
    }

    _drawOrbe(ctx) {
      const t = this._t;
      let tx = 0, ty = 0;
      if (this._px > -9000) {
        tx = Math.max(-0.5, Math.min(0.5, (this._px - this._ocx) / this._R * 0.22)) * this._pk;
        ty = Math.max(-0.4, Math.min(0.4, (this._py - this._ocy) / this._R * 0.16)) * this._pk;
      }
      this._pox += (tx - this._pox) * 0.04;
      this._poy += (ty - this._poy) * 0.04;
      const rotY = t * 0.22 + this._pox, rotX = -0.52 + this._poy;
      const cy1 = Math.cos(rotY), sy1 = Math.sin(rotY), cx1 = Math.cos(rotX), sx1 = Math.sin(rotX);
      const R = this._R * (1 + 0.02 * Math.sin(t * 0.5));
      const F = 3.2;
      const rot = (v) => {
        const x = v[0] * cy1 + v[2] * sy1, z = -v[0] * sy1 + v[2] * cy1;
        const y = v[1] * cx1 - z * sx1, z2 = v[1] * sx1 + z * cx1;
        return [x, y, z2];
      };
      const proj = (v) => {
        const k = F / (F - v[2]);
        return [this._ocx + v[0] * R * k, this._ocy - v[1] * R * k, v[2], k];
      };
      const P = this._opts.map((o) => proj(rot(o.p)));
      for (const [i, j] of this._links) {
        const a = P[i], b = P[j];
        const dz = (a[2] + b[2]) / 2, dp = (dz + 1) / 2;
        const gold = this._opts[i].gold || this._opts[j].gold;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        ctx.strokeStyle = gold ? 'rgba(200,147,49,' + (0.06 + 0.24 * dp) + ')' : 'rgba(31,78,107,' + (0.04 + 0.15 * dp) + ')';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      for (let i = 0; i < this._opts.length; i++) {
        const o = this._opts[i], q = P[i];
        const dp = (q[2] + 1) / 2;
        if (o.fil && q[2] > -0.1) {
          const g = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.5 * o.sp + o.ph));
          ctx.beginPath();
          for (let s = 0; s <= 8; s++) {
            const u = s / 8;
            const ext = 1 + o.flen * g * u;
            const sw = Math.sin(u * 2.2 + t * o.sp + o.ph) * 0.028 * u;
            const mv = [o.p[0] * ext + o.tan[0] * sw, o.p[1] * ext + o.tan[1] * sw, o.p[2] * ext + o.tan[2] * sw];
            const pp = proj(rot(mv));
            s ? ctx.lineTo(pp[0], pp[1]) : ctx.moveTo(pp[0], pp[1]);
          }
          ctx.strokeStyle = o.gold ? 'rgba(200,147,49,' + (0.14 + 0.38 * dp) + ')' : 'rgba(31,78,107,' + (0.08 + 0.26 * dp) + ')';
          ctx.lineWidth = o.gold ? 1.3 : 1;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(q[0], q[1], (0.9 + 1.3 * dp) * (o.gold ? 1.3 : 1), 0, 6.2832);
        ctx.fillStyle = o.gold ? 'rgba(200,147,49,' + (0.18 + 0.42 * dp) + ')' : 'rgba(31,78,107,' + (0.10 + 0.34 * dp) + ')';
        ctx.fill();
      }
      ctx.font = '500 11px Inter, sans-serif';
      for (const tg of this._tags || []) {
        const q = P[tg.i]; if (!q || q[2] < 0.18) continue;
        const a = Math.min(1, (q[2] - 0.18) / 0.25);
        let dx = q[0] - this._ocx, dy = q[1] - this._ocy;
        const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
        const bx = q[0] + dx * 30, by = q[1] + dy * 30;
        ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(bx, by);
        ctx.strokeStyle = 'rgba(31,78,107,' + 0.35 * a + ')'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, 6.2832);
        ctx.fillStyle = 'rgba(200,147,49,' + 0.9 * a + ')'; ctx.fill();
        const tw = ctx.measureText(tg.label).width;
        let rx = dx < 0 ? bx - tw - 20 : bx, ry = by - 13;
        rx = Math.max(8, Math.min(rx, this._w - tw - 28));
        ry = Math.max(8, Math.min(ry, this._h - 34));
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.strokeStyle = 'rgba(31,78,107,0.28)'; ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(rx, ry, tw + 20, 26, 8); else ctx.rect(rx, ry, tw + 20, 26);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1F4E6B';
        ctx.fillText(tg.label, rx + 10, ry + 17);
        ctx.globalAlpha = 1;
      }
    }

    _drawConst(ctx) {
      const t = this._t, pts = this._pts, LINK = 118;
      const pos = pts.map((p) => {
        let x = p.x + Math.sin(t * p.sp + p.ph) * p.ax;
        let y = p.y + Math.cos(t * p.sp * 0.8 + p.ph) * p.ay;
        const q = this._repel(x, y, 20, 1); return [q[0], q[1], p];
      });
      for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1];
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          const k = 1 - d / LINK;
          const gold = pos[i][2].gold || pos[j][2].gold;
          ctx.beginPath(); ctx.moveTo(pos[i][0], pos[i][1]); ctx.lineTo(pos[j][0], pos[j][1]);
          ctx.strokeStyle = gold ? 'rgba(200,147,49,' + (k * 0.30) + ')' : 'rgba(31,78,107,' + (k * 0.16) + ')';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
      for (const [x, y, p] of pos) {
        ctx.beginPath(); ctx.arc(x, y, p.gold ? p.r + 0.6 : p.r, 0, 6.2832);
        ctx.fillStyle = p.gold ? 'rgba(200,147,49,.6)' : 'rgba(31,78,107,.32)';
        ctx.fill();
      }
    }

    _drawGrow(ctx) {
      const t = this._t, SEG = 16;
      ctx.beginPath(); ctx.moveTo(this._rootX0 - 24, this._rootY); ctx.lineTo(this._rootX1 + 12, this._rootY);
      ctx.strokeStyle = 'rgba(200,147,49,.42)'; ctx.lineWidth = 1.5; ctx.stroke();
      for (const s of this._shoots) {
        const c = (t * 0.055 * s.sp + s.cyc) % 1;
        let g, fade = 1;
        if (c < 0.55) { const q = c / 0.55; g = 1 - Math.pow(1 - q, 3); }
        else if (c < 0.9) g = 1;
        else { g = 1; fade = 1 - (c - 0.9) / 0.1; }
        const L = s.len * g;
        ctx.beginPath();
        for (let j = 0; j <= SEG; j++) {
          const u = j / SEG;
          let x = s.x + s.curl * 44 * u * u + Math.sin(u * 2.4 + s.ph + t * s.sp) * s.amp * u;
          let y = this._rootY - L * u;
          const p = this._repel(x, y, 22, u); x = p[0]; y = p[1];
          j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        const a = s.al * fade;
        ctx.strokeStyle = s.gold ? 'rgba(200,147,49,' + (a + 0.18) + ')' : 'rgba(31,78,107,' + a + ')';
        ctx.lineWidth = s.gold ? 1.4 : 1.1;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x, this._rootY + 4, 1.8, 0, 6.2832);
        ctx.fillStyle = s.gold ? 'rgba(200,147,49,.5)' : 'rgba(31,78,107,.22)';
        ctx.fill();
      }
    }

    _tick() {
      this._t += 0.0096 * this.speed;
      this._draw();
      this._raf = requestAnimationFrame(this._tick);
    }

    _onMove(e) {
      const r = this.wrap.getBoundingClientRect();
      this._px = e.clientX - r.left; this._py = e.clientY - r.top; this._ptk = 1;
    }
    _onLeave() { this._ptk = 0; }
  }

  const init = () => {
    const canvas = document.querySelector('.lp-hero-canvas');
    const wrap = document.querySelector('.lp-hero-wrap');
    if (canvas && wrap) new HeroCanvas(wrap, canvas);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
