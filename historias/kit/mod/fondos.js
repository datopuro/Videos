/* Lugares del canal de historias: fondos por capas con profundidad, hora del día y luz, con el acabado de la utilería.
   Se carga después de la utilería (primero el módulo utileria y luego el módulo fondos).
   Uso: const L = C.lugar('calle', { hora: 'noche' });
        L.dibujar(g, {t, x})  →  objetos y personajes (pies en y >= L.piso)  →  L.frente(g, {t, x})  →  L.luz(g, {t, x, focos})
   focos: [{x, y, r, color, fuerza}] son luces locales (fogata, lámpara) que aclaran lo que tienen cerca; el color lleva una A donde va la opacidad.
   "x" es el desplazamiento de cámara en píxeles: las capas lejanas se mueven menos (paralaje).
   Referencias:
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createLinearGradient : cielos y pisos en degradado.
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation : "multiply" para teñir
     toda la toma con la hora del día y "screen" para focos, ventanas y rayos de luz.
   https://github.com/luispablovillasenor-afk/shorts-animados-claude (referencias/BIBLIA_DE_ESTILO.md, MIT): lo lejano se
     aclara y pierde contorno (perspectiva atmosférica), la luz cambia con la historia y las sombras son frías.
   Todo es función de t y de C.hash: cualquier cuadro sale igual en cualquier orden. */
(() => {
  const C = window.C, TAU = Math.PI * 2, hs = C.hash;
  if (!C.forma) throw new Error('fondos.js necesita el módulo utileria cargado antes');
  const { rr, poli, elip } = C.caminos, forma = C.forma, masa = C.masa, tono = C.tono, frio = C.frio;
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mez = (a, b, k) => { const A = rgb(a), B = rgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  C.mezclaColor = mez;
  const HORAS = {
    dia: { cielo: ['#63aee6', '#d7edf8'], sol: '#fff6d8', solY: 0.2, amb: null, nube: '#ffffff', lejos: '#a9c4d8', luzVentana: 'rgba(255,244,200,0.34)' },
    tarde: { cielo: ['#de6f4f', '#fbd49a'], sol: '#fff0c0', solY: 0.7, amb: ['#ffb070', 0.2], nube: '#ffd3ae', lejos: '#c79a8f', luzVentana: 'rgba(255,170,90,0.42)' },
    noche: { cielo: ['#0b1030', '#2a3868'], sol: '#f2f0dc', solY: 0.22, luna: true, amb: ['#4a5cb0', 0.5], nube: '#34406e', lejos: '#252e58', luzVentana: 'rgba(150,170,255,0.2)' },
    nublado: { cielo: ['#8591a3', '#c6cdd6'], sol: null, amb: ['#8e98ac', 0.2], nube: '#dde2e8', lejos: '#96a0ae', luzVentana: 'rgba(225,232,245,0.22)' }
  };
  C.HORAS = HORAS;
  const repetir = (px, f, paso, margen, fn) => { const o = px * f, W = C.W; for (let i = Math.floor((o - margen) / paso); i * paso - o < W + margen; i++) fn(i * paso - o, i); };

  const cielo = (g, hp, e, yh, o = {}) => {
    const W = C.W, t = e.t || 0, px = e.x || 0;
    const gr = g.createLinearGradient(0, 0, 0, yh); gr.addColorStop(0, hp.cielo[0]); gr.addColorStop(1, hp.cielo[1]); g.fillStyle = gr; g.fillRect(0, 0, W, C.H);
    if (hp.luna) { for (let i = 0; i < 70; i++) { const x = hs(i * 3.1) * W, y = hs(i * 7.7) * yh * 0.85, a = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + hs(i) * 1.2) + i)); g.fillStyle = `rgba(255,255,240,${a * 0.9})`; g.beginPath(); g.arc(x, y, 1.2 + hs(i * 1.9) * 1.8, 0, TAU); g.fill(); } }
    if (hp.sol && o.sol !== false) {
      const sx = W * (o.solX ?? 0.74) - px * 0.02, sy = yh * hp.solY, R = hp.luna ? 46 : 64;
      const gl = g.createRadialGradient(sx, sy, R * 0.6, sx, sy, R * 5); gl.addColorStop(0, hp.luna ? 'rgba(200,210,255,0.3)' : 'rgba(255,240,190,0.55)'); gl.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = gl; g.fillRect(sx - R * 5, sy - R * 5, R * 10, R * 10);
      g.beginPath(); g.arc(sx, sy, R, 0, TAU); g.fillStyle = hp.sol; g.fill();
      if (hp.luna) { g.fillStyle = 'rgba(160,165,190,0.5)'; for (const [dx, dy, r] of [[-14, -8, 9], [12, 10, 7], [6, -18, 5]]) { g.beginPath(); g.arc(sx + dx, sy + dy, r, 0, TAU); g.fill(); } }
    }
    if (o.nubes !== false) for (let i = 0; i < 5; i++) {
      const s = 0.7 + hs(i * 5.3) * 0.8, y = yh * (0.12 + hs(i * 2.7) * 0.5), x = ((hs(i * 9.1) * (W + 700) + t * (5 + i * 2) - px * 0.06) % (W + 700) + W + 700) % (W + 700) - 350;
      g.save(); g.globalAlpha = hp.luna ? 0.7 : 0.94; masa(g, [[x - 70 * s, y + 8 * s, 40 * s], [x, y - 14 * s, 58 * s], [x + 76 * s, y + 6 * s, 44 * s], [x + 20 * s, y + 20 * s, 46 * s], [x - 30 * s, y + 22 * s, 40 * s]], hp.nube, { lw: 0, sombra: 12 * s }); g.restore();
    }
  };
  const colinas = (g, y0, amp, long, color, px, f, semilla) => { const W = C.W; g.beginPath(); g.moveTo(0, C.H); for (let x = 0; x <= W; x += 24) { const u = (x + px * f) / long; g.lineTo(x, y0 - (Math.sin(u + semilla) * 0.6 + Math.sin(u * 2.3 + semilla * 2) * 0.4) * amp); } g.lineTo(W, C.H); g.closePath(); g.fillStyle = color; g.fill(); };
  const tenir = (g, hp, extra) => { if (hp.amb) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = hp.amb[1]; g.fillStyle = hp.amb[0]; g.fillRect(0, 0, C.W, C.H); g.restore(); } if (extra) extra(); C.vineta(g, hp.luna ? 0.5 : 0.26); };
  const foco = (g, x, y, r, col, k = 1) => { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, r * 0.04, x, y, r); gr.addColorStop(0, col.replace('A', String(0.5 * k))); gr.addColorStop(1, col.replace('A', '0')); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); };

  const LUGARES = {};

  LUGARES.campo = (o, hp) => {
    const piso = o.piso ?? 800, pasto = o.pasto || '#6aa857', camino = o.camino;
    return {
      piso,
      dibujar(g, e) {
        const px = e.x || 0, t = e.t || 0, W = C.W;
        cielo(g, hp, e, piso - 120, o);
        colinas(g, piso - 150, 70, 520, mez(pasto, hp.lejos, 0.78), px, 0.12, 1.3);
        colinas(g, piso - 90, 52, 380, mez(pasto, hp.lejos, 0.5), px, 0.25, 4.1);
        repetir(px, 0.25, 330, 120, (x, i) => { if (hs(i * 3.3) < 0.55) return; const y = piso - 92 - hs(i) * 30, s = 0.5 + hs(i * 1.7) * 0.3, c = mez('#3f8a4c', hp.lejos, 0.45); g.fillStyle = mez('#6b4a34', hp.lejos, 0.5); g.fillRect(x - 5 * s, y - 60 * s, 10 * s, 70 * s); masa(g, [[x - 34 * s, y - 80 * s, 36 * s], [x + 30 * s, y - 84 * s, 38 * s], [x, y - 118 * s, 44 * s]], c, { lw: 0, sombra: 10 }); });
        colinas(g, piso - 26, 22, 300, mez(pasto, hp.lejos, 0.22), px, 0.5, 7.7);
        const gr = g.createLinearGradient(0, piso - 20, 0, C.H); gr.addColorStop(0, pasto); gr.addColorStop(1, tono(pasto, -0.22)); g.fillStyle = gr; g.fillRect(0, piso - 8, W, C.H - piso + 8);
        if (camino) { g.beginPath(); g.moveTo(W * 0.5 - 60 - px * 0.5, piso - 6); g.lineTo(W * 0.5 + 60 - px * 0.5, piso - 6); g.lineTo(W * 0.5 + 520 - px, C.H); g.lineTo(W * 0.5 - 520 - px, C.H); g.closePath(); g.fillStyle = typeof camino === 'string' ? camino : '#c9a878'; g.fill(); }
        g.lineCap = 'round';
        repetir(px, 1, 58, 40, (x, i) => { const y = piso + 14 + hs(i * 2.9) * (C.H - piso - 30), k = 0.7 + (y - piso) / 260, sw = Math.sin(t * 1.4 + i) * 3 * k; g.strokeStyle = hs(i * 4.1) < 0.5 ? tono(pasto, -0.26) : tono(pasto, 0.16); g.lineWidth = 3 * k; g.beginPath(); for (const d of [-7, 0, 7]) { g.moveTo(x + d * k, y); g.quadraticCurveTo(x + d * k, y - 12 * k, x + d * 1.6 * k + sw, y - 20 * k); } g.stroke(); if (o.flores && hs(i * 6.3) < 0.3) { g.fillStyle = ['#f6e06a', '#f2f2f2', '#e88aa8'][i % 3 < 0 ? 0 : Math.abs(i) % 3]; g.beginPath(); g.arc(x + sw, y - 22 * k, 5 * k, 0, TAU); g.fill(); } });
      },
      frente() {},
      luz(g) { tenir(g, hp); }
    };
  };

  LUGARES.bosque = (o, hp) => {
    const piso = o.piso ?? 820, hoja = o.color || '#3f8a4c', suelo = o.suelo || '#5d7a45', abedul = o.clase === 'abedul', pino = o.clase === 'pino';
    const niebla = mez(hp.cielo[1], '#ffffff', 0.25);
    const fila = (g, px, f, paso, k, y, sem, e) => repetir(px, f, paso, 260, (x, i) => {
      const xx = x + hs(i * 2.1 + sem) * paso * 0.6, w = (18 + hs(i * 3.7 + sem) * 16) * (0.5 + f * 0.7), tr = mez(abedul ? '#ebe6dc' : '#5b3d29', niebla, k), fo = mez(hoja, niebla, k), yy = y + hs(i + sem) * 16;
      g.fillStyle = tr; g.fillRect(xx - w / 2, -20, w, yy + 20);
      if (abedul) { g.fillStyle = mez('#3b3640', niebla, k); for (let j = 0; j < 9; j++) g.fillRect(xx - w / 2 + hs(i + j) * w * 0.4, yy - 60 - j * 78 - hs(j + i) * 30, w * 0.55, 7 * (0.5 + f)); }
      else { g.fillStyle = mez('#3d2819', niebla, k); g.fillRect(xx + w * 0.18, -20, w * 0.32, yy + 20); }
      const sw = Math.sin((e.t || 0) * 0.8 + i) * 5 * f, R = (pino ? 60 : 96) * (0.5 + f * 0.8), cy = pino ? yy - 330 * (0.5 + f) : 40 + hs(i * 5.5 + sem) * 110;
      if (pino) { for (let j = 0; j < 4; j++) { const yb = cy + j * R * 0.9; g.beginPath(); g.moveTo(xx + sw, yb - R * 1.5); g.lineTo(xx + R * (1 + j * 0.28), yb); g.lineTo(xx - R * (1 + j * 0.28), yb); g.closePath(); g.fillStyle = j % 2 ? fo : mez(fo, '#ffffff', 0.07); g.fill(); } }
      else masa(g, [[xx - R + sw, cy + 10, R * 0.85], [xx + R + sw, cy, R * 0.9], [xx + sw, cy - R * 0.5, R], [xx - R * 0.4 + sw, cy + R * 0.55, R * 0.8], [xx + R * 0.5 + sw, cy + R * 0.5, R * 0.82]], fo, { lw: 0, sombra: 16 * f + 4 });
    });
    return {
      piso,
      dibujar(g, e) {
        const px = e.x || 0, W = C.W, t = e.t || 0;
        const gr = g.createLinearGradient(0, 0, 0, piso); gr.addColorStop(0, mez(hp.cielo[0], niebla, 0.5)); gr.addColorStop(1, niebla); g.fillStyle = gr; g.fillRect(0, 0, W, piso);
        fila(g, px, 0.15, 150, 0.8, piso - 40, 1, e);
        g.fillStyle = niebla; g.globalAlpha = 0.42; g.fillRect(0, 0, W, piso); g.globalAlpha = 1;
        fila(g, px, 0.32, 230, 0.52, piso - 22, 2, e);
        const nb = g.createLinearGradient(0, piso - 320, 0, piso); nb.addColorStop(0, 'rgba(255,255,255,0)'); nb.addColorStop(1, niebla); g.globalAlpha = 0.6; g.fillStyle = nb; g.fillRect(0, piso - 320, W, 320); g.globalAlpha = 1;
        fila(g, px, 0.6, 400, 0.2, piso - 6, 3, e);
        const gs = g.createLinearGradient(0, piso - 30, 0, C.H); gs.addColorStop(0, mez(suelo, niebla, 0.25)); gs.addColorStop(1, tono(suelo, -0.28)); g.fillStyle = gs; g.fillRect(0, piso - 30, W, C.H - piso + 30);
        g.lineCap = 'round';
        repetir(px, 1, 74, 60, (x, i) => { const y = piso + 6 + hs(i * 2.9) * (C.H - piso - 30), k = 0.8 + (y - piso) / 240, sw = Math.sin(t * 1.3 + i) * 3; if (hs(i * 7.1) < 0.35) { g.fillStyle = 'rgba(20,24,30,0.16)'; g.beginPath(); g.ellipse(x, y, 46 * k, 9 * k, 0, 0, TAU); g.fill(); return; } g.strokeStyle = hs(i * 4.1) < 0.5 ? tono(suelo, -0.3) : tono(hoja, 0.1); g.lineWidth = 3.4 * k; g.beginPath(); for (const d of [-10, -4, 3, 10]) { g.moveTo(x + d * k, y); g.quadraticCurveTo(x + d * 1.4 * k, y - 14 * k, x + d * 2.2 * k + sw, y - 22 * k); } g.stroke(); });
      },
      frente(g, e) {
        const px = e.x || 0, W = C.W, osc = mez(C.mezclaColor('#2e4a3a', hoja, 0.3), '#1a1420', hp.luna ? 0.7 : 0.3);
        if (o.frente === false) return;
        repetir(px, 1.35, 1700, 400, (x, i) => { const xx = x + 60 + hs(i * 9.9) * 200, w = 86; g.fillStyle = osc; g.beginPath(); g.moveTo(xx - w / 2, -40); g.lineTo(xx + w / 2, -40); g.lineTo(xx + w / 2 + 6, C.H - 60); g.quadraticCurveTo(xx + w / 2 + 14, C.H, xx + w / 2 + 60, C.H + 40); g.lineTo(xx - w / 2 - 60, C.H + 40); g.quadraticCurveTo(xx - w / 2 - 14, C.H, xx - w / 2 - 6, C.H - 60); g.closePath(); g.fill(); });
        masa(g, [[-40 - px * 0.2, -30, 190], [240 - px * 0.2, -90, 170], [W + 60 - px * 0.2, -40, 210], [W - 240 - px * 0.2, -100, 170]], osc, { lw: 0, sombra: 0 });
      },
      luz(g, e) {
        tenir(g, hp, () => { if (hp.luna || !hp.sol) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen'; for (let i = 0; i < 4; i++) { const x = C.W * (0.18 + i * 0.22) - (e.x || 0) * 0.3, a = 0.07 + 0.03 * Math.sin((e.t || 0) * 0.5 + i * 2); const gr = g.createLinearGradient(x, 0, x - 300, C.H); gr.addColorStop(0, `rgba(255,246,200,${a * 2})`); gr.addColorStop(1, 'rgba(255,246,200,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x, -10); g.lineTo(x + 130, -10); g.lineTo(x - 250, C.H); g.lineTo(x - 520, C.H); g.closePath(); g.fill(); } g.restore(); });
      }
    };
  };

  LUGARES.calle = (o, hp) => {
    const piso = o.piso ?? 800, PAL = o.colores || ['#d8c3a5', '#c7b3c9', '#b5c7bd', '#d9b08c', '#aebfd6'], noche = !!hp.luna;
    const postes = [];
    const edificio = (g, x, i) => {
      const w = 330 + hs(i * 1.3) * 150, h = 380 + hs(i * 2.9) * 240, col = PAL[((i % PAL.length) + PAL.length) % PAL.length], y = piso - 54;
      forma(g, rr(x, y - h, w, h + 6, 4), col, { sombra: 16, brillo: 0, lw: 5 });
      forma(g, rr(x - 10, y - h - 16, w + 20, 22, 4), tono(col, -0.16), { sombra: 4, brillo: 0, lw: 4 });
      const cols = Math.floor((w - 50) / 78), filas = Math.floor((h - 190) / 96);
      for (let r = 0; r < filas; r++) for (let c = 0; c < cols; c++) { const wx = x + 34 + c * ((w - 68 - 46) / Math.max(1, cols - 1)), wy = y - h + 40 + r * 96, luz = hs(i * 7.1 + r * 3.3 + c * 1.9) < (noche ? 0.55 : 0.1); forma(g, rr(wx, wy, 46, 60, 4), luz ? '#ffd98a' : (noche ? '#1f2a4a' : '#7fa4c4'), { sombra: 0, brillo: 0, lw: 3.5 }); if (!luz) { g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); g.moveTo(wx + 6, wy + 54); g.lineTo(wx + 26, wy + 6); g.lineTo(wx + 36, wy + 6); g.lineTo(wx + 16, wy + 54); g.fill(); } forma(g, rr(wx - 5, wy + 60, 56, 8, 3), tono(col, -0.2), { sombra: 0, brillo: 0, lw: 3 }); }
      const toldo = ['#c9573f', '#3f7fa8', '#4f8f6a', '#d9a23f'][Math.abs(i) % 4], dx = x + w * 0.16;
      forma(g, rr(dx, y - 132, 70, 132, 4), tono(col, -0.42), { sombra: 5, brillo: 0, lw: 4 }); g.fillStyle = '#e2c170'; g.beginPath(); g.arc(dx + 58, y - 62, 4.5, 0, TAU); g.fill();
      forma(g, rr(x + w * 0.46, y - 126, w * 0.42, 84, 4), noche ? '#ffe2a0' : '#9fc0d8', { sombra: 0, brillo: 0, lw: 4 });
      forma(g, poli([[x + w * 0.42, y - 150], [x + w * 0.92, y - 150], [x + w * 0.96, y - 112], [x + w * 0.38, y - 112]]), toldo, { sombra: 6, lw: 4, dentro: gg => { gg.fillStyle = 'rgba(255,255,255,0.3)'; for (let k = 0; k < 6; k += 2) gg.fillRect(x + w * 0.38 + k * w * 0.1, y - 152, w * 0.1, 44); } });
      return w;
    };
    return {
      piso,
      dibujar(g, e) {
        const px = e.x || 0, W = C.W; postes.length = 0;
        cielo(g, hp, e, piso - 40, o);
        repetir(px, 0.14, 150, 200, (x, i) => { const h = 200 + hs(i * 3.7) * 330, w = 110 + hs(i * 1.1) * 60; g.fillStyle = mez('#7d8aa0', hp.lejos, 0.72); g.fillRect(x, piso - 60 - h, w, h + 40); if (noche) { g.fillStyle = 'rgba(255,220,140,0.55)'; for (let k = 0; k < 7; k++) if (hs(i * 9 + k) < 0.5) g.fillRect(x + 14 + (k % 3) * 30, piso - 40 - h + 26 + Math.floor(k / 3) * 60 + hs(k + i) * 30, 12, 16); } });
        g.fillStyle = hp.cielo[1]; g.globalAlpha = 0.3; g.fillRect(0, 0, W, piso); g.globalAlpha = 1;
        repetir(px, 0.7, 520, 560, (x, i) => edificio(g, x, i));
        forma(g, rr(-20, piso - 56, W + 40, 62, 0), '#b9b4ad', { sombra: 0, brillo: 0, lw: 0 }); g.strokeStyle = 'rgba(40,36,48,0.22)'; g.lineWidth = 3; repetir(px, 0.86, 150, 20, x => { g.beginPath(); g.moveTo(x, piso - 54); g.lineTo(x - 16, piso + 4); g.stroke(); });
        g.fillStyle = '#8b8780'; g.fillRect(0, piso + 2, W, 16); g.fillStyle = C.LINEA; g.fillRect(0, piso + 2, W, 4);
        const ga = g.createLinearGradient(0, piso + 18, 0, C.H); ga.addColorStop(0, '#55535c'); ga.addColorStop(1, '#3f3d46'); g.fillStyle = ga; g.fillRect(0, piso + 18, W, C.H - piso);
        g.fillStyle = '#e6dfc6'; repetir(px, 1.15, 300, 200, x => { g.beginPath(); g.moveTo(x, piso + 150); g.lineTo(x + 150, piso + 150); g.lineTo(x + 158, piso + 166); g.lineTo(x - 8, piso + 166); g.fill(); });
        repetir(px, 0.92, 760, 200, (x, i) => { const xx = x + 240; forma(g, rr(xx - 7, piso - 420, 14, 430, 5), '#3d3b45', { sombra: 4, brillo: 3, lw: 4 }); forma(g, rr(xx - 7, piso - 426, 96, 12, 6), '#3d3b45', { sombra: 0, brillo: 0, lw: 4 }); forma(g, rr(xx + 64, piso - 416, 40, 20, 8), noche ? '#fff0b8' : '#e8e4d6', { sombra: 0, brillo: 0, lw: 4 }); postes.push(xx + 84); });
      },
      frente() {},
      luz(g) { tenir(g, hp, () => { if (noche) for (const x of postes) { foco(g, x, piso - 400, 520, 'rgba(255,214,140,A)', 1.1); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,214,140,0.16)'; g.beginPath(); g.ellipse(x, piso + 40, 300, 50, 0, 0, TAU); g.fill(); g.restore(); } }); }
    };
  };

  LUGARES.interior = (o, hp) => {
    const piso = o.piso ?? 800, pared = o.pared || '#d9c9b0', tipoPiso = o.suelo || 'madera', colPiso = o.colorPiso || (tipoPiso === 'madera' ? '#b08a5e' : '#cfc6b8'), tapiz = o.tapiz, vx = o.ventanaX;
    return {
      piso,
      dibujar(g, e) {
        const px = e.x || 0, W = C.W, f = 0.9;
        const gp = g.createLinearGradient(0, 0, 0, piso); gp.addColorStop(0, tono(pared, -0.2)); gp.addColorStop(0.35, pared); gp.addColorStop(1, tono(pared, 0.08)); g.fillStyle = gp; g.fillRect(0, 0, W, piso);
        if (tapiz === 'rayas') { g.fillStyle = 'rgba(255,255,255,0.1)'; repetir(px, f, 96, 60, x => g.fillRect(x, 0, 40, piso)); }
        if (tapiz === 'puntos') { g.fillStyle = 'rgba(255,255,255,0.16)'; repetir(px, f, 110, 60, (x, i) => { for (let y = 60 + (Math.abs(i) % 2) * 55; y < piso - 150; y += 110) { g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); } }); }
        if (tapiz === 'madera') { g.strokeStyle = 'rgba(40,24,12,0.2)'; g.lineWidth = 3; repetir(px, f, 130, 60, x => { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, piso); g.stroke(); }); }
        if (o.friso !== false) { g.fillStyle = tono(pared, -0.12); g.fillRect(0, piso - 190, W, 190); g.fillStyle = tono(pared, 0.2); g.fillRect(0, piso - 196, W, 10); g.strokeStyle = 'rgba(40,30,20,0.16)'; g.lineWidth = 3; repetir(px, f, 210, 60, x => g.strokeRect(x + 24, piso - 160, 162, 110)); }
        if (vx != null) { const wx = vx - px * f; g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = hp.luzVentana; g.beginPath(); g.moveTo(wx - 150, piso - 560); g.lineTo(wx + 150, piso - 560); g.lineTo(wx + 560, piso); g.lineTo(wx + 150, piso); g.closePath(); g.fill(); g.restore(); }
        g.fillStyle = tono(colPiso, -0.36); g.fillRect(0, piso - 22, W, 22); g.fillStyle = tono(pared, 0.26); g.fillRect(0, piso - 26, W, 6);
        const gs = g.createLinearGradient(0, piso, 0, C.H); gs.addColorStop(0, tono(colPiso, -0.12)); gs.addColorStop(1, tono(colPiso, 0.08)); g.fillStyle = gs; g.fillRect(0, piso, W, C.H - piso);
        const cx = W / 2 - px, vy = piso - 260;
        if (tipoPiso === 'madera') { g.strokeStyle = 'rgba(50,30,14,0.28)'; g.lineWidth = 3; for (let i = -18; i <= 18; i++) { g.beginPath(); g.moveTo(cx + i * 150 * ((piso - vy) / (C.H + 500 - vy)), piso); g.lineTo(cx + i * 150, C.H + 500); g.stroke(); } for (let j = 0; j < 30; j++) { const i = (j % 12) - 6 + 0.5, d = 40 + hs(j * 3.3) * (C.H - piso), y = piso + d, k = (y - vy) / (C.H + 500 - vy); g.beginPath(); g.moveTo(cx + (i - 0.5) * 150 * k, y); g.lineTo(cx + (i + 0.5) * 150 * k, y); g.stroke(); } }
        else if (tipoPiso === 'loseta') { g.strokeStyle = 'rgba(40,40,60,0.2)'; g.lineWidth = 3; for (let i = -18; i <= 18; i++) { g.beginPath(); g.moveTo(cx + i * 170 * ((piso - vy) / (C.H + 500 - vy)), piso); g.lineTo(cx + i * 170, C.H + 500); g.stroke(); } for (let j = 1; j < 7; j++) { const y = piso + Math.pow(j / 7, 1.7) * (C.H - piso + 40); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } }
        if (vx != null) { const wx = vx - px * f; g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = hp.luzVentana; g.beginPath(); g.moveTo(wx + 150, piso); g.lineTo(wx + 560, piso); g.lineTo(wx + 900, C.H); g.lineTo(wx + 330, C.H); g.closePath(); g.fill(); g.restore(); }
        if (o.alfombra) { g.save(); g.translate(W / 2 - px, piso + (C.H - piso) * 0.56); g.scale(1, 0.2); g.beginPath(); g.arc(0, 0, 660, 0, TAU); g.fillStyle = o.alfombra; g.fill(); g.lineWidth = 30; g.strokeStyle = tono(o.alfombra, 0.4); g.stroke(); g.beginPath(); g.arc(0, 0, 500, 0, TAU); g.lineWidth = 8; g.strokeStyle = tono(o.alfombra, -0.2); g.stroke(); g.restore(); }
      },
      frente() {},
      luz(g, e) { tenir(g, hp, () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const gr = g.createLinearGradient(0, 0, 0, 260); gr.addColorStop(0, 'rgba(20,14,34,0.3)'); gr.addColorStop(1, 'rgba(20,14,34,0)'); g.fillStyle = gr; g.fillRect(0, 0, C.W, 260); g.restore(); }); }
    };
  };

  LUGARES.mar = (o, hp) => {
    const piso = o.piso ?? 860, agua = o.agua || '#2f7fa6', arena = o.arena || '#e6cf9c', yh = o.horizonte ?? 520, playa = o.playa !== false;
    return {
      piso, horizonte: yh,
      dibujar(g, e) {
        const px = e.x || 0, t = e.t || 0, W = C.W;
        cielo(g, hp, e, yh, { ...o, solX: o.solX ?? 0.3 });
        if (o.isla !== false) colinas(g, yh + 4, 40, 420, mez('#5d8a6a', hp.lejos, 0.6), px, 0.08, 2.2);
        const ga = g.createLinearGradient(0, yh, 0, piso); ga.addColorStop(0, mez(agua, hp.cielo[1], 0.45)); ga.addColorStop(1, agua); g.fillStyle = ga; g.fillRect(0, yh, W, C.H - yh);
        if (hp.sol) { const sx = W * (o.solX ?? 0.3) - px * 0.02; g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < 16; i++) { const y = yh + 8 + i * i * 1.25, w = 30 + i * 13 + Math.sin(t * 2 + i) * 12; g.fillStyle = `rgba(255,240,190,${0.42 - i * 0.02})`; g.fillRect(sx - w / 2 + Math.sin(t * 1.3 + i * 1.7) * 8, y, w, 3 + i * 0.45); } g.restore(); }
        g.lineCap = 'round';
        for (let j = 0; j < 9; j++) { const y = yh + 22 + j * j * 4.6, k = 0.4 + j * 0.16; g.strokeStyle = `rgba(255,255,255,${0.16 + j * 0.03})`; g.lineWidth = 2 + j * 0.45; g.beginPath(); repetir(px, 0.2 + j * 0.09, 240 * k, 200, (x, i) => { const xx = x + hs(i * 3.1 + j) * 150 * k + Math.sin(t * 0.8 + j) * 22 * k; g.moveTo(xx, y); g.quadraticCurveTo(xx + 34 * k, y - 8 * k, xx + 70 * k, y); }); g.stroke(); }
        if (playa) {
          const yo = piso - 70, ola = x => yo + Math.sin(x * 0.006 + t * 1.1) * 12 + Math.sin(x * 0.015 - t * 0.7) * 5;
          g.beginPath(); g.moveTo(0, C.H); for (let x = 0; x <= W; x += 24) g.lineTo(x, ola(x + px) - 10); g.lineTo(W, C.H); g.closePath(); g.fillStyle = 'rgba(255,255,255,0.86)'; g.fill();
          g.beginPath(); g.moveTo(0, C.H); for (let x = 0; x <= W; x += 24) g.lineTo(x, ola(x + px) + 8 + Math.sin(t * 1.1) * 5); g.lineTo(W, C.H); g.closePath(); g.fillStyle = tono(arena, -0.16); g.fill();
          g.beginPath(); g.moveTo(0, C.H); for (let x = 0; x <= W; x += 24) g.lineTo(x, ola(x + px) + 36); g.lineTo(W, C.H); g.closePath(); const gs = g.createLinearGradient(0, yo, 0, C.H); gs.addColorStop(0, arena); gs.addColorStop(1, tono(arena, -0.14)); g.fillStyle = gs; g.fill();
          repetir(px, 1, 96, 40, (x, i) => { const y = piso - 10 + hs(i * 2.9) * (C.H - piso), k = hs(i * 5.3); g.fillStyle = k < 0.25 ? '#f6f1e4' : 'rgba(120,90,50,0.22)'; g.beginPath(); g.ellipse(x, y, k < 0.25 ? 7 : 14, k < 0.25 ? 5 : 3, 0, 0, TAU); g.fill(); });
        }
      },
      frente() {},
      luz(g) { tenir(g, hp); }
    };
  };

  LUGARES.nieve = (o, hp) => {
    const piso = o.piso ?? 800, nieve = o.color || '#eef3fa', sombra = '#b9c8e2';
    return {
      piso,
      dibujar(g, e) {
        const px = e.x || 0, W = C.W;
        cielo(g, hp, e, piso - 80, o);
        repetir(px, 0.1, 460, 400, (x, i) => { const h = 250 + hs(i * 3.3) * 200, w = 430, y = piso - 70, c = mez('#8ea2c4', hp.lejos, 0.5), pico = [x + w * (0.4 + hs(i) * 0.2), y - h]; forma(g, poli([[x - 60, y], pico, [x + w + 60, y]]), c, { sombra: 0, brillo: 0, lw: 0 }); g.fillStyle = mez(nieve, hp.lejos, 0.25); g.beginPath(); g.moveTo(pico[0], pico[1]); g.lineTo(pico[0] + w * 0.2, pico[1] + h * 0.36); g.lineTo(pico[0] + w * 0.06, pico[1] + h * 0.28); g.lineTo(pico[0] - w * 0.03, pico[1] + h * 0.42); g.lineTo(pico[0] - w * 0.1, pico[1] + h * 0.26); g.lineTo(pico[0] - w * 0.18, pico[1] + h * 0.36); g.closePath(); g.fill(); g.fillStyle = 'rgba(30,40,80,0.16)'; g.beginPath(); g.moveTo(pico[0], pico[1]); g.lineTo(x + w + 60, y); g.lineTo(pico[0] + 30, y); g.closePath(); g.fill(); });
        colinas(g, piso - 46, 30, 360, mez(nieve, hp.lejos, 0.4), px, 0.3, 3.3);
        const gs = g.createLinearGradient(0, piso - 30, 0, C.H); gs.addColorStop(0, nieve); gs.addColorStop(1, mez(nieve, sombra, 0.55)); g.fillStyle = gs; g.fillRect(0, piso - 20, W, C.H - piso + 20);
        colinas(g, piso + 4, 12, 240, nieve, px, 0.75, 9.1);
        repetir(px, 1, 210, 160, (x, i) => { const y = piso + 30 + hs(i * 2.9) * (C.H - piso - 60), w = 120 + hs(i * 4.4) * 150; g.fillStyle = 'rgba(150,172,214,0.3)'; g.beginPath(); g.ellipse(x, y + 8, w, 12, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(x - 10, y, w * 0.86, 10, 0, 0, TAU); g.fill(); });
        if (o.hielo) repetir(px, 0.8, 520, 200, (x, i) => { const xx = x + hs(i) * 200, s = 0.7 + hs(i * 3) * 0.6; forma(g, poli([[xx - 70 * s, piso + 6], [xx - 40 * s, piso - 80 * s], [xx + 10 * s, piso - 124 * s], [xx + 60 * s, piso - 60 * s], [xx + 84 * s, piso + 6]]), '#cfe3f4', { sombra: 12, lw: 4, dentro: gg => { gg.strokeStyle = 'rgba(255,255,255,0.8)'; gg.lineWidth = 4; gg.beginPath(); gg.moveTo(xx - 20 * s, piso - 70 * s); gg.lineTo(xx + 6 * s, piso - 20 * s); gg.stroke(); } }); });
      },
      frente() {},
      luz(g, e) { tenir(g, hp, () => { if (!o.nevando) return; const t = e.t || 0, k = o.nevando === true ? 1 : o.nevando; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 130 * k; i++) { const v = 60 + hs(i * 1.7) * 110, x = ((hs(i * 3.3) * (C.W + 200) + Math.sin(t * 0.8 + i) * 40 - t * 30 * hs(i * 2.2)) % (C.W + 200) + C.W + 200) % (C.W + 200) - 100, y = (hs(i * 7.7) * C.H + t * v) % C.H; g.globalAlpha = 0.5 + hs(i) * 0.5; g.beginPath(); g.arc(x, y, 2 + hs(i * 5.1) * 3.5, 0, TAU); g.fill(); } g.restore(); }); }
    };
  };


  /* Acantilado (Mary Anning, 18 nov 2026): pared de capas grises (Blue Lias: caliza y lutita alternadas), borde con
     pasto, playa de piedras y el mar a un lado. Opciones: mar 'izq'|'der', derrumbe (montón de roca al pie),
     y al dibujar e.marea (0 a 1) acerca el agua. */
  LUGARES.acantilado = (o, hp) => {
    const piso = o.piso ?? 820, lado = o.mar === 'izq' ? -1 : 1, roca = o.roca || '#7e8794', clara = o.clara || '#b9b29f';
    const agua = '#3d6f8a', arena = o.arena || '#8f8a84';
    return {
      piso,
      dibujar(g, e) {
        const px = e.x || 0, t = e.t || 0, W = C.W, H = C.H, marea = e.marea ?? 0.3;
        const top = piso - (o.alto ?? Math.min(620, piso * 0.72));
        cielo(g, hp, e, top + 80, o);
        const mx = lado > 0 ? W * 0.62 : W * 0.38;
        const bordeX = y => mx + lado * ((y - top) * 0.18 + Math.sin(y * 0.03) * 10);
        const ga = g.createLinearGradient(0, top + 60, 0, piso); ga.addColorStop(0, mez(agua, hp.cielo[1], 0.5)); ga.addColorStop(1, agua); g.fillStyle = ga; g.fillRect(0, top + 60, W, H);
        g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 3; g.lineCap = 'round';
        for (let j = 0; j < 8; j++) { const y = top + 80 + j * j * 7; g.beginPath(); repetir(px, 0.15 + j * 0.05, 200, 200, (x, i) => { const xx = x + C.hash(i * 3.1 + j) * 120 + Math.sin(t * 0.8 + j) * 14; g.moveTo(xx, y); g.quadraticCurveTo(xx + 28, y - 6, xx + 56, y); }); g.stroke(); }
        g.save(); g.translate(-px * 0.55, 0);
        const pared = () => { g.beginPath(); g.moveTo(lado > 0 ? -400 : W + 400, top - 10);
          for (let x = 0; x <= 1; x += 0.02) { const xx = lado > 0 ? -400 + x * (mx + 400) : W + 400 - x * (W + 400 - mx); g.lineTo(xx, top + Math.sin(xx * 0.01) * 14 + C.hash(Math.floor(xx / 40)) * 8); }
          for (let y = top; y <= piso + 10; y += 10) g.lineTo(bordeX(y), y);
          g.lineTo(lado > 0 ? -400 : W + 400, piso + 10); g.closePath(); };
        pared(); g.save(); g.clip();
        for (let y = top - 20, i = 0; y < piso + 20; i++) { const h = (i % 2 ? 22 : 34) + C.hash(i * 1.7) * 18; g.fillStyle = i % 2 ? mez(roca, '#5d6470', 0.3) : (i % 4 === 0 ? clara : mez(clara, roca, 0.45)); g.beginPath(); g.moveTo(-500, y + 30); for (let x = -500; x < W + 500; x += 60) g.lineTo(x, y + Math.sin(x * 0.004 + i) * 6 + (x - W / 2) * 0.03); for (let x = W + 500; x > -500; x -= 60) g.lineTo(x, y + h + Math.sin(x * 0.004 + i + 1) * 6 + (x - W / 2) * 0.03); g.closePath(); g.fill(); y += h; }
        g.strokeStyle = 'rgba(30,32,44,0.22)'; g.lineWidth = 3; for (let i = 0; i < 26; i++) { const x = C.hash(i * 5.3) * W * 1.4 - W * 0.2, y = top + 40 + C.hash(i * 2.2) * (piso - top - 60); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8, y + 40 + C.hash(i) * 50); g.stroke(); }
        const sm = g.createLinearGradient(0, top, 0, piso); sm.addColorStop(0, 'rgba(255,255,255,0.08)'); sm.addColorStop(1, 'rgba(20,24,40,0.28)'); g.fillStyle = sm; g.fillRect(-500, top - 40, W + 1000, piso - top + 60);
        g.restore();
        pared(); g.lineWidth = 5; g.strokeStyle = C.LINEA; g.stroke();
        g.fillStyle = mez('#5f8f4f', hp.lejos, 0.2); g.beginPath(); g.moveTo(lado > 0 ? -400 : W + 400, top - 40);
        for (let x = 0; x <= 1; x += 0.02) { const xx = lado > 0 ? -400 + x * (mx + 400) : W + 400 - x * (W + 400 - mx); g.lineTo(xx, top + Math.sin(xx * 0.01) * 14 + 18 + C.hash(Math.floor(xx / 30) + 7) * 10); }
        g.lineTo(bordeX(top) + lado * 6, top - 6); g.lineTo(lado > 0 ? -400 : W + 400, top - 120); g.closePath(); g.fill();
        g.restore();
        const ys = piso - 26, gs = g.createLinearGradient(0, ys, 0, H); gs.addColorStop(0, arena); gs.addColorStop(1, tono(arena, -0.25)); g.fillStyle = gs;
        g.beginPath(); g.moveTo(0, ys); for (let x = 0; x <= W; x += 30) g.lineTo(x, ys + Math.sin((x + px) * 0.01) * 4); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
        const orilla = lado > 0 ? W * (0.95 - marea * 0.35) - px * 0.9 : W * (0.05 + marea * 0.35) - px * 0.9;
        g.save(); g.beginPath(); g.moveTo(orilla, ys - 4);
        for (let y = ys; y <= H + 20; y += 20) g.lineTo(orilla + lado * (y - ys) * 0.55 + Math.sin(y * 0.03 + t * 1.3) * 18, y);
        g.lineTo(lado > 0 ? W + 50 : -50, H + 20); g.lineTo(lado > 0 ? W + 50 : -50, ys - 4); g.closePath(); g.fillStyle = mez(agua, '#9cc4d4', 0.25); g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 7; g.beginPath(); for (let y = ys; y <= H + 20; y += 20) { const xx = orilla + lado * (y - ys) * 0.55 + Math.sin(y * 0.03 + t * 1.3) * 18; y === ys ? g.moveTo(xx, y) : g.lineTo(xx, y); } g.stroke(); g.restore();
        repetir(px, 1, 52, 40, (x, i) => { const y = piso - 10 + C.hash(i * 2.9) * (H - piso + 10), k = 0.6 + (y - piso) / 400, c = ['#a7a29a', '#76716c', '#c4bdb0', '#5e5b58'][Math.abs(i) % 4]; forma(g, elip(x + C.hash(i) * 30, y, 16 * k + C.hash(i * 3) * 10 * k, 9 * k + C.hash(i * 5) * 5 * k), c, { sombra: 3, brillo: 2, lw: 2.5 }); });
        if (o.derrumbe) { const dx = (lado > 0 ? W * 0.3 : W * 0.7) - px * 0.8; for (let i = 0; i < 9; i++) forma(g, elip(dx + (C.hash(i * 4.4) - 0.5) * 380, piso - 20 - C.hash(i) * 70 + i * 4, 60 + C.hash(i * 2) * 50, 40 + C.hash(i * 7) * 30), i % 2 ? mez(roca, '#5d6470', 0.3) : mez(clara, roca, 0.45), { sombra: 10, lw: 4 }); }
      },
      frente(g, e) {},
      luz(g, e) { tenir(g, hp); }
    };
  };

  C.LUGARES = LUGARES;
  C.lugar = (tipo, receta = {}) => {
    const f = LUGARES[tipo];
    if (!f) throw new Error(`lugar desconocido: "${tipo}". Hay: ${Object.keys(LUGARES).join(', ')}. Si falta, se agrega a mod/fondos.js (ver UTILERIA.md, sección Lugares).`);
    const hp = HORAS[receta.hora || 'dia'];
    if (!hp) throw new Error(`hora desconocida: "${receta.hora}". Hay: ${Object.keys(HORAS).join(', ')}`);
    const L = f(Object.freeze({ ...receta }), hp);
    L.tipo = tipo; L.hora = receta.hora || 'dia'; L.receta = Object.freeze({ ...receta });
    const envolver = n => { const fn = L[n].bind(L); L[n] = (g, e = {}) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); fn(g, e); if (n === 'luz') for (const f of e.focos || []) foco(g, f.x, f.y, f.r || 420, f.color || 'rgba(255,170,90,A)', (f.fuerza ?? 1) * (0.9 + 0.1 * Math.sin((e.t || 0) * 11 + f.x))); g.restore(); }; };
    ['dibujar', 'frente', 'luz'].forEach(envolver);
    return L;
  };
  C.probarLugares = g => { const fallas = []; for (const tp of Object.keys(LUGARES)) for (const h of Object.keys(HORAS)) { try { const L = C.lugar(tp, { hora: h }); const a = JSON.stringify([g.getTransform().toJSON(), g.globalAlpha, g.globalCompositeOperation]); L.dibujar(g, { t: 1.1, x: 333 }); L.frente(g, { t: 1.1, x: 333 }); L.luz(g, { t: 1.1, x: 333 }); if (a !== JSON.stringify([g.getTransform().toJSON(), g.globalAlpha, g.globalCompositeOperation])) fallas.push(`${tp}/${h}: deja el lienzo cambiado`); if (typeof L.piso !== 'number') fallas.push(`${tp}: falta "piso"`); } catch (err) { fallas.push(`${tp}/${h}: ${err.message}`); } } if (fallas.length) throw new Error('lugares con fallas:\n' + fallas.join('\n')); return Object.keys(LUGARES).length; };
})();
