/* Solo reels: entradas (partes 2–4), cierres (partes 1–3) y "sígueme". En el completo q() las salta. */
(() => {
  const e2 = q('Angela Woodruff es abogada.'), e2b = q('Ella ve que es falso.');
  toma(e2, (t, u) => { escritorioAngela(t, u, { cara: 'neutral', hojas: ['original', 'testamento'] }); titular('ANGELA WOODRUFF', ent(t, e2 + 0.2), { tam: 72 }); });
  toma(e2b, (t, u) => { inserto(t, [{ id: 'testamento' }]); sello('FALSO', CX, 560, ent(t, e2b + 0.4, 0.25), { tam: 100 }); });
  const e3 = q('Angela Woodruff convenció a la policía'), e3b = q('Ahora abrirán su tumba');
  toma(e3, (t, u) => { comisaria(t, u, { cab: 8, mira: [0, 0.8] }); titular('ANGELA WOODRUFF', ent(t, e3 + 0.2), { tam: 72 }); });
  toma(e3b, (t, u) => { lapidaNiebla(t, u, { z: 1.1, noche: true }); });
  const e4 = q('Un médico falsificó el testamento'), e4b = q('Ya está arrestado.'), e4c = q('La policía empieza a revisar');
  toma(e4, (t, u) => { inserto(t, [{ id: 'maquina', x: CX, y: 860, k: 0.95 }, { id: 'testamento', x: CX, y: 1460, k: 1.1, rot: 4 }]); });
  toma(e4b, (t, u) => {
    escena(LUG.calle_alba, { t, px: u * 6, z: 1 }, () => { obj('puerta_c', { x: sx(-260), y: PISO - 30, t, k: 1.0, abierta: 0 }); per('doctor', { t, x: sx(-60), y: PISO + 50, k: 1.05, giro: 0.95 }); });
  });
  toma(e4c, (t, u) => { escena(LUG.comisaria, { t, px: 0, z: 1 }, () => {}); oscuro(0.3); H.obj('tablero').dibujar(g, { x: CX, y: 1100, t, escala: 1.6, marcas: 0 }); texto('?', CX, 560, ent(t, e4c + 0.3), { tam: 160, color: '#ffe7a8' }); });

  const c1 = q('Algo en ese papel no cuadra.');
  toma(c1, (t, u) => {
    inserto(t, [{ id: 'testamento' }]);
    const k = ESC * 2.6; H.obj('lupa').dibujar(g, { x: CX + Math.sin(u * 1.2) * 60 * k, y: 1080 - 120 * k + 70 * k * 0.9, t, escala: k * 0.9 });
  });
  const c2 = q('Un testamento falso no prueba un asesinato.');
  toma(c2, (t, u) => { lapidaNiebla(t, u, { z: 1.15, noche: true }); sello('¿QUÉ VAN A ENCONTRAR?', CX, 520, ent(t, q('¿Qué van a encontrar') ?? 1e9, 0.25), { tam: 52, color: '#ffe7a8', rot: -3 }); });
  const c3 = q('Lo arrestan por la muerte de Kathleen.');
  toma(c3, (t, u) => {
    escena(LUG.comisaria, { t, px: 0, z: 1 }, () => {}); oscuro(0.3);
    H.obj('tablero').dibujar(g, { x: CX, y: 1100, t, escala: 1.6, marcas: 1 });
    sello('¿SOLO ELLA?', CX, 520, ent(t, q('¿Es lo único') ?? 1e9, 0.25), { tam: 70, color: '#ffe7a8', rot: -3 });
  });

  for (let n = 1; n <= 4; n++) {
    const s = q('Sígueme para no perderte', { vez: n });
    if (s == null) continue;
    const ult = q('Sígueme para no perderte nuevas historias.'), ultima = ult != null && Math.abs(ult - s) < 0.5;
    toma(s, (t, u) => {
      inserto(t, [{ id: 'maquina', x: CX, y: 1200, k: 0.9 }], LUG.oficina_w_tarde, 0.55);
      C.rotulo(g, 'Sígueme', ent(t, s + 0.1, 0.4), { tam: 110, y: 560 });
      C.rotulo(g, 'Esa Es Otra Historia', ent(t, s + 0.3, 0.4), { tam: 72, y: 690, color: '#ffe7a8' });
      if (!ultima) C.rotulo(g, `Parte ${n + 1} en el perfil`, ent(t, s + 0.6, 0.4), { tam: 56, y: 800 });
    });
  }
})();
