/* Solo reels: entradas (partes 2–4), cierres (partes 1–3) y "sígueme". En el completo estas frases no existen y q() las salta. */
(() => {
  const e2 = q('Mary Anning vive de vender fósiles'), e2b = q('A los trece años ya había desenterrado');
  toma(e2, (t, u) => {
    const km = 0.85, top = PISO + 40 - 150 * ESC * km;
    escena(LUG.playa, { t, px: u * 10, z: 1 }, () => {
      per('mary', { t, x: sx(60), y: PISO + 10, k: 1.05, giro: -0.2, cara: 'tranquila' });
      obj('mesa', { x: sx(40), y: PISO + 40, t, k: km });
      [[-120, 'amonita'], [-30, 'amonita_g'], [70, 'amonita'], [150, 'amonita']].forEach(([dx, id]) => obj(id, { x: sx(40) + dx * ESC * km * 0.9, y: top, t, k: 0.55 }));
    });
  });
  toma(e2b, (t, u) => {
    escena(LUG.playa, { t, px: 260 + u * 8, z: 1 }, () => {
      obj('ictio', { x: sx(120), y: PISO - 50, t, k: 0.45, revela: 1 });
      per('mary_nina', { t, x: sx(-330), y: PISO + 40, k: 1.0, giro: 0.6, cara: 'feliz', mira: [0.9, 0.3] });
    });
    titular('13 AÑOS', ent(t, e2b + 0.3), { y: 560 });
  });
  const e3 = q('Mary Anning, una joven pobre inglesa, dibujó'), e3b = q('Ese dibujo ya circula');
  toma(e3, (t, u) => {
    if (u < 2.2) escribiendo(t, 'mary', 'dibujo');
    else inserto(t, [{ id: 'dibujo', trazo: suave((u - 2.2) / 2.5) }]);
  });
  toma(e3b, (t, u) => { escena(LUG.estudio, { t, px: 0, z: 1 }, () => {}); oscuro(0.45); copiasDibujo(t, e3b + 0.1); });
  const e4 = q('Un experto llamó fraude'), e4b = q('En Londres, solo hombres decidían');
  toma(e4, (t, u) => {
    escena(LUG.paris, { t, px: u * 6, z: 1.05, fx: sx(0) }, () => {
      const c = { t, x: sx(0), y: PISO + 40, k: 1.3, giro: -0.15, cara: 'apretada', mira: [0, 0.7], manoD: [44, -150], manoI: [-44, -150], pose: { cab: 8 } };
      per('cuvier', c); H.obj('dibujo').dibujar(g, { x: c.x, y: c.y - 118 * ESC * KP(c), t, escala: ESC * KP(c) * 0.7, trazo: 1 });
    });
    sello('¿FRAUDE?', CX, 470, ent(t, e4 + 0.9, 0.25));
  });
  toma(e4b, (t, u) => {
    escena(LUG.sala, { t, px: u * 6, z: 1, focos: focosSala() }, () => {
      silueta(() => [-300, -120, 120, 300].forEach((dx, i) => per(i % 2 ? 'socio' : 'clerigo', { t: t + i, x: sx(dx), y: PISO - 10, k: 1.0, giro: dx < 0 ? 0.4 : -0.4 })), 0.85);
      salaMesa(t);
    });
    sello('SOLO HOMBRES', CX, 640, ent(t, e4b + 0.6, 0.25));
  });

  const c1 = q('Los fósiles son lo único'), c1b = q('¿Qué pasa el día que la roca');
  toma(c1, (t, u) => {
    escena(LUG.playa_tarde, { t, px: u * 8, z: 1 + u * 0.02, fx: sx(0) }, () => {
      obj('mesa', { x: sx(260), y: PISO + 60, t, k: 0.7 });
      obj('amonita', { x: sx(230), y: PISO + 60 - 150 * ESC * 0.7, t, k: 0.5 });
      const m = { t, x: sx(-80), y: PISO + 40, k: 1.15, giro: 0.3, cara: t > c1b ? 'triste' : 'neutral', mira: [0.4, 0.6], manoD: [55, -100] };
      per('mary_nina', m); enMano(m, 'manoD', 'canasta', { k: 0.42, dy: 70, lleno: 0 });
    });
  });
  const c2 = q('Un cuello así, una cabeza así'), c2b = q('¿Y a quién le van a creer');
  toma(c2, (t, u) => {
    escena(LUG.paris, { t, px: 0, z: 1 }, () => { obj('mesa', { x: sx(0), y: PISO + 600, t, k: 3.2 }); });
    hojaGrande(t, { zoom: 1 + u * 0.01 });
    sello('¿REAL?', CX - 220, 640, ent(t, q('¿animal real'), 0.25), { color: '#2f8a4f', rot: -8 });
    sello('¿FRAUDE?', CX + 200, 800, ent(t, q('o fraude?'), 0.25), { rot: 6 });
  });
  toma(c2b, (t, u) => {
    escena(LUG.sala, { t, px: u * 6, z: 1, focos: focosSala() }, () => {
      silueta(() => [-300, -120, 120, 300].forEach((dx, i) => per(i % 2 ? 'socio' : 'clerigo', { t: t + i, x: sx(dx), y: PISO - 10, k: 1.0, giro: dx < 0 ? 0.4 : -0.4 })), 0.85);
      salaMesa(t);
      per('mary', { t, x: sx(-420), y: PISO + 200, k: 1.15, giro: 0.4, cara: 'triste', mira: [0.8, -0.2] });
    });
  });
  const c3 = q('Cuvier dijo fraude.');
  toma(c3, (t, u) => {
    escena(LUG.pasillo, { t, px: -u * 8, z: 1 + u * 0.02, fx: sx(120), focos: [{ x: sx(160), y: PISO - 10, r: 300, fuerza: 0.6 }] }, () => {
      obj('puerta', { x: sx(170), y: PISO, t, k: 1.0, abierta: 0 });
      per('mary', { t, x: sx(-190), y: PISO + 20, k: 1.0, giro: 0.6, cara: 'triste', mira: [0.8, 0] });
    });
    sello('¿QUIÉN LA DEFIENDE?', CX, 640, ent(t, q('¿Quién va a defender'), 0.25), { tam: 64, color: '#ffe7a8', rot: -4 });
  });

  for (let n = 1; n <= 4; n++) {
    const s = q('Sígueme para no perderte', { vez: n });
    if (s == null) continue;
    const ultima = q('Sígueme para no perderte nuevas historias.') != null && Math.abs(q('Sígueme para no perderte nuevas historias.') - s) < 0.5;
    toma(s, (t, u) => {
      escena(LUG.casa_noche, { t, px: 0, z: 1, focos: [{ x: sx(-200), y: PISO - 150, r: 600, fuerza: 1 }] }, () => {
        obj('mesa', { x: sx(0), y: PISO + 260, t, k: 1.6 });
        const top = PISO + 260 - 150 * ESC * 1.6;
        obj('dibujo', { x: sx(60), y: top, t, k: 1.5 }); obj('vela', { x: sx(-260), y: top, t, k: 1.0 });
      });
      oscuro(0.55);
      C.rotulo(g, 'Sígueme', ent(t, s + 0.1, 0.4), { tam: 110, y: 560 });
      C.rotulo(g, 'Esa Es Otra Historia', ent(t, s + 0.3, 0.4), { tam: 72, y: 690, color: '#ffe7a8' });
      if (!ultima) C.rotulo(g, `Parte ${n + 1} en el perfil`, ent(t, s + 0.6, 0.4), { tam: 56, y: 800 });
    });
  }
})();
