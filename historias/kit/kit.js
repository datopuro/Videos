(function () {
const K = {};
K.W = (window.FORMATO || {}).ancho || 1080; K.H = (window.FORMATO || {}).alto || 1920;
K.clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
K.lerp = (a, b, u) => a + (b - a) * u;
K.ease = u => { u = K.clamp(u); return u * u * (3 - 2 * u); };
K.ease3 = u => { u = K.clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
K.easeOut = u => 1 - Math.pow(1 - K.clamp(u), 3);
K.easeBack = u => { u = K.clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
K.ap = (t, t0, d = 0.35) => K.easeOut((t - t0) / d);
K.ventana = (t, t0, t1, d = 0.4, d2 = 0.35) => K.ap(t, t0, d) * (1 - K.ap(t, t1, d2));
let semilla = 41;
K.semilla = s => { semilla = s; };
K.rnd = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };

K.datos = D => {
  K.D = D; K.B = D.bloques; K.total = D.total;
  K.seg = (b, i = 0) => D.bloques[b].segmentos[i];
  K.S = (b, i = 0) => D.bloques[b].segmentos[i].ini;
  K.wt = (b, palabra) => { for (const s of D.bloques[b].subs) for (const w of s.palabras) if (w.w.toLowerCase().replace(/[¿?¡!,.:;…"']/g, '') === palabra) return w.ini; throw new Error('wt: ' + palabra + ' no está en ' + b); };
};

K.lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

K.capa2D = (id = 'ov', z = 2) => {
  let c = document.getElementById(id);
  if (!c) { c = K.lienzo(K.W, K.H); c.id = id; Object.assign(c.style, { position: 'absolute', left: 0, top: 0, width: K.W + 'px', height: K.H + 'px', zIndex: z }); document.body.appendChild(c); }
  const g = c.getContext('2d');
  g.limpiar = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.beginPath(); g.clearRect(0, 0, K.W, K.H); };
  return g;
};

K.css = txt => { const s = document.createElement('style'); s.textContent = txt; document.head.appendChild(s); };
K.css(`html,body{margin:0;width:${K.W}px;height:${K.H}px;overflow:hidden;background:#000}`);

if (window.THREE) {
  const T = window.THREE;
  K.P = (x, y, z) => new T.Vector3(x, y, z);
  K.COL = h => new T.Color(h);
  K.tres = (o = {}) => {
    let c = document.getElementById('gl');
    if (!c) { c = K.lienzo(K.W, K.H); c.id = 'gl'; Object.assign(c.style, { position: 'absolute', left: 0, top: 0, zIndex: 1 }); document.body.appendChild(c); }
    const renderer = new T.WebGLRenderer({ canvas: c, antialias: o.antialias !== false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1); renderer.setSize(K.W, K.H, false);
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = o.exposicion ?? 1.0;
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene(); scene.background = new T.Color(o.fondo ?? 0x000000);
    if (o.entorno !== false) scene.environment = new T.PMREMGenerator(renderer).fromScene(new T.RoomEnvironment(), 0.04).texture;
    const cam = new T.PerspectiveCamera(o.fov ?? 35, K.W / K.H, o.cerca ?? 0.05, o.lejos ?? 8000);
    const composer = new T.EffectComposer(renderer);
    composer.setPixelRatio(1); composer.setSize(K.W, K.H);
    composer.addPass(new T.RenderPass(scene, cam));
    let bloom = null;
    if (o.bloom !== false) { const [s, r, u] = o.bloom || [0.45, 0.5, 0.92]; const esc = o.bloomEscala ?? 0.5; bloom = new T.UnrealBloomPass(new T.Vector2(K.W * esc, K.H * esc), s, r, u); composer.addPass(bloom); }
    composer.addPass(new T.OutputPass());
    K.renderer = renderer; K.scene = scene; K.cam = cam; K.composer = composer; K.bloom = bloom;
    K.UPX = (K.H / 2) / Math.tan((cam.fov / 2) * Math.PI / 180);
    return { renderer, scene, cam, composer, bloom };
  };
  K.anchoVisible = d => 2 * d * Math.tan((K.cam.fov / 2) * Math.PI / 180) * K.W / K.H;
  K.texDe = c => { const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; };
  K.alambre = (geo, color = 0xffffff, op = 0.9, angulo = 20, padre) => {
    const l = new T.LineSegments(new T.EdgesGeometry(geo, angulo), new T.LineBasicMaterial({ color, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false }));
    (padre || K.scene).add(l); return l;
  };
}

K.txt = (g, s, x, y, fs, col, a = 1, peso = 700, al = 'center', fuente = '"Inter Display", Inter, sans-serif', sombra = 12) => {
  if (a <= 0.01) return; g.save(); g.globalAlpha = K.clamp(a); g.font = `${peso} ${fs}px ${fuente}`; g.textAlign = al; g.fillStyle = col;
  if (sombra) { g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = sombra; } g.fillText(s, x, y); g.restore();
};
K.parrafo = (g, s, x, y, ancho, fs, col, a = 1, interl = 1.2, peso = 600, al = 'center', fuente = 'Inter, sans-serif') => {
  if (a <= 0.01) return 0; g.save(); g.font = `${peso} ${fs}px ${fuente}`; const ls = []; let l = '';
  for (const w of s.split(' ')) { const p = l ? l + ' ' + w : w; if (g.measureText(p).width > ancho && l) { ls.push(l); l = w; } else l = p; } if (l) ls.push(l); g.restore();
  ls.forEach((q, i) => K.txt(g, q, x, y + i * fs * interl, fs, col, a, peso, al, fuente)); return ls.length * fs * interl;
};
K.MONO = '"DejaVu Sans Mono", monospace';
K.etiqueta = (g, s, x, y, a, o = {}) => {
  if (a <= 0.01) return; g.save(); g.globalAlpha = K.clamp(a); g.font = `500 ${o.fs ?? 26}px ${o.fuente ?? K.MONO}`; const w = g.measureText(s).width + 40, h = (o.fs ?? 26) + 24;
  g.fillStyle = o.fondo ?? 'rgba(8,12,20,0.75)'; g.strokeStyle = o.borde ?? 'rgba(169,212,255,0.35)'; g.lineWidth = 1.5;
  g.beginPath(); g.roundRect(x - w / 2, y - h + 16, w, h, h / 2); g.fill(); g.stroke(); g.fillStyle = o.color ?? '#c8d8ec'; g.textAlign = 'center'; g.fillText(s, x, y); g.restore();
};
K.rotulo = (g, s, x, y, ax, ay, a, o = {}) => {
  if (a <= 0.01) return; g.save(); g.globalAlpha = K.clamp(a); const col = o.color ?? '#a9d4ff';
  g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay); g.lineTo(x, y); g.stroke();
  g.fillStyle = col; g.beginPath(); g.arc(ax, ay, 6, 0, 7); g.fill(); g.restore();
  K.etiqueta(g, s, K.clamp(x, 60 + s.length * 8, K.W - 60 - s.length * 8), y + 10, a, o);
};
K.vineta = (g, fuerza = 0.55, cx = 540, cy = 880) => { const v = g.createRadialGradient(cx, cy, 520, cx, cy + 20, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${fuerza})`); g.fillStyle = v; g.fillRect(0, 0, K.W, K.H); };
K.cortes = (g, t, lista, d = 0.25, color = '#000') => { let m = 0; lista.forEach(c => { const q = Math.abs(t - c); if (q < d) m = Math.max(m, 1 - q / d); }); if (m > 0) { g.save(); g.globalAlpha = K.ease(m); g.fillStyle = color; g.fillRect(0, 0, K.W, K.H); g.restore(); } };
K.flash = (g, t, t0, d = 0.5, color = '#fff') => { const u = (t - t0) / d; if (u < 0 || u > 1) return; g.save(); g.globalAlpha = (1 - u) * (1 - u); g.fillStyle = color; g.fillRect(0, 0, K.W, K.H); g.restore(); };

K.ESTILOS_SUB = {
  limpio: { css: `#cap{position:absolute;top:1430px;left:50px;right:50px;text-align:center;font:600 64px/1.05 "Inter Display",Inter,sans-serif;z-index:5}#cap .w{display:inline-block;margin:0 10px;color:#fff;text-shadow:0 0 6px rgba(0,0,0,.9),0 0 18px rgba(0,0,0,.8)}#cap .w.on{color:var(--acento)}` },
  caja: { css: `#cap{position:absolute;top:1430px;left:60px;right:60px;text-align:center;font:800 60px/1.15 Inter,sans-serif;z-index:5}#cap .w{display:inline-block;margin:0 6px;padding:2px 10px;color:#fff;text-shadow:0 3px 10px rgba(0,0,0,.9)}#cap .w.on{background:var(--acento);color:#000;border-radius:10px;text-shadow:none}` },
};
K.subtitulos = (estilo = 'limpio', acento = '#a9d4ff', top = 1430) => {
  const E = K.ESTILOS_SUB[estilo]; K.css(E.css + `#cap{--acento:${acento};top:${top}px}`);
  const el = document.createElement('div'); el.id = 'cap'; document.body.appendChild(el);
  let prev = '';
  return t => {
    let s = null;
    for (const b of Object.values(K.B)) for (const x of b.subs) if (t >= x.ini - 0.05 && t < x.fin + 0.25) s = x;
    if (!s) { if (prev) { el.innerHTML = ''; prev = ''; } return; }
    let idx = -1; s.palabras.forEach((w, i) => { if (w.ini - 0.04 <= t) idx = i; });
    const html = s.palabras.map((w, i) => { const a = K.clamp((t - (w.ini - 0.06)) / 0.16); return `<span class="w ${i === idx ? 'on' : ''}" style="opacity:${a.toFixed(2)};transform:translateY(${((1 - a) * 12).toFixed(1)}px)">${w.w}</span>`; }).join('');
    if (html !== prev) { el.innerHTML = html; prev = html; }
  };
};
window.K = K;
})();
