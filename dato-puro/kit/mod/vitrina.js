/* vitrina: acabado de anuncio de producto para Dato Puro (24 nov 2026).
   - K.resplandor(g, t, tramos, o): fondo negro con manchas de luz que flotan y cambian de color por tramo del guion.
   - K.titular(g, texto, t, t0, o): titular que entra palabra por palabra, de borroso a nítido, y sale suave.
   - K.celular(o): celular con pantalla animada, giro en 3D (perspectiva real por franjas), canto, reflejo y brillo debajo.
   - K.ui: piezas para dibujar la pantalla (barra, título, fila, tarjeta, botón, mapa, aviso, señal).
   Referencias:
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/filter : desenfoque por palabra (filter = 'blur(px)') en el titular.
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/drawImage : la pantalla se dibuja en un lienzo aparte y se copia en franjas verticales.
   https://en.wikipedia.org/wiki/3D_projection#Perspective_projection : x' = x·d/(d+z); cada franja se escala según su profundidad, así el giro se ve en perspectiva y no aplastado.
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/createRadialGradient : manchas de luz del fondo y brillo bajo el celular. */
(() => {
  const cl = K.clamp, lerp = K.lerp;
  const hex = c => { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)); };
  const mezcla = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
  const rgba = (c, a) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; };
  K.mezclaColor = mezcla; K.rgba = rgba;

  K.resplandor = (g, t, tramos, o = {}) => {
    let i = 0;
    while (i + 1 < tramos.length && t >= tramos[i + 1].t) i++;
    const A = tramos[i], B = tramos[Math.min(i + 1, tramos.length - 1)];
    const k = B === A ? 0 : K.ease(cl((t - B.t + (o.cambio ?? 0.8)) / (o.cambio ?? 0.8)));
    const col = j => mezcla(A.c[j % A.c.length], B.c[j % B.c.length], k);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = o.base || '#05040a'; g.fillRect(0, 0, K.W, K.H);
    g.globalCompositeOperation = 'lighter';
    const n = o.manchas ?? 3, f = o.fuerza ?? 0.55;
    for (let j = 0; j < n; j++) {
      const x = K.W * (0.5 + 0.38 * Math.sin(t * 0.21 + j * 2.1)), y = K.H * (0.52 + 0.3 * Math.cos(t * 0.17 + j * 1.7) + (j - 1) * 0.12);
      const r = K.W * (0.75 + 0.15 * Math.sin(t * 0.3 + j));
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, rgba(col(j), f)); gr.addColorStop(0.45, rgba(col(j), f * 0.35)); gr.addColorStop(1, rgba(col(j), 0));
      g.fillStyle = gr; g.fillRect(0, 0, K.W, K.H);
    }
    g.globalCompositeOperation = 'source-over';
    const v = g.createRadialGradient(K.W / 2, K.H * 0.5, K.H * 0.25, K.W / 2, K.H * 0.5, K.H * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${o.vineta ?? 0.6})`);
    g.fillStyle = v; g.fillRect(0, 0, K.W, K.H);
    g.restore();
  };

  K.titular = (g, texto, t, t0, o = {}) => {
    const t1 = o.hasta ?? 1e9, paso = o.paso ?? 0.09, dur = o.dur ?? 0.45;
    const sale = K.ease(cl((t - t1) / 0.35));
    if (t < t0 - 0.01 || sale >= 1) return;
    const fs = o.fs ?? 82, inter = fs * 1.12, fuente = o.fuente || '"Inter Display", Inter, sans-serif', peso = o.peso ?? 800;
    const lineas = texto.split('\n'), x = o.x ?? K.W / 2, y0 = o.y ?? 330;
    const resalta = o.resalta || [], colR = o.colorResalta || '#ffd23f', col = o.color || '#ffffff';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    g.font = `${peso} ${fs}px ${fuente}`;
    const esp = g.measureText(' ').width;
    let n = 0;
    lineas.forEach((ln, li) => {
      const ws = ln.split(' '), an = ws.map(w => g.measureText(w).width), tot = an.reduce((a, b) => a + b, 0) + esp * (ws.length - 1);
      let xx = o.alinear === 'izq' ? x : x - tot / 2;
      const y = y0 + li * inter;
      ws.forEach((w, wi) => {
        const u = K.easeOut((t - t0 - n * paso) / dur); n++;
        if (u > 0.001) {
          const limpio = w.replace(/[¿?¡!,.:;]/g, '').toLowerCase();
          g.globalAlpha = u * (1 - sale);
          g.filter = `blur(${((1 - u) * 14 + sale * 10).toFixed(1)}px)`;
          g.fillStyle = resalta.includes(limpio) ? colR : col;
          if (o.sombra !== false) { g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 24; }
          g.fillText(w, xx, y + (1 - u) * fs * 0.35 - sale * 18);
        }
        xx += an[wi] + esp;
      });
    });
    g.filter = 'none'; g.restore();
  };

  K.ui = {
    C: { fondo: '#0d0d12', tarjeta: '#1b1b24', linea: 'rgba(255,255,255,0.08)', texto: '#f4f4f7', tenue: 'rgba(244,244,247,0.55)', acento: '#ff3b5c', azul: '#3d8bff', verde: '#30d158' },
    rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); },
    txt(g, s, x, y, fs, col, peso = 600, al = 'left') { g.font = `${peso} ${fs}px Inter, sans-serif`; g.fillStyle = col; g.textAlign = al; g.textBaseline = 'middle'; g.fillText(s, x, y); },
    barra(g, W, o = {}) { const U = K.ui, c = o.color || U.C.texto; U.txt(g, o.hora || '12:30', 70, 52, 30, c, 700); g.fillStyle = c; [0, 1, 2, 3].forEach(i => g.fillRect(W - 170 + i * 11, 60 - i * 6, 7, 8 + i * 6)); U.rr(g, W - 110, 40, 52, 24, 7); g.strokeStyle = c; g.lineWidth = 2.5; g.stroke(); g.fillRect(W - 106, 44, 34 * (o.bateria ?? 0.8), 16); },
    titulo(g, s, y, o = {}) { K.ui.txt(g, s, 44, y, o.fs ?? 64, o.color || K.ui.C.texto, 800); },
    fila(g, W, y, o = {}) {
      const U = K.ui, h = o.h ?? 112;
      g.globalAlpha *= o.a ?? 1;
      if (o.icono) { U.rr(g, 44, y - 34, 68, 68, 18); g.fillStyle = o.colorIcono || U.C.acento; g.fill(); if (K.ico) K.ico(g, o.icono, 78, y, 40, { color: '#fff' }); }
      const x0 = o.icono ? 136 : 44;
      U.txt(g, o.texto || '', x0, o.sub ? y - 18 : y, 38, U.C.texto, 650);
      if (o.sub) U.txt(g, o.sub, x0, y + 24, 29, U.C.tenue, 500);
      if (o.valor) U.txt(g, o.valor, W - 44, y, 30, o.colorValor || U.C.tenue, 600, 'right');
      g.fillStyle = U.C.linea; g.fillRect(x0, y + h / 2 - 1, W - x0 - 20, 2);
      g.globalAlpha /= (o.a ?? 1) || 1;
    },
    tarjeta(g, x, y, w, h, o = {}) { const U = K.ui; U.rr(g, x, y, w, h, o.r ?? 34); if (o.colores) { const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, o.colores[0]); gr.addColorStop(1, o.colores[1]); g.fillStyle = gr; } else g.fillStyle = o.color || U.C.tarjeta; g.fill(); if (o.texto) U.txt(g, o.texto, x + 30, y + h - 40, o.fs ?? 32, '#fff', 700); },
    boton(g, x, y, w, h, s, o = {}) { const U = K.ui; U.rr(g, x, y, w, h, h / 2); g.fillStyle = o.color || U.C.acento; g.fill(); U.txt(g, s, x + w / 2, y + h / 2, o.fs ?? 32, o.colorTexto || '#fff', 700, 'center'); },
    mapa(g, W, H, t, o = {}) {
      const U = K.ui;
      g.fillStyle = o.fondo || '#1c2230'; g.fillRect(0, 0, W, H);
      g.save(); g.translate(-(o.dx || 0), -(o.dy || 0));
      g.fillStyle = '#1f4a33'; [[80, 300, 260, 200], [520, 980, 300, 260], [140, 1300, 220, 180]].forEach(([x, y, w, h]) => { U.rr(g, x, y, w, h, 40); g.fill(); });
      g.fillStyle = '#1b3f66'; g.beginPath(); g.moveTo(W * 0.62, -50); g.bezierCurveTo(W * 0.9, 400, W * 0.5, 700, W + 60, 1100); g.lineTo(W + 60, -50); g.fill();
      g.lineCap = 'round';
      for (let i = -2; i < 14; i++) { g.strokeStyle = i % 3 ? '#353d4f' : '#5b6580'; g.lineWidth = i % 3 ? 12 : 26; g.beginPath(); g.moveTo(-50, i * 150); g.lineTo(W + 50, i * 150 + 120); g.stroke(); }
      for (let i = -2; i < 8; i++) { g.strokeStyle = i % 2 ? '#353d4f' : '#5b6580'; g.lineWidth = i % 2 ? 12 : 24; g.beginPath(); g.moveTo(i * 170, -50); g.lineTo(i * 170 - 140, H + 300); g.stroke(); }
      const ruta = o.ruta || [[200, 1500], [330, 1180], [300, 880], [560, 700], [600, 420]];
      if (o.progreso != null) {
        const L = []; let tot = 0; for (let i = 1; i < ruta.length; i++) { const d = Math.hypot(ruta[i][0] - ruta[i - 1][0], ruta[i][1] - ruta[i - 1][1]); L.push(d); tot += d; }
        g.lineWidth = 16; g.strokeStyle = o.colorRuta || U.C.azul; g.lineJoin = 'round';
        g.beginPath(); g.moveTo(...ruta[0]); let rest = tot * cl(o.progreso), p = ruta[0];
        for (let i = 1; i < ruta.length && rest > 0; i++) { const k = Math.min(1, rest / L[i - 1]); p = [lerp(ruta[i - 1][0], ruta[i][0], k), lerp(ruta[i - 1][1], ruta[i][1], k)]; g.lineTo(...p); rest -= L[i - 1]; }
        g.stroke(); o.punto = o.punto || p;
      }
      if (o.punto) { const [x, y] = o.punto, pu = (t * 0.8) % 1; g.fillStyle = rgba(U.C.azul, 0.35 * (1 - pu)); g.beginPath(); g.arc(x, y, 30 + pu * 70, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 24, 0, 7); g.fill(); g.fillStyle = U.C.azul; g.beginPath(); g.arc(x, y, 17, 0, 7); g.fill(); }
      g.restore();
    },
    aviso(g, W, t, t0, o = {}) {
      const U = K.ui, u = K.easeBack(cl((t - t0) / 0.5)) * (1 - K.ease(cl((t - (o.hasta ?? 1e9)) / 0.4)));
      if (u <= 0) return; const y = lerp(-180, o.y ?? 110, u);
      g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 30; U.rr(g, 28, y, W - 56, 150, 40); g.fillStyle = 'rgba(40,40,52,0.96)'; g.fill(); g.restore();
      U.rr(g, 56, y + 38, 74, 74, 18); g.fillStyle = o.colorIcono || U.C.verde; g.fill(); if (K.ico) K.ico(g, o.icono || 'map-pin', 93, y + 75, 42, { color: '#fff' });
      U.txt(g, o.titulo || '', 156, y + 54, 36, U.C.texto, 700); U.txt(g, o.texto || '', 156, y + 100, 30, U.C.tenue, 500);
    },
    senal(g, x, y, nivel, o = {}) { for (let i = 0; i < 4; i++) { g.fillStyle = i < nivel ? (o.color || K.ui.C.verde) : 'rgba(255,255,255,0.15)'; K.ui.rr(g, x + i * 16, y - i * 9, 11, 14 + i * 9, 3); g.fill(); } }
  };

  K.celular = (o = {}) => {
    const PW = o.anchoPantalla ?? 780, PH = o.altoPantalla ?? 1690, B = o.bisel ?? 26, R = o.radio ?? 118;
    const W = PW + B * 2, H = PH + B * 2;
    const pant = K.lienzo(PW, PH), gp = pant.getContext('2d');
    const plano = K.lienzo(W, H), gq = plano.getContext('2d');
    const cuerpo = o.color || '#2b2b31', borde = o.borde || '#5a5a63';
    const N = o.franjas ?? 120;
    return {
      pantalla: gp, W: PW, H: PH,
      dibujar(g, t, d = {}) {
        gp.setTransform(1, 0, 0, 1, 0, 0); gp.globalAlpha = 1; gp.filter = 'none';
        gp.fillStyle = K.ui.C.fondo; gp.fillRect(0, 0, PW, PH);
        if (d.pantalla) { gp.save(); d.pantalla(gp, t, PW, PH); gp.restore(); }
        gq.setTransform(1, 0, 0, 1, 0, 0); gq.clearRect(0, 0, W, H);
        K.ui.rr(gq, 0, 0, W, H, R); gq.fillStyle = cuerpo; gq.fill();
        gq.lineWidth = 6; gq.strokeStyle = borde; gq.stroke();
        gq.save(); K.ui.rr(gq, B, B, PW, PH, R - B); gq.clip(); gq.drawImage(pant, B, B);
        const s = d.reflejo ?? 0.5 + 0.5 * Math.sin(t * 0.4);
        const gr = gq.createLinearGradient(0, 0, W, H * 0.6); const p = lerp(-0.3, 1.1, s);
        gr.addColorStop(cl(p - 0.25), 'rgba(255,255,255,0)'); gr.addColorStop(cl(p), 'rgba(255,255,255,0.09)'); gr.addColorStop(cl(p + 0.25), 'rgba(255,255,255,0)');
        gq.fillStyle = gr; gq.fillRect(0, 0, W, H); gq.restore();
        K.ui.rr(gq, W / 2 - 120, B + 26, 240, 70, 35); gq.fillStyle = '#000'; gq.fill();

        const esc = d.escala ?? 0.68, giro = cl(d.giro ?? 0, -1, 1) * (o.giroMax ?? 0.62), dist = (o.distancia ?? 2.4) * H;
        const cx = d.x ?? K.W / 2, cy = d.y ?? K.H * 0.58, co = Math.cos(giro), si = Math.sin(giro);
        const proy = xp => { const z = xp * si, s = dist / (dist + z); return [xp * co * s, s]; };
        g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(cx, cy); g.rotate((d.incl ?? 0) * Math.PI / 180); g.scale(esc, esc);
        if (d.brillo !== false) { const c = d.colorBrillo || '#ff3b5c'; const gb = g.createRadialGradient(0, H * 0.45, 0, 0, H * 0.45, W * 1.1); gb.addColorStop(0, rgba(c, 0.55)); gb.addColorStop(1, rgba(c, 0)); g.fillStyle = gb; g.fillRect(-W * 1.2, -H * 0.2, W * 2.4, H * 1.4); }
        const grosor = (o.grosor ?? 34);
        if (Math.abs(si) > 0.02) {
          const lado = si > 0 ? -1 : 1, xp = lado * W / 2, [x0, s0] = proy(xp), zf = xp * si + grosor * co, sf = dist / (dist + zf), xf = (xp * co - grosor * si * 1) * sf;
          g.fillStyle = mezcla(cuerpo, '#000000', 0.35);
          g.beginPath(); g.moveTo(x0, -H / 2 * s0 + R * s0); g.lineTo(xf, -H / 2 * sf + R * sf); g.lineTo(xf, H / 2 * sf - R * sf); g.lineTo(x0, H / 2 * s0 - R * s0); g.closePath(); g.fill();
        }
        for (let i = 0; i < N; i++) {
          const a = -W / 2 + W * i / N, b = -W / 2 + W * (i + 1) / N, [xa, sa] = proy(a), [xb] = proy(b), sm = (sa + proy(b)[1]) / 2;
          const sw = W / N, dw = Math.max(xb - xa, 0) + 0.6;
          g.drawImage(plano, i * sw, 0, sw, H, Math.min(xa, xb), -H / 2 * sm, dw, H * sm);
        }
        g.restore();
      }
    };
  };
})();
