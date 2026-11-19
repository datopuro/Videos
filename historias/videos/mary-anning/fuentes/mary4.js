/* Parte 4 · El crédito y la hoja (S16b–S19) y cierre del completo. */
(() => {
  const tDeb = T('Tras el debate'), tReal = T('El animal es real.'), tArt = T('Y el artículo que lo describe'), tAmiga = T('Años después, una amiga');
  toma(tDeb, (t, u) => {
    escena(LUG.sala, { t, px: u * 6, z: 1, focos: focosSala() }, () => {
      silueta(() => [-300, 300].forEach((dx, i) => per(i ? 'socio' : 'clerigo', { t: t + i, x: sx(dx), y: PISO - 10, k: 1.0, giro: dx < 0 ? 0.4 : -0.4 })), 0.85);
      salaMesa(t);
      const si = Math.max(0, Math.sin((t - tDeb) * 6)) * 8 * cl(1 - (t - tDeb - 2) / 1);
      per('cuvier', { t, x: sx(V ? -330 : -600), y: PISO + 120, k: 1.15, giro: 0.4, cara: 'tranquila', pose: { cab: si } });
    });
    titular('CUVIER', ent(t, tDeb + 0.3), { tam: V ? 72 : 88 });
    sello('REAL', CX, V ? 700 : 330, ent(t, tReal, 0.25), { color: '#2f8a4f', tam: V ? 110 : 130 });
  });
  toma(tArt, (t, u) => {
    escena(LUG.estudio, { t, px: 0, z: 1 }, () => { obj('mesa', { x: sx(0), y: PISO + 600, t, k: 3.2 }); });
    const k = ESC * (V ? 3.0 : 2.85), x = CX, y = V ? 1060 : 930;
    H.obj('articulo').dibujar(g, { x, y, t, escala: k, trazo: 1 });
    etiqueta('FIRMA: W. D. CONYBEARE', ent(t, T('lo firma Conybeare')), { tam: V ? 50 : 58, y: V ? 420 : 90 });
    const a = ent(t, T('con un dibujo que Mary le mandó'), 0.4);
    aro(x + 4 * k, y - 46 * k, 50 * k, a);
    if (a > 0) C.rotulo(g, 'dibujo: Mary Anning', a, { tam: V ? 44 : 46, y: y - 6 * k, color: '#ffe7a8' });
  });
  toma(tAmiga, (t, u) => {
    escena(LUG.casa, { t, px: u * 5, z: 1 + u * 0.01 }, () => {
      obj('ventana', { x: sx(-460), y: PISO - 330, t, k: 0.8 });
      per('amiga', { t, x: sx(-220), y: PISO + 40, k: 1.1, giro: 0.4, cara: C.mezclarCara2('neutral', 'triste', ent(t, tAmiga + 4, 0.6)), mira: [0.7, 0.2] });
      per('mary', { t, x: sx(250), y: PISO + 40, k: 1.12, giro: -0.4, cara: 'triste', mira: [-0.6, 0.6], manoI: [-110, -150] });
      obj('mesa', { x: sx(40), y: PISO + 140, t, k: 0.75 });
      obj('libro', { x: sx(40), y: PISO + 140 - 150 * ESC * 0.75, t, k: 0.7, abierto: 0 });
    });
    titular('ANNA PINNEY, SU AMIGA', ent(t, tAmiga + 0.4), { tam: V ? 60 : 80 });
  });

  const tSigue = T('Mary sigue yendo al acantilado.'), tDerr = T('un derrumbe mata a Tray'), tCarta = T('En una carta cuenta'), tMuere = T('Y el nueve de marzo'), tCuar = T('Tiene cuarenta y siete años.');
  toma(tSigue, (t, u) => {
    const tc = tDerr + 0.5, para = Math.min(t, tc + 0.2), px = (para - tSigue) * 50;
    escena(LUG.playa, { t, px, z: 1, temblor: cl(1 - Math.abs(t - tc - 0.4) / 1) * 14 }, () => {
      const anda = t < tc;
      const xd = sx(V ? -20 : -60) + px * 0.95;
      if (t < tc + 0.5) H.obj('tray').dibujar(G, { x: xd, y: PISO + 70, t, escala: ESC * 0.75, camina: anda, espejo: false });
      for (let i = 0; i < 7; i++) { const d = t - tc - i * 0.07; if (d < 0) continue; const y = Math.min(PISO + 60 - C.hash(i) * 50, PISO - AC.alto + 80 + d * d * 1800); H.obj(i % 2 ? 'roca' : 'roca_c').dibujar(G, { x: xd + (C.hash(i * 3) - 0.5) * 220, y, t, escala: 0.35 + C.hash(i * 7) * 0.3 }); }
      polvo(xd, PISO + 20, cl((t - tc - 0.3) / 0.3) * (1 - cl((t - tc - 3) / 2)), 240);
      per('mary', { t, x: sx(V ? -380 : -380) + px * 0.95, y: PISO + 40, k: 1.05, giro: anda ? 0.8 : 0.5, pose: anda ? C.caminar(t, { dir: 1, amp: 0.7 }) : { bd: [-80, -20] }, cara: anda ? 'tranquila' : 'terror', mira: [1, 0.2], manoD: anda ? undefined : [150, -200] });
    });
    etiqueta('1833', ent(t, tDerr));
  });
  toma(tCarta, (t, u) => {
    escena(LUG.casa_noche, { t, px: 0, z: 1 + u * 0.015, focos: [{ x: sx(250), y: PISO - 150, r: 560, fuerza: 1 }] }, () => {
      obj('mesa', { x: sx(0), y: PISO + 260, t, k: 1.6 });
      const top = PISO + 260 - 150 * ESC * 1.6;
      obj('carta', { x: sx(-60), y: top, t, k: 1.5, trazo: suave(u / 4) });
      obj('vela', { x: sx(250), y: top, t, k: 1.0 });
    });
  });
  toma(tMuere, (t, u) => {
    escena(LUG.casa_noche, { t, px: u * 4, z: 1 + u * 0.01 }, () => {
      obj('cama', { x: sx(150), y: PISO + 40, t, k: V ? 0.7 : 0.85 });
      obj('mesa', { x: sx(-320), y: PISO + 60, t, k: 0.6 });
      const top = PISO + 60 - 150 * ESC * 0.6;
      obj('dibujo', { x: sx(-350), y: top, t, k: 0.6 }); obj('vela', { x: sx(-240), y: top, t, k: 0.7, encendida: t < tMuere + 2.5 ? 1 : 0 });
    });
    etiqueta('9 MAR 1847', ent(t, tMuere + 0.4));
    titular('47 AÑOS', ent(t, tCuar), { y: V ? 560 : 210 });
    oscuro(0.25 * ent(t, tMuere + 2.5, 1));
  });

  const tAnio = T('Un año después, en esa misma sociedad'), tDLB = T('Henry De la Beche'), tPrim = T('Es la primera vez'), tVent = T('Más tarde, los socios pagan'), tDijo = T('Ese día, la sala dijo'), tYa = T('Mary ya no estaba para oírlo.');
  const salon = (t, z, fx, conVoz) => {
    escena(LUG.sala, { t, px: 0, z, fx, focos: [{ x: sx(0), y: PISO - 350, r: 900, fuerza: 0.7 }] }, () => {
      obj('escritorio', { x: sx(0), y: PISO - 40, t, k: 0.85, dentro: [(gg, a) => H.per('presidente').dibujar(gg, { ...a, t, cara: 'tranquila', manoD: [90, -250] })] });
      [-500, -360, 360, 500].forEach((dx, i) => silueta(() => obj('silla_sala', { x: sx(dx), y: PISO + 120, t, k: 0.85, dentro: [(gg, a) => H.per(i % 2 ? 'socio' : 'clerigo').dibujar(gg, { ...a, t: t + i, giro: dx < 0 ? 0.5 : -0.5, pose: { sentado: true, pi: [10, 0], pd: [10, 0] } })] }), 0.8));
      obj('silla_sala', { x: sx(0), y: PISO + 220, t, k: 0.95 });
    });
    g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(sx(0), PISO + 40, 20, sx(0), PISO + 40, 360); gr.addColorStop(0, 'rgba(255,236,190,0.28)'); gr.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, HH); g.restore();
  };
  toma(tAnio, (t, u) => {
    salon(t, 1 + (t >= tPrim ? (t - tPrim) * 0.035 : 0), sx(0));
    etiqueta('1848', ent(t, tAnio + 0.3));
    titular('HENRY DE LA BECHE', ent(t, tDLB) * (1 - ent(t, tPrim, 0.3)), { tam: V ? 66 : 84 });
  });
  toma(tVent, (t, u) => {
    escena(LUG.iglesia, { t, px: u * 6, z: 1 + u * 0.01 }, () => {
      obj('vitral', { x: sx(0), y: PISO - 80, t, k: V ? 1.0 : 0.82 });
    });
    g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < 3; i++) { const gr = g.createLinearGradient(sx(0), 0, sx(0) + 300, HH); gr.addColorStop(0, `rgba(${['255,210,140', '160,200,255', '255,160,160'][i]},0.16)`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(sx(-80 + i * 60), PISO - 600); g.lineTo(sx(-20 + i * 60), PISO - 600); g.lineTo(sx(300 + i * 160), HH); g.lineTo(sx(100 + i * 160), HH); g.closePath(); g.fill(); } g.restore();
    etiqueta('IGLESIA DE LYME REGIS', ent(t, tVent + 1), { tam: V ? 52 : 58 });
  });
  toma(tDijo, (t, u) => {
    if (t < tYa) salon(t, 1.25 + u * 0.03, sx(0));
    else escena(LUG.sala, { t, px: 0, z: 2.0 + (t - tYa) * 0.06, fx: sx(0), focos: [{ x: sx(0), y: PISO - 200, r: 700, fuerza: 0.8 }] }, () => obj('silla_sala', { x: sx(0), y: PISO + 220, t, k: 0.95 }));
  });

  const tEnse = T('Esos hombres enseñaron'), tApr = T('Lo aprendieron, en buena parte'), tUnico = T('Pero lo único de ella'), tCambio = T('Y esa hoja cambió');
  toma(tEnse, (t, u) => {
    escena(LUG.sala, { t, px: u * 10, z: 1.05, focos: focosSala() }, () => { salaMesa(t); });
  });
  toma(tApr, (t, u) => {
    escena(LUG.playa, { t, px: u * 6, z: 1, marea: 0.3 }, () => {
      obj('ictio', { x: sx(140), y: PISO + (V ? -50 : 70), t, k: V ? 0.45 : 0.6, revela: 1 });
      const golpe = Math.max(0, Math.sin(t * 6)), o = { t, x: sx(-400), y: PISO + 40, k: 1.0, giro: 0.6, pose: { suelo: true, tor: 18, cab: 8 }, cara: 'apretada', mira: [0.9, 0.4], manoD: [125 + golpe * 25, -150 + golpe * 60] };
      per('mary', o); enMano(o, 'manoD', 'martillo', { k: 0.9, rot: 20 + golpe * 90 });
    });
    sepia(0.55);
  });
  toma(tUnico, (t, u) => {
    escena(LUG.sala, { t, px: 0, z: 1 + u * 0.12, fx: sx(V ? -250 : -330), focos: [{ x: sx(V ? -250 : -330), y: PISO - 80, r: 520, fuerza: 1.1 }] }, () => {
      const km = 0.8, top = PISO + 80 - 160 * ESC * km;
      obj('mesa_sala', { x: sx(0), y: PISO + 80, t, k: km });
      obj('dibujo', { x: sx(V ? -250 : -330), y: top, t, k: 0.75 });
      obj('vela', { x: sx(V ? -110 : -170), y: top, t, k: 0.75 });
    });
  });
  toma(tCambio, (t, u) => {
    escena(LUG.museo, { t, px: 0, z: 1 + u * 0.02, fx: sx(0) }, () => {
      obj('vitrina', { x: sx(0), y: PISO + 40, t, k: V ? 0.72 : 0.6, dentro: [(gg, a) => H.obj('dibujo').dibujar(gg, { x: 0, y: -40, t, escala: 1.25 })] });
    });
    g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(sx(0), PISO - 420, 30, sx(0), PISO - 420, 520); gr.addColorStop(0, 'rgba(255,236,190,0.3)'); gr.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, HH); g.restore();
    const a = ent(t, T('podía existir.', { fin: true }) + 0.3, 0.6);
    if (a > 0) { C.rotulo(g, 'Mary Anning', a, { tam: V ? 96 : 104, y: V ? 420 : 140 }); C.rotulo(g, 'Lyme Regis · 1799–1847', a, { tam: V ? 50 : 52, y: V ? 520 : 236, color: '#ffe7a8' }); }
  });
  if (q('Sígueme para no perderte') == null) toma(T('podía existir.', { fin: true }) + 3.0, (t, u) => {
    oscuro(1, '#141019');
    C.rotulo(g, 'Esa Es Otra Historia', ent(t, t - u + 0.1, 0.5), { tam: 96, y: HH * 0.4, color: '#ffe7a8' });
    C.rotulo(g, 'Suscríbete para más historias reales', ent(t, t - u + 0.5, 0.5), { tam: 56, y: HH * 0.56 });
  });
})();
