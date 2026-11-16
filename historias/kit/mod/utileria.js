/* Utilería del canal de historias: objetos bien terminados, con ocupantes que no se salen y colores fijos por historia.
   Referencias:
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/clip : recorte de los ocupantes a la zona interior
     del objeto (por eso los pies no pueden asomar fuera de un bote o un coche).
   https://developer.mozilla.org/docs/Web/API/Canvas_API/Tutorial/Compositing : sombra propia y brillo de cada pieza
     dibujando la misma figura desplazada dentro de su propio recorte.
   https://github.com/luispablovillasenor-afk/shorts-animados-claude (referencias/BIBLIA_DE_ESTILO.md): luz principal
     cálida desde un lado y sombras frías; sombra de contacto bajo cada cosa.
   Convención: origen en el piso, al centro del objeto; "y" negativa hacia arriba (igual que los personajes).
   Capas de cada objeto: atras → ocupantes (recortados) → frente. */
(() => {
  const C = window.C, TAU = Math.PI * 2;
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const tono = (h, k) => `rgb(${rgb(h).map(v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)).join(',')})`;
  const frio = (h, k) => { const [r, g, b] = rgb(h); return `rgb(${Math.round(r * (1 - k))},${Math.round(g * (1 - k * 0.9))},${Math.round(Math.min(255, b * (1 - k * 0.62)))})`; };
  C.tono = tono;
  C.LUZ = C.LUZ || [-0.55, -0.83];

  const forma = (g, camino, color, o = {}) => {
    const s = o.sombra ?? 9, b = o.brillo ?? 5, lw = o.lw ?? C.LW;
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    camino(g); g.fillStyle = color; g.fill();
    if (s || b) {
      g.save(); camino(g); g.clip();
      if (s) { g.fillStyle = frio(color, 0.24); g.fillRect(-5000, -5000, 10000, 10000); g.save(); g.translate(C.LUZ[0] * s, C.LUZ[1] * s); camino(g); g.fillStyle = color; g.fill(); g.restore(); }
      if (b) { g.save(); g.translate(-C.LUZ[0] * b, -C.LUZ[1] * b); camino(g); g.strokeStyle = tono(color, 0.3); g.lineWidth = b * 0.9; g.stroke(); g.restore(); }
      if (o.dentro) o.dentro(g);
      g.restore();
    }
    if (lw) { camino(g); g.lineWidth = lw; g.strokeStyle = C.LINEA; g.stroke(); }
    g.restore();
  };
  const rr = (x, y, w, h, r) => g => { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const poli = pts => g => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); };
  const elip = (x, y, rx, ry) => g => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); };
  const raya = (g, pts, col, w = 3) => { g.save(); g.beginPath(); pts.forEach((p, i) => (i ? (p.length === 4 ? g.quadraticCurveTo(p[0], p[1], p[2], p[3]) : g.lineTo(p[0], p[1])) : g.moveTo(p[0], p[1]))); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); g.restore(); };
  const contacto = (g, x, w, k = 0.26) => { g.save(); g.translate(x, 2); g.scale(1, 0.13); const gr = g.createRadialGradient(0, 0, w * 0.15, 0, 0, w * 0.56); gr.addColorStop(0, `rgba(18,14,34,${k})`); gr.addColorStop(1, 'rgba(18,14,34,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, w * 0.56, 0, TAU); g.fill(); g.restore(); };
  C.forma = forma; C.caminos = { rr, poli, elip }; C.sombraContacto = contacto;

  const TIPOS = {};

  TIPOS.sillon = o => {
    const n = o.plazas || 1, col = o.color || '#b5523b', cj = o.cojin || tono(col, 0.14), pata = o.pata || '#5a3a26';
    const A = 196, B = 54, W = n * A + B * 2, xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * A);
    return {
      ancho: W, anclas: xs.map(x => ({ x, y: 0, escala: 1 })),
      atras(g) {
        contacto(g, 0, W * 1.1);
        for (const s of [-1, 1]) forma(g, poli([[s * (W / 2 - 34), -40], [s * (W / 2 - 14), -40], [s * (W / 2 - 20), 0], [s * (W / 2 - 30), 0]]), pata, { sombra: 3, brillo: 0 });
        forma(g, rr(-W / 2 + 16, -306, W - 32, 250, 44), col, { sombra: 12 });
        for (const x of xs) forma(g, rr(x - A / 2 + 9, -288, A - 18, 190, 30), cj, { sombra: 8, lw: 3.5, dentro: gg => { for (const [dx, dy] of [[-30, -226], [30, -226], [0, -176]]) { gg.beginPath(); gg.arc(x + dx, dy, 4.5, 0, TAU); gg.fillStyle = frio(cj, 0.3); gg.fill(); } } });
        forma(g, rr(-W / 2 + B - 8, -100, W - B * 2 + 16, 66, 12), tono(col, -0.1), { sombra: 7 });
        for (const x of xs) forma(g, rr(x - A / 2 + 5, -124, A - 10, 40, 16), cj, { sombra: 7, lw: 3.5 });
      },
      frente(g) {
        for (const s of [-1, 1]) {
          const x0 = s > 0 ? W / 2 - B - 6 : -W / 2;
          forma(g, rr(x0, -196, B + 6, 164, 24), col, { sombra: 9 });
          forma(g, rr(x0 - 5, -210, B + 16, 46, 22), tono(col, 0.08), { sombra: 6, lw: 3.5 });
          raya(g, [[x0 + 12, -150], [x0 + 12, -52]], frio(col, 0.3), 2.5);
        }
      }
    };
  };

  TIPOS.silla = o => {
    const col = o.color || '#8a5a3b', cj = o.cojin || '#c9b48a';
    return {
      ancho: 150, anclas: [{ x: 0, y: 0, escala: 1 }],
      atras(g) {
        contacto(g, 0, 190, 0.2);
        for (const s of [-1, 1]) forma(g, rr(s * 52 - 8, -296, 16, 296, 6), tono(col, -0.12), { sombra: 4, brillo: 0 });
        for (const y of [-288, -236]) forma(g, rr(-58, y, 116, 30, 10), col, { sombra: 5 });
        for (const x of [-22, 22]) forma(g, rr(x - 6, -214, 12, 112, 5), col, { sombra: 3, brillo: 0, lw: 3.5 });
        forma(g, rr(-70, -106, 140, 22, 9), col, { sombra: 5 });
        forma(g, rr(-62, -118, 124, 20, 10), cj, { sombra: 4, lw: 3.5 });
      },
      frente(g) { for (const s of [-1, 1]) forma(g, rr(s * 60 - 8, -86, 16, 86, 6), col, { sombra: 4, brillo: 3 }); }
    };
  };

  TIPOS.mesa = o => {
    const col = o.color || '#9a6b45', W = o.ancho || 360, H = o.alto || 150;
    return {
      ancho: W, anclas: [], alto: H,
      atras(g) {
        contacto(g, 0, W * 1.05, 0.22);
        for (const s of [-1, 1]) forma(g, poli([[s * (W / 2 - 46), -H + 20], [s * (W / 2 - 22), -H + 20], [s * (W / 2 - 30), 0], [s * (W / 2 - 44), 0]]), tono(col, -0.14), { sombra: 4, brillo: 0 });
        forma(g, rr(-W / 2 + 26, -H + 22, W - 52, 26, 6), tono(col, -0.2), { sombra: 4, brillo: 0, lw: 3.5 });
        forma(g, rr(-W / 2, -H, W, 26, 10), col, { sombra: 6, dentro: gg => { for (let x = -W / 2 + 40; x < W / 2; x += 74) raya(gg, [[x, -H + 6], [x + 34, -H + 6]], frio(col, 0.22), 2); } });
      },
      frente() {}
    };
  };

  TIPOS.lampara = o => {
    const col = o.color || '#e8c46a', metal = o.metal || '#4a4652', H = o.alto || 380, on = o.encendida !== false;
    return {
      ancho: 150, anclas: [],
      atras(g, e) {
        if (on) { const k = 0.92 + 0.08 * Math.sin((e.t || 0) * 2.1); g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(0, -H + 70, 10, 0, -H + 70, 420); gr.addColorStop(0, `rgba(255,224,150,${0.42 * k})`); gr.addColorStop(1, 'rgba(255,224,150,0)'); g.fillStyle = gr; g.fillRect(-460, -H - 360, 920, 860); g.restore(); }
        contacto(g, 0, 150, 0.22);
        forma(g, rr(-46, -14, 92, 14, 7), metal, { sombra: 3 });
        forma(g, rr(-6, -H + 60, 12, H - 70, 5), metal, { sombra: 3, brillo: 3 });
        forma(g, poli([[-44, -H], [44, -H], [72, -H + 96], [-72, -H + 96]]), col, { sombra: 10, dentro: gg => { if (on) { const gr = gg.createLinearGradient(0, -H, 0, -H + 96); gr.addColorStop(0, 'rgba(255,250,220,0)'); gr.addColorStop(1, 'rgba(255,250,220,0.55)'); gg.fillStyle = gr; gg.fillRect(-80, -H, 160, 96); } } });
      },
      frente() {}
    };
  };

  TIPOS.planta = o => {
    const mac = o.maceta || '#c46a43', hoja = o.color || '#3f8f5a', n = o.hojas || 7, esc = o.tam || 1;
    return {
      ancho: 170, anclas: [],
      atras(g, e) {
        const t = e.t || 0;
        contacto(g, 0, 150, 0.22);
        for (let i = 0; i < n; i++) {
          const u = n === 1 ? 0.5 : i / (n - 1), a = (-62 + 124 * u) * Math.PI / 180 + Math.sin(t * 1.3 + i * 1.7) * 0.035, L = (150 + 60 * Math.sin(u * Math.PI)) * esc, w = 30 * esc;
          g.save(); g.translate(0, -104); g.rotate(a);
          forma(g, gg => { gg.beginPath(); gg.moveTo(0, 0); gg.bezierCurveTo(-w, -L * 0.35, -w * 0.9, -L * 0.8, 0, -L); gg.bezierCurveTo(w * 0.9, -L * 0.8, w, -L * 0.35, 0, 0); gg.closePath(); }, i % 2 ? hoja : tono(hoja, 0.12), { sombra: 6, brillo: 0, lw: 3.5, dentro: gg => raya(gg, [[0, -6], [0, -L * 0.9]], frio(hoja, 0.3), 2.2) });
          g.restore();
        }
        forma(g, poli([[-52, -100], [52, -100], [40, 0], [-40, 0]]), mac, { sombra: 8 });
        forma(g, rr(-60, -116, 120, 24, 8), tono(mac, 0.1), { sombra: 5, lw: 3.5 });
      },
      frente() {}
    };
  };

  TIPOS.bote = o => {
    const col = o.color || '#a8693c', borde = o.borde || tono(col, 0.22), L = o.largo || 640, n = o.plazas || 2, agua = o.agua;
    const xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * Math.min(190, (L - 260) / Math.max(1, n - 1 || 1)));
    const yb = x => -150 - 15 * (x + L / 2) / L;
    const casco = g => { g.beginPath(); g.moveTo(-L / 2, yb(-L / 2)); g.lineTo(L / 2 + 34, yb(L / 2 + 34)); g.quadraticCurveTo(L / 2 - 6, 34, L / 2 - 140, 38); g.lineTo(-L / 2 + 70, 38); g.quadraticCurveTo(-L / 2 - 4, 26, -L / 2, yb(-L / 2)); g.closePath(); };
    return {
      ancho: L, anclas: xs.map(x => ({ x, y: yb(x) + 118, escala: 1 })),
      interior(g) { g.beginPath(); g.moveTo(-L, yb(-L) - 4); g.lineTo(L, yb(L) - 4); g.lineTo(L, -3000); g.lineTo(-L, -3000); g.closePath(); },
      atras(g) {
        forma(g, poli([[-L / 2 + 6, yb(-L / 2)], [L / 2 + 20, yb(L / 2 + 20)], [L / 2 - 26, yb(L / 2) - 26], [-L / 2 + 34, yb(-L / 2) - 22]]), frio(col, 0.42), { sombra: 0, brillo: 0 });
      },
      frente(g, e) {
        const t = e.t || 0;
        forma(g, casco, col, { sombra: 14, dentro: gg => { for (const k of [0.34, 0.66]) raya(gg, [[-L / 2 + 6, yb(-L / 2) + 190 * k], [0, yb(0) + 204 * k, L / 2 + 20 - 60 * k, yb(L / 2) + 150 * k]], frio(col, 0.3), 2.6); for (const x of [-L / 2 + 150, L / 2 - 190]) for (const k of [0.17, 0.5]) { gg.beginPath(); gg.arc(x, yb(x) + 196 * k, 3.2, 0, TAU); gg.fillStyle = frio(col, 0.42); gg.fill(); } } });
        forma(g, poli([[-L / 2 - 10, yb(-L / 2) - 10], [L / 2 + 42, yb(L / 2 + 42) - 10], [L / 2 + 40, yb(L / 2 + 40) + 8], [-L / 2 - 8, yb(-L / 2) + 8]]), borde, { sombra: 4, brillo: 3, lw: 4 });
        if (o.remo !== false) { g.save(); g.translate(40, yb(40) - 2); g.rotate(0.5 + Math.sin(t * 1.6) * 0.05); forma(g, rr(-6, -90, 12, 250, 5), '#c9a26b', { sombra: 3, brillo: 0, lw: 3.5 }); forma(g, rr(-17, 150, 34, 82, 12), '#c9a26b', { sombra: 4, lw: 3.5 }); g.restore(); forma(g, elip(40, yb(40) - 2, 9, 9), '#55505c', { sombra: 0, brillo: 0, lw: 3 }); }
        if (agua) {
          g.save(); g.beginPath(); g.moveTo(-L, 60);
          for (let x = -L; x <= L; x += 20) g.lineTo(x, -6 + Math.sin(x * 0.021 + t * 2.2) * 6 + Math.sin(x * 0.047 - t * 1.4) * 3);
          g.lineTo(L, 60); g.closePath(); g.fillStyle = agua; g.fill();
          g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 3; g.lineCap = 'round';
          for (const s of [-1, 1]) { g.beginPath(); for (let k = 0; k < 3; k++) { const x0 = s * (L / 2 - 30 + k * 46), w = 30 - k * 6, y = 4 + k * 9 + Math.sin(t * 2 + k) * 2; g.moveTo(x0 - w, y); g.quadraticCurveTo(x0, y - 7, x0 + w, y); } g.stroke(); }
          g.restore();
        }
      }
    };
  };

  TIPOS.coche = o => {
    const col = o.color || '#d0453a', llanta = '#2b2930', rin = '#c9ced6', vidrio = '#2f3b52';
    const V1 = [[-150, -160], [-116, -236], [-22, -236], [-22, -160]], V2 = [[-4, -160], [-4, -236], [80, -236], [140, -160]];
    const cuerpo = g => { g.beginPath(); g.moveTo(-282, -70); g.quadraticCurveTo(-292, -150, -230, -158); g.lineTo(-176, -160); g.lineTo(-132, -250); g.quadraticCurveTo(-126, -260, -112, -260); g.lineTo(84, -260); g.quadraticCurveTo(98, -260, 108, -250); g.lineTo(168, -164); g.quadraticCurveTo(268, -152, 286, -110); g.lineTo(290, -70); g.quadraticCurveTo(290, -52, 270, -52); g.lineTo(-268, -52); g.quadraticCurveTo(-282, -52, -282, -70); g.closePath(); };
    const rueda = (g, x, giro) => {
      forma(g, elip(x, -48, 48, 48), llanta, { sombra: 6, brillo: 0 });
      forma(g, elip(x, -48, 27, 27), rin, { sombra: 4, lw: 3.5 });
      g.save(); g.translate(x, -48); g.rotate(giro); for (let i = 0; i < 5; i++) { g.rotate(TAU / 5); raya(g, [[0, 6], [0, 23]], '#8a909c', 4.5); } g.restore();
      forma(g, elip(x, -48, 7, 7), '#55505c', { sombra: 0, brillo: 0, lw: 3 });
    };
    return {
      ancho: 580, anclas: [{ x: 58, y: -42, escala: 0.5 }, { x: -86, y: -42, escala: 0.5 }],
      interior(g) { g.beginPath(); for (const V of [V1, V2]) { V.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); } },
      atras(g) {
        contacto(g, 0, 640, 0.3);
        forma(g, cuerpo, col, { sombra: 14, brillo: 6, dentro: gg => { raya(gg, [[-12, -160], [-12, -60]], frio(col, 0.34), 2.6); raya(gg, [[-270, -112], [280, -112]], frio(col, 0.2), 2.2); } });
        for (const V of [V1, V2]) forma(g, poli(V), vidrio, { sombra: 0, brillo: 0, lw: 4 });
      },
      frente(g, e) {
        const giro = e.giro ?? 0;
        g.save(); this.interior(g); g.clip(); g.fillStyle = 'rgba(190,220,255,0.16)'; g.fillRect(-300, -300, 600, 300); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 12; g.lineCap = 'round'; for (const x of [-100, 40]) { g.beginPath(); g.moveTo(x, -150); g.lineTo(x + 44, -246); g.stroke(); } g.restore();
        for (const V of [V1, V2]) { poli(V)(g); g.lineWidth = 4; g.strokeStyle = C.LINEA; g.lineJoin = 'round'; g.stroke(); }
        forma(g, rr(-70, -142, 34, 9, 4), tono(col, -0.3), { sombra: 0, brillo: 0, lw: 2.5 }); forma(g, rr(66, -142, 34, 9, 4), tono(col, -0.3), { sombra: 0, brillo: 0, lw: 2.5 });
        forma(g, rr(254, -132, 30, 22, 8), '#ffe9a6', { sombra: 3, brillo: 0, lw: 3.5 }); forma(g, rr(-286, -138, 18, 26, 6), '#e2574c', { sombra: 3, brillo: 0, lw: 3.5 });
        forma(g, rr(-292, -76, 586, 20, 9), '#8f96a3', { sombra: 4, brillo: 3, lw: 3.5 });
        for (const x of [-172, 176]) { g.save(); g.beginPath(); g.arc(x, -48, 60, Math.PI, 0); g.closePath(); g.fillStyle = frio(col, 0.5); g.fill(); g.restore(); rueda(g, x, giro); }
      }
    };
  };

  C.TIPOS_UTILERIA = TIPOS;
  const PROHIBIDO = ['color', 'cojin', 'maceta', 'borde', 'plazas', 'largo', 'ancho', 'alto'];
  C.utileria = (tipo, receta = {}) => {
    const f = TIPOS[tipo];
    if (!f) throw new Error(`utilería desconocida: "${tipo}". Hay: ${Object.keys(TIPOS).join(', ')}. Si falta, se agrega a mod/utileria.js con el mismo nivel de acabado, no se improvisa en la escena.`);
    const ob = f(Object.freeze({ ...receta }));
    ob.tipo = tipo; ob.receta = Object.freeze({ ...receta });
    ob.dibujar = (g, e = {}) => {
      for (const k of PROHIBIDO) if (k in e) throw new Error(`"${k}" de "${receta.id || tipo}" se fija en la receta de la historia, no al dibujar: así no cambia entre escenas.`);
      const dentro = e.dentro || [];
      if (dentro.length > ob.anclas.length) throw new Error(`"${receta.id || tipo}" tiene ${ob.anclas.length} lugar(es) y se pidieron ${dentro.length} ocupantes.`);
      g.save(); g.translate(e.x || 0, e.y || 0); g.rotate((e.rot || 0) * Math.PI / 180); g.scale((e.escala ?? 1) * (e.espejo ? -1 : 1), e.escala ?? 1);
      ob.atras(g, e);
      dentro.forEach((fn, i) => { if (!fn) return; g.save(); if (ob.interior) { ob.interior(g); g.clip(); } if (e.espejo) g.scale(-1, 1); const a = ob.anclas[i]; fn(g, e.espejo ? { ...a, x: -a.x } : a); g.restore(); });
      ob.frente(g, e);
      g.restore();
    };
    return ob;
  };

  C.historia = def => {
    const objs = {}, pers = {};
    for (const [id, r] of Object.entries(def.objetos || {})) objs[id] = C.utileria(r.tipo, { ...r, id });
    for (const [id, r] of Object.entries(def.personajes || {})) pers[id] = C.personaje2({ ...r, id });
    const falta = (que, id, hay) => { throw new Error(`${que} "${id}" no está en la historia. Definidos: ${Object.keys(hay).join(', ') || 'ninguno'}. Se agrega una sola vez en C.historia({...}).`); };
    return Object.freeze({ def, obj: id => objs[id] || falta('el objeto', id, objs), per: id => pers[id] || falta('el personaje', id, pers), paleta: Object.freeze({ ...(def.paleta || {}) }) });
  };
})();
