const lar = (t, x, y, k, e = {}, luz = L_DIA) => dib('larisa', { t, x, y, escala: k, ...e }, luz);
const vla = (t, x, y, k, e = {}, luz = L_DIA) => dib('vladimir', { t, x, y, escala: k, ...e }, luz);

function cieloAlto(t, cam, sube = 0, tarde = 0) {
  cielo([[0, '#16305e'], [0.45, '#3f6fb2'], [0.8, lerp(0, 1, tarde) > 0.5 ? '#f2b38b' : '#9fc0e3'], [1, '#f4d2b0']]);
  brillo(1500, 260, 520, '255,225,180', 0.8);
  for (let L = 0; L < 3; L++) {
    const vel = sube * (0.4 + L * 0.5), sc = 0.6 + L * 0.45, alpha = 0.55 + L * 0.2;
    for (let i = 0; i < 6; i++) {
      const x = ((hs(i * 7 + L * 31) * (W + 800) - (cam ? cam.x * (0.2 + L * 0.3) : 0)) % (W + 800) + W + 800) % (W + 800) - 400;
      const y = (((hs(i * 3 + L * 17) * (H + 600) - t * vel) % (H + 600)) + H + 600) % (H + 600) - 300;
      nube(x, y, sc, [255, 250, 245], L === 0 ? [176, 190, 220] : [190, 200, 228], alpha, i + L * 10);
    }
  }
}
function asientoConLarisa(t, x, y, s, rot, caraL, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.translate(-x, -y);
  sentadaF(t, 'larisa', x, y + 200 * s, s * 0.9, { cara: caraL, mira: o.mira || [0.2, -0.3], pose: { tor: o.tor || 0, cab: o.cab || 4, hombros: 8, pi: [16, -20, 0.9], pd: [-16, -20, 0.9] }, manoI: [-120, -150], manoD: [120, -150], pelo: [Math.sin(t * 7) * 20, -70] }, o.luz || L_DIA, { col: '#b23a35', col2: '#7e2622' });
  g.restore();
}
function taigaAerea(t, k, q) {
  if (k <= 0) return; const yh = lerp(H + 40, 120, Math.pow(q, 1.6));
  g.save(); g.globalAlpha = k; g.beginPath(); g.rect(0, yh, W, H - yh + 10); g.fillStyle = vgrad(yh, H, [[0, '#7d8f86'], [0.25, '#4f6a46'], [1, '#2c4430']]); g.fill(); g.clip();
  for (let i = 0; i < 260; i++) { const d = hs(i * 3), y = yh + Math.pow(d, 1.8) * (H - yh + 200), sc = 0.2 + Math.pow(d, 1.8) * 2.2, x = ((hs(i) * (W + 400) + (hs(i * 7) - 0.5) * t * 30) % (W + 400)) - 200; g.fillStyle = ['#3d5e3a', '#4c6f42', '#2a4430', '#5a7d4a', '#8c9b52', '#e6e2d6'][i % 6]; g.beginPath(); g.ellipse(x, y, 34 * sc, 22 * sc, 0, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(200,215,220,0.35)'; g.fillRect(0, yh, W, 60); g.restore();
}
function asientoF(x, y, s, o = {}) {
  const col = o.col || '#3d5f8f', col2 = o.col2 || '#2c4670';
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = LINEA; g.lineWidth = 9; g.beginPath(); g.moveTo(-90, -80); g.lineTo(-100, 0); g.moveTo(90, -80); g.lineTo(100, 0); g.stroke();
  g.beginPath(); rr(-118, -470, 236, 380, 46); g.fillStyle = hgrad(-118, 118, [[0, col2], [0.35, col], [0.7, col], [1, col2]]); g.fill(); g.lineWidth = 6; g.strokeStyle = LINEA; g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 4; for (const xx of [-40, 40]) { g.beginPath(); g.moveTo(xx, -380); g.lineTo(xx, -110); g.stroke(); }
  g.beginPath(); rr(-80, -488, 160, 70, 14); g.fillStyle = o.funda || '#efe9dc'; g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke();
  g.beginPath(); rr(-126, -128, 252, 56, 22); g.fillStyle = vgrad(-128, -72, [[0, col], [1, col2]]); g.fill(); g.lineWidth = 6; g.strokeStyle = LINEA; g.stroke();
  g.restore();
}
function brazosAsiento(x, y, s, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); for (const sx of [-1, 1]) { g.beginPath(); rr(sx * 132 - 18, -200, 36, 120, 12); g.fillStyle = '#8a8e98'; g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke(); } g.restore(); }
function sentadaF(t, quien, x, y, s, e, luz, o = {}) { asientoF(x, y, s, o); dib(quien, { t, x, y: y + 12 * s, escala: s * 0.95, sombra: false, ...e, pose: { sentado: true, pi: [6, 0, 0.9], pd: [-6, 0, 0.9], ...(e.pose || {}) } }, luz); if (!o.sinBrazos) brazosAsiento(x, y, s); }
function s01(t) {
  const cam = { x: Math.sin(t * 0.3) * 20, y: 0, zoom: 1 + t * 0.006, rot: Math.sin(t * 0.5) * 1.2 };
  cieloAlto(t, cam, 260);
  const s = 0.95 + t * 0.01, rot = Math.sin(t * 0.9) * 0.18 + Math.sin(t * 2.3) * 0.04;
  const y = 600 + Math.sin(t * 1.4) * 14;
  for (let i = 0; i < 18; i++) { g.save(); g.strokeStyle = `rgba(255,255,255,${0.25 + hs(i) * 0.3})`; g.lineWidth = 2 + hs(i * 3) * 3; const x = 760 + hs(i * 5) * 400, yy = ((hs(i * 7) * H - t * 900 * (1 + hs(i))) % H + H) % H; g.beginPath(); g.moveTo(x, yy); g.lineTo(x, yy + 80 + hs(i) * 120); g.stroke(); g.restore(); }
  asientoConLarisa(t, 960, y + 60, s * 1.45, rot, cara('miedo', { boca: 'linea', ab: 0, cej: 24 }), { pelo: [0, -60] });
  reset(); const ofi = ven(t, 11.9, 21.6, 0.15);
  if (t > 12) { C.gradacion(g, 'rgba(120,120,130,0.9)', 'rgba(80,80,90,0.9)', cl((t - 12) / 0.3) * 0.55, 'saturation'); }
  grande('5,220 m', 1560, 520, ven(t, 3.6, 11.9, 0.5), 150, '#ffffff', '900');
  grande('de altura', 1560, 620, ven(t, 4.0, 11.9, 0.5), 44, '#e8eefc', '600');
  if (t < 15.6) sello('OFICIALMENTE: NO OCURRIÓ', 960, 860, ofi > 0 ? cl((t - 12.0) / 0.35) * (1 - u(t, 15.2, 15.6)) : 0, -0.06, 80);
  const ti = ven(t, 15.6, 19.6, 0.5); if (ti > 0) { reset(); g.save(); g.globalAlpha = ti * 0.65; g.fillStyle = '#0c0a12'; g.fillRect(0, 760, W, 220); g.restore(); grande('LARISA SAVITSKAYA', 960, 840, ti, 92, '#fff', '900'); grande('Vuelo 811 · 24 de agosto de 1981', 960, 920, ti, 38, '#f4c7c0', '600'); }
  const et = ven(t, 0.4, 7, 0.5); if (et > 0) { reset(); g.save(); g.globalAlpha = et; g.font = '700 26px Inter'; g.fillStyle = 'rgba(15,12,25,0.55)'; rr(60, 50, 560, 56, 28); g.fill(); g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.fillText('HISTORIA REAL · RECONSTRUCCIÓN ANIMADA', 92, 79); g.restore(); }
  if (t > 19.4) { const k = u(t, 19.4, 21.4); reset(); g.save(); g.globalAlpha = k * 0.8; for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(255,255,255,${0.1 + hs(i + Math.floor(t * 24)) * 0.3})`; g.fillRect(0, hs(i * 3 + Math.floor(t * 24)) * H, W, 2 + hs(i) * 6); } g.restore(); fundido(sv(u(t, 20.4, 21.4)), '#f6efe4'); }
}

function edificioPanel(x, y, w, h, pisos, cols, col, sem, t) {
  g.beginPath(); g.rect(x, y - h, w, h); g.fillStyle = vgrad(y - h, y, [[0, col], [1, '#b8ab9a']]); g.fill(); g.lineWidth = 4; g.strokeStyle = LINEA; g.stroke();
  g.strokeStyle = 'rgba(80,70,60,0.25)'; g.lineWidth = 2; for (let p = 1; p < pisos; p++) { g.beginPath(); g.moveTo(x, y - h + p * h / pisos); g.lineTo(x + w, y - h + p * h / pisos); g.stroke(); }
  for (let p = 0; p < pisos; p++) for (let c = 0; c < cols; c++) {
    const wx = x + 18 + c * (w - 36) / cols, wy = y - h + 14 + p * h / pisos, ww = (w - 36) / cols - 22, wh = h / pisos - 30;
    g.fillStyle = hs(sem + p * 13 + c) > 0.82 ? '#ffe2a6' : '#7d93a8'; g.fillRect(wx, wy, ww, wh); g.strokeStyle = '#efe7da'; g.lineWidth = 3; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke();
    if (hs(sem * 3 + p + c * 7) > 0.6 && p > 0) { g.fillStyle = '#d8cdbd'; g.fillRect(wx - 6, wy + wh - 4, ww + 12, 12); g.strokeStyle = LINEA; g.lineWidth = 2; g.strokeRect(wx - 6, wy + wh - 4, ww + 12, 12); if (hs(sem + p * c) > 0.5) { g.fillStyle = ['#e07a7a', '#7ab8e0', '#f2d06b'][(p + c) % 3]; g.fillRect(wx + 6, wy + wh - 14, 14, 10); } }
  }
  g.fillStyle = '#8c7f70'; g.fillRect(x - 6, y - h - 12, w + 12, 14);
}
function arbolFlor(x, y, s, t, sem) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-12, 0); g.quadraticCurveTo(-6, -120, -30, -200); g.lineTo(-14, -205); g.quadraticCurveTo(8, -140, 14, -110); g.quadraticCurveTo(30, -170, 50, -200); g.lineTo(62, -192); g.quadraticCurveTo(30, -130, 14, 0); g.closePath(); trazo('#5a4232', 4);
  for (let i = 0; i < 38; i++) { const a = hs(sem + i) * TAU, r = Math.sqrt(hs(sem * 3 + i)) * 130, xx = Math.cos(a) * r * 1.2, yy = -230 + Math.sin(a) * r * 0.7 + Math.sin(t + i) * 2; g.beginPath(); g.arc(xx, yy, 26 + hs(i * 7) * 20, 0, TAU); g.fillStyle = ['#f7d3dc', '#f1b9c8', '#fbe7ec', '#e9a6ba', '#a9c98a'][i % 5]; g.fill(); }
  g.restore();
}
function petalos(t, k = 1, n = 40) { if (k <= 0) return; g.save(); for (let i = 0; i < n; i++) { const x = ((hs(i) * (W + 200) - t * (40 + hs(i * 3) * 40)) % (W + 200) + W + 200) % (W + 200) - 100, y = ((hs(i * 5) * (H + 100) + t * (50 + hs(i * 2) * 50)) % (H + 100)) - 50; g.globalAlpha = k * 0.8; g.fillStyle = i % 2 ? '#f6c6d2' : '#fde5eb'; g.save(); g.translate(x, y); g.rotate(t * 2 + i); g.beginPath(); g.ellipse(0, 0, 7, 4, 0, 0, TAU); g.fill(); g.restore(); } g.restore(); }
function trolebus(x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = LINEA; g.lineWidth = 5; g.beginPath(); g.moveTo(-120, -250); g.lineTo(60, -430); g.moveTo(-60, -250); g.lineTo(120, -430); g.stroke();
  g.beginPath(); rr(-330, -260, 660, 240, 40); g.fillStyle = vgrad(-260, -20, [[0, '#f0e6cf'], [0.5, '#e9dbb8'], [0.52, '#d24c3c'], [1, '#a8382d']]); g.fill(); g.lineWidth = 5; g.stroke();
  g.fillStyle = '#9cc0d8'; for (let i = 0; i < 6; i++) { g.beginPath(); rr(-300 + i * 100, -230, 80, 90, 10); g.fill(); g.stroke(); }
  for (const wx of [-200, 200]) { g.beginPath(); g.arc(wx, -20, 42, 0, TAU); trazo('#2b2b30', 5); g.beginPath(); g.arc(wx, -20, 16, 0, TAU); trazo('#9a9aa2', 3); }
  g.restore();
}
function cables(y, cam) { g.strokeStyle = 'rgba(40,40,50,0.7)'; g.lineWidth = 3; for (const d of [0, 30]) { g.beginPath(); for (let x = -500; x < 4000; x += 50) g.lineTo(x, y + d + Math.sin(x * 0.004) * 8); g.stroke(); } }

function s02(t) {
  if (t < 33.45) {
    const cam = mov(t, 21.4, 33.45, E(900, 640, 1.3), E(1650, 660, 1.36));
    cielo([[0, '#8fb6dc'], [0.6, '#cfe2ef'], [1, '#f6eadf']]); brillo(300, 150, 500, '255,240,210', 0.6);
    capa(cam, 0.15, () => { nube(400, 200, 0.8, [255, 255, 255], [214, 224, 238], 0.9, 3); nube(1500, 150, 0.6, [255, 255, 255], [214, 224, 238], 0.8, 5); nube(2300, 230, 0.7, [255, 255, 255], [214, 224, 238], 0.8, 8); });
    capa(cam, 0.45, () => { edificioPanel(-200, 820, 700, 520, 5, 6, '#e9dfcf', 3, t); edificioPanel(620, 800, 620, 470, 5, 5, '#e8d6c2', 7, t); edificioPanel(1380, 830, 760, 540, 5, 7, '#dde0d2', 11, t); edificioPanel(2260, 810, 640, 480, 5, 5, '#ecdcc8', 17, t); g.fillStyle = 'rgba(205,215,225,0.35)'; g.fillRect(-1000, 300, 5000, 600); });
    capa(cam, 0.75, () => { g.fillStyle = vgrad(800, 900, [[0, '#8d8f93'], [1, '#6c6e73']]); g.fillRect(-1000, 800, 5000, 140); cables(330, cam); const tx = lerp(-900, 3600, u(t, 22.5, 31)); trolebus(tx, 905, 0.9); [[-200, 3], [500, 5], [1250, 9], [1900, 12], [2600, 14]].forEach(([x, s]) => arbolFlor(x, 940, 1.15, t, s)); });
    capa(cam, 1, () => {
      g.fillStyle = vgrad(930, 1100, [[0, '#c9c1b6'], [1, '#a59c90']]); g.fillRect(-1000, 930, 5000, 200); g.strokeStyle = 'rgba(90,80,70,0.25)'; g.lineWidth = 3; for (let x = -1000; x < 4000; x += 160) { g.beginPath(); g.moveTo(x, 930); g.lineTo(x - 60, 1100); g.stroke(); }
      const x0 = lerp(560, 1700, u(t, 21.4, 33.4)), p = paso(t, 1.9, 0.9);
      sombraSuelo(x0, 1010, 80); sombraSuelo(x0 + 190, 1010, 90);
      lar(t, x0, 1010, 1.0, { cara: t > 29.6 ? cara('feliz', { ab: 0.2 }) : cara('tranquila'), mira: [t % 6 < 3 ? 0.7 : 0.4, 0.1], pose: p.pose }, L_DIA);
      g.save(); g.fillStyle = '#6d4b8a'; g.beginPath(); rr(x0 - 80, 850 + p.ps * 4, 54, 64, 8); trazo('#7a5aa0', 4); g.fillStyle = '#e9e1d0'; g.fillRect(x0 - 74, 846 + p.ps * 4, 42, 10); g.restore();
      vla(t, x0 + 190, 1010, 1.03, { cara: cara('feliz', { ab: 0.15 }), mira: [-0.6, 0.1], pose: paso(t + 0.3, 1.9, 0.9).pose }, L_DIA);
      g.save(); g.translate(x0 + 280, 860); g.rotate(0.2); g.beginPath(); rr(-26, -36, 52, 70, 6); trazo('#2f5e3f', 4); g.fillStyle = '#d33'; g.fillRect(-6, -26, 12, 30); g.restore();
    });
    petalos(t, 1, 34);
    rotuloLugar('Blagoveshchensk, URSS', 'Primavera de 1981 · frontera con China', ven(t, 22.0, 28.4, 0.5));
    if (t > 32.9) fundido(u(t, 32.9, 33.45) * 0.9, '#fff');
  } else {
    const cam = mov(t, 33.45, 37.6, E(960, 560, 1.0), E(1060, 600, 1.1));
    capa(cam, 1, () => {
      g.fillStyle = vgrad(0, 1080, [[0, '#d9cdb5'], [1, '#bba98b']]); g.fillRect(-500, -500, 3000, 2200);
      g.fillStyle = 'rgba(120,100,70,0.12)'; for (let i = 0; i < 30; i++) g.fillRect(-500 + i * 100, -500, 50, 2200);
      g.save(); g.translate(430, 380); g.beginPath(); rr(-200, -250, 400, 520, 10); trazo('#f6efe2', 6); g.beginPath(); g.rect(-180, -230, 360, 260); g.fillStyle = vgrad(-230, 30, [[0, '#66b7e0'], [0.6, '#a8dbef'], [0.61, '#3d8fc2'], [1, '#2e6f9e']]); g.fill(); g.beginPath(); g.arc(90, -150, 44, 0, TAU); g.fillStyle = '#ffd36b'; g.fill(); g.beginPath(); g.moveTo(-180, 30); g.quadraticCurveTo(-60, -40, 40, 30); g.fillStyle = '#d9c38a'; g.fill(); g.font = '800 64px Inter'; g.fillStyle = '#c0392b'; g.textAlign = 'center'; g.fillText('CRIMEA', 0, 120); g.font = '600 30px Inter'; g.fillStyle = '#3d5f8f'; g.fillText('Mar Negro', 0, 170); g.restore();
      madera(860, 640, 1200, 460, '#8a6a4b', '#6e5139'); g.lineWidth = 5; g.strokeStyle = LINEA; g.strokeRect(860, 640, 1200, 460);
      g.beginPath(); rr(1000, 230, 760, 410, 14); trazo('#4d4a46', 6); g.fillStyle = vgrad(250, 620, [[0, '#cfe0e4'], [1, '#a9bec4']]); g.fillRect(1024, 254, 712, 362); g.save(); g.beginPath(); g.rect(1024, 254, 712, 362); g.clip(); dib('pas3', { t, x: 1380, y: 1000, escala: 1.0, cara: 'neutral', mira: [0, 0.2], pose: {}, sombra: false }, L_CALIDA); g.restore(); g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(1040, 254); g.lineTo(1200, 254); g.lineTo(1080, 616); g.lineTo(1040, 616); g.fill(); g.beginPath(); rr(1180, 150, 400, 70, 10); trazo('#c0392b', 5); g.fillStyle = '#fff'; g.font = '800 44px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BOLETOS', 1380, 186); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      brillo(1380, 330, 260, '255,230,170', 0.5);
      const cierra = sv(u(t, 35.7, 36.4)); g.save(); g.beginPath(); g.rect(1024, 254, 712, 362); g.clip(); g.fillStyle = '#9aa1a7'; g.fillRect(1024, 254, 712, 362 * cierra); g.strokeStyle = '#6f767c'; g.lineWidth = 3; for (let yy = 254; yy < 254 + 362 * cierra; yy += 24) { g.beginPath(); g.moveTo(1024, yy); g.lineTo(1736, yy); g.stroke(); } g.restore();
      if (cierra > 0.6) { const a = u(t, 36.0, 36.3); g.save(); g.globalAlpha = a; g.translate(1380, 435); g.beginPath(); g.arc(0, 0, 90, 0, TAU); trazo('#d6302a', 6); g.fillStyle = '#fff'; g.fillRect(-60, -16, 120, 32); g.restore(); }
      sombraSuelo(1200, 1040, 90); sombraSuelo(1480, 1040, 90);
      const mira = t > 36.5 ? 1 : 0;
      lar(t, 1200, 1040, 1.15, { cara: t > 36.6 ? cara('feliz', { ab: 0.4 }) : t > 35.9 ? cara('triste', { cej: 10 }) : 'neutral', mira: mira ? [0.9, 0.1] : [0.6, -0.5], pose: { cab: mira ? 6 : -4 } }, L_CALIDA);
      vla(t, 1480, 1040, 1.15, { cara: t > 36.8 ? cara('feliz', { ab: 0.5 }) : t > 35.9 ? cara('neutral', { cej: 12 }) : 'neutral', mira: mira ? [-0.9, 0.1] : [-0.2, -0.5], pose: { cab: mira ? -6 : -4 } }, L_CALIDA);
    });
    if (t < 33.9) fundido(1 - u(t, 33.45, 33.9), '#fff');
  }
}

function pantallaCine(x, y, w, h, t, tono = 1) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = vgrad(y, y + h, [[0, '#7fa7b8'], [1, '#c9d9c9']]); g.fillRect(x, y, w, h);
  for (let i = 0; i < 16; i++) { const tx = x + i * w / 15 + Math.sin(i) * 20, th = h * (0.25 + hs(i) * 0.25); g.fillStyle = i % 2 ? '#2f5a3a' : '#3f6d45'; g.beginPath(); g.arc(tx, y + h - th * 0.6, th * 0.5, 0, TAU); g.fill(); g.fillRect(tx - 8, y + h - th * 0.4, 16, th); }
  const fy = y + h * 0.15 + ((t * 0.18) % 1) * h * 0.5, fx = x + w * 0.55;
  g.save(); g.translate(fx, fy); g.rotate(Math.sin(t * 2) * 0.2); g.fillStyle = '#2a2a2a'; g.fillRect(-w * 0.03, -h * 0.08, w * 0.02, h * 0.16); g.fillRect(-w * 0.03, 0, w * 0.06, h * 0.03); g.beginPath(); g.arc(-w * 0.005, -h * 0.03, h * 0.035, 0, TAU); g.fill(); g.restore();
  g.fillStyle = `rgba(255,255,255,${0.05 + 0.05 * Math.sin(t * 40)})`; g.fillRect(x, y, w, h);
  g.restore();
}
function s03(t) {
  const cam = t < 46.4 ? mov(t, 37.57, 46.4, E(960, 540, 1.0), E(980, 540, 1.05)) : mov(t, 46.4, 52.6, E(980, 540, 1.05), E(820, 560, 1.45));
  reset(); g.fillStyle = '#0d0b14'; g.fillRect(0, 0, W, H);
  capa(cam, 1, () => {
    g.fillStyle = '#151221'; g.fillRect(-500, -500, 3000, 2200);
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(80,30,40,0.35)'; g.fillRect(-400 + i * 420, -200, 160, 1500); }
    const sx = 980, sy = 120, sw = 860, sh = 470; g.beginPath(); g.rect(sx - 14, sy - 14, sw + 28, sh + 28); g.fillStyle = '#2a2433'; g.fill();
    pantallaCine(sx, sy, sw, sh, t);
    if (ven(t, 39.6, 46.2) > 0) { g.save(); g.globalAlpha = ven(t, 39.6, 46.2); g.font = 'italic 600 26px Lora'; g.fillStyle = '#fff'; g.textAlign = 'right'; g.fillText('Basada en el caso de Juliane Koepcke', sx + sw - 20, sy + sh - 22); g.restore(); }
    g.fillStyle = '#6e2230'; g.fillRect(sx - 120, sy - 60, 70, sh + 140); g.fillRect(sx + sw + 50, sy - 60, 70, sh + 140);
    g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createLinearGradient(-200, 0, sx + sw / 2, sy + sh / 2); gr.addColorStop(0, 'rgba(220,230,255,0.35)'); gr.addColorStop(1, 'rgba(220,230,255,0.04)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-120, -60); g.lineTo(-80, -40); g.lineTo(sx + sw, sy + sh); g.lineTo(sx, sy); g.closePath(); g.fill(); g.restore();
    polvo(t, 0.8, '230,235,255', 50, 100, sx, 0, 500);
    brillo(sx + sw / 2, sy + sh / 2, 900, '150,190,255', 0.35 + 0.05 * Math.sin(t * 20));
    for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) { const x = -100 + i * 260 + row * 120, y = 870 + row * 160; g.beginPath(); rr(x - 90, y - 140, 180, 220, 30); g.fillStyle = vgrad(y - 140, y + 80, [[0, '#8e2b37'], [1, '#4d1720']]); g.fill(); g.lineWidth = 4; g.strokeStyle = '#1a0c10'; g.stroke(); }
    const fl = 0.5 + 0.5 * Math.sin(t * 13) * Math.sin(t * 7);
    vla(t, 960, 1000, 1.15, { cara: 'neutral', mira: [0.8, -0.5], pose: { sentado: true, pi: [6, 0, 0.8], pd: [-6, 0, 0.8] } }, { ...L_CINE, bordeK: 0.6 + fl * 0.2 });
    lar(t, 700, 1000, 1.12, { cara: t > 49 ? cara('neutral', { cej: 14, ojoH: 1.15 }) : cara('neutral', { ojoH: 1.08 }), mira: [0.85, -0.55], pose: { sentado: true, pi: [6, 0, 0.8], pd: [-6, 0, 0.8], cab: -4 }, manoD: [60, -120], manoI: [-40, -120] }, { ...L_CINE, bordeK: 0.6 + fl * 0.25 });
    for (let i = 0; i < 9; i++) { const x = -100 + i * 260 + 60, y = 1040; g.beginPath(); rr(x - 95, y - 150, 190, 260, 34); g.fillStyle = vgrad(y - 150, y + 80, [[0, '#7e2430'], [1, '#3d121a']]); g.fill(); g.lineWidth = 4; g.strokeStyle = '#1a0c10'; g.stroke(); }
    for (let i = 0; i < 8; i++) { const x = -60 + i * 290, y = 1160 + (i % 2) * 40; g.beginPath(); g.arc(x, y - 60, 70, 0, TAU); g.fillStyle = '#07060b'; g.fill(); g.beginPath(); rr(x - 110, y - 10, 220, 200, 50); g.fill(); }
  });
  C.vineta(g, 0.6);
  if (t < 38.0) fundido(1 - u(t, 37.57, 38.0));
}

function reloj(x, y, r, horas) {
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = '#f6f2e8'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#3a3a42'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.lineWidth = i % 3 ? 3 : 6; g.beginPath(); g.moveTo(x + Math.sin(a) * r * 0.82, y - Math.cos(a) * r * 0.82); g.lineTo(x + Math.sin(a) * r * 0.94, y - Math.cos(a) * r * 0.94); g.stroke(); }
  const ah = horas / 12 * TAU, am = horas * TAU; g.lineCap = 'round'; g.lineWidth = 10; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(ah) * r * 0.5, y - Math.cos(ah) * r * 0.5); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(am) * r * 0.78, y - Math.cos(am) * r * 0.78); g.stroke(); g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fillStyle = '#c0392b'; g.fill();
}
function banca(x, y, w) { g.beginPath(); rr(x, y - 70, w, 26, 6); trazo('#8b6a48', 4); g.beginPath(); rr(x, y - 150, w, 60, 8); trazo('#9b7853', 4); g.strokeStyle = LINEA; g.lineWidth = 8; g.beginPath(); g.moveTo(x + 20, y - 44); g.lineTo(x + 20, y); g.moveTo(x + w - 20, y - 44); g.lineTo(x + w - 20, y); g.stroke(); }
function salaEspera(t, cam) {
  capa(cam, 1, () => {
    g.fillStyle = vgrad(-200, 900, [[0, '#cfd3c8'], [1, '#aeb3a6']]); g.fillRect(-1000, -500, 5000, 1500);
    g.fillStyle = '#8e8a7e'; g.fillRect(-1000, 640, 5000, 30);
    g.save(); g.beginPath(); g.rect(-200, 60, 1500, 520); g.fillStyle = vgrad(60, 580, [[0, '#9aa5ad'], [1, '#c6ccce']]); g.fill(); g.clip();
    nube(200, 200, 0.9, [210, 215, 220], [150, 158, 168], 1, 2); nube(900, 260, 1.1, [205, 210, 216], [148, 155, 166], 1, 4);
    g.fillStyle = '#7d8378'; g.fillRect(-200, 480, 1500, 100); avion(620, 470, 0.5, t, {}); g.restore();
    g.strokeStyle = '#5b5e63'; g.lineWidth = 12; for (let i = 0; i <= 5; i++) { g.beginPath(); g.moveTo(-200 + i * 300, 60); g.lineTo(-200 + i * 300, 580); g.stroke(); } g.strokeRect(-200, 60, 1500, 520);
    g.fillStyle = vgrad(670, 1200, [[0, '#9a8f7c'], [1, '#776d5c']]); g.fillRect(-1000, 670, 5000, 600); g.strokeStyle = 'rgba(60,50,40,0.25)'; g.lineWidth = 3; for (let x = -1000; x < 4000; x += 120) { g.beginPath(); g.moveTo(x, 670); g.lineTo(x - 200, 1200); g.stroke(); }
    reloj(1750, 220, 120, t < 63.6 ? 13.5 : 13.5 + (Math.min(t, 66.2) - 63.6) * 1.6);
    g.font = '800 34px Inter'; g.fillStyle = '#3d3d44'; g.textAlign = 'center'; g.fillText('SALIDAS', 1750, 400); g.beginPath(); rr(1600, 420, 300, 120, 10); g.fillStyle = '#20232a'; g.fill(); g.fillStyle = '#ffb347'; g.font = '700 28px Inter'; g.fillText('811 · RETRASO', 1750, 470); g.fillStyle = 'rgba(255,179,71,0.5)'; g.fillText('— — — —', 1750, 515);
  });
}
function s04(t) {
  if (t < 63.4) {
    const cam = mov(t, 52.65, 63.4, E(700, 560, 1.12), E(780, 540, 1.2));
    salaEspera(t, cam);
    capa(cam, 1, () => { sombraSuelo(560, 950, 90); sombraSuelo(820, 950, 90); vla(t, 820, 950, 1.0, { cara: 'neutral', mira: [-0.5, -0.1], pose: { cab: -4 }, manoD: t < 57.3 ? [30, -230] : null }, L_FRIA); lar(t, 560, 950, 0.97, { cara: t > 57.6 ? cara('triste', { cej: 18 }) : 'neutral', mira: [0.0, -0.8], pose: { cab: t > 57.6 ? 6 : -6 }, manoI: [-10, -190] }, L_FRIA);
      g.save(); g.translate(t < 57.3 ? 880 : 540, t < 57.3 ? 720 : 760); g.rotate(-0.15); g.beginPath(); rr(-40, -24, 80, 48, 4); trazo('#f2e4c4', 3); g.fillStyle = '#c0392b'; g.fillRect(-40, -24, 18, 48); g.restore(); });
    rotuloLugar('Komsomolsk del Amur', '24 de agosto de 1981 · aeropuerto', ven(t, 53.0, 58.5, 0.5));
    if (t < 53.1) fundido(1 - u(t, 52.65, 53.1));
  } else if (t < 73.0) {
    const cam = t < 66 ? E(1500, 380, 1.4) : mov(t, 66, 72.4, E(700, 560, 1.0), E(1180, 700, 1.55));
    salaEspera(t, cam);
    capa(cam, 1, () => {
      banca(80, 980, 520); banca(700, 980, 520); banca(1320, 980, 520);
      [['pas1', 190, 1.0, [0.4, 0]], ['pas2', 380, 0.95, [-0.4, 0]], ['pas4', 800, 1.0, [0.5, -0.1]], ['pas3', 1000, 0.95, [-0.3, 0]]].forEach(([p, x, s, m]) => dib(p, { t, x, y: 1010, escala: s, cara: 'neutral', mira: m, pose: { sentado: true, pi: [6, 0, 0.8], pd: [-6, 0, 0.8] } }, L_FRIA));
      lar(t, 1460, 1010, 0.95, { cara: cara('neutral', { cej: 10 }), mira: [-0.6, 0.1], pose: { sentado: true, pi: [6, 0, 0.8], pd: [-6, 0, 0.8] } }, L_FRIA); vla(t, 1680, 1010, 1.0, { cara: 'neutral', mira: [-0.5, 0.2], pose: { sentado: true, pi: [6, 0, 0.8], pd: [-6, 0, 0.8] } }, L_FRIA);
      dib('nino', { t, x: 1160, y: 990, escala: 1.0, cara: cara('neutral', { ojoH: 1.1 }), mira: [0.7, -0.2], pose: { cab: 6 }, manoD: [60, -150], manoI: [10, -140] }, L_FRIA);
      g.save(); g.translate(1195, 870); g.beginPath(); g.arc(0, 0, 34, 0, TAU); trazo('#b27a45', 4); g.beginPath(); g.arc(-24, -26, 13, 0, TAU); trazo('#b27a45', 3); g.beginPath(); g.arc(24, -26, 13, 0, TAU); trazo('#b27a45', 3); g.beginPath(); g.arc(0, -40, 0, 0, TAU); g.beginPath(); g.ellipse(0, 12, 14, 10, 0, 0, TAU); g.fillStyle = '#e2b98c'; g.fill(); g.fillStyle = LINEA; g.beginPath(); g.arc(-11, -6, 4, 0, TAU); g.arc(11, -6, 4, 0, TAU); g.fill(); g.restore();
    });
    C.vineta(g, 0.4);
  } else {
    const cam = mov(t, 73, 79.8, E(960, 540, 1.0), E(1000, 560, 1.12));
    capa(cam, 1, () => {
      g.fillStyle = vgrad(-200, 1200, [[0, '#d8d2c4'], [1, '#b2aa98']]); g.fillRect(-500, -500, 3000, 2200);
      g.save(); g.translate(1400, 420); g.beginPath(); g.ellipse(0, 0, 150, 200, 0, 0, TAU); g.fillStyle = '#efe9dc'; g.fill(); g.lineWidth = 6; g.strokeStyle = LINEA; g.stroke(); g.beginPath(); g.ellipse(0, 0, 110, 160, 0, 0, TAU); g.save(); g.clip(); g.fillStyle = vgrad(-160, 160, [[0, '#4f86c6'], [1, '#bcd6ee']]); g.fillRect(-120, -170, 240, 340); for (let i = 0; i < 4; i++) nube(((i * 160 - t * 120) % 640 + 640) % 640 - 300, 60 + i * 30, 0.35, [255, 255, 255], [210, 220, 236], 1, i); g.restore(); g.stroke(); g.restore();
      const dorm = t > 77.9;
      sentadaF(t, 'vladimir', 760, 1000, 1.2, { cara: dorm ? cara('neutral', { ojoH: 0.6 }) : 'neutral', mira: [0.6, 0.1], pose: { cab: 4 } }, L_DIA);
      sentadaF(t, 'larisa', 1060, 1000, 1.2, { cara: dorm ? cara('dormida') : cara('tranquila', { ojoH: 0.6 }), mira: [-0.4, 0.3], pose: { cab: -16 - sv(u(t, 76, 78)) * 12, tor: -8, cabDx: -sv(u(t, 76, 78)) * 30 } }, L_DIA);
    });
    if (t > 77.9) { reset(); g.save(); g.globalAlpha = 0.6 * u(t, 77.9, 79); g.font = 'italic 600 60px Lora'; g.fillStyle = '#fff'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 10; g.fillText('z', 1060 + Math.sin(t) * 10, 470 - (t - 78) * 20); g.font = 'italic 600 40px Lora'; g.fillText('z', 1110, 420 - (t - 78) * 25); g.restore(); }
    rotuloLugar('Vuelo 811', 'Komsomolsk del Amur → Blagoveshchensk', ven(t, 73.3, 77.8, 0.5));
  }
}

function avionPartido(x, y, s, t, k) {
  if (k <= 0) { avion(x, y, s, t); return; }
  const off = sv(k);
  g.save(); g.beginPath(); g.rect(x - 1000, y - 600, 1000 - 40 * s, 1200); g.clip(); g.translate(x - off * 120, y + off * 220); g.rotate(-off * 0.7); avion(0, 0, s, t); g.restore();
  g.save(); g.beginPath(); g.rect(x - 40 * s, y - 600, 300 * s, 1200); g.clip(); g.translate(x + off * 40, y + off * 380); g.rotate(off * 1.4); g.translate(0, 0); avion(0, 0, s, t * 0.3); g.restore();
  g.save(); g.beginPath(); g.rect(x + 260 * s, y - 600, 1000, 1200); g.clip(); g.translate(x + off * 180, y + off * 160); g.rotate(off * 0.5); avion(0, 0, s, t * 0.1); g.restore();
}
function escombros(cx, cy, t0, t, n = 30, col = '#cfd4db') { const d = t - t0; if (d < 0) return; for (let i = 0; i < n; i++) { const a = hs(i) * TAU, v = 200 + hs(i * 3) * 500, x = cx + Math.cos(a) * v * d, y = cy + Math.sin(a) * v * d + 300 * d * d, r = 6 + hs(i * 5) * 18; g.save(); g.translate(x, y); g.rotate(d * (3 + hs(i) * 8)); g.globalAlpha = cl(1 - d / 6); g.fillStyle = i % 4 ? col : '#2f5f9e'; g.strokeStyle = LINEA; g.lineWidth = 2; g.beginPath(); g.moveTo(-r, -r * 0.4); g.lineTo(r * 0.8, -r * 0.6); g.lineTo(r, r * 0.5); g.lineTo(-r * 0.6, r * 0.6); g.closePath(); g.fill(); g.stroke(); g.restore(); } }
function humo(cx, cy, t0, t, k = 1) { const d = t - t0; if (d < 0) return; for (let i = 0; i < 14; i++) { const q = cl(d / 3 + hs(i) * 0.2), x = cx + (hs(i * 3) - 0.5) * 300 * q - d * 60, y = cy + (hs(i * 5) - 0.5) * 200 * q - d * 20, r = 30 + q * 120; g.save(); g.globalAlpha = k * 0.45 * (1 - q * 0.6); g.fillStyle = i % 2 ? '#4a4648' : '#6b6466'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); } }

function s05(t) {
  if (t < 86.8) {
    const choque = 85.55, tb = t > choque ? 1 - u(t, choque, choque + 1.4) : 0;
    const cam = { ...mov(t, 79.78, 85.4, E(960, 560, 0.95), E(1000, 540, 1.12)), temblor: tb * 2.2, t };
    capa(cam, 0.3, () => { cielo([[0, '#1d3f78'], [0.6, '#6f9bd0'], [1, '#e8cfb2']]); });
    capa(cam, 0.4, () => { for (let i = 0; i < 6; i++) nube(((i * 420 - t * 30) % 2600 + 2600) % 2600 - 400, 820 + (i % 2) * 90, 1.3, [255, 250, 245], [180, 192, 222], 1, i + 3); });
    capa(cam, 1, () => {
      const ax = lerp(400, 1080, u(t, 79.78, choque)), ay = 560;
      const bx = lerp(2300, 1180, u(t, 81.5, choque)), by = lerp(-80, 470, u(t, 81.5, choque));
      if (t < choque) { avion(ax, ay, 0.85, t); bombardero(bx, by, 0.7, t, { mira: -1, rot: -0.42 }); for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 6; g.beginPath(); g.moveTo(bx + 200 + i * 80, by - 120 - i * 40); g.lineTo(bx + 600 + i * 80, by - 300 - i * 40); g.stroke(); } }
      else { humo(ax + 40, ay - 20, choque, t); avionPartido(ax, ay, 0.85, t, u(t, choque, choque + 2.5)); bombardero(bx + (t - choque) * 120, by + (t - choque) * 260, 0.7, t, { mira: -1, rot: -0.42 - (t - choque) * 0.6 }); escombros(ax + 60, ay - 20, choque, t, 40); }
    });
    rotuloLugar('15:21 · 5,000 metros', 'Un bombardero cruza la ruta del vuelo civil', ven(t, 80.0, 84.6, 0.4));
    destello(t > choque ? 1 - u(t, choque, choque + 0.5) : 0);
    if (t > choque) { reset(); for (let r = 0; r < 2; r++) { const q = u(t, choque + r * 0.15, choque + 0.9 + r * 0.15); g.save(); g.globalAlpha = (1 - q) * 0.7; g.strokeStyle = '#fff'; g.lineWidth = 14 * (1 - q); g.beginPath(); g.arc(1080, 540, q * 900, 0, TAU); g.stroke(); g.restore(); } }
  } else if (t < 92.8) {
    const cam = { ...E(960, 540, 1.15), temblor: 1.2, t };
    capa(cam, 1, () => {
      g.fillStyle = vgrad(-300, 1300, [[0, '#4a5b72'], [1, '#2a3346']]); g.fillRect(-500, -500, 3000, 2200);
      g.save(); g.translate(1450, 380); g.rotate(0.05); g.beginPath(); g.ellipse(0, 0, 150, 200, 0, 0, TAU); g.fillStyle = '#9aa0aa'; g.fill(); g.lineWidth = 6; g.strokeStyle = LINEA; g.stroke(); g.beginPath(); g.ellipse(0, 0, 110, 160, 0, 0, TAU); g.fillStyle = '#e6eef8'; g.fill(); g.strokeStyle = '#2a2a2a'; g.lineWidth = 4; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(i * 0.9) * 120, Math.sin(i * 0.9) * 150); g.stroke(); } g.restore();
      const desp = u(t, 86.8, 87.5);
      sentadaF(t, 'vladimir', 740, 1000, 1.2, { cara: t < 87.3 ? cara('neutral', { ojoH: 0.6 }) : 'terror', mira: [Math.sin(t * 5) * 0.6, -0.3], pose: { tor: Math.sin(t * 8) * 4 } }, { ...L_FRIA, borde: 'rgba(255,120,110,0.8)' });
      asientoF(1060, 1000, 1.2); lar(t, 1060, 1012, 1.14, { sombra: false,  cara: t < 87.3 ? cara('dormida') : t < 89.4 ? 'sorpresa' : 'terror', mira: [Math.sin(t * 6) * 0.6, -0.3], pose: { sentado: true, pi: [6, 0, 0.9], pd: [-6, 0, 0.9], cab: lerp(-20, 4, desp), tor: Math.sin(t * 9) * 4 }, manoI: t > 89 ? [-90, -330] : null, manoD: t > 89 ? [60, -340] : null, pelo: [Math.sin(t * 9) * 40, -60] }, { ...L_FRIA, borde: 'rgba(255,120,110,0.8)' }); brazosAsiento(1060, 1000, 1.2);
      for (let i = 0; i < 14; i++) { const q = (t * 1.6 + hs(i)) % 1, x = 1700 - q * 2200, y = 200 + hs(i * 3) * 600 + Math.sin(t * 5 + i) * 40; g.save(); g.translate(x, y); g.rotate(t * 6 + i); g.fillStyle = '#f2ece0'; g.fillRect(-26, -18, 52, 36); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 2; g.strokeRect(-26, -18, 52, 36); g.restore(); }
    });
    reset(); for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(220,235,255,0.35)'; g.lineWidth = 2; const y = hs(i * 3) * H, x = ((hs(i) * W - t * 3000) % W + W) % W; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 160, y + 10); g.stroke(); }
    g.save(); g.globalAlpha = 0.18 + 0.12 * Math.sin(t * 12); g.fillStyle = '#ff3b30'; g.fillRect(0, 0, W, H); g.restore();
    C.vineta(g, 0.7);
  } else {
    const k = u(t, 92.8, 93.6); const cam = { ...mov(t, 92.8, 93.6, E(960, 540, 1.4), E(960, 540, 1.05)), rot: (1 - sv(k)) * 14, temblor: 0.8, t };
    capa(cam, 1, () => {
      g.fillStyle = vgrad(-300, 1300, [[0, '#3c4a5f'], [1, '#1f2636']]); g.fillRect(-500, -500, 3000, 2200);
      g.save(); g.beginPath(); g.moveTo(1180, 120); g.lineTo(1620, 90); g.lineTo(1700, 300); g.lineTo(1660, 560); g.lineTo(1400, 640); g.lineTo(1250, 520); g.lineTo(1300, 380); g.lineTo(1150, 300); g.closePath(); g.save(); g.clip(); g.fillStyle = vgrad(90, 640, [[0, '#6fa0d8'], [1, '#e4d3c2']]); g.fillRect(1100, 80, 700, 600); for (let i = 0; i < 4; i++) nube(((i * 250 + t * 600) % 900) + 1000, 300 + i * 80, 0.5, [255, 255, 255], [200, 210, 230], 1, i + 7); g.restore(); g.lineWidth = 8; g.strokeStyle = '#1a1a22'; g.stroke(); g.restore();
      for (let i = 0; i < 26; i++) { g.strokeStyle = 'rgba(230,240,255,0.5)'; g.lineWidth = 3; const q = (t * 2 + hs(i)) % 1; g.beginPath(); g.moveTo(1400 - q * 900, 200 + hs(i * 3) * 400); g.lineTo(1300 - q * 900, 210 + hs(i * 3) * 400); g.stroke(); }
      asientoF(1430, 1010, 1.15); brazosAsiento(1430, 1010, 1.15);
      const cae = sv(u(t, 92.9, 94.0)); lar(t, lerp(1100, 600, cae), lerp(940, 1000, cae), 1.06, { cara: t < 94.9 ? 'terror' : cara('miedo', { ab: 0.2 }), mira: t > 94.9 ? [0.9, -0.4] : [0, -0.2], pose: t < 94 ? { tor: -30 + cae * 20, cab: 10, suelo: cae > 0.8 } : { suelo: true, cab: -6 }, manoI: [-90, -60], manoD: [60, -200], pelo: [40, -40] }, { ...L_FRIA, borde: 'rgba(255,140,120,0.8)' });
    });
    C.vineta(g, 0.6);
  }
}

function s06(t) {
  if (t < 100.35) {
    const cam = mov(t, 97.98, 100.35, E(1200, 600, 1.35), E(1200, 600, 1.5));
    capa(cam, 1, () => { g.fillStyle = vgrad(-300, 1300, [[0, '#3c4a5f'], [1, '#1f2636']]); g.fillRect(-500, -500, 3000, 2200); asientoF(1250, 1000, 1.3); brazosAsiento(1250, 1000, 1.3); g.save(); g.translate(1250, 860); g.rotate(-0.1); g.beginPath(); rr(-40, -30, 80, 56, 6); trazo('#2f5e3f', 3); g.restore(); for (let i = 0; i < 20; i++) { g.strokeStyle = 'rgba(230,240,255,0.4)'; g.lineWidth = 2; const q = (t * 2 + hs(i)) % 1; g.beginPath(); g.moveTo(1800 - q * 1400, 300 + hs(i * 3) * 700); g.lineTo(1700 - q * 1400, 306 + hs(i * 3) * 700); g.stroke(); } });
    reset(); g.save(); g.globalAlpha = 0.85; lar(t, 520, 1110, 1.3, { cara: cara('miedo', { boca: 'abajo', ab: 0, cej: 26 }), mira: [0.9, -0.1], pose: { cab: 4 } }, L_FRIA); g.restore();
    C.vineta(g, 0.6);
  } else if (t < 102.7) {
    reset(); g.fillStyle = '#100d0a'; g.fillRect(0, 0, W, H);
    const fx = 360, fy = 140, fw = 1200, fh = 800; g.fillStyle = '#1e1a16'; g.fillRect(fx - 60, fy - 40, fw + 120, fh + 80);
    g.fillStyle = '#d9cfbe'; for (let i = 0; i < 10; i++) { g.fillRect(fx - 44, fy - 20 + i * 86, 26, 44); g.fillRect(fx + fw + 18, fy - 20 + i * 86, 26, 44); }
    pantallaCine(fx, fy, fw, fh, t * 1.4);
    C.gradacion(g, 'rgba(200,170,120,1)', 'rgba(140,110,80,1)', 0.55, 'color'); C.grano(g, t, 0.18);
    g.save(); g.globalAlpha = 0.25; g.strokeStyle = '#fff'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { const x = hs(Math.floor(t * 24) + i) * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 6, H); g.stroke(); } g.restore();
    fundido(1 - u(t, 100.35, 100.7), '#fff');
  } else if (t < 108.0) {
    const cam = { ...mov(t, 102.7, 108, E(960, 560, 1.1), E(1000, 520, 1.45)), temblor: 0.7, t };
    capa(cam, 1, () => {
      g.fillStyle = vgrad(-300, 1300, [[0, '#3c4a5f'], [1, '#1f2636']]); g.fillRect(-500, -500, 3000, 2200);
      g.save(); g.beginPath(); g.moveTo(1250, 120); g.lineTo(1700, 100); g.lineTo(1760, 600); g.lineTo(1300, 640); g.closePath(); g.save(); g.clip(); g.fillStyle = vgrad(90, 640, [[0, '#6fa0d8'], [1, '#e4d3c2']]); g.fillRect(1200, 80, 700, 600); for (let i = 0; i < 4; i++) nube(((i * 250 + t * 700) % 900) + 1100, 300 + i * 80, 0.5, [255, 255, 255], [200, 210, 230], 1, i + 7); g.restore(); g.lineWidth = 8; g.strokeStyle = '#1a1a22'; g.stroke(); g.restore();
      const ag = sv(u(t, 104.3, 105.6));
      sentadaF(t, 'larisa', 1000, 1010, 1.25, { cara: t > 104.5 ? cara('miedo', { boca: 'linea', ab: 0, cej: 26, ojoH: 0.5 }) : cara('miedo', { boca: 'abajo', ab: 0 }), mira: [0.2, 0.3], pose: { pi: [6 + ag * 30, -ag * 50, 0.8], pd: [-6 - ag * 30, -ag * 50, 0.8], tor: ag * 6, cab: ag * 18, hombros: ag * 14, dy: ag * 10 }, manoI: [-150, -165], manoD: [150, -165], pelo: [60, -40] }, { ...L_FRIA, borde: 'rgba(255,200,170,0.9)' }, { col: '#3d5f8f', col2: '#2c4670' });
      if (ag > 0.5) { g.save(); g.globalAlpha = ag; g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 3; for (const hx of [1000 - 165 * 1.19, 1000 + 165 * 1.19]) { g.beginPath(); g.arc(hx, 1010 - 165 * 1.19, 30, 0, TAU); g.stroke(); } g.restore(); }
    });
    for (let i = 0; i < 30; i++) { g.strokeStyle = 'rgba(230,240,255,0.35)'; g.lineWidth = 2; const q = (t * 2.4 + hs(i)) % 1; g.beginPath(); g.moveTo(W - q * W * 1.3, hs(i * 3) * H); g.lineTo(W - q * W * 1.3 - 140, hs(i * 3) * H + 6); g.stroke(); }
    C.vineta(g, 0.55);
  } else {
    const q = u(t, 108, 114.0), cam = { x: 0, y: 0, zoom: 1, rot: 0, temblor: 0.4, t };
    cieloAlto(t, null, 1200 * (1 + q * 2));
    taigaAerea(t, 1, q);
    const s = lerp(0.8, 0.6, q), x = 960 + Math.sin(t * 1.3) * 60, y = lerp(380, 520, q);
    asientoConLarisa(t, x, y, s, Math.sin(t * 2.1) * 0.5 + t * 0.6, cara('miedo', { boca: 'linea', ab: 0, ojoH: 0.5, cej: 26 }), { tor: 14, cab: 20 });
    reset(); const seg = Math.max(0, Math.round(480 * (1 - q))); g.save(); g.font = '800 64px Inter'; g.fillStyle = 'rgba(15,12,25,0.55)'; rr(1580, 60, 280, 100, 18); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`, 1720, 112); g.restore();
    grande('8 minutos de caída', 960, 940, ven(t, 108.2, 112.5, 0.4), 52, '#fff', '700');
    if (t > 113.3) fundido(u(t, 113.3, 113.9) * 0.6);
    if (t >= 113.95) fundido(1);
  }
}
