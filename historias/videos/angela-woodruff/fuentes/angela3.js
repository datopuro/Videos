/* Parte 3 · La tumba y la máquina de escribir (S14–S18). */
const consultorio = (t, u, fn) => escena(LUG.consultorio, { t, px: u * 5, z: 1 + u * 0.01 }, () => {
  obj('ventana_of', { x: sx(-440), y: PISO - 340, t, k: 0.8 });
  obj('archivero', { x: sx(440), y: PISO + 20, t, k: 0.85, abierto: 1 });
  if (fn) fn();
});
const carpaNoche = (t, u, o = {}) => {
  escena(LUG.cementerio_n, { t, px: u * 6, z: o.z ?? 1, focos: [{ x: sx(0), y: PISO - 150, r: 700, fuerza: 1 }] }, () => {
    obj('arbol', { x: sx(-440), y: PISO - 60, t, k: 0.75 });
    if (o.coche) obj('coche', { x: sx(V ? 260 : 520) + Math.max(0, u - 1.5) * 200 * K, y: PISO + 60, t, k: V ? 0.6 : 0.75, giro: 1 });
    obj('carpa', { x: sx(-40), y: PISO + 40, t, k: V ? 0.9 : 0.85, luz: 1 });
    if (o.policias) silueta(() => [-380, -300, 280].forEach((dx, i) => per(i % 2 ? 'vecino' : 'detective', { t: t + i, x: sx(dx), y: PISO + 90, k: 0.95, giro: dx < 0 ? 0.5 : -0.5, manoD: [90, -170] })), 0.9);
  });
  if (o.policias) [-380, -300, 280].forEach((dx, i) => { const x = sx(dx) + 90 * ESC * KP({ k: 0.95 }) * 0.9 + (dx > 0 ? -180 * K : 0), y = PISO + 90 - 170 * ESC * KP({ k: 0.95 }); g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 4, x, y, 160); gr.addColorStop(0, 'rgba(255,240,190,0.75)'); gr.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = gr; g.fillRect(x - 160, y - 160, 320, 320); g.restore(); });
};
(() => {
  const tAbren = T('Abren la tumba de Kathleen'), tNing = T('Ningún oficial del equipo'), tMient = T('Mientras esperan los resultados');
  toma(tAbren, (t, u) => { carpaNoche(t, u, { coche: true }); etiqueta('EXHUMACIÓN', ent(t, tAbren + 0.5)); });
  toma(tNing, (t, u) => { carpaNoche(t, u, { policias: true, z: 1.05 }); });
  toma(tMient, (t, u) => {
    consultorio(t, u, () => {
      obj('escritorio_c', { x: sx(-60), y: PISO + 60, t, k: 1.0 });
      obj('maquina', { x: sx(-60), y: PISO + 60 - 178 * ESC * 1.0 + 4, t, k: 0.55 });
      const d = { t, x: sx(V ? 280 : 300), y: PISO + 60, k: 1.1, giro: 0.6, cara: 'neutral', mira: [0.9, 0.2], manoD: [110, -190] };
      per('detective', d); enMano(d, 'manoD', 'carpeta_p', { k: 0.4, dy: 30 });
    });
    etiqueta('CONSULTORIO DE SHIPMAN', ent(t, T('registran el consultorio') + 0.3), { tam: V ? 46 : 54 });
  });

  const tMaq = T('En su consultorio, una máquina de escribir.'), tPer = T('Los peritos la comparan'), tNoto = T('Lo que Angela notó'), tHue = T('Y en el papel hay huellas'), tNin = T('Las de Kathleen, ninguna.');
  toma(tMaq, (t, u) => {
    consultorio(t, u, () => {
      obj('escritorio_c', { x: sx(0), y: PISO + 80, t, k: 1.3 });
      obj('maquina', { x: sx(0), y: PISO + 80 - 178 * ESC * 1.3 + 4, t, k: 0.9 });
    });
    aro(sx(0), PISO + 80 - 178 * ESC * 1.3 - 70 * ESC * 0.9, 150 * ESC * 0.9, ent(t, tMaq + 0.8, 0.4));
  });
  toma(tPer, (t, u) => {
    const k = V ? 1.5 : 2.2, xs = V ? [CX - 250, CX + 250] : [CX - 330, CX + 330], y = V ? 1050 : 940;
    inserto(t, [{ id: 'maquina', x: CX, y: V ? 600 : 360, k: V ? 0.75 : 0.7, hoja: 0.8 }], LUG.lab, 0.4);
    H.obj('testamento').dibujar(g, { x: xs[0], y, t, escala: ESC * k, rot: -2 });
    H.obj('testamento').dibujar(g, { x: xs[1], y, t, escala: ESC * k, rot: 2 });
    texto('TESTAMENTO', xs[0], y - 200 * ESC * k - 34, 1, { tam: V ? 32 : 40, color: '#ffe7a8' }); texto('PRUEBA', xs[1], y - 200 * ESC * k - 34, 1, { tam: V ? 32 : 40, color: '#ffe7a8' });
    sello('COINCIDE', CX, V ? 1300 : 160, ent(t, T('es la misma.'), 0.25), { color: '#2f8a4f', tam: V ? 80 : 90 });
  });
  toma(tNoto, (t, u) => { escritorioAngela(t, u, { cara: 'neutral', hojas: ['original', 'testamento'] }); });
  toma(tHue, (t, u) => {
    inserto(t, [{ id: 'testamento', huellas: suave((t - tHue - 0.3) / 0.6), k: V ? 2.2 : 2.5, x: V ? CX : CX - 320 }], LUG.lab, 0.55);
    const x0 = V ? CX : CX + 420, y0 = V ? 1460 : 520;
    texto('HUELLAS DE SHIPMAN  ✓', x0, y0, ent(t, tHue + 0.6), { tam: V ? 44 : 50, color: '#ffe7a8' });
    texto('HUELLAS DE KATHLEEN  —', x0, y0 + (V ? 80 : 90), ent(t, tNin), { tam: V ? 44 : 50, color: '#ffb4a2' });
  });

  const tMan = T('Esa mañana, Shipman había ido'), tRes = T('Llegan los resultados del laboratorio'), tMorf = T('sobredosis de morfina'), tDec = T('El certificado decía vejez.');
  toma(tMan, (t, u) => {
    escena(LUG.calle, { t, px: 0, z: 1 }, () => {
      obj('puerta', { x: sx(260), y: PISO - 30, t, k: 1.0, abierta: 0 });
      const d = { t, x: sx(-60), y: PISO + 40, k: 1.1, giro: 0.95, manoD: [40, -100] }; per('doctor', d); silueta(() => enMano(d, 'manoD', 'maletin', { k: 0.5, dy: 56 }), 1);
    });
    oscuro(0.35);
    const pts = ['MAÑANA: VISITA', 'HORAS DESPUÉS', 'LA ENCUENTRAN'];
    pts.forEach((p, i) => texto(p, V ? CX : 360 + i * 600, V ? 420 + i * 110 : 150, ent(t, tMan + 0.6 + i * 0.9), { tam: V ? 50 : 52, color: i === 2 ? '#ffb4a2' : '#ffe7a8' }));
  });
  toma(tRes, (t, u) => {
    escena(LUG.lab, { t, px: u * 5, z: 1.02 + u * 0.01, focos: [{ x: sx(0), y: PISO - 300, r: 800, fuerza: 0.8 }] }, () => {
      obj('mesa', { x: sx(-120), y: PISO + 80, t, k: 1.0 });
      obj('tubo', { x: sx(-180), y: PISO + 80 - 150 * ESC, t, k: 0.7 });
      obj('lupa', { x: sx(-20), y: PISO + 80 - 150 * ESC + 4, t, k: 0.6 });
      per('perito', { t, x: sx(V ? 300 : 330), y: PISO + 60, k: 1.1, giro: -0.4, cara: 'neutral', mira: [-0.6, 0.5] });
    });
    titular('MORFINA', ent(t, tMorf), { color: '#ffb4a2', tam: V ? 110 : 130 });
  });
  toma(tDec, (t, u) => { inserto(t, [{ id: 'certificado', tachado: suave((t - tDec - 0.4) / 0.6) }], LUG.lab, 0.45); });

  const tResp = T('Shipman responde'), tNotas = T('Pero las notas que lo prueban'), tCompu = T('La computadora guardó');
  toma(tResp, (t, u) => {
    consultorio(t, u, () => {
      obj('escritorio_c', { x: sx(60), y: PISO + 60, t, k: 1.0 });
      obj('monitor', { x: sx(60), y: PISO + 60 - 178 * ESC + 4, t, k: 0.6 });
      per('doctor', { t, x: sx(V ? -280 : -330), y: PISO + 120, k: 1.15, giro: 0.95 });
    });
    sello('«ERA ADICTA»', CX, V ? 520 : 170, ent(t, T('era adicta en secreto.'), 0.25), { tam: V ? 64 : 74, color: '#5a5a62', rot: -3 });
  });
  toma(tNotas, (t, u) => {
    escena(LUG.consultorio, { t, px: 0, z: 1 }, () => {});
    oscuro(0.55);
    H.obj('monitor').dibujar(g, { x: CX, y: V ? 1120 : 1000, t, escala: V ? 2.5 : 3.0, resalta: ent(t, tCompu, 0.4) });
    texto('MURIÓ EL 24/06/98', CX, V ? 360 : 90, ent(t, tNotas + 0.6), { tam: V ? 50 : 54, color: '#ffe7a8' });
    sello('DESPUÉS DE SU MUERTE', V ? CX : CX + 560, V ? 1330 : 560, ent(t, tCompu + 0.6, 0.25), { tam: V ? 56 : 52 });
  });

  const tSep = T('El siete de septiembre, lo arrestan.');
  toma(tSep, (t, u) => {
    escena(LUG.calle_alba, { t, px: u * 6, z: 1 }, () => {
      obj('puerta_c', { x: sx(-260), y: PISO - 30, t, k: 1.0, abierta: 0 });
      silueta(() => [180, 320].forEach((dx, i) => per(i ? 'vecino' : 'detective', { t: t + i, x: sx(dx), y: PISO + 60, k: 1.05, giro: -0.6 })), 0.88);
      per('doctor', { t, x: sx(-60), y: PISO + 50, k: 1.05, giro: 0.95 });
    });
    etiqueta('7 SEP 1998 · ARRESTO', ent(t, tSep + 0.1));
  });
})();
