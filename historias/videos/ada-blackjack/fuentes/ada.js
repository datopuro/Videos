const TAU = Math.PI * 2, RAD = Math.PI / 180, W = C.W, H = C.H;
const pista = C.pista, sv = C.suave, cl = C.clamp, lerp = C.lerp;
const ven = (t, a, b, d = 0.4) => cl((t - a) / d) * (1 - cl((t - (b - d)) / d));
const reset = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.globalCompositeOperation = 'source-over'; g.setLineDash([]); };
const LINEA = C.LINEA;
const capa = (cam, prof, fn) => { g.save(); C.camara(g, cam, prof); fn(); g.restore(); };
const cam0 = (x, y, z) => C.encuadre(x, y, z);
const mov = (t, a, b, c1, c2) => C.camLerp(c1, c2, sv((t - a) / (b - a)));
function trazo(col, lw = 5) { g.fillStyle = col; g.fill(); g.lineWidth = lw; g.strokeStyle = LINEA; g.lineJoin = 'round'; g.stroke(); }
function rr(x, y, w, h, r) { C.rr(g, x, y, w, h, r); }

const R = {
  ada: { id: 'ada', cuerpo: { complexion: 'delgada', estatura: 0.93 }, piel: '#c89b76', pelo: { estilo: 'largo', color: '#241a16' }, ropa: { arriba: { tipo: 'chamarra', color: '#6f7f96' }, abajo: { tipo: 'falda', color: '#3b3642' }, pies: { color: '#3a2c25' } } },
  adaI: { id: 'ada_isla', cuerpo: { complexion: 'delgada', estatura: 0.93 }, piel: '#c89b76', pelo: { estilo: 'coleta', color: '#241a16' }, ropa: { arriba: { tipo: 'chamarra', color: '#b07a45' }, abajo: { tipo: 'pantalon', color: '#4a3d36' }, pies: { color: '#5a4030' } } },
  bennett: { id: 'bennett', cuerpo: { complexion: 'delgado', edad: 'nino', cabeza: 1.15 }, piel: '#cfa27d', pelo: { estilo: 'corto', color: '#1d1512' }, ropa: { arriba: { tipo: 'playera', color: '#6c8f5a' }, abajo: { tipo: 'pantalon', color: '#3b3a45' }, pies: { color: '#3a2c25' } } },
  stef: { id: 'stefansson', cuerpo: { complexion: 'medio', estatura: 1.05 }, piel: '#efcfb4', pelo: { estilo: 'corto', color: '#8a7f72' }, ropa: { arriba: { tipo: 'saco', color: '#7a7468' }, abajo: { tipo: 'pantalon', color: '#2b2d36' }, pies: { color: '#2a2220' } } },
  knight: { id: 'knight', cuerpo: { complexion: 'robusto', estatura: 1.1 }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#4a3626' }, ropa: { arriba: { tipo: 'chamarra', color: '#566b5a' }, abajo: { tipo: 'pantalon', color: '#3d3a33' }, pies: { color: '#2e2620' } } },
  crawford: { id: 'crawford', cuerpo: { complexion: 'delgado', estatura: 1.0 }, piel: '#f1d4ba', pelo: { estilo: 'corto', color: '#1f1a17' }, ropa: { arriba: { tipo: 'chamarra', color: '#2f7f86' }, abajo: { tipo: 'pantalon', color: '#2d3142' }, pies: { color: '#2e2620' } } },
  maurer: { id: 'maurer', cuerpo: { complexion: 'medio', estatura: 1.02 }, piel: '#efcfb4', pelo: { estilo: 'corto', color: '#b9955c' }, ropa: { arriba: { tipo: 'chamarra', color: '#a04f2a' }, abajo: { tipo: 'pantalon', color: '#34302a' }, pies: { color: '#2e2620' } } },
  galle: { id: 'galle', cuerpo: { complexion: 'delgado', estatura: 0.96 }, piel: '#f3d8c0', pelo: { estilo: 'corto', color: '#d8b87a' }, ropa: { arriba: { tipo: 'chamarra', color: '#6a8fc2' }, abajo: { tipo: 'pantalon', color: '#2f3440' }, pies: { color: '#2e2620' } } },
  noice: { id: 'noice', cuerpo: { complexion: 'medio', estatura: 1.04 }, piel: '#efcfb4', pelo: { estilo: 'corto', color: '#5a4636' }, ropa: { arriba: { tipo: 'chamarra', color: '#27405f' }, abajo: { tipo: 'pantalon', color: '#2b2d36' }, pies: { color: '#2a2220' } } }
};
const P = {}; for (const k in R) P[k] = C.personaje2(R[k]);
const MUCH = ['crawford', 'knight', 'maurer', 'galle'];

const L_CALIDA = { tinte: 'rgba(120,70,40,0.18)', borde: 'rgba(255,214,150,0.95)', off: [8, -3], bordeK: 0.6 };
const L_FRIA = { tinte: 'rgba(60,80,140,0.22)', borde: 'rgba(225,235,255,0.85)', off: [-6, -3], bordeK: 0.5 };
const L_ROSA = { tinte: 'rgba(120,70,110,0.15)', borde: 'rgba(255,215,225,0.95)', off: [7, -3], bordeK: 0.55 };
const L_AURORA = { tinte: 'rgba(40,60,110,0.38)', borde: 'rgba(170,255,220,0.8)', off: [-5, -4], bordeK: 0.55 };
const dib = (p, e, luz = L_CALIDA) => C.iluminar(g, gg => P[p].dibujar(gg, e), luz);
const cara = (base, o = {}) => ({ ...C.cara2(base), ...o });
const CERR = c => { const k = C.cara2(c); if (['o', 'grito', 'dientes', 'abajo_abierta'].includes(k.boca)) k.boca = 'abajo'; k.ab = 0; return k; };

function cielo(stops, y0 = 0, y1 = H) { reset(); const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([p, c]) => gr.addColorStop(p, c)); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function estrellas(t, k = 1, n = 140, ymax = 650) { if (k <= 0) return; reset(); for (let i = 0; i < n; i++) { const x = C.hash(i) * W, y = C.hash(i * 7) * ymax, tw = 0.5 + 0.5 * Math.sin(t * (1 + C.hash(i * 3) * 2) + i); g.globalAlpha = k * (0.25 + 0.6 * tw) * (0.4 + C.hash(i * 5) * 0.6); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 1 + C.hash(i * 11) * 1.8, 0, TAU); g.fill(); } g.globalAlpha = 1; }
function aurora(t, k = 1, y0 = 120) {
  if (k <= 0) return; reset(); g.save(); g.globalCompositeOperation = 'screen';
  for (let b = 0; b < 3; b++) {
    const base = y0 + b * 70, col = [[90, 255, 180], [150, 255, 210], [255, 140, 200]][b];
    for (let i = 0; i < 70; i++) {
      const x = -100 + i * 32, ph = t * 0.25 + i * 0.07 + b * 2;
      const y = base + Math.sin(ph) * 60 + Math.sin(ph * 0.43 + 1) * 40, h = 220 + 120 * Math.sin(ph * 0.7 + b);
      const gr = g.createLinearGradient(0, y - h, 0, y + 20); gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.7, `rgba(${col},${0.10 * k * (b === 2 ? 0.6 : 1)})`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fillRect(x, y - h, 34, h + 20);
    }
  }
  g.restore();
}
function nieve(t, k = 1, n = 120, viento = 30) { if (k <= 0) return; reset(); g.fillStyle = '#fff'; for (let i = 0; i < n; i++) { const s = 1 + C.hash(i) * 3.5, vel = 30 + s * 22, x = ((C.hash(i * 3) * (W + 200) + t * viento + Math.sin(t * 0.8 + i) * 30) % (W + 200)) - 100, y = ((C.hash(i * 5) * (H + 100) + t * vel) % (H + 100)) - 50; g.globalAlpha = k * (0.35 + 0.5 * C.hash(i * 7)); g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); } g.globalAlpha = 1; }
function bokeh(t, k = 1, col = '255,210,150', n = 16) { if (k <= 0) return; reset(); g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < n; i++) { const x = (C.hash(i) * W + Math.sin(t * 0.2 + i) * 40), y = C.hash(i * 9) * H + Math.cos(t * 0.17 + i) * 30, r = 20 + C.hash(i * 4) * 50; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${0.14 * k})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } g.restore(); }
function brillo(x, y, r, col = '255,200,120', k = 1) { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${0.55 * k})`); gr.addColorStop(0.4, `rgba(${col},${0.18 * k})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
function grad(c1, c2, k) { C.gradacion(g, c1, c2, k); }
function vapor(x, y, t, k = 1) { for (let i = 0; i < 3; i++) { const q = ((t * 0.5 + i / 3) % 1); g.save(); g.globalAlpha = k * 0.3 * (1 - q); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + q * 40, y - q * 50, 8 + q * 22, 0, TAU); g.fill(); g.restore(); } }
function lagrimas(x, y, s, t, k = 1) { if (k <= 0) return; for (const sx of [-1, 1]) { const q = (t * 0.6 + (sx > 0 ? 0.5 : 0)) % 1; g.save(); g.globalAlpha = k * (1 - q * 0.6); g.fillStyle = '#9fd3ff'; g.strokeStyle = 'rgba(40,80,130,0.6)'; g.lineWidth = 2; g.beginPath(); const lx = x + sx * 26 * s, ly = y + q * 50 * s; g.moveTo(lx, ly - 9 * s); g.quadraticCurveTo(lx + 7 * s, ly + 2 * s, lx, ly + 7 * s); g.quadraticCurveTo(lx - 7 * s, ly + 2 * s, lx, ly - 9 * s); g.fill(); g.stroke(); g.restore(); } }
const cabeza = (x, y, esc, est = 0.93) => [x, y - 300 * esc * est];

function lugar(txt, sub, a) {
  if (a <= 0) return; reset(); g.save(); g.globalAlpha = a; const u = C.salida(a);
  g.fillStyle = 'rgba(20,16,30,0.38)'; rr(70, 70, 620, sub ? 128 : 84, 14); g.fill();
  g.font = 'italic 600 46px Lora'; g.fillStyle = '#fff6ea'; g.textBaseline = 'middle'; g.fillText(txt, 100, 112);
  g.fillStyle = '#f3b7c6'; g.fillRect(100, 140, 90 * u, 3);
  if (sub) { g.font = '500 28px Inter'; g.fillStyle = '#e8dff0'; g.fillText(sub, 100, 172); }
  g.restore();
}
function titular(txt, a, y = 470, tam = 96, col = '#fff6ea', fuente = 'italic 600') { if (a <= 0) return; reset(); g.save(); g.globalAlpha = a; g.font = `${fuente} ${tam}px Lora`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 24; g.fillStyle = col; g.fillText(txt, W / 2, y + (1 - C.salida(a)) * 20); g.restore(); }
function fundido(k, col = '#000') { if (k <= 0) return; reset(); g.globalAlpha = cl(k); g.fillStyle = col; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
function vineta(k = 0.4) { C.vineta(g, k); }
function subB(t) {
  let s = null, a = 0; for (const [i0, i1, tx] of SUBS) if (t >= i0 && t < i1) { s = tx; a = C.ventana(t, i0, i1 - 0.05, 0.12); break; }
  if (!s || a <= 0) return; reset(); g.save(); g.globalAlpha = a; g.font = '600 46px Inter';
  const pal = s.split(' '), ls = ['']; for (const w of pal) { const p = ls[ls.length - 1] ? ls[ls.length - 1] + ' ' + w : w; if (g.measureText(p).width > 1300 && ls[ls.length - 1]) ls.push(w); else ls[ls.length - 1] = p; }
  const lh = 58, h = ls.length * lh + 26, y0 = 1040 - h, mw = Math.max(...ls.map(l => g.measureText(l).width)) + 56;
  g.fillStyle = 'rgba(18,14,28,0.5)'; rr(W / 2 - mw / 2, y0, mw, h, 20); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 8;
  ls.forEach((l, i) => { g.fillStyle = '#fffaf2'; g.fillText(l, W / 2, y0 + 13 + lh / 2 + i * lh); });
  g.restore();
}

function papel(x, y, w, h, ang = 0, rot = '#f6ecd6') {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 30; g.shadowOffsetY = 12; g.fillStyle = rot; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(120,140,190,0.35)'; g.lineWidth = 2; for (let yy = -h / 2 + 80; yy < h / 2 - 20; yy += 54) { g.beginPath(); g.moveTo(-w / 2 + 30, yy); g.lineTo(w / 2 - 30, yy); g.stroke(); }
  g.strokeStyle = 'rgba(220,120,130,0.4)'; g.beginPath(); g.moveTo(-w / 2 + 80, -h / 2); g.lineTo(-w / 2 + 80, h / 2); g.stroke();
  const gr = g.createRadialGradient(0, 0, w * 0.2, 0, 0, w * 0.8); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(150,110,60,0.25)'); g.fillStyle = gr; g.fillRect(-w / 2, -h / 2, w, h);
  g.restore();
}
function escribir(txt, x, y, u, tam = 54, col = '#3a2c5a', ang = 0, fuente = 'italic 500') { const n = Math.floor(txt.length * cl(u)); if (n <= 0) return; g.save(); g.translate(x, y); g.rotate(ang); g.font = `${fuente} ${tam}px Lora`; g.fillStyle = col; g.textBaseline = 'middle'; g.fillText(txt.slice(0, n), 0, 0); g.restore(); }
function tachar(x, y, w, u, col = '#3a2c5a') { if (u <= 0) return; g.save(); g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * cl(u), y - 4); g.stroke(); g.restore(); }
function lapiz(x, y, ang = -0.6) { g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(0, 0); g.lineTo(20, -10); g.lineTo(200, -10); g.lineTo(200, 10); g.lineTo(20, 10); g.closePath(); trazo('#f2c14e', 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(20, -10); g.lineTo(20, 10); g.closePath(); trazo('#f3dcb4', 3); g.fillStyle = LINEA; g.beginPath(); g.arc(3, 0, 3, 0, TAU); g.fill(); g.beginPath(); g.rect(200, -10, 26, 20); trazo('#e98a9a', 3); g.restore(); }

function farol(x, y, s, t, k = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(0, -120); g.lineTo(0, -95); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke();
  g.beginPath(); g.arc(0, -120, 14, Math.PI, TAU); g.stroke();
  rr(-30, -95, 60, 16, 4); trazo('#5a4632', 4);
  g.beginPath(); g.moveTo(-26, -79); g.lineTo(26, -79); g.lineTo(30, -10); g.lineTo(-30, -10); g.closePath(); g.fillStyle = `rgba(255,${200 + 20 * Math.sin(t * 9)},120,${0.9 * k})`; g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke();
  g.beginPath(); g.ellipse(0, -40, 6, 14 + Math.sin(t * 11) * 2, 0, 0, TAU); g.fillStyle = '#fff6d0'; g.fill();
  rr(-34, -12, 68, 14, 4); trazo('#5a4632', 4);
  g.restore();
  brillo(x, y - 45 * s, 520 * s * k, '255,190,110', k);
}
function carpaInt(t, cam, luz = 1, frio = 0) {
  cielo([[0, '#2a1d24'], [1, '#1a1218']]);
  capa(cam, 1, () => {
    g.beginPath(); g.moveTo(-400, 1100); g.lineTo(560, 80); g.lineTo(1360, 80); g.lineTo(2320, 1100); g.closePath();
    const gr = g.createLinearGradient(0, 80, 0, 1100); gr.addColorStop(0, frio ? '#5b5f78' : '#a07a5c'); gr.addColorStop(1, frio ? '#3a3c52' : '#6e4f3c'); g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(40,25,20,0.35)'; g.lineWidth = 4; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(560 + i * 100, 80); g.lineTo(-400 + i * 340, 1100); g.stroke(); }
    g.beginPath(); g.moveTo(560, 80); g.lineTo(1360, 80); g.lineWidth = 12; g.strokeStyle = '#4a3324'; g.stroke();
    g.fillStyle = frio ? '#2e2c3a' : '#4a3628'; g.fillRect(-1000, 900, 4000, 900);
    g.fillStyle = frio ? 'rgba(200,210,240,0.12)' : 'rgba(255,220,170,0.08)'; for (let i = 0; i < 12; i++) g.fillRect(-400 + i * 230, 900, 120, 900);
  });
}
function cajas(x, y, s, n = 3, cols = ['#9a7350', '#8a6646', '#a8835c']) { g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < n; i++) { const cx = (i % 2) * 70 - 40 + (i > 1 ? 30 : 0), cy = -Math.floor(i / 2) * 110; g.beginPath(); g.rect(cx - 70, cy - 110, 140, 110); trazo(cols[i % 3], 4); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 70, cy - 55); g.lineTo(cx + 70, cy - 55); g.stroke(); } g.restore(); }
function bulto(x, y, s, t, respira = 1) { g.save(); g.translate(x, y); g.scale(s, s); const r = 1 + Math.sin(t * 1.3) * 0.03 * respira; g.beginPath(); g.moveTo(-260, 0); g.bezierCurveTo(-250, -90 * r, -120, -120 * r, 0, -110 * r); g.bezierCurveTo(130, -100 * r, 220, -130 * r, 270, -50); g.lineTo(280, 0); g.closePath(); trazo('#7a8c8a'); g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 3; for (const k of [-150, -40, 80, 190]) { g.beginPath(); g.moveTo(k, -100 * r); g.quadraticCurveTo(k + 20, -50, k - 10, 0); g.stroke(); } g.fillStyle = 'rgba(200,120,110,0.5)'; for (const k of [-200, 0, 200]) g.fillRect(k - 10, -95 * r, 20, 90); g.restore(); }

function casa(x, y, w, h, col, techo, t, ventanas = 2) { g.save(); g.translate(x, y); g.beginPath(); g.rect(-w / 2, -h, w, h); trazo(col); g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 3; for (let yy = -h + 20; yy < 0; yy += 24) { g.beginPath(); g.moveTo(-w / 2, yy); g.lineTo(w / 2, yy); g.stroke(); }
  g.beginPath(); g.moveTo(-w / 2 - 24, -h); g.lineTo(0, -h - w * 0.42); g.lineTo(w / 2 + 24, -h); g.closePath(); trazo(techo);
  g.beginPath(); g.moveTo(-w / 2 - 24, -h); g.lineTo(0, -h - w * 0.42); g.lineTo(w / 2 + 24, -h); g.lineTo(w / 2 + 10, -h + 10); g.lineTo(0, -h - w * 0.42 + 18); g.lineTo(-w / 2 - 10, -h + 10); g.closePath(); g.fillStyle = '#fbf7ff'; g.fill();
  for (let i = 0; i < ventanas; i++) { const vx = -w / 2 + (i + 0.5) * w / ventanas; g.beginPath(); g.rect(vx - 22, -h * 0.68, 44, 50); trazo('#ffd98a', 4); brillo(vx, -h * 0.68 + 25, 90, '255,200,120', 0.8); g.strokeStyle = LINEA; g.lineWidth = 3; g.beginPath(); g.moveTo(vx, -h * 0.68); g.lineTo(vx, -h * 0.68 + 50); g.moveTo(vx - 22, -h * 0.68 + 25); g.lineTo(vx + 22, -h * 0.68 + 25); g.stroke(); }
  g.restore(); }
function suelo(y, col1, col2) { g.beginPath(); g.rect(-3000, y, 9000, 2000); const gr = g.createLinearGradient(0, y, 0, y + 400); gr.addColorStop(0, col1); gr.addColorStop(1, col2); g.fillStyle = gr; g.fill(); }
function montes(y, alto, col, s = 1, x0 = -2000, x1 = 4000) { g.beginPath(); g.moveTo(x0, y); for (let x = x0; x <= x1; x += 40) g.lineTo(x, y - alto * (0.5 + 0.5 * Math.sin(x * 0.0021 * s + s) * Math.sin(x * 0.0007 * s + 2))); g.lineTo(x1, y); g.closePath(); g.fillStyle = col; g.fill(); }
function mar(y, c1, c2, t, x0 = -3000, x1 = 6000) { g.beginPath(); g.rect(x0, y, x1 - x0, 2000); const gr = g.createLinearGradient(0, y, 0, y + 500); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 3; for (let i = 0; i < 40; i++) { const yy = y + 10 + C.hash(i) * 420, xx = x0 + ((C.hash(i * 3) * (x1 - x0) + t * 12) % (x1 - x0)), w = 30 + (yy - y) * 0.3; g.globalAlpha = 0.25 + 0.4 * Math.abs(Math.sin(t + i)); g.beginPath(); g.moveTo(xx - w, yy); g.lineTo(xx + w, yy); g.stroke(); } g.globalAlpha = 1; }
function barco(x, y, s, t, col = '#3a3340') {
  g.save(); g.translate(x, y + Math.sin(t * 1.2) * 4 * s); g.rotate(Math.sin(t * 0.9) * 0.015); g.scale(s, s);
  g.beginPath(); g.moveTo(-320, -40); g.lineTo(330, -40); g.quadraticCurveTo(300, 30, 240, 40); g.lineTo(-260, 40); g.quadraticCurveTo(-310, 20, -320, -40); g.closePath(); trazo(col);
  g.fillStyle = '#c95c6a'; g.fillRect(-300, -20, 610, 12);
  for (const mx of [-120, 110]) { g.beginPath(); g.moveTo(mx, -40); g.lineTo(mx, -420); g.lineWidth = 9; g.strokeStyle = LINEA; g.stroke(); g.beginPath(); g.moveTo(mx + 6, -400); g.quadraticCurveTo(mx + 150, -250, mx + 10, -70); g.closePath(); trazo('#f5efe4', 4); }
  g.beginPath(); g.moveTo(-40, -110); g.lineTo(-40, -40); g.lineTo(40, -40); g.lineTo(40, -110); g.closePath(); trazo('#6a5446', 4);
  g.beginPath(); g.moveTo(-14, -112); g.lineTo(-14, -160); g.lineTo(10, -160); g.lineTo(10, -112); trazo('#3a3340', 4);
  g.restore();
}
function reflejo(x, y, w, col = '255,210,170', k = 1) { g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < 14; i++) { g.globalAlpha = k * (0.4 - i * 0.025); g.fillStyle = `rgb(${col})`; const ww = w * (1 - i * 0.05); g.fillRect(x - ww / 2 + Math.sin(i * 1.7) * 20, y + i * 14, ww, 4); } g.restore(); }
function sol(x, y, r, col1 = '255,236,200', col2 = '255,170,150') { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 0, x, y, r * 6); gr.addColorStop(0, `rgba(${col1},0.9)`); gr.addColorStop(0.12, `rgba(${col1},0.6)`); gr.addColorStop(0.35, `rgba(${col2},0.2)`); gr.addColorStop(1, `rgba(${col2},0)`); g.fillStyle = gr; g.fillRect(x - r * 6, y - r * 6, r * 12, r * 12); g.restore(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = `rgb(${col1})`; g.fill(); }
function hielos(y, t, n = 14, col = '#eaf2fb', sem = 1) { for (let i = 0; i < n; i++) { const h = C.hash(i * 7 + sem), x = -600 + C.hash(i + sem) * 3200 + Math.sin(t * 0.1 + i) * 10, yy = y + h * 300, s = 0.4 + (yy - y) / 300; g.save(); g.translate(x, yy); g.scale(s, s * 0.5); g.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, r = 80 + C.hash(i * 13 + k) * 60; k ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(120,150,190,0.6)'; g.lineWidth = 4; g.stroke(); g.restore(); } }
function carpa(x, y, s, col = '#e9dcc4', luz = 0) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-180, 0); g.lineTo(-40, -230); g.lineTo(40, -230); g.lineTo(180, 0); g.closePath(); trazo(col); g.beginPath(); g.moveTo(-40, -230); g.lineTo(-90, 0); g.strokeStyle = 'rgba(0,0,0,0.15)'; g.lineWidth = 4; g.stroke(); g.beginPath(); g.moveTo(-40, 0); g.lineTo(0, -120); g.lineTo(40, 0); g.closePath(); g.fillStyle = luz ? `rgba(255,190,110,${0.9})` : '#4a3a30'; g.fill(); g.lineWidth = 4; g.strokeStyle = LINEA; g.stroke(); g.restore(); if (luz) brillo(x, y - 40 * s, 260 * s, '255,180,100', luz); }
function bandera(x, y, s, t, alto = 520) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -alto); g.lineWidth = 10; g.strokeStyle = LINEA; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#d8cbb4'; g.stroke();
  g.translate(0, -alto + 10); const fw = 230, fh = 140;
  const onda = (u, v) => [u * fw, v * fh + Math.sin(u * 5 - t * 4) * 10 * u];
  const poly = pts => { g.beginPath(); pts.forEach(([u, v], i) => { const [px, py] = onda(u, v); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath(); };
  const quad = (u0, v0, u1, v1, col) => { const pts = []; for (let i = 0; i <= 8; i++) pts.push([lerp(u0, u1, i / 8), v0]); for (let i = 8; i >= 0; i--) pts.push([lerp(u0, u1, i / 8), v1]); poly(pts); g.fillStyle = col; g.fill(); };
  quad(0, 0, 1, 1, '#1f3f7a');
  g.save(); poly((() => { const p = []; for (let i = 0; i <= 8; i++) p.push([i / 8, 0]); for (let i = 8; i >= 0; i--) p.push([i / 8, 1]); return p; })()); g.clip();
  const lineaO = (u0, v0, u1, v1, w, col) => { g.beginPath(); for (let i = 0; i <= 10; i++) { const [px, py] = onda(lerp(u0, u1, i / 10), lerp(v0, v1, i / 10)); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.lineWidth = w; g.strokeStyle = col; g.stroke(); };
  lineaO(0, 0, 1, 1, 30, '#fff'); lineaO(0, 1, 1, 0, 30, '#fff'); lineaO(0, 0, 1, 1, 10, '#c8303a'); lineaO(0, 1, 1, 0, 10, '#c8303a');
  lineaO(0.5, 0, 0.5, 1, 46, '#fff'); lineaO(0, 0.5, 1, 0.5, 46, '#fff'); lineaO(0.5, 0, 0.5, 1, 26, '#c8303a'); lineaO(0, 0.5, 1, 0.5, 26, '#c8303a');
  g.restore();
  poly((() => { const p = []; for (let i = 0; i <= 8; i++) p.push([i / 8, 0]); for (let i = 8; i >= 0; i--) p.push([i / 8, 1]); return p; })()); g.lineWidth = 4; g.strokeStyle = LINEA; g.stroke();
  g.restore();
}

function ada(t, x, y, esc, o = {}, luz) { return dib(o.isla === false ? 'ada' : 'adaI', { t, x, y, escala: esc, cara: CERR(o.cara || 'neutral'), mira: o.mira || [0, 0], pose: o.pose || {}, manoI: o.manoI, manoD: o.manoD, pelo: o.pelo || [C.ruido(t * 0.6, 3) * 5, 0] }, luz); }

function s01(t) {
  const fase = t < 8.7 ? 0 : t < 16 ? 1 : t < 25.7 ? 2 : 3;
  if (fase < 3) {
    let cam;
    if (t < 8.7) cam = mov(t, 0, 8.7, cam0(960, 520, 1.0), cam0(1000, 560, 1.12));
    else if (t < 16) cam = mov(t, 8.7, 16, cam0(1250, 760, 1.6), cam0(1220, 760, 1.75));
    else cam = mov(t, 16, 25.7, cam0(780, 560, 1.0), cam0(780, 560, 1.05));
    if (t < 16) {
      carpaInt(t, cam);
      capa(cam, 1, () => {
        cajas(400, 905, 1.0, 3); bulto(1290, 930, 1.0, t);
        ada(t, 880, 935, 1.1, { cara: cara('triste', { cej: 14, ojoH: 0.85 }), mira: [-0.3, 0.5], pose: { suelo: true, cab: 10 }, manoD: [-20, -150], manoI: [-60, -150] }, L_CALIDA);
        rr(760, 880, 160, 30, 6); trazo('#f6ecd6', 3);
        farol(640, 760, 1.1, t, 1);
        vapor(900, 560, t, 0.8);
      });
      nieve(t, 0.15, 30, 10); bokeh(t, 0.7);
      grad('rgb(255,226,190)', 'rgb(70,45,60)', 0.75);
      vineta(0.55);
    } else {
      reset(); cielo([[0, '#3a2a2a'], [1, '#1d1418']]);
      brillo(300, 200, 900, '255,190,110', 0.9);
      papel(960, 520, 1300, 820, -0.02);
      const n = [[16.0, '$1,200', 300, 360], [18.85, '$200 · mamá', 300, 470], [20.8, '$600', 300, 600], [22.1, '$100 · mamá', 300, 710]];
      n.forEach(([a, s, x, y]) => escribir(s, x + 300, y, (t - a) / 0.9, 66));
      tachar(600, 372, 230, (t - 20.6) / 0.4, '#c34a6a');
      escribir('el resto → para Bennett', 1050, 820, (t - 23.2) / 1.3, 58, '#b33b67');
      if (t > 23.4) { g.save(); g.globalAlpha = cl((t - 23.4) / 0.5) * 0.8; g.strokeStyle = '#e98aa5'; g.lineWidth = 5; g.beginPath(); g.ellipse(1300, 820, 330, 64, -0.02, 0, TAU); g.stroke(); g.restore(); }
      const act = n.filter(q => t > q[0]).pop(); const lx = t > 23.2 ? 1050 + Math.min(1, (t - 23.2) / 1.3) * 520 : act ? 600 + Math.min(1, (t - act[0]) / 0.9) * act[1].length * 32 : 600, ly = t > 23.2 ? 840 : act ? act[3] + 20 : 380;
      lapiz(lx + Math.sin(t * 22) * 4, ly + 10, -0.5);
      grad('rgb(255,236,210)', 'rgb(90,60,60)', 0.5); vineta(0.6);
    }
  } else {
    cielo([[0, '#0d1230'], [0.6, '#2a2450'], [1, '#433055']]);
    estrellas(t, 1); aurora(t, cl((t - 25.7) / 1.2));
    const cam = mov(t, 25.7, 32.3, cam0(960, 560, 1.0), cam0(960, 600, 1.08));
    capa(cam, 0.3, () => { montes(820, 220, '#2b2a4a', 1.3); });
    capa(cam, 1, () => { suelo(860, '#c9cfe8', '#8f93b8'); carpa(700, 900, 1.2, '#d9cdb8', 0.8); carpa(1240, 880, 0.9, '#cfc2ac', 0); });
    nieve(t, 0.4, 60, 15); vineta(0.5);
    titular('Ada Blackjack', ven(t, 25.9, 29.9, 0.6), 400, 120);
    titular('Y para entender qué hace ahí…', 0, 0);
    fundido(cl((t - 30.8) / 1.2), '#fff');
  }
  if (t < 4) { reset(); const a = ven(t, 0.2, 4, 0.5); g.save(); g.globalAlpha = a; g.font = '600 26px Inter'; g.fillStyle = 'rgba(20,16,30,0.5)'; rr(W / 2 - 520, 40, 1040, 64, 32); g.fill(); g.fillStyle = '#fff6ea'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RECONSTRUCCIÓN ANIMADA · Las citas son de sus diarios y cartas, traducidas', W / 2, 73); g.restore(); }
  fundido(1 - cl(t / 1.2));
}

function nome(t, cam, k = 1) {
  cielo([[0, '#f4c6c9'], [0.5, '#f7dccf'], [1, '#e7d6e8']]);
  sol(1500, 380, 50, '255,244,230', '255,190,190');
  capa(cam, 0.3, () => { montes(760, 200, '#cdbfdc', 1.1); montes(800, 140, '#b8a9cf', 2.1); });
  capa(cam, 0.6, () => { for (let i = 0; i < 6; i++) casa(-200 + i * 420, 830, 220, 160, ['#c98f86', '#8fa6c4', '#d6b47c', '#9bb59a'][i % 4], '#7a5f6e', t, 2); });
  capa(cam, 1, () => { suelo(900, '#f6f2fb', '#d4cde6'); for (let i = 0; i < 4; i++) casa(-100 + i * 760, 920, 360, 260, ['#b5717a', '#7f97b8', '#c9a46a', '#86a58a'][i % 4], '#5f4a5a', t, 3); g.strokeStyle = 'rgba(160,150,200,0.4)'; g.lineWidth = 6; for (let i = 0; i < 16; i++) { g.beginPath(); g.moveTo(-500 + i * 200, 1000 + (i % 3) * 20); g.lineTo(-420 + i * 200, 1000 + (i % 3) * 20); g.stroke(); } });
}
function s02(t) {
  if (t < 46.6) {
    const cam = mov(t, 32.2, 46.6, cam0(760, 560, 1.0), cam0(1160, 600, 1.12));
    nome(t, cam);
    const x = lerp(520, 1300, cl((t - 32.6) / 13)), ps = Math.sin(t * 1.4 * TAU);
    capa(cam, 1, () => {
      dib('bennett', { t, x: x + 110, y: 1000, escala: 1.0, cara: CERR(t > 40.4 ? cara('neutral', { cej: 8 }) : 'neutral'), mira: [-0.6, -0.4], pose: { dy: -Math.abs(ps) * 5, pi: [4 + Math.max(0, ps) * 10, -Math.max(0, ps) * 26], pd: [4 + Math.max(0, -ps) * 10, -Math.max(0, -ps) * 26] }, manoI: [-60, -160] }, L_ROSA);
      if (t > 40.4 && t < 44) for (let i = 0; i < 2; i++) { const q = ((t * 1.3 + i * 0.5) % 1); g.save(); g.globalAlpha = 0.5 * (1 - q); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(x + 150 + q * 30, 1000 - 310 - q * 30, 8 + q * 10, 0, TAU); g.stroke(); g.restore(); }
      ada(t, x, 1000, 1.15, { isla: false, cara: t > 38.6 ? cara('triste', { cej: 12 }) : 'neutral', mira: [0.6, 0.3], pose: { dy: -Math.abs(ps) * 6, pi: [4 + Math.max(0, ps) * 10, -Math.max(0, ps) * 26], pd: [4 + Math.max(0, -ps) * 10, -Math.max(0, -ps) * 26] }, manoD: [80, -170] }, L_ROSA);
    });
    nieve(t, 0.7, 120, 20); bokeh(t, 0.5, '255,220,210');
    grad('rgb(255,240,245)', 'rgb(140,120,160)', 0.35); vineta(0.4);
    lugar('Nome, Alaska', '1921 · dos años antes', ven(t, 32.6, 39, 0.5));
    fundido(1 - cl((t - 32.2) / 1.2), '#fff');
  } else {
    const cam = t < 50.9 ? mov(t, 46.6, 50.9, cam0(960, 560, 1.0), cam0(960, 560, 1.06)) : mov(t, 50.9, 53.6, cam0(760, 560, 1.4), cam0(760, 540, 1.55));
    cielo([[0, '#d9c4c9'], [1, '#b9a3b3']]);
    capa(cam, 1, () => {
      g.fillStyle = '#e8d9cf'; g.fillRect(-500, -500, 3000, 1400); g.fillStyle = '#c9b6aa'; g.fillRect(-500, 760, 3000, 30);
      g.fillStyle = '#9a8274'; g.fillRect(-500, 900, 3000, 900);
      g.beginPath(); g.rect(1160, 200, 360, 300); trazo('#d6ecff', 6); g.strokeStyle = LINEA; g.lineWidth = 5; g.beginPath(); g.moveTo(1340, 200); g.lineTo(1340, 500); g.moveTo(1160, 350); g.lineTo(1520, 350); g.stroke();
      for (const bx of [1200, 1560]) { rr(bx - 130, 800, 260, 60, 10); trazo('#f5f0ea', 4); rr(bx - 130, 770, 70, 50, 10); trazo('#fff', 4); g.beginPath(); g.rect(bx - 140, 860, 20, 60); g.rect(bx + 120, 860, 20, 60); trazo('#7a6050', 3); }
      g.beginPath(); g.rect(260, 300, 260, 600); trazo('#a07a5c'); g.beginPath(); g.arc(480, 620, 10, 0, TAU); g.fillStyle = '#e8c070'; g.fill();
      const ap = sv((t - 47.4) / 1.4);
      if (t < 50.9) {
        dib('bennett', { t, x: lerp(560, 1000, ap), y: 940, escala: 1.0, cara: CERR('triste'), mira: [-0.7, 0], pose: {} }, L_ROSA);
        ada(t, 640, 940, 1.15, { isla: false, cara: cara('triste', { cej: 24, ojoH: 0.7 }), mira: [0.7, 0.3], manoD: ap < 0.3 ? [90, -150] : null }, L_ROSA);
      } else { ada(t, 640, 940, 1.15, { isla: false, cara: cara('triste', { cej: 18, ojoH: 0.75 }), mira: [0.1, -0.3], manoD: [40, -180], manoI: [-40, -180] }, L_ROSA); }
    });
    brillo(1340, 350, 700, '255,230,220', 0.6);
    grad('rgb(255,240,240)', 'rgb(120,100,130)', 0.4); vineta(0.55);
    fundido(1 - cl((t - 46.6) / 0.4));
  }
}
function mapaArtico(t, cam, k) {
  capa(cam, 1, () => {
    g.save(); g.translate(1000, 420); rr(-520, -320, 1040, 640, 10); trazo('#efe2c4', 6);
    g.fillStyle = '#c4d8e4'; g.fillRect(-500, -300, 1000, 600);
    const costa = (x0, y0, x1, y1, lado, sem) => { g.beginPath(); g.moveTo(lado * 500, -300); g.lineTo(x0, y0); for (let i = 1; i <= 24; i++) { const u = i / 24; g.lineTo(lerp(x0, x1, u) + (C.hash(i + sem) - 0.5) * 50 + Math.sin(u * 9 + sem) * 30, lerp(y0, y1, u) + (C.hash(i * 3 + sem) - 0.5) * 30); } g.lineTo(lado * 500, y1); g.closePath(); g.fillStyle = '#e9dcbc'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#8a7a5a'; g.stroke(); };
    costa(-200, -300, -500, 180, -1, 3); costa(160, -300, 500, 80, 1, 9);
    g.beginPath(); g.ellipse(-20, -150, 70, 34, -0.2, 0, TAU); g.fillStyle = '#f2e7cd'; g.fill(); g.lineWidth = 4; g.stroke();
    g.font = 'italic 600 26px Lora'; g.fillStyle = '#5a4a3a'; g.textAlign = 'center'; g.fillText('Wrangel', -20, -95);
    g.fillText('Siberia', -380, -220); g.fillText('Alaska', 380, -220);
    const pin = (x, y, c, a) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y - 20 * (1 - C.rebote(a))); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -40); g.lineWidth = 4; g.strokeStyle = LINEA; g.stroke(); g.beginPath(); g.arc(0, -46, 14, 0, TAU); trazo(c, 3); g.restore(); };
    pin(-20, -150, '#e86a8a', cl((t - 58) / 0.4)); pin(-360, -140, '#c84040', cl((t - 62) / 0.4)); pin(330, 150, '#4a6ad0', cl((t - 70.7) / 0.4)); pin(380, 40, '#e8c040', cl((t - 71.4) / 0.4));
    if (t > 67.5) { const u = cl((t - 67.5) / 2.5); g.setLineDash([12, 10]); g.strokeStyle = '#b05a7a'; g.lineWidth = 4; g.beginPath(); g.moveTo(400, 200); g.quadraticCurveTo(200, -60, lerp(400, -20, u), lerp(200, -150, u)); g.stroke(); g.setLineDash([]);
      const px = lerp(400, -20, u), py = lerp(200, -150, u) - 30 * Math.sin(u * Math.PI); g.save(); g.translate(px, py); g.rotate(-2.4); g.fillStyle = '#fff'; g.strokeStyle = LINEA; g.lineWidth = 3; g.beginPath(); g.moveTo(30, 0); g.lineTo(-20, -8); g.lineTo(-30, -26); g.lineTo(-36, -26); g.lineTo(-30, -6); g.lineTo(-30, 6); g.lineTo(-36, 26); g.lineTo(-30, 26); g.lineTo(-20, 8); g.closePath(); g.fill(); g.stroke(); g.restore(); }
    g.restore();
  });
}
function oficina(t, cam) {
  cielo([[0, '#3a2a28'], [1, '#2a1e1c']]);
  capa(cam, 1, () => {
    g.fillStyle = '#7a5644'; g.fillRect(-600, -600, 3200, 1500); g.fillStyle = 'rgba(0,0,0,0.08)'; for (let x = -600; x < 2600; x += 90) g.fillRect(x, -600, 6, 1500);
    g.beginPath(); g.rect(1620, 150, 300, 420); trazo('#ffe9c4', 6); brillo(1770, 360, 800, '255,210,150', 0.8);
    g.fillStyle = '#5a3c2e'; g.fillRect(-600, 880, 3200, 800);
    rr(1260, 700, 520, 40, 6); trazo('#6a4430'); g.beginPath(); g.rect(1290, 740, 40, 160); g.rect(1710, 740, 40, 160); trazo('#5a3826', 4);
    g.beginPath(); g.ellipse(1500, 690, 60, 14, 0, 0, TAU); trazo('#e8e0d0', 3);
  });
}
function s03(t) {
  if (t < 75.4) {
    const cam = t < 64.2 ? mov(t, 53.6, 64.2, cam0(960, 520, 1.0), cam0(1000, 460, 1.2)) : mov(t, 64.2, 75.4, cam0(1100, 560, 1.0), cam0(1040, 520, 1.1));
    oficina(t, cam); mapaArtico(t, cam);
    capa(cam, 1, () => { dib('stef', { t, x: 1640, y: 920, escala: 1.12, cara: CERR('neutral'), mira: [-0.9, -0.3], pose: { cab: -4 }, manoI: t > 57.5 ? [-200, -330] : null }, L_CALIDA); });
    bokeh(t, 0.4); grad('rgb(255,232,200)', 'rgb(80,50,50)', 0.55); vineta(0.55);
    lugar('Vilhjalmur Stefansson', 'Explorador · organiza la expedición', ven(t, 64.4, 70.6, 0.5));
    if (t > 73.9) titular('Él no va a ir.', 0, 0);
    fundido(1 - cl((t - 53.6) / 0.8));
  } else if (t < 81.6) {
    const cam = mov(t, 75.4, 81.6, cam0(960, 600, 1.15), cam0(960, 600, 1.0));
    cielo([[0, '#cfd9ee'], [1, '#f2dfe6']]);
    capa(cam, 0.4, () => { montes(820, 160, '#b9c3dc', 1.4); });
    capa(cam, 1, () => { suelo(900, '#efe9f3', '#cfc6dc');
      MUCH.forEach((m, i) => { const a = cl((t - 75.6 - i * 0.35) / 0.4); if (a <= 0) return; g.save(); g.globalAlpha = a; dib(m, { t, x: 560 + i * 270, y: 960 + (1 - C.salida(a)) * 30, escala: 1.0, cara: 'neutral', mira: [0, 0.1], pose: { cab: (i - 1.5) * 3 } }, L_ROSA); g.restore(); });
    });
    nieve(t, 0.4, 60); vineta(0.4);
    fundido(1 - cl((t - 75.4) / 0.35), '#fff');
  } else {
    const cam = t < 86.1 ? mov(t, 81.6, 86.1, cam0(1100, 470, 1.6), cam0(1100, 470, 1.75)) : t < 96 ? mov(t, 86.1, 96, cam0(800, 560, 1.15), cam0(820, 520, 1.35)) : cam0(820, 520, 1.4);
    nome(t, cam);
    capa(cam, 1, () => {
      g.save(); g.translate(1100, 560); g.beginPath(); g.rect(-8, 0, 16, 380); trazo('#6a4a36', 4); rr(-200, -140, 400, 260, 10); trazo('#c9a476', 6);
      g.font = '700 46px Lora'; g.fillStyle = '#3a2a1a'; g.textAlign = 'center'; g.fillText('SE BUSCA', 0, -70); g.font = '600 34px Lora'; g.fillText('COSTURERA', 0, -20); g.font = '700 44px Lora'; g.fillStyle = '#9a2a4a'; g.fillText('$50 al mes', 0, 50); g.restore();
      ada(t, 760, 1000, 1.15, { isla: false, cara: t > 92.4 ? cara('triste', { cej: 14, ojoH: 0.8 }) : t > 86.1 ? cara('sorpresa', { plato: 0, ojoH: 1.05 }) : 'neutral', mira: [0.8, -0.5], manoI: [-20, -150] }, L_ROSA);
    });
    nieve(t, 0.5, 80); bokeh(t, 0.4, '255,220,210'); grad('rgb(255,240,245)', 'rgb(140,120,160)', 0.35); vineta(0.4);
    if (t > 84) { const a = ven(t, 84.0, 89.4, 0.4); reset(); g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(255,250,244,0.92)'; rr(1240, 120, 560, 150, 24); g.fill(); g.font = '600 64px Lora'; g.fillStyle = '#3a2c5a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$50 × 12 = $600', 1520, 195); g.restore(); }
    if (t > 89.3 && t < 96.2) { const [hx, hy] = (() => { const c = t < 96 ? mov(t, 86.1, 96, cam0(800, 560, 1.15), cam0(820, 520, 1.35)) : cam0(820, 520, 1.4); return [(760 - c.x - W / 2) * c.zoom + W / 2 - 330, (1000 - 520 - c.y - H / 2) * c.zoom + H / 2]; })(); const a = ven(t, 89.5, 96.0, 0.4); reset(); g.save(); g.globalAlpha = a; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(hx, hy - 60, 170, 130, 0, 0, TAU); g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke(); for (const [dx, dy, r] of [[120, 70, 18], [150, 100, 10]]) { g.beginPath(); g.arc(hx + dx, hy + dy, r, 0, TAU); g.fill(); g.stroke(); } g.beginPath(); g.ellipse(hx, hy - 60, 150, 110, 0, 0, TAU); g.clip(); g.translate(hx, hy + 70); g.scale(0.55, 0.55); P.bennett.dibujar(g, { t, x: 0, y: 0, escala: 1, cara: CERR('neutral'), mira: [0, 0] }); g.restore(); }
    if (t > 96) titular('Dice que sí.', 0, 0);
    fundido(1 - cl((t - 81.6) / 0.35));
  }
}
function muelle(t, cam, amanecer = 1) {
  cielo([[0, '#a9b4d6'], [0.45, '#f2c7c7'], [0.62, '#f8dcc4'], [1, '#c7d2e6']]);
  sol(1450, 600, 44, '255,240,220', '255,180,170');
  capa(cam, 0.3, () => { montes(640, 120, '#b1a7c7', 1.6); });
  capa(cam, 0.7, () => { mar(640, '#a8b8d8', '#5f7aa6', t); reflejo(1450, 650, 160, '255,215,200', 0.7); barco(1200, 690, 0.95, t, '#4a4250'); });
  capa(cam, 1, () => { g.beginPath(); g.rect(-800, 880, 3600, 60); trazo('#8a6a54'); g.fillStyle = '#6a4e3e'; for (let x = -800; x < 2800; x += 220) g.fillRect(x, 940, 26, 200); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = -800; x < 2800; x += 70) g.fillRect(x, 880, 3, 60); cajas(220, 885, 0.8, 3); });
}
function s04(t) {
  let cam = t < 106.6 ? mov(t, 97.3, 106.6, cam0(760, 560, 1.0), cam0(700, 540, 1.15)) : t < 110.2 ? mov(t, 106.6, 110.2, cam0(1120, 600, 1.2), cam0(1100, 600, 1.3)) : t < 116.3 ? cam0(0, 0, 1) : mov(t, 116.3, 121.3, cam0(820, 620, 1.5), cam0(840, 560, 1.7));
  if (t >= 110.2 && t < 116.3) {
    cielo([[0, '#d9c4c9'], [1, '#b9a3b3']]);
    const c2 = mov(t, 110.2, 116.3, cam0(1340, 600, 1.15), cam0(1360, 620, 1.3));
    capa(c2, 1, () => { g.fillStyle = '#e8d9cf'; g.fillRect(-500, -500, 3000, 1400); g.beginPath(); g.rect(1160, 200, 360, 300); trazo('#d6ecff', 6); g.strokeStyle = LINEA; g.lineWidth = 5; g.beginPath(); g.moveTo(1340, 200); g.lineTo(1340, 500); g.moveTo(1160, 350); g.lineTo(1520, 350); g.stroke(); g.fillStyle = '#9a8274'; g.fillRect(-500, 900, 3000, 900); rr(1200 - 130, 800, 260, 60, 10); trazo('#f5f0ea', 4); rr(1200 - 130, 770, 70, 50, 10); trazo('#fff', 4); dib('bennett', { t, x: 1460, y: 930, escala: 0.9, cara: CERR('triste'), mira: [0, -0.5], pose: { suelo: true } }, L_ROSA); });
    brillo(1340, 360, 900, '255,236,210', 0.8); grad('rgb(255,240,240)', 'rgb(120,100,130)', 0.45); vineta(0.6);
    fundido(1 - cl((t - 110.2) / 0.4)); fundido(cl((t - 115.9) / 0.4));
    return;
  }
  muelle(t, cam);
  capa(cam, 1, () => {
    if (t < 106.6) for (let i = 0; i < 4; i++) { const q = cl((t - 102.5) / 4); g.save(); g.globalAlpha = 0.45 * (1 - q); g.fillStyle = '#4a3f5a'; g.translate(-100 - i * 140 - q * 300, 880); g.beginPath(); g.arc(0, -230, 34, 0, TAU); g.fill(); rr(-40, -195, 80, 190, 30); g.fill(); g.restore(); }
    const MX = [1180, 1310, 1440, 1560];
    if (t > 104) MUCH.forEach((m, i) => dib(m, { t, x: MX[i], y: 880, escala: 0.75, cara: 'neutral', mira: [-0.8, 0], manoD: i === 1 && t > 106.6 && t < 109.8 ? [60, -330 + Math.sin(t * 6) * 20] : null }, L_ROSA));
    const ax = t < 116.3 ? 700 : lerp(760, 980, sv((t - 116.3) / 3.5));
    ada(t, ax, 900, 1.05, { isla: false, cara: t < 102.9 ? 'neutral' : cara('triste', { cej: 18 }), mira: t < 106.6 ? [C.dardos(t, 5, 0.9), 0] : [0.8, 0], manoD: [70, -110] }, L_ROSA);
    g.save(); g.translate(ax + 60, 910); rr(-50, -100, 100, 80, 16); trazo('#a3566a'); g.restore();
  });
  nieve(t, 0.25, 40); bokeh(t, 0.4, '255,215,200'); grad('rgb(255,236,236)', 'rgb(120,110,150)', 0.35); vineta(0.45);
  lugar('9 de septiembre de 1921', 'Nome · el muelle', ven(t, 100.4, 105, 0.4));
  if (t > 117.9) titular('Un año.', ven(t, 117.9, 121.2, 0.4), 260, 70);
  fundido(1 - cl((t - 97.3) / 0.6), '#fff');
  if (t > 116.3) fundido(1 - cl((t - 116.3) / 0.4));
}
function playaW(t, cam, niebla = 0, tono = 0) {
  cielo(tono ? [[0, '#c9c3d9'], [0.6, '#ecd9dc'], [1, '#e9e3ea']] : [[0, '#8f9cc4'], [0.55, '#d6c3d6'], [0.8, '#efd5d3'], [1, '#d8dbe9']]);
  capa(cam, 0.25, () => { montes(700, 80, '#a6a3c4', 2.4); });
  capa(cam, 0.6, () => { mar(700, '#a9b4cc', '#6c7fa3', t); hielos(705, t, 10, '#f3f6fc', 3); });
  capa(cam, 1, () => { g.beginPath(); g.moveTo(-1500, 880); g.quadraticCurveTo(800, 800, 3500, 900); g.lineTo(3500, 2000); g.lineTo(-1500, 2000); g.closePath(); const gr = g.createLinearGradient(0, 800, 0, 1200); gr.addColorStop(0, '#a29fae'); gr.addColorStop(1, '#6f6b7c'); g.fillStyle = gr; g.fill(); for (let i = 0; i < 60; i++) { g.beginPath(); g.arc(-1000 + C.hash(i) * 4000, 900 + C.hash(i * 3) * 250, 3 + C.hash(i * 2) * 7, 0, TAU); g.fillStyle = 'rgba(70,65,80,0.4)'; g.fill(); } g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 4; g.beginPath(); for (let x = -1500; x < 3500; x += 30) g.lineTo(x, 860 + Math.sin(x * 0.01 + t * 1.5) * 6 - (x - 800) * 0.0); g.stroke(); });
  if (niebla) C.niebla(g, t, { y: 650, alto: 500, k: niebla, n: 9, color: '245,240,248' });
}
function s05(t) {
  let cam;
  if (t < 129.8) cam = mov(t, 121.3, 129.8, cam0(960, 560, 1.0), cam0(1080, 520, 1.12));
  else if (t < 138.9) cam = mov(t, 129.8, 138.9, cam0(960, 480, 0.95), cam0(960, 480, 1.05));
  else if (t < 147.2) cam = mov(t, 138.9, 147.2, cam0(500, 600, 1.4), cam0(560, 600, 1.55));
  else if (t < 153.8) cam = mov(t, 147.2, 153.8, cam0(960, 500, 1.0), cam0(1200, 450, 1.25));
  else cam = mov(t, 153.8, 155.2, cam0(470, 560, 2.2), cam0(470, 560, 2.3));
  playaW(t, cam);
  const bs = t < 147.2 ? 0.55 : lerp(0.55, 0.1, sv((t - 147.2) / 6.6)), bx = t < 129.8 ? 1500 : lerp(1500, 1750, sv((t - 129.8) / 24));
  capa(cam, 0.6, () => barco(bx, 720, bs, t, '#4a4250'));
  capa(cam, 1, () => {
    bandera(1250, 890, 0.9, t, t < 125.5 ? lerp(0, 520, 0) + 520 * sv((t - 121.6) / 0.01) : 520);
    if (t < 125.5) { g.save(); g.globalAlpha = 1; g.restore(); }
    MUCH.forEach((m, i) => dib(m, { t, x: 1060 + i * 150 + (i > 1 ? 140 : 0), y: 905, escala: 0.8, cara: t > 125.5 && t < 129.8 ? 'feliz' : 'neutral', mira: [0, 0], manoD: i === 0 && t > 125.5 && t < 129.8 ? [70, -360] : null }, L_ROSA));
    const llora = t > 153.6;
    ada(t, 470, 930, 1.0, { cara: llora ? cara('triste', { cej: 26, ojoH: 0.45 }) : t > 144.4 ? cara('triste', { cej: 16 }) : 'neutral', mira: [0.8, -0.1], pose: { dx: t > 141.6 && t < 144.4 ? 16 * sv((t - 141.6) / 0.8) : 0, cab: llora ? 10 : 0 } }, L_ROSA);
    if (llora) { const [hx, hy] = cabeza(470, 930, 1.0); lagrimas(hx, hy + 30, 1.0, t, cl((t - 153.8) / 0.4)); }
  });
  nieve(t, 0.2, 30); bokeh(t, 0.35, '255,210,220'); grad('rgb(250,236,245)', 'rgb(110,105,140)', 0.4); vineta(0.45);
  lugar('Isla Wrangel', 'Septiembre de 1921', ven(t, 121.6, 127.5, 0.5));
  fundido(1 - cl((t - 121.3) / 0.6));
  fundido(cl((t - 154.6) / 0.5));
}
function campo(t, cam, k = 1) {
  cielo([[0, '#0a0f2a'], [0.55, '#1d2450'], [1, '#3a3466']]); estrellas(t, 1); aurora(t, k);
  capa(cam, 0.3, () => montes(800, 120, '#24264a', 1.8));
  capa(cam, 1, () => { suelo(860, '#bfc6e6', '#7f86b3'); carpa(620, 900, 1.1, '#cfc4b0', 0.9); carpa(1080, 880, 0.9, '#c4b9a6', 0.5); carpa(1460, 890, 1.0, '#d0c6b2', 0.7); });
}
function s06(t) {
  if (t < 164.3) {
    const cam = mov(t, 155.0, 164.3, cam0(960, 700, 1.4), cam0(960, 720, 1.55));
    carpaInt(t, cam, 0.6, 1);
    capa(cam, 1, () => { farol(1500, 760, 0.9, t, 0.5); ada(t, 900, 935, 1.1, { cara: cara('triste', { cej: 22, ojoH: 0.55 }), mira: [0, 0.6], pose: { suelo: true, cab: 14, hombros: -6 }, manoI: [-60, -140], manoD: [60, -140] }, L_FRIA);
      g.save(); g.translate(1120, 930); rr(-70, -16, 140, 32, 8); trazo('#d8b28a', 3); g.beginPath(); g.moveTo(-40, -30); g.lineTo(60, -50); g.lineWidth = 3; g.strokeStyle = '#ccc'; g.stroke(); g.restore();
      if (t > 157.3 && t < 161.2) { const a = ven(t, 157.4, 161.2, 0.5); const [hx, hy] = cabeza(900, 935, 1.1); g.save(); g.globalAlpha = a * 0.9; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(hx + 260, hy - 160, 130, 100, 0, 0, TAU); g.fill(); g.lineWidth = 4; g.strokeStyle = LINEA; g.stroke(); g.beginPath(); g.arc(hx + 140, hy - 70, 14, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.ellipse(hx + 260, hy - 160, 110, 84, 0, 0, TAU); g.clip(); g.translate(hx + 260, hy - 50); g.scale(0.45, 0.45); P.bennett.dibujar(g, { t, x: 0, y: 0, escala: 1, cara: CERR('neutral'), mira: [0, 0] }); g.restore(); }
    });
    grad('rgb(200,210,255)', 'rgb(40,40,80)', 0.55); vineta(0.65);
    fundido(1 - cl((t - 155.0) / 0.6));
  } else if (t < 169.3) {
    const cam = mov(t, 164.3, 169.3, cam0(1000, 420, 1.1), cam0(1000, 660, 1.0));
    campo(t, cam, 0.3);
    capa(cam, 1, () => { g.beginPath(); g.moveTo(1000, 900); g.lineTo(1000, 200); g.lineWidth = 10; g.strokeStyle = LINEA; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#d8cbb4'; g.stroke(); g.beginPath(); g.moveTo(1000, 520); g.bezierCurveTo(1010, 600, 990, 680, 1004, 760); g.lineWidth = 5; g.strokeStyle = '#a58a6a'; g.stroke();
      g.save(); g.globalAlpha = 0.6; g.fillStyle = '#1a1830'; g.beginPath(); g.ellipse(1040, 900, 90, 18, 0, 0, TAU); g.fill(); g.restore();
      g.save(); g.globalAlpha = 0.85; g.fillStyle = '#2a2648'; g.beginPath(); g.arc(1040, 820, 26, 0, TAU); g.fill(); rr(1010, 840, 64, 60, 22); g.fill(); g.restore(); });
    nieve(t, 0.6, 120, 50); vineta(0.7);
    fundido(1 - cl((t - 164.3) / 0.5));
  } else if (t < 176.7) {
    const cam = t < 174.4 ? mov(t, 169.3, 174.4, cam0(960, 500, 1.0), cam0(960, 560, 1.1)) : mov(t, 174.4, 176.7, cam0(820, 600, 1.4), cam0(820, 600, 1.5));
    if (t < 170.9) { campo(t, cam, 1); nieve(t, 0.4, 70, 20); vineta(0.45); }
    else {
      carpaInt(t, cam, 1);
      capa(cam, 1, () => { farol(960, 600, 1.0, t, 1);
        [['knight', 1350, 0.95], ['crawford', 1580, 0.9], ['maurer', 400, 0.92], ['galle', 1140, 0.88]].forEach(([m, x, s], i) => dib(m, { t, x, y: 940, escala: s, cara: 'neutral', mira: [x > 960 ? -0.6 : 0.6, 0.2], pose: { suelo: true, cab: 4 } }, L_CALIDA));
        ada(t, 760, 945, 1.0, { cara: t > 174.4 ? cara('neutral', { cej: -4 }) : 'neutral', mira: [0.3, 0.5], pose: { suelo: true }, manoI: [-10, -170], manoD: [40, -175] }, L_CALIDA);
        if (t > 174.4) { g.save(); g.translate(790, 790); g.rotate(-0.1); rr(-60, -14, 120, 40, 10); trazo('#c9a07a', 3); g.restore(); }
      });
      bokeh(t, 0.8); grad('rgb(255,226,190)', 'rgb(70,45,60)', 0.6); vineta(0.55);
    }
    fundido(1 - cl((t - 169.3) / 0.5));
  } else {
    const cam = t < 179.1 ? mov(t, 176.7, 179.1, cam0(960, 600, 1.3), cam0(960, 620, 1.4)) : mov(t, 179.1, 180.9, cam0(1000, 600, 1.2), cam0(1000, 600, 1.3));
    cielo([[0, '#33407a'], [0.6, '#8e86b8'], [1, '#e2c3d2']]); sol(1600, 760, 34, '255,230,215', '255,170,180');
    capa(cam, 0.4, () => montes(820, 120, '#6f6a9a', 2));
    capa(cam, 1, () => { suelo(880, '#eef0fa', '#bbbfdc');
      if (t < 179.1) { g.save(); g.translate(1220, 900); g.beginPath(); g.rect(-70, -70, 140, 70); trazo('#9a7a5a', 4); g.beginPath(); g.moveTo(-70, -70); g.lineTo(-20, -130 + (t > 178 ? 60 : 0)); g.lineWidth = 6; g.strokeStyle = LINEA; g.stroke(); g.restore();
        ada(t, 900, 920, 1.05, { cara: cara('neutral', { cej: -6 }), mira: [0.8, 0.6], pose: { dy: 40, cab: 10 }, manoD: [200, -120] }, L_ROSA); }
      else { for (let i = 0; i < 5; i++) { const cae = t > 179.6 + i * 0.25; g.save(); g.translate(1350 + i * 70, 860); if (cae) { const q = cl((t - 179.6 - i * 0.25) / 0.4); g.translate(q * 30, -Math.sin(q * Math.PI) * 50 + q * 20); g.rotate(q * 1.6); } rr(-20, -60, 40, 60, 4); trazo(['#e07a8a', '#7ab0e0', '#f2c14e', '#9fd36a', '#c49ae6'][i], 3); g.restore(); }
        ada(t, 760, 920, 1.05, { cara: cara('neutral', { cej: -8, ojoH: 0.7 }), mira: [1, 0], manoI: [120, -230], manoD: [200, -240] }, L_ROSA);
        g.beginPath(); g.moveTo(760 + 90, 920 - 230); g.lineTo(760 + 330, 920 - 250); g.lineWidth = 12; g.strokeStyle = LINEA; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#6a4a36'; g.stroke(); }
    });
    nieve(t, 0.3, 50); grad('rgb(250,236,245)', 'rgb(110,105,150)', 0.35); vineta(0.4);
    fundido(1 - cl((t - 176.7) / 0.3));
  }
}
function s07(t) {
  if (t < 198.2) {
    if (t < 186.6) {
      const cam = mov(t, 180.9, 186.6, cam0(960, 560, 1.0), cam0(1000, 520, 1.15));
      cielo([[0, '#b4c3e6'], [0.55, '#f5d2d6'], [0.75, '#fbe3cf'], [1, '#e0e3f0']]); sol(1450, 600, 46, '255,246,230', '255,200,180');
      capa(cam, 0.6, () => { mar(680, '#b8c4dc', '#7c8fb3', t); hielos(690, t, 12, '#f6f8fd', 5); });
      capa(cam, 1, () => { suelo(880, '#c8c3d1', '#8f8a9e'); cajas(760, 900, 0.8, 2);
        ada(t, 760, 900 - 88, 0.95, { cara: t > 184.6 ? cara('triste', { cej: 16 }) : 'neutral', mira: [0.8, -0.1], manoI: [10, -290], manoD: [60, -290] }, L_ROSA);
        const [hx, hy] = cabeza(760, 900 - 88, 0.95); g.save(); g.translate(hx + 50, hy + 10); for (const dx of [-14, 14]) { rr(dx - 12, -16, 24, 34, 8); trazo('#3a3340', 3); } g.restore();
      });
      nieve(t, 0.1, 20); bokeh(t, 0.3, '255,220,220'); vineta(0.4);
      lugar('Verano de 1922', 'Se acaba el año prometido', ven(t, 181.2, 186.4, 0.5));
      fundido(1 - cl((t - 180.9) / 0.5));
    } else {
      const cam = mov(t, 186.6, 198.2, cam0(960, 520, 1.0), cam0(1000, 500, 1.12));
      oficina(t, cam);
      capa(cam, 1, () => { dib('stef', { t, x: 1500, y: 920, escala: 1.05, cara: CERR(t > 189.7 ? cara('triste', { cej: 10 }) : 'neutral'), mira: [0, 0.6], pose: { cab: 8 }, manoI: [-50, -150], manoD: [50, -150] }, L_CALIDA);
        g.save(); g.translate(1500, 780); g.beginPath(); g.ellipse(0, 0, 60, 26, 0, 0, TAU); trazo('#6a3a3a', 4); g.beginPath(); g.ellipse(0, -6, 44, 14, 0, 0, TAU); g.fillStyle = '#2a1414'; g.fill(); g.restore(); });
      bokeh(t, 0.3); grad('rgb(255,232,200)', 'rgb(80,50,50)', 0.55); vineta(0.6);
      if (t > 192.1 && t < 194.4) titular('Canadá: $0', ven(t, 192.2, 194.4, 0.3), 200, 64, '#ffe6ea');
      fundido(1 - cl((t - 186.6) / 0.4));
    }
  } else if (t < 202.7) {
    reset(); cielo([[0, '#dfe6f4'], [1, '#c9d3ea']]);
    g.fillStyle = '#9fb4d8'; g.fillRect(0, 300, W, 700); g.fillStyle = '#f7f9fe'; g.beginPath(); g.moveTo(820, 300); for (let y = 300; y <= 1000; y += 30) g.lineTo(820 + Math.sin(y * 0.03) * 30, y); for (let y = 1000; y >= 300; y -= 30) g.lineTo(1100 + Math.sin(y * 0.04) * 30, y); g.closePath(); g.fill(); g.strokeStyle = '#8aa0c8'; g.lineWidth = 4; g.stroke();
    const u = cl((t - 198.4) / 3.6); const bx = u < 0.55 ? lerp(200, 760, u / 0.55) : lerp(760, 300, (u - 0.55) / 0.45), by = u < 0.55 ? 650 : 650 + Math.sin((u - 0.55) / 0.45 * Math.PI) * 120;
    g.setLineDash([16, 12]); g.strokeStyle = '#c74a6e'; g.lineWidth = 6; g.beginPath(); g.moveTo(200, 650); g.lineTo(760, 650); g.quadraticCurveTo(820, 720, 300, 760); g.stroke(); g.setLineDash([]);
    g.save(); g.translate(bx, by); g.scale(u < 0.55 ? 1 : -1, 1); barco(0, 0, 0.3, t, '#4a4250'); g.restore();
    g.font = 'italic 600 44px Lora'; g.fillStyle = '#3a2c5a'; g.textAlign = 'center'; g.fillText('Teddy Bear', 400, 520); g.fillText('hielo', 960, 260); g.font = 'italic 600 40px Lora'; g.fillText('Wrangel', 1560, 650);
    g.beginPath(); g.ellipse(1560, 700, 130, 50, 0, 0, TAU); g.fillStyle = '#efe6d6'; g.fill(); g.strokeStyle = LINEA; g.lineWidth = 4; g.stroke();
    vineta(0.3);
    fundido(1 - cl((t - 198.2) / 0.3));
  } else {
    reset(); cielo([[0, '#1d1a2c'], [1, '#2a2438']]);
    const cA = cam0(1240, 560, 1.15), cB = cam0(1064, 520, 1.1);
    g.save(); g.beginPath(); g.rect(0, 0, W / 2 - 4, H); g.clip();
    carpaInt(t, cA, 1, 1);
    capa(cA, 1, () => { farol(500, 760, 0.9, t, 0.7); ada(t, 880, 935, 1.1, { cara: cara('triste', { cej: 12 }), mira: [0.3, 0.6], pose: { suelo: true, cab: 10 }, manoD: [80, -130] }, L_FRIA); for (let i = 0; i < 5; i++) { const visible = i < 5 - Math.floor(cl((t - 202.8) / 4) * 3); if (!visible) continue; g.save(); g.translate(1040 + i * 50, 930); rr(-18, -50, 36, 50, 5); trazo('#c9cfd8', 3); g.fillStyle = '#d97a8a'; g.fillRect(-18, -36, 36, 14); g.restore(); } });
    g.restore();
    g.save(); g.beginPath(); g.rect(W / 2 + 4, 0, W / 2, H); g.clip(); oficina(t, cB);
    capa(cB, 1, () => { dib('stef', { t, x: 1500, y: 920, escala: 1.05, cara: CERR(cara('triste', { cej: 12 })), mira: [0, 0.6], pose: { cab: 8 }, manoI: [-50, -150], manoD: [50, -150] }, L_CALIDA); g.save(); g.translate(1500, 780); g.beginPath(); g.ellipse(0, 0, 60, 26, 0, 0, TAU); trazo('#6a3a3a', 4); g.restore(); });
    g.restore();
    reset(); g.fillStyle = '#fbe9ef'; g.fillRect(W / 2 - 4, 0, 8, H);
    grad('rgb(255,236,226)', 'rgb(70,50,70)', 0.4); vineta(0.5);
    fundido(1 - cl((t - 202.7) / 0.3));
  }
}
function s08(t) {
  if (t < 216.3) {
    const cam = t < 211.2 ? mov(t, 208.9, 211.2, cam0(1100, 820, 2.0), cam0(1100, 820, 2.2)) : mov(t, 211.2, 216.3, cam0(960, 520, 1.0), cam0(960, 480, 0.92));
    if (t < 211.2) { carpaInt(t, cam, 0.6, 1); capa(cam, 1, () => { farol(800, 760, 0.9, t, 0.6); g.save(); g.translate(1100, 900); g.beginPath(); g.rect(-140, -140, 280, 140); trazo('#8a6646', 4); g.fillStyle = '#3a2a20'; g.fillRect(-126, -126, 252, 40); g.restore(); g.save(); g.translate(1060, 850); rr(-18, -50, 36, 50, 5); trazo('#c9cfd8', 3); g.restore(); }); grad('rgb(200,210,255)', 'rgb(40,40,80)', 0.5); vineta(0.6); }
    else { cielo([[0, '#58669c'], [0.6, '#b2a6c9'], [1, '#ead2d8']]); capa(cam, 0.6, () => { g.fillStyle = '#dfe6f4'; g.fillRect(-2000, 700, 6000, 2000); hielos(700, t, 22, '#f7f9fe', 9); const k = cl((t - 213.9) / 2.4); g.fillStyle = `rgba(240,245,252,${k})`; g.fillRect(-2000, 700, 6000, 2000); }); capa(cam, 1, () => { campo; carpa(960, 900, 0.7, '#cfc4b0', 0.4); }); nieve(t, 0.5, 100, 40); vineta(0.5); }
    fundido(1 - cl((t - 208.9) / 0.4));
  } else if (t < 237.0) {
    const cam = t < 223.4 ? mov(t, 216.3, 223.4, cam0(960, 560, 1.0), cam0(960, 540, 1.08)) : t < 231.5 ? mov(t, 223.4, 231.5, cam0(560, 640, 1.5), cam0(580, 640, 1.65)) : mov(t, 231.5, 237.0, cam0(960, 520, 1.0), cam0(1100, 460, 1.2));
    cielo([[0, '#4a5a96'], [0.5, '#c4a6c6'], [0.68, '#f6cdb8'], [1, '#e4dbec']]);
    sol(1480, 640, 40, '255,236,215', '255,170,160');
    capa(cam, 0.6, () => { g.fillStyle = '#e7ecf7'; g.fillRect(-2000, 660, 6000, 2000); reflejo(1480, 670, 300, '255,205,190', 0.6); hielos(670, t, 18, '#f8faff', 11); });
    capa(cam, 1, () => {
      const u = cl((t - 220.1) / 16.5);
      for (let i = 0; i < 3; i++) { const sx = lerp(900, 1480, u) + i * lerp(60, 8, u), sy = lerp(860, 680, u), s = lerp(0.55, 0.06, u); g.save(); g.globalAlpha = 1 - cl((t - 235.5) / 1.4); g.fillStyle = '#2e2a44'; g.translate(sx, sy); g.scale(s, s); g.beginPath(); g.arc(0, -300, 40, 0, TAU); g.fill(); rr(-50, -260, 100, 240, 36); g.fill(); if (i === 0) { rr(-200, -50, 140, 40, 10); g.fill(); } g.restore(); }
      carpa(380, 920, 1.0, '#d9cdb8', 0.6);
      bulto(560, 940, 0.55, t, 0.4);
      ada(t, 300, 940, 1.0, { cara: t > 229.5 ? cara('triste', { cej: 14 }) : t > 223.4 ? cara('triste', { cej: 20 }) : 'neutral', mira: [0.9, -0.1], pose: { cab: 4 } }, L_ROSA);
      dib('knight', { t, x: 560, y: 940, escala: 0.85, cara: CERR(cara('dolor', { boca: 'abajo' })), mira: [0.8, 0], pose: { suelo: true, cab: 6 } }, L_ROSA);
      g.beginPath(); g.ellipse(560, 900, 140, 70, 0, 0, TAU); g.fillStyle = 'rgba(150,170,170,0.95)'; g.fill(); g.lineWidth = 4; g.strokeStyle = LINEA; g.stroke();
    });
    nieve(t, 0.25, 40, 30); bokeh(t, 0.3, '255,215,200'); grad('rgb(255,236,236)', 'rgb(90,90,140)', 0.35); vineta(0.45);
    lugar('Enero de 1923', 'Tres salen hacia Siberia', ven(t, 216.6, 222, 0.5));
    fundido(1 - cl((t - 216.3) / 0.5));
  } else {
    const cam = mov(t, 237.0, 239.0, cam0(1300, 560, 1.4), cam0(1300, 560, 1.5));
    cielo([[0, '#384680'], [0.6, '#a596bf'], [1, '#e2d4e2']]);
    capa(cam, 0.6, () => { g.fillStyle = '#e7ecf7'; g.fillRect(-2000, 660, 6000, 2000); hielos(670, t, 18, '#f8faff', 11); });
    nieve(t, 0.6, 140, 70); vineta(0.55);
    fundido(cl((t - 238.4) / 0.6));
  }
}
function s09(t) {
  if (t < 249.3) {
    const cam = t < 244.1 ? mov(t, 239.0, 244.1, cam0(890, 720, 2.0), cam0(890, 720, 2.2)) : mov(t, 244.1, 249.3, cam0(1000, 600, 1.15), cam0(1000, 600, 1.2));
    carpaInt(t, cam, 0.5, 1);
    capa(cam, 1, () => { farol(560, 760, 0.85, t, 0.45); bulto(1340, 930, 1.0, t);
      ada(t, 880, 935, 1.1, { cara: cara('dolor', { boca: 'abajo', ojoH: 0.55, cejI: 26, cejD: 10 }), mira: [0.2, 0.4], pose: { suelo: true, cab: 8, hombros: -4 }, manoI: [-40, -280] }, L_FRIA);
      const [hx, hy] = cabeza(880, 935 + 92, 1.1); g.save(); g.globalAlpha = 0.45; g.fillStyle = '#c8708a'; g.beginPath(); g.ellipse(hx + 30, hy + 4, 30, 24, 0, 0, TAU); g.fill(); g.restore();
      if (t > 245.3) { const k = ven(t, 245.4, 249.2, 0.3); g.save(); g.globalAlpha = k; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(1340, 640, 200, 70, 0, 0, TAU); g.fill(); g.lineWidth = 4; g.strokeStyle = LINEA; g.stroke(); g.font = 'italic 600 36px Lora'; g.fillStyle = '#3a2c5a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('las trampas…', 1340, 642); g.restore(); }
    });
    grad('rgb(200,210,255)', 'rgb(40,40,80)', 0.55); vineta(0.65);
    fundido(1 - cl((t - 239.0) / 0.6));
  } else {
    reset(); cielo([[0, '#2a2030'], [1, '#18121c']]); brillo(260, 180, 900, '255,190,110', 0.75);
    papel(820, 540, 1150, 820, -0.03);
    escribir('Abril de 1923', 360, 230, (t - 249.4) / 1.0, 48, '#6a5a7a');
    escribir('Si algo me pasa…', 360, 360, (t - 251.5) / 1.3, 58);
    escribir('una tira negra para la mochila', 360, 470, (t - 252.4) / 1.6, 54);
    escribir('de la escuela de Bennett', 360, 570, (t - 253.9) / 1.4, 54, '#b33b67');
    escribir('Todo lo mío, para mi hijo.', 360, 700, (t - 256.1) / 1.8, 56, '#b33b67');
    const mx = 1560 + Math.sin(t * 0.8) * 4, my = 720;
    g.save(); g.translate(mx, my); g.rotate(0.08); rr(-140, -170, 280, 300, 40); trazo('#c7a27c'); rr(-100, -230, 200, 80, 30); g.lineWidth = 10; g.strokeStyle = LINEA; g.stroke(); g.lineWidth = 5; g.strokeStyle = '#a07a58'; g.stroke(); rr(-110, -40, 220, 120, 20); trazo('#b48e68', 4);
    const tira = sv((t - 252.6) / 0.8); g.fillStyle = '#1e1a22'; g.fillRect(-140, -110, 280 * tira, 30); g.restore();
    grad('rgb(255,236,214)', 'rgb(80,60,70)', 0.45); vineta(0.6);
    fundido(1 - cl((t - 249.3) / 0.4));
  }
}
function s10(t) {
  if (t < 261.9) {
    reset(); cielo([[0, '#2a2030'], [1, '#18121c']]); brillo(1600, 200, 900, '255,210,150', 0.7);
    papel(960, 540, 1250, 800, 0.02);
    escribir('10 de junio de 1923', 420, 250, (t - 258.9) / 1.0, 50, '#6a5a7a');
    escribir('$1,200  →  $200 mamá', 420, 400, (t - 259.6) / 0.9, 62);
    escribir('$600  →  $100 mamá', 420, 520, (t - 260.4) / 0.8, 62);
    escribir('el resto, para mi hijo', 420, 660, (t - 261.0) / 0.9, 62, '#b33b67');
    vineta(0.6);
    fundido(1 - cl((t - 258.8) / 0.3));
  } else if (t < 268.7) {
    const cam = mov(t, 261.9, 268.7, cam0(960, 600, 1.2), cam0(1020, 640, 1.32));
    carpaInt(t, cam, 0.4, 1);
    capa(cam, 1, () => { farol(500, 760, 0.85, t, 0.35); bulto(1200, 935, 1.0, t, 0); const k = sv((t - 264.9) / 1.8); cajas(880, 935, 0.7 * k, 2); cajas(1520, 935, 0.7 * k, 2); g.save(); g.globalAlpha = 0.5; g.fillStyle = '#2a2a44'; g.fillRect(0, 0, 0, 0); g.restore(); });
    grad('rgb(190,200,240)', 'rgb(30,30,60)', 0.65); vineta(0.7);
    titular('23 de junio de 1923', ven(t, 262.2, 265.5, 0.5), 200, 56, '#e9e4ff');
    fundido(1 - cl((t - 261.9) / 0.6));
  } else if (t < 274.7) {
    reset(); cielo([[0, '#3a2a28'], [1, '#221816']]); brillo(1300, 300, 1000, '255,200,140', 0.7);
    g.save(); g.translate(960, 760);
    rr(-420, -40, 840, 260, 30); trazo('#2f3a46'); for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) { g.beginPath(); g.arc(-330 + c * 74 + r * 20, 20 + r * 60, 24, 0, TAU); trazo('#e8e2d6', 3); }
    g.fillStyle = '#fbf6ea'; const sube = cl((t - 268.8) / 5) * 140; g.fillRect(-280, -460 - sube, 560, 440); g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 2; g.strokeRect(-280, -460 - sube, 560, 440);
    g.font = '500 34px "DejaVu Sans Mono"'; g.fillStyle = '#2a2a2a'; g.textBaseline = 'middle';
    const lineas = ['Mr Stefansson', '', 'Lorne Knight died', '23 JUNE 1923'];
    lineas.forEach((l, i) => { const n = Math.floor(l.length * cl((t - 269.0 - i * 0.9) / 0.8)); g.fillText(l.slice(0, n), -240, -400 - sube + i * 60); });
    rr(-460, -80, 920, 70, 16); trazo('#3a4652');
    g.restore();
    grad('rgb(255,236,214)', 'rgb(80,60,70)', 0.45); vineta(0.6);
    fundido(1 - cl((t - 268.7) / 0.3));
  } else {
    const cam = mov(t, 274.7, 279.2, cam0(960, 560, 1.0), cam0(960, 520, 0.9));
    campo(t, cam, 0.2); cielo;
    capa(cam, 1, () => { ada(t, 960, 920, 0.8, { cara: cara('triste', { cej: 12 }), mira: [0, 0.2] }, L_AURORA); });
    nieve(t, 0.4, 60); vineta(0.5);
    fundido(1 - cl((t - 274.7) / 0.4));
  }
}
function s11(t) {
  if (t < 289.9) {
    const sub = t < 283.5 ? 0 : t < 286.8 ? 1 : 2;
    if (sub === 0) {
      const cam = mov(t, 279.2, 283.5, cam0(1020, 640, 1.25), cam0(1020, 640, 1.35)); carpaInt(t, cam, 0.8);
      capa(cam, 1, () => { farol(560, 760, 0.85, t, 0.8); rr(760, 820, 520, 110, 20); trazo('#a07a9a'); g.beginPath(); g.rect(760, 600, 520, 24); trazo('#8a6646'); for (const bx of [900, 1140]) { g.beginPath(); g.moveTo(bx - 100, 595); g.lineTo(bx + 100, 580); g.lineWidth = 12; g.strokeStyle = LINEA; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#6a4a36'; g.stroke(); } ada(t, 1380, 935, 1.05, { cara: cara('neutral', { cej: -2 }), mira: [-0.8, -0.4], manoI: [-140, -320] }, L_CALIDA); });
      bokeh(t, 0.6); grad('rgb(255,226,190)', 'rgb(70,45,60)', 0.5); vineta(0.5); fundido(1 - cl((t - 279.2) / 0.4));
    } else if (sub === 1) {
      const cam = mov(t, 283.5, 286.8, cam0(960, 520, 1.0), cam0(1000, 400, 1.1));
      cielo([[0, '#a7b4dc'], [0.6, '#f2d4dc'], [1, '#e8e4f0']]); sol(1550, 560, 40, '255,244,230', '255,190,190');
      capa(cam, 0.6, () => { mar(700, '#bcc6dc', '#8191b8', t); hielos(705, t, 10, '#f6f8fd', 7); });
      capa(cam, 1, () => { suelo(880, '#c8c3d1', '#8f8a9e'); g.strokeStyle = LINEA; g.lineWidth = 8; g.beginPath(); for (const x of [860, 1060]) { g.moveTo(x, 900); g.lineTo(x + (x < 960 ? 30 : -30), 520); } g.moveTo(870, 700); g.lineTo(1050, 700); g.stroke(); g.beginPath(); g.rect(860, 500, 200, 30); trazo('#8a6646'); ada(t, 960, 505, 0.9, { cara: 'neutral', mira: [0.9, -0.1], manoI: [10, -280], manoD: [60, -280] }, L_ROSA); });
      nieve(t, 0.15, 20); vineta(0.4); fundido(1 - cl((t - 283.5) / 0.3));
    } else {
      const cam = mov(t, 286.8, 289.9, cam0(960, 560, 1.2), cam0(980, 560, 1.3));
      playaW(t, cam, 0.2, 1);
      capa(cam, 1, () => { g.save(); g.translate(1000, 900); g.beginPath(); g.moveTo(-300, -60); g.quadraticCurveTo(0, -40, 300, -70); g.quadraticCurveTo(260, 20, 200, 30); g.lineTo(-220, 30); g.quadraticCurveTo(-290, 10, -300, -60); g.closePath(); trazo('#d6b48a'); g.strokeStyle = 'rgba(120,80,40,0.4)'; g.lineWidth = 3; for (let x = -240; x < 260; x += 60) { g.beginPath(); g.moveTo(x, -50); g.lineTo(x + 6, 25); g.stroke(); } g.restore(); ada(t, 600, 930, 1.0, { cara: cara('neutral', { cej: -4 }), mira: [0.9, 0.4], manoD: [180, -130] }, L_ROSA); });
      vineta(0.4); fundido(1 - cl((t - 286.8) / 0.3));
    }
  } else if (t < 297.3) {
    const cam = mov(t, 289.9, 297.3, cam0(970, 720, 1.25), cam0(980, 730, 1.4));
    reset(); cielo([[0, '#f2d6c4'], [1, '#d9b6aa']]);
    capa(cam, 1, () => { g.fillStyle = '#a5795c'; g.fillRect(-500, 640, 3000, 800); g.fillStyle = 'rgba(255,255,255,0.08)'; for (let x = -500; x < 2500; x += 120) g.fillRect(x, 640, 4, 800);
      for (const [px, ang, d] of [[760, -0.12, 0], [1180, 0.1, 1.5]]) { g.save(); g.translate(px, 740); g.rotate(ang);
        g.beginPath(); g.ellipse(0, 0, 200, 96, 0, 0, TAU); g.fillStyle = '#e9d6c0'; g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke();
        g.beginPath(); g.ellipse(70, 0, 130, 88, 0, -Math.PI / 2, Math.PI / 2); g.lineTo(70, -88); g.closePath(); g.fillStyle = '#d98b8f'; g.fill(); g.stroke();
        for (let k = 0; k < 14; k++) { const yy = -80 + k * 12.3; g.beginPath(); g.arc(70 + Math.sin(k) * 4, yy, 13, 0, TAU); g.fillStyle = '#fbf8f2'; g.fill(); }
        const cols = ['#e86a8a', '#6ac0e8', '#f2c14e', '#7ad39a', '#b08ae6', '#ffffff'], n = Math.floor(cl((t - 290.2 - d) / 4) * 19);
        for (let i = 0; i < n; i++) { let bx, by; if (i === 0) { bx = 140; by = 0; } else if (i < 7) { const a2 = (i - 1) / 6 * TAU; bx = 140 + Math.cos(a2) * 30; by = Math.sin(a2) * 30; } else { const a2 = (i - 7) / 12 * TAU; bx = 140 + Math.cos(a2) * 58; by = Math.sin(a2) * 58; } g.beginPath(); g.arc(bx, by, 10, 0, TAU); g.fillStyle = cols[i % 6]; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.stroke(); g.beginPath(); g.arc(bx - 3, by - 3, 3, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fill(); }
        g.restore(); }
    });
    brillo(300, 200, 1100, '255,225,190', 0.9); bokeh(t, 0.8, '255,220,190'); vineta(0.5);
    titular('4 de agosto de 1923', ven(t, 290.1, 293.6, 0.5), 200, 54, '#5a3a4a', 'italic 600');
    fundido(1 - cl((t - 289.9) / 0.4), '#fff');
  } else {
    const cam = mov(t, 297.3, 299.7, cam0(960, 690, 1.6), cam0(960, 690, 1.75));
    playaW(t, cam, 1.2, 1);
    capa(cam, 1, () => ada(t, 960, 930, 1.0, { cara: cara('sorpresa', { plato: 0.3, ojoH: 1.1 }), mira: [0.7, -0.2], pose: { cab: -4 } }, L_ROSA));
    C.niebla(g, t, { y: 600, alto: 700, k: 1.6, n: 10, color: '250,246,252' }); vineta(0.4);
    fundido(1 - cl((t - 297.3) / 0.3));
    fundido(cl((t - 299.2) / 0.5), '#fff');
  }
}
function s12(t) {
  let cam;
  if (t < 304.8) cam = mov(t, 299.7, 304.8, cam0(960, 480, 1.0), cam0(1150, 460, 1.15));
  else if (t < 309.3) cam = mov(t, 304.8, 309.3, cam0(960, 560, 1.0), cam0(900, 560, 1.1));
  else if (t < 318.6) cam = mov(t, 309.3, 318.6, cam0(900, 520, 1.25), cam0(900, 520, 1.35));
  else cam = mov(t, 318.6, 327.9, cam0(900, 540, 1.6), cam0(900, 520, 1.9));
  playaW(t, cam, lerp(1.1, 0.3, sv((t - 299.7) / 8)), 1);
  capa(cam, 0.6, () => barco(1500, 720, 0.6, t, '#3e3a4a'));
  const ax = t < 304.8 ? 700 : t < 309.3 ? lerp(500, 820, sv((t - 306.6) / 2.5)) : 820;
  capa(cam, 1, () => {
    if (t > 309.3) { const nx = lerp(1500, 1000, sv((t - 309.4) / 3)); dib('noice', { t, x: nx, y: 920, escala: 1.05, cara: CERR(t > 318.6 ? cara('triste', { cej: 10 }) : 'neutral'), mira: [-0.8, 0], manoI: t > 322.4 ? [-150, -260] : null }, L_ROSA); }
    const llora = t > 322.3;
    ada(t, ax, 930, 1.0, { cara: llora ? cara('triste', { cej: 26, ojoH: 0.45 }) : t > 315.9 ? cara('triste', { cej: 16 }) : cara('sorpresa', { plato: 0.2, boca: 'linea' }), mira: [0.8, -0.1], manoI: t < 304.8 ? [10, -290] : null, manoD: t < 304.8 ? [60, -290] : null, pose: { cab: llora ? 10 : 0, dy: t > 304.8 && t < 309.3 ? -Math.abs(Math.sin(t * 9)) * 10 : 0 } }, L_ROSA);
    if (t < 304.8) { const [hx, hy] = cabeza(ax, 930, 1.0); g.save(); g.translate(hx + 50, hy + 10); for (const dx of [-14, 14]) { rr(dx - 12, -16, 24, 34, 8); trazo('#3a3340', 3); } g.restore(); }
    if (llora) { const [hx, hy] = cabeza(ax, 930, 1.0); lagrimas(hx, hy + 30, 1.0, t, cl((t - 322.4) / 0.4)); }
    if (t > 306.6 && t < 309.3) for (let i = 0; i < 4; i++) { const q = (t * 1.5 + i / 4) % 1; g.save(); g.globalAlpha = 0.6 * (1 - q); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.ellipse(ax, 935, 60 + q * 80, 10 + q * 10, 0, 0, TAU); g.stroke(); g.restore(); }
  });
  bokeh(t, 0.4, '255,220,225'); grad('rgb(255,240,245)', 'rgb(120,110,150)', 0.3); vineta(0.45);
  lugar('20 de agosto de 1923', 'Isla Wrangel', ven(t, 299.9, 304.5, 0.5));
  if (t > 323.6) { reset(); const k = cl((t - 323.7) / 1.0) * (1 - cl((t - 327.4) / 0.5)); g.save(); g.globalAlpha = k * 0.9; g.translate(1500, 330); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 0, 200, 150, 0, 0, TAU); g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke(); g.beginPath(); g.ellipse(0, 0, 180, 130, 0, 0, TAU); g.clip(); g.translate(0, 110); g.scale(0.6, 0.6); P.bennett.dibujar(g, { t, x: 0, y: 0, escala: 1, cara: CERR('feliz'), mira: [0, 0] }); g.restore(); }
  fundido(1 - cl((t - 299.7) / 0.6), '#fff');
}
function s13(t) {
  if (t < 334.0) {
    const cam = mov(t, 327.9, 334.0, cam0(960, 560, 1.1), cam0(960, 580, 1.2));
    reset(); cielo([[0, '#e6dce4'], [1, '#cfc2d2']]);
    capa(cam, 1, () => { g.fillStyle = '#efe6ea'; g.fillRect(-500, -500, 3000, 1400); g.beginPath(); g.rect(1180, 180, 420, 360); trazo('#9fb2d6', 6); g.save(); g.beginPath(); g.rect(1180, 180, 420, 360); g.clip(); g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; for (let i = 0; i < 30; i++) { const x = 1180 + C.hash(i) * 420, y = 180 + ((C.hash(i * 3) * 360 + t * 400) % 360); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 6, y + 24); g.stroke(); } g.restore(); g.strokeStyle = LINEA; g.lineWidth = 5; g.beginPath(); g.moveTo(1390, 180); g.lineTo(1390, 540); g.stroke(); g.fillStyle = '#c9b8c4'; g.fillRect(-500, 900, 3000, 900);
      rr(820, 760, 520, 90, 16); trazo('#f6f2f4'); rr(820, 720, 120, 60, 16); trazo('#fff'); g.beginPath(); g.rect(830, 850, 20, 90); g.rect(1310, 850, 20, 90); trazo('#9aa', 3);
      dib('bennett', { t, x: 960, y: 900, escala: 0.85, cara: CERR('tranquila'), mira: [-0.6, 0], pose: { suelo: true } }, L_ROSA);
      g.beginPath(); g.rect(900, 790, 420, 70); trazo('#dfe8f4', 4);
      ada(t, 640, 940, 1.1, { isla: false, cara: cara('tranquila', { cej: 8 }), mira: [0.8, 0.3], pose: { sentado: true }, manoD: [180, -200] }, L_ROSA); });
    brillo(1390, 360, 800, '230,240,255', 0.6); grad('rgb(255,244,248)', 'rgb(130,120,150)', 0.3); vineta(0.4);
    lugar('Seattle', 'Bennett, en tratamiento', ven(t, 328.2, 333.5, 0.5));
    fundido(1 - cl((t - 327.9) / 0.6), '#fff');
  } else {
    reset(); cielo([[0, '#3a3040'], [1, '#2a2230']]); brillo(960, 300, 1100, '255,226,200', 0.7);
    for (let i = 0; i < 5; i++) { const a = cl((t - 334.1 - i * 0.35) / 0.35); if (a <= 0) continue; g.save(); g.globalAlpha = a; g.translate(960 + (i - 2) * 70, 560 + (i - 2) * 20); g.rotate((i - 2) * 0.08); g.fillStyle = '#f3ecdc'; g.fillRect(-380, -260, 760, 520); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; g.strokeRect(-380, -260, 760, 520); g.font = '900 64px Lora'; g.fillStyle = '#2a2a2a'; g.textAlign = 'center'; g.fillText('ROBINSON CRUSOE', 0, -170); g.font = 'italic 600 34px Lora'; g.fillText('femenina', 0, -110); g.fillStyle = 'rgba(0,0,0,0.18)'; for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) g.fillRect(-340 + c * 240, -60 + r * 40, 210, 14); g.restore(); }
    vineta(0.55);
    fundido(1 - cl((t - 334.0) / 0.3));
  }
}
function s14(t) {
  if (t < 346.6) {
    const cam = mov(t, 337.6, 346.6, cam0(960, 540, 1.0), cam0(1000, 560, 1.12));
    reset(); cielo([[0, '#3a2e2a'], [1, '#241c1a']]);
    capa(cam, 1, () => { g.fillStyle = '#6a4836'; g.fillRect(-500, 300, 3000, 1200); brillo(1500, 200, 1100, '255,210,160', 0.7);
      papel(900, 520, 900, 660, -0.03, '#f8f1df');
      g.font = '700 46px Lora'; g.fillStyle = '#2a2a2a'; g.textAlign = 'center'; g.fillText('CONTRATO', 900, 290);
      g.fillStyle = 'rgba(0,0,0,0.2)'; for (let r = 0; r < 6; r++) g.fillRect(560, 340 + r * 40, 680, 12);
      g.font = '700 110px Lora'; g.fillStyle = '#9a2a4a'; g.fillText('$500', 900, 690);
      escribir('Ada Blackjack', 700, 790, (t - 340.3) / 1.4, 52, '#2a3a7a', -0.04);
      if (t > 343.8) { const q = cl((t - 343.8) / 0.3); g.save(); g.translate(1160, 780 - (1 - q) * 80); g.globalAlpha = 0.85; g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.lineWidth = 8; g.strokeStyle = '#b8304a'; g.stroke(); g.font = '700 22px Inter'; g.fillStyle = '#b8304a'; g.fillText('DERECHO', 0, -8); g.fillText('EXCLUSIVO', 0, 20); g.restore(); }
      if (t > 340.3 && t < 342.2) lapiz(700 + cl((t - 340.3) / 1.4) * 330, 800, -0.5);
    });
    vineta(0.55);
    lugar('Seattle · febrero de 1924', null, ven(t, 337.9, 342, 0.5));
    fundido(1 - cl((t - 337.6) / 0.4));
  } else if (t < 352.5) {
    const cam = mov(t, 346.6, 352.5, cam0(960, 540, 1.0), cam0(960, 520, 1.12));
    reset(); cielo([[0, '#3a2e2a'], [1, '#241c1a']]); brillo(960, 300, 1000, '255,210,160', 0.7);
    capa(cam, 1, () => { g.save(); g.translate(960, 560); g.rotate(-0.05); rr(-260, -340, 520, 680, 14); trazo('#5a6a8a'); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(-240, -340, 20, 680); g.font = 'italic 600 46px Lora'; g.fillStyle = '#f3e6c8'; g.textAlign = 'center'; g.fillText('Wrangel Island', 0, -160); g.font = '600 30px Lora'; g.fillText('V. Stefansson', 0, 200); g.restore();
      if (t > 350.3) { const a = cl((t - 350.4) / 0.5); g.save(); g.globalAlpha = a; g.translate(1450, 560); g.rotate(0.06); g.fillStyle = '#f8f1df'; g.fillRect(-220, -280, 440, 560); g.fillStyle = 'rgba(0,0,0,0.2)'; for (let r = 0; r < 10; r++) g.fillRect(-180, -230 + r * 46, 360, 12); g.fillStyle = 'rgba(255,170,190,0.6)'; g.fillRect(-190, -10, 160, 34); g.font = 'italic 700 34px Lora'; g.fillStyle = '#9a2a4a'; g.fillText('Ada', -170, 16); g.restore(); } });
    vineta(0.55);
    fundido(1 - cl((t - 346.6) / 0.3));
  } else {
    const cam = mov(t, 352.5, 358.0, cam0(960, 540, 1.1), cam0(960, 540, 1.2));
    reset(); cielo([[0, '#2e2836'], [1, '#1c1822']]); brillo(960, 260, 900, '255,220,180', 0.6);
    capa(cam, 1, () => { g.save(); g.translate(960, 640); g.beginPath(); g.moveTo(0, 220); g.lineTo(0, -260); g.lineWidth = 12; g.strokeStyle = LINEA; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#c9a476'; g.stroke(); rr(-160, 210, 320, 40, 10); trazo('#c9a476');
      const ang = 0.18 * sv((t - 352.8) / 1.2); g.rotate(ang); g.beginPath(); g.moveTo(-360, -260); g.lineTo(360, -260); g.lineWidth = 10; g.strokeStyle = LINEA; g.stroke(); g.lineWidth = 5; g.strokeStyle = '#c9a476'; g.stroke();
      for (const s of [-1, 1]) { g.save(); g.translate(s * 340, -260); g.rotate(-ang); g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, 150); g.moveTo(0, 0); g.lineTo(90, 150); g.lineWidth = 3; g.strokeStyle = '#c9a476'; g.stroke(); g.beginPath(); g.ellipse(0, 150, 110, 22, 0, 0, Math.PI); trazo('#d9b88a', 4);
        if (s < 0) { g.font = 'italic 600 30px Lora'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('regalías', 0, 220); }
        if (s > 0) { g.save(); g.translate(0, 90); g.rotate(0.06); g.fillStyle = '#f8f1df'; g.fillRect(-60, -40, 120, 80); g.restore(); }
        g.restore(); }
      g.restore();
      if (t > 355.4) titular('$0', ven(t, 355.5, 358.0, 0.3), 290, 90, '#ffd6e0');
    });
    vineta(0.55);
    fundido(1 - cl((t - 352.5) / 0.3));
  }
}
function archivo(t, cam) {
  reset(); cielo([[0, '#1e2232'], [1, '#14161f']]);
  capa(cam, 1, () => {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 26; i++) { const x = -800 + i * 260, y = 120 + r * 420; g.fillStyle = '#3a3a4a'; g.fillRect(x, y + 330, 250, 16); for (let b = 0; b < 3; b++) { g.beginPath(); g.rect(x + 10 + b * 80, y + 200, 72, 130); g.fillStyle = (i * 3 + b + r) % 7 === 3 ? '#b8a48a' : '#a39a90'; g.fill(); g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.5)'; g.stroke(); g.fillStyle = '#e8e2d6'; g.fillRect(x + 26 + b * 80, y + 230, 40, 20); } }
    g.fillStyle = '#2a2a36'; g.fillRect(-1000, 980, 8000, 400);
  });
  for (let i = 0; i < 6; i++) { const x = 200 + i * 330; g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createLinearGradient(x, 0, x + 120, H); gr.addColorStop(0, 'rgba(180,200,255,0.12)'); gr.addColorStop(1, 'rgba(180,200,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 80, 0); g.lineTo(x + 200, H); g.lineTo(x + 40, H); g.fill(); g.restore(); }
}
function s15(t) {
  if (t < 368.2) {
    const k = t - 358.0, cam = cam0(960 + k * 160 * (1 - cl((t - 364.3) / 3)) + (t > 364.3 ? 0 : 0), 520, lerp(1.0, 1.35, sv((t - 364.3) / 3.5)));
    archivo(t, cam);
    if (t > 364.3) { const [px, py] = [(2560 + 90 - cam.x - W / 2) * cam.zoom + W / 2, (540 + 265 - cam.y - H / 2) * cam.zoom + H / 2]; brillo(px, py, 400, '255,214,150', cl((t - 364.4) / 0.8)); }
    reset(); g.save(); g.globalCompositeOperation = 'source-over'; g.restore();
    vineta(0.6);
    lugar('Dartmouth', 'Papeles de Stefansson', ven(t, 358.3, 363.8, 0.5));
    fundido(1 - cl((t - 358.0) / 0.6));
  } else {
    reset(); cielo([[0, '#2a2030'], [1, '#18121c']]); brillo(960, 200, 1000, '255,210,150', 0.6);
    papel(620, 560, 820, 760, -0.05); papel(1340, 560, 820, 760, 0.04);
    escribir('$1,200 → $200', 330, 380, 1, 54); escribir('$600 → $100', 330, 490, 1, 54); escribir('el resto, para mi hijo', 330, 620, 1, 54, '#b33b67', -0.05);
    escribir('una tira negra para', 1050, 400, 1, 50, '#3a2c5a', 0.04); escribir('la mochila de Bennett', 1050, 500, 1, 50, '#b33b67', 0.04);
    g.save(); g.fillStyle = '#1e1a22'; g.translate(1340, 650); g.rotate(0.04); g.fillRect(-180, 0, 360 * sv((t - 370.8) / 1.0), 26); g.restore();
    const z = lerp(1, 1.06, cl((t - 368.2) / 6)); vineta(0.6);
    fundido(1 - cl((t - 368.2) / 0.4));
  }
}
function s16(t) {
  if (t < 390.9) {
    const cam = t < 381.6 ? mov(t, 374.1, 381.6, cam0(960, 520, 1.0), cam0(960, 560, 1.1)) : mov(t, 381.6, 390.9, cam0(960, 600, 1.7), cam0(960, 560, 1.15));
    cielo([[0, '#b8c2e2'], [0.6, '#e9d4e0'], [1, '#f2e6ee']]); sol(1500, 420, 40, '255,246,236', '255,200,210');
    capa(cam, 0.4, () => { montes(760, 160, '#c8c4dc', 1.7); });
    capa(cam, 1, () => { suelo(820, '#f7f5fc', '#d8d4e8');
      for (const [x, s] of [[300, 0.7], [560, 0.8], [1420, 0.75], [1680, 0.65]]) { g.save(); g.translate(x, 840); g.scale(s, s); g.beginPath(); g.moveTo(-60, 0); g.lineTo(-60, -150); g.arc(0, -150, 60, Math.PI, 0); g.lineTo(60, 0); g.closePath(); trazo('#bcb8c8', 4); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -150, 60, Math.PI * 1.15, Math.PI * 1.85); g.lineTo(0, -196); g.fill(); g.restore(); }
      g.save(); g.translate(960, 900); g.beginPath(); g.moveTo(-200, 0); g.lineTo(-200, -200); g.arc(0, -200, 200, Math.PI, 0); g.lineTo(200, 0); g.closePath(); trazo('#cfcad8'); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -200, 200, Math.PI * 1.2, Math.PI * 1.8); g.lineTo(0, -380); g.fill();
      rr(-150, -230, 300, 150, 10); trazo('#b39a6a', 4); g.font = '700 30px Lora'; g.fillStyle = '#3a2a1a'; g.textAlign = 'center'; g.fillText('HEROINE', 0, -180); g.font = '600 20px Lora'; g.fillText('WRANGEL ISLAND', 0, -140); g.fillText('EXPEDITION', 0, -112);
      for (let i = 0; i < 5; i++) { const fx = -170 + i * 80; g.beginPath(); g.moveTo(fx, 0); g.quadraticCurveTo(fx - 10, -40, fx + 6, -70); g.lineWidth = 4; g.strokeStyle = '#6a8a6a'; g.stroke(); g.beginPath(); g.arc(fx + 6, -74, 12, 0, TAU); g.fillStyle = ['#f2a7c0', '#f8d27a', '#c7a4f0', '#f2a7c0', '#9fd8f0'][i]; g.fill(); }
      g.restore(); });
    nieve(t, 0.5, 90, 15); bokeh(t, 0.5, '255,220,230'); grad('rgb(255,244,250)', 'rgb(140,130,170)', 0.3); vineta(0.4);
    lugar('Ada Blackjack murió en 1983', null, ven(t, 374.3, 378.2, 0.5));
    fundido(1 - cl((t - 374.1) / 0.8));
  } else {
    reset(); cielo([[0, '#2a2030'], [1, '#18121c']]); brillo(800, 200, 1100, '255,210,150', 0.7);
    papel(960, 540, 1300, 820, -0.02);
    escribir('$1,200  →  $200 mamá', 450, 330, 1, 60); escribir('$600  →  $100 mamá', 450, 450, 1, 60);
    escribir('el resto, para mi hijo', 450, 620, 1, 72, '#b33b67');
    const hl = sv((t - 393.9) / 1.4); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(255,190,210,0.9)'; g.fillRect(430, 580, 760 * hl, 80); g.restore();
    vineta(0.6);
    if (t > 396.6) { const a = cl((t - 396.8) / 0.8); fundido(a * 0.9); titular('Ada Blackjack · 1898–1983', a, 420, 84); titular('«Todo lo demás, para mi hijo.»', cl((t - 397.8) / 0.8), 540, 52, '#f6c7d6'); titular('— su diario, junio de 1923', cl((t - 398.6) / 0.8), 620, 32, '#e8dff0', '500'); }
    fundido(1 - cl((t - 390.9) / 0.5));
    fundido(cl((t - 402.4) / 1.0));
  }
}

const TOMAS = [[0, 32.2, s01], [32.2, 53.6, s02], [53.6, 97.3, s03], [97.3, 121.3, s04], [121.3, 155.0, s05], [155.0, 180.9, s06], [180.9, 208.9, s07], [208.9, 239.0, s08], [239.0, 258.8, s09], [258.8, 279.2, s10], [279.2, 299.7, s11], [299.7, 327.9, s12], [327.9, 337.6, s13], [337.6, 358.0, s14], [358.0, 374.1, s15], [374.1, 404, s16]];
window.renderAt = t => {
  g.limpiar(); reset();
  for (const [a, b, f] of TOMAS) if (t >= a && t < b) { g.save(); f(t); g.restore(); break; }
  reset(); C.grano(g, t, 0.03); subB(t);
};
