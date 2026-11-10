(function () {
const K = {};
K.W = (window.FORMATO || {}).ancho || 1080; K.H = (window.FORMATO || {}).alto || 1920; K.FPS = (window.FORMATO || {}).fps || 30;
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
  K.norm = w => w.toLowerCase().replace(/[¿?¡!,.:;…"'“”«»()—–-]/g, '');
  K.wt = (b, palabra, n = 0) => { const p = K.norm(palabra); let k = 0; for (const s of D.bloques[b].subs) for (const w of s.palabras) if (K.norm(w.w) === p && k++ === n) return w.ini; throw new Error('wt: ' + palabra + ' (aparición ' + n + ') no está en ' + b + '. Palabras: ' + D.bloques[b].subs.flatMap(s => s.palabras.map(w => K.norm(w.w))).join(' ')); };
  K.rms = t => (D.rms || [])[Math.floor(t * K.FPS)] || 0;
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
    if (o.pixel) composer.addPass(new T.RenderPixelatedPass(o.pixel, scene, cam, { normalEdgeStrength: o.bordeNormal ?? 0.3, depthEdgeStrength: o.bordeProf ?? 0.4 }));
    else composer.addPass(new T.RenderPass(scene, cam));
    let bloom = null;
    if (o.bloom !== false) { const [s, r, u] = o.bloom || [0.45, 0.5, 0.92]; const esc = o.bloomEscala ?? 0.5; bloom = new T.UnrealBloomPass(new T.Vector2(K.W * esc, K.H * esc), s, r, u); composer.addPass(bloom); }
    if (o.estela) composer.addPass(new T.AfterimagePass(o.estela));
    composer.addPass(new T.OutputPass());
    K.renderer = renderer; K.scene = scene; K.cam = cam; K.composer = composer; K.bloom = bloom;
    K.UPX = (K.H / 2) / Math.tan((cam.fov / 2) * Math.PI / 180);
    return { renderer, scene, cam, composer, bloom };
  };
  K.anchoVisible = d => 2 * d * Math.tan((K.cam.fov / 2) * Math.PI / 180) * K.W / K.H;

  K.texDe = c => { const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; };
  const vsP = `attribute float size; attribute vec3 color; varying vec3 vC; uniform float uPx; uniform float uFijo; void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize = uFijo>0.5 ? size : size*uPx/max(0.05,-mv.z); gl_Position=projectionMatrix*mv; }`;
  const fsP = `varying vec3 vC; uniform float uOp; void main(){ float r=length(gl_PointCoord-0.5); float a=1.0-smoothstep(0.0,0.5,r); a*=a; if(a<0.01) discard; gl_FragColor=vec4(vC,a*uOp); }`;
  K.nube = (n, fijo = false, padre) => {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('color', new T.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('size', new T.BufferAttribute(new Float32Array(n), 1));
    const mat = new T.ShaderMaterial({ uniforms: { uPx: { value: K.UPX }, uFijo: { value: fijo ? 1 : 0 }, uOp: { value: 1 } }, vertexShader: vsP, fragmentShader: fsP, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
    const p = new T.Points(g, mat); p.frustumCulled = false; (padre || K.scene).add(p);
    const o = { p, g, mat, pos: g.attributes.position.array, col: g.attributes.color.array, size: g.attributes.size.array, n };
    o.sucio = () => ['position', 'color', 'size'].forEach(k => g.attributes[k].needsUpdate = true);
    return o;
  };
  K.estrellas = (n = 9000, radio = 4000, brillo = 0.75) => {
    const o = K.nube(n, true);
    for (let i = 0; i < n; i++) {
      let x, y, z, r; do { x = K.rnd() * 2 - 1; y = K.rnd() * 2 - 1; z = K.rnd() * 2 - 1; r = x * x + y * y + z * z; } while (r > 1 || r < 0.05);
      const l = Math.sqrt(r) / radio; o.pos[i * 3] = x / l; o.pos[i * 3 + 1] = y / l; o.pos[i * 3 + 2] = z / l;
      const k = K.rnd(); const c = k < 0.15 ? K.COL(0xffd2a0) : k < 0.3 ? K.COL(0xa8c8ff) : K.COL(0xffffff);
      const b = Math.pow(K.rnd(), 3) * brillo + 0.08; o.col[i * 3] = c.r * b; o.col[i * 3 + 1] = c.g * b; o.col[i * 3 + 2] = c.b * b;
      o.size[i] = 1.4 + Math.pow(K.rnd(), 6) * 4;
    }
    o.sucio(); return o;
  };
  K.TB = (() => { const c = K.lienzo(256, 256), g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.15, 'rgba(255,255,255,0.6)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return K.texDe(c); })();
  K.halo = (col, s, op = 1, padre) => { const sp = new T.Sprite(new T.SpriteMaterial({ map: K.TB, color: col, transparent: true, opacity: op, depthWrite: false, blending: T.AdditiveBlending })); sp.scale.set(s, s, 1); (padre || K.scene).add(sp); return sp; };

  K.orbita = (obj, az, el, d, cam = K.cam) => { const [x, y, z] = obj; cam.position.set(x + d * Math.sin(az) * Math.cos(el), y + d * Math.sin(el), z + d * Math.cos(az) * Math.cos(el)); cam.lookAt(x, y, z); };
  K.proy = (p, cam = K.cam) => { cam.updateMatrixWorld(); const v = (p.isVector3 ? p.clone() : new T.Vector3(...p)).project(cam); return [(v.x + 1) / 2 * K.W, (1 - v.y) / 2 * K.H, v.z < 1]; };
  K.tomas = (lista, cam = K.cam) => t => {
    let i = 0; while (i < lista.length - 1 && t >= lista[i + 1].t) i++;
    const a = lista[i], b = lista[i + 1];
    let u = 0; if (b && !b.corte) u = (b.curva || K.ease3)(K.clamp((t - a.t) / (b.t - a.t)));
    const q = b && !b.corte ? b : a, L = k => K.lerp(a[k] ?? 0, q[k] ?? a[k] ?? 0, u);
    const obj = [0, 1, 2].map(k => K.lerp(a.obj[k], q.obj[k], u));
    const fov = K.lerp(a.fov ?? cam.fov, q.fov ?? a.fov ?? cam.fov, u);
    if (Math.abs(fov - cam.fov) > 1e-4) { cam.fov = fov; cam.updateProjectionMatrix(); }
    const der = a.deriva ? (t - a.t) * a.deriva : 0;
    K.orbita(obj, L('az') + der, L('el'), L('d'), cam);
    if (a.temblor) { cam.position.x += Math.sin(t * 61) * a.temblor; cam.position.y += Math.cos(t * 47) * a.temblor; }
    return i;
  };
  K.alambre = (geo, color = 0xffffff, op = 0.9, angulo = 20, padre) => {
    const l = new T.LineSegments(new T.EdgesGeometry(geo, angulo), new T.LineBasicMaterial({ color, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false }));
    (padre || K.scene).add(l); return l;
  };
  K.rejilla = (ancho, alto, paso, color = 0xffffff, op = 0.35, padre) => {
    const v = [];
    for (let x = -ancho / 2; x <= ancho / 2 + 1e-6; x += paso) v.push(x, -alto / 2, 0, x, alto / 2, 0);
    for (let y = -alto / 2; y <= alto / 2 + 1e-6; y += paso) v.push(-ancho / 2, y, 0, ancho / 2, y, 0);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(v, 3));
    const l = new T.LineSegments(g, new T.LineBasicMaterial({ color, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false }));
    (padre || K.scene).add(l); return l;
  };

  K.tierra = (o = {}) => {
    const W = 1024, H = 512, c = K.lienzo(W, H), g = c.getContext('2d');
    const per = new Float32Array(4096); for (let i = 0; i < per.length; i++) per[i] = K.rnd();
    const vn = (x, y, p2) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const h = (a, b) => per[(((a % p2) + p2) % p2 * 131 + ((b % 997) + 997) % 997 * 17) % 4096]; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return K.lerp(K.lerp(h(xi, yi), h(xi + 1, yi), u), K.lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v); };
    const fb = (x, y) => { let f = 0, a = 0.5, s = 6; for (let q = 0; q < 6; q++) { f += a * vn(x * s, y * s, s); a *= 0.5; s *= 2; } return f; };
    const id = g.createImageData(W, H), cl = K.lienzo(W, H), g2 = cl.getContext('2d'), il = g2.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const n = fb(x / W, y / H * 0.5), lat = Math.abs(y / H - 0.5) * 2; let r, gg, b; const i = (y * W + x) * 4;
      if (lat > 0.86 + 0.06 * (n - 0.5)) { r = 232; gg = 240; b = 248; }
      else if (n > 0.52) { const m = K.clamp((n - 0.52) * 7); r = K.lerp(52, 110, m); gg = K.lerp(104, 106, m); b = K.lerp(50, 66, m); const cq = K.clamp((fb(x / W * 6.3 + 3, y / H * 3.1) - 0.42) * 4); const city = lat < 0.72 && K.rnd() < cq * cq * 0.4 ? 0.35 + 0.65 * K.rnd() : 0; il.data[i] = 255; il.data[i + 1] = 190; il.data[i + 2] = 110; il.data[i + 3] = city * 255; }
      else { const d = K.clamp((0.52 - n) * 5); r = K.lerp(26, 6, d); gg = K.lerp(86, 30, d); b = K.lerp(146, 84, d); }
      id.data[i] = r; id.data[i + 1] = gg; id.data[i + 2] = b; id.data[i + 3] = 255;
    }
    g.putImageData(id, 0, 0); g2.putImageData(il, 0, 0);
    const R = o.radio ?? 6;
    const gr = new T.Group(); (o.padre || K.scene).add(gr);
    const uL = { value: (o.luz || new T.Vector3(-1, 0.15, -0.15)).normalize() };
    const uOp = { value: 1 };
    const m = new T.Mesh(new T.SphereGeometry(R, 128, 96), new T.ShaderMaterial({ uniforms: { uDia: { value: K.texDe(c) }, uNoche: { value: K.texDe(cl) }, uL, uOp }, transparent: true,
      vertexShader: `varying vec2 vU; varying vec3 vN; varying vec3 vV; void main(){ vU=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `uniform sampler2D uDia; uniform sampler2D uNoche; uniform vec3 uL; uniform float uOp; varying vec2 vU; varying vec3 vN; varying vec3 vV;
        void main(){ float d=dot(normalize(vN),uL); float dia=smoothstep(-0.12,0.25,d); vec3 c=texture2D(uDia,vU).rgb;
          vec4 n=texture2D(uNoche,vU); float noche=(1.0-smoothstep(-0.2,0.08,d));
          vec3 col=c*(0.02+1.1*max(d,0.0))+vec3(1.0,0.72,0.4)*n.a*noche*1.6;
          float f=pow(1.0-max(dot(normalize(vN),vV),0.0),3.0); col+=vec3(0.3,0.55,1.0)*f*(0.15+1.2*dia);
          gl_FragColor=vec4(col,uOp); }` })); gr.add(m);
    const atm = new T.Mesh(new T.SphereGeometry(R * 1.058, 96, 64), new T.ShaderMaterial({ uniforms: { uL, uOp }, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.BackSide,
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: `uniform vec3 uL; uniform float uOp; varying vec3 vN; varying vec3 vV; void main(){ float ndv=abs(dot(vN,vV)); float f=pow(smoothstep(0.0,0.45,ndv),1.5)*(1.0-smoothstep(0.35,0.6,ndv)); float l=smoothstep(-0.3,0.4,dot(-vN,uL)); gl_FragColor=vec4(vec3(0.35,0.65,1.0)*f*(0.1+1.4*l)*uOp,1.0); }` })); gr.add(atm);
    return { gr, m, atm, uL, uOp };
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
K.grano = (g, t, fuerza = 0.035) => { const s0 = semilla; semilla = 1 + (Math.round(t * 30) % 97); g.save(); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${K.rnd() * fuerza})`; g.fillRect(K.rnd() * K.W, K.rnd() * K.H, 2, 2); } g.restore(); semilla = s0; };
K.cortes = (g, t, lista, d = 0.25, color = '#000') => { let m = 0; lista.forEach(c => { const q = Math.abs(t - c); if (q < d) m = Math.max(m, 1 - q / d); }); if (m > 0) { g.save(); g.globalAlpha = K.ease(m); g.fillStyle = color; g.fillRect(0, 0, K.W, K.H); g.restore(); } };
K.flash = (g, t, t0, d = 0.5, color = '#fff') => { const u = (t - t0) / d; if (u < 0 || u > 1) return; g.save(); g.globalAlpha = (1 - u) * (1 - u); g.fillStyle = color; g.fillRect(0, 0, K.W, K.H); g.restore(); };
K.pixelar = (g, x, y, w, h, tam) => { const c = K.lienzo(Math.ceil(w / tam), Math.ceil(h / tam)), q = c.getContext('2d'); q.drawImage(g.canvas, x, y, w, h, 0, 0, c.width, c.height); g.save(); g.imageSmoothingEnabled = false; g.clearRect(x, y, w, h); g.drawImage(c, 0, 0, c.width, c.height, x, y, w, h); g.restore(); };

K.ESTILOS_SUB = {
  marcador: { css: `#cap{position:absolute;top:1440px;left:50px;right:50px;text-align:center;font:800 62px/1.15 "Inter Display",Inter,sans-serif;z-index:5}#cap .w{display:inline-block;margin:0 6px;padding:0 8px;color:#1d1b18;text-shadow:0 0 10px rgba(236,230,218,1),0 0 4px rgba(236,230,218,1)}#cap .w.on{background:linear-gradient(transparent 18%,var(--acento) 18%,var(--acento) 88%,transparent 88%);text-shadow:none}` },
  ocaso: { css: `#cap{position:absolute;top:1450px;left:40px;right:40px;text-align:center;font:800 60px/1.12 "Inter Display",Inter,sans-serif;z-index:5}#cap .w{display:inline-block;margin:0 7px;color:#fff6ea;text-shadow:0 3px 0 rgba(40,10,40,.55),0 0 22px rgba(30,8,40,.9)}#cap .w.on{color:var(--acento);text-shadow:0 3px 0 rgba(40,10,40,.55),0 0 18px rgba(255,140,40,.65)}` },
  limpio: { css: `#cap{position:absolute;top:1430px;left:50px;right:50px;text-align:center;font:600 64px/1.05 "Inter Display",Inter,sans-serif;z-index:5}#cap .w{display:inline-block;margin:0 10px;color:#fff;text-shadow:0 0 6px rgba(0,0,0,.9),0 0 18px rgba(0,0,0,.8)}#cap .w.on{color:var(--acento)}` },
  caja: { css: `#cap{position:absolute;top:1430px;left:60px;right:60px;text-align:center;font:800 60px/1.15 Inter,sans-serif;z-index:5}#cap .w{display:inline-block;margin:0 6px;padding:2px 10px;color:#fff;text-shadow:0 3px 10px rgba(0,0,0,.9)}#cap .w.on{background:var(--acento);color:#000;border-radius:10px;text-shadow:none}` },
  codigo: { css: `#cap{position:absolute;top:1430px;left:70px;right:70px;text-align:left;font:500 50px/1.25 "DejaVu Sans Mono",monospace;z-index:5;color:#e8e8e8}#cap .w{margin-right:22px}#cap .w.on{color:var(--acento)}#cap .cursor{display:inline-block;width:26px;height:52px;background:var(--acento);vertical-align:-8px}` , porLetra: true },
  pixel: { css: `#cap{position:absolute;top:1430px;left:50px;right:50px;text-align:center;font:400 54px/1.2 "DejaVu Sans Mono",monospace;letter-spacing:4px;text-transform:uppercase;z-index:5}#cap .w{display:inline-block;margin:0 12px;color:#fff;text-shadow:4px 4px 0 #000}#cap .w.on{color:var(--acento)}` },
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
    let html;
    if (E.porLetra) {
      html = s.palabras.map((w, i) => { if (w.ini - 0.04 > t) return ''; const u = K.clamp((t - (w.ini - 0.04)) / Math.max(0.08, (w.fin - w.ini) * 0.7)); return `<span class="w ${i === idx ? 'on' : ''}">${w.w.slice(0, Math.ceil(u * w.w.length))}</span>`; }).join('') + (Math.floor(t * 2.5) % 2 === 0 || t < s.fin ? '<span class="cursor"></span>' : '');
    } else {
      html = s.palabras.map((w, i) => { const a = K.clamp((t - (w.ini - 0.06)) / 0.16); return `<span class="w ${i === idx ? 'on' : ''}" style="opacity:${a.toFixed(2)};transform:translateY(${((1 - a) * 12).toFixed(1)}px)">${w.w}</span>`; }).join('');
    }
    if (html !== prev) { el.innerHTML = html; prev = html; }
  };
};
window.K = K;
})();
