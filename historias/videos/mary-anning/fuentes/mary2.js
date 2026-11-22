/* Parte 2 · El alquiler y el cuello largo (S08–S12). */
const copiasDibujo = (t, t0) => {
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = suave((t - t0 - i * 0.22) / 0.7), ang = (i - (n - 1) / 2) * 0.32, r = (V ? 300 : 520) * a;
    H.obj('dibujo').dibujar(g, { x: CX + Math.sin(ang) * r * 1.2, y: (V ? 860 : 660) - Math.cos(ang) * r * 0.55 + 140, rot: ang * 22, t, escala: ESC * (V ? 1.25 : 1.4), trazo: 1 });
  }
};
const ruta = (t, t0) => {
  const pts = V ? [[300, 1000], [620, 760], [760, 470]] : [[480, 700], [960, 520], [1460, 300]], nombres = ['LYME REGIS', 'LONDRES', 'PARÍS'];
  const u = cl((t - t0) / 2.2), seg = u * 2, i = Math.min(1, Math.floor(seg)), f = seg - i;
  g.save(); g.setLineDash([18, 16]); g.lineWidth = 8; g.strokeStyle = 'rgba(255,231,168,0.85)'; g.beginPath(); g.moveTo(...pts[0]); g.lineTo(...pts[1]); g.lineTo(...pts[2]); g.stroke(); g.restore();
  pts.forEach(([x, y], k) => { g.save(); g.fillStyle = k === 2 ? '#ffd54a' : '#ffe7a8'; g.strokeStyle = C.LINEA; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 16, 0, TAU); g.fill(); g.stroke(); g.font = `800 ${V ? 50 : 54}px ${C.FUENTE}`; g.textAlign = 'center'; g.lineWidth = 12; g.strokeText(nombres[k], x, y - 44); g.fillStyle = '#fff'; g.fillText(nombres[k], x, y - 44); g.restore(); });
  const p = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
  H.obj('sobre').dibujar(g, { x: p[0], y: p[1] + 40, t, escala: 1.1, rot: Math.sin(t * 3) * 6 });
};
(() => {
  const tTorm = T('Después de una tormenta'), tCome = T('se come un pedazo'), tApar = T('Los fósiles aparecen.'), tMarea = T('Mary tiene que llegar'), tSi = T('Si encuentra algo que valga'), tNo = T('Si no, venden otro mueble.');
  const caen = (t, t0, x0, n = 6) => { for (let i = 0; i < n; i++) { const d = t - t0 - i * 0.12; if (d < 0) continue; const y = Math.min(PISO + 40 - C.hash(i) * 30, PISO - AC.alto + 60 + d * d * 1600); H.obj(i % 2 ? 'roca' : 'roca_c').dibujar(G, { x: x0 + (C.hash(i * 3) - 0.5) * 260, y, t, escala: 0.3 + C.hash(i * 7) * 0.25, rot: d * 120 * (C.hash(i) - 0.5) }); } };
  toma(tTorm, (t, u) => {
    const temb = cl(1 - Math.abs(t - tCome - 0.6) / 1.2) * 14;
    escena(LUG.playa_nub, { t, px: u * 22, z: 1, temblor: temb, marea: 0.3 }, () => {
      caen(t, tCome + 0.2, sx(-260) + u * 22);
      polvo(sx(-260) + u * 22, PISO - 40, cl((t - tCome - 0.5) / 0.4) * (1 - cl((t - tCome - 2) / 1.5)), 220);
      const m = { t, x: sx(180) + u * 22, y: PISO + 30, k: 1.0, giro: -0.6, pose: t < tCome + 0.4 ? C.caminar(t, { dir: -1 }) : { cab: -6 }, cara: t > tCome + 0.4 ? 'miedo' : 'neutral', manoD: [55, -100], pelo: [-12, 0] };
      per('mary', m); enMano(m, 'manoD', 'canasta', { k: 0.42, dy: 70 });
      if (t > tApar) [-120, 30, 160].forEach((dx, i) => obj(i === 1 ? 'amonita_g' : 'amonita', { x: sx(-280 + dx) + u * 22, y: PISO + 70 + i * 12, t, k: 0.5 * ent(t, tApar + i * 0.3, 0.3) + 0.001 }));
    });
    C.lluvia(g, t, { k: 0.6 });
  });
  toma(tMarea, (t, u) => {
    const temb = cl(1 - Math.abs(t - tMarea - 2.4) / 0.6) * 10;
    escena(LUG.playa_nub, { t, px: 300, z: 1.05, marea: 0.35 + cl(u / 8) * 0.45, temblor: temb }, () => {
      caen(t, tMarea + 2.0, sx(-420) + 300, 4);
      const golpe = Math.max(0, Math.sin(t * 8)), o = { t, x: sx(-40) + 300, y: PISO + 40, k: 1.05, giro: 0.6, pose: { suelo: true, tor: 20, cab: 8 }, cara: 'apretada', mira: [0.9, 0.5], manoD: [125 + golpe * 25, -150 + golpe * 60], pelo: [-10, 0] };
      per('mary', o); enMano(o, 'manoD', 'martillo', { k: 0.9, rot: 20 + golpe * 90 });
      obj('canasta', { x: sx(-260) + 300, y: PISO + 70, t, k: 0.75, lleno: t > tSi ? 1 : 0.4 });
    });
    C.lluvia(g, t, { k: 0.5 });
    sello('ALQUILER ✓', V ? CX : CX - 360, V ? 400 : 260, ent(t, tSi + 0.4, 0.25), { color: '#2f8a4f', rot: -6 });
    sello('OTRO MUEBLE ✗', V ? CX : CX + 360, V ? 540 : 260, ent(t, tNo + 0.3, 0.25), { color: '#d8432f', rot: 5 });
  });

  const tVeinte = T('En mil ochocientos veinte, no lo encuentra.'), tDoce = T('Casi doce meses'), tSin = T('Sin fósiles, no hay dinero.'), tVenden = T('Los Anning empiezan a vender');
  toma(tVeinte, (t, u) => {
    escena(LUG.playa_tarde, { t, px: u * 8, z: 1 + u * 0.015, fx: sx(0) }, () => {
      const m = { t, x: sx(0), y: PISO + 40, k: 1.2, giro: 0.2, cara: 'triste', mira: [0.2, 0.7], manoD: [55, -100], pelo: [-10, 0] };
      per('mary', m); enMano(m, 'manoD', 'canasta', { k: 0.42, dy: 70, lleno: 0 });
    });
    etiqueta('1820', ent(t, tVeinte + 0.2));
    titular('CASI 12 MESES SIN NADA', ent(t, tDoce), { tam: V ? 66 : 88 });
  });
  toma(tSin, (t, u) => {
    const sale = cl((t - tSin) / 4.5);
    escena(LUG.casa, { t, px: 0, z: 1 }, () => {
      obj('ventana', { x: sx(-420), y: PISO - 330, t, k: 0.8 });
      per('molly', { t, x: sx(-200), y: PISO + 30, k: 1.1, giro: 0.5, cara: 'triste', mira: [1, 0] });
      const c = { t, x: sx(120) + sale * (V ? 520 : 900), y: PISO + 30, k: 1.05, giro: 0.8, pose: C.caminar(t, { dir: 1, amp: 0.6 }), manoD: [80, -150], manoI: [-20, -150] };
      silueta(() => { per('socio', c); obj('silla', { x: c.x + 60 * ESC, y: PISO + 30 - 40 * ESC, t, k: 0.8 }); }, 0.8);
    });
  });
  toma(tVenden, (t, u) => {
    escena(LUG.casa, { t, px: u * 6, z: 1.04 + u * 0.01 }, () => {
      g.save(); g.fillStyle = 'rgba(255,255,255,0.13)'; for (const dx of [-120, 260]) g.fillRect(sx(dx) - 90, PISO - 420, 180, 260); g.restore();
      obj('ventana', { x: sx(-420), y: PISO - 330, t, k: 0.8 });
      per('molly', { t, x: sx(200), y: PISO + 30, k: 1.1, giro: -0.4, cara: 'triste', mira: [-0.6, 0.5] });
      const m = { t, x: sx(-150), y: PISO + 40, k: 1.05, giro: 0.3, pose: { suelo: true, cab: 10 }, cara: 'triste', mira: [0.2, 0.8], manoD: [40, -110], manoI: [-40, -110] };
      per('mary', m); obj('hueso', { x: sx(-150), y: PISO + 40 - 0 * ESC, t, k: 0.75, trazo: 1 });
    });
  });

  const tBirch = T('Un coronel, Thomas Birch'), tRaro = T('Y hace algo muy raro'), tCuat = T('Reúne más de cuatrocientas libras.');
  toma(tBirch, (t, u) => {
    escena(LUG.estudio, { t, px: u * 6, z: 1.05 + u * 0.01, fx: sx(0) }, () => {
      obj('lampara', { x: sx(-380), y: PISO + 20, t, k: 0.9 });
      const b = { t, x: sx(0), y: PISO + 40, k: 1.3, giro: 0.2, cara: C.mezclarCara2('neutral', 'triste', ent(t, tBirch + 2.5, 0.6)), mira: [0.1, 0.7], manoD: [40, -150], manoI: [-40, -150], pose: { cab: 8 } };
      per('birch', b); H.obj('carta').dibujar(g, { x: b.x, y: b.y - 66 * ESC * KP(b), t, escala: ESC * KP(b) * 0.72 });
    });
    titular('CORONEL THOMAS BIRCH', ent(t, tBirch + 0.3), { tam: V ? 64 : 84 });
  });
  toma(tRaro, (t, u) => {
    const golpes = [T('vende su colección entera'), T('en una subasta en Londres')];
    escena(LUG.subasta, { t, px: u * 5, z: 1 + u * 0.006 }, () => {
      [-470, -330, 330, 470].forEach((dx, i) => silueta(() => obj('silla', { x: sx(dx), y: PISO + 90, t, k: 0.85, dentro: [(gg, a) => H.per(i % 2 ? 'clerigo' : 'socio').dibujar(gg, { ...a, t: t + i, giro: dx < 0 ? 0.5 : -0.5, pose: { sentado: true, pi: [10, 0], pd: [10, 0] } })] }), 0.8));
      obj('escritorio', { x: sx(0), y: PISO - 20, t, k: 0.85, dentro: [(gg, a) => H.per('henley').dibujar(gg, { ...a, t, cara: 'feliz', manoD: [120 + Math.max(0, Math.sin((t - golpes[1]) * 5)) * 20, -280] })] });
      per('birch', { t, x: sx(V ? 380 : 230), y: PISO + 40, k: 1.0, giro: -0.4, cara: 'tranquila' });
      obj('mesa', { x: sx(-60), y: PISO + 120, t, k: 0.8 });
      const top = PISO + 120 - 150 * ESC * 0.8;
      obj('craneo', { x: sx(-90), y: top, t, k: 0.38 }); obj('amonita_g', { x: sx(40), y: top, t, k: 0.4 });
    });
    etiqueta('SUBASTA · LONDRES', ent(t, golpes[1]));
  });
  toma(tCuat, (t, u) => {
    escena(LUG.subasta, { t, px: 200, z: 1 }, () => {
      obj('mesa', { x: sx(0), y: PISO + 300, t, k: 1.7 });
      obj('monedas', { x: sx(-40), y: PISO + 300 - 150 * ESC * 1.7, t, k: 1.6, cuantas: 3 + Math.min(15, u * 9) });
      obj('sobre', { x: sx(220), y: PISO + 300 - 150 * ESC * 1.7, t, k: 0.9 });
    });
    titular('+400 LIBRAS', ent(t, tCuat + 0.3), { color: '#ffe7a8' });
  });

  const tResp = T('Con eso, la familia respira.'), tOtros = T('van compradores de otros países');
  toma(tResp, (t, u) => {
    escena(LUG.casa, { t, px: u * 6, z: 1 + u * 0.01 }, () => {
      obj('ventana', { x: sx(-420), y: PISO - 330, t, k: 0.8 });
      obj('silla', { x: sx(400), y: PISO + 10, t, k: 0.9 });
      per('molly', { t, x: sx(-150), y: PISO + 40, k: 1.1, giro: 0.35, cara: 'tranquila' });
      per('mary', { t, x: sx(140), y: PISO + 40, k: 1.12, giro: -0.35, cara: 'feliz' });
    });
  });
  toma(tOtros, (t, u) => {
    escena(LUG.subasta, { t, px: u * 8, z: 1 }, () => {
      silueta(() => { [-380, -150, 150, 380].forEach((dx, i) => per(i % 2 ? 'socio' : 'clerigo', { t: t + i, x: sx(dx), y: PISO + 40, k: 1.05, giro: dx < 0 ? 0.5 : -0.5, manoD: i === 1 ? [70, -170] : undefined })); }, 0.78);
      H.obj('carta').dibujar(g, { x: sx(-150) + 70 * ESC * KP({ k: 1.05 }), y: PISO + 40 - 140 * ESC * KP({ k: 1.05 }), t, escala: ESC * 0.8 });
    });
    titular('ANNING', ent(t, T('el apellido Anning')), { tam: V ? 120 : 140, color: '#ffe7a8' });
  });

  const tTres = T('Tres años después, diez de diciembre'), tCompleto = T('nadie había visto uno completo.'), tHall = T('Es su hallazgo más importante'), tMide = T('Mary lo mide, lo dibuja'), tEscribe = T('le escribe a un caballero'), tCirc = T('Ese dibujo empieza a circular'), tParis = T('Hasta llegar a París.');
  toma(tTres, (t, u) => {
    const rev = suave((t - tTres - 1) / 14);
    escena(LUG.playa_nub, { t, px: 120 + u * 4, z: 1, marea: 0.25 }, () => {
      obj('plesio', { x: sx(V ? 120 : 160), y: PISO + (V ? -50 : 80), t, k: V ? 0.48 : 0.62, revela: rev });
      const golpe = Math.max(0, Math.sin(t * 7)), o = { t, x: sx(-420) + 120, y: PISO + 40, k: 0.95, giro: 0.6, pose: { suelo: true, tor: 18, cab: 8 }, cara: 'apretada', mira: [0.9, 0.4], manoD: [125 + golpe * 25, -150 + golpe * 60], pelo: [-10, 0] };
      per('mary', o); enMano(o, 'manoD', 'martillo', { k: 0.9, rot: 20 + golpe * 90 });
    });
    C.niebla(g, t, { k: 0.5, y: PISO - 200 });
    etiqueta('10 DIC 1823', ent(t, tTres + 0.3));
    aro(sx(V ? 120 : 160) - 120, PISO - 100, V ? 380 : 520, ent(t, tCompleto, 0.4));
  });
  toma(tHall, (t, u) => {
    escena(LUG.playa_nub, { t, px: 120 - u * 10, z: 1, marea: 0.25 }, () => {
      obj('plesio', { x: sx(V ? 120 : 160), y: PISO + (V ? -50 : 80), t, k: V ? 0.48 : 0.62, revela: 1 });
      per('mary', { t, x: sx(-430), y: PISO + 40, k: 1.05, giro: 0.6, cara: C.mezclarCara2('sorpresa', 'feliz', ent(t, tHall + 1.2, 0.6)), mira: [0.9, 0.2], manoD: [55, -100] });
    });
  });
  toma(tMide, (t, u) => {
    if (u < 1.4) escribiendo(t, 'mary', 'dibujo');
    else if (t < tEscribe) inserto(t, [{ id: 'dibujo', trazo: suave((u - 1.4) / Math.max(1, tEscribe - tMide - 1.8)) }]);
    else { const e = t - tEscribe; inserto(t, [{ id: 'dibujo', x: V ? CX - 170 : CX - 380, y: V ? 860 : 860, k: V ? 1.6 : 2.2, rot: -6 }, { id: 'carta', x: V ? CX + 150 : CX + 330, y: V ? 1200 : 900, k: V ? 1.9 : 2.3, rot: 4, trazo: suave(e / 3) }]); if (e > 3.2) H.obj('sobre').dibujar(g, { x: V ? CX + 150 : CX + 330, y: (V ? 1260 : 960) - 20 * suave((e - 3.2) / 0.5), t, escala: ESC * 1.5 }); }
  });
  toma(tCirc, (t, u) => {
    escena(LUG.estudio, { t, px: 0, z: 1 }, () => {});
    oscuro(0.45);
    copiasDibujo(t, tCirc + 0.2);
  });
  toma(tParis, (t, u) => {
    escena(LUG.estudio, { t, px: 0, z: 1 }, () => {});
    oscuro(0.62);
    ruta(t, tParis);
  });
})();
