(function () {
const C = window.C, R = Math.PI / 180, TAU = Math.PI * 2;
const lerpV = (a, b, u) => Array.isArray(a) ? a.map((x, i) => x + ((b[i] ?? x) - x) * u) : a + (b - a) * u;
C.lerpV = lerpV;
C.EASES = { lin: u => u, suave: C.suave, sal: C.salida, ent: u => u * u * u, reb: C.rebote };
C.pista = (t, k) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t < k[i][0]) { const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return lerpV(k[i - 1][1], k[i][1], C.EASES[k[i][2] || 'suave'](C.clamp(u))); }
  return k[k.length - 1][1];
};
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
C.hash = hash;
C.ruido = (t, s = 0) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return (hash(i + s * 57.3) * (1 - u) + hash(i + 1 + s * 57.3) * u) * 2 - 1; };
C.dardos = (t, s = 0, per = 0.8) => { const i = Math.floor(t / per), f = t - i * per; const a = hash(i - 1 + s * 13.7) * 2 - 1, b = hash(i + s * 13.7) * 2 - 1; return a + (b - a) * C.salida(f / 0.07); };
C.resorte = (fn, t, o = {}) => {
  const f = o.f ?? 3, z = o.z ?? 0.45, t0 = o.t0 ?? 0, dt = 1 / 60, w = TAU * f;
  let x = fn(t0); const vec = Array.isArray(x); x = vec ? x.slice() : [x]; const v = x.map(() => 0);
  for (let tt = t0; tt < t; tt += dt) { let q = fn(tt); if (!vec) q = [q]; for (let i = 0; i < x.length; i++) { v[i] += (w * w * (q[i] - x[i]) - 2 * z * w * v[i]) * dt; x[i] += v[i] * dt; } }
  return vec ? x : x[0];
};
C.ik2 = (a, b, l1, l2, elige) => {
  let dx = b[0] - a[0], dy = b[1] - a[1]; const d0 = Math.hypot(dx, dy) || 1e-6;
  const d = C.clamp(d0, Math.abs(l1 - l2) + 1, l1 + l2 - 0.5); dx *= d / d0; dy *= d / d0;
  const base = Math.atan2(dy, dx), ang = Math.acos(C.clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const j1 = [a[0] + Math.cos(base + ang) * l1, a[1] + Math.sin(base + ang) * l1], j2 = [a[0] + Math.cos(base - ang) * l1, a[1] + Math.sin(base - ang) * l1];
  return [elige(j1, j2), [a[0] + dx, a[1] + dy]];
};
C.cache = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d')); return c; };
const bufs = [];
const buf = i => { if (!bufs[i]) { bufs[i] = document.createElement('canvas'); bufs[i].width = C.W; bufs[i].height = C.H; } return bufs[i]; };
C.iluminar = (g, fn, o = {}) => {
  const a = buf(0), ga = a.getContext('2d');
  ga.setTransform(1, 0, 0, 1, 0, 0); ga.globalCompositeOperation = 'source-over'; ga.globalAlpha = 1; ga.clearRect(0, 0, C.W, C.H);
  ga.setTransform(g.getTransform()); fn(ga);
  ga.setTransform(1, 0, 0, 1, 0, 0); ga.globalAlpha = 1; ga.globalCompositeOperation = 'source-atop';
  if (o.tinte) { ga.fillStyle = o.tinte; ga.fillRect(0, 0, C.W, C.H); }
  if (o.borde) {
    const b = buf(1), gb = b.getContext('2d'), off = o.off || [5, 0];
    gb.setTransform(1, 0, 0, 1, 0, 0); gb.globalCompositeOperation = 'source-over'; gb.clearRect(0, 0, C.W, C.H); gb.drawImage(a, 0, 0);
    gb.globalCompositeOperation = 'destination-out'; gb.drawImage(a, off[0], off[1]);
    gb.globalCompositeOperation = 'source-in'; gb.fillStyle = o.borde; gb.fillRect(0, 0, C.W, C.H);
    ga.globalAlpha = o.bordeK ?? 1; ga.drawImage(b, 0, 0); ga.globalAlpha = 1;
  }
  ga.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(a, 0, 0); g.restore();
};

const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
C.rr = rr;
C.CARAS2 = {
  neutral: { cej: 0, cejY: 0, ojoH: 1, plato: 0, boca: 'linea', ab: 0, rubor: 0.35 },
  feliz: { cej: -6, cejY: 4, ojoH: 0.9, plato: 0, boca: 'sonrisa', ab: 0.5, rubor: 0.55 },
  tranquila: { cej: 4, cejY: 2, ojoH: 0.85, plato: 0, boca: 'sonrisa', ab: 0, rubor: 0.4 },
  miedo: { cej: 22, cejY: 9, ojoH: 1.15, plato: 0, boca: 'o', ab: 0.5, rubor: 0.15 },
  terror: { cej: 26, cejY: 14, ojoH: 1.2, plato: 1, boca: 'grito', ab: 1, rubor: 0.05 },
  apretada: { cej: -14, cejY: -6, ojoH: 0, plato: 0, boca: 'dientes', ab: 0.5, rubor: 0.2 },
  sorpresa: { cej: 10, cejY: 14, ojoH: 1.25, plato: 1, boca: 'o', ab: 1, rubor: 0.2 },
  dolor: { cej: 26, cejY: 2, ojoH: 0.35, plato: 0, boca: 'abajo_abierta', ab: 0.6, rubor: 0.2 },
  triste: { cej: 22, cejY: 4, ojoH: 0.8, plato: 0, boca: 'abajo', ab: 0, rubor: 0.25 },
  dormida: { cej: 6, cejY: -2, ojoH: 0, plato: 0, boca: 'linea', ab: 0, rubor: 0.2 }
};
const NUM = ['cej', 'cejI', 'cejD', 'cejY', 'ojoH', 'plato', 'ab', 'rubor', 'sucio'];
C.cara2 = c => typeof c === 'string' ? { ...C.CARAS2[c] } : { ...C.CARAS2.neutral, ...c };
C.mezclarCara2 = (a, b, k) => { a = C.cara2(a); b = C.cara2(b); if (k <= 0) return a; if (k >= 1) return b; const o = { ...(k < 0.5 ? a : b) }; for (const n of NUM) { const x = a[n] ?? (n === 'cejI' || n === 'cejD' ? a.cej : 0), y = b[n] ?? (n === 'cejI' || n === 'cejD' ? b.cej : 0); o[n] = x + (y - x) * k; } return o; };

C.personaje2 = rec => {
  const cu = rec.cuerpo || {}, esc = (cu.estatura || 1) * (cu.edad === 'nino' ? 0.75 : 1);
  const piel = rec.piel || '#f3d6bd', ropa = rec.ropa || {}, pelo = rec.pelo || { estilo: 'corto', color: '#3b2a20' };
  const arriba = ropa.arriba || { tipo: 'playera', color: '#4a7bd0' }, abajo = ropa.abajo || { tipo: 'pantalon', color: '#2d3142' }, pies = ropa.pies || { color: '#f2f2f2' };
  const semilla = [...(rec.id || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0);
  const R0 = 78 * (cu.cabeza || 1), ancho = { delgada: 0.9, delgado: 0.9, medio: 1, media: 1, robusto: 1.25 }[cu.complexion || 'medio'];
  const vestido = arriba.tipo === 'vestido', manga = ['sudadera', 'camisa', 'chamarra', 'saco'].includes(arriba.tipo), pantalon = !vestido && ['pantalon', 'pants'].includes(abajo.tipo);
  const L = C.LINEA, LW = 5;
  const linea = (g, pts, w, col) => { g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.strokeStyle = col; g.lineWidth = w; g.stroke(); };
  const extremidad = (g, pts, col, gr) => { linea(g, pts, gr + 7, L); linea(g, pts, gr, col); };
  const ext = (o, ang, len, lado) => [o[0] + Math.sin(ang * R) * len * lado, o[1] + Math.cos(ang * R) * len];
  const fill = (g, col, lw = LW) => { g.fillStyle = col; g.fill(); g.lineWidth = lw; g.strokeStyle = L; g.stroke(); };
  const brazo = (g, hom, a, lado, obj) => {
    let codo, mano;
    if (obj) [codo, mano] = C.ik2(hom, obj, 66, 58, (p, q) => (p[1] + p[0] * lado * 0.4 > q[1] + q[0] * lado * 0.4 ? p : q));
    else { codo = ext(hom, a[0], 66, lado); mano = ext(codo, a[0] + a[1], 58, lado); }
    extremidad(g, [hom, codo, mano], manga ? arriba.color : piel, manga ? 11 : 7);
    g.beginPath(); g.arc(mano[0], mano[1], 9.5, 0, TAU); fill(g, piel, 3.5);
  };
  const pie = (g, p, lado, desc) => { g.beginPath(); g.ellipse(p[0] + lado * 5, p[1] + 2, desc ? 11 : 15, desc ? 7 : 9, 0, 0, TAU); fill(g, desc ? piel : pies.color, 3.5); };
  const pierna = (g, cad, a, lado, p, desc) => {
    const col = pantalon ? abajo.color : piel, gr = pantalon ? 13 : 7; let rod, tob;
    if (p.suelo) { rod = [cad[0] + lado * 42, cad[1] + 22]; tob = [cad[0] + lado * 74, cad[1] + 44]; }
    else if (p.sentado) { rod = [cad[0] + lado * 8, cad[1] + 16]; tob = ext(rod, a[0], 82 * (a[2] ?? 1), lado); }
    else { rod = ext(cad, a[0], 50, lado); tob = ext(rod, a[0] + a[1], 48, lado); }
    extremidad(g, [cad, rod, tob], col, gr); pie(g, tob, lado, desc);
  };
  const peloAtras = (g, r, d, t) => {
    const e = pelo.estilo;
    if (e === 'largo') {
      const m = Math.min(1, Math.hypot(d[0], d[1]) / 70), fl = s => Math.sin(t * 13 + s * 2.1) * m * r * 0.13, fl2 = s => Math.cos(t * 10 + s * 1.3) * m * r * 0.09;
      const T0 = s => [s * r * 1.08 + d[0] + s * m * r * 0.5 + fl(s) * 2, r * 1.2 + d[1] + fl2(s) * 2];
      const T1 = s => { const q = [s * r * 0.62 + d[0] * 0.92 + fl(s + 3), r * 1.15 + d[1] * 0.92 + fl2(s + 3)], o = T0(s); return [q[0] + (o[0] - q[0]) * m * 0.72, q[1] + (o[1] - q[1]) * m * 0.72]; };
      if (m > 0.25) {
        const tip = [d[0] * 0.95 + fl(21) * 2.5, -r * 0.7 + d[1] * 0.95], tip2 = [d[0] * 0.7 - r * 0.5 + fl(23) * 2, -r * 0.6 + d[1] * 0.72], tip3 = [d[0] * 0.75 + r * 0.55 + fl(25) * 2, -r * 0.6 + d[1] * 0.78];
        g.beginPath(); g.moveTo(-r * 0.95, -r * 0.3);
        g.quadraticCurveTo(-r * 0.9 + d[0] * 0.3 + fl(31), -r * 0.6 + d[1] * 0.4, tip2[0], tip2[1]);
        g.quadraticCurveTo(tip2[0] * 0.5 + d[0] * 0.3, -r * 0.9 + d[1] * 0.45, tip[0], tip[1]);
        g.quadraticCurveTo(tip3[0] * 0.5 + d[0] * 0.3, -r * 0.9 + d[1] * 0.5, tip3[0], tip3[1]);
        g.quadraticCurveTo(r * 0.9 + d[0] * 0.3 + fl(33), -r * 0.6 + d[1] * 0.4, r * 0.95, -r * 0.3);
        g.closePath(); fill(g, pelo.color);
      }
      g.beginPath(); g.moveTo(-r * 1.06, 0); g.arc(0, 0, r * 1.06, Math.PI, 0);
      let a = T0(1), b = T1(1);
      g.quadraticCurveTo((r * 1.06 + a[0]) / 2 + r * 0.14 + fl(5), a[1] / 2, a[0], a[1]);
      g.quadraticCurveTo((a[0] + b[0]) / 2 + d[0] * 0.08, (a[1] + b[1]) / 2 + r * 0.16 + d[1] * 0.08, b[0], b[1]);
      g.quadraticCurveTo((r * 0.5 + b[0]) / 2 + fl(7), (r * 0.5 + b[1]) / 2, r * 0.5, r * 0.5);
      g.lineTo(-r * 0.5, r * 0.5);
      a = T0(-1); b = T1(-1);
      g.quadraticCurveTo((-r * 0.5 + b[0]) / 2 + fl(9), (r * 0.5 + b[1]) / 2, b[0], b[1]);
      g.quadraticCurveTo((a[0] + b[0]) / 2 + d[0] * 0.08, (a[1] + b[1]) / 2 + r * 0.16 + d[1] * 0.08, a[0], a[1]);
      g.quadraticCurveTo((-r * 1.06 + a[0]) / 2 - r * 0.14 + fl(11), a[1] / 2, -r * 1.06, 0);
      g.closePath(); fill(g, pelo.color);
    }
    if (e === 'coleta') { g.beginPath(); g.ellipse(r * 0.95 + d[0] * 0.3, -r * 0.35 + d[1] * 0.3, r * 0.28, r * 0.55, 0.5, 0, TAU); fill(g, pelo.color); }
  };
  const peloFrente = (g, r, mx, d) => {
    const e = pelo.estilo; if (e === 'calvo') return;
    g.beginPath();
    if (e === 'corto') { g.arc(0, -r * 0.02, r * 1.02, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(r * 0.92, -r * 0.18); g.quadraticCurveTo(r * 0.2 + mx, -r * 0.62, -r * 0.35 + mx, -r * 0.38); g.quadraticCurveTo(-r * 0.7, -r * 0.5, -r * 0.98, -r * 0.1); }
    else { g.arc(0, -r * 0.08, r * 1.0, Math.PI * 1.08, Math.PI * 1.92); g.quadraticCurveTo(mx * 0.5 + d[0] * 0.06, -r * 0.55 + Math.min(0, d[1]) * 0.07, -r * 0.95, -r * 0.28); }
    g.closePath(); fill(g, pelo.color);
  };
  const boca = (g, x, y, c, w, habla) => {
    g.strokeStyle = L; g.lineWidth = 4.5; g.lineCap = 'round'; g.lineJoin = 'round';
    const ab = C.clamp(c.ab + habla * 0.9), f = habla > 0.08 && (c.boca === 'linea' || c.boca === 'sonrisa' || c.boca === 'abajo') ? (c.boca === 'sonrisa' ? 'sonrisa_h' : 'o') : c.boca;
    if (f === 'linea' || (f === 'o' && ab < 0.05)) { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.stroke(); return; }
    if (f === 'sonrisa') { g.beginPath(); g.moveTo(x - w / 2, y - 3); g.quadraticCurveTo(x, y + 10, x + w / 2, y - 3); g.stroke(); return; }
    if (f === 'sonrisa_h') { g.beginPath(); g.moveTo(x - w / 2, y - 3); g.lineTo(x + w / 2, y - 3); g.quadraticCurveTo(x, y + 6 + ab * 20, x - w / 2, y - 3); g.closePath(); fill(g, '#4a1a20', 4.5); return; }
    if (f === 'abajo') { g.beginPath(); g.moveTo(x - w / 2, y + 5); g.quadraticCurveTo(x, y - 8, x + w / 2, y + 5); g.stroke(); return; }
    if (f === 'abajo_abierta') { g.beginPath(); g.moveTo(x - w / 2, y + 8); g.quadraticCurveTo(x, y - 6 - ab * 8, x + w / 2, y + 8); g.closePath(); fill(g, '#4a1a20', 4.5); return; }
    if (f === 'dientes') { rr(g, x - w * 0.55, y - 7, w * 1.1, 15, 6); fill(g, '#fff', 4); g.beginPath(); for (const k of [-0.2, 0.2]) { g.moveTo(x + w * k, y - 7); g.lineTo(x + w * k, y + 8); } g.moveTo(x - w * 0.55, y); g.lineTo(x + w * 0.55, y); g.lineWidth = 2.5; g.stroke(); return; }
    if (f === 'grito') {
      const bw = w * (0.72 + ab * 0.22), bh = w * (0.5 + ab * 0.55);
      g.save(); g.beginPath(); g.ellipse(x, y + bh * 0.45, bw, bh, 0, 0, TAU); g.fillStyle = '#4a1a20'; g.fill(); g.clip();
      g.fillStyle = '#fff'; g.fillRect(x - bw, y + bh * 0.45 - bh, bw * 2, bh * 0.34);
      g.beginPath(); g.ellipse(x, y + bh * 1.35, bw * 0.75, bh * 0.5, 0, 0, TAU); g.fillStyle = '#d96b72'; g.fill(); g.restore();
      g.beginPath(); g.ellipse(x, y + bh * 0.45, bw, bh, 0, 0, TAU); g.lineWidth = 4.5; g.strokeStyle = L; g.stroke(); return;
    }
    g.beginPath(); g.ellipse(x, y + 3, w * (0.16 + ab * 0.1), w * (0.18 + ab * 0.22), 0, 0, TAU); fill(g, '#4a1a20', 4.5);
  };
  const cabeza = (g, cen, ang, c, e, mira, d) => {
    const r = R0, t = e.t || 0;
    g.save(); g.translate(cen[0], cen[1]); g.rotate(ang * R);
    peloAtras(g, r, d, t);
    g.beginPath(); g.ellipse(0, 0, r, r * 0.95, 0, 0, TAU); fill(g, piel);
    const mx = mira[0] * r * 0.16, my = (mira[1] || 0) * r * 0.07;
    const per = 2.8 + (semilla % 7) * 0.4, ph = (t + semilla * 0.37) % per, bl = e.sinParpadeo ? 0 : (ph < 0.13 ? Math.sin(ph / 0.13 * Math.PI) : 0);
    const oh = c.ojoH * (1 - bl);
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * 0.55 + mx * 0.6, r * 0.35 + my, r * 0.13, r * 0.08, 0, 0, TAU); g.fillStyle = `rgba(230,120,120,${c.rubor})`; g.fill(); }
    if (c.sucio) { g.save(); g.globalAlpha = c.sucio; g.fillStyle = '#6b4a2f'; for (const [x, y, q] of [[-r * 0.45, r * 0.5, 6], [r * 0.62, r * 0.12, 4.5], [-r * 0.18, -r * 0.48, 5]]) { g.beginPath(); g.arc(x, y, q, 0, TAU); g.fill(); } g.restore(); }
    const ex = r * 0.3, ey = r * 0.06 + my, erx = r * 0.1 * (cu.ojos || 1), ery = r * 0.14 * (cu.ojos || 1), pl = C.clamp(c.plato || 0);
    for (const s of [-1, 1]) {
      const x = s * ex + mx;
      if (oh < 0.08) { g.beginPath(); if (c.boca === 'dientes') { g.moveTo(x - s * erx * 1.3, ey - ery * 0.5); g.lineTo(x + s * erx * 0.9, ey); g.lineTo(x - s * erx * 1.3, ey + ery * 0.5); } else { g.moveTo(x - erx * 1.1, ey); g.quadraticCurveTo(x, ey + ery * 0.55, x + erx * 1.1, ey); } g.lineWidth = 4; g.strokeStyle = L; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
      else {
        if (pl > 0.02) { g.beginPath(); g.ellipse(x, ey, erx * (1 + pl * 1.05), ery * oh * (1 + pl * 0.75), 0, 0, TAU); fill(g, '#fff', 3.5); }
        const k = 1 - pl * 0.42, px = x + mira[0] * erx * (0.35 + pl * 0.7), py = ey + (mira[1] || 0) * ery * (0.3 + pl * 0.6);
        g.beginPath(); g.ellipse(px, py, erx * k, ery * oh * k, 0, 0, TAU); g.fillStyle = L; g.fill();
        g.beginPath(); g.arc(px + erx * 0.35 * k, py - ery * 0.35 * oh * k, erx * 0.32 * k, 0, TAU); g.fillStyle = '#fff'; g.fill();
      }
      const cj = (s < 0 ? c.cejI : c.cejD) ?? c.cej, y1 = ey - ery * (1.55 + pl * 0.75) - c.cejY, lev = Math.sin(cj * R) * erx * 1.6, inn = -s;
      g.beginPath(); g.moveTo(x - inn * erx * 1.2, y1 + lev * 0.25); g.lineTo(x + inn * erx * 1.2, y1 - lev); g.lineWidth = 4.5; g.strokeStyle = L; g.lineCap = 'round'; g.stroke();
    }
    if (e.lentes) { g.lineWidth = 3.5; g.strokeStyle = L; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * ex + mx, ey, erx * 2.3, 0, TAU); g.fillStyle = 'rgba(220,240,255,0.18)'; g.fill(); g.stroke(); } g.beginPath(); g.moveTo(-ex + mx + erx * 2.3, ey); g.lineTo(ex + mx - erx * 2.3, ey); g.stroke(); }
    boca(g, mx * 0.8, r * 0.5 + my, c, r * 0.32, e.habla || 0);
    peloFrente(g, r, mx, d);
    g.restore();
  };
  const torso = (g, ox, hs, fa) => {
    const w = 34 * ancho, wb = (vestido ? 56 : 40) * ancho, yb = vestido ? -88 : -96, f = fa || [0, 0], en = Math.abs(f[1]) * 0.25;
    if (!vestido && abajo.tipo === 'falda') { g.beginPath(); g.moveTo(-36 * ancho, -104); g.lineTo(36 * ancho, -104); g.lineTo(48 * ancho, -62); g.lineTo(-48 * ancho, -62); g.closePath(); fill(g, abajo.color); }
    g.beginPath(); g.moveTo(-w + ox, -222 - hs); g.quadraticCurveTo(ox, -238 - hs, w + ox, -222 - hs);
    g.lineTo(wb + en + f[0], yb + f[1]); g.quadraticCurveTo(f[0] * 0.5, yb + 10 + f[1] * 0.4, -wb - en + f[0], yb + f[1] * 0.8); g.closePath(); fill(g, arriba.color);
    if (arriba.tipo === 'camisa' || arriba.tipo === 'saco') { g.beginPath(); g.moveTo(-12 + ox, -232 - hs); g.lineTo(ox, -212 - hs); g.lineTo(12 + ox, -232 - hs); g.moveTo(ox, -212 - hs); g.lineTo(ox * 0.2, yb + 4); g.lineWidth = 3; g.stroke(); }
    if (vestido) { g.beginPath(); g.moveTo(-w * 0.9 + ox * 0.6, -150); g.quadraticCurveTo(ox * 0.6, -140, w * 0.9 + ox * 0.6, -150); g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.stroke(); }
  };
  return {
    rec, esc, R0,
    dibujar(g, e) {
      const t = e.t || 0, p = { tor: 0, cab: 0, bi: [10, 6], bd: [10, 6], pi: [4, 0], pd: [4, 0], ...(e.pose || {}) };
      const c = C.cara2(e.cara || 'neutral'), k = esc * (e.escala ?? 1), mira = Array.isArray(e.mira) ? e.mira : [e.mira || 0, 0];
      const resp = Math.sin(t * TAU / 3.4 + semilla) * 1.6, hs = (p.hombros || 0);
      g.save(); g.translate(e.x, e.y);
      if (e.sombra) { g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 70 * k, 70 * k, 0, 0, TAU); g.fillStyle = 'rgba(15,10,20,0.22)'; g.fill(); g.restore(); }
      g.scale(k, k); g.translate(p.dx || 0, (p.suelo ? 92 : 0) + (p.dy || 0));
      const cad = [0, -100], desc = e.descalzo ?? pies.descalzo, ox = Math.sin((p.tor || 0) * R) * 112;
      pierna(g, [cad[0] - 18 * ancho, cad[1]], p.pi, -1, p, desc === 'i' || desc === 'ambos'); pierna(g, [cad[0] + 18 * ancho, cad[1]], p.pd, 1, p, desc === 'd' || desc === 'ambos');
      const hy = -212 - hs + resp * 0.5, hi = [-33 * ancho - 2 + ox, hy], hd = [33 * ancho + 2 + ox, hy];
      torso(g, ox, hs * 0.6, e.falda);
      const cuello = [ox * 1.08, -232 - hs * 0.45 + resp * 0.3], ca = (p.tor || 0) + (p.cab || 0);
      const cen = [cuello[0] + Math.sin(ca * R) * R0 * 0.85 + (p.cabDx || 0), cuello[1] - R0 * 0.82 + (p.cabDy || 0)];
      const atras = e.brazosAtras;
      if (atras) { brazo(g, hi, p.bi, -1, e.manoI); brazo(g, hd, p.bd, 1, e.manoD); }
      cabeza(g, cen, ca, c, e, mira, e.pelo || [0, 0]);
      if (!atras) { brazo(g, hi, p.bi, -1, e.manoI); brazo(g, hd, p.bd, 1, e.manoD); }
      g.restore();
    }
  };
};
})();
