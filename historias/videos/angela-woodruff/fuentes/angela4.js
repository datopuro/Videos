/* Parte 4 · Lo que había pasado antes (S19–S25) y cierre del completo. */
const sala = (t, u, o = {}) => escena(LUG.juicio, { t, px: u * 5, z: o.z ?? 1, fx: o.fx ?? sx(0), focos: [{ x: sx(0), y: PISO - 400, r: 900, fuerza: 0.6 }] }, () => {
  obj('juez', { x: sx(0), y: PISO - 180, t, k: V ? 0.7 : 0.8, dentro: [(gg, a) => C.iluminar(gg, g2 => H.per('vecino').dibujar(g2, { ...a, t, cara: 'neutral' }), { tinte: 'rgba(22,22,34,0.9)' })] });
  silueta(() => { [-470, -390, -310].forEach((dx, i) => per(i % 2 ? 'vecina' : 'vecino', { t: t + i, x: sx(dx), y: PISO - 20, k: 0.85, giro: 0.5, pose: o.depie ? {} : { sentado: true, pi: [10, 0], pd: [10, 0] } })); obj('banca', { x: sx(-390), y: PISO + 20, t, k: 0.8 }); }, 0.85);
  if (o.angela !== false) obj('estrado', { x: sx(V ? 300 : 380), y: PISO + 60, t, k: 0.75, dentro: [(gg, a) => H.per('angela').dibujar(gg, { ...a, t, cara: o.cara || 'apretada', giro: -0.5, mira: [-0.6, 0] })] });
  if (o.evid) { obj('mesa', { x: sx(-60), y: PISO + 200, t, k: 0.8 }); const top = PISO + 200 - 150 * ESC * 0.8; obj('maquina', { x: sx(-120), y: top + 4, t, k: 0.45 }); obj('testamento', { x: sx(60), y: top + 4, t, k: 0.55 }); }
  if (o.doctor) per('doctor', { t, x: sx(V ? -60 : -120), y: PISO + 300, k: 1.15, giro: 0.95 });
});
(() => {
  const tLuz = T('Y entonces sale a la luz'), tInv = T('La policía investigó en silencio'), tTres = T('Desde ese día, Shipman mató'), tUlt = T('La última fue Kathleen.');
  toma(tLuz, (t, u) => {
    escena(LUG.calle, { t, px: u * 8, z: 1 }, () => {
      obj('puerta', { x: sx(-300), y: PISO - 30, t, k: 0.95, abierta: 0 });
      obj('puerta_c', { x: sx(320), y: PISO - 30, t, k: 0.95, abierta: 0 });
      const d = { t, x: sx(-60), y: PISO + 50, k: 1.05, giro: 0.6, manoI: [-30, -300] }; per('doctora', d); silueta(() => enMano(d, 'manoI', 'auricular', { k: 0.8, dy: 40 }), 1);
    });
    etiqueta('MARZO 1998 · OTRA DOCTORA AVISA', ent(t, tLuz + 1.2), { tam: V ? 40 : 50 });
  });
  toma(tInv, (t, u) => {
    inserto(t, [{ id: 'carpeta_p', k: V ? 1.9 : 2.4, grosor: true }], LUG.comisaria, 0.45);
    sello('CERRADO · 17 ABR 1998', CX, V ? 760 : 430, ent(t, T('cerró el caso sin cargos.'), 0.25), { tam: V ? 56 : 66 });
  });
  toma(tTres, (t, u) => {
    escena(LUG.espera, { t, px: u * 4, z: 1 + u * 0.02 }, () => {
      [-300, 0, 300].forEach((dx, i) => { const a = ent(t, tTres + 1.0 + i * 0.7, 0.3); if (a > 0) { g.save(); g.globalAlpha = a; obj('silla_espera', { x: sx(dx), y: PISO + 60, t, k: 1.0 }); g.restore(); } });
    });
    titular('3 PERSONAS MÁS', ent(t, T('tres personas más.')), { tam: V ? 80 : 96 });
    if (t >= tUlt) texto('KATHLEEN', sx(300), PISO + 60 - 230 * ESC, ent(t, tUlt + 0.2), { tam: V ? 46 : 54, color: '#ffe7a8' });
  });

  const tEsta = T('Esta vez, la policía revisa'), tQuince = T('Elige quince casos');
  toma(tEsta, (t, u) => {
    escena(LUG.comisaria, { t, px: 0, z: 1 }, () => {});
    oscuro(0.3);
    H.obj('tablero').dibujar(g, { x: CX, y: V ? 1100 : 1000, t, escala: V ? 1.6 : 2.2, marcas: u * 4 });
    texto('15 CASOS', CX, V ? 380 : 90, ent(t, tQuince), { tam: V ? 70 : 80, color: '#ffe7a8' });
  });
  toma(T('y abre más tumbas.'), (t, u) => {
    escena(LUG.cementerio_n, { t, px: u * 8, z: 1 }, () => {
      [[-420, 0.4], [-150, 0.45], [130, 0.5], [400, 0.42]].forEach(([dx, k]) => obj('carpa', { x: sx(dx), y: PISO - 60, t, k: k * (V ? 0.8 : 1), luz: 0.7 }));
    });
    C.niebla(g, t, { k: 0.5, y: PISO - 150 });
  });

  const tJui = T('El juicio empieza en octubre.'), tPrim = T('La primera testigo es Angela.'), tCuenta = T('Cuenta cómo era su mamá'), tVio = T('Y cuenta lo que vio en ese papel.'), tDef = T('La defensa intenta separar'), tLog = T('No lo logra');
  toma(tJui, (t, u) => {
    sala(t, u, { doctor: true, cara: 'apretada' });
    etiqueta('OCT 1999 · PRESTON', ent(t, tJui + 0.2));
    titular('PRIMERA TESTIGO', ent(t, tPrim), { tam: V ? 72 : 90 });
  });
  toma(tCuenta, (t, u) => {
    sala(t, u, { z: 1.4, fx: sx(V ? 300 : 380), cara: C.mezclarCara2('tranquila', 'triste', ent(t, tCuenta + 2.5, 0.6)) });
  });
  toma(tVio, (t, u) => {
    sala(t, u, { evid: true, z: 1.05 });
    if (t >= tDef) etiqueta('LA DEFENSA QUIERE SEPARAR EL CASO', ent(t, tDef + 0.2), { tam: V ? 40 : 48 });
    sello('EL MOTIVO', CX, V ? 640 : 300, ent(t, T('el testamento falso era el motivo.'), 0.25), { tam: V ? 72 : 86 });
  });

  const tEne = T('El treinta y uno de enero'), tFals = T('y de falsificar el testamento');
  toma(tEne, (t, u) => {
    if (t < tFals) { sala(t, u, { depie: true, angela: false, doctor: true }); etiqueta('31 ENE 2000', ent(t, tEne + 0.2)); titular('CULPABLE · 15 ASESINATOS', ent(t, T('quince asesinatos')), { tam: V ? 54 : 78 }); }
    else { inserto(t, [{ id: 'testamento', k: V ? 2.6 : 2.7 }], LUG.juicio, 0.45); sello('FALSIFICADO', CX, V ? 760 : 520, ent(t, tFals + 0.4, 0.25), { tam: V ? 84 : 100 }); }
  });

  const tAnios = T('Años después, una investigación pública');
  toma(tAnios, (t, u) => {
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0c0d14'; g.fillRect(0, 0, W, HH); g.restore();
    const n = Math.floor(215 * suave(u / 4.5)), cols = V ? 15 : 27, paso = V ? 52 : 56, x0 = CX - (cols - 1) * paso / 2, y0 = V ? 420 : 170;
    for (let i = 0; i < 215; i++) { const c = i % cols, f = Math.floor(i / cols); g.fillStyle = i < n ? '#ffe7a8' : 'rgba(255,255,255,0.08)'; g.beginPath(); g.arc(x0 + c * paso, y0 + f * paso, V ? 13 : 12, 0, TAU); g.fill(); }
    texto('AL MENOS ' + n, CX, V ? 1290 : 760, ent(t, tAnios + 0.4), { tam: V ? 96 : 110, color: '#ffffff' });
    texto('INVESTIGACIÓN PÚBLICA', CX, V ? 1400 : 860, ent(t, tAnios + 0.8), { tam: V ? 44 : 46, color: '#ffe7a8' });
  });
  const tPeso = T('Quienes la conocen dicen');
  toma(tPeso, (t, u) => {
    escena(LUG.pasillo, { t, px: u * 4, z: 1.08 + u * 0.01 }, () => {
      obj('ventana_of', { x: sx(-400), y: PISO - 340, t, k: 0.8 });
      obj('banca', { x: sx(60), y: PISO + 60, t, k: 1.0, dentro: [(gg, a) => H.per('angela').dibujar(gg, { ...a, t, cara: 'triste', giro: -0.3, pose: { sentado: true, pi: [10, 0], pd: [10, 0], cab: 8 }, mira: [-0.3, 0.6], manoD: [40, -150], manoI: [-40, -150] })] });
    });
  });
  const tTodo = T('Todo empezó con un papel'), tHija = T('Y con una hija que conocía');
  toma(tTodo, (t, u) => {
    inserto(t, [{ id: 'maquina', x: V ? CX : CX - 330, y: V ? 900 : 900, k: V ? 0.95 : 1.1 }, { id: 'testamento', x: V ? CX : CX + 360, y: V ? 1450 : 920, k: V ? 1.1 : 2.0, rot: 4 }], LUG.oficina_w_tarde, 0.3);
  });
  toma(tHija, (t, u) => {
    oficinaW(t, u, () => {
      obj('escritorio', { x: sx(160), y: PISO + 60, t, k: 1.0 });
      const top = PISO + 60 - 178 * ESC;
      obj('original', { x: sx(110), y: top + 4, t, k: 0.4 }); obj('testamento', { x: sx(220), y: top + 4, t, k: 0.4, rot: 4 });
      per('angela', { t, x: sx(-220), y: PISO + 40, k: 1.1, giro: -0.7, cara: 'neutral', mira: [-0.9, -0.1] });
    }, LUG.oficina_w_tarde);
    const a = ent(t, T('la causa fuera vejez.', { fin: true }) + 0.3, 0.6);
    if (a > 0) { oscuro(0.45 * a); C.rotulo(g, 'Kathleen Grundy', a, { tam: V ? 92 : 100, y: V ? 460 : 200 }); C.rotulo(g, 'Hyde · 1998', a, { tam: V ? 50 : 54, y: V ? 560 : 300, color: '#ffe7a8' }); C.rotulo(g, 'Basada en el juicio de 2000 y en la investigación pública', a, { tam: V ? 30 : 34, y: V ? 640 : 370 }); }
  });
  if (q('Sígueme para no perderte') == null) toma(T('la causa fuera vejez.', { fin: true }) + 3.0, (t, u) => {
    oscuro(1, '#141019');
    C.rotulo(g, 'Esa Es Otra Historia', ent(t, t - u + 0.1, 0.5), { tam: 96, y: HH * 0.4, color: '#ffe7a8' });
    C.rotulo(g, 'Suscríbete para más historias reales', ent(t, t - u + 0.5, 0.5), { tam: 56, y: HH * 0.56 });
  });
})();
