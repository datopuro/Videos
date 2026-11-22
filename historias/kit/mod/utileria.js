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
  const rgb = h => h[0] === '#' ? [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)) : (h.match(/[\d.]+/g) || [128, 128, 128]).slice(0, 3).map(Number);
  const aguaSuave = (g, col, L, alto) => { const c = rgb(col).join(','), m = (col.match(/[\d.]+/g) || []), a = col[0] !== '#' && m.length > 3 ? Number(m[3]) : 1; g.save(); g.clip(); g.scale(1, (alto + 30) / L); const gr = g.createRadialGradient(0, 0, L * 0.45, 0, 0, L); gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(-L, -L, L * 2, L * 2); g.restore(); };
  const tono = (h, k) => `rgb(${rgb(h).map(v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)).join(',')})`;
  const frio = (h, k) => { const [r, g, b] = rgb(h); return `rgb(${Math.round(r * (1 - k))},${Math.round(g * (1 - k * 0.9))},${Math.round(Math.min(255, b * (1 - k * 0.62)))})`; };
  C.tono = tono;
  C.LUZ = C.LUZ || [-0.55, -0.83];

  const forma = (g, camino, color, o = {}) => {
    const s = o.sombra ?? 9, b = o.brillo ?? 5, lw = (o.lw ?? C.LW) * (C.grosor ? C.grosor(g) : 1);
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
          g.lineTo(L, 60); g.closePath(); aguaSuave(g, agua, L, 60);
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
        if (agua) { g.save(); g.beginPath(); g.moveTo(-L, 80); for (let x = -L; x <= L; x += 24) g.lineTo(x, 6 + Math.sin(x * 0.017 + t * 2) * 7 + Math.sin(x * 0.041 - t * 1.3) * 3); g.lineTo(L, 80); g.closePath(); aguaSuave(g, agua, L, 80); g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath(); for (let k = 0; k < 4; k++) { const x0 = L / 2 - 60 + k * 54, y = 16 + k * 8; g.moveTo(x0 - 30, y); g.quadraticCurveTo(x0, y - 9, x0 + 30, y); } g.stroke(); g.restore(); }
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


  /* Objetos agregados para Mary Anning (18 nov 2026): fósiles, papelería, vela, carreta, vitral, vitrina, perro.
     Los objetos de mano (martillo, hoja, sobre, libro chico) tienen el origen donde va la mano o al centro de su base;
     se dibujan después del personaje, en la posición de manoD/manoI. */
  const espina = (g, pts, col, r0, r1, lw) => {
    for (let i = 0; i < pts.length; i++) { const u = i / Math.max(1, pts.length - 1), r = r0 + (r1 - r0) * u; forma(g, elip(pts[i][0], pts[i][1], r * 1.15, r), col, { sombra: Math.max(1, r * 0.35), brillo: Math.min(3, r * 0.3), lw }); }
  };
  const curvaPts = (p0, p1, p2, n) => Array.from({ length: n }, (_, i) => { const u = i / (n - 1), a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; return [a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]; });
  const parcial = (g, pts, k) => { const n = Math.max(0, Math.min(pts.length, Math.round(pts.length * k))); if (n < 2) return; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); };
  const bocetoPlesio = (g, ink, k) => {
    g.save(); g.strokeStyle = ink; g.lineCap = 'round'; g.lineJoin = 'round';
    const lado = (p0, p1, p2, w0, w1, n) => { const c = curvaPts(p0, p1, p2, n), A = [], B = []; for (let i = 0; i < n; i++) { const a = c[Math.min(n - 1, i + 1)], b = c[Math.max(0, i - 1)], dx = a[0] - b[0], dy = a[1] - b[1], d = Math.hypot(dx, dy) || 1, w = w0 + (w1 - w0) * i / (n - 1); A.push([c[i][0] - dy / d * w, c[i][1] + dx / d * w]); B.push([c[i][0] + dy / d * w, c[i][1] - dx / d * w]); } return { c, A, B }; };
    const cu = lado([-10, -6], [-50, -14], [-76, -42], 7, 2.6, 30), co = lado([30, -2], [52, 2], [72, 4], 6, 1, 14);
    const cuerpo = Array.from({ length: 48 }, (_, i) => { const a = i / 47 * TAU; return [10 + Math.cos(a) * 28, -2 + Math.sin(a) * 16]; });
    const aleta = (x, y, ang, L) => Array.from({ length: 24 }, (_, i) => { const a = i / 23 * TAU, px = (Math.cos(a) + 1) * 0.5 * L, py = Math.sin(a) * L * 0.18 * (1 - Math.cos(a) * 0.2); return [x + px * Math.cos(ang) - py * Math.sin(ang), y + px * Math.sin(ang) + py * Math.cos(ang)]; });
    const ales = [aleta(-4, 8, 2.2, 34), aleta(26, 9, 0.75, 32), aleta(-4, -10, -2.3, 30), aleta(26, -10, -0.8, 28)];
    const secs = [cuerpo, cu.A, cu.B, co.A, co.B, ...ales], tot = secs.length;
    const wash = C.clamp((k - 0.5) / 0.3);
    if (wash > 0) { g.save(); g.globalAlpha = wash * 0.22; g.fillStyle = ink; for (const s of [cuerpo, ...ales]) { g.beginPath(); s.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); } g.beginPath(); cu.A.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); [...cu.B].reverse().forEach(p => g.lineTo(p[0], p[1])); g.closePath(); g.fill(); g.restore(); }
    g.lineWidth = 2.1; secs.forEach((s, i) => parcial(g, s, C.clamp(k * tot * 1.1 - i)));
    if (k > 0.35) { const a = C.clamp((k - 0.35) / 0.1); g.globalAlpha = a; g.beginPath(); g.ellipse(-80, -45, 6.5, 4.2, -0.6, 0, TAU); g.stroke(); g.fillStyle = ink; g.beginPath(); g.arc(-80, -46, 1.4, 0, TAU); g.fill(); g.globalAlpha = 1; }
    if (k > 0.6) { g.lineWidth = 1.2; const n = Math.round(26 * C.clamp((k - 0.6) / 0.3)); for (let i = 0; i < n; i++) { const [x, y] = cu.c[i + 2] || cu.c[29]; g.beginPath(); g.arc(x, y, 1.3, 0, TAU); g.stroke(); } for (let i = 0; i < 6 * C.clamp((k - 0.7) / 0.25); i++) { const x = -4 + i * 6.5; g.beginPath(); g.moveTo(x, -14); g.quadraticCurveTo(x + 2, -2, x, 10); g.stroke(); } }
    g.restore();
  };
  C.bocetoPlesio = bocetoPlesio;

  TIPOS.hoja = o => {
    const papel = o.papel || '#efe3c4', ink = o.tinta || '#3b2a20', dib = o.dibujo || 'plesiosaurio', W = dib === 'plesiosaurio' ? 200 : 140, H = dib === 'plesiosaurio' ? 140 : 180;
    return {
      ancho: W, anclas: [],
      atras(g, e) {
        const k = e.trazo ?? 1;
        forma(g, poli([[-W / 2, -H], [W / 2 - 6, -H - 4], [W / 2, 0], [-W / 2 + 4, 2]]), papel, { sombra: 4, brillo: 2, lw: 3.5, dentro: gg => {
          gg.fillStyle = 'rgba(150,110,60,0.14)'; gg.beginPath(); gg.ellipse(W * 0.3, -H * 0.2, 30, 18, 0.4, 0, TAU); gg.fill();
          if (dib === 'plesiosaurio') { gg.save(); gg.translate(14, -H * 0.42); gg.scale(1.05, 1.05); bocetoPlesio(gg, ink, k); gg.restore(); }
          if (dib === 'hueso') { gg.save(); gg.strokeStyle = ink; gg.lineWidth = 2.4; gg.lineCap = 'round'; const p = curvaPts([-40, -60], [0, -112], [40, -132], 30); parcial(gg, p, k * 1.4); if (k > 0.6) { for (const [x, y] of [p[0], p[29]]) { gg.beginPath(); gg.arc(x, y, 7, 0, TAU); gg.stroke(); } } gg.restore(); }
          const filas = dib === 'carta' ? 9 : dib === 'articulo' ? 6 : 2, y0 = dib === 'carta' ? -H + 26 : dib === 'articulo' ? -H + 50 : -26;
          gg.strokeStyle = 'rgba(59,42,32,0.55)'; gg.lineWidth = 2;
          for (let i = 0; i < filas; i++) { const w = (dib === 'carta' ? 96 : 84) * (0.6 + 0.4 * C.hash(i * 3.1 + filas)), kk = C.clamp(k * filas - i); if (kk <= 0) continue; gg.beginPath(); for (let x = 0; x < w * kk; x += 4) gg.lineTo(-W / 2 + 22 + x, y0 + i * 14 + Math.sin(x * 0.4 + i) * 1.3); gg.stroke(); }
          if (dib === 'articulo') { gg.fillStyle = 'rgba(59,42,32,0.75)'; gg.fillRect(-W / 2 + 22, -H + 22, 96, 9); gg.save(); gg.translate(4, -46); gg.scale(0.55, 0.55); bocetoPlesio(gg, ink, 1); gg.restore(); }
          if (dib === 'carta' && k > 0.9) { gg.strokeStyle = ink; gg.lineWidth = 2.2; gg.beginPath(); gg.moveTo(10, -18); gg.bezierCurveTo(22, -34, 30, -6, 42, -22); gg.bezierCurveTo(48, -30, 50, -16, 56, -20); gg.stroke(); }
        } });
      },
      frente() {}
    };
  };

  TIPOS.libro = o => {
    const tapa = o.color || '#6b2f2a', papel = '#f1e6c8', W = o.chico ? 120 : 220;
    return {
      ancho: W * 2, anclas: [],
      atras(g, e) {
        contacto(g, 0, W * 2.1, 0.2);
        if (!(e.abierto ?? 1)) { forma(g, rr(-W / 2, -26, W, 26, 6), tapa, { sombra: 5, dentro: gg => raya(gg, [[-W / 2 + 14, -14], [W / 2 - 14, -14]], tono(tapa, 0.3), 2.5) }); forma(g, rr(-W / 2 + 6, -20, W - 12, 8, 3), papel, { sombra: 0, brillo: 0, lw: 2.5 }); return; }
        forma(g, poli([[-W, -10], [0, 0], [W, -10], [W, 4], [0, 12], [-W, 4]]), tapa, { sombra: 4 });
        for (const s of [-1, 1]) forma(g, gg => { gg.beginPath(); gg.moveTo(0, -4); gg.quadraticCurveTo(s * W * 0.5, -40, s * (W - 6), -30); gg.lineTo(s * (W - 6), -8); gg.quadraticCurveTo(s * W * 0.5, -18, 0, 4); gg.closePath(); }, papel, { sombra: 4, lw: 3, dentro: gg => { gg.strokeStyle = 'rgba(60,44,30,0.4)'; gg.lineWidth = 2; for (let i = 0; i < 4; i++) { gg.beginPath(); gg.moveTo(s * 18, -10 - i * 5 - 6); gg.quadraticCurveTo(s * W * 0.5, -34 - i * 4 + 12, s * (W - 22), -24 - i * 4 + 6); gg.stroke(); } } });
      },
      frente() {}
    };
  };

  TIPOS.canasta = o => {
    const col = o.color || '#b58a4e';
    return {
      ancho: 150, anclas: [],
      atras(g, e) {
        contacto(g, 0, 160, 0.2);
        raya(g, [[-60, -70], [0, -170, 60, -70]], C.LINEA, 14); raya(g, [[-60, -70], [0, -170, 60, -70]], tono(col, -0.1), 8);
        const ll = e.lleno ?? 0;
        if (ll > 0) for (let i = 0; i < Math.round(5 * ll); i++) { const x = -44 + i * 22, y = -80 - C.hash(i) * 10; forma(g, elip(x, y, 16, 13), i % 2 ? '#8e8a84' : '#b9a98a', { sombra: 4, lw: 3, dentro: gg => { gg.strokeStyle = 'rgba(40,30,20,0.4)'; gg.lineWidth = 1.6; gg.beginPath(); for (let a = 0; a < 9; a += 0.4) gg.lineTo(x + Math.cos(a) * a * 1.4, y + Math.sin(a) * a * 1.2); gg.stroke(); } }); }
      },
      frente(g) {
        forma(g, poli([[-74, -82], [74, -82], [56, 0], [-56, 0]]), col, { sombra: 10, dentro: gg => { for (let y = -70; y < 0; y += 14) raya(gg, [[-74, y], [74, y]], frio(col, 0.28), 2.4); for (let x = -60; x <= 60; x += 20) raya(gg, [[x, -82], [x * 0.78, 0]], tono(col, 0.18), 2.2); } });
        forma(g, rr(-80, -92, 160, 16, 8), tono(col, -0.12), { sombra: 4, lw: 3.5 });
      }
    };
  };

  TIPOS.martillo = o => {
    const mango = o.mango || '#9b6b3e', metal = o.metal || '#6f7480';
    return {
      ancho: 120, anclas: [],
      atras(g) {
        forma(g, rr(-7, -70, 14, 130, 6), mango, { sombra: 3, brillo: 2, lw: 3.5 });
        forma(g, poli([[-44, -94], [30, -94], [52, -84], [30, -72], [-44, -72], [-50, -83]]), metal, { sombra: 5, brillo: 3, lw: 3.5, dentro: gg => raya(gg, [[-30, -80], [20, -80]], tono(metal, 0.3), 2) });
      },
      frente() {}
    };
  };

  TIPOS.amonita = o => {
    const col = o.color || '#a99a82', R = o.radio || 34;
    return {
      ancho: R * 2, anclas: [],
      atras(g) {
        contacto(g, 0, R * 2.2, 0.22);
        forma(g, elip(0, -R, R, R * 0.92), col, { sombra: R * 0.25, dentro: gg => { gg.strokeStyle = frio(col, 0.35); gg.lineWidth = 2.4; gg.beginPath(); for (let a = 0; a < 15; a += 0.15) { const r = R * 0.95 * Math.exp(-a * 0.17); gg.lineTo(Math.cos(a) * r, -R + Math.sin(a) * r * 0.92); } gg.stroke(); gg.lineWidth = 1.5; for (let a = 0; a < 12; a += 0.42) { const r = R * 0.95 * Math.exp(-a * 0.17), r2 = r * Math.exp(-TAU * 0.17); gg.beginPath(); gg.moveTo(Math.cos(a) * r, -R + Math.sin(a) * r * 0.92); gg.lineTo(Math.cos(a) * r2, -R + Math.sin(a) * r2 * 0.92); gg.stroke(); } } });
      },
      frente() {}
    };
  };

  TIPOS.craneo = o => {
    const hueso = o.color || '#c8b48f', L = o.largo_px || 300;
    return {
      ancho: L, anclas: [],
      atras(g) {
        contacto(g, 20, L * 1.1, 0.24);
        forma(g, gg => { gg.beginPath(); gg.moveTo(L * 0.5, -40); gg.quadraticCurveTo(L * 0.5, -96, L * 0.3, -104); gg.quadraticCurveTo(L * 0.1, -108, -L * 0.05, -70); gg.lineTo(-L * 0.5, -34); gg.quadraticCurveTo(-L * 0.53, -24, -L * 0.48, -20); gg.lineTo(-L * 0.05, -20); gg.quadraticCurveTo(L * 0.3, -6, L * 0.5, -40); gg.closePath(); }, hueso, { sombra: 12, dentro: gg => {
          gg.fillStyle = frio(hueso, 0.45); gg.beginPath(); gg.ellipse(L * 0.27, -64, 30, 26, 0, 0, TAU); gg.fill();
          gg.strokeStyle = tono(hueso, 0.2); gg.lineWidth = 4; for (let a = 0; a < TAU; a += TAU / 12) { gg.beginPath(); gg.arc(L * 0.27, -64, 22, a, a + 0.4); gg.stroke(); }
          gg.strokeStyle = frio(hueso, 0.4); gg.lineWidth = 2.5; gg.beginPath(); gg.moveTo(-L * 0.47, -27); gg.lineTo(L * 0.05, -38); gg.stroke();
          gg.fillStyle = '#f2ead6'; for (let x = -L * 0.44; x < 0; x += 11) { gg.beginPath(); gg.moveTo(x, -31 + (x + L * 0.47) * 0.02); gg.lineTo(x + 4, -22 + (x + L * 0.47) * 0.02); gg.lineTo(x + 8, -31 + (x + L * 0.47) * 0.02); gg.fill(); }
          raya(gg, [[L * 0.38, -96], [L * 0.46, -60]], frio(hueso, 0.3), 2.2);
        } });
      },
      frente() {}
    };
  };

  TIPOS.plesiosaurio = o => {
    const hueso = o.color || '#d2bf98', roca = o.roca || '#7d8592', losa = o.losa !== false;
    const cuello = curvaPts([-120, -60], [-330, -120], [-420, -250], 30), cola = curvaPts([150, -50], [260, -40], [360, -70], 14);
    return {
      ancho: 900, anclas: [],
      atras(g, e) {
        const k = e.revela ?? 1, lim = -460 + 900 * k;
        if (losa) forma(g, poli([[-470, -300], [-60, -330], [420, -270], [450, 0], [-460, 0]]), roca, { sombra: 14, dentro: gg => { for (let i = 0; i < 7; i++) raya(gg, [[-470, -270 + i * 40], [450, -250 + i * 38]], frio(roca, 0.18 + (i % 2) * 0.1), 3); } });
        g.save(); g.beginPath(); g.rect(-600, -500, lim + 600, 600); g.clip();
        const sobre = o.hundido ? 'rgba(40,40,50,0.18)' : null;
        g.save(); g.translate(0, 0);
        const ale = (x, y, s, r) => { g.save(); g.translate(x, y); g.rotate(r); g.scale(s, 1); forma(g, gg => { gg.beginPath(); gg.moveTo(0, -12); gg.quadraticCurveTo(70, -14, 120, 6); gg.quadraticCurveTo(70, 18, 0, 12); gg.closePath(); }, hueso, { sombra: 4, lw: 3, dentro: gg => { for (let i = 1; i < 6; i++) raya(gg, [[i * 20, -12], [i * 20, 12]], frio(hueso, 0.35), 2); } }); g.restore(); };
        ale(-40, -100, -1, 0.5); ale(80, -100, 1, -0.5); ale(-40, -20, -1, -0.45); ale(90, -20, 1, 0.45);
        forma(g, elip(30, -60, 150, 62), tono(hueso, -0.05), { sombra: 6, lw: 3.5, dentro: gg => { gg.fillStyle = 'rgba(70,60,50,0.18)'; gg.fillRect(-140, -130, 340, 140); } });
        for (let i = 0; i < 11; i++) { const x = -90 + i * 22; raya(g, [[x, -110], [x + 6, -60, x, -12]], C.LINEA, 6); raya(g, [[x, -110], [x + 6, -60, x, -12]], hueso, 3.2); }
        espina(g, [...curvaPts([-130, -62], [30, -66], [160, -52], 14)], hueso, 9, 9, 2.5);
        espina(g, cuello, hueso, 9, 6.5, 2.5); espina(g, cola, hueso, 8, 4, 2.5);
        forma(g, gg => { gg.beginPath(); gg.ellipse(-432, -262, 26, 14, -0.7, 0, TAU); }, hueso, { sombra: 4, lw: 3, dentro: gg => { gg.fillStyle = frio(hueso, 0.5); gg.beginPath(); gg.arc(-428, -268, 5, 0, TAU); gg.fill(); } });
        g.restore();
        if (sobre) { g.fillStyle = sobre; g.fillRect(-600, -500, 1200, 600); }
        g.restore();
        if (losa && k < 1) { g.save(); g.beginPath(); g.rect(lim, -500, 1200, 600); g.clip(); for (let i = 0; i < 5; i++) forma(g, elip(lim + 40 + i * 120, -140 + C.hash(i) * 80, 90, 70), tono(roca, 0.06 + C.hash(i * 2) * 0.08), { sombra: 8, brillo: 0, lw: 3 }); g.restore(); }
      },
      frente() {}
    };
  };

  TIPOS.vela = o => {
    const cera = o.color || '#efe6cf', metal = o.metal || '#b08d4a';
    return {
      ancho: 80, anclas: [],
      atras(g, e) {
        const t = e.t || 0, on = (e.encendida ?? 1) > 0, fl = 1 + 0.08 * Math.sin(t * 9.1) + 0.05 * Math.sin(t * 5.3 + 1);
        if (on) { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(0, -128, 4, 0, -128, 240 * fl); gr.addColorStop(0, 'rgba(255,214,140,0.5)'); gr.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = gr; g.fillRect(-260, -380, 520, 520); g.restore(); }
        contacto(g, 0, 90, 0.2);
        forma(g, elip(0, -8, 38, 9), metal, { sombra: 3, lw: 3.5 }); forma(g, rr(-26, -18, 52, 12, 5), metal, { sombra: 3, lw: 3.5 });
        forma(g, rr(-12, -104, 24, 90, 4), cera, { sombra: 5, dentro: gg => raya(gg, [[6, -100], [7, -70]], tono(cera, 0.3), 3) });
        raya(g, [[0, -104], [0, -112]], C.LINEA, 3);
        if (on) { g.save(); g.translate(0, -112); g.scale(fl * 0.9, fl); forma(g, gg => { gg.beginPath(); gg.moveTo(0, -36); gg.quadraticCurveTo(13, -10, 9, 0); gg.quadraticCurveTo(0, 8, -9, 0); gg.quadraticCurveTo(-13, -10, 0, -36); gg.closePath(); }, '#ffcf5a', { sombra: 0, brillo: 0, lw: 2.5, dentro: gg => { gg.fillStyle = '#fff5cc'; gg.beginPath(); gg.ellipse(0, -6, 4, 8, 0, 0, TAU); gg.fill(); } }); g.restore(); }
      },
      frente() {}
    };
  };

  TIPOS.bulto = o => {
    const manta = o.color || '#e9dcc0';
    return {
      ancho: 120, anclas: [],
      atras(g) {
        forma(g, gg => { gg.beginPath(); gg.ellipse(0, -40, 62, 36, -0.12, 0, TAU); }, manta, { sombra: 8, dentro: gg => { raya(gg, [[-40, -60], [-10, -40, 20, -66]], frio(manta, 0.25), 2.5); raya(gg, [[-30, -20], [10, -10, 40, -30]], frio(manta, 0.25), 2.5); } });
        forma(g, gg => { gg.beginPath(); gg.ellipse(-46, -58, 26, 24, 0, 0, TAU); }, tono(manta, -0.05), { sombra: 5, lw: 3.5, dentro: gg => { gg.fillStyle = 'rgba(80,60,40,0.12)'; gg.beginPath(); gg.ellipse(-44, -56, 15, 13, 0, 0, TAU); gg.fill(); } });
      },
      frente() {}
    };
  };

  TIPOS.caja = o => {
    const col = o.color || '#a07848', W = o.ancho || 520, H = o.alto || 110;
    return {
      ancho: W, anclas: [],
      atras(g) {
        contacto(g, 0, W * 1.05, 0.22);
        forma(g, rr(-W / 2, -H, W, H, 6), col, { sombra: 8, dentro: gg => { for (let y = -H + H / 3; y < 0; y += H / 3) raya(gg, [[-W / 2, y], [W / 2, y]], frio(col, 0.3), 2.5); for (const x of [-W / 2 + 18, W / 2 - 18]) raya(gg, [[x, -H], [x, 0]], tono(col, -0.25), 6); } });
      },
      frente() {}
    };
  };

  TIPOS.carreta = o => {
    const col = o.color || '#8a5f3a', W = 560, rueda = o.rueda || '#5a3b24';
    const RU = (g, x, giro) => { g.save(); g.translate(x, -70); forma(g, elip(0, 0, 70, 70), rueda, { sombra: 6, lw: 4.5, dentro: gg => { gg.fillStyle = tono(rueda, 0.2); gg.beginPath(); gg.arc(0, 0, 54, 0, TAU); gg.fill(); } }); g.rotate(giro); for (let i = 0; i < 8; i++) { g.rotate(TAU / 8); raya(g, [[0, 0], [0, 54]], C.LINEA, 7); raya(g, [[0, 0], [0, 54]], tono(rueda, -0.2), 4); } forma(g, elip(0, 0, 14, 14), '#6f7480', { sombra: 2, lw: 3 }); g.restore(); };
    return {
      ancho: W, anclas: [{ x: 0, y: -150, escala: 1 }],
      interior(g) { g.beginPath(); g.rect(-W, -2000, W * 2, 1930); },
      atras(g, e) {
        contacto(g, 0, W * 1.1, 0.25);
        raya(g, [[W / 2 - 10, -150], [W / 2 + 190, -120]], C.LINEA, 14); raya(g, [[W / 2 - 10, -150], [W / 2 + 190, -120]], tono(col, -0.1), 8);
        RU(g, -W * 0.28, (e.giro || 0) * 0.8);
      },
      frente(g, e) {
        forma(g, rr(-W / 2, -230, W, 96, 6), col, { sombra: 8, dentro: gg => { for (let x = -W / 2 + 70; x < W / 2; x += 70) raya(gg, [[x, -230], [x, -134]], frio(col, 0.3), 2.5); } });
        forma(g, rr(-W / 2 - 10, -144, W + 20, 18, 5), tono(col, -0.2), { sombra: 3, lw: 3.5 });
        RU(g, W * 0.28, e.giro || 0);
      }
    };
  };

  TIPOS.sobre = o => {
    const col = o.color || '#e8dcbc', sello = o.sello || '#a3322a';
    return {
      ancho: 150, anclas: [],
      atras(g) {
        forma(g, rr(-75, -96, 150, 96, 6), col, { sombra: 5, lw: 3.5, dentro: gg => { raya(gg, [[-75, -96], [0, -40], [75, -96]], frio(col, 0.3), 2.5); raya(gg, [[-75, 0], [-20, -48]], frio(col, 0.22), 2); raya(gg, [[75, 0], [20, -48]], frio(col, 0.22), 2); } });
        forma(g, elip(0, -42, 14, 13), sello, { sombra: 3, lw: 3 });
      },
      frente() {}
    };
  };

  TIPOS.monedas = o => {
    const oro = o.color || '#d9b24c';
    return {
      ancho: 120, anclas: [],
      atras(g, e) {
        const n = Math.round(e.cuantas ?? 6); contacto(g, 0, 130, 0.2);
        for (let i = 0; i < n; i++) { const x = (i % 3 - 1) * 34 + (C.hash(i) - 0.5) * 8, y = -Math.floor(i / 3) * 10; forma(g, elip(x, y - 8, 22, 8), oro, { sombra: 2, lw: 3, dentro: gg => raya(gg, [[x - 10, y - 9], [x + 8, y - 11]], tono(oro, 0.35), 2) }); }
      },
      frente() {}
    };
  };

  TIPOS.vitral = o => {
    const W = 300, H = 640, plomo = '#2a2630', COL = o.colores || ['#3f6fb0', '#c7463a', '#e2b84a', '#4f9a6a', '#7a4fa0', '#e8e2cf'];
    const arco = gg => { gg.beginPath(); gg.moveTo(-W / 2, 0); gg.lineTo(-W / 2, -H + W / 2); gg.arc(0, -H + W / 2, W / 2, Math.PI, 0); gg.lineTo(W / 2, 0); gg.closePath(); };
    return {
      ancho: W + 80, anclas: [],
      atras(g, e) {
        const t = e.t || 0;
        forma(g, gg => { gg.beginPath(); gg.moveTo(-W / 2 - 40, 30); gg.lineTo(-W / 2 - 40, -H + W / 2); gg.arc(0, -H + W / 2, W / 2 + 40, Math.PI, 0); gg.lineTo(W / 2 + 40, 30); gg.closePath(); }, '#b9b0a2', { sombra: 10 });
        forma(g, arco, '#e8e2cf', { sombra: 0.01, brillo: 0, lw: 5, dentro: gg => {
          for (let r = 0; r < 12; r++) for (let c = 0; c < 4; c++) { const x = -W / 2 + c * W / 4, y = -H + r * 56 + (c % 2) * 28; gg.fillStyle = COL[(r * 3 + c * 5) % COL.length]; gg.fillRect(x, y, W / 4, 56); }
          gg.fillStyle = '#e2b84a'; gg.beginPath(); gg.arc(0, -H + W / 2, 60, 0, TAU); gg.fill(); gg.fillStyle = '#fff3c4'; gg.beginPath(); gg.arc(0, -H + W / 2, 30, 0, TAU); gg.fill();
          gg.strokeStyle = plomo; gg.lineWidth = 6; for (let c = 1; c < 4; c++) { gg.beginPath(); gg.moveTo(-W / 2 + c * W / 4, -H + W / 2); gg.lineTo(-W / 2 + c * W / 4, 0); gg.stroke(); } for (let r = 0; r < 12; r++) { gg.beginPath(); gg.moveTo(-W / 2, -H + W / 2 + r * 42); gg.lineTo(W / 2, -H + W / 2 + 12 + r * 42); gg.stroke(); }
          gg.beginPath(); gg.arc(0, -H + W / 2, 60, 0, TAU); gg.stroke();
          gg.save(); gg.globalCompositeOperation = 'screen'; gg.fillStyle = `rgba(255,250,220,${0.18 + 0.06 * Math.sin(t * 0.7)})`; gg.fillRect(-W / 2, -H, W, H); gg.restore();
        } });
      },
      frente() {}
    };
  };

  TIPOS.vitrina = o => {
    const madera = o.color || '#4a3a30', W = 420, H = 360;
    return {
      ancho: W, anclas: [{ x: 0, y: -430, escala: 1 }],
      interior(g) { g.beginPath(); g.rect(-W / 2 + 16, -430 - H + 16, W - 32, H - 16); },
      atras(g) {
        contacto(g, 0, W * 1.1, 0.25);
        forma(g, rr(-W / 2 + 40, -430, W - 80, 430, 6), madera, { sombra: 10, dentro: gg => { raya(gg, [[-W / 2 + 70, -380], [W / 2 - 70, -380]], tono(madera, 0.2), 3); raya(gg, [[-W / 2 + 70, -60], [W / 2 - 70, -60]], tono(madera, 0.2), 3); } });
        forma(g, rr(-W / 2, -440, W, 24, 6), tono(madera, 0.1), { sombra: 4 });
        forma(g, rr(-W / 2 + 16, -430 - H + 16, W - 32, H - 16, 2), '#2b3542', { sombra: 0, brillo: 0, lw: 3 });
        g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(0, -430 - H + 40, 10, 0, -600, 300); gr.addColorStop(0, 'rgba(255,240,200,0.45)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(-W / 2, -430 - H, W, H); g.restore();
      },
      frente(g) {
        g.save(); g.fillStyle = 'rgba(200,225,240,0.12)'; g.fillRect(-W / 2, -430 - H, W, H); g.restore();
        raya(g, [[-W / 2 + 40, -430 - H + 30], [-W / 2 + 120, -430 - H + 150]], 'rgba(255,255,255,0.5)', 6); raya(g, [[-W / 2 + 60, -430 - H + 20], [-W / 2 + 100, -430 - H + 80]], 'rgba(255,255,255,0.35)', 4);
        g.save(); g.strokeStyle = C.LINEA; g.lineWidth = 12; g.strokeRect(-W / 2, -430 - H, W, H); g.strokeStyle = '#b08d4a'; g.lineWidth = 6; g.strokeRect(-W / 2, -430 - H, W, H); g.restore();
      }
    };
  };

  TIPOS.perro = o => {
    const blanco = o.color || '#f2efe8', negro = o.mancha || '#2a2528';
    return {
      ancho: 200, anclas: [],
      atras(g, e) {
        const t = e.t || 0, cola = Math.sin(t * 5.5) * 0.35, paso = e.camina ? Math.sin(t * 9) : 0;
        contacto(g, 0, 200, 0.22);
        raya(g, [[-62, -92], [-96, -120 + cola * 30, -90, -150 + cola * 40]], C.LINEA, 12); raya(g, [[-62, -92], [-96, -120 + cola * 30, -90, -150 + cola * 40]], blanco, 6);
        for (const [x, s] of [[-50, 1], [-30, -1], [40, 1], [58, -1]]) forma(g, rr(x - 10 + paso * s * 6, -50, 20, 50, 8), x > 0 ? blanco : tono(blanco, -0.06), { sombra: 3, lw: 3.5 });
        forma(g, poli([[40, -100], [80, -128], [92, -100], [60, -70]]), blanco, { sombra: 4, lw: 4 });
        forma(g, elip(0, -78, 74, 34), blanco, { sombra: 8, dentro: gg => { gg.fillStyle = negro; gg.beginPath(); gg.ellipse(-20, -100, 30, 22, 0.2, 0, TAU); gg.fill(); } });
        g.save(); g.translate(70, -118); g.rotate((e.cabeza || 0) * 0.3);
        forma(g, gg => { gg.beginPath(); gg.ellipse(0, 0, 36, 30, 0, 0, TAU); }, blanco, { sombra: 6, dentro: gg => { gg.fillStyle = negro; gg.beginPath(); gg.ellipse(-8, -6, 24, 24, 0, 0, TAU); gg.fill(); } });
        forma(g, rr(18, -4, 38, 26, 12), blanco, { sombra: 3, lw: 3.5 });
        forma(g, elip(54, 4, 8, 7), negro, { sombra: 0, brillo: 2, lw: 2.5 });
        forma(g, poli([[-26, -20], [-14, -40], [-4, -22]]), negro, { sombra: 2, lw: 3 }); forma(g, poli([[2, -24], [14, -44], [22, -22]]), negro, { sombra: 2, lw: 3 });
        g.fillStyle = C.LINEA; g.beginPath(); g.arc(18, -6, 4.5, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(19.5, -7.5, 1.5, 0, TAU); g.fill();
        g.restore();
      },
      frente() {}
    };
  };

  TIPOS.ictiosaurio = o => {
    const hueso = o.color || '#c8b48f', roca = o.roca || '#7d8592', losa = o.losa !== false, cr = TIPOS.craneo({ color: hueso, largo_px: 280 });
    const col = curvaPts([-150, -70], [120, -96], [380, -40], 30);
    return {
      ancho: 900, anclas: [],
      atras(g, e) {
        const k = e.revela ?? 1, lim = -460 + 900 * k;
        if (losa) forma(g, poli([[-470, -230], [-40, -250], [440, -210], [460, 0], [-460, 0]]), roca, { sombra: 14, dentro: gg => { for (let i = 0; i < 6; i++) raya(gg, [[-470, -200 + i * 36], [460, -190 + i * 34]], frio(roca, 0.18 + (i % 2) * 0.1), 3); } });
        g.save(); g.beginPath(); g.rect(-600, -500, lim + 600, 600); g.clip();
        const ale = (x, y, s, r, L) => { g.save(); g.translate(x, y); g.rotate(r); g.scale(s, 1); forma(g, gg => { gg.beginPath(); gg.moveTo(0, -10); gg.quadraticCurveTo(L * 0.6, -14, L, 4); gg.quadraticCurveTo(L * 0.6, 16, 0, 10); gg.closePath(); }, hueso, { sombra: 4, lw: 3, dentro: gg => { for (let i = 1; i < 5; i++) raya(gg, [[i * L / 5, -10], [i * L / 5, 10]], frio(hueso, 0.35), 2); } }); g.restore(); };
        ale(-60, -60, -1, -0.9, 100); ale(-40, -110, -1, 0.7, 90); ale(180, -70, -1, -0.8, 70); ale(200, -100, -1, 0.6, 60);
        for (let i = 0; i < 14; i++) { const [x, y] = col[2 + i]; raya(g, [[x, y - 2], [x + 6, y + 30, x - 2, y + 54 - i * 2]], C.LINEA, 6); raya(g, [[x, y - 2], [x + 6, y + 30, x - 2, y + 54 - i * 2]], hueso, 3.2); }
        espina(g, col, hueso, 9, 4.5, 2.5);
        forma(g, poli([[380, -40], [430, -110], [440, -96], [400, -34], [440, 10], [426, 18]]), tono(hueso, -0.08), { sombra: 4, lw: 3 });
        g.save(); g.translate(-300, -26); g.scale(0.95, 0.95); cr.atras(g, {}); g.restore();
        g.restore();
        if (losa && k < 1) { g.save(); g.beginPath(); g.rect(lim, -500, 1200, 600); g.clip(); for (let i = 0; i < 5; i++) forma(g, elip(lim + 40 + i * 120, -110 + C.hash(i) * 60, 90, 70), tono(roca, 0.06 + C.hash(i * 2) * 0.08), { sombra: 8, brillo: 0, lw: 3 }); g.restore(); }
      },
      frente() {}
    };
  };

  /* Objetos agregados para Angela Woodruff (21 nov 2026): documentos tecleados, máquina de escribir, teléfono, lupa,
     tubo de ensayo, maletín, reloj de pared, calendario, monitor, carpa, tablero de corcho, taza, manta, lápida,
     carpeta, archivero y estrado. Sin logos ni marcas. */
  TIPOS.documento = o => {
    const est = o.estilo || 'limpio', papel = o.papel || (est === 'certificado' ? '#eef0e6' : '#f4f0e4'), ink = '#2a2730', W = 150, H = 200;
    const filas = est === 'firmas' ? 4 : 10;
    return {
      ancho: W, anclas: [],
      atras(g, e) {
        const k = e.trazo ?? 1, hu = e.huellas ?? 0, ta = e.tachado ?? 0;
        forma(g, rr(-W / 2, -H, W, H, 3), papel, { sombra: 3, brillo: 2, lw: 3.5, dentro: gg => {
          gg.lineCap = 'round';
          if (est === 'certificado') { gg.fillStyle = '#5a6a5a'; gg.fillRect(-W / 2, -H, W, 26); gg.strokeStyle = 'rgba(42,39,48,0.45)'; gg.lineWidth = 2; for (let i = 0; i < 4; i++) { gg.beginPath(); gg.moveTo(-W / 2 + 16, -H + 48 + i * 14); gg.lineTo(-W / 2 + 16 + 80 + C.hash(i) * 30, -H + 48 + i * 14); gg.stroke(); } gg.strokeRect(-W / 2 + 14, -H + 116, W - 28, 40); gg.fillStyle = ink; gg.font = `800 22px ${C.FUENTE}`; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText(o.texto || 'VEJEZ', 0, -H + 137); if (ta > 0) { gg.strokeStyle = '#c0392b'; gg.lineWidth = 5; gg.beginPath(); gg.moveTo(-W / 2 + 18, -H + 150); gg.lineTo(-W / 2 + 18 + (W - 36) * ta, -H + 124); gg.stroke(); } return; }
          const torpe = est === 'torpe';
          gg.fillStyle = ink; gg.font = `700 11px ${C.FUENTE}`;
          for (let i = 0; i < filas; i++) {
            const n = Math.round((torpe ? 14 : 17) * (0.55 + 0.45 * C.hash(i * 2.3 + (torpe ? 1 : 0))) * C.clamp(k * filas - i));
            const y0 = -H + 24 + i * (est === 'firmas' ? 14 : 13), inc = torpe ? (C.hash(i * 5.1) - 0.5) * 0.06 : 0;
            for (let j = 0; j < n; j++) { const x = -W / 2 + 14 + j * 7, y = y0 + j * 7 * inc + (torpe ? (C.hash(i * 31 + j) - 0.5) * 2.4 : 0); gg.globalAlpha = torpe ? 0.45 + 0.55 * C.hash(j * 7 + i) : 0.85; gg.fillRect(x, y, 5, torpe && C.hash(j + i * 13) > 0.85 ? 7 : 5); }
          }
          gg.globalAlpha = 1;
          if (torpe && k > 0.5) { gg.strokeStyle = ink; gg.lineWidth = 2; gg.beginPath(); gg.moveTo(-20, -H + 66); gg.lineTo(30, -H + 66); gg.stroke(); }
          const fy = est === 'firmas' ? -H + 110 : -36;
          gg.strokeStyle = 'rgba(42,39,48,0.5)'; gg.lineWidth = 1.5; gg.strokeRect(-W / 2 + 14, fy - 18, W - 28, 30);
          if (k > 0.9) { gg.strokeStyle = '#1f2a5a'; gg.lineWidth = torpe ? 2.6 : 2; gg.beginPath(); if (torpe) { gg.moveTo(-40, fy); gg.lineTo(-30, fy - 10); gg.lineTo(-22, fy + 4); gg.lineTo(-6, fy - 8); gg.lineTo(6, fy + 2); gg.lineTo(18, fy - 6); } else { gg.moveTo(-44, fy); gg.bezierCurveTo(-30, fy - 16, -20, fy + 10, -6, fy - 4); gg.bezierCurveTo(6, fy - 14, 16, fy + 6, 30, fy - 6); gg.bezierCurveTo(38, fy - 10, 44, fy - 2, 50, fy - 4); } gg.stroke(); }
          if (est === 'firmas') { for (let i = 0; i < 2; i++) { const yy = -H + 160 + i * 0; gg.strokeStyle = '#1f2a5a'; gg.lineWidth = 2; gg.beginPath(); gg.moveTo(-50, yy); gg.bezierCurveTo(-34, yy - 14, -24, yy + 8, -8, yy - 4); gg.bezierCurveTo(4, yy - 12, 14, yy + 6, 34, yy - 6); gg.stroke(); } }
          if (hu > 0) { gg.fillStyle = `rgba(40,80,200,${0.35 * hu})`; gg.fillRect(-W / 2, -H, W, H); gg.strokeStyle = `rgba(220,240,255,${0.9 * hu})`; gg.lineWidth = 1.4; for (const [cx, cy] of [[-30, -120], [36, -70], [10, -150]]) for (let r = 3; r < 16; r += 3) { gg.beginPath(); gg.ellipse(cx, cy, r, r * 1.3, 0.3, 0.3, TAU - 0.4); gg.stroke(); } }
        } });
      },
      frente() {}
    };
  };

  TIPOS.maquina = o => {
    const col = o.color || '#d9cfb4', osc = tono(col, -0.35);
    return {
      ancho: 260, anclas: [],
      atras(g, e) {
        contacto(g, 0, 280, 0.25);
        const hoja = e.hoja ?? 0;
        if (hoja > 0) forma(g, rr(-70, -150 - 70 * hoja, 140, 70 * hoja + 20, 2), '#f4f0e4', { sombra: 2, lw: 3, dentro: gg => { gg.fillStyle = '#2a2730'; for (let i = 0; i < Math.floor(hoja * 5); i++) gg.fillRect(-56, -140 - 70 * hoja + 10 + i * 12, 70 + C.hash(i) * 40, 4); } });
        forma(g, rr(-120, -150, 240, 24, 10), osc, { sombra: 4, lw: 4 });
        forma(g, elip(-128, -138, 12, 12), '#2a2a2a', { sombra: 2, lw: 3 }); forma(g, elip(128, -138, 12, 12), '#2a2a2a', { sombra: 2, lw: 3 });
        forma(g, poli([[-130, -126], [130, -126], [140, -10], [-140, -10]]), col, { sombra: 10, dentro: gg => raya(gg, [[-120, -112], [120, -112]], tono(col, 0.25), 3) });
        const tecla = (e.t || 0) * 11;
        for (let f = 0; f < 3; f++) for (let c = 0; c < 9 - f; c++) { const x = -96 + f * 12 + c * 24, y = -88 + f * 22, baja = e.teclea && Math.floor(tecla) % 9 === c && f === Math.floor(tecla / 9) % 3 ? 3 : 0; forma(g, elip(x, y + baja, 9, 7), '#2f2f33', { sombra: 1, brillo: 2, lw: 2.5 }); }
        forma(g, rr(-60, -26, 120, 12, 6), '#2f2f33', { sombra: 2, lw: 3 });
        forma(g, rr(-150, -12, 300, 12, 4), osc, { sombra: 3, lw: 3.5 });
      },
      frente() {}
    };
  };

  TIPOS.telefono = o => {
    const col = o.color || '#3a3a40';
    return {
      ancho: 160, anclas: [],
      atras(g, e) {
        const tiembla = e.suena ? Math.sin((e.t || 0) * 60) * 3 : 0, desc = e.descolgado ?? 0;
        contacto(g, 0, 170, 0.22);
        g.save(); g.translate(tiembla, 0);
        forma(g, poli([[-70, -60], [70, -60], [80, 0], [-80, 0]]), col, { sombra: 8, dentro: gg => { gg.fillStyle = '#e8e2d2'; gg.beginPath(); gg.arc(0, -30, 20, 0, TAU); gg.fill(); gg.fillStyle = col; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; gg.beginPath(); gg.arc(Math.cos(a) * 14, -30 + Math.sin(a) * 14, 3, 0, TAU); gg.fill(); } } });
        if (desc < 0.5) forma(g, gg => { gg.beginPath(); gg.moveTo(-84, -66); gg.quadraticCurveTo(0, -98, 84, -66); gg.lineTo(84, -52); gg.lineTo(56, -52); gg.quadraticCurveTo(0, -74, -56, -52); gg.lineTo(-84, -52); gg.closePath(); }, col, { sombra: 5, lw: 4 });
        if (e.suena) { g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 4; for (const s of [-1, 1]) for (let r = 0; r < 2; r++) { g.beginPath(); g.arc(s * 100, -80, 14 + r * 12, s > 0 ? -0.8 : Math.PI - 0.8, s > 0 ? 0.8 : Math.PI + 0.8); g.stroke(); } }
        g.restore();
      },
      frente() {}
    };
  };
  TIPOS.auricular = o => {
    const col = o.color || '#3a3a40';
    return { ancho: 60, anclas: [], atras(g) { forma(g, gg => { gg.beginPath(); gg.moveTo(-14, -90); gg.quadraticCurveTo(-30, -45, -14, 0); gg.lineTo(6, 0); gg.quadraticCurveTo(-6, -45, 6, -90); gg.closePath(); }, col, { sombra: 4, lw: 4 }); forma(g, elip(-4, -92, 16, 9), col, { sombra: 3, lw: 3.5 }); forma(g, elip(-4, 2, 16, 9), col, { sombra: 3, lw: 3.5 }); }, frente() {} };
  };

  TIPOS.lupa = o => {
    const metal = o.color || '#3b3b42';
    return {
      ancho: 160, anclas: [],
      atras(g) { forma(g, rr(-10, -10, 20, 100, 8), '#5a3b26', { sombra: 3, lw: 3.5 }); },
      frente(g) {
        g.save(); g.globalAlpha = 0.25; g.fillStyle = '#cfe8ff'; g.beginPath(); g.arc(0, -70, 58, 0, TAU); g.fill(); g.restore();
        raya(g, [[-30, -108], [-10, -118]], 'rgba(255,255,255,0.8)', 6);
        g.save(); g.lineWidth = 16; g.strokeStyle = C.LINEA; g.beginPath(); g.arc(0, -70, 60, 0, TAU); g.stroke(); g.lineWidth = 9; g.strokeStyle = metal; g.stroke(); g.restore();
      }
    };
  };

  TIPOS.tubo = o => {
    const liq = o.color || '#c9474a';
    return {
      ancho: 120, anclas: [],
      atras(g) {
        contacto(g, 0, 130, 0.2);
        forma(g, rr(-60, -60, 120, 60, 6), '#8a8f98', { sombra: 5, lw: 4 });
        forma(g, rr(-14, -170, 28, 150, 14), 'rgba(230,240,250,0.9)', { sombra: 2, lw: 3.5, dentro: gg => { gg.fillStyle = liq; gg.fillRect(-14, -90, 28, 80); } });
        forma(g, rr(-17, -178, 34, 14, 4), '#4a6a9a', { sombra: 2, lw: 3 });
        forma(g, rr(-13, -150, 26, 34, 2), '#f4f0e4', { sombra: 0.01, lw: 2.5, dentro: gg => { gg.fillStyle = '#2a2730'; gg.fillRect(-9, -144, 18, 3); gg.fillRect(-9, -136, 12, 3); } });
      },
      frente(g) { forma(g, rr(-60, -60, 120, 26, 4), tono('#8a8f98', -0.1), { sombra: 3, lw: 3.5 }); }
    };
  };

  TIPOS.maletin = o => {
    const col = o.color || '#3a2418';
    return {
      ancho: 200, anclas: [],
      atras(g) {
        contacto(g, 0, 210, 0.22);
        raya(g, [[-30, -110], [0, -150, 30, -110]], C.LINEA, 14); raya(g, [[-30, -110], [0, -150, 30, -110]], tono(col, 0.1), 8);
        forma(g, gg => { gg.beginPath(); gg.moveTo(-90, -110); gg.lineTo(90, -110); gg.quadraticCurveTo(104, -60, 96, 0); gg.lineTo(-96, 0); gg.quadraticCurveTo(-104, -60, -90, -110); gg.closePath(); }, col, { sombra: 10, dentro: gg => raya(gg, [[-92, -96], [92, -96]], tono(col, 0.2), 3) });
        forma(g, rr(-14, -104, 28, 14, 3), '#c9a54a', { sombra: 2, lw: 3 });
      },
      frente() {}
    };
  };

  TIPOS.reloj = o => {
    const marco = o.color || '#5a3b26';
    return {
      ancho: 160, anclas: [],
      atras(g, e) {
        forma(g, elip(0, -80, 80, 80), marco, { sombra: 6 }); forma(g, elip(0, -80, 64, 64), '#f4efe2', { sombra: 2, lw: 3, dentro: gg => { gg.fillStyle = '#2a2730'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; gg.fillRect(Math.cos(a) * 52 - 2, -80 + Math.sin(a) * 52 - 2, 4, 4); } } });
        const t = e.t || 0, h = (e.hora ?? 11.5) / 12 * TAU - Math.PI / 2, m = (e.hora ?? 11.5) % 1 * TAU - Math.PI / 2 + t * 0.05;
        raya(g, [[0, -80], [Math.cos(h) * 32, -80 + Math.sin(h) * 32]], '#2a2730', 6); raya(g, [[0, -80], [Math.cos(m) * 48, -80 + Math.sin(m) * 48]], '#2a2730', 4);
        const s = t * TAU / 60 * 6 - Math.PI / 2; raya(g, [[0, -80], [Math.cos(s) * 50, -80 + Math.sin(s) * 50]], '#c0392b', 2);
      },
      frente() {}
    };
  };

  TIPOS.calendario = o => {
    const col = o.color || '#c0392b';
    return {
      ancho: 200, anclas: [],
      atras(g, e) {
        forma(g, rr(-100, -240, 200, 240, 6), '#f4f0e4', { sombra: 5, dentro: gg => {
          gg.fillStyle = col; gg.fillRect(-100, -240, 200, 46); gg.fillStyle = '#fff'; gg.font = `800 28px ${C.FUENTE}`; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText(o.mes || 'JUNIO', 0, -216);
          gg.fillStyle = '#2a2730'; gg.font = `600 14px ${C.FUENTE}`; for (let i = 0; i < 30; i++) { const c = i % 7, f = Math.floor(i / 7); gg.fillText(String(i + 1), -78 + c * 26, -170 + f * 32); }
          const d = (o.dia || 24) - 1, c = d % 7, f = Math.floor(d / 7), a = e.marca ?? 1;
          if (a > 0) { gg.strokeStyle = col; gg.lineWidth = 4; gg.beginPath(); gg.arc(-78 + c * 26, -170 + f * 32, 14, 0, TAU * a); gg.stroke(); }
        } });
      },
      frente() {}
    };
  };

  TIPOS.monitor = o => {
    const col = o.color || '#d9d2bd';
    return {
      ancho: 300, anclas: [],
      atras(g, e) {
        contacto(g, 0, 300, 0.22);
        forma(g, rr(-130, -40, 260, 40, 6), col, { sombra: 5 });
        forma(g, rr(-140, -280, 280, 230, 18), col, { sombra: 10 });
        forma(g, rr(-116, -258, 232, 180, 10), '#163a2a', { sombra: 0.01, lw: 3.5, dentro: gg => {
          gg.font = `700 15px monospace`; gg.textBaseline = 'middle'; const fil = o.filas || ['12/03/98', '04/05/98', '30/05/98', '15/06/98', '25/06/98', '26/06/98'];
          fil.forEach((f, i) => { const hi = (e.resalta ?? 0) > 0 && i >= fil.length - 2; if (hi) { gg.fillStyle = `rgba(255,213,74,${0.35 * e.resalta})`; gg.fillRect(-110, -244 + i * 26, 220, 22); } gg.fillStyle = hi ? '#ffd54a' : '#6fe38f'; gg.fillText(f, -102, -233 + i * 26); gg.fillRect(0, -236 + i * 26, 60 + C.hash(i) * 40, 4); });
          gg.fillStyle = 'rgba(111,227,143,0.07)'; for (let y = -258; y < -78; y += 6) gg.fillRect(-116, y, 232, 2);
        } });
      },
      frente() {}
    };
  };

  TIPOS.carpa = o => {
    const tela = o.color || '#f2f2ee';
    return {
      ancho: 520, anclas: [],
      atras(g, e) {
        const luz = e.luz ?? 0;
        if (luz > 0) { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(0, -160, 30, 0, -160, 520); gr.addColorStop(0, `rgba(230,240,255,${0.5 * luz})`); gr.addColorStop(1, 'rgba(230,240,255,0)'); g.fillStyle = gr; g.fillRect(-600, -700, 1200, 800); g.restore(); }
        contacto(g, 0, 560, 0.25);
        forma(g, poli([[-250, 0], [-250, -230], [0, -330], [250, -230], [250, 0]]), tela, { sombra: 12, dentro: gg => { raya(gg, [[0, -330], [0, 0]], frio(tela, 0.2), 4); raya(gg, [[-250, -230], [250, -230]], frio(tela, 0.15), 3); if (luz > 0) { gg.fillStyle = `rgba(255,250,220,${0.35 * luz})`; gg.fillRect(-250, -330, 500, 330); } } });
        forma(g, poli([[-60, 0], [-60, -170], [60, -170], [60, 0]]), frio(tela, 0.25), { sombra: 3, lw: 3 });
      },
      frente() {}
    };
  };

  TIPOS.tablero = o => {
    const corcho = o.color || '#b98c58', N = o.n || 15;
    return {
      ancho: 640, anclas: [],
      atras(g, e) {
        forma(g, rr(-320, -420, 640, 400, 8), '#6b4a30', { sombra: 6 });
        forma(g, rr(-300, -400, 600, 360, 4), corcho, { sombra: 0.01, lw: 3, dentro: gg => { gg.fillStyle = 'rgba(80,50,20,0.18)'; for (let i = 0; i < 80; i++) gg.fillRect(-300 + C.hash(i) * 600, -400 + C.hash(i * 3) * 360, 3, 3); } });
        const m = e.marcas ?? 0;
        for (let i = 0; i < N; i++) { const c = i % 5, f = Math.floor(i / 5), x = -240 + c * 120, y = -370 + f * 112;
          forma(g, rr(x - 44, y, 88, 90, 4), ['#e9d9a6', '#d8e4ee', '#efe0d0'][i % 3], { sombra: 2, lw: 3, dentro: gg => { gg.fillStyle = '#2a2730'; gg.font = `800 26px ${C.FUENTE}`; gg.textAlign = 'center'; gg.fillText(String(i + 1), x, y + 52); } });
          forma(g, elip(x, y + 4, 7, 7), '#c0392b', { sombra: 1, lw: 2.5 });
          if (m > i) { raya(g, [[x + 14, y + 66], [x + 24, y + 78], [x + 42, y + 52]], '#c0392b', 6); } }
      },
      frente() {}
    };
  };

  TIPOS.taza = o => {
    const col = o.color || '#e8e2d2';
    return { ancho: 80, anclas: [], atras(g) { contacto(g, 0, 90, 0.2); raya(g, [[30, -50], [52, -40, 30, -20]], C.LINEA, 12); raya(g, [[30, -50], [52, -40, 30, -20]], col, 6); forma(g, poli([[-32, -64], [32, -64], [26, 0], [-26, 0]]), col, { sombra: 5, dentro: gg => raya(gg, [[-30, -48], [30, -48]], '#8a5a9a', 4) }); forma(g, elip(0, -64, 32, 7), '#5a3a26', { sombra: 1, lw: 3 }); }, frente() {} };
  };

  TIPOS.manta = o => {
    const col = o.color || '#8aa0b8';
    return { ancho: 220, anclas: [], atras(g) { contacto(g, 0, 230, 0.2); forma(g, rr(-110, -50, 220, 50, 14), col, { sombra: 8, dentro: gg => { for (let x = -90; x < 110; x += 40) raya(gg, [[x, -50], [x, 0]], frio(col, 0.25), 6); raya(gg, [[-110, -26], [110, -26]], tono(col, 0.2), 3); } }); }, frente() {} };
  };

  TIPOS.lapida = o => {
    const piedra = o.color || '#9a9a96';
    return {
      ancho: 220, anclas: [],
      atras(g, e) {
        contacto(g, 0, 260, 0.28);
        forma(g, gg => { gg.beginPath(); gg.moveTo(-90, 0); gg.lineTo(-90, -220); gg.arc(0, -220, 90, Math.PI, 0); gg.lineTo(90, 0); gg.closePath(); }, piedra, { sombra: 12, dentro: gg => { raya(gg, [[-40, -230], [40, -230]], frio(piedra, 0.35), 5); raya(gg, [[-50, -190], [50, -190]], frio(piedra, 0.3), 3); raya(gg, [[-46, -170], [46, -170]], frio(piedra, 0.3), 3); raya(gg, [[-30, -150], [30, -150]], frio(piedra, 0.3), 3); } });
        forma(g, rr(-110, -16, 220, 16, 4), tono(piedra, -0.15), { sombra: 3, lw: 3.5 });
      },
      frente() {}
    };
  };

  TIPOS.carpeta = o => {
    const col = o.color || '#c9a45a';
    return {
      ancho: 220, anclas: [],
      atras(g, e) {
        forma(g, poli([[-110, -150], [-40, -150], [-28, -164], [20, -164], [32, -150], [110, -150], [110, 0], [-110, 0]]), col, { sombra: 6, dentro: gg => { if (o.texto || e.texto) { gg.fillStyle = '#f4f0e4'; gg.fillRect(-70, -110, 140, 40); gg.strokeStyle = '#2a2730'; gg.lineWidth = 2; gg.strokeRect(-70, -110, 140, 40); gg.fillStyle = '#2a2730'; gg.font = `800 16px ${C.FUENTE}`; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText(e.texto || o.texto, 0, -89); } } });
        if (e.grosor) for (let i = 1; i < 4; i++) raya(g, [[-104, -i * 5], [104, -i * 5]], '#f4f0e4', 3);
      },
      frente() {}
    };
  };

  TIPOS.archivero = o => {
    const col = o.color || '#7d848c';
    return {
      ancho: 220, anclas: [],
      atras(g, e) {
        contacto(g, 0, 240, 0.25);
        forma(g, rr(-100, -440, 200, 440, 6), col, { sombra: 10 });
        const ab = e.abierto ?? 0;
        for (let i = 0; i < 4; i++) { const sale = i === 1 ? ab * 40 : 0; forma(g, rr(-88 - sale * 0.2, -428 + i * 106, 176 + sale * 0.4, 96 + sale * 0.3, 4), tono(col, 0.08), { sombra: 4, lw: 3.5, dentro: gg => { gg.fillStyle = '#f4f0e4'; gg.fillRect(-30, -414 + i * 106, 60, 18); } }); forma(g, rr(-26, -380 + i * 106 + sale * 0.15, 52, 10, 5), '#3b3b42', { sombra: 1, lw: 2.5 }); }
      },
      frente() {}
    };
  };

  TIPOS.estrado = o => {
    const madera = o.color || '#6b4528', W = o.ancho || 300;
    return {
      ancho: W, anclas: [{ x: 0, y: -110, escala: 1 }],
      interior(g) { g.beginPath(); g.rect(-W, -2000, W * 2, 1790); },
      atras(g) { contacto(g, 0, W * 1.1, 0.25); forma(g, rr(-W / 2, -260, W, 40, 4), tono(madera, -0.2), { sombra: 4 }); },
      frente(g) {
        forma(g, rr(-W / 2, -230, W, 230, 6), madera, { sombra: 10, dentro: gg => { for (let x = -W / 2 + 30; x < W / 2; x += 60) forma(gg, rr(x, -200, 40, 170, 6), tono(madera, 0.08), { sombra: 3, brillo: 2, lw: 2.5 }); } });
        forma(g, rr(-W / 2 - 10, -244, W + 20, 20, 6), tono(madera, 0.15), { sombra: 3, lw: 3.5 });
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
      dentro.forEach((fn, i) => {
        if (!fn) return; const a = ob.anclas[i];
        g.save(); if (ob.interior) { ob.interior(g, i); g.clip(ob.reglaInterior || 'nonzero'); }
        g.translate(a.x, a.y); if (e.espejo) g.scale(-1, 1); if (a.rot) g.rotate(a.rot * Math.PI / 180);
        fn(g, { x: 0, y: 0, escala: a.escala ?? 1, enObjeto: true }); g.restore();
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
    for (const [id, r] of Object.entries(def.personajes || {})) pers[id] = (r.v === 2 ? C.personaje2 : (C.personaje3 || C.personaje2))({ ...r, id });
    const falta = (que, id, hay) => { throw new Error(`${que} "${id}" no está en la historia. Definidos: ${Object.keys(hay).join(', ') || 'ninguno'}. Se agrega una sola vez en C.historia({...}).`); };
    return Object.freeze({ def, obj: id => objs[id] || falta('el objeto', id, objs), per: id => pers[id] || falta('el personaje', id, pers), paleta: Object.freeze({ ...(def.paleta || {}) }) });
  };
})();
