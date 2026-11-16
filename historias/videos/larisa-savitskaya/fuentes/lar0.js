const TAU = Math.PI * 2, RAD = Math.PI / 180, W = C.W, H = C.H;
const sv = C.suave, cl = C.clamp, lerp = C.lerp, hs = C.hash;
const ven = (t, a, b, d = 0.4) => cl((t - a) / d) * (1 - cl((t - (b - d)) / d));
const reset = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.globalCompositeOperation = 'source-over'; g.setLineDash([]); g.shadowBlur = 0; g.shadowColor = 'transparent'; };
const LINEA = C.LINEA;
const capa = (cam, prof, fn) => { g.save(); C.camara(g, cam, prof); fn(); g.restore(); };
const E = (x, y, z) => C.encuadre(x, y, z);
const mov = (t, a, b, c1, c2) => C.camLerp(c1, c2, sv((t - a) / (b - a)));
const u = (t, a, b) => cl((t - a) / (b - a));
function trazo(col, lw = 5) { g.fillStyle = col; g.fill(); g.lineWidth = lw; g.strokeStyle = LINEA; g.lineJoin = 'round'; g.stroke(); }
function rr(x, y, w, h, r) { C.rr(g, x, y, w, h, r); }
function vgrad(y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([p, c]) => gr.addColorStop(p, c)); return gr; }
function hgrad(x0, x1, stops) { const gr = g.createLinearGradient(x0, 0, x1, 0); stops.forEach(([p, c]) => gr.addColorStop(p, c)); return gr; }
function cielo(stops) { reset(); g.fillStyle = vgrad(0, H, stops); g.fillRect(0, 0, W, H); }
function brillo(x, y, r, col = '255,200,120', k = 1) { if (k <= 0) return; g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${0.55 * k})`); gr.addColorStop(0.4, `rgba(${col},${0.18 * k})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
function sombraSuelo(x, y, w, k = 0.3) { g.save(); g.translate(x, y); g.scale(1, 0.18); const gr = g.createRadialGradient(0, 0, 0, 0, 0, w); gr.addColorStop(0, `rgba(10,8,20,${k})`); gr.addColorStop(1, 'rgba(10,8,20,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, w, 0, TAU); g.fill(); g.restore(); }
function polvo(t, k = 1, col = '255,240,210', n = 40, x0 = 0, x1 = W, y0 = 0, y1 = H) { if (k <= 0) return; g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < n; i++) { const x = x0 + ((hs(i) * (x1 - x0) + t * (6 + hs(i * 2) * 10) + Math.sin(t * 0.6 + i) * 20) % (x1 - x0)), y = y0 + ((hs(i * 5) * (y1 - y0) - t * (4 + hs(i * 3) * 8)) % (y1 - y0) + (y1 - y0)) % (y1 - y0), r = 1.2 + hs(i * 7) * 2.6; g.globalAlpha = k * (0.3 + 0.5 * Math.abs(Math.sin(t * 1.3 + i))); g.fillStyle = `rgb(${col})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } g.restore(); }

const R = {
  larisa: { id: 'larisa', cuerpo: { complexion: 'delgada', estatura: 0.94 }, piel: '#f0d2b8', pelo: { estilo: 'largo', color: '#6b4a2f' }, ropa: { arriba: { tipo: 'vestido', color: '#c0504d' }, pies: { color: '#3a2c25' } } },
  vladimir: { id: 'vladimir', cuerpo: { complexion: 'medio', estatura: 1.04 }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#3a2c25' }, ropa: { arriba: { tipo: 'camisa', color: '#5f7fa8' }, abajo: { tipo: 'pantalon', color: '#3a3f4f' }, pies: { color: '#2a2220' } } },
  mama: { id: 'mama_larisa', cuerpo: { complexion: 'medio', estatura: 0.95 }, piel: '#f0d2b8', pelo: { estilo: 'coleta', color: '#7a5a45' }, ropa: { arriba: { tipo: 'chamarra', color: '#7a6a55' }, abajo: { tipo: 'falda', color: '#3a3f4f' }, pies: { color: '#3a2c25' } } },
  resc1: { id: 'rescatista1', cuerpo: { complexion: 'robusto', estatura: 1.05 }, piel: '#e8c3a4', pelo: { estilo: 'corto', color: '#4a3a2a' }, ropa: { arriba: { tipo: 'chamarra', color: '#e8802a' }, abajo: { tipo: 'pantalon', color: '#3a4a3a' }, pies: { color: '#2a2220' } } },
  resc2: { id: 'rescatista2', cuerpo: { complexion: 'medio', estatura: 1.0 }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#9a8a78' }, ropa: { arriba: { tipo: 'chamarra', color: '#e07226' }, abajo: { tipo: 'pantalon', color: '#3a4a3a' }, pies: { color: '#2a2220' } } },
  agente: { id: 'agente', cuerpo: { complexion: 'robusto', estatura: 1.06 }, piel: '#e4c6ae', pelo: { estilo: 'corto', color: '#2a2420' }, ropa: { arriba: { tipo: 'saco', color: '#33363f' }, abajo: { tipo: 'pantalon', color: '#25272e' }, pies: { color: '#1a1818' } } },
  medico: { id: 'medico', cuerpo: { complexion: 'medio', estatura: 1.02 }, piel: '#ecccb2', pelo: { estilo: 'corto', color: '#c9c3bb' }, ropa: { arriba: { tipo: 'saco', color: '#eef1ee' }, abajo: { tipo: 'pantalon', color: '#4a4e58' }, pies: { color: '#2a2220' } } },
  pas1: { id: 'pas1', cuerpo: { complexion: 'robusto', estatura: 1.0 }, piel: '#ead0b6', pelo: { estilo: 'corto', color: '#8a7a6a' }, ropa: { arriba: { tipo: 'saco', color: '#6b5a48' }, abajo: { tipo: 'pantalon', color: '#2f3038' }, pies: { color: '#2a2220' } } },
  pas2: { id: 'pas2', cuerpo: { complexion: 'medio', estatura: 0.95 }, piel: '#f2d8c2', pelo: { estilo: 'rizado', color: '#a0522d' }, ropa: { arriba: { tipo: 'vestido', color: '#3f7f6e' }, pies: { color: '#3a2c25' } } },
  pas3: { id: 'pas3', cuerpo: { complexion: 'medio', estatura: 0.92 }, piel: '#e9c9a9', pelo: { estilo: 'coleta', color: '#d9d2c5' }, ropa: { arriba: { tipo: 'chamarra', color: '#8d6a9c' }, abajo: { tipo: 'falda', color: '#3b3642' }, pies: { color: '#3a2c25' } } },
  pas4: { id: 'pas4', cuerpo: { complexion: 'delgado', estatura: 1.08 }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#1f1a17' }, ropa: { arriba: { tipo: 'sudadera', color: '#b2853f' }, abajo: { tipo: 'pantalon', color: '#2d3142' }, pies: { color: '#2a2220' } } },
  nino: { id: 'nino', cuerpo: { complexion: 'delgado', edad: 'nino', cabeza: 1.15 }, piel: '#f2d6be', pelo: { estilo: 'corto', color: '#c8a060' }, ropa: { arriba: { tipo: 'playera', color: '#d35f4f' }, abajo: { tipo: 'pantalon', color: '#2d4a7a' }, pies: { color: '#2a2220' } } }
};
const P = {}; for (const k in R) P[k] = C.personaje2(R[k]);
const L_DIA = { tinte: 'rgba(90,80,120,0.10)', borde: 'rgba(255,240,215,0.9)', off: [7, -3], bordeK: 0.55 };
const L_CALIDA = { tinte: 'rgba(120,70,40,0.18)', borde: 'rgba(255,214,150,0.95)', off: [8, -3], bordeK: 0.6 };
const L_FRIA = { tinte: 'rgba(50,70,90,0.26)', borde: 'rgba(215,230,240,0.75)', off: [-6, -3], bordeK: 0.5 };
const L_CINE = { tinte: 'rgba(20,30,70,0.45)', borde: 'rgba(170,205,255,0.9)', off: [-7, -2], bordeK: 0.7 };
const L_OFI = { tinte: 'rgba(60,70,50,0.25)', borde: 'rgba(255,235,170,0.8)', off: [7, -3], bordeK: 0.5 };
const dib = (p, e, luz = L_DIA) => C.iluminar(g, gg => P[p].dibujar(gg, { sombra: true, ...e }), luz);
const cara = (base, o = {}) => ({ ...C.cara2(base), ...o });
function paso(t, vel = 2.2, amp = 1) { const ps = Math.sin(t * vel * Math.PI) * amp; return { ps, pose: { dy: -Math.abs(ps) * 6, pi: [4 + Math.max(0, ps) * 12, -Math.max(0, ps) * 28], pd: [4 + Math.max(0, -ps) * 12, -Math.max(0, -ps) * 28], bi: [10 - ps * 16, 8], bd: [10 + ps * 16, 8] } }; }

function nube(x, y, s, col = [255, 255, 255], sombra = [170, 180, 210], a = 1, sem = 1) {
  g.save(); g.globalAlpha = a;
  const bolas = []; for (let i = 0; i < 9; i++) bolas.push([x + (hs(sem * 13 + i) - 0.5) * 300 * s, y - hs(sem * 7 + i * 3) * 70 * s - (1 - Math.abs(i - 4) / 4) * 50 * s, (55 + hs(sem + i * 5) * 55) * s * (1 - Math.abs(i - 4) / 9)]);
  for (const [bx, by, r] of bolas) { const gr = g.createRadialGradient(bx - r * 0.3, by - r * 0.4, r * 0.1, bx, by, r); gr.addColorStop(0, `rgb(${col})`); gr.addColorStop(1, `rgb(${sombra})`); g.fillStyle = gr; g.beginPath(); g.arc(bx, by, r, 0, TAU); g.fill(); }
  g.fillStyle = `rgb(${sombra})`; g.beginPath(); g.ellipse(x, y + 8 * s, 170 * s, 30 * s, 0, 0, TAU); g.fill();
  g.restore();
}
function asiento(x, y, s, o = {}) {
  const col = o.col || '#3d5f8f', col2 = o.col2 || '#2c4670', rot = o.rot || 0;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * (o.mira || 1), s);
  g.beginPath(); g.moveTo(-60, 0); g.lineTo(-66, 70); g.moveTo(40, 0); g.lineTo(48, 70); g.moveTo(-70, 70); g.lineTo(54, 70); g.lineWidth = 9; g.strokeStyle = '#6b6f78'; g.lineCap = 'round'; g.stroke(); g.lineWidth = 3; g.strokeStyle = LINEA; g.stroke();
  g.beginPath(); rr(-95, -40, 160, 50, 16); g.fillStyle = vgrad(-40, 10, [[0, col], [1, col2]]); g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke();
  g.beginPath(); g.moveTo(-95, -20); g.quadraticCurveTo(-118, -150, -100, -250); g.quadraticCurveTo(-90, -278, -60, -270); g.quadraticCurveTo(-52, -150, -55, -30); g.closePath(); g.fillStyle = hgrad(-118, -52, [[0, col2], [0.5, col], [1, col2]]); g.fill(); g.stroke();
  g.beginPath(); rr(-106, -290, 58, 50, 10); g.fillStyle = o.funda || '#efe9dc'; g.fill(); g.stroke();
  g.beginPath(); rr(-80, -78, 120, 16, 7); g.fillStyle = '#8a8e98'; g.fill(); g.lineWidth = 4; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-98 + i * 3, -220 + i * 50); g.lineTo(-62 + i, -220 + i * 50); g.stroke(); }
  g.restore();
}
function avion(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s * (o.mira || 1), s);
  const cuerpo = '#e9ecef', franja = '#2f5f9e';
  const parte = (fn) => { g.save(); fn(); g.restore(); };
  parte(() => { g.beginPath(); g.moveTo(-430, -20); g.lineTo(-500, -170); g.lineTo(-440, -170); g.lineTo(-360, -40); g.closePath(); trazo('#d9dde3', 5); g.beginPath(); g.moveTo(-470, -25); g.lineTo(-540, -10); g.lineTo(-420, 5); g.closePath(); trazo('#cfd4db', 4); });
  g.beginPath(); g.moveTo(-460, -30); g.quadraticCurveTo(-300, -62, 300, -58); g.quadraticCurveTo(420, -55, 470, -10); g.quadraticCurveTo(470, 30, 400, 42); g.lineTo(-350, 40); g.quadraticCurveTo(-430, 30, -470, 0); g.closePath();
  g.fillStyle = vgrad(-60, 42, [[0, '#ffffff'], [0.55, cuerpo], [1, '#b9c0ca']]); g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke();
  g.save(); g.clip(); g.fillStyle = franja; g.fillRect(-500, -6, 1000, 13); g.fillStyle = '#9fb0c4'; g.fillRect(-500, 22, 1000, 30); g.restore();
  g.fillStyle = '#2b3a52'; for (let i = 0; i < 13; i++) { g.beginPath(); rr(-300 + i * 46, -34, 20, 18, 7); g.fill(); }
  g.beginPath(); g.moveTo(400, -40); g.quadraticCurveTo(440, -36, 452, -16); g.lineTo(410, -16); g.closePath(); g.fillStyle = '#26364d'; g.fill();
  g.beginPath(); g.moveTo(-120, -62); g.lineTo(120, -62); g.lineTo(150, -48); g.lineTo(-140, -48); g.closePath(); trazo('#cfd4db', 4);
  g.beginPath(); rr(-40, -66, 210, 34, 16); trazo('#c4cad3', 4);
  g.beginPath(); g.moveTo(170, -50); g.quadraticCurveTo(205, -49, 212, -40); g.lineTo(170, -36); g.closePath(); trazo('#6b7280', 3);
  const ang = t * 40; g.save(); g.translate(214, -42); g.globalAlpha = 0.5; g.fillStyle = 'rgba(200,210,225,0.55)'; g.beginPath(); g.ellipse(0, 0, 8, 62, 0, 0, TAU); g.fill(); g.globalAlpha = 1; g.strokeStyle = '#3a3f48'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -60 * Math.cos(ang)); g.lineTo(0, 60 * Math.cos(ang)); g.stroke(); g.restore();
  g.restore();
}
function bombardero(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s * (o.mira || 1), s);
  g.beginPath(); g.moveTo(-380, -20); g.lineTo(-470, -150); g.lineTo(-420, -150); g.lineTo(-320, -30); g.closePath(); trazo('#7d848c', 5);
  g.beginPath(); g.moveTo(-60, -10); g.lineTo(-260, 120); g.lineTo(-200, 126); g.lineTo(60, 10); g.closePath(); trazo('#6b7178', 5);
  g.beginPath(); g.moveTo(-440, -14); g.quadraticCurveTo(-200, -46, 300, -36); g.quadraticCurveTo(430, -30, 470, 0); g.quadraticCurveTo(430, 30, 300, 32); g.lineTo(-400, 22); g.closePath();
  g.fillStyle = vgrad(-46, 32, [[0, '#a9b0b8'], [0.6, '#868d96'], [1, '#5d636b']]); g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke();
  g.beginPath(); g.moveTo(330, -30); g.quadraticCurveTo(420, -26, 455, -4); g.lineTo(350, -6); g.closePath(); g.fillStyle = '#3c4a5c'; g.fill();
  g.beginPath(); g.moveTo(-40, -6); g.lineTo(-190, -70); g.lineTo(-140, -72); g.lineTo(40, -14); g.closePath(); trazo('#959ca4', 4);
  g.beginPath(); rr(-40, 4, 150, 26, 12); trazo('#70767e', 4);
  g.fillStyle = '#c23b2e'; g.beginPath(); g.arc(-360, -70, 12, 0, TAU); g.fill();
  g.restore();
}
function helicoptero(x, y, s, t, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s * (o.mira || 1), s);
  g.beginPath(); g.moveTo(-120, -10); g.lineTo(-420, -40); g.lineTo(-420, -10); g.lineTo(-120, 30); g.closePath(); trazo('#5f6e52', 5);
  g.beginPath(); g.moveTo(-430, -110); g.lineTo(-400, -40); g.lineTo(-380, -40); g.lineTo(-405, -110); g.closePath(); trazo('#55644a', 4);
  g.save(); g.translate(-420, -60); g.globalAlpha = 0.45; g.fillStyle = 'rgba(40,40,40,0.5)'; g.beginPath(); g.arc(0, 0, 46, 0, TAU); g.fill(); g.restore();
  g.beginPath(); g.moveTo(-150, -70); g.quadraticCurveTo(-100, -100, 120, -96); g.quadraticCurveTo(230, -90, 260, -10); g.quadraticCurveTo(250, 60, 170, 70); g.lineTo(-130, 70); g.quadraticCurveTo(-170, 40, -150, -70); g.closePath();
  g.fillStyle = vgrad(-100, 70, [[0, '#8a9a74'], [1, '#4f5c42']]); g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke();
  g.beginPath(); g.moveTo(170, -80); g.quadraticCurveTo(240, -70, 255, -10); g.lineTo(175, -10); g.closePath(); g.fillStyle = '#9fc3d6'; g.fill(); g.lineWidth = 4; g.stroke();
  g.fillStyle = '#2d3a42'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-80 + i * 55, -30, 14, 0, TAU); g.fill(); }
  g.fillStyle = '#c7372d'; g.beginPath(); g.arc(-250, -14, 11, 0, TAU); g.fill();
  g.beginPath(); rr(-60, -128, 150, 34, 12); trazo('#6c7b5c', 4);
  g.strokeStyle = LINEA; g.lineWidth = 6; g.beginPath(); g.moveTo(-110, 70); g.lineTo(-110, 100); g.moveTo(160, 70); g.lineTo(160, 100); g.moveTo(-150, 100); g.lineTo(200, 100); g.stroke();
  g.save(); g.translate(15, -134); g.globalAlpha = 0.35; g.fillStyle = 'rgba(60,60,60,0.6)'; g.beginPath(); g.ellipse(0, 0, 470, 22, 0, 0, TAU); g.fill(); g.globalAlpha = 1; g.strokeStyle = '#2b2b2b'; g.lineWidth = 7; const a = Math.cos(t * 30) * 470; g.beginPath(); g.moveTo(-a, -3); g.lineTo(a, 3); g.stroke(); g.restore();
  g.restore();
}
function abedul(x, y, h, w, sem, t = 0, hoja = '#b8c46a') {
  g.save();
  const sway = Math.sin(t * 0.8 + sem) * 4;
  g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x - w * 0.45 + sway * 0.3, y - h * 0.5, x - w * 0.35 + sway, y - h); g.lineTo(x + w * 0.35 + sway, y - h); g.quadraticCurveTo(x + w * 0.45 + sway * 0.3, y - h * 0.5, x + w / 2, y); g.closePath();
  g.fillStyle = hgrad(x - w / 2, x + w / 2, [[0, '#f4f1ea'], [0.6, '#e6e2d8'], [1, '#b9b5ad']]); g.fill(); g.lineWidth = 4; g.strokeStyle = LINEA; g.stroke();
  g.save(); g.clip(); g.fillStyle = '#2b2622'; for (let i = 0; i < Math.floor(h / 38); i++) { const yy = y - 20 - i * 38 - hs(sem + i) * 15, xx = x + (hs(sem * 3 + i) - 0.5) * w * 0.7, ww = 6 + hs(sem + i * 7) * w * 0.5; g.beginPath(); g.ellipse(xx, yy, ww, 3 + hs(i + sem) * 3, (hs(i) - 0.5) * 0.3, 0, TAU); g.fill(); } g.restore();
  g.strokeStyle = '#4a403a'; g.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const yy = y - h * (0.55 + i * 0.08), sx = i % 2 ? 1 : -1, l = 50 + hs(sem + i * 11) * 70; g.beginPath(); g.moveTo(x + sway * 0.8, yy); g.quadraticCurveTo(x + sx * l * 0.6, yy - 20, x + sx * l + sway, yy - 40); g.stroke(); }
  for (let i = 0; i < 26; i++) { const a = hs(sem * 5 + i) * TAU, r = hs(sem + i * 3) * w * 3.2, xx = x + sway + Math.cos(a) * r, yy = y - h * 0.82 + Math.sin(a) * r * 0.7; g.beginPath(); g.arc(xx, yy, 14 + hs(i * 9 + sem) * 16, 0, TAU); g.fillStyle = hs(i + sem * 2) > 0.5 ? hoja : '#8fa456'; g.globalAlpha = 0.9; g.fill(); }
  g.globalAlpha = 1; g.restore();
}
function helecho(x, y, s, t, sem = 1, col = '#5d7d43') {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32 + Math.sin(t * 1.2 + sem + i) * 0.04, l = 90 + hs(sem + i) * 50; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); const ex = Math.cos(a) * l, ey = Math.sin(a) * l; g.quadraticCurveTo(ex * 0.5, ey * 0.7 - 10, ex, ey); g.stroke(); g.lineWidth = 3; for (let j = 1; j < 8; j++) { const q = j / 8, px = ex * q, py = ey * q - Math.sin(q * Math.PI) * 10, ll = (1 - q) * 22 + 4; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a - 1.2) * ll, py + Math.sin(a - 1.2) * ll); g.moveTo(px, py); g.lineTo(px + Math.cos(a + 1.2) * ll, py + Math.sin(a + 1.2) * ll); g.stroke(); } }
  g.restore();
}
function charco(x, y, w, h, t, cieloCol = 'rgba(200,210,215,0.7)') {
  g.save(); g.beginPath(); g.ellipse(x, y, w, h, 0, 0, TAU); g.fillStyle = 'rgba(70,80,85,0.6)'; g.fill(); g.clip(); g.fillStyle = cieloCol; g.fillRect(x - w, y - h, w * 2, h);
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { const q = (t * 0.7 + i * 0.25 + hs(x + i)) % 1, cx = x + (hs(i * 3 + x) - 0.5) * w, cy = y + (hs(i * 5 + y) - 0.5) * h; g.globalAlpha = 1 - q; g.beginPath(); g.ellipse(cx, cy, q * 40, q * 10, 0, 0, TAU); g.stroke(); }
  g.restore();
}
function mosquitos(cx, cy, t, n = 14, r = 90, k = 1) { if (k <= 0) return; g.save(); g.globalAlpha = k; for (let i = 0; i < n; i++) { const a = t * (2 + hs(i) * 3) + i * 1.7, x = cx + Math.cos(a) * r * (0.4 + hs(i * 3) * 0.6) + Math.sin(t * 9 + i) * 6, y = cy + Math.sin(a * 1.3) * r * 0.6 * (0.4 + hs(i * 5) * 0.6); g.fillStyle = '#1d1a18'; g.beginPath(); g.ellipse(x, y, 5, 3, a, 0, TAU); g.fill(); g.fillStyle = 'rgba(220,230,240,0.6)'; const f = Math.sin(t * 60 + i) * 4; g.beginPath(); g.ellipse(x - 2, y - 4, 5, 2 + f * 0.3, -0.5, 0, TAU); g.ellipse(x + 2, y - 4, 5, 2 - f * 0.3, 0.5, 0, TAU); g.fill(); } g.restore(); }
function lluvia(t, k = 1, n = 260) { C.lluvia(g, t, { k, n, vel: 1300, ang: 10, color: '220,230,235', grosor: 2 }); }
function salpica(t, k, y0, y1, n = 30) { if (k <= 0) return; g.save(); g.strokeStyle = `rgba(230,240,245,${0.5 * k})`; g.lineWidth = 2; for (let i = 0; i < n; i++) { const q = (t * 2.2 + hs(i)) % 1, x = hs(i * 7 + Math.floor(t * 2.2 + hs(i))) * W, y = y0 + hs(i * 3 + Math.floor(t * 2.2 + hs(i))) * (y1 - y0); g.globalAlpha = 1 - q; g.beginPath(); g.ellipse(x, y, 4 + q * 14, 2 + q * 3, 0, Math.PI, TAU); g.stroke(); } g.restore(); }
function sello(txt, x, y, a, rot = -0.12, tam = 90, col = '#c8302a') {
  if (a <= 0) return; const s = 1 + (1 - C.salida(a)) * 1.6; g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = Math.min(1, a * 1.5) * 0.92;
  g.font = `800 ${tam}px Inter`; const w = g.measureText(txt).width + tam * 0.6, h = tam * 1.35; g.strokeStyle = col; g.lineWidth = tam * 0.09; g.beginPath(); rr(-w / 2, -h / 2, w, h, tam * 0.12); g.stroke(); g.lineWidth = tam * 0.035; g.beginPath(); rr(-w / 2 + tam * 0.12, -h / 2 + tam * 0.12, w - tam * 0.24, h - tam * 0.24, tam * 0.08); g.stroke();
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, tam * 0.04);
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 60; i++) { g.globalAlpha = 0.5; g.beginPath(); g.arc((hs(i) - 0.5) * w, (hs(i * 3) - 0.5) * h, 2 + hs(i * 7) * 5, 0, TAU); g.fill(); }
  g.restore();
}
function rotuloLugar(txt, sub, a) {
  if (a <= 0) return; reset(); g.save(); g.globalAlpha = a; const k = C.salida(a);
  g.font = '700 40px Inter'; const w = Math.max(g.measureText(txt).width, (g.font = '500 26px Inter', g.measureText(sub || '').width)) + 70;
  g.fillStyle = 'rgba(16,14,24,0.6)'; g.beginPath(); rr(70 - (1 - k) * 30, 64, w, sub ? 116 : 76, 16); g.fill();
  g.fillStyle = '#e04a3c'; g.fillRect(70 - (1 - k) * 30, 64, 8, sub ? 116 : 76);
  g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = '700 40px Inter'; g.fillText(txt, 106 - (1 - k) * 30, 103); if (sub) { g.font = '500 26px Inter'; g.fillStyle = '#d8d6e0'; g.fillText(sub, 106 - (1 - k) * 30, 146); }
  g.restore();
}
function grande(txt, x, y, a, tam = 120, col = '#fff', fuente = '800', o = {}) { if (a <= 0) return; g.save(); g.globalAlpha = a; g.font = `${fuente} ${tam}px Inter`; g.textAlign = o.al || 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 26; g.fillStyle = col; g.fillText(txt, x, y + (1 - C.salida(a)) * 24); g.restore(); }
function fundido(k, col = '#000') { if (k <= 0) return; reset(); g.globalAlpha = cl(k); g.fillStyle = col; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
function destello(k) { if (k <= 0) return; reset(); g.globalCompositeOperation = 'screen'; g.globalAlpha = cl(k); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); reset(); }
function papel(x, y, w, h, ang = 0, col = '#f3ecdc') { g.save(); g.translate(x, y); g.rotate(ang); g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 24; g.shadowOffsetY = 10; g.fillStyle = col; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent'; const gr = g.createRadialGradient(0, 0, w * 0.2, 0, 0, w * 0.8); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(150,120,70,0.22)'); g.fillStyle = gr; g.fillRect(-w / 2, -h / 2, w, h); g.restore(); }
function lineasTexto(x, y, w, n, paso = 26, col = 'rgba(60,55,50,0.55)', sem = 1) { g.fillStyle = col; for (let i = 0; i < n; i++) { const ww = w * (0.6 + hs(sem + i) * 0.4); g.fillRect(x, y + i * paso, ww, paso * 0.35); } }
function madera(x, y, w, h, c1 = '#7a5236', c2 = '#5d3d27') { g.save(); g.beginPath(); g.rect(x, y, w, h); g.fillStyle = vgrad(y, y + h, [[0, c1], [1, c2]]); g.fill(); g.clip(); g.strokeStyle = 'rgba(30,15,5,0.18)'; g.lineWidth = 2; for (let i = 0; i < h / 14; i++) { g.beginPath(); for (let xx = x; xx < x + w; xx += 40) g.lineTo(xx, y + i * 14 + Math.sin(xx * 0.01 + i) * 4); g.stroke(); } g.restore(); }
function subrayaZoom(t, a, b, z0, z1) { return lerp(z0, z1, sv(u(t, a, b))); }
