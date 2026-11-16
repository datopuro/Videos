function cuarto(c1, c2, piso1 = '#7a6650', piso2 = '#5a4a3a', ypiso = 820) { g.fillStyle = vgrad(-300, ypiso, [[0, c1], [1, c2]]); g.fillRect(-800, -500, 3600, ypiso + 500); g.fillStyle = vgrad(ypiso, 1300, [[0, piso1], [1, piso2]]); g.fillRect(-800, ypiso, 3600, 800); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(-800, ypiso - 20, 3600, 20); }
function tetera(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.ellipse(0, -50, 70, 55, 0, 0, TAU); trazo('#3f7fa6', 5); g.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-40 + i * 20, -50 + Math.sin(i) * 10, 7, 0, TAU); g.fill(); } g.beginPath(); g.moveTo(60, -60); g.quadraticCurveTo(110, -80, 120, -110); g.lineWidth = 12; g.strokeStyle = LINEA; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#3f7fa6'; g.stroke(); g.beginPath(); g.arc(0, -110, 12, 0, TAU); trazo('#3f7fa6', 4); g.restore(); vaporSimple(x + 120 * s, y - 115 * s, t); }
function mantel(x, y, w, h) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.fillStyle = '#f3ead6'; g.fill(); g.clip(); for (let i = 0; i < 60; i++) { const fx = x + hs(i) * w, fy = y + hs(i * 3) * h; g.fillStyle = ['#d65a5a', '#e9a23b', '#5a8fd6'][i % 3]; for (let p = 0; p < 5; p++) { g.beginPath(); g.arc(fx + Math.cos(p * 1.25) * 9, fy + Math.sin(p * 1.25) * 9, 6, 0, TAU); g.fill(); } g.fillStyle = '#f2d14a'; g.beginPath(); g.arc(fx, fy, 5, 0, TAU); g.fill(); } g.restore(); g.lineWidth = 5; g.strokeStyle = LINEA; g.strokeRect(x, y, w, h); }
function lampVerde(x, y, s, on = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-90, 0); g.quadraticCurveTo(0, -70, 90, 0); g.closePath(); trazo('#2f6b45', 5); g.strokeStyle = LINEA; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 110); g.stroke(); g.beginPath(); rr(-50, 110, 100, 22, 8); trazo('#b5975a', 4); g.restore(); brillo(x, y + 60 * s, 420 * s, '255,230,150', on); }
function escritorio(x, y, w, h) { g.beginPath(); rr(x, y, w, 30, 6); trazo('#6b4a32', 5); g.fillStyle = vgrad(y + 30, y + h, [[0, '#57392a'], [1, '#3e281c']]); g.fillRect(x + 20, y + 30, w - 40, h); g.lineWidth = 5; g.strokeStyle = LINEA; g.strokeRect(x + 20, y + 30, w - 40, h); }

function s11(t) {
  if (t < 217.6) {
    const cam = mov(t, 215.43, 217.6, E(960, 560, 1.05), E(940, 560, 1.15));
    capa(cam, 1, () => {
      cuarto('#e6d6b8', '#cdb994', '#8a6e52', '#6a523c', 840);
      for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(160,120,80,0.12)'; g.fillRect(-800 + i * 200, -500, 100, 1340); }
      g.save(); g.beginPath(); g.rect(1200, 150, 460, 400); g.fillStyle = vgrad(150, 550, [[0, '#a8c3d8'], [1, '#e2ebe9']]); g.fill(); g.lineWidth = 8; g.strokeStyle = '#efe7da'; g.stroke(); g.beginPath(); g.moveTo(1430, 150); g.lineTo(1430, 550); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(1200 + i * 52, 150); g.quadraticCurveTo(1226 + i * 52, 210, 1200 + i * 52, 270); g.lineTo(1250 + i * 52, 270); g.lineTo(1250 + i * 52, 150); g.fill(); } g.restore();
      dib('mama', { t, x: 640, y: 1000, escala: 1.12, cara: cara('miedo', { boca: 'abajo', ab: 0, cej: 20 }), mira: [0.4, 0.5], pose: { sentado: true, pi: [6, 0, 0.9], pd: [-6, 0, 0.9], cab: 10 }, manoI: [80, -250], manoD: [140, -250] }, L_CALIDA);
      mantel(300, 760, 1100, 90); g.fillStyle = '#5a3f2c'; g.fillRect(340, 850, 30, 230); g.fillRect(1330, 850, 30, 230);
      tetera(1150, 760, 0.9, t); g.beginPath(); g.ellipse(950, 756, 60, 14, 0, 0, TAU); trazo('#f6f2ea', 4);
      papel(780, 1000 - 255 * 1.12, 150, 190, -0.2, '#f6f0e2'); g.save(); g.translate(780, 1000 - 285 * 1.12); g.rotate(-0.2); lineasTexto(-55, -60, 110, 6, 20, 'rgba(40,40,60,0.6)', 2); g.restore();
    });
    C.vineta(g, 0.45);
  } else {
    const ab = sv(u(t, 217.6, 218.6)); const cam = mov(t, 217.6, 222.62, E(960, 540, 1.0), E(1000, 560, 1.2));
    capa(cam, 1, () => {
      cuarto('#5c6656', '#3f473b', '#6b5d4c', '#4a3f33', 860);
      for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(-800 + i * 360, -500, 6, 1360); }
      g.beginPath(); rr(80, 40, 360, 820, 6); trazo('#2a221c', 6); g.save(); g.translate(80, 40); g.scale(1 - ab * 0.8, 1); g.beginPath(); rr(0, 0, 360, 820, 6); trazo('#6b4a32', 6); g.beginPath(); rr(80, 120, 200, 140, 6); trazo('#9fb8c2', 4); g.beginPath(); g.arc(320, 440, 14, 0, TAU); trazo('#c9a64a', 3); g.restore();
      g.save(); g.fillStyle = 'rgba(0,0,0,0.0)'; g.restore();
      dib('agente', { t, x: 1300, y: 960, escala: 1.15, cara: cara('neutral', { cej: -14 }), mira: [-0.8, 0.1], pose: { sentado: true, pi: [6, 0, 0.9], pd: [-6, 0, 0.9] }, manoI: t > 219.5 ? [-10, -268] : [-100, -230] }, { tinte: 'rgba(10,10,20,0.62)', borde: 'rgba(255,225,150,0.9)', off: [-8, -3], bordeK: 0.8 });
      escritorio(1020, 760, 560, 300); lampVerde(1430, 640, 1.0, 0.9);
      papel(1220, 772, 220, 40, 0, '#f2ecdc');
      dib('mama', { t, x: lerp(500, 820, sv(u(t, 218.2, 219.6))), y: 1040, escala: 1.12, cara: cara('miedo', { boca: 'abajo', ab: 0, cej: 22 }), mira: [0.7, 0], pose: t > 219.6 ? { sentado: true, pi: [6, 0, 0.9], pd: [-6, 0, 0.9] } : paso(t, 1.6, 0.6).pose }, L_OFI);
    });
    grande('KGB', 1300, 200, ven(t, 218.4, 222.4), 80, 'rgba(255,255,255,0.85)', '900');
    C.vineta(g, 0.6);
  }
}
function kiosko(t, cam) {
  capa(cam, 1, () => {
    cielo([[0, '#b8c2c8'], [1, '#e2ddd0']]);
    g.fillStyle = '#8e9296'; g.fillRect(-500, 900, 3000, 300);
    g.beginPath(); g.moveTo(300, 200); g.lineTo(1620, 200); g.lineTo(1700, 300); g.lineTo(220, 300); g.closePath(); trazo('#3a6f8f', 6);
    g.beginPath(); g.rect(260, 300, 1400, 600); g.fillStyle = vgrad(300, 900, [[0, '#d9d2c2'], [1, '#bdb4a2']]); g.fill(); g.lineWidth = 6; g.strokeStyle = LINEA; g.stroke();
    for (let i = 0; i < 6; i++) { const x = 330 + i * 220, y = 360; papel(x + 90, y + 160, 180, 250, (hs(i) - 0.5) * 0.06, '#f1ebdd'); g.save(); g.translate(x + 90, y + 160); g.fillStyle = '#2b2b2b'; g.fillRect(-75, -110, 150, 22); lineasTexto(-75, -70, 150, 4, 18, 'rgba(40,40,40,0.55)', i); g.fillStyle = 'rgba(120,120,120,0.5)'; g.fillRect(-75, 10, 150, 70); g.fillStyle = '#9aa'; g.beginPath(); g.arc(-30 + i * 6, 40, 16, 0, TAU); g.fill(); g.restore(); }
  });
}
function s12(t) {
  if (t < 226.48) {
    const cam = mov(t, 222.62, 226.48, E(960, 560, 1.0), E(960, 540, 1.12)); kiosko(t, cam);
    if (t > 224.6) { reset(); g.save(); g.globalAlpha = u(t, 224.6, 225.0); g.strokeStyle = '#d6302a'; g.lineWidth = 14; g.beginPath(); g.arc(960, 500, 300, 0, TAU); g.moveTo(748, 288); g.lineTo(1172, 712); g.stroke(); g.restore(); avion(960, 500, 0.4, t); }
    grande('Ni una línea en los periódicos', 960, 150, ven(t, 224.8, 226.4), 46, '#fff', '700');
    C.vineta(g, 0.4);
  } else {
    const cam = mov(t, 226.48, 230.42, E(960, 560, 1.0), E(1100, 560, 1.15));
    capa(cam, 1, () => {
      cuarto('#5c6656', '#3f473b', '#6b5d4c', '#4a3f33', 860);
      ['pas1', 'pas2', 'pas3', 'pas4'].forEach((p, i) => { const x = 380 + i * 340; dib(p, { t, x, y: 1000, escala: 1.0, cara: cara('triste', { cej: 20 }), mira: [0.2, 0.9], pose: { cab: 14, tor: 6 }, manoD: [60, -235] }, { tinte: 'rgba(15,15,25,0.55)', borde: 'rgba(255,225,150,0.8)', off: [7, -3], bordeK: 0.7 }); });
      escritorio(300, 760, 1500, 300); lampVerde(1650, 640, 0.9, 0.7);
      ['pas1', 'pas2', 'pas3', 'pas4'].forEach((p, i) => { const x = 380 + i * 340; if (0) dib(p, { t, x, y: 980, escala: 1.0, cara: cara('triste', { cej: 20 }), mira: [0.2, 0.9], pose: { cab: 14, tor: 6 }, manoD: [80, -200] }, { tinte: 'rgba(15,15,25,0.55)', borde: 'rgba(255,225,150,0.8)', off: [7, -3], bordeK: 0.7 }); papel(x + 50, 766, 150, 30, 0.0, '#f2ecdc'); g.save(); g.strokeStyle = '#223'; g.lineWidth = 3; const q = cl((t - 226.8 - i * 0.6) / 1.0); g.beginPath(); for (let k = 0; k < q * 20; k++) g.lineTo(x + 10 + k * 4, 764 + Math.sin(k * 1.4) * 4); g.stroke(); g.restore(); });
    });
    sello('NO HABLARÁ', 1500, 380, u(t, 228.6, 228.95), 0.1, 80);
    C.vineta(g, 0.55);
  }
}
function barras(x, y, w) { g.strokeStyle = LINEA; g.lineWidth = 16; g.lineCap = 'round'; for (const yy of [y - 300, y - 220]) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); } g.strokeStyle = '#c8ccd2'; g.lineWidth = 9; for (const yy of [y - 300, y - 220]) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); } for (const xx of [x, x + w]) { g.strokeStyle = LINEA; g.lineWidth = 16; g.beginPath(); g.moveTo(xx, y - 310); g.lineTo(xx, y); g.stroke(); g.strokeStyle = '#c8ccd2'; g.lineWidth = 9; g.stroke(); } }
function s13(t) {
  if (t < 234.84) {
    const cam = mov(t, 230.42, 234.84, E(960, 560, 1.0), E(1000, 560, 1.1));
    capa(cam, 1, () => {
      cuarto('#a9c2b0', '#86a28f', '#b7b1a2', '#958f80', 850);
      const est = (t - 230.42) / 4.4 * 4, ei = Math.floor(est) % 4; const cols = [['#bcd6ea', '#8fbf6a'], ['#d6c7a6', '#d9913b'], ['#dfe6ec', '#ffffff'], ['#c8e0ef', '#f2b9cb']][ei];
      g.save(); g.beginPath(); g.rect(1250, 120, 420, 420); g.fillStyle = cols[0]; g.fill(); g.clip(); for (let i = 0; i < 20; i++) { g.fillStyle = cols[1]; g.beginPath(); g.arc(1250 + hs(i + ei * 30) * 420, 300 + hs(i * 3 + ei) * 240, 30 + hs(i) * 30, 0, TAU); g.fill(); } if (ei === 2) { g.fillStyle = '#fff'; for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(1250 + hs(i * 7) * 420, ((hs(i) * 420 + t * 80) % 420) + 120, 4, 0, TAU); g.fill(); } } g.restore(); g.lineWidth = 10; g.strokeStyle = '#f0ece2'; g.strokeRect(1250, 120, 420, 420); g.beginPath(); g.moveTo(1460, 120); g.lineTo(1460, 540); g.stroke();
      g.beginPath(); rr(60, 640, 360, 50, 10); trazo('#c9ced4', 5); g.beginPath(); rr(60, 600, 120, 50, 20); trazo('#f6f4ee', 4); g.strokeStyle = LINEA; g.lineWidth = 8; g.beginPath(); g.moveTo(90, 690); g.lineTo(90, 860); g.moveTo(390, 690); g.lineTo(390, 860); g.stroke();
      barras(520, 990, 760);
      const x = lerp(600, 1180, u(t, 230.42, 234.6)), p = paso(t, 0.9, 0.5);
      lar(t, x, 990, 1.0, { cara: cara('dolor', { boca: 'abajo', ab: 0, ojoH: 0.8 }), mira: [0.8, 0.3], pose: { ...p.pose, tor: 8, cab: 6 }, manoI: [-40, -300 + 990 - 990], manoD: [40, -300] }, L_DIA);
    });
    rotuloLugar('Meses después', null, ven(t, 230.7, 233.6, 0.4));
    C.vineta(g, 0.4);
  } else {
    const cam = mov(t, 234.84, 242.68, E(960, 560, 1.0), E(1000, 600, 1.12));
    capa(cam, 1, () => {
      cuarto('#a9c2b0', '#86a28f', '#b7b1a2', '#958f80', 850);
      dib('medico', { t, x: 1350, y: 980, escala: 1.1, cara: cara('neutral', { cej: -6 }), mira: [-0.7, 0.4], pose: { sentado: true, pi: [6, 0, 0.9], pd: [-6, 0, 0.9], cab: 6 }, manoI: [-150, -230], manoD: [-80, -230] }, L_DIA);
      escritorio(900, 770, 820, 300);
      const cierra = sv(u(t, 236.5, 237.3));
      g.save(); g.translate(1150, 760); g.beginPath(); g.rect(-180, -30, 360, 30); trazo('#d9b46a', 4); g.save(); g.translate(0, -30); g.scale(1, 1 - cierra * 1.0); g.beginPath(); g.rect(-180, -200, 180, 200); g.fillStyle = '#f2ecdc'; g.fill(); g.restore(); g.restore();
      lar(t, 560, 1000, 1.08, { cara: t > 239.6 ? cara('triste', { cej: 24 }) : cara('neutral', { cej: 12 }), mira: [0.8, 0.1], pose: { sentado: true, pi: [6, 0, 0.9], pd: [-6, 0, 0.9] } }, L_DIA);
    });
    sello('SIN PENSIÓN', 1200, 330, u(t, 238.0, 238.35), -0.1, 80);
    if (ven(t, 239.6, 242.7) > 0) { grande('«Sufrió muy poco»', 960, 170, ven(t, 239.6, 242.7), 74, '#fff', 'italic 700'); grande('según Larisa', 960, 250, ven(t, 239.8, 242.7), 30, '#e2e2e2', '600'); }
    C.vineta(g, 0.45);
  }
}
function sobre(x, y, w, h, txt, sub, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 20; g.shadowOffsetY = 8; g.beginPath(); rr(-w / 2, -h / 2, w, h, 8); g.fillStyle = '#e8d8b4'; g.fill(); g.shadowColor = 'transparent'; g.lineWidth = 4; g.strokeStyle = LINEA; g.stroke(); g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(0, 0); g.lineTo(w / 2, -h / 2); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#2b2b2b'; g.textAlign = 'center'; g.font = `800 ${h * 0.34}px Inter`; g.fillText(txt, 0, h * 0.28); if (sub) { g.font = `600 ${h * 0.13}px Inter`; g.fillText(sub, 0, h * 0.44); } g.restore(); }
function s14(t) {
  if (t < 252.26) {
    const cam = mov(t, 242.68, 252.26, E(960, 560, 1.0), E(980, 560, 1.08));
    capa(cam, 1, () => {
      cuarto('#c9bfa8', '#a89e86', '#7a6650', '#5a4a3a', 860);
      g.beginPath(); rr(260, 120, 1400, 640, 10); trazo('#8a7258', 6); g.fillStyle = vgrad(160, 720, [[0, '#3c4038'], [1, '#2a2d27']]); g.fillRect(300, 160, 1320, 560);
      brillo(960, 300, 500, '255,225,160', 0.4);
      dib('pas1', { t, x: 960, y: 1020, escala: 1.35, cara: cara('neutral', { cej: -6 }), mira: [0, 0.6], pose: { cab: 10 } }, { tinte: 'rgba(10,10,15,0.65)', borde: 'rgba(255,225,150,0.6)', off: [6, -3], bordeK: 0.6 });
      g.strokeStyle = LINEA; g.lineWidth = 14; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(340 + i * 155, 160); g.lineTo(340 + i * 155, 720); g.stroke(); } g.strokeStyle = '#9a9ea4'; g.lineWidth = 7; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(340 + i * 155, 160); g.lineTo(340 + i * 155, 720); g.stroke(); }
      madera(200, 720, 1520, 70, '#8a6a4b', '#6e5139'); g.lineWidth = 5; g.strokeStyle = LINEA; g.strokeRect(200, 720, 1520, 70); madera(240, 790, 1440, 500, '#6e5139', '#4f3a28'); g.strokeRect(240, 790, 1440, 500);
      const e1 = sv(u(t, 243.6, 244.6)); sobre(lerp(960, 700, e1), lerp(600, 840, e1), 300, 170, '75', 'rublos', -0.05);
      if (t > 249.6) { const e2 = sv(u(t, 249.8, 250.8)); sobre(lerp(960, 1220, e2), lerp(600, 840, e2), 320, 190, '150', 'por Vladimir', 0.05); }
    });
    if (t > 247.4 && t < 249.8) { grande('alcanza para 1 mes', 960, 120, ven(t, 247.5, 249.8), 46, '#fff', '700'); grande('según Larisa', 960, 185, ven(t, 247.6, 249.8), 28, '#e2e2e2', '600'); }
    rotuloLugar('Aeroflot', 'La aerolínea del Estado', ven(t, 242.9, 246.8, 0.4));
    C.vineta(g, 0.5);
  } else {
    const cam = mov(t, 252.26, 256.71, E(960, 540, 1.0), E(960, 540, 1.12));
    capa(cam, 1, () => { madera(-300, -300, 2600, 1700, '#4f3a2a', '#35261a'); lampVerde(1650, 200, 1.0, 0.8); g.save(); g.translate(900, 560); g.rotate(-0.04); g.beginPath(); rr(-420, -300, 840, 600, 10); trazo('#c9a96a', 6); g.beginPath(); rr(-400, -330, 260, 50, 10); trazo('#c9a96a', 5); g.restore(); papel(910, 570, 700, 520, -0.04, '#f2ecdc'); g.save(); g.translate(910, 570); g.rotate(-0.04); g.font = '700 36px Inter'; g.fillStyle = '#2b2b2b'; g.fillText('EXPEDIENTE', -320, -190); lineasTexto(-320, -140, 640, 9, 32, 'rgba(50,50,50,0.45)', 13); g.restore(); });
    sello('VÍCTIMA', 900, 480, u(t, 252.5, 252.8), -0.08, 80, '#7a7a7a');
    if (t > 254.0) { reset(); g.save(); g.strokeStyle = '#c8302a'; g.lineWidth = 10; const q = u(t, 254.0, 254.4); g.beginPath(); g.moveTo(640, 480); g.lineTo(640 + 520 * q, 480 - 30 * q); g.stroke(); g.restore(); }
    sello('TESTIGO', 1000, 680, u(t, 255.2, 255.55), -0.14, 110);
    C.vineta(g, 0.5);
  }
}
function planeador(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#3a2c22'; g.lineWidth = 6; g.beginPath(); g.moveTo(-200, 0); g.lineTo(200, -20); g.moveTo(-40, -10); g.lineTo(-60, 60); g.lineTo(80, 60); g.lineTo(40, -14); g.moveTo(160, -18); g.lineTo(230, -60); g.lineTo(240, -10); g.stroke(); g.beginPath(); g.moveTo(-200, 0); g.quadraticCurveTo(0, -60, 200, -20); g.fillStyle = 'rgba(200,180,140,0.6)'; g.fill(); g.stroke(); g.restore(); }
function s15(t) {
  const cam = t < 271.3 ? mov(t, 256.71, 271.3, E(960, 560, 1.0), E(900, 540, 1.1)) : mov(t, 271.3, 277.48, E(1100, 700, 1.4), E(1150, 760, 1.55));
  capa(cam, 1, () => {
    madera(-400, -300, 2800, 1800, '#4f3a2a', '#35261a'); lampVerde(1700, 120, 1.0, 0.7);
    papel(900, 560, 1180, 880, -0.02, '#ece4d0');
    g.save(); g.translate(900, 560); g.rotate(-0.02);
    g.fillStyle = '#2b2b2b'; g.font = '900 72px Lora'; g.textAlign = 'center'; g.fillText('DIARIO DE LA TARDE', 0, -340); g.fillRect(-540, -310, 1080, 6); g.font = '700 28px Inter'; g.fillText('4 DE DICIEMBRE DE 1985', 0, -270);
    g.textAlign = 'left'; g.font = '800 46px Lora'; g.fillText('Sobrevivió a la caída', -520, -190); g.fillText('de un planeador casero', -520, -136);
    g.fillStyle = '#d9d0b8'; g.fillRect(-520, -100, 480, 300); g.lineWidth = 3; g.strokeStyle = '#555'; g.strokeRect(-520, -100, 480, 300); planeador(-280, 50, 0.9);
    lineasTexto(20, -100, 500, 10, 30, 'rgba(40,40,40,0.5)', 21); lineasTexto(-520, 230, 1040, 5, 30, 'rgba(40,40,40,0.5)', 31);
    g.font = '700 30px Inter'; g.fillStyle = '#2b2b2b'; g.fillText('… en el verano de 1979 …', 20, 220);
    g.font = '600 28px Inter'; g.fillText('… unos cerillos secos …', 140, 360);
    g.restore();
    if (t > 266.8) { g.save(); g.translate(900, 560); g.rotate(-0.02); const q = u(t, 267.0, 267.8); g.strokeStyle = '#c8302a'; g.lineWidth = 7; g.beginPath(); g.ellipse(260, 210, 190 * q, 34 * q, 0, 0, TAU); g.stroke(); if (t > 267.8) { g.font = 'italic 700 48px Lora'; g.fillStyle = '#c8302a'; g.fillText('1981', 300, 140); } g.restore(); }
    if (t > 263.8 && t < 271.3) { g.save(); g.translate(900, 560); g.rotate(-0.02); const q = u(t, 264.4, 265.0); g.strokeStyle = '#c8302a'; g.lineWidth = 6; g.beginPath(); g.ellipse(-280, 50, 260 * q, 180 * q, 0, 0, TAU); g.stroke(); g.restore(); }
    if (t > 271.3) { g.save(); g.translate(900, 560); g.rotate(-0.02); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(255,230,90,0.7)'; g.fillRect(130, 335, 330 * u(t, 271.5, 272.4), 36); g.restore(); if (t > 274.0) { g.setLineDash([10, 8]); g.strokeStyle = '#c8302a'; g.lineWidth = 4; g.strokeRect(140, 390, 360, 50); g.setLineDash([]); g.font = 'italic 700 30px Lora'; g.fillStyle = '#c8302a'; g.fillText('… del bolsillo de su esposo …', 150, 425); g.globalAlpha = 0.9; g.lineWidth = 5; g.beginPath(); g.moveTo(130, 415); g.lineTo(520, 415); g.stroke(); } g.restore(); }
  });

  if (t > 269.2 && t < 271.4) { reset(); const q = u(t, 269.2, 271.3); g.save(); g.translate(lerp(500, 1400, q), 560 + Math.sin(q * 6) * 120); g.lineWidth = 14; g.strokeStyle = LINEA; g.beginPath(); g.arc(0, 0, 90, 0, TAU); g.stroke(); g.fillStyle = 'rgba(200,230,255,0.25)'; g.fill(); g.beginPath(); g.moveTo(64, 64); g.lineTo(170, 170); g.lineWidth = 22; g.stroke(); g.restore(); }
  rotuloLugar('Diciembre de 1985', 'Casi cuatro años después', ven(t, 257.0, 261.4, 0.4));
  C.vineta(g, 0.5);
  if (t < 257.2) fundido(1 - u(t, 256.71, 257.2));
}
function torre(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-40, 0); g.lineTo(-26, -300); g.lineTo(26, -300); g.lineTo(40, 0); g.closePath(); trazo('#cfc7b8', 5); g.beginPath(); g.moveTo(-90, -300); g.lineTo(90, -300); g.lineTo(70, -390); g.lineTo(-70, -390); g.closePath(); trazo('#9fb8c8', 5); g.beginPath(); rr(-80, -420, 160, 30, 6); trazo('#6b6f78', 4); g.restore(); }
function telefono(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); rr(-60, -40, 120, 80, 14); trazo('#2b2b30', 5); g.beginPath(); g.moveTo(-70, -50); g.quadraticCurveTo(0, -90, 70, -50); g.lineWidth = 22; g.strokeStyle = LINEA; g.stroke(); g.lineWidth = 14; g.strokeStyle = '#3a3a42'; g.stroke(); g.restore(); }
function s16(t) {
  cielo([[0, '#2a3358'], [0.6, '#7d6c8f'], [1, '#e7a888']]);
  for (let i = 0; i < 4; i++) nube(200 + i * 500, 780 + (i % 2) * 60, 1.0, [235, 210, 210], [150, 130, 160], 0.6, i + 20);
  const q = u(t, 278.5, 283.5);
  g.save(); g.setLineDash([24, 18]); g.lineWidth = 8;
  g.strokeStyle = '#7fc4ff'; g.beginPath(); g.moveTo(100, 600); g.lineTo(lerp(100, 1000, q), lerp(600, 460, q)); g.stroke();
  g.strokeStyle = '#ff6b5a'; g.beginPath(); g.moveTo(1800, 120); g.lineTo(lerp(1800, 1000, q), lerp(120, 460, q)); g.stroke(); g.setLineDash([]); g.restore();
  if (q > 0.98) { brillo(1000, 460, 200, '255,255,255', 0.9); g.save(); g.strokeStyle = '#fff'; g.lineWidth = 12; g.beginPath(); g.moveTo(960, 420); g.lineTo(1040, 500); g.moveTo(1040, 420); g.lineTo(960, 500); g.stroke(); g.restore(); }
  avion(lerp(100, 1000, q) - 30, lerp(600, 460, q) + 4, 0.18, t, { rot: -0.15 }); bombardero(lerp(1800, 1000, q) + 30, lerp(120, 460, q) - 10, 0.16, t, { mira: -1, rot: -0.4 });
  grande('Civil', 260, 680, ven(t, 282.6, 290), 44, '#bfe3ff', '800'); grande('Militar', 1660, 220, ven(t, 284.9, 290), 44, '#ffc2b8', '800');
  const tr = u(t, 287.0, 287.8);
  torre(300, 1080, 0.8); torre(1620, 1080, 0.8);
  if (tr > 0) { g.save(); g.globalAlpha = tr; telefono(520, 920, 0.8); telefono(1400, 920, 0.8); g.strokeStyle = '#2b2b30'; g.lineWidth = 6; g.beginPath(); g.moveTo(560, 940); g.bezierCurveTo(700, 1010, 800, 900, 900, 950); g.moveTo(1360, 940); g.bezierCurveTo(1220, 1010, 1100, 900, 1020, 950); g.stroke(); g.strokeStyle = '#ff6b5a'; g.lineWidth = 6; g.beginPath(); g.moveTo(930, 920); g.lineTo(990, 980); g.moveTo(990, 920); g.lineTo(930, 980); g.stroke(); g.restore(); }
  rotuloLugar('8 años después', 'Según Larisa, así supo qué pasó', ven(t, 277.7, 282.4, 0.4));
  C.vineta(g, 0.4);
}
function grabadora(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); rr(-140, -80, 280, 110, 14); trazo('#3a3a42', 5); for (const cx of [-60, 60]) { g.beginPath(); g.arc(cx, -25, 30, 0, TAU); trazo('#d8d4ca', 4); g.save(); g.translate(cx, -25); g.rotate(t * 3); g.fillStyle = '#3a3a42'; for (let i = 0; i < 3; i++) { g.rotate(TAU / 3); g.fillRect(-3, -24, 6, 14); } g.restore(); } g.fillStyle = '#c0392b'; g.beginPath(); g.arc(110, -60, 8, 0, TAU); g.fill(); g.restore(); }
function s17(t) {
  const cam = mov(t, 290.0, 305.57, E(960, 560, 1.0), E(1000, 580, 1.12));
  capa(cam, 1, () => {
    cuarto('#d8c8a8', '#b8a684', '#8a6e52', '#6a523c', 840);
    for (let i = 0; i < 24; i++) { g.fillStyle = 'rgba(140,90,60,0.1)'; for (let j = 0; j < 10; j++) { g.beginPath(); g.arc(-800 + i * 160, -400 + j * 130, 18, 0, TAU); g.fill(); } }
    g.save(); g.beginPath(); g.rect(1260, 140, 420, 400); g.fillStyle = vgrad(140, 540, [[0, '#f0c48f'], [1, '#f6e3c4']]); g.fill(); g.lineWidth = 8; g.strokeStyle = '#efe7da'; g.stroke(); g.restore(); brillo(1470, 340, 500, '255,210,150', 0.5);
    const anio = t < 292.8 ? 1982 : Math.min(2001, 1982 + Math.floor((t - 292.8) / 3.5 * 19));
    papel(560, 330, 240, 300, 0.02, '#f6f2ea'); g.save(); g.translate(560, 330); g.fillStyle = '#c0392b'; g.fillRect(-120, -150, 240, 70); g.fillStyle = '#fff'; g.font = '800 46px Inter'; g.textAlign = 'center'; g.fillText(String(anio), 0, -100); g.fillStyle = '#2b2b2b'; g.font = '900 120px Inter'; g.fillText(anio >= 2001 ? '' : '', 0, 70); for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { g.fillStyle = 'rgba(40,40,40,0.4)'; g.fillRect(-100 + j * 34, -40 + i * 36, 22, 18); } g.restore();
    if (t > 292.8 && t < 296.4) { for (let i = 0; i < 3; i++) { const q = ((t * 3 + i / 3) % 1); g.save(); g.translate(560 + q * 300, 330 + q * 400); g.rotate(q * 3); g.scale(0.6, 0.6); g.globalAlpha = (1 - q) * 0.8; g.fillStyle = '#f6f2ea'; g.fillRect(-120, -150, 240, 300); g.restore(); } }
    mantel(820, 800, 760, 60); g.fillStyle = '#5a3f2c'; g.fillRect(860, 860, 26, 220); g.fillRect(1530, 860, 26, 220);
    const bebe = t < 292.8;
    lar(t, 760, 1060, 1.1, { cara: bebe ? cara('tranquila') : t > 298.5 ? cara('neutral', { cej: 10 }) : 'neutral', mira: bebe ? [0.3, 0.7] : [0.8, 0.0], pose: { sentado: !bebe, pi: [6, 0, 0.9], pd: [-6, 0, 0.9], cab: bebe ? 14 : 0 }, manoI: bebe ? [-20, -260] : null, manoD: bebe ? [60, -250] : null }, L_CALIDA);
    if (bebe) { g.save(); g.translate(790, 1060 - 270 * 1.1); g.beginPath(); g.ellipse(0, 0, 70, 46, -0.2, 0, TAU); trazo('#f4e3ec', 5); g.beginPath(); g.arc(-36, -10, 30, 0, TAU); trazo('#f2d6be', 4); g.restore(); }
    if (t > 295.8) { const a = u(t, 295.8, 296.4); g.save(); g.globalAlpha = a; grabadora(1200, 800, 0.9, t); g.restore(); }
  });
  if (t > 298.5) { reset(); const a = ven(t, 298.6, 305.57); g.save(); g.globalAlpha = a; papel(1360, 380, 520, 200, -0.05, '#f6f2ea'); g.translate(1360, 380); g.rotate(-0.05); g.font = 'italic 700 54px Lora'; g.fillStyle = '#2b2b2b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('¿Hay alguien vivo?', 0, -10); g.restore(); }
  if (t > 302.4) { reset(); const a = u(t, 302.4, 302.9); g.save(); g.globalAlpha = a; g.translate(1440, 560 + (1 - C.salida(a)) * 60); g.rotate(0.06); papel(0, 0, 360, 160, 0, '#fff7e0'); g.font = '800 56px Inter'; g.fillStyle = '#c8302a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('20 años', 0, 0); g.restore(); }
  rotuloLugar(t < 292.8 ? 'Un hijo' : t < 298.5 ? '2001' : '2001', t < 292.8 ? 'Larisa rehace su vida' : 'Por fin puede contarlo', ven(t, 290.3, 297.0, 0.4));
  C.vineta(g, 0.45);
}
function s18(t) {
  if (t < 314.9) {
    const cam = mov(t, 305.57, 314.9, E(960, 560, 1.0), E(960, 500, 1.12));
    reset(); g.fillStyle = '#0d0b14'; g.fillRect(0, 0, W, H);
    capa(cam, 1, () => {
      g.fillStyle = '#151221'; g.fillRect(-500, -500, 3000, 2200);
      const dos = sv(u(t, 310.3, 311.3));
      const sw = lerp(900, 640, dos), sh = sw * 0.55;
      g.fillStyle = '#2a2433'; g.fillRect(960 - sw / 2 - lerp(0, 340, dos) - 12, 140 - 12, sw + 24, sh + 24); pantallaCine(960 - sw / 2 - lerp(0, 340, dos), 140, sw, sh, t);
      if (dos > 0) { g.save(); g.globalAlpha = dos; const x = 960 - sw / 2 + 340, y = 140; g.fillStyle = '#2a2433'; g.fillRect(x - 12, y - 12, sw + 24, sh + 24); g.save(); g.beginPath(); g.rect(x, y, sw, sh); g.clip(); g.fillStyle = vgrad(y, y + sh, [[0, '#9aa6a8'], [1, '#c9cfc3']]); g.fillRect(x, y, sw, sh); for (let i = 0; i < 9; i++) abedul(x + 30 + i * sw / 8, y + sh, sh * 0.9, 12, i + 90, t, '#a9b96a'); g.translate(x + sw * 0.5, y + sh * (0.15 + ((t * 0.18) % 1) * 0.5)); g.rotate(Math.sin(t * 2) * 0.2); asiento(0, 0, 0.18, { col: '#b23a35', col2: '#7e2622' }); g.restore(); g.restore(); }
      polvo(t, 0.7, '230,235,255', 40, 0, 1920, 0, 700);
      brillo(960, 300, 900, '150,190,255', 0.3);
      for (let row = 0; row < 3; row++) { for (let i = 0; i < 9; i++) { const x = -100 + i * 260 + row * 120, y = 760 + row * 150; g.beginPath(); rr(x - 90, y - 140, 180, 220, 30); g.fillStyle = vgrad(y - 140, y + 80, [[0, '#7a2430'], [1, '#3d121a']]); g.fill(); g.lineWidth = 4; g.strokeStyle = '#1a0c10'; g.stroke(); } if (row === 0) lar(t, 1060, 880, 0.85, { cara: cara('neutral', { cej: 8 }), mira: [0, -0.6], pose: { sentado: true, pi: [6, 0, 0.8], pd: [-6, 0, 0.8] }, sombra: false }, L_CINE); }
      for (let i = 0; i < 9; i++) { const x = -100 + i * 260 + 240, y = 1210; g.beginPath(); rr(x - 90, y - 140, 180, 220, 30); g.fillStyle = '#2a0c12'; g.fill(); }
    });
    C.vineta(g, 0.6);
    fundido(u(t, 313.6, 314.9));
  } else {
    reset(); g.fillStyle = '#0b0a10'; g.fillRect(0, 0, W, H);
    const a = ven(t, 315.2, 322.5, 0.8);
    grande('Larisa Savitskaya', 960, 470, a, 96, '#fff', 'italic 700');
    grande('Vuelo 811 · 24 de agosto de 1981', 960, 580, a, 40, '#f4c7c0', '600');
    grande('Sobrevivió a una caída de 5,220 metros', 960, 660, a * 0.9, 32, '#cfcbd8', '500');
  }
}

const TOMAS = [[0, 21.4, s01], [21.4, 37.57, s02], [37.57, 52.65, s03], [52.65, 79.78, s04], [79.78, 97.98, s05], [97.98, 114.67, s06], [114.67, 153.47, s07], [153.47, 170.11, s08], [170.11, 189.24, s09], [189.24, 215.43, s10], [215.43, 222.62, s11], [222.62, 230.42, s12], [230.42, 242.68, s13], [242.68, 256.71, s14], [256.71, 277.48, s15], [277.48, 290.0, s16], [290.0, 305.57, s17], [305.57, 323, s18]];
window.renderAt = t => {
  g.limpiar(); reset();
  for (const [a, b, f] of TOMAS) if (t >= a && t < b) { f(t); break; }
  reset(); C.grano(g, t, 0.035);
};
