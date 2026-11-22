/* Parte 2 · Lo que vio Angela (S07–S13). */
const escritorioAngela = (t, u, o = {}) => oficinaW(t, u, () => {
  obj('escritorio', { x: sx(0), y: PISO + 60, t, k: 1.05, dentro: [(gg, a) => H.per('angela').dibujar(gg, { ...a, t, cara: o.cara || 'neutral', pose: { sentado: true, pi: [10, 0], pd: [10, 0], cab: 10 }, mira: [0, 0.8], manoD: [55, -160], manoI: [-55, -160] })] });
  const top = PISO + 60 - 178 * ESC * 1.05;
  (o.hojas || ['testamento']).forEach((id, i, arr) => obj(id, { x: sx((i - (arr.length - 1) / 2) * 120), y: top + 6, t, k: 0.42 }));
  if (!V) obj('lampara', { x: sx(-330), y: PISO + 20, t, k: 0.9 });
}, o.L);
const lapidaNiebla = (t, u, o = {}) => {
  escena(o.noche ? LUG.cementerio_n : LUG.cementerio, { t, px: u * 6, z: (o.z ?? 1.1) + u * (o.dz ?? 0.02), fx: sx(0) }, () => {
    obj('arbol', { x: sx(-430), y: PISO - 60, t, k: 0.75 });
    [[-260, 0.45], [300, 0.5]].forEach(([dx, k]) => obj('lapida', { x: sx(dx), y: PISO - 80, t, k }));
    obj('lapida', { x: sx(0), y: PISO + 80, t, k: 1.0 });
  });
  C.niebla(g, t, { k: 0.9, y: PISO - 120 });
};
(() => {
  const tMal = T('El testamento nuevo está mal escrito'), tCasa = T('Menciona una sola casa'), tFirma = T('Y la firma no parece');
  toma(tMal, (t, u) => {
    inserto(t, [{ id: 'testamento', k: V ? 2.9 : 2.9 }]);
    const k = ESC * (V ? 2.9 : 2.9), x = CX, y = V ? 1080 : 960;
    aro(x - 10 * k, y - 160 * k, 46 * k, ent(t, tMal + 1.0, 0.3) * (1 - ent(t, tCasa, 0.2)));
    aro(x + 5 * k, y - 134 * k, 30 * k, ent(t, tCasa, 0.3) * (1 - ent(t, tFirma, 0.2)));
    texto('1 CASA', x - 90 * k, y - 220 * k, ent(t, tCasa + 0.3), { tam: V ? 56 : 60, color: '#ffb4a2' });
    texto('TENÍA 2', x + 90 * k, y - 220 * k, ent(t, T('y Kathleen tenía dos.')), { tam: V ? 56 : 60, color: '#ffe7a8' });
    aro(x - 6 * k, y - 36 * k, 50 * k, ent(t, tFirma, 0.3));
  });

  const tMas = T('Hay algo más.'), tEsa = T('Ese papel no parece escrito por ella.');
  toma(tMas, (t, u) => {
    escena(LUG.antigua, { t, px: u * 5, z: 1.05 + u * 0.01 }, () => {
      obj('ventana_of', { x: sx(-430), y: PISO - 340, t, k: 0.8 });
      obj('escritorio', { x: sx(20), y: PISO + 60, t, k: 1.05, dentro: [(gg, a) => H.per('kathleen_joven').dibujar(gg, { ...a, t, cara: 'tranquila', pose: { sentado: true, pi: [10, 0], pd: [10, 0], cab: 8 }, mira: [0, 0.8], manoD: [50 + Math.sin(t * 22) * 6, -240], manoI: [-50 + Math.cos(t * 19) * 6, -240] })] });
      obj('maquina', { x: sx(20), y: PISO + 60 - 178 * ESC * 1.05 + 4, t, k: 0.45, teclea: true, hoja: 0.35 * cl(u / 6) });
    });
    sepia(0.7);
    etiqueta('ESTUDIÓ PARA SECRETARIA', ent(t, T('Kathleen había estudiado para secretaria.')), { tam: V ? 46 : 54 });
  });
  toma(tEsa, (t, u) => { escritorioAngela(t, u, { cara: 'neutral', hojas: ['original', 'testamento'] }); });

  const tPero = T('Pero Angela no se queda con la intuición.'), tPreg = T('Se pregunta si alguien quiso'), tRevisa = T('Así que revisa'), tNoSe = T('No se parecen.');
  toma(tPero, (t, u) => {
    escritorioAngela(t, u, { cara: 'neutral' });
    sello('¿QUIÉN USÓ SU NOMBRE?', CX, V ? 520 : 170, ent(t, tPreg + 0.4, 0.25), { tam: V ? 52 : 64, color: '#2c3a52', rot: -4 });
  });
  toma(tRevisa, (t, u) => {
    const k = V ? 1.15 : 1.9, xs = V ? [CX - 330, CX, CX + 330] : [CX - 520, CX, CX + 520], y = V ? 1000 : 920;
    inserto(t, [{ id: 'firmas', x: xs[0], y, k, rot: -3 }, { id: 'testamento', x: xs[1], y, k }, { id: 'firmas', x: xs[2], y, k, rot: 3 }]);
    const kk = ESC * k, lx = xs[1] + Math.sin(u * 1.4) * 260 * K;
    H.obj('lupa').dibujar(g, { x: lx, y: y - 30 * kk + 70 * kk * 0.7, t, escala: kk * 0.7 });
    texto('BANCO', xs[0], y - 200 * kk - 36, 1, { tam: V ? 34 : 42, color: '#ffe7a8' }); texto('BANCO', xs[2], y - 200 * kk - 36, 1, { tam: V ? 34 : 42, color: '#ffe7a8' });
    sello('NO SE PARECEN', CX, V ? 560 : 190, ent(t, tNoSe, 0.25), { tam: V ? 62 : 74 });
  });

  const tTest = T('El testamento tiene dos testigos'), tBusca = T('Angela los busca'), tTerm = T('Cuando termina'), tFalso = T('el testamento es falso.');
  const visita = (t, u, cual) => {
    escena(LUG.calle, { t, px: cual * 400 + u * 10, z: 1 }, () => {
      obj(cual ? 'puerta2' : 'puerta', { x: sx(200) + cual * 400, y: PISO - 30, t, k: 1.0, abierta: 0.7 * cl((u - 0.8) / 0.6) });
      if (u > 1.2) silueta(() => per(cual ? 'vecina' : 'vecino', { t, x: sx(200) + cual * 400, y: PISO - 30, k: 1.0, giro: -0.4 }), 0.92);
      per('angela', { t, x: sx(-120) + cual * 400, y: PISO + 40, k: 1.1, giro: 0.6, cara: 'neutral', mira: [0.8, 0], manoD: u < 1 ? [120, -230 + Math.abs(Math.sin(t * 9)) * 20] : undefined });
    });
  };
  toma(tTest, (t, u) => { visita(t, u, 0); etiqueta('2 TESTIGOS', ent(t, tTest + 0.5)); });
  toma(tBusca, (t, u) => { visita(t, u, 1); etiqueta('2 TESTIGOS', 1); });
  toma(tTerm, (t, u) => {
    escena(LUG.calle, { t, px: 900 + u * 8, z: 1.15, fx: sx(0) + 900 }, () => {
      const a = { t, x: sx(0) + 900, y: PISO + 40, k: 1.15, giro: 0.15, cara: 'neutral', mira: [0, 0.6], manoD: [40, -160] };
      per('angela', a); enMano(a, 'manoD', 'libreta', { k: 0.4, dy: 10, abierto: u < 2 ? 1 : 0 });
    });
    sello('FALSO', CX, V ? 560 : 200, ent(t, tFalso, 0.25), { tam: V ? 100 : 120 });
  });

  const tCosa = T('Pero un testamento falso es una cosa.'), tUnica = T('Y la única persona que dijo');
  toma(tCosa, (t, u) => {
    if (V) { lapidaNiebla(t, u, { z: 1 }); oscuro(0.25); H.obj('testamento').dibujar(g, { x: CX, y: 860, t, escala: ESC * 1.2, rot: -4 }); sello('FALSO ✓', CX, 520, ent(t, tCosa + 0.3, 0.25), { color: '#2f8a4f' }); sello('¿DE QUÉ MURIÓ?', CX, 1050, ent(t, T('Probar de qué murió su mamá'), 0.25), { tam: 60 }); }
    else { lapidaNiebla(t, u, { z: 1 }); oscuro(0.25); H.obj('testamento').dibujar(g, { x: CX - 460, y: 900, t, escala: ESC * 1.9, rot: -4 }); sello('FALSO ✓', CX - 460, 300, ent(t, tCosa + 0.3, 0.25), { color: '#2f8a4f' }); sello('¿DE QUÉ MURIÓ?', CX + 300, 300, ent(t, T('Probar de qué murió su mamá'), 0.25)); }
  });
  toma(tUnica, (t, u) => {
    lapidaNiebla(t, u, { z: 1.05 });
    per('doctor', { t, x: sx(V ? 300 : 420), y: PISO + 140, k: 1.2, giro: -0.95 });
  });

  const tJunta = T('Angela junta lo que encontró'), tDet = T('Un detective revisa todo'), tAcusar = T('Pero la policía no puede acusar'), tSaber = T('Para saber de qué murió Kathleen'), tTumba = T('Y como ya la enterraron');
  window.comisaria = (t, u, o = {}) => escena(LUG.comisaria, { t, px: u * 5, z: 1 + u * 0.01 }, () => {
    obj('tablero', { x: sx(-330), y: PISO - 260, t, k: 0.55, marcas: 0 });
    obj('escritorio_c', { x: sx(60), y: PISO + 60, t, k: 1.05, dentro: [(gg, a) => H.per('detective').dibujar(gg, { ...a, t, cara: o.cara || 'neutral', pose: { sentado: true, pi: [10, 0], pd: [10, 0], cab: o.cab ?? 0 }, mira: o.mira || [0.3, 0.6], manoD: o.manoD, manoI: o.manoI })] });
    const top = PISO + 60 - 178 * ESC * 1.05;
    obj('carpeta_p', { x: sx(-10), y: top + 4, t, k: 0.28, grosor: true });
    if (o.tel) obj('telefono', { x: sx(170), y: top, t, k: 0.5, descolgado: 1 });
    per('angela', { t, x: sx(V ? 330 : 420), y: PISO + 130, k: 1.1, giro: -0.5, cara: o.caraA || 'neutral', mira: [-0.7, 0.2] });
  });
  toma(tJunta, (t, u) => { comisaria(t, u); etiqueta('JULIO 1998', ent(t, tJunta + 0.6)); });
  toma(tDet, (t, u) => { const si = Math.max(0, Math.sin((t - tDet - 2.2) * 6)) * 8 * cl(1 - (t - tDet - 3.4)); comisaria(t, u, { cab: 10 + si, mira: [0, 0.8], cara: t > tDet + 2.2 ? 'apretada' : 'neutral' }); });
  toma(tAcusar, (t, u) => { comisaria(t, u, { tel: true, manoI: [-60, -330], caraA: 'triste' }); });
  toma(tSaber, (t, u) => {
    lapidaNiebla(t, u, { z: 1.05 });
    titular('AUTOPSIA', ent(t, T('una autopsia.')), { color: '#ffe7a8' });
  });
  toma(tTumba, (t, u) => { lapidaNiebla(t, u, { z: 1.25, dz: 0.05, noche: true }); });
})();
