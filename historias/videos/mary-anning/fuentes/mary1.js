/* Parte 1 · El rayo y el primer esqueleto (S01–S07). Cada toma empieza en la frase del guion que la abre. */
(() => {
  const tRayo = T('cae sobre un árbol'), tMuertas = T('y mata a tres mujeres'), tBebe = T('Una de ellas cargaba'), tVive = T('La bebé sobrevive.');
  const mujer = (x, k, o = {}) => per('vecina', { x, y: PISO, k, ...o });
  toma(0, t => {
    escena(LUG.tormenta, { t, px: t * 8, z: 1 + t * 0.012, fx: sx(80) }, () => {
      obj('olmo', { x: sx(170), y: PISO - 10, t, k: 0.95 });
      silueta(() => { mujer(sx(-250), 0.95, { t, giro: 0.4 }); mujer(sx(-120), 0.95, { t: t + 2, giro: 0.2 }); }, 0.75);
      cargaBebe('vecina', { t, x: sx(60), y: PISO, k: 1.05, giro: -0.2, cara: 'neutral', pelo: [8, 0] });
    });
    C.lluvia(g, t, { k: 0.8, n: 260 });
    rayo(sx(140), -20, sx(170) + 10, PISO - 760 * ESC * 0.95 * 0.75, cl(1 - Math.abs(t - tRayo - 0.08) / 0.18));
    C.destello(g, t, tRayo, { fuerza: 0.6 });
    etiqueta('19 AGO 1800', ent(t, 0.4) * (1 - ent(t, tRayo - 0.1, 0.1)));
  });
  toma(tMuertas, (t, u) => {
    escena(LUG.campo, { t, px: -u * 10, z: 1 }, () => {
      obj('olmo', { x: sx(220), y: PISO - 60, t, k: 0.55 });
      silueta(() => { for (const [dx, k] of [[-40, 0.36], [90, 0.36], [180, 0.36]]) { G.save(); G.translate(sx(dx), PISO + 30 + dx * 0.05); G.rotate(-Math.PI / 2); H.per('vecina').dibujar(G, { t, x: 0, y: 0, escala: ESC * k, sombra: false, vivo: false, sinParpadeo: true, cara: 'dormida' }); G.restore(); } }, 0.7);
    });
    C.destello(g, t, tMuertas - 0.02, { fuerza: 0.35, baja: 0.6 });
  });
  toma(tBebe, (t, u) => {
    escena(LUG.campo, { t, px: 0, z: 1.0 + u * 0.01 }, () => {
      const vive = ent(t, tVive, 0.5), mov = vive * Math.sin(t * 6) * 0.04;
      g.save(); g.translate(sx(0), PISO + 60); g.rotate(mov); H.obj('bebe').dibujar(g, { x: 0, y: 0, t, escala: ESC * 1.9 }); g.restore();
    });
    const a = ent(t, tVive, 0.8); if (a > 0) { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(sx(0), PISO - 40, 20, sx(0), PISO - 40, 520); gr.addColorStop(0, `rgba(255,236,180,${0.45 * a})`); gr.addColorStop(1, 'rgba(255,236,180,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, HH); g.restore(); }
  });

  const tNombre = T('Se llama Mary Anning.'), tDesp = T('Veintitrés años después'), tFraude = T('es un fraude.', { vez: 1 }), tSala = T('Y la sala donde lo discutan');
  toma(tNombre, (t, u) => {
    escena(LUG.playa, { t, px: u * 12, z: 1.05 + u * 0.02, fx: sx(-60) }, () => {
      obj('canasta', { x: sx(-260), y: PISO + 30, t, k: 0.8, lleno: 1 });
      per('mary', { t, x: sx(-60), y: PISO + 40, k: 1.35, giro: 0.3, cara: 'tranquila', mira: [0.4, -0.1], pelo: [10, 0], manoD: [58, -100] });
      enMano({ t, x: sx(-60), y: PISO + 40, k: 1.35, manoD: [58, -100] }, 'manoD', 'martillo', { rot: 165 });
    });
    titular('MARY ANNING', ent(t, tNombre + 0.2, 0.5));
  });
  toma(tDesp, (t, u) => {
    const llamas = [[sx(-380), PISO - 200], [sx(380), PISO - 200]];
    escena(LUG.sala, { t, px: u * 6, z: 1 + u * 0.015, focos: llamas.map(([x, y]) => ({ x, y: y - 130, r: 520, fuerza: 0.9 })) }, () => {
      silueta(() => { [-340, -170, 170, 340].forEach((dx, i) => per(i % 2 ? 'socio' : 'clerigo', { t: t + i, x: sx(dx), y: PISO - 20, k: 1.0, giro: dx < 0 ? 0.4 : -0.4 })); }, 0.85);
      obj('mesa_sala', { x: sx(0), y: PISO + 60, t, k: 0.7 });
      obj('plesio_mesa', { x: sx(0), y: PISO + 60 - 160 * ESC * 0.7 + 4, t, k: 0.34 });
      llamas.forEach(([x, y]) => obj('vela', { x, y: PISO + 60 - 160 * ESC * 0.7, t, k: 0.8 }));
    });
    etiqueta('1823', ent(t, tDesp + 0.1));
    if (tFraude) sello('¿FRAUDE?', CX, V ? 760 : 400, ent(t, tFraude, 0.25));
  });
  toma(tSala, (t, u) => {
    escena(LUG.pasillo, { t, px: -u * 8, z: 1 + u * 0.02, fx: sx(120), focos: [{ x: sx(160), y: PISO - 10, r: 300, fuerza: 0.6 }] }, () => {
      obj('puerta', { x: sx(170), y: PISO, t, k: 1.0, abierta: 0 });
      per('mary', { t, x: sx(-190), y: PISO + 20, k: 1.0, giro: 0.6, cara: 'triste', mira: [0.8, 0] });
    });
  });

  const tPobre = T('Mary nace en una familia pobre.'), tCarp = T('Su papá es carpintero'), tCur = T('Les dicen curiosidades.'), tHerm = T('Y lleva el nombre de su hermana mayor'), tDiez = T('De diez hijos');
  toma(tPobre, (t, u) => {
    escena(LUG.casa, { t, px: u * 6, z: 1 + u * 0.01 }, () => {
      obj('ventana', { x: sx(-420), y: PISO - 330, t, k: 0.8 });
      obj('silla', { x: sx(400), y: PISO + 10, t, k: 0.9 });
      cargaBebe('molly', { t, x: sx(-110), y: PISO + 20, k: 1.1, giro: 0.35, cara: 'tranquila', mira: [0, 0.4] });
      per('richard', { t, x: sx(170), y: PISO + 20, k: 1.12, giro: -0.35, cara: 'feliz', mira: [-0.6, 0.2] });
    });
  });
  toma(tCarp, (t, u) => {
    const km = 0.85, top = PISO + 40 - 150 * ESC * km;
    escena(LUG.playa, { t, px: u * 10, z: 1 + u * 0.01 }, () => {
      per('joseph', { t, x: sx(330), y: PISO + 10, k: 0.75, giro: -0.3, cara: 'feliz' });
      per('mary_nina', { t, x: sx(420), y: PISO + 10, k: 0.7, giro: -0.4, cara: 'tranquila' });
      per('richard', { t, x: sx(70), y: PISO + 10, k: 1.0, giro: -0.2, cara: 'feliz', mira: [-0.6, 0] });
      obj('mesa', { x: sx(40), y: PISO + 40, t, k: km });
      [[-120, 'amonita'], [-30, 'amonita_g'], [70, 'amonita'], [150, 'amonita']].forEach(([dx, id]) => obj(id, { x: sx(40) + dx * ESC * km * 0.9, y: top, t, k: 0.55 }));
      const tu = { t, x: sx(-300), y: PISO + 20, k: 1.0, giro: 0.5, cara: 'feliz', manoD: [110, -170] };
      per('socio', tu); enMano(tu, 'manoD', 'monedas', { k: 0.45, cuantas: 3 });
    });
    etiqueta('LYME REGIS', ent(t, tCarp + 0.2));
  });
  toma(tCur, (t, u) => {
    escena(LUG.playa, { t, px: 260 + u * 14, z: 1 }, () => {
      const km = 2.2, top = PISO + 300 - 150 * ESC * km * 0.55;
      obj('mesa', { x: sx(0), y: PISO + 300, t, k: km * 0.55 });
      [[-200, 'amonita_g', 0.9], [-30, 'amonita', 1.1], [140, 'amonita_g', 0.8]].forEach(([dx, id, k]) => obj(id, { x: sx(dx), y: top, t, k }));
    });
    titular('CURIOSIDADES', ent(t, tCur + 0.1));
  });
  toma(tHerm, (t, u) => {
    const vx = sx(110), vy = PISO - 130;
    escena(LUG.casa_noche, { t, px: u * 5, z: 1 + u * 0.012, focos: [{ x: sx(-330), y: PISO - 300, r: 600, fuerza: 0.7 }] }, () => {
      obj('cama_nina', { x: sx(240), y: PISO + 30, t, k: 0.75 });
      obj('mesa', { x: vx - 40, y: PISO + 20, t, k: 0.5 });
      obj('vela', { x: vx - 40, y: PISO + 20 - 150 * ESC * 0.5, t, k: 0.8, encendida: 0 });
      obj('vela', { x: sx(-330), y: PISO - 220, t, k: 0.0001, encendida: 0 });
      cargaBebe('molly', { t, x: sx(-300), y: PISO + 30, k: 1.08, giro: 0.4, cara: 'triste', mira: [0.7, 0.1] });
    });
  });
  toma(tDiez, (t, u) => {
    const km = 0.82, top = PISO + 60 - 160 * ESC * km;
    const focos = [];
    escena(LUG.casa_noche, { t, px: 0, z: 1, focos }, () => {
      per('mary_nina', { t, x: sx(-110), y: PISO - 30, k: 1.0, cara: 'triste' });
      per('joseph', { t, x: sx(110), y: PISO - 30, k: 1.05, cara: 'triste' });
      obj('mesa_sala', { x: sx(0), y: PISO + 60, t, k: km });
      for (let i = 0; i < 10; i++) {
        const x = sx((i - 4.5) * 92), vive = i === 3 || i === 6, off = vive ? 1 : 1 - ent(t, tDiez + 0.6 + [0, 1, 2, 9, 3, 4, 9, 5, 6, 7][i] * 0.22, 0.12);
        obj('vela', { x, y: top, t: t + i, k: V ? 0.6 : 0.85, encendida: off > 0.5 ? 1 : 0 });
      }
    });
    titular('10 HIJOS · 2 SOBREVIVEN', ent(t, tDiez + 1.0), { tam: V ? 70 : 92 });
  });

  const tOnce = T('Cuando Mary tiene once años'), tRes = T('resbala de noche'), tLast = T('Se lastima,'), tDeu = T('Deja deudas'), tPide = T('Su mamá le pide'), tSalen = T('Mary y su hermano Joseph salen'), tParr = T('la parroquia les da');
  toma(tOnce, (t, u) => {
    const top = PISO - (V ? 640 : 400), borde = V ? W * 0.38 + 30 : W * 0.38 + 40, x0 = V ? W * 0.9 : W * 0.78, tc = tRes + 0.9;
    const cae = cl((t - tc) / 0.7), x = Math.max(borde, x0 - u * (V ? 40 : 75));
    escena(LUG.noche, { t, px: 0, z: 1 }, () => {
      per('richard', { t, x: x - cae * 40, y: top + 14 + cae * cae * 380, k: 0.62, giro: -0.9, pose: cae > 0 ? { bi: [-60, -30], bd: [60, -30] } : (x > borde ? C.caminar(t, { dir: -1 }) : {}), cara: cae > 0 ? 'terror' : t > tc - 0.4 ? 'miedo' : 'neutral', sombra: cae <= 0 });
      if (cae > 0) polvo(borde, top + 20, (1 - cae) * 0.8, 60);
    });
    etiqueta('1810', ent(t, tOnce + 0.2));
    oscuro(cl((t - tc - 0.35) / 0.35));
  });
  toma(tLast, (t, u) => {
    escena(LUG.casa_noche, { t, px: u * 4, z: 1 + u * 0.01, focos: [{ x: sx(330), y: PISO - 300, r: 560, fuerza: 0.9 }] }, () => {
      obj('cama', { x: sx(V ? 60 : 80), y: PISO + 40, t, k: V ? 0.75 : 0.9, dentro: [(gg, a) => H.per('richard').dibujar(gg, { ...a, t, cara: 'dolor', sombra: false })] });
      per('mary_nina', { t, x: sx(-560), y: PISO + 60, k: 0.85, giro: 0.5, cara: 'triste' });
      per('joseph', { t, x: sx(-460), y: PISO + 60, k: 0.9, giro: 0.5, cara: 'triste' });
      per('molly', { t, x: sx(330), y: PISO + 40, k: 1.0, giro: -0.4, cara: 'triste', mira: [-0.6, 0.3] });
      obj('vela', { x: sx(330), y: PISO - 170, t, k: 0.0001 });
    });
  });
  toma(tDeu, (t, u) => {
    escena(LUG.casa_noche, { t, px: 0, z: 1 + u * 0.02, focos: [{ x: sx(260), y: PISO - 120, r: 520, fuerza: 1 }] }, () => {
      obj('mesa', { x: sx(0), y: PISO + 260, t, k: 1.55 });
      const top = PISO + 260 - 150 * ESC * 1.55;
      obj('deudas', { x: sx(-40), y: top, t, k: 1.1, abierto: 1 });
      obj('vela', { x: sx(260), y: top, t, k: 1.0 });
    });
    titular('DEUDAS', ent(t, tDeu + 0.2), { color: '#ffb4a2' });
  });
  toma(tPide, (t, u) => {
    escena(LUG.casa, { t, px: u * 6, z: 1.05 + u * 0.01 }, () => {
      obj('ventana', { x: sx(-460), y: PISO - 330, t, k: 0.8 });
      per('molly', { t, x: sx(-150), y: PISO + 40, k: 1.2, giro: 0.45, cara: 'triste', mira: [0.6, 0.4], manoD: [120, -170] });
      per('mary_nina', { t, x: sx(170), y: PISO + 40, k: 0.95, giro: -0.45, cara: C.mezclarCara2('triste', 'apretada', ent(t, tPide + 2.2, 0.6)), mira: [-0.6, -0.4] });
    });
  });
  toma(tSalen, (t, u) => {
    const px = u * 50;
    escena(LUG.playa, { t, px, z: 1 }, () => {
      const m = { t, x: sx(-60) + px * 0.9, y: PISO + 20, k: 0.92, giro: 0.8, pose: C.caminar(t, { dir: 1, amp: 0.7 }), cara: 'neutral', manoI: [-55, -100] };
      const j = { t: t + 0.4, x: sx(140) + px * 0.9, y: PISO + 20, k: 0.98, giro: 0.8, pose: C.caminar(t + 0.4, { dir: 1, amp: 0.7 }), cara: 'neutral', manoD: [55, -100] };
      per('mary_nina', m); enMano(m, 'manoI', 'canasta', { k: 0.42, dy: 70 });
      per('joseph', j); enMano(j, 'manoD', 'martillo', { k: 0.8, rot: 20 });
    });
    etiqueta('AYUDA DE LA PARROQUIA', ent(t, tParr), { tam: V ? 50 : 54 });
  });

  const tOtono = T('Otoño de mil ochocientos once.'), tAsoma = T('asomando entre las rocas'), tLargo = T('un cráneo largo'), tCoco = T('Creen que es de un cocodrilo.'), tResto = T('Un año después, Mary encuentra'), tTrece = T('Tiene trece años.');
  toma(tOtono, (t, u) => {
    escena(LUG.playa_tarde, { t, px: u * 10, z: 1 + u * 0.012, fx: sx(120) }, () => {
      const a = ent(t, tAsoma, 0.8);
      per('joseph', { t, x: sx(-250), y: PISO + 20, k: 1.0, giro: 0.5, cara: a > 0 ? 'sorpresa' : 'neutral', mira: [0.8, 0.3], manoD: a > 0 ? [150, -240] : [60, -100] });
      g.save(); g.globalAlpha = 0.35 + 0.65 * a; obj('craneo', { x: sx(200), y: PISO + 60 - (1 - a) * 30, t, k: 0.9 }); g.restore();
      obj('roca', { x: sx(390), y: PISO + 80, t, k: 0.6 }); obj('roca_c', { x: sx(40), y: PISO + 90, t, k: 0.6 });
    });
    etiqueta('OTOÑO 1811', ent(t, tOtono + 0.1));
    aro(sx(200) * 1, PISO + 60 - 60 * ESC * 0.9, 300 * ESC * 0.9 * 0.6 * (V ? 0.9 : 1), ent(t, tLargo, 0.4) * (1 - ent(t, tCoco, 0.2)));
    sello('¿COCODRILO?', CX, V ? 720 : 300, ent(t, tCoco, 0.25));
  });
  toma(tResto, (t, u) => {
    const rev = suave((t - tResto - 0.5) / 4.5);
    escena(LUG.playa, { t, px: u * 6, z: 1 + u * 0.01, marea: 0.2 + u * 0.06 }, () => {
      obj('ictio', { x: sx(110), y: PISO + (V ? -50 : 70), t, k: 0.62 * (V ? 0.75 : 1), revela: rev });
      const golpe = Math.max(0, Math.sin(t * 7)), o = { t, x: sx(-330), y: PISO + 30, k: 0.95, giro: 0.6, pose: { suelo: true, tor: 18, cab: 10 }, cara: 'apretada', mira: [0.9, 0.5], manoD: [125 + golpe * 25, -150 + golpe * 60] };
      per('mary_nina', o); enMano(o, 'manoD', 'martillo', { k: 0.9, rot: 20 + golpe * 90 });
    });
    etiqueta('1812', ent(t, tResto + 0.2));
    titular('13 AÑOS', ent(t, tTrece), { y: V ? 560 : 210 });
  });

  const tAnota = T('Desde entonces, Mary anota');
  toma(tAnota, (t, u) => {
    if (u < 1.6) escribiendo(t, 'mary_nina', 'hueso');
    else inserto(t, [{ id: 'hueso', trazo: suave((u - 1.6) / 2.4), k: V ? 2.6 : 2.4 }]);
  });

  const tPaga = T('El señor del pueblo les paga'), tViaja = T('y el esqueleto viaja a Londres.'), tHome = T('Poco después, el cirujano del rey'), tSir = T('sir Everard Home'), tHabla = T('Habla de los huesos.'), tNada = T('De quién los desenterró');
  toma(tPaga, (t, u) => {
    const va = t >= tViaja;
    escena(LUG.playa, { t, px: va ? (t - tViaja) * 40 : u * 8, z: 1 }, () => {
      if (!va) {
        const h = { t, x: sx(-170), y: PISO + 20, k: 1.05, giro: 0.45, cara: 'neutral', manoD: [130, -160] };
        per('molly', { t, x: sx(190), y: PISO + 20, k: 1.0, giro: -0.45, cara: 'tranquila', manoI: [-120, -160] });
        per('henley', h); enMano(h, 'manoD', 'monedas', { k: 0.5, cuantas: 6 });
      } else {
        const x = sx(-200) + (t - tViaja) * 160 * K;
        obj('carreta', { x, y: PISO + 40, t, k: 0.75, giro: (t - tViaja) * 3, dentro: [(gg, a) => H.obj('caja').dibujar(gg, { x: 0, y: 0, t, escala: 0.62 })] });
        per('mary_nina', { t, x: sx(-380), y: PISO + 30, k: 0.85, giro: 0.6, cara: 'triste', mira: [1, 0] });
      }
    });
    titular('23 LIBRAS', ent(t, T('veintitrés libras')) * (va ? 1 - ent(t, tViaja, 0.2) : 1));
  });
  toma(tHome, (t, u) => {
    escena(LUG.estudio, { t, px: u * 6, z: 1 + u * 0.01 }, () => {
      obj('ventana', { x: sx(-420), y: PISO - 330, t, k: 0.8 });
      obj('escritorio', { x: sx(60), y: PISO + 40, t, k: 1.1, dentro: [(gg, a) => H.per('clerigo').dibujar(gg, { ...a, t, cara: 'neutral', pose: { sentado: true, pi: [10, 0], pd: [10, 0], cab: 10 }, mira: [0.3, 0.8] })] });
      obj('libro', { x: sx(110), y: PISO + 40 - 178 * ESC * 1.1, t, k: 0.6, abierto: 1 });
    });
    etiqueta('LONDRES · 1814', ent(t, tHome + 0.2));
    titular('SIR EVERARD HOME', ent(t, tSir), { tam: V ? 72 : 88, y: V ? 470 : 200 });
  });
  toma(tHabla, (t, u) => {
    const k = V ? 2.8 : 3.2, yb = V ? 1060 : 980;
    escena(LUG.estudio, { t, px: 0, z: 1 }, () => {
      obj('mesa', { x: sx(0), y: PISO + 520, t, k: 3 });
      obj('articulo', { x: CX, y: yb, t, k, trazo: 1 });
    });
    aro(CX + 4 * k * ESC, yb - 46 * k * ESC, 60 * k * ESC, ent(t, tHabla + 0.2) * (1 - ent(t, tNada, 0.2)));
    sello('SIN SU NOMBRE', CX, V ? 640 : 300, ent(t, tNada + 0.5, 0.25));
  });
})();
