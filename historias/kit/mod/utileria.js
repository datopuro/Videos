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
    camino(g); g.fillStyle = color; g.fill(o.regla || 'nonzero');
    if (s || b) {
      g.save(); camino(g); g.clip(o.regla || 'nonzero');
      if (s) { g.fillStyle = frio(color, 0.24); g.fillRect(-5000, -5000, 10000, 10000); g.save(); g.translate(C.LUZ[0] * s, C.LUZ[1] * s); camino(g); g.fillStyle = color; g.fill(o.regla || 'nonzero'); g.restore(); }
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


  const masa = (g, circs, color, o = {}) => {
    const lw = o.lw ?? C.LW, cam = gg => { gg.beginPath(); for (const [x, y, r] of circs) { gg.moveTo(x + r, y); gg.arc(x, y, r, 0, TAU); } };
    g.save(); g.lineJoin = 'round';
    if (lw) { cam(g); g.lineWidth = lw * 2; g.strokeStyle = C.LINEA; g.stroke(); }
    forma(g, cam, color, { sombra: o.sombra ?? 14, brillo: 0, lw: 0, dentro: o.dentro });
    g.restore();
  };
  C.masa = masa;

  TIPOS.banca = o => {
    const n = o.plazas || 3, col = o.color || '#a9743f', metal = o.metal || '#3d3b45', A = 196, W = n * A + 40;
    const xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * A);
    return {
      ancho: W, anclas: xs.map(x => ({ x, y: 0, escala: 1 })),
      atras(g) {
        contacto(g, 0, W * 1.05, 0.22);
        for (const s of [-1, 1]) { forma(g, rr(s * (W / 2 - 34) - 7, -262, 14, 262, 5), metal, { sombra: 3, brillo: 0 }); forma(g, poli([[s * (W / 2 - 34) - 8, -92], [s * (W / 2 - 34) + 8, -92], [s * (W / 2 - 16) + 8, 0], [s * (W / 2 - 16) - 8, 0]]), metal, { sombra: 3, brillo: 0 }); }
        for (const y of [-268, -224, -180]) forma(g, rr(-W / 2, y, W, 32, 8), col, { sombra: 5, dentro: gg => raya(gg, [[-W / 2 + 30, y + 10], [W / 2 - 60, y + 10]], frio(col, 0.2), 2) });
        forma(g, rr(-W / 2 - 6, -112, W + 12, 24, 9), col, { sombra: 6 });
        forma(g, rr(-W / 2 + 4, -90, W - 8, 12, 5), tono(col, -0.22), { sombra: 0, brillo: 0, lw: 3 });
      },
      frente(g) { for (const s of [-1, 1]) { const x = s * (W / 2 - 6); forma(g, rr(x - 9, -188, 18, 84, 8), metal, { sombra: 3, brillo: 3 }); forma(g, rr(x - 16, -200, 32, 20, 9), tono(col, -0.08), { sombra: 3, lw: 3.5 }); } }
    };
  };

  TIPOS.escritorio = o => {
    const col = o.color || '#7a4f33', W = o.ancho || 460, H = 178, silla = o.silla || '#3d3b45';
    return {
      ancho: W, anclas: [{ x: -40, y: 0, escala: 1 }],
      interior(g) { g.beginPath(); g.rect(-2000, -3000, 4000, 3000 - H); },
      atras(g) { contacto(g, 0, W * 1.1); forma(g, rr(-40 - 62, -300, 124, 200, 22), silla, { sombra: 8 }); },
      frente(g) {
        forma(g, rr(-W / 2 + 12, -H + 18, W - 24, H - 18, 8), tono(col, -0.12), { sombra: 10 });
        const cx = W / 2 - 150;
        for (const y of [-H + 34, -H + 84]) { forma(g, rr(cx, y, 124, 40, 6), col, { sombra: 4, lw: 3.5 }); forma(g, rr(cx + 44, y + 15, 36, 9, 4), '#d7c08a', { sombra: 0, brillo: 0, lw: 2.5 }); }
        raya(g, [[-W / 2 + 40, -H + 40], [cx - 30, -H + 40]], frio(col, 0.3), 2.5);
        forma(g, rr(-W / 2, -H, W, 24, 9), col, { sombra: 5 });
      }
    };
  };

  TIPOS.cama = o => {
    const col = o.color || '#5f7fa8', madera = o.madera || '#7a4f33', W = 640, MT = -118;
    return {
      ancho: W, anclas: [{ x: -W / 2 + 96 + 360, y: MT - 44, escala: 1, rot: -90 }],
      interior(g) { g.beginPath(); g.rect(-W / 2, -1000, 262, 1000 + MT + 4); },
      atras(g) {
        contacto(g, 0, W * 1.08);
        forma(g, rr(-W / 2 - 14, -330, 34, 330, 10), madera, { sombra: 5 });
        forma(g, rr(W / 2 - 18, -190, 30, 190, 10), madera, { sombra: 5 });
        forma(g, rr(-W / 2 + 8, -62, W - 16, 30, 6), tono(madera, -0.1), { sombra: 4, lw: 4 });
        forma(g, rr(-W / 2 + 12, MT, W - 24, 62, 14), '#efe9dc', { sombra: 8 });
        forma(g, rr(-W / 2 + 26, MT - 44, 190, 58, 26), '#ffffff', { sombra: 8, lw: 4 });
      },
      frente(g) {
        forma(g, gg => { gg.beginPath(); gg.moveTo(-W / 2 + 232, MT + 6); gg.bezierCurveTo(-W / 2 + 250, MT - 78, -W / 2 + 420, MT - 96, W / 2 - 150, MT - 70); gg.bezierCurveTo(W / 2 - 60, MT - 60, W / 2 - 18, MT - 30, W / 2 - 14, MT + 30); gg.lineTo(W / 2 - 14, MT + 62); gg.lineTo(-W / 2 + 232, MT + 62); gg.closePath(); }, col, { sombra: 12, dentro: gg => { raya(gg, [[-W / 2 + 300, MT - 50], [-W / 2 + 320, MT + 20, -W / 2 + 300, MT + 60]], frio(col, 0.3), 2.6); raya(gg, [[60, MT - 76], [90, MT, 70, MT + 60]], frio(col, 0.3), 2.6); } });
        forma(g, rr(-W / 2 + 222, MT - 18, 40, 84, 14), tono(col, 0.26), { sombra: 4, lw: 3.5 });
      }
    };
  };

  TIPOS.asiento_avion = o => {
    const n = o.plazas || 1, col = o.color || '#3e5179', A = 210, W = n * A, xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * A);
    return {
      ancho: W, anclas: xs.map(x => ({ x, y: 0, escala: 1 })),
      atras(g) {
        contacto(g, 0, W * 1.1, 0.2);
        forma(g, rr(-W / 2 + 14, -40, W - 28, 22, 6), '#6d7480', { sombra: 3 });
        for (const x of xs) {
          forma(g, rr(x - 88, -408, 176, 330, 40), col, { sombra: 11 });
          forma(g, rr(x - 62, -400, 124, 70, 22), '#f0ece2', { sombra: 5, lw: 3.5 });
          raya(g, [[x - 40, -250], [x, -240, x + 40, -250]], frio(col, 0.3), 2.5);
          forma(g, rr(x - 86, -116, 172, 52, 18), tono(col, 0.1), { sombra: 7 });
          forma(g, rr(x - 74, -66, 148, 28, 8), tono(col, -0.14), { sombra: 3, lw: 3.5 });
        }
      },
      frente(g, e) {
        for (let i = 0; i <= n; i++) { const x = -W / 2 + i * A; forma(g, rr(x - 13, -196, 26, 132, 11), '#aab1bd', { sombra: 4, brillo: 3 }); forma(g, rr(x - 17, -208, 34, 24, 10), '#8d95a3', { sombra: 3, lw: 3.5 }); }
        if (e.cinturon) for (const x of xs) { forma(g, rr(x - 62, -122, 124, 14, 5), '#2f3138', { sombra: 0, brillo: 0, lw: 3 }); forma(g, rr(x - 15, -128, 30, 26, 6), '#c9ced6', { sombra: 3, lw: 3 }); }
      }
    };
  };

  TIPOS.puerta = o => {
    const col = o.color || '#8a5a3b', marco = o.marco || '#efe6d4', fondo = o.fondo || '#1c1a26';
    return {
      ancho: 260, anclas: [{ x: 14, y: 0, escala: 1 }],
      interior(g) { g.beginPath(); g.rect(-104, -456, 208, 456); },
      atras(g) { forma(g, rr(-128, -480, 256, 480, 6), marco, { sombra: 6 }); forma(g, rr(-104, -456, 208, 456, 2), fondo, { sombra: 0, brillo: 0, lw: 4 }); },
      frente(g, e) {
        const u = C.clamp(e.abierta ?? 0), w = 208 * (1 - 0.82 * u);
        g.save(); g.translate(-104, 0);
        forma(g, rr(0, -456, w, 456, 3), u > 0.02 ? tono(col, -0.12 * u) : col, { sombra: 8, dentro: gg => { for (const [y, h] of [[-430, 150], [-262, 110], [-134, 110]]) { rr(w * 0.14, y, w * 0.72, h, 5)(gg); gg.lineWidth = 3; gg.strokeStyle = frio(col, 0.34); gg.stroke(); } } });
        forma(g, elip(w * 0.86, -214, 9 * (1 - 0.6 * u) + 2, 10), '#e2c170', { sombra: 3, lw: 3 });
        g.restore();
        forma(g, rr(-136, -8, 272, 10, 3), tono(marco, -0.2), { sombra: 0, brillo: 0, lw: 3 });
      }
    };
  };

  TIPOS.ventana = o => {
    const W = o.ancho || 340, H = o.alto || 380, marco = o.marco || '#f4f1e6', cort = o.cortina, ext = o.exterior || 'dia';
    const cielo = { dia: ['#8fc4e8', '#dff0f7'], tarde: ['#f6a65b', '#fbe3b4'], noche: ['#141a36', '#33406b'], lluvia: ['#5f6b80', '#9aa5b5'] }[ext];
    return {
      ancho: W + 80, anclas: [],
      atras(g, e) {
        const t = e.t || 0;
        forma(g, rr(-W / 2, -H, W, H, 4), cielo[1], { sombra: 0, brillo: 0, lw: 0, dentro: gg => {
          const gr = gg.createLinearGradient(0, -H, 0, 0); gr.addColorStop(0, cielo[0]); gr.addColorStop(1, cielo[1]); gg.fillStyle = gr; gg.fillRect(-W / 2, -H, W, H);
          if (ext === 'noche') { gg.fillStyle = '#f5f1d8'; gg.beginPath(); gg.arc(W * 0.22, -H * 0.72, 30, 0, TAU); gg.fill(); for (let i = 0; i < 14; i++) { gg.globalAlpha = 0.5 + 0.5 * Math.sin(t * 1.7 + i * 2.1); gg.fillRect(-W / 2 + ((i * 97) % W), -H + ((i * 61) % (H * 0.7)), 4, 4); } gg.globalAlpha = 1; }
          if (ext === 'dia' || ext === 'tarde') masa(gg, [[-W * 0.18 + Math.sin(t * 0.2) * 8, -H * 0.62, 34], [-W * 0.05, -H * 0.66, 44], [W * 0.1, -H * 0.6, 32]], '#ffffff', { lw: 0, sombra: 8 });
          if (ext === 'lluvia') { gg.strokeStyle = 'rgba(230,238,248,0.6)'; gg.lineWidth = 2.5; gg.lineCap = 'round'; gg.beginPath(); for (let i = 0; i < 26; i++) { const x = -W / 2 + ((i * 83) % W), y = -H + ((i * 131 + t * 620) % H); gg.moveTo(x, y); gg.lineTo(x - 5, y + 26); } gg.stroke(); }
        } });
      },
      frente(g, e) {
        const t = e.t || 0;
        g.save(); g.lineJoin = 'round'; g.strokeStyle = C.LINEA; g.lineWidth = 22; g.strokeRect(-W / 2, -H, W, H); g.strokeStyle = marco; g.lineWidth = 14; g.strokeRect(-W / 2, -H, W, H);
        g.strokeStyle = C.LINEA; g.lineWidth = 14; g.beginPath(); g.moveTo(0, -H); g.lineTo(0, 0); g.moveTo(-W / 2, -H / 2); g.lineTo(W / 2, -H / 2); g.stroke(); g.strokeStyle = marco; g.lineWidth = 7; g.stroke(); g.restore();
        forma(g, rr(-W / 2 - 26, 4, W + 52, 22, 6), marco, { sombra: 5 });
        if (cort) for (const s of [-1, 1]) {
          const sw = Math.sin(t * 1.1 + s) * 6;
          forma(g, gg => { gg.beginPath(); gg.moveTo(s * (W / 2 + 30), -H - 26); gg.lineTo(s * (W * 0.12), -H - 26); gg.quadraticCurveTo(s * (W * 0.2) + sw, -H * 0.5, s * (W * 0.34) + sw, 20); gg.lineTo(s * (W / 2 + 30), 20); gg.closePath(); }, cort, { sombra: 10, dentro: gg => { for (const k of [0.3, 0.42]) raya(gg, [[s * (W * k + 20), -H - 10], [s * (W * k + 30) + sw, -H * 0.4, s * (W * k + 24) + sw, 14]], frio(cort, 0.28), 2.6); } });
        }
        if (cort) forma(g, rr(-W / 2 - 44, -H - 40, W + 88, 16, 7), '#6b4a34', { sombra: 3, lw: 3.5 });
      }
    };
  };

  TIPOS.tienda = o => {
    const col = o.color || '#c9803f', W = 680, H = 440;
    const hueco = g => { g.moveTo(-132, 0); g.bezierCurveTo(-132, -230, -70, -330, 0, -356); g.bezierCurveTo(70, -330, 132, -230, 132, 0); g.closePath(); };
    return {
      ancho: W, anclas: [{ x: 0, y: 0, escala: 0.84 }], reglaInterior: 'nonzero',
      interior(g) { g.beginPath(); hueco(g); },
      atras(g) { contacto(g, 0, W * 1.05); g.beginPath(); hueco(g); g.fillStyle = '#231b22'; g.fill(); },
      frente(g) {
        for (const s of [-1, 1]) { raya(g, [[s * 120, -330], [s * (W / 2 + 70), 0]], C.LINEA, 4); forma(g, rr(s * (W / 2 + 70) - 6, -26, 12, 30, 4), '#7a5a3c', { sombra: 0, brillo: 0, lw: 3 }); }
        forma(g, gg => { gg.beginPath(); gg.moveTo(0, -H); gg.lineTo(W / 2, 0); gg.lineTo(-W / 2, 0); gg.closePath(); hueco(gg); }, col, { regla: 'evenodd', sombra: 16, brillo: 0, dentro: gg => { raya(gg, [[0, -H], [0, -356]], frio(col, 0.34), 3); for (const s of [-1, 1]) raya(gg, [[s * 60, -H + 110], [s * (W / 2 - 60), -6]], frio(col, 0.2), 2.4); } });
        for (const s of [-1, 1]) forma(g, gg => { gg.beginPath(); gg.moveTo(s * 4, -350); gg.bezierCurveTo(s * 70, -326, s * 132, -230, s * 132, 0); gg.lineTo(s * 176, 0); gg.bezierCurveTo(s * 160, -150, s * 90, -300, s * 4, -350); gg.closePath(); }, tono(col, 0.16), { sombra: 6, lw: 4 });
      }
    };
  };

  TIPOS.fogata = o => {
    const esc = o.tam || 1;
    return {
      ancho: 260 * esc, anclas: [],
      atras(g, e) {
        const t = e.t || 0, k = 0.86 + 0.14 * Math.sin(t * 5.1) * Math.sin(t * 3.3);
        g.save(); g.scale(esc, esc);
        g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(0, -70, 10, 0, -70, 420); gr.addColorStop(0, `rgba(255,170,70,${0.4 * k})`); gr.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gr; g.fillRect(-440, -500, 880, 620); g.restore();
        contacto(g, 0, 300, 0.3);
        for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI, x = Math.cos(a) * 118, y = -8 + Math.sin(a) * -10 + (i % 2) * 6; forma(g, elip(x, y - 12, 24 + (i % 3) * 4, 17), i % 2 ? '#8d8a92' : '#a19da6', { sombra: 5, lw: 4 }); }
        for (const [a, c] of [[-0.42, '#6b4429'], [0.42, '#7a4f33']]) { g.save(); g.translate(0, -26); g.rotate(a); forma(g, rr(-96, -14, 192, 28, 12), c, { sombra: 4 }); forma(g, elip(96, 0, 9, 14), '#d8b98a', { sombra: 0, brillo: 0, lw: 3 }); g.restore(); }
        const llama = (w, h, col, f) => { const s1 = Math.sin(t * 4.3 + f) * 0.5 + Math.sin(t * 2.9 + f * 2) * 0.5, s2 = Math.sin(t * 3.7 + f * 1.3); g.beginPath(); g.moveTo(-w, -34); g.bezierCurveTo(-w * 1.2, -34 - h * 0.45, -w * 0.3 + s2 * 8, -34 - h * 0.6, s1 * 16, -34 - h * (1 + 0.07 * s2)); g.bezierCurveTo(w * 0.3 + s2 * 8, -34 - h * 0.6, w * 1.2, -34 - h * 0.45, w, -34); g.closePath(); g.fillStyle = col; g.fill(); };
        g.lineJoin = 'round'; llama(70, 210, '#f2622e', 0); g.lineWidth = C.LW; g.strokeStyle = C.LINEA; g.stroke(); llama(48, 150, '#f9a03a', 1.7); llama(26, 96, '#ffe08a', 3.1);
        for (let i = 0; i < 6; i++) { const ph = (t * 0.5 + i * 0.37) % 1; g.globalAlpha = 1 - ph; g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(Math.sin(i * 2.4 + ph * 4) * 46, -200 - ph * 190, 4.5 * (1 - ph * 0.5), 0, TAU); g.fill(); } g.globalAlpha = 1;
        g.restore();
      },
      frente() {}
    };
  };

  TIPOS.velero = o => {
    const col = o.color || '#3a3340', franja = o.franja || '#b5523b', vela = o.vela || '#f1ead8', L = 980, agua = o.agua, DK = -150;
    const casco = g => { g.beginPath(); g.moveTo(-L / 2, DK - 26); g.lineTo(L / 2 + 70, DK - 40); g.quadraticCurveTo(L / 2 - 10, 10, L / 2 - 170, 44); g.lineTo(-L / 2 + 90, 44); g.quadraticCurveTo(-L / 2 - 20, 10, -L / 2, DK - 26); g.closePath(); };
    return {
      ancho: L, anclas: [{ x: -230, y: DK + 6, escala: 0.8 }, { x: 40, y: DK + 6, escala: 0.8 }, { x: 250, y: DK + 6, escala: 0.8 }],
      interior(g) { g.beginPath(); g.rect(-L, -3000, L * 2, 3000 + DK - 40); },
      atras(g, e) {
        const t = e.t || 0, inf = 1 + Math.sin(t * 1.2) * 0.04;
        for (const [x, h] of [[-150, 760], [190, 640]]) {
          forma(g, rr(x - 9, DK - h, 18, h, 6), '#6b4a34', { sombra: 4, brillo: 3 });
          forma(g, gg => { gg.beginPath(); gg.moveTo(x + 16, DK - h + 30); gg.quadraticCurveTo(x + 220 * inf, DK - h * 0.5, x + 250, DK - 96); gg.lineTo(x + 16, DK - 96); gg.closePath(); }, vela, { sombra: 16, dentro: gg => { for (const k of [0.3, 0.55, 0.8]) raya(gg, [[x + 16, DK - 96 - (h - 126) * k], [x + 240 * k + 20, DK - 96 - (h - 126) * k * 0.9]], frio(vela, 0.16), 2.4); } });
          forma(g, gg => { gg.beginPath(); gg.moveTo(x - 16, DK - h + 80); gg.quadraticCurveTo(x - 150 * inf, DK - h * 0.45, x - 190, DK - 110); gg.lineTo(x - 16, DK - 110); gg.closePath(); }, tono(vela, -0.06), { sombra: 12 });
        }
        const on = Math.sin(t * 3.1) * 6; forma(g, poli([[-141, DK - 760], [-70, DK - 748 + on], [-141, DK - 722]]), franja, { sombra: 4, lw: 3.5 });
        forma(g, rr(-40, DK - 96, 170, 70, 10), '#8a5a3b', { sombra: 8 }); for (const x of [-10, 50]) forma(g, rr(x, DK - 78, 34, 30, 6), '#dbe9f2', { sombra: 0, brillo: 0, lw: 3.5 });
      },
      frente(g, e) {
        const t = e.t || 0;
        forma(g, casco, col, { sombra: 18, dentro: gg => { gg.fillStyle = franja; gg.beginPath(); gg.moveTo(-L, 8); gg.lineTo(L, -4); gg.lineTo(L, 80); gg.lineTo(-L, 80); gg.fill(); raya(gg, [[-L / 2, DK + 26], [L / 2 + 60, DK + 10]], tono(col, 0.25), 3); for (let x = -L / 2 + 150; x < L / 2 - 120; x += 150) { gg.beginPath(); gg.arc(x, DK + 74, 13, 0, TAU); gg.fillStyle = '#dbe9f2'; gg.fill(); gg.lineWidth = 3.5; gg.strokeStyle = C.LINEA; gg.stroke(); } } });
        forma(g, poli([[-L / 2 - 8, DK - 44], [L / 2 + 78, DK - 58], [L / 2 + 76, DK - 38], [-L / 2 - 6, DK - 24]]), '#8a5a3b', { sombra: 4, brillo: 3, lw: 4 });
        if (agua) { g.save(); g.beginPath(); g.moveTo(-L, 80); for (let x = -L; x <= L; x += 24) g.lineTo(x, 6 + Math.sin(x * 0.017 + t * 2) * 7 + Math.sin(x * 0.041 - t * 1.3) * 3); g.lineTo(L, 80); g.closePath(); g.fillStyle = agua; g.fill(); g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); for (let k = 0; k < 4; k++) { const x0 = L / 2 - 60 + k * 54, y = 16 + k * 8; g.moveTo(x0 - 30, y); g.quadraticCurveTo(x0, y - 9, x0 + 30, y); } g.stroke(); g.restore(); }
      }
    };
  };

  TIPOS.avion = o => {
    const col = o.color || '#f4f5f7', franja = o.franja || '#2f5bd3', L = 920;
    const fus = g => { g.beginPath(); g.moveTo(-L / 2 + 40, -70); g.quadraticCurveTo(-L / 2 + 120, -84, -L / 2 + 250, -86); g.lineTo(L / 2 - 170, -86); g.quadraticCurveTo(L / 2 - 20, -84, L / 2, -8); g.quadraticCurveTo(L / 2 - 30, 52, L / 2 - 180, 58); g.lineTo(-L / 2 + 240, 58); g.quadraticCurveTo(-L / 2 + 90, 40, -L / 2 + 40, -70); g.closePath(); };
    return {
      ancho: L, anclas: [],
      atras(g) {
        forma(g, poli([[-L / 2 + 30, -74], [-L / 2 - 30, -250], [-L / 2 + 70, -250], [-L / 2 + 230, -86]]), col, { sombra: 10, dentro: gg => { gg.fillStyle = franja; gg.beginPath(); gg.moveTo(-L / 2 - 30, -250); gg.lineTo(-L / 2 + 70, -250); gg.lineTo(-L / 2 + 118, -198); gg.lineTo(-L / 2 - 12, -198); gg.fill(); } });
        forma(g, poli([[-L / 2 + 60, -30], [-L / 2 - 60, -62], [-L / 2 - 40, -34], [-L / 2 + 150, 0]]), tono(col, -0.12), { sombra: 5, lw: 4 });
        forma(g, poli([[30, -60], [150, -230], [210, -230], [170, -60]]), tono(col, -0.16), { sombra: 6, lw: 4 });
      },
      frente(g) {
        forma(g, fus, col, { sombra: 20, dentro: gg => { gg.fillStyle = franja; gg.fillRect(-L, -4, L * 2, 16); gg.fillStyle = frio(col, 0.16); gg.fillRect(-L, 34, L * 2, 60); } });
        for (let x = -L / 2 + 250; x < L / 2 - 210; x += 46) forma(g, rr(x, -52, 22, 28, 8), '#2f3b52', { sombra: 0, brillo: 0, lw: 3 });
        forma(g, poli([[L / 2 - 150, -62], [L / 2 - 96, -62], [L / 2 - 56, -28], [L / 2 - 150, -28]]), '#2f3b52', { sombra: 0, brillo: 0, lw: 3.5 });
        forma(g, poli([[-60, 6], [120, 6], [-110, 150], [-190, 150]]), tono(col, -0.06), { sombra: 9 });
        forma(g, rr(-64, 70, 150, 54, 26), tono(col, -0.14), { sombra: 7 }); forma(g, elip(84, 97, 10, 22), '#2b2930', { sombra: 0, brillo: 0, lw: 3 });
      }
    };
  };

  TIPOS.arbol = o => {
    const tipo = o.clase || 'hoja', col = o.color || (tipo === 'pino' ? '#2f6b4a' : '#4f9a57'), tronco = o.tronco || (tipo === 'abedul' ? '#eee9df' : '#7a5236'), H = o.alto || 780;
    return {
      ancho: 380, anclas: [],
      atras(g, e) {
        const t = e.t || 0, sw = Math.sin(t * 0.9 + (o.semilla || 0)) * 5;
        contacto(g, 0, 300, 0.26);
        forma(g, poli([[-26, 0], [26, 0], [16, -H * 0.62], [-16, -H * 0.62]]), tronco, { sombra: 7, dentro: gg => { if (tipo === 'abedul') for (let i = 0; i < 9; i++) raya(gg, [[-20 + (i % 3) * 12, -40 - i * H * 0.062], [4 + (i % 3) * 8, -40 - i * H * 0.062]], '#3b3640', 5); else for (const x of [-8, 9]) raya(gg, [[x, -20], [x * 0.7, -H * 0.5]], frio(tronco, 0.3), 2.6); } });
        if (tipo === 'pino') { for (let i = 0; i < 4; i++) { const y = -H * 0.26 - i * H * 0.17, w = 190 - i * 34; forma(g, poli([[sw * (i + 1) * 0.3, y - H * 0.3], [w, y], [-w, y]]), i % 2 ? col : tono(col, 0.08), { sombra: 12, brillo: 0 }); } }
        else {
          const cy = -H * 0.72, R = H * 0.2;
          masa(g, [[-R * 0.95 + sw, cy + R * 0.25, R * 0.72], [R * 0.95 + sw, cy + R * 0.2, R * 0.74], [sw * 1.4, cy - R * 0.55, R * 0.92], [-R * 0.5 + sw, cy - R * 0.15, R * 0.8], [R * 0.5 + sw, cy - R * 0.2, R * 0.82], [sw, cy + R * 0.45, R * 0.7]], col, { sombra: 22, dentro: gg => { gg.strokeStyle = tono(col, 0.26); gg.lineWidth = 5; gg.lineCap = 'round'; for (const [x, y] of [[-R * 0.7, cy - R * 0.5], [-R * 0.1, cy - R * 0.95], [R * 0.5, cy - R * 0.55], [-R * 1.1, cy + R * 0.1]]) { gg.beginPath(); gg.arc(x + sw, y, R * 0.3, Math.PI * 1.05, Math.PI * 1.55); gg.stroke(); } } });
        }
      },
      frente() {}
    };
  };

  TIPOS.roca = o => {
    const col = o.color || '#8d8a92', W = o.ancho || 260, k = W / 260;
    return {
      ancho: W, anclas: [],
      atras(g) {
        contacto(g, 0, W * 1.1, 0.24);
        g.save(); g.scale(k, k);
        forma(g, gg => { gg.beginPath(); gg.moveTo(-126, 0); gg.quadraticCurveTo(-140, -70, -84, -112); gg.quadraticCurveTo(-30, -160, 36, -138); gg.quadraticCurveTo(110, -120, 128, -52); gg.quadraticCurveTo(136, -10, 120, 0); gg.closePath(); }, col, { sombra: 16, dentro: gg => { raya(gg, [[-70, -100], [-30, -60, -44, -8]], frio(col, 0.26), 2.6); raya(gg, [[40, -128], [66, -80, 50, -40]], frio(col, 0.2), 2.4); if (o.musgo) { gg.fillStyle = o.musgo; gg.beginPath(); gg.ellipse(-20, -142, 84, 26, -0.08, 0, TAU); gg.fill(); } } });
        g.restore();
      },
      frente() {}
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
      dentro.forEach((fn, i) => {
        if (!fn) return; const a = ob.anclas[i];
        g.save(); if (ob.interior) { ob.interior(g, i); g.clip(ob.reglaInterior || 'nonzero'); }
        g.translate(a.x, a.y); if (e.espejo) g.scale(-1, 1); if (a.rot) g.rotate(a.rot * Math.PI / 180);
        fn(g, { x: 0, y: 0, escala: a.escala ?? 1 }); g.restore();
      });
      ob.frente(g, e);
      g.restore();
    };
    return ob;
  };


  C.probarUtileria = g => {
    const fallas = [];
    for (const tipo of Object.keys(TIPOS)) {
      const ob = C.utileria(tipo, {});
      for (const k of ['atras', 'frente', 'anclas', 'ancho']) if (ob[k] === undefined) fallas.push(`${tipo}: falta "${k}"`);
      const antes = JSON.stringify([g.getTransform().toJSON(), g.globalAlpha, g.globalCompositeOperation]);
      try { ob.dibujar(g, { x: -9000, y: -9000, t: 1.3, dentro: ob.anclas.map(() => () => {}) }); } catch (err) { fallas.push(`${tipo}: ${err.message}`); }
      if (JSON.stringify([g.getTransform().toJSON(), g.globalAlpha, g.globalCompositeOperation]) !== antes) fallas.push(`${tipo}: deja el lienzo cambiado (falta un g.restore, o alpha/mezcla sin regresar)`);
      if (ob.anclas.length && !ob.interior && !['sillon', 'silla', 'banca', 'asiento_avion'].includes(tipo)) fallas.push(`${tipo}: tiene ocupantes pero no "interior" (recorte); solo los asientos abiertos pueden omitirlo`);
    }
    if (fallas.length) throw new Error('utilería con fallas:\n' + fallas.join('\n'));
    return Object.keys(TIPOS).length;
  };

  C.historia = def => {
    const objs = {}, pers = {};
    for (const [id, r] of Object.entries(def.objetos || {})) objs[id] = C.utileria(r.tipo, { ...r, id });
    for (const [id, r] of Object.entries(def.personajes || {})) pers[id] = C.personaje2({ ...r, id });
    const falta = (que, id, hay) => { throw new Error(`${que} "${id}" no está en la historia. Definidos: ${Object.keys(hay).join(', ') || 'ninguno'}. Se agrega una sola vez en C.historia({...}).`); };
    return Object.freeze({ def, obj: id => objs[id] || falta('el objeto', id, objs), per: id => pers[id] || falta('el personaje', id, pers), paleta: Object.freeze({ ...(def.paleta || {}) }) });
  };
})();
