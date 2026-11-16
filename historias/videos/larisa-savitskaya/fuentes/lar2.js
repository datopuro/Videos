function taiga(t, cam, o = {}) {
  const ll = o.lluvia ?? 1, dia3 = o.dia3 || 0;
  cielo([[0, dia3 ? '#aab6b8' : '#8e989b'], [0.6, dia3 ? '#d5dcd6' : '#bcc4c0'], [1, '#c9cfc3']]);
  if (dia3) brillo(1400, 120, 700, '255,245,220', 0.5 * dia3);
  capa(cam, 0.15, () => { for (let i = 0; i < 40; i++) { const x = -800 + i * 110 + hs(i) * 60, h = 260 + hs(i * 3) * 200; g.fillStyle = 'rgba(120,135,130,0.55)'; g.beginPath(); g.moveTo(x, 760); g.lineTo(x + 40, 760 - h); g.lineTo(x + 80, 760); g.fill(); } g.fillStyle = 'rgba(150,160,155,0.7)'; g.fillRect(-1000, 740, 5000, 400); });
  C.niebla(g, t, { k: 0.9, y: 640, alto: 200, color: '220,226,222', semilla: 5 });
  capa(cam, 0.45, () => { for (let i = 0; i < 22; i++) { const x = -900 + i * 210 + hs(i * 7) * 80; g.save(); g.globalAlpha = 0.75; abedul(x, 800, 520 + hs(i) * 160, 26, i + 40, t, '#9aac68'); g.restore(); } g.fillStyle = 'rgba(175,185,178,0.45)'; g.fillRect(-1000, 300, 5000, 600); });
  C.niebla(g, t, { k: 0.7, y: 780, alto: 160, color: '210,218,214', semilla: 9 });
  capa(cam, 1, () => {
    g.beginPath(); g.moveTo(-1500, 820); for (let x = -1500; x <= 4000; x += 100) g.lineTo(x, 820 + Math.sin(x * 0.004) * 18); g.lineTo(4000, 2000); g.lineTo(-1500, 2000); g.closePath(); g.fillStyle = vgrad(800, 1200, [[0, '#6b7a4c'], [0.5, '#56643d'], [1, '#3f4a2e']]); g.fill();
    for (let i = 0; i < 160; i++) { const x = -1500 + hs(i) * 5500, y = 840 + hs(i * 3) * 260; g.strokeStyle = ['#7d8f52', '#5a6b3c', '#93a35e'][i % 3]; g.lineWidth = 3; for (let j = -2; j <= 2; j++) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + j * 6, y - 18 - hs(i + j) * 16); g.stroke(); } }
    (o.charcos || [[300, 960, 120, 22], [1500, 1010, 160, 26], [2300, 940, 110, 18]]).forEach(([x, y, w, h]) => charco(x, y, w, h, t));
    for (const [x, sm] of (o.abedules || [[-300, 3], [180, 5], [1240, 8], [1820, 11], [2500, 14], [3100, 17]])) abedul(x, 900, 900 + hs(sm) * 200, 46, sm, t);
    for (const [x, y, s] of (o.helechos || [[60, 900, 1.0], [700, 930, 0.8], [1450, 910, 1.1], [2050, 940, 0.9], [2700, 900, 1.0]])) helecho(x, y, s, t, x);
  });
}
function restoAla(x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.beginPath(); g.moveTo(-260, 0); g.lineTo(240, -50); g.lineTo(280, 10); g.lineTo(140, 40); g.lineTo(100, 20); g.lineTo(40, 50); g.lineTo(-240, 40); g.closePath(); g.fillStyle = vgrad(-50, 50, [[0, '#e9ecef'], [1, '#9ea6b0']]); g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke(); g.save(); g.clip(); g.fillStyle = '#2f5f9e'; g.fillRect(-300, 4, 600, 12); g.restore(); g.restore(); }
function restoCola(x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.beginPath(); g.moveTo(-120, 0); g.lineTo(-60, -240); g.lineTo(20, -240); g.lineTo(120, 0); g.lineTo(60, 20); g.lineTo(20, 0); g.lineTo(-30, 26); g.closePath(); g.fillStyle = hgrad(-120, 120, [[0, '#dfe3e8'], [1, '#a7aeb8']]); g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke(); g.fillStyle = '#c0392b'; g.fillRect(-40, -200, 70, 24); g.restore(); }
function hojasSueltas(n, x0, x1, y0, y1, sem = 1) { for (let i = 0; i < n; i++) { const x = x0 + hs(i + sem) * (x1 - x0), y = y0 + hs(i * 3 + sem) * (y1 - y0); g.save(); g.translate(x, y); g.rotate(hs(i * 7) * 2 - 1); g.fillStyle = '#efe8d8'; g.fillRect(-20, -14, 40, 28); g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; g.strokeRect(-20, -14, 40, 28); g.restore(); } }
function acostada(t, x, y, k, e, luz) { g.save(); g.translate(x, y); g.rotate(-Math.PI / 2 + 0.06); g.translate(-x, -y); lar(t, x, y, k, { ...e, sombra: false }, luz); g.restore(); }
function bulto(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-170, 0); g.quadraticCurveTo(-160, -90, -40, -100); g.quadraticCurveTo(80, -110, 160, -60); g.quadraticCurveTo(190, -20, 170, 0); g.closePath(); g.fillStyle = vgrad(-110, 0, [[0, '#6c7c8f'], [1, '#48566a']]); g.fill(); g.lineWidth = 5; g.strokeStyle = LINEA; g.stroke(); g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-120 + i * 70, -80 + i * 6); g.quadraticCurveTo(-100 + i * 70, -40, -110 + i * 70, -6); g.stroke(); } g.restore(); }
function parpados(k) { if (k >= 1) return; reset(); const ab = sv(k) * 640; g.save(); g.fillStyle = '#000'; g.beginPath(); g.rect(0, 0, W, H); g.ellipse(W / 2, H / 2, W * 0.7, Math.max(1, ab), 0, 0, TAU); g.fill('evenodd'); g.restore(); if (k < 0.9) { g.save(); g.globalAlpha = (1 - k) * 0.6; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.restore(); } }
function eco(txt, x, y, a, t) { if (a <= 0) return; for (let i = 2; i >= 0; i--) { g.save(); g.globalAlpha = a * (i === 0 ? 1 : 0.25 / i); g.font = `italic 700 ${84 + i * 18}px Lora`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 18; g.fillText(txt, x + i * 30 * Math.sin(t), y - i * 10); g.restore(); } }

function s07(t) {
  const EA = { abedules: [[-300, 3], [180, 5], [1240, 8], [1900, 11], [2600, 14]] };
  if (t < 142.3) {
    const sienta = sv(u(t, 125.6, 127.2));
    let cam;
    if (t < 118.3) cam = E(1000, 860, 1.9);
    else if (t < 125.6) cam = mov(t, 118.3, 125.6, E(1000, 700, 1.2), E(960, 560, 1.0));
    else if (t < 132.4) cam = mov(t, 125.6, 132.4, E(960, 560, 1.0), E(980, 620, 1.25));
    else if (t < 135.7) cam = mov(t, 132.4, 135.7, E(990, 640, 1.6), E(990, 640, 1.75));
    else cam = mov(t, 135.7, 142.3, E(980, 640, 1.4), E(1000, 620, 1.25));
    taiga(t, cam, EA);
    capa(cam, 1, () => {
      asiento(1240, 930, 1.0, { col: '#3d5f8f', col2: '#2c4670', rot: -0.35 });
      restoAla(1700, 960, 0.9, 0.08); hojasSueltas(8, 1350, 1900, 960, 1040, 3);
      const luz = { ...L_FRIA, borde: 'rgba(235,240,245,0.7)' };
      if (sienta <= 0) acostada(t, 1080, 990, 1.0, { cara: t < 118.3 ? cara('dormida') : cara('dolor', { boca: 'abajo', ab: 0, ojoH: 0.6 }), mira: [0, -1], pose: { cab: 10 }, manoI: [-90, -120], pelo: [0, 0] }, luz);
      else lar(t, 1000, 1000, 1.0, { cara: t > 135.7 ? cara('dolor', { boca: 'abajo', ab: 0 }) : t > 129.2 ? cara('triste', { cej: 22 }) : cara('dolor', { boca: 'abajo', ab: 0, ojoH: 0.7 }), mira: t > 129 && t < 131 ? [0.9, -0.4] : [-0.6, -0.1], pose: { suelo: true, cab: 6, tor: (1 - sienta) * -30 }, manoD: t > 135.7 ? [-30, -170] : [80, -40], manoI: [-90, -40], pelo: [10, 10] }, luz);
      if (sienta > 0) mosquitos(1000, 780, t, 34, 150, ven(t, 132.2, 142.3, 0.6));
    });
    lluvia(t, 1); salpica(t, 1, 820, 1080);
    eco('¿Hay alguien vivo?', 960, 260, ven(t, 129.2, 132.6, 0.4), t);
    rotuloLugar('La taiga', 'Extremo oriente de Rusia', ven(t, 120.8, 125.4, 0.5));
    grande('5 HORAS DESPUÉS', 960, 540, ven(t, 115.1, 118.2, 0.4) * (t < 118.3 ? 1 : 0), 70, '#fff', '800');
    C.vineta(g, 0.5);
    parpados(t < 117.6 ? Math.max(0, Math.sin((t - 114.9) * 2.2) * 0.4 + (t - 114.9) * 0.3) : 1);
  } else {
    const cam = t < 144.4 ? mov(t, 142.3, 144.4, E(1300, 640, 1.3), E(2100, 640, 1.3)) : mov(t, 144.4, 153.47, E(1700, 560, 1.0), E(1500, 520, 0.72));
    taiga(t, cam, { ...EA, charcos: [[300, 960, 120, 22], [1500, 1010, 160, 26], [2700, 940, 140, 20], [3300, 1000, 150, 24]] });
    capa(cam, 1, () => {
      restoCola(3150, 950, 1.3, 0.15); restoAla(2600, 990, 1.1, -0.1); asiento(2000, 930, 1.0, { col: '#3d5f8f', col2: '#2c4670', rot: 0.2 }); bulto(2200, 980, 0.9); asiento(2900, 960, 0.9, { col: '#b23a35', col2: '#7e2622', rot: -0.8 }); asiento(-200, 940, 0.9, { col: '#3d5f8f', col2: '#2c4670', rot: 1.2 }); restoAla(500, 1000, 0.8, 0.3);
      hojasSueltas(30, -400, 3600, 950, 1080, 9);
      asiento(1240, 930, 1.0, { col: '#3d5f8f', col2: '#2c4670', rot: -0.35 }); restoAla(1700, 960, 0.9, 0.08);
      lar(t, 1000, 1000, 1.0, { cara: cara('triste', { cej: 24, ojoH: 0.8 }), mira: [0.8, -0.1], pose: { suelo: true, cab: 6 }, manoD: [-30, -170], manoI: [-90, -40] }, { ...L_FRIA, borde: 'rgba(235,240,245,0.7)' });
    });
    lluvia(t, 1); salpica(t, 0.8, 820, 1080);
    grande('37 personas murieron', 960, 200, ven(t, 147.9, 151.0, 0.5), 64, '#fff', '800');
    grande('Ella es la única viva', 960, 200, ven(t, 151.0, 153.4, 0.4), 64, '#ffd9d2', '800');
    C.vineta(g, 0.5);
  }
}

function bolsa(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-95, 60); g.quadraticCurveTo(-120, -120, 0, -130); g.quadraticCurveTo(120, -120, 95, 60); g.quadraticCurveTo(0, 80, -95, 60); g.fillStyle = 'rgba(225,235,240,0.32)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3; g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.moveTo(-60, -90); g.quadraticCurveTo(-80, -30, -60, 20); g.stroke(); g.restore(); }
function techo(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); asiento(-220, 0, 0.9, { col: '#3d5f8f', col2: '#2c4670' }); asiento(240, 0, 0.9, { col: '#3d5f8f', col2: '#2c4670', mira: -1 }); g.beginPath(); rr(-330, -290, 680, 26, 6); trazo('#a0825e', 4); g.beginPath(); g.moveTo(-350, -280); g.quadraticCurveTo(0, -330, 370, -280); g.lineTo(390, -150); g.quadraticCurveTo(0, -200, -370, -150); g.closePath(); trazo('#5a7fae', 5); g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-300 + i * 120, -300); g.lineTo(-310 + i * 120, -170); g.stroke(); } g.restore(); }
function s08(t) {
  if (t < 164.0) {
    const cam = t < 160.75 ? mov(t, 153.47, 160.75, E(1000, 640, 1.15), E(1000, 600, 1.35)) : mov(t, 160.75, 164, E(1150, 760, 1.35), E(1150, 760, 1.45));
    taiga(t, cam, { abedules: [[300, 5], [1700, 8], [2400, 11]], charcos: [[1250, 1010, 150, 24]] });
    capa(cam, 1, () => {
      techo(880, 960, 1.0); restoAla(1700, 990, 0.8, 0.05);
      const bebe = t > 160.75;
      if (!bebe) { lar(t, 880, 990, 0.95, { cara: cara('triste', { cej: 18 }), mira: [0.6, -0.1], pose: { suelo: true, cab: 4 }, manoI: [-40, -120], manoD: [40, -120] }, { ...L_FRIA, borde: 'rgba(235,240,245,0.6)' }); if (t > 157.0) { const a = u(t, 157.0, 157.7); g.save(); g.globalAlpha = a; bolsa(880, 990 - 145, 0.95); g.restore(); } }
      else { lar(t, 1150, 1000, 0.95, { cara: cara('triste', { ojoH: 0.5 }), mira: [0.4, 0.9], pose: { suelo: true, tor: 34, cab: 30 }, manoI: [70, -20], manoD: [110, -10] }, { ...L_FRIA, borde: 'rgba(235,240,245,0.6)' }); bolsa(1150 + 92, 1000 - 125, 0.95); }
    });
    lluvia(t, 0.8); salpica(t, 0.7, 840, 1080);
    rotuloLugar('DÍA 1', 'Llueve sin parar', ven(t, 153.8, 158.5, 0.4));
    C.vineta(g, 0.5);
  } else {
    const cam = mov(t, 164, 170.11, E(800, 640, 1.15), E(1500, 640, 1.15));
    taiga(t, cam, { abedules: [[-200, 21], [350, 23], [900, 25], [1500, 27], [2100, 29], [2700, 31], [3300, 33]], helechos: [[150, 920, 1.1], [1200, 940, 1.0], [2000, 930, 1.2], [2900, 920, 1.0]] });
    capa(cam, 1, () => {
      const ida = t < 168.4, x = ida ? lerp(500, 1700, u(t, 164, 167.0)) : lerp(1700, 1250, u(t, 168.4, 170.11)), para = t > 167 && t < 168.4;
      const p = para ? { pose: { cab: 4 } } : paso(t, 1.4, 0.7);
      lar(t, x, 1000, 0.9, { cara: para ? cara('triste', { cej: 22 }) : cara('dolor', { boca: 'abajo', ab: 0, ojoH: 0.8 }), mira: para ? [Math.sin(t * 2) * 0.9, -0.2] : [ida ? 0.8 : -0.8, 0], pose: { ...p.pose }, manoD: [-30, -170] }, { ...L_FRIA, borde: 'rgba(235,240,245,0.6)' });
    });
    lluvia(t, 0.5);
    rotuloLugar('DÍA 2', 'Busca a alguien', ven(t, 164.2, 168.0, 0.4));
    C.vineta(g, 0.55);
  }
}

function tela(x1, y1, x2, y2, t, col = '#c0392b') { g.save(); const mx = (x1 + x2) / 2, my = Math.max(y1, y2) + 70 + Math.sin(t * 9) * 25; g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(mx + Math.sin(t * 7) * 40, y1 - 40, x2, y2); g.quadraticCurveTo(mx + 30, my, x1 + Math.sin(t * 8) * 20, y1 + 120); g.closePath(); g.fillStyle = vgrad(y1 - 40, my, [[0, '#e0473c'], [1, '#9e2a22']]); g.fill(); g.lineWidth = 4; g.strokeStyle = LINEA; g.stroke(); g.restore(); }
function claro(t, cam, viento = 0) {
  cielo([[0, '#97a8b6'], [0.6, '#cdd6d8'], [1, '#d9dccf']]); brillo(1300, 140, 700, '255,245,225', 0.5);
  capa(cam, 0.2, () => { for (let i = 0; i < 46; i++) { const x = -900 + i * 100, h = 240 + hs(i * 3) * 160; g.fillStyle = 'rgba(105,125,110,0.75)'; g.beginPath(); g.moveTo(x, 800); g.lineTo(x + 45, 800 - h); g.lineTo(x + 90, 800); g.fill(); } });
  capa(cam, 0.5, () => { for (const x of [-500, -100, 2100, 2500]) abedul(x, 830, 640, 32, x, t * (1 + viento * 3), '#a9b96a'); });
  capa(cam, 1, () => {
    g.fillStyle = vgrad(800, 1200, [[0, '#7c8a54'], [1, '#4c5935']]); g.fillRect(-1500, 820, 5500, 600);
    for (let i = 0; i < 200; i++) { const x = -800 + hs(i) * 3600, y = 840 + hs(i * 3) * 240, b = Math.sin(t * 6 + i) * viento * 14; g.strokeStyle = ['#8a9a5c', '#66773f', '#a1b066'][i % 3]; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + b * 0.5, y - 14, x + b, y - 26 - hs(i) * 14); g.stroke(); }
    abedul(-300, 1000, 1000, 48, 61, t); abedul(2200, 1000, 1000, 48, 67, t);
  });
}
function s09(t) {
  if (t < 176.3 || (t >= 182.7)) {
    const pasa = u(t, 170.3, 176.3), vuelve = u(t, 182.7, 189.24), vi = t < 176.3 ? Math.max(0, 1 - Math.abs(pasa - 0.5) * 2) : 0;
    const cam = t < 176.3 ? { ...mov(t, 170.11, 176.3, E(960, 600, 1.12), E(960, 620, 1.18)), temblor: vi * 0.5, t } : mov(t, 182.7, 189.24, E(960, 560, 1.0), E(980, 620, 1.2));
    claro(t, cam, vi);
    capa(cam, 1, () => {
      const agita = t < 176.3 && t > 172.8, baja = t >= 182.7 ? sv(u(t, 183.5, 185.5)) : 0;
      const ondula = Math.sin(t * 9);
      if (agita) { const hx = 960, hy = 1000; lar(t, hx, hy, 1.05, { cara: cara('miedo', { boca: 'o', ab: 0.3, cej: 18 }), mira: [0.4, -0.9], pose: { cab: -14 }, manoI: [-90 + ondula * 40, -420], manoD: [90 + ondula * 40, -430], pelo: [ondula * 20, -20] }, L_DIA); tela(hx - 90 * 1.05 + ondula * 42, hy - 420 * 1.05, hx + 90 * 1.05 + ondula * 42, hy - 430 * 1.05, t); }
      else if (t < 176.3) { lar(t, 960, 1000, 1.05, { cara: cara('sorpresa', { boca: 'o', ab: 0.3 }), mira: [-0.6, -0.9], pose: { cab: -14 }, manoD: [80, -150] }, L_DIA); g.save(); g.translate(1060, 860); g.rotate(0.4); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(40, 60, 10, 140); g.lineTo(-30, 130); g.quadraticCurveTo(-10, 60, -20, 0); g.closePath(); g.fill(); g.strokeStyle = LINEA; g.lineWidth = 4; g.stroke(); g.restore(); }
      else { lar(t, 960, 1000, 1.05, { cara: cara('triste', { cej: 24, ojoH: lerp(1, 0.7, baja) }), mira: [lerp(-0.6, 0.1, baja), lerp(-0.9, 0.4, baja)], pose: { cab: lerp(-14, 10, baja) }, manoD: [80, -150] }, L_DIA); g.save(); g.translate(1060, 860); g.rotate(0.4); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(40, 60, 10, 140); g.lineTo(-30, 130); g.quadraticCurveTo(-10, 60, -20, 0); g.closePath(); g.fill(); g.strokeStyle = LINEA; g.lineWidth = 4; g.stroke(); g.restore(); }
    });
    if (t < 176.3) { capa(cam, 1.2, () => { helicoptero(lerp(-700, 2700, pasa), 260 + Math.sin(t * 1.5) * 10, 0.9, t); helicoptero(lerp(-1500, 2100, pasa) , 140, 0.55, t + 1); }); }
    else { capa(cam, 0.5, () => { helicoptero(lerp(1300, 2200, vuelve), lerp(240, 120, vuelve), lerp(0.5, 0.25, vuelve), t, { mira: 1 }); helicoptero(lerp(1000, 2000, vuelve), lerp(180, 90, vuelve), lerp(0.35, 0.18, vuelve), t + 1); }); }
    if (vi > 0) { reset(); g.save(); g.globalAlpha = vi * 0.15; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.restore(); }
    C.vineta(g, 0.45);
  } else if (t < 179.3) {
    reset(); g.save(); g.translate(W / 2, H / 2); g.rotate(t * 0.04); g.scale(1 + (t - 176.3) * 0.05, 1 + (t - 176.3) * 0.05);
    g.fillStyle = '#3a5636'; g.fillRect(-1400, -1400, 2800, 2800);
    for (let i = 0; i < 520; i++) { const x = (hs(i) - 0.5) * 2600, y = (hs(i * 3) - 0.5) * 2600; g.fillStyle = ['#4b6b42', '#5d7f4e', '#2f4a30', '#6f8a4e', '#3e5a3a'][i % 5]; g.beginPath(); g.arc(x, y, 26 + hs(i * 5) * 40, 0, TAU); g.fill(); }
    g.fillStyle = '#6f7d4e'; g.beginPath(); g.ellipse(40, 30, 180, 120, 0.3, 0, TAU); g.fill();
    g.fillStyle = '#d42f25'; g.beginPath(); g.ellipse(40 + Math.sin(t * 9) * 4, 30, 9, 6, t * 4, 0, TAU); g.fill();
    g.restore();
    reset(); g.save(); g.fillStyle = '#20262a'; g.beginPath(); g.rect(0, 0, W, H); g.moveTo(1650, 540); g.ellipse(960, 540, 690, 470, 0, 0, TAU); g.fill('evenodd'); g.strokeStyle = '#3a4248'; g.lineWidth = 16; g.beginPath(); g.ellipse(960, 540, 690, 470, 0, 0, TAU); g.stroke(); g.restore();
    g.save(); g.globalAlpha = ven(t, 176.6, 179.2); g.strokeStyle = '#ffd34d'; g.lineWidth = 5; g.beginPath(); g.arc(1000, 570, 60 + Math.sin(t * 6) * 6, 0, TAU); g.stroke(); g.restore();
  } else {
    claro(t, E(960, 540, 1.0), 0);
    reset(); g.save(); g.fillStyle = 'rgba(20,20,28,0.45)'; g.fillRect(0, 0, W, H); g.restore();
    const a = u(t, 179.3, 179.8);
    helicoptero(300, 300, 0.6, t);
    g.save(); g.globalAlpha = a; g.fillStyle = '#fff'; for (const [cx, cy, r] of [[620, 290, 16], [680, 250, 24], [760, 210, 32]]) { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); g.strokeStyle = LINEA; g.lineWidth = 4; g.stroke(); }
    g.beginPath(); g.ellipse(1200, 420, 480 * C.salida(a), 320 * C.salida(a), 0, 0, TAU); g.fill(); g.lineWidth = 6; g.stroke(); g.save(); g.clip();
    g.fillStyle = vgrad(100, 740, [[0, '#d7e2d8'], [1, '#8c9a62']]); g.fillRect(700, 100, 1000, 700);
    for (const [x, c] of [[880, '#c7a660'], [1450, '#8aa06a']]) { g.beginPath(); g.moveTo(x - 120, 640); g.lineTo(x, 450); g.lineTo(x + 120, 640); g.closePath(); trazo(c, 5); g.beginPath(); g.moveTo(x - 30, 640); g.lineTo(x, 540); g.lineTo(x + 30, 640); g.fillStyle = '#4a3b2a'; g.fill(); }
    g.fillStyle = '#555'; g.fillRect(1260, 600, 90, 50); g.strokeStyle = LINEA; g.lineWidth = 4; g.strokeRect(1260, 600, 90, 50); vaporSimple(1305, 590, t);
    dib('pas3', { t, x: 1150, y: 690, escala: 0.75, cara: 'feliz', mira: [-0.6, 0], pose: {}, manoD: [140 + Math.sin(t * 9) * 30, -330] }, L_DIA);
    tela(1150 + 105 + Math.sin(t * 9) * 22, 690 - 250, 1150 + 170 + Math.sin(t * 9) * 22, 690 - 280, t);
    g.restore(); g.restore();
    grande('«La cocinera de los geólogos»', 1200, 830, ven(t, 179.8, 182.6), 44, '#fff', '700');
  }
}
function vaporSimple(x, y, t) { for (let i = 0; i < 3; i++) { const q = ((t * 0.5 + i / 3) % 1); g.save(); g.globalAlpha = 0.35 * (1 - q); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + q * 30, y - q * 60, 8 + q * 20, 0, TAU); g.fill(); g.restore(); } }

function cerillos(x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.beginPath(); rr(-60, -38, 120, 76, 6); trazo('#e8c35a', 5); g.fillStyle = '#6b3b2a'; g.fillRect(-60, -38, 14, 76); g.fillStyle = '#c0392b'; g.beginPath(); g.arc(14, 0, 18, 0, TAU); g.fill(); g.fillStyle = '#2b2b2b'; g.font = '700 18px Inter'; g.textAlign = 'center'; g.restore(); }
function cajetilla(x, y, s, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.beginPath(); rr(-48, -70, 96, 140, 6); trazo('#f1ede4', 5); g.fillStyle = '#2f5f9e'; g.fillRect(-48, -20, 96, 30); g.fillStyle = '#f6f2ea'; for (let i = 0; i < 4; i++) { g.fillRect(-36 + i * 20, -96, 14, 30); } g.fillStyle = '#d98c4a'; for (let i = 0; i < 4; i++) g.fillRect(-36 + i * 20, -96, 14, 10); g.restore(); }
function ramas(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (hs(i) - 0.5) * 1.2, l = 120 + hs(i * 3) * 80; g.strokeStyle = LINEA; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(Math.cos(a) * 30 - Math.cos(a) * l * 0.2, 20); g.lineTo(Math.cos(a) * l * 0.4, Math.sin(a) * l * 0.6 + 20); g.stroke(); g.strokeStyle = i % 2 ? '#7a5a3e' : '#e8e2d5'; g.lineWidth = 10; g.stroke(); } g.restore(); }
function hacha(x, y, ang, s = 1) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s); g.strokeStyle = LINEA; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -160); g.stroke(); g.strokeStyle = '#a07a50'; g.lineWidth = 10; g.stroke(); g.beginPath(); g.moveTo(-6, -150); g.lineTo(-60, -170); g.lineTo(-56, -120); g.lineTo(-6, -125); g.closePath(); trazo('#9aa3ab', 4); g.restore(); }
function s10(t) {
  if (t < 193.26) {
    const cam = mov(t, 189.24, 193.26, E(960, 540, 1.0), E(960, 540, 1.08));
    capa(cam, 1, () => {
      g.fillStyle = vgrad(0, 1080, [[0, '#53637a'], [1, '#3d4a5e']]); g.fillRect(-300, -300, 2600, 1700);
      g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2; for (let i = -40; i < 80; i++) { g.beginPath(); g.moveTo(i * 30, -300); g.lineTo(i * 30 + 600, 1400); g.stroke(); }
      g.beginPath(); rr(560, 380, 760, 520, 30); g.fillStyle = vgrad(380, 900, [[0, '#5f7fa8'], [1, '#4c6a92']]); g.fill(); g.lineWidth = 6; g.strokeStyle = LINEA; g.stroke(); g.beginPath(); g.moveTo(560, 460); g.lineTo(1320, 460); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 4; g.stroke(); g.setLineDash([12, 10]); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); rr(590, 410, 700, 470, 22); g.stroke(); g.setLineDash([]);
      const sale = sv(u(t, 189.6, 191.5));
      cerillos(840, lerp(640, 300, sale), 1.4, -0.2 * sale); cajetilla(1100, lerp(660, 330, sale), 1.3, 0.15 * sale);
      if (sale > 0.3) { const k = u(t, 190.6, 191.4); g.save(); g.globalAlpha = ven(t, 190.8, 193.2); for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + t; g.strokeStyle = '#fff6c8'; g.lineWidth = 4; g.beginPath(); g.moveTo(970 + Math.cos(an) * 200, 330 + Math.sin(an) * 120); g.lineTo(970 + Math.cos(an) * (230 + k * 30), 330 + Math.sin(an) * (140 + k * 20)); g.stroke(); } g.restore(); }
      g.beginPath(); rr(560, 380, 760, 120, 30); g.fillStyle = 'rgba(70,95,130,0.9)'; g.fill(); g.lineWidth = 6; g.strokeStyle = LINEA; g.stroke();
      if (sale < 0.4) { g.beginPath(); rr(560, 380, 760, 120, 30); g.fill(); }
    });
    lluvia(t, 0.6); C.vineta(g, 0.6);
    rotuloLugar('En el bolsillo de Vladimir', null, ven(t, 189.6, 193.0, 0.4));
  } else if (t < 198.7) {
    const cam = mov(t, 193.26, 198.7, E(1000, 600, 1.3), E(1050, 640, 1.15));
    taiga(t, cam, { abedules: [[300, 5], [1700, 8], [2400, 11]], charcos: [[700, 1010, 150, 24]] });
    capa(cam, 1, () => {
      techo(500, 960, 0.9);
      if (t > 196.3) ramas(1350, 990, lerp(0.3, 0.9, sv(u(t, 196.3, 197.8))));
      lar(t, 1000, 1000, 1.0, { cara: cara('neutral', { cej: -10 }), mira: [t > 196.3 ? 0.8 : 0.1, 0.4], pose: { suelo: true, cab: 10 }, manoI: [-30, -150], manoD: [30, -150] }, { ...L_FRIA, borde: 'rgba(235,240,245,0.6)' });
      cerillos(1000, 940, 0.5, 0.1);
    });
    lluvia(t, 0.4); C.vineta(g, 0.5);
  } else if (t < 207.9) {
    const cam = t < 203.7 ? mov(t, 198.7, 203.7, E(1100, 600, 1.15), E(1300, 580, 1.0)) : mov(t, 203.7, 207.9, E(1500, 540, 0.9), E(1500, 520, 0.95));
    taiga(t, cam, { lluvia: 0, dia3: 1, abedules: [[300, 5], [1500, 8], [2000, 11], [2500, 13], [3000, 15]], charcos: [[700, 1010, 150, 24]] });
    capa(cam, 1, () => {
      techo(500, 960, 0.9); ramas(1350, 990, 0.9);
      const oye = t > 199.6;
      lar(t, 1000, 1000, 1.0, { cara: oye ? cara('sorpresa', { boca: 'o', ab: 0.25 }) : 'neutral', mira: oye ? [0.9, -0.2] : [0.1, 0.4], pose: oye ? { cab: -6 } : { suelo: true, cab: 10 } }, L_DIA);
      if (t > 199.0 && t < 203.7) { for (let i = 0; i < 3; i++) { const q = ((t - 199) * 0.8 + i / 3) % 1; g.save(); g.globalAlpha = (1 - q) * 0.8; g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.arc(2100, 640, 40 + q * 260, Math.PI * 0.75, Math.PI * 1.25); g.stroke(); g.restore(); } }
      if (t > 200.6) { const ent = sv(u(t, 200.6, 203.4)), p1 = paso(t, 2.6, ent < 1 ? 1 : 0), p2 = paso(t + 0.4, 2.0, ent < 1 ? 0.8 : 0);
        dib('resc1', { t, x: lerp(2600, 1260, ent), y: 1000, escala: 1.0, cara: t > 202 ? cara('sorpresa', { boca: 'o', ab: 0.3 }) : 'neutral', mira: [-0.8, 0], pose: p1.pose }, L_DIA);
        if (t < 203.7) dib('resc2', { t, x: lerp(3000, 2050, ent), y: 1000, escala: 1.0, cara: 'neutral', mira: [-0.8, 0], pose: p2.pose }, L_DIA);
        else { const sw = Math.sin((t - 203.7) * 5), cae = sv(u(t, 205.6, 207.2)); dib('resc2', { t, x: 2050, y: 1000, escala: 1.0, cara: cara('neutral', { cej: -12 }), mira: [0.8, 0], pose: { tor: sw * 10 }, manoI: [120 + sw * 60, -260 - sw * 80], manoD: [140 + sw * 60, -240 - sw * 80] }, L_DIA); hacha(2050 + (130 + sw * 60), 1000 - (250 + sw * 80), 1.1 + sw * 0.9, 1);
          g.save(); g.translate(2300, 900); g.rotate(cae * 1.3); g.translate(-2300, -900); abedul(2300, 900, 700, 40, 77, 0); g.restore(); for (let i = 0; i < 8; i++) { const q = ((t * 3 + hs(i)) % 1); g.fillStyle = '#e8dcc0'; g.fillRect(2290 + q * 120 * (hs(i) - 0.3), 880 - q * 80 + q * q * 160, 8, 5); } }
      }
    });
    if (t > 205.0) capa(cam, 0.8, () => { const b = sv(u(t, 205.0, 207.9)); helicoptero(1900, lerp(-200, 280, b), 0.7, t); });
    rotuloLugar('DÍA 3', null, ven(t, 198.8, 202.0, 0.4));
    C.vineta(g, 0.45);
  } else if (t < 209.59) {
    const cam = mov(t, 207.9, 209.6, E(1350, 900, 1.6), E(1350, 900, 1.75));
    taiga(t, cam, { lluvia: 0, dia3: 1, abedules: [[300, 5], [1500, 8], [2000, 11]] });
    capa(cam, 1, () => { ramas(1350, 990, 0.9); cerillos(1320, 990, 0.4, 0.3); });
    C.vineta(g, 0.6);
  } else {
    const cam = mov(t, 209.59, 215.43, E(960, 540, 1.0), E(960, 520, 1.15));
    capa(cam, 1, () => {
      madera(-300, -300, 2600, 1700, '#5b3f2c', '#3f2b1e');
      papel(960, 540, 1300, 820, -0.03, '#e9e0c8');
      g.save(); g.translate(960, 540); g.rotate(-0.03);
      g.strokeStyle = '#5d86a8'; g.lineWidth = 16; g.beginPath(); g.moveTo(-640, -200); g.bezierCurveTo(-300, -320, -100, 40, 640, -100); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(-200, -160); g.quadraticCurveTo(-120, 100, -60, 380); g.stroke();
      g.fillStyle = 'rgba(90,120,70,0.25)'; for (let i = 0; i < 60; i++) { g.beginPath(); g.arc((hs(i) - 0.5) * 1200, (hs(i * 3) - 0.5) * 740, 20 + hs(i * 5) * 30, 0, TAU); g.fill(); }
      g.fillStyle = '#2b2b2b'; g.font = 'italic 600 34px Lora'; g.fillText('Río Amur', 260, -150); g.font = '700 30px Inter'; g.fillText('Zavitinsk', 60, 80); g.beginPath(); g.arc(30, 70, 10, 0, TAU); g.fill();
      const p = u(t, 209.9, 210.6); g.strokeStyle = '#c0392b'; g.lineWidth = 6; g.beginPath(); g.arc(30, 70, 40 + (1 - p) * 60, 0, TAU * p); g.stroke();
      g.restore();
      const cae = sv(u(t, 212.4, 213.3)); papel(lerp(1700, 1080, cae), lerp(-400, 560, cae), 560, 700, lerp(0.6, 0.08, cae), '#f4eee0'); g.save(); g.translate(lerp(1700, 1080, cae), lerp(-400, 560, cae)); g.rotate(lerp(0.6, 0.08, cae)); lineasTexto(-220, -260, 440, 14, 30, 'rgba(60,55,50,0.5)', 5); g.restore();
    });
    sello('SECRETO', 1080, 560, u(t, 213.8, 214.15), -0.12, 110);
    C.vineta(g, 0.5); fundido(u(t, 214.9, 215.43));
  }
}
