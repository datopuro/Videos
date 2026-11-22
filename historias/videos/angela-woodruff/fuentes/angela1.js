/* Parte 1 · El testamento que llegó el mismo día (S01–S06). Cada toma empieza en la frase del guion que la abre. */
const salaK = (t, u, o = {}) => {
  escena(LUG.casa_k, { t, px: u * 6, z: o.z ?? 1.04 + u * 0.01 }, () => {
    obj('ventana', { x: sx(-420), y: PISO - 340, t, k: 0.85 });
    obj('sillon', { x: sx(40), y: PISO + 40, t, k: 1.0, dentro: o.dentro });
    if (!o.dentro) obj('manta', { x: sx(-20), y: PISO - 80, t, k: 0.75 });
    obj('mesita', { x: sx(330), y: PISO + 70, t, k: 0.9 });
    obj('taza', { x: sx(330), y: PISO + 70 - 90 * ESC * 0.9, t, k: 0.75 });
    if (o.extra) o.extra();
  });
};
const oficinaH = (t, u, fn) => {
  escena(LUG.oficina_h, { t, px: u * 5, z: 1 + u * 0.01 }, () => {
    obj('archivero', { x: sx(-430), y: PISO + 20, t, k: 0.85 });
    obj('escritorio', { x: sx(40), y: PISO + 60, t, k: 1.05, dentro: [(gg, a) => H.per('abogado').dibujar(gg, { ...a, t, cara: 'sorpresa', pose: { sentado: true, pi: [10, 0], pd: [10, 0], cab: 8 }, mira: [0, 0.8], manoD: [70, -230] })] });
    if (fn) fn(PISO + 60 - 178 * ESC * 1.05);
  });
};
const oficinaW = (t, u, fn, L = LUG.oficina_w) => {
  escena(L, { t, px: u * 5, z: 1 + u * 0.01 }, () => {
    obj('ventana_of', { x: sx(-440), y: PISO - 340, t, k: 0.8 });
    obj('archivero', { x: sx(430), y: PISO + 20, t, k: 0.85 });
    if (fn) fn();
  });
};
(() => {
  const t0 = 0, tDia = T('Ese mismo día, a una oficina'), tTodo = T('Deja todo a su médico.'), tNada = T('Nada para su hija.');
  toma(t0, (t, u) => {
    salaK(t, u, { z: 1.08 + u * 0.015 });
    C.rotulo(g, 'Murió sana.', ent(t, 0.2, 0.3), { tam: V ? 92 : 96, y: V ? 470 : 200 });
    C.rotulo(g, 'El testamento llegó ese mismo día.', ent(t, 0.5, 0.3), { tam: V ? 54 : 62, y: V ? 580 : 300, color: '#ffe7a8' });
    etiqueta('24 JUN 1998 · HYDE', ent(t, 1.0), { y: V ? 1420 : 380, tam: V ? 46 : 44 });
  });
  toma(tDia, (t, u) => {
    if (t < tTodo) {
      oficinaH(t, u, top => {
        const cae = suave((t - tDia - 0.6) / 0.6);
        obj('sobre', { x: sx(-140), y: top - (1 - cae) * 300, t, k: 0.9, rot: (1 - cae) * 30 });
      });
    } else {
      inserto(t, [{ id: 'testamento', trazo: 1 }], LUG.oficina_h);
      const h = { x: CX, y: V ? 1080 : 960, k: ESC * (V ? 2.6 : 2.7) };
      aro(h.x + 5 * h.k, h.y - 134 * h.k, 34 * h.k, ent(t, tTodo, 0.3));
      sello('NADA PARA SU HIJA', CX, V ? 520 : 150, ent(t, tNada, 0.25), { tam: V ? 64 : 70 });
    }
  });

  const tKath = T('Se llamaba Kathleen Grundy.'), tHija = T('Su hija es abogada'), tCaro = T('Ese detalle le va a costar');
  toma(tKath, (t, u) => {
    salaK(t, u, { dentro: [(gg, a) => H.per('kathleen').dibujar(gg, { ...a, t, cara: 'feliz', lentes: true, pose: { sentado: true } })] });
    titular('KATHLEEN GRUNDY', ent(t, tKath + 0.2), { tam: V ? 78 : 96 });
  });
  toma(tHija, (t, u) => {
    oficinaW(t, u, () => {
      obj('escritorio', { x: sx(0), y: PISO + 60, t, k: 1.05, dentro: [(gg, a) => H.per('angela').dibujar(gg, { ...a, t, cara: 'neutral', pose: { sentado: true, pi: [10, 0], pd: [10, 0] }, mira: [0.2, 0.6], manoD: [60, -250] })] });
      obj('telefono', { x: sx(-120), y: PISO + 60 - 178 * ESC * 1.05, t, k: 0.6, descolgado: 1 });
    });
    titular('ANGELA WOODRUFF', ent(t, tHija + 0.3), { tam: V ? 72 : 92 });
    etiqueta('SU HIJA · ABOGADA', ent(t, tHija + 0.6));
  });
  toma(tCaro, (t, u) => {
    inserto(t, [{ id: 'testamento', trazo: 1 }]);
    const k = ESC * (V ? 2.6 : 2.7), x = CX + Math.sin(u * 1.2) * 60 * k, y = (V ? 1080 : 960) - 120 * k + Math.cos(u * 0.9) * 30 * k;
    H.obj('lupa').dibujar(g, { x, y: y + 70 * k * 0.9, t, escala: k * 0.9 });
  });

  const tClub = T('Kathleen había sido alcaldesa'), tNo = T('Ese día no llegó.');
  const club = (t, u, con) => {
    escena(LUG.club, { t, px: u * 6, z: 1 }, () => {
      obj('reloj', { x: sx(0), y: PISO - 420, t, k: 0.8, hora: 12.1 });
      silueta(() => { [-380, -240, 240, 380].forEach((dx, i) => obj('silla', { x: sx(dx), y: PISO + 30, t, k: 0.85, dentro: [(gg, a) => H.per(i % 2 ? 'vecina' : 'vecino').dibujar(gg, { ...a, t: t + i, giro: dx < 0 ? 0.5 : -0.5, pose: { sentado: true, pi: [10, 0], pd: [10, 0] } })] })); }, 0.75);
      obj('mesa_larga', { x: sx(0), y: PISO + 110, t, k: 0.8 });
      const top = PISO + 110 - 150 * ESC * 0.8;
      [-300, -100, 100, 300].forEach(dx => obj('taza', { x: sx(dx), y: top, t, k: 0.55 }));
      if (con) per('kathleen', { t, x: sx(-60), y: PISO + 140, k: 1.05, giro: 0.4, cara: 'feliz', manoD: [100, -170] });
      else obj('silla', { x: sx(-60), y: PISO + 180, t, k: 0.95 });
    });
  };
  toma(tClub, (t, u) => { club(t, u, true); etiqueta('EXALCALDESA DE HYDE', ent(t, tClub + 0.4)); });
  toma(tNo, (t, u) => { club(t, u, false); });

  const tDoc = T('Su médico de años'), tLe = T('Le dice a la hija, Angela'), tCert = T('En el certificado escribe'), tAntes = T('Unos días antes, Angela'), tEnt = T('Pero no hay autopsia, y la entierran.');
  toma(tDoc, (t, u) => {
    const x = sx(-420) + Math.min(u, 3.2) * 110 * K, entra = u > 3.4;
    escena(LUG.calle, { t, px: 0, z: 1 }, () => {
      obj('puerta', { x: sx(260), y: PISO - 30, t, k: 1.0, abierta: 0.6 * cl((u - 2) / 0.6) * (1 - cl((u - 3.4) / 0.4)) });
      g.globalAlpha = 1 - cl((u - 3.0) / 0.4); if (!entra) { const d = { t, x, y: PISO + 40, k: 1.1, giro: 0.95, pose: C.caminar(t, { dir: 1, amp: 0.6 }), manoD: [40, -100] }; per('doctor', d); silueta(() => enMano(d, 'manoD', 'maletin', { k: 0.5, dy: 56 }), 1); } g.globalAlpha = 1;
    });
    etiqueta('ESA MAÑANA', ent(t, tDoc + 0.4));
    titular('HAROLD SHIPMAN · SU MÉDICO', ent(t, T('el doctor Harold Shipman')), { tam: V ? 52 : 74 });
  });
  toma(tLe, (t, u) => {
    escena(LUG.casa_a, { t, px: u * 5, z: 1.05 + u * 0.01, fx: sx(-60) }, () => {
      obj('mesita', { x: sx(200), y: PISO + 60, t, k: 1.0 });
      obj('telefono', { x: sx(200), y: PISO + 60 - 90 * ESC, t, k: 0.6, descolgado: 1 });
      const a = { t, x: sx(-60), y: PISO + 40, k: 1.15, giro: 0.2, cara: C.mezclarCara2('neutral', 'triste', ent(t, tLe + 1.5, 0.6)), mira: [0.2, 0.3], manoI: [-30, -300] };
      per('angela', a); enMano(a, 'manoI', 'auricular', { k: 0.8, dy: 40 });
    });
  });
  toma(tCert, (t, u) => {
    inserto(t, [{ id: 'certificado' }], LUG.casa_a, 0.45);
  });
  toma(tAntes, (t, u) => {
    escena(LUG.casa_k, { t, px: u * 6, z: 1 }, () => {
      obj('ventana', { x: sx(-420), y: PISO - 340, t, k: 0.85 });
      obj('mesita', { x: sx(200), y: PISO + 60, t, k: 1.0 });
      obj('telefono', { x: sx(200), y: PISO + 60 - 90 * ESC, t, k: 0.6, descolgado: 1 });
      const k = { t, x: sx(-40), y: PISO + 40, k: 1.12, giro: 0.25, cara: 'feliz', mira: [0.3, 0], manoI: [-30, -300] };
      per('kathleen', k); enMano(k, 'manoI', 'auricular', { k: 0.8, dy: 40 });
    });
    sepia(0.6);
    etiqueta('DÍAS ANTES', ent(t, tAntes + 0.2));
  });
  toma(tEnt, (t, u) => {
    escena(LUG.cementerio, { t, px: u * 8, z: 1 }, () => {
      obj('arbol', { x: sx(-420), y: PISO - 40, t, k: 0.8 });
      [[-200, 0.55], [250, 0.5], [420, 0.45]].forEach(([dx, k]) => obj('lapida', { x: sx(dx), y: PISO - 70, t, k }));
      silueta(() => [-60, 40, 140].forEach((dx, i) => per(i % 2 ? 'vecino' : 'vecina', { t: t + i, x: sx(dx), y: PISO - 30, k: 0.6, giro: 0.3 })), 0.9);
      obj('lapida', { x: sx(70), y: PISO + 90, t, k: 0.9 });
    });
    C.niebla(g, t, { k: 0.8, y: PISO - 150 });
  });

  const tPocos = T('Pocos días después, una oficina'), tNunca = T('Nunca habían trabajado'), tCopia = T('Y tienen una copia');
  toma(tPocos, (t, u) => {
    escena(LUG.casa_a, { t, px: u * 5, z: 1.05 }, () => {
      obj('mesita', { x: sx(200), y: PISO + 60, t, k: 1.0 });
      const contesta = u > 1.6;
      obj('telefono', { x: sx(200), y: PISO + 60 - 90 * ESC, t, k: 0.6, suena: !contesta, descolgado: contesta ? 1 : 0 });
      const a = { t, x: sx(-60), y: PISO + 40, k: 1.15, giro: 0.4, cara: contesta ? 'sorpresa' : 'neutral', mira: [0.8, 0.2], manoI: contesta ? [-30, -300] : undefined };
      per('angela', a); if (contesta) enMano(a, 'manoI', 'auricular', { k: 0.8, dy: 40 });
    });
  });
  toma(tNunca, (t, u) => {
    oficinaH(t, u, top => { obj('telefono', { x: sx(-160), y: top, t, k: 0.55, descolgado: 1 }); obj('sobre', { x: sx(170), y: top, t, k: 0.8 }); });
    etiqueta('OFICINA DE ABOGADOS · HYDE', ent(t, tNunca + 0.2), { tam: V ? 46 : 52 });
  });
  toma(tCopia, (t, u) => {
    inserto(t, [{ id: 'calendario', x: V ? CX - 250 : CX - 380, y: V ? 960 : 900, k: V ? 1.2 : 2.0, marca: suave((t - T('el mismo día en que murió.')) / 0.6) }, { id: 'testamento', x: V ? CX + 250 : CX + 360, y: V ? 980 : 940, k: V ? 1.3 : 2.2, rot: 4 }], LUG.oficina_h);
  });

  const tWar = T('La oficina de Angela, en Warwick'), tNuevo = T('El nuevo deja todo al doctor Shipman.'), tNi = T('Ni Angela ni sus hijos');
  toma(tWar, (t, u) => {
    oficinaW(t, u, () => {
      obj('escritorio', { x: sx(-120), y: PISO + 60, t, k: 1.0 });
      const a = { t, x: sx(250), y: PISO + 50, k: 1.1, giro: 0.5, cara: 'apretada', mira: [0.7, 0.2], manoD: [90, -170] };
      per('angela', a); enMano(a, 'manoD', 'carpeta', { k: 0.45, dy: 20 });
    });
    etiqueta('WARWICK · TESTAMENTO DE 1986', ent(t, tWar + 0.5), { tam: V ? 44 : 52 });
  });
  toma(tNuevo, (t, u) => {
    const P = V ? [[CX - 245, 1080], [CX + 245, 1080]] : [[CX - 330, 960], [CX + 330, 960]], k = V ? 1.55 : 2.4;
    inserto(t, [{ id: 'original', x: P[0][0], y: P[0][1], k, rot: -3 }, { id: 'testamento', x: P[1][0], y: P[1][1], k, rot: 3 }]);
    texto('ORIGINAL · 1986', P[0][0], P[0][1] - 200 * ESC * k - 40, 1, { tam: V ? 34 : 44, color: '#ffe7a8' }); texto('NUEVO', P[1][0], P[1][1] - 200 * ESC * k - 40, 1, { tam: V ? 34 : 44, color: '#ffb4a2' });
    const kk = ESC * k; aro(P[1][0] + 5 * kk, P[1][1] - 134 * kk, 34 * kk, ent(t, tNuevo + 0.6, 0.3));
    sello('NADA', P[1][0], P[1][1] - 90 * kk, ent(t, tNi + 0.4, 0.25), { tam: V ? 70 : 84 });
  });
})();
