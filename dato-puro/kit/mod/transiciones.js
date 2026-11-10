(function () {
const K = window.K;
const TIPOS = {
  fundido: (g, c, o) => { g.globalAlpha = c; g.fillStyle = o.color; g.fillRect(0, 0, K.W, K.H); },
  flash: (g, c, o) => { g.globalAlpha = c * c; g.fillStyle = o.color; g.fillRect(0, 0, K.W, K.H); },
  barrido: (g, c, o, u) => { const d = o.dir ?? 'izq', e = K.ease3(u < 0.5 ? u * 2 : (u - 0.5) * 2), W = K.W, H = K.H; g.fillStyle = o.color;
    const a = u < 0.5 ? 0 : e, b = u < 0.5 ? e : 1;
    if (d === 'izq') g.fillRect(W * a, 0, W * (b - a), H); else if (d === 'der') g.fillRect(W * (1 - b), 0, W * (b - a), H); else if (d === 'arriba') g.fillRect(0, H * a, W, H * (b - a)); else g.fillRect(0, H * (1 - b), W, H * (b - a)); },
  diagonal: (g, c, o, u) => { const e = K.ease3(u < 0.5 ? u * 2 : (u - 0.5) * 2), s = K.H * 0.35, xa = K.lerp(-s, K.W, u < 0.5 ? 0 : e), xb = K.lerp(-s, K.W, u < 0.5 ? e : 1); g.fillStyle = o.color; g.beginPath(); g.moveTo(xa + s, 0); g.lineTo(xb + s, 0); g.lineTo(xb, K.H); g.lineTo(xa, K.H); g.closePath(); g.fill(); },
  cortina: (g, c, o) => { const n = o.n ?? 7, w = K.W / n; g.fillStyle = o.color; for (let i = 0; i < n; i++) { const ci = K.easeOut(K.clamp(c * 1.6 - (i / n) * 0.6)); g.fillRect(i * w - 1, i % 2 ? K.H * (1 - ci) : 0, w + 2, K.H * ci); } },
  iris: (g, c, o) => { const R = Math.hypot(K.W, K.H) / 2, r = R * (1 - K.ease(c)), [x, y] = o.centro ?? [K.W / 2, K.H / 2]; g.fillStyle = o.color; g.beginPath(); g.rect(0, 0, K.W, K.H); g.arc(x, y, Math.max(0, r) * 1.25, 0, Math.PI * 2, true); g.fill('evenodd'); },
  bloques: (g, c, o) => { const n = o.n ?? 6, w = K.W / n, m = Math.ceil(K.H / w); g.fillStyle = o.color; for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) { const r = ((i * 73 + j * 131) % 17) / 17, ci = K.easeOut(K.clamp(c * 1.7 - r * 0.7)); if (ci > 0) g.fillRect(i * w + w / 2 * (1 - ci) - 0.5, j * w + w / 2 * (1 - ci) - 0.5, w * ci + 1, w * ci + 1); } },
  persiana: (g, c, o) => { const n = o.n ?? 12, h = K.H / n; g.fillStyle = o.color; for (let i = 0; i < n; i++) g.fillRect(0, i * h, K.W, h * K.ease(c) + 0.6); },
  papel: (g, c, o, u) => { const e = K.ease3(u < 0.5 ? u * 2 : (u - 0.5) * 2), y0 = u < 0.5 ? K.H * (1 - e) : -K.H * e; g.fillStyle = o.color; g.beginPath(); g.moveTo(0, y0 + 30); for (let x = 0; x <= K.W; x += 40) g.lineTo(x, y0 + ((x / 40) % 2 ? 0 : 34)); g.lineTo(K.W, y0 + K.H + 30); for (let x = K.W; x >= 0; x -= 40) g.lineTo(x, y0 + K.H + ((x / 40) % 2 ? 0 : 34)); g.closePath(); g.fill(); }
};
K.TRANSICIONES = TIPOS;
K.transicion = (g, tipo, u, o = {}) => {
  if (u <= 0 || u >= 1) return; const f = TIPOS[tipo]; if (!f) throw new Error('transición desconocida: ' + tipo + '. Hay: ' + Object.keys(TIPOS).join(', '));
  const c = 1 - Math.abs(u * 2 - 1); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); f(g, K.clamp(c), Object.assign({ color: { papel: '#ece6da', flash: '#fff' }[tipo] ?? '#000' }, o), u); g.restore();
};
K.transiciones = lista => {
  const L = lista.map(x => Object.assign({ d: 0.5, tipo: 'fundido' }, x)).sort((a, b) => a.t - b.t);
  const F = (g, t) => { for (const x of L) K.transicion(g, x.tipo, (t - (x.t - x.d / 2)) / x.d, x); };
  F.escena = t => { let i = 0; for (const x of L) if (t >= x.t) i++; return i; };
  F.cortes = L.map(x => x.t);
  return F;
};
})();
