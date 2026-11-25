/* efectos: acabado de cine compartido por Dato Puro (K) e historias (C). Objeto global EF.
   - EF.luzFuga(g, W, H, u, {semilla, colores, fuerza}): destello de luz cálida ("light leak") para un corte; u va de 0 a 1
     (crece la primera mitad, se va la segunda). Poner el corte de escena en u = 0.5, cuando la luz tapa más.
   - EF.zoomParejo(a, b, u): escala de a a b que se siente a velocidad pareja (interpolación en escala logarítmica).
   - EF.posterizar(t, fps): tiempo "a dos" (12 cuadros por segundo) para animar personajes como caricatura a mano.
   Desenfoque de movimiento y color final no van aquí: ver window.DESENFOQUE y "color" en comun/acabado.py.
   Referencias:
   https://github.com/remotion-dev/remotion/blob/main/packages/skills/skills/remotion-markup/light-leaks.md : idea del
     destello sobre el corte con progreso 0→1 (aparece y se retira) y semilla para variar la forma.
   https://github.com/remotion-dev/remotion/blob/main/packages/skills/skills/remotion-markup/timing.md : 'perceptual-scale'
     (la escala se percibe en proporción, por eso se interpola su logaritmo) y posterize (muestrear cada n cuadros).
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation : modo 'screen' para
     que la luz aclare sin tapar. */
(() => {
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const hs = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const rgb = c => { c = c.replace('#', ''); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)); };
  const EF = {
    luzFuga(g, W, H, u, o = {}) {
      if (u <= 0 || u >= 1) return;
      const s = o.semilla ?? 1, cols = o.colores || ['#ffb347', '#ff6a3d', '#ffd98a', '#ff4d8d'];
      const k = Math.pow(Math.sin(Math.PI * cl(u)), 1.4) * (o.fuerza ?? 0.7);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen';
      const ang = (hs(s) - 0.5) * 1.2 + 0.6, dx = Math.cos(ang), dy = Math.sin(ang), D = Math.hypot(W, H);
      for (let j = 0; j < 4; j++) {
        const avance = (u - 0.5) * (0.5 + hs(s + j) * 0.6);
        const x = W * (0.2 + 0.6 * hs(s * 3 + j)) + dx * D * avance, y = H * (0.15 + 0.7 * hs(s * 7 + j)) + dy * D * avance;
        const r = D * (0.18 + 0.22 * hs(s * 5 + j)) * (0.6 + 0.5 * k);
        const [R, G, B] = rgb(cols[j % cols.length]);
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, `rgba(${R},${G},${B},${0.7 * k})`); gr.addColorStop(0.4, `rgba(${R},${G},${B},${0.22 * k})`); gr.addColorStop(1, `rgba(${R},${G},${B},0)`);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
      }
      const c = 0.5 + (u - 0.5) * 1.6, lg = g.createLinearGradient(W * (0.5 - dx), H * (0.5 - dy), W * (0.5 + dx), H * (0.5 + dy));
      lg.addColorStop(cl(c - 0.12), 'rgba(255,240,210,0)'); lg.addColorStop(cl(c), `rgba(255,240,210,${0.4 * k})`); lg.addColorStop(cl(c + 0.12), 'rgba(255,240,210,0)');
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
      g.restore();
    },
    zoomParejo: (a, b, u) => a * Math.pow(b / a, cl(u)),
    posterizar: (t, fps = 12) => Math.floor(t * fps + 1e-6) / fps
  };
  window.EF = EF;
  if (window.K) { K.luzFuga = EF.luzFuga; K.zoomParejo = EF.zoomParejo; K.posterizar = EF.posterizar; }
  if (window.C) { C.luzFuga = EF.luzFuga; C.zoomParejo = EF.zoomParejo; C.posterizar = EF.posterizar; }
})();
