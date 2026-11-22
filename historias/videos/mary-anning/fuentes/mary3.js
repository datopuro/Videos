/* Parte 3 · La sala sin mujeres (S13–S16). */
const salaMesa = (t, o = {}) => {
  const km = o.km ?? 0.8, top = PISO + 80 - 160 * ESC * km;
  obj('mesa_sala', { x: sx(0), y: PISO + 80, t, k: km });
  obj('plesio_mesa', { x: sx(o.dx ?? 30), y: top + 4, t, k: o.kp ?? (V ? 0.32 : 0.5) });
  obj('dibujo', { x: sx(V ? -250 : -330), y: top, t, k: o.kd ?? 0.75 });
  for (const dx of [-440, 440]) obj('vela', { x: sx(dx), y: top, t: t + dx, k: 0.75 });
  return top;
};
const focosSala = () => [-440, 0, 440].map(dx => ({ x: sx(dx), y: PISO + 80 - 160 * ESC * 0.8 - 120, r: dx ? 620 : 760, fuerza: dx ? 1 : 0.7 }));
const hojaGrande = (t, o = {}) => {
  const k = V ? 3.0 : 3.1, x = CX, y = V ? 1000 : 860;
  H.obj('dibujo').dibujar(g, { x, y, t, escala: ESC * k * (o.zoom || 1), trazo: 1, rot: o.rot || 0 });
  return { x, y, k: ESC * k * (o.zoom || 1) };
};
(() => {
  const tParis = T('En París, el científico más respetado'), tCuv = T('Georges Cuvier'), tVe = T('Ve un dibujo.'), tCuello = T('Un cuello larguísimo.'), tCabeza = T('Una cabeza diminuta.'), tDecide = T('Y decide que no pueden ser'), tDice = T('Dice que es un fraude'), tElla = T('quien la vendió es ella.', { vez: 1 }), tSi = T('Y si es una falsificación');
  toma(tParis, (t, u) => {
    escena(LUG.paris, { t, px: u * 6, z: 1.04 + u * 0.01, fx: sx(0) }, () => {
      obj('ventana', { x: sx(-430), y: PISO - 330, t, k: 0.8 }); obj('lampara', { x: sx(420), y: PISO + 20, t, k: 0.9 });
      const c = { t, x: sx(0), y: PISO + 40, k: 1.3, giro: -0.15, cara: 'neutral', mira: [0, 0.7], manoD: [44, -150], manoI: [-44, -150], pose: { cab: 8 } };
      per('cuvier', c); H.obj('dibujo').dibujar(g, { x: c.x, y: c.y - 118 * ESC * KP(c), t, escala: ESC * KP(c) * 0.7, trazo: 1 });
    });
    titular('GEORGES CUVIER', ent(t, tCuv), { tam: V ? 76 : 92 });
    etiqueta('PARÍS', ent(t, tParis + 0.2));
  });
  toma(tVe, (t, u) => {
    escena(LUG.paris, { t, px: 0, z: 1 }, () => { obj('mesa', { x: sx(0), y: PISO + 600, t, k: 3.2 }); });
    const h = hojaGrande(t, { zoom: 1 + u * 0.01 });
    const P = (px, py) => [h.x + (14 + 1.05 * px) * h.k, h.y + (-58.8 + 1.05 * py) * h.k];
    const [nx, ny] = P(-50, -17), [cx2, cy2] = P(-81, -43);
    aro(nx, ny, 34 * h.k, ent(t, tCuello, 0.3) * (1 - ent(t, tCabeza - 0.1, 0.15)));
    aro(cx2, cy2, 12 * h.k, ent(t, tCabeza, 0.3) * (1 - ent(t, tDecide - 0.1, 0.15)));
  });
  toma(tDecide, (t, u) => {
    escena(LUG.paris, { t, px: u * 5, z: 1.15, fx: sx(0) }, () => {
      obj('lampara', { x: sx(420), y: PISO + 20, t, k: 0.9 });
      const no = Math.sin((t - tDecide) * 7) * 6 * cl(1 - (t - tDecide - 1.5) / 1);
      const c = { t, x: sx(0), y: PISO + 60, k: 1.45, giro: no * 0.03, cara: 'apretada', mira: [0, 0.2], manoD: [44, -150], manoI: [-44, -150] };
      per('cuvier', c); H.obj('dibujo').dibujar(g, { x: c.x, y: c.y - 118 * ESC * KP(c), t, escala: ESC * KP(c) * 0.7, trazo: 1 });
    });
  });
  toma(tDice, (t, u) => {
    escena(LUG.paris, { t, px: 0, z: 1 }, () => { obj('mesa', { x: sx(0), y: PISO + 600, t, k: 3.2 }); });
    const h = hojaGrande(t, { rot: Math.sin(u * 0.6) * 1.5 });
    sello('¿FRAUDE?', CX, V ? 660 : 330, ent(t, T('es un fraude', { vez: 2 }), 0.25), { tam: V ? 100 : 120 });
    const a = ent(t, T('que alguien pegó'), 0.4);
    if (a > 0) { C.rotulo(g, 'cabeza de serpiente  +  cuerpo de reptil', a, { tam: V ? 40 : 50, y: V ? 1450 : 110, color: '#ffe7a8' }); }
  });
  toma(tSi, (t, u) => {
    escena(LUG.playa_tarde, { t, px: u * 8, z: 1.1 + u * 0.03, fx: sx(0) }, () => {
      per('mary', { t, x: sx(0), y: PISO + 60, k: 1.4, giro: 0.15, cara: C.mezclarCara2('neutral', 'miedo', ent(t, tElla, 0.5)), mira: [0.3, 0], pelo: [-12, 0] });
    });
    etiqueta('MARY ANNING · LYME REGIS', ent(t, tSi + 0.3), { tam: V ? 50 : 56 });
  });

  const tDuque = T('Un duque, el de Buckingham'), tFeb = T('Y el veinte de febrero'), tPeq = T('Es una sala pequeña');
  toma(tDuque, (t, u) => {
    escena(LUG.estudio, { t, px: u * 10, z: 1 + u * 0.01 }, () => {
      obj('ventana', { x: sx(-430), y: PISO - 330, t, k: 0.8 });
      obj('caja', { x: sx(-40), y: PISO + 90, t, k: V ? 0.7 : 0.9 });
      obj('monedas', { x: sx(V ? 330 : 470), y: PISO + 80, t, k: 1.3, cuantas: Math.min(12, 3 + u * 4) });
    });
    titular('150 GUINEAS', ent(t, T('ciento cincuenta guineas')), { color: '#ffe7a8' });
  });
  toma(tFeb, (t, u) => {
    const x = sx(-520) + u * 120 * K;
    escena(LUG.calle, { t, px: u * 30, z: 1 }, () => {
      obj('carreta', { x: x + u * 30, y: PISO + 70, t, k: 0.75, giro: u * 3, dentro: [(gg, a) => H.obj('caja').dibujar(gg, { x: 0, y: 0, t, escala: 0.62 })] });
      for (const [dx, id] of [[-260, 'socio'], [380, 'clerigo']]) per(id, { t: t + dx, x: x + u * 30 + dx * ESC * 0.6, y: PISO + 90, k: 0.95, giro: 0.8, pose: C.caminar(t + dx, { dir: 1, amp: 0.6 }) });
    });
    etiqueta('20 FEB 1824 · LONDRES', ent(t, tFeb + 0.3), { tam: V ? 50 : 58 });
    titular('SOCIEDAD GEOLÓGICA', ent(t, T('a la Sociedad Geológica', { vez: 1 })), { tam: V ? 66 : 86 });
  });
  toma(tPeq, (t, u) => {
    escena(LUG.sala, { t, px: u * 8, z: 1 + u * 0.015, focos: focosSala() }, () => { salaMesa(t); });
  });

  const tDet = T('Hay un detalle.'), tMuj = T('no deja entrar a mujeres.'), tSoc = T('Ni de socias.'), tInv = T('Ni de invitadas.'), tLyme = T('Mary se queda en Lyme Regis'), tMiente = T('O si ella miente.');
  toma(tDet, (t, u) => {
    escena(LUG.pasillo, { t, px: 0, z: 1.05 + u * 0.03, fx: sx(0), focos: [{ x: sx(0), y: PISO, r: 340, fuerza: 0.8 }] }, () => {
      obj('puerta', { x: sx(0), y: PISO + 40, t, k: V ? 1.25 : 1.0, abierta: 0 });
    });
    sello('SOLO HOMBRES', CX, V ? 600 : 220, ent(t, tMuj, 0.25), { tam: V ? 84 : 96 });
    etiqueta('NI SOCIAS', ent(t, tSoc, 0.2), { y: V ? 780 : 380, tam: V ? 60 : 64, color: '#ffffff' });
    etiqueta('NI INVITADAS', ent(t, tInv, 0.2), { y: V ? 880 : 470, tam: V ? 60 : 64, color: '#ffffff' });
  });
  toma(tLyme, (t, u) => {
    const cerca = t >= tMiente;
    escena(LUG.playa_tarde, { t, px: 200 + u * 6, z: cerca ? 1.35 + (t - tMiente) * 0.05 : 1, fx: sx(-200) + 200 }, () => {
      per('mary', { t, x: sx(-200) + 200, y: PISO + 40, k: 1.15, giro: 0.6, cara: cerca ? 'apretada' : 'triste', mira: [0.9, -0.1], pelo: [-14, 0] });
    });
  });

  const tAdentro = T('Adentro, el reverendo William Conybeare'), tAhi = T('Pero el esqueleto está ahí');
  toma(tAdentro, (t, u) => {
    escena(LUG.sala, { t, px: u * 6, z: 1, focos: focosSala() }, () => {
      silueta(() => [-300, -120, 120, 300].forEach((dx, i) => per(i % 2 ? 'socio' : 'clerigo', { t: t + i, x: sx(dx), y: PISO - 10, k: 1.0, giro: dx < 0 ? 0.4 : -0.4 })), 0.85);
      salaMesa(t);
      per('clerigo', { t, x: sx(V ? 330 : 600), y: PISO + 120, k: 1.15, giro: -0.4, cara: 'miedo', mira: [-0.7, 0.4] });
    });
    titular('WILLIAM CONYBEARE', ent(t, tAdentro + 0.6), { tam: V ? 66 : 84 });
  });
  toma(tAhi, (t, u) => {
    escena(LUG.sala, { t, px: 0, z: 1.35 + u * 0.04, fx: sx(-60), focos: focosSala() }, () => { salaMesa(t, { kd: 0.9 }); });
  });
})();
