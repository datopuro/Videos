/* Voz del canal de historias: tiempos sacados del audio, boca que sigue el volumen real y subtítulos en dos renglones.
   Se carga después de la base de caricatura. Necesita que la carpeta del video haya pasado por alinear.py y prep.py.
   Uso:
     const T = { caida: C.cuando('cayó tres kilómetros'), fin: C.cuando('sobrevivió', { fin: true }) };
     H.per('ana').dibujar(g, { t, x, y, habla: C.hablaEn(t, 'no voy a lograrlo') });
     C.subtitulos(g, t);                      (va al final del cuadro, después de L.luz)
   Referencias:
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/measureText : medir cada renglón para partir
     el subtítulo por ancho real y no por número de letras.
   https://developer.mozilla.org/docs/Web/API/FontFace : la fuente va dentro del kit y se carga igual en cualquier máquina.
   https://www.w3.org/TR/WCAG21/#three-flashes-or-below-threshold : límite de destellos; de ahí que C.destello suba y
     baje en rampa y no pase de 0.6 de opacidad.
   https://github.com/itfoundry/Poppins : la fuente (licencia SIL OFL 1.1, en kit/fuentes/OFL.txt). */
(() => {
  const C = window.C, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const norma = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  let PAL = null, SUBS = null;
  const cargar = () => {
    if (PAL) return;
    PAL = []; SUBS = [];
    for (const k of Object.keys(C.D.bloques || {}).sort()) for (const s of C.D.bloques[k].subs || []) { SUBS.push(s); for (const w of s.palabras || []) { const n = norma(w.w); if (n) PAL.push({ w: n, ini: w.ini, fin: w.fin }); } }
    SUBS.sort((a, b) => a.ini - b.ini);
  };
  C.FUENTE = 'Historias, "Arial Black", Arial, sans-serif';

  C.tramo = (frase, o = {}) => {
    cargar();
    const q = norma(frase).split(' '), vez = o.vez || 1;
    let c = 0;
    for (let i = 0; i + q.length <= PAL.length; i++) if (q.every((x, j) => PAL[i + j].w === x) && ++c === vez) return { ini: PAL[i].ini, fin: PAL[i + q.length - 1].fin };
    throw new Error(`C.cuando: la voz no dice "${frase}"${vez > 1 ? ' ' + vez + ' veces' : ''}. Copia el texto tal cual está en bloques.json.`);
  };
  C.cuando = (frase, o = {}) => { const r = C.tramo(frase, o); return (o.fin ? r.fin : r.ini) + (o.mas || 0); };

  C.bocaVoz = (t, ini, fin) => {
    const f = 1 / C.FPS, v = Math.max(C.rms(t), 0.6 * C.rms(t - f), 0.45 * C.rms(t + f));
    const dentro = ini == null ? 1 : cl((t - ini + 0.06) / 0.08) * cl((fin + 0.1 - t) / 0.1);
    return dentro * Math.pow(cl((v - 0.1) / 0.6), 0.7);
  };
  C.hablaEn = (t, frase, o = {}) => { const r = C.tramo(frase, o); return C.bocaVoz(t, r.ini, r.fin); };

  C.renglones = (g, pals, anchoMax, max = 2) => {
    const ancho = a => g.measureText(a.join(' ')).width;
    if (ancho(pals) <= anchoMax) return [pals];
    if (max < 2) return null;
    let mejor = null, costo = 1e9;
    for (let i = 1; i < pals.length; i++) { const a = ancho(pals.slice(0, i)), b = ancho(pals.slice(i)); if (a > anchoMax || b > anchoMax) continue; const c = Math.abs(a - b) + (a > b ? 0 : anchoMax * 0.04); if (c < costo) { costo = c; mejor = i; } }
    return mejor == null ? null : [pals.slice(0, mejor), pals.slice(mejor)];
  };

  const avisados = new Set();
  C.subtitulos = (g, t, o = {}) => {
    cargar();
    let k = -1;
    for (let i = 0; i < SUBS.length; i++) if (SUBS[i].ini - 0.05 <= t) k = i; else break;
    if (k < 0) return null;
    const s = SUBS[k], sig = SUBS[k + 1], hasta = Math.min(s.fin + (o.cola ?? 0.25), sig ? sig.ini - 0.05 : 1e9);
    if (t > hasta) return null;
    const W = C.W, H = C.H, vertical = H > W, a = cl((t - s.ini + 0.05) / 0.1) * cl((hasta - t) / 0.08 + 0.4);
    const anchoMax = W * (o.ancho ?? (vertical ? 0.86 : 0.7));
    let tam = o.tam || Math.round(vertical ? W * 0.06 : H * 0.052), pals = s.palabras && s.palabras.length ? s.palabras : s.texto.split(' ').map(w => ({ w, ini: s.ini, fin: s.fin })), rs = null;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.textBaseline = 'middle'; g.textAlign = 'left';
    for (let n = 0; n < 6 && !rs; n++) { g.font = `600 ${tam}px ${C.FUENTE}`; rs = C.renglones(g, pals.map(p => p.w), anchoMax, 2); if (!rs) tam = Math.round(tam * 0.92); }
    if (!rs) { g.restore(); throw new Error(`subtítulo demasiado largo para dos renglones: "${s.texto}". Baja "sub_car" en bloques.json y corre prep.py otra vez.`); }
    if (tam < (o.tam || Math.round(vertical ? W * 0.06 : H * 0.052)) && !avisados.has(s.texto)) { avisados.add(s.texto); console.warn(`subtítulo encogido a ${tam}px: "${s.texto}"`); }
    const alto = tam * 1.28, hTot = alto * rs.length, yBase = (o.y ?? (vertical ? H * 0.74 : H * 0.905)) - hTot / 2 + (1 - cl((t - s.ini + 0.05) / 0.12)) * 8;
    const anchos = rs.map(r => g.measureText(r.join(' ')).width), wCaja = Math.max(...anchos) + tam * 1.1;
    g.globalAlpha = a * (o.fondo ?? 0.66); g.fillStyle = '#0c0d12'; g.beginPath(); g.roundRect(W / 2 - wCaja / 2, yBase - tam * 0.22, wCaja, hTot + tam * 0.44, tam * 0.34); g.fill();
    g.globalAlpha = a;
    const esp = g.measureText(' ').width;
    let n = 0;
    rs.forEach((r, i) => {
      let x = W / 2 - anchos[i] / 2;
      const y = yBase + alto * (i + 0.5);
      for (const w of r) { const p = pals[n++]; g.fillStyle = o.resalta && t >= p.ini - 0.03 && t < p.fin + 0.03 ? o.resalta : '#ffffff'; g.fillText(w, x, y); x += g.measureText(w).width + esp; }
    });
    g.restore();
    return { renglones: rs.length, tam, caja: [W / 2 - wCaja / 2, yBase - tam * 0.22, wCaja, hTot + tam * 0.44] };
  };

  C.destello = (g, t, t0, o = {}) => {
    const sube = o.sube ?? 0.09, baja = o.baja ?? 0.45, d = t - t0;
    if (d < 0 || d > sube + baja) return;
    const k = Math.min(o.fuerza ?? 0.5, 0.6) * (d < sube ? d / sube : 1 - (d - sube) / baja);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = k; g.fillStyle = o.color || '#ffffff'; g.fillRect(0, 0, C.W, C.H); g.restore();
  };

  C.probarVoz = () => { cargar(); const fallas = []; for (let i = 1; i < PAL.length; i++) if (PAL[i].ini < PAL[i - 1].ini - 0.001) fallas.push(`palabra "${PAL[i].w}" empieza antes que la anterior`); if (!PAL.length) fallas.push('timeline.json no trae palabras: falta correr alinear.py y prep.py'); if (fallas.length) throw new Error('voz con fallas:\n' + fallas.join('\n')); return PAL.length; };
})();
