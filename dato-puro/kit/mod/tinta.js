(function () {
const T = window.THREE, K = window.K;

K.tinta = (o = {}) => {
  const TI = {};
  const C = TI.C = Object.assign({ tinta: '#1d1b18', papel: '#ece6da', hoja: '#f7f3ea', amarillo: '#ffd23f', rojo: '#e4572e', azul: '#2f5bd3', verde: '#2a9d6f', gris: '#7a746a' }, o.colores || {});
  const hex = c => new T.Color(c);
  const r = K.renderer, scene = K.scene;
  r.toneMapping = T.NoToneMapping; r.shadowMap.enabled = true; r.shadowMap.type = T.BasicShadowMap;
  scene.background = hex(C.papel);

  scene.add(new T.AmbientLight(0xffffff, o.ambiente ?? 0.62));
  const sol = TI.sol = new T.DirectionalLight(0xffffff, o.sol ?? 0.6); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); sol.shadow.bias = -0.001;
  const A = o.areaSombra ?? 9; Object.assign(sol.shadow.camera, { left: -A, right: A, top: A, bottom: -A, near: 0.5, far: 40 });
  scene.add(sol); scene.add(sol.target);
  TI.luz = (x = 0, z = 0) => { sol.position.set(x + 6, 12, z + 3); sol.target.position.set(x, 0, z); };
  TI.luz();

  const grad = (() => { const d = new Uint8Array(o.tonos || [90, 170, 255]); const t = new T.DataTexture(d, d.length, 1, T.RedFormat); t.minFilter = t.magFilter = T.NearestFilter; t.needsUpdate = true; return t; })();
  TI.toon = (color, m = {}) => new T.MeshToonMaterial(Object.assign({ color, gradientMap: grad }, m));
  const ct = hex(C.tinta);
  TI.matContorno = w => new T.ShaderMaterial({ uniforms: { w: { value: w } }, side: T.BackSide,
    vertexShader: `uniform float w; void main(){ vec3 p = position + normal * w; vec4 q = vec4(p, 1.0);
      #ifdef USE_INSTANCING
      q = instanceMatrix * q;
      #endif
      gl_Position = projectionMatrix * modelViewMatrix * q; }`,
    fragmentShader: `void main(){ gl_FragColor = vec4(${ct.r.toFixed(3)}, ${ct.g.toFixed(3)}, ${ct.b.toFixed(3)}, 1.0); }` });
  const GRUESO = TI.matContorno(o.contorno ?? 0.035), FINO = TI.matContorno((o.contorno ?? 0.035) * 0.5);
  const LINEA = new T.LineBasicMaterial({ color: ct });
  const cacheG = {}, matG = w => cacheG[w] || (cacheG[w] = TI.matContorno(w));
  TI.areaSombra = A => { Object.assign(sol.shadow.camera, { left: -A, right: A, top: A, bottom: -A }); sol.shadow.camera.updateProjectionMatrix(); };
  TI.contorno = (malla, fino = false, mat) => { const h = malla.isInstancedMesh ? new T.InstancedMesh(malla.geometry, mat || (fino ? FINO : GRUESO), malla.count) : new T.Mesh(malla.geometry, mat || (fino ? FINO : GRUESO)); if (malla.isInstancedMesh) { h.instanceMatrix = malla.instanceMatrix; malla.parent.add(h); } else malla.add(h); return h; };
  TI.pieza = (geo, color, padre, p = {}) => {
    const m = new T.Mesh(geo, p.mat || TI.toon(color)); m.castShadow = p.sombra !== false; (padre || scene).add(m);
    if (p.pos) m.position.set(...p.pos); if (p.rot) m.rotation.set(...p.rot);
    if (p.contorno !== false) TI.contorno(m, p.fino, p.grosor ? matG(p.grosor * (p.fino ? 0.6 : 1)) : undefined);
    if (p.aristas) m.add(new T.LineSegments(new T.EdgesGeometry(geo, p.aristas === true ? 30 : p.aristas), LINEA));
    return m;
  };
  TI.caja = (w, h, d, radio = 0.04) => new T.RoundedBoxGeometry(w, h, d, 3, radio);
  TI.suelo = (padre, s = {}) => {
    const c = K.lienzo(1024, 1024), q = c.getContext('2d'); q.fillStyle = C.papel; q.fillRect(0, 0, 1024, 1024); K.semilla(5);
    for (let i = 0; i < 26000; i++) { const v = 200 + K.rnd() * 40; q.fillStyle = `rgba(${v},${v - 6},${v - 18},${K.rnd() * 0.18})`; q.fillRect(K.rnd() * 1024, K.rnd() * 1024, 1 + K.rnd() * 2, 1 + K.rnd() * 2); }
    const tx = K.texDe(c); tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(6, 6);
    const L = s.lado ?? 80;
    const p = new T.Mesh(new T.PlaneGeometry(L, L), new T.MeshBasicMaterial({ map: tx })); p.rotation.x = -Math.PI / 2; (padre || scene).add(p);
    const sm = new T.Mesh(new T.PlaneGeometry(L, L), new T.ShadowMaterial({ color: hex(s.sombra ?? C.azul), opacity: s.opacidad ?? 0.85 })); sm.rotation.x = -Math.PI / 2; sm.position.y = 0.002; sm.receiveShadow = true; (padre || scene).add(sm);
    return p;
  };

  TI.dibujo = g => {
    const D = {};
    const hervir = D.hervir = (t, pasos = 8) => { K.semilla(1 + Math.floor(t * pasos) % 7); return () => (K.rnd() - 0.5); };
    D.trazo = (pts, col, w, t, a = 1, j = 3, cerrar = false) => {
      if (a <= 0.01) return; const rr = hervir(t); g.save(); g.globalAlpha = K.clamp(a); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
      pts.forEach(([x, y], i) => { const xx = x + rr() * j, yy = y + rr() * j; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }); if (cerrar) g.closePath(); g.stroke(); g.restore();
    };
    D.trazoParcial = (pts, col, w, t, u, j = 3) => {
      u = K.clamp(u); if (u <= 0) return; const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const m = L[L.length - 1] * u, out = [pts[0]];
      for (let i = 1; i < pts.length; i++) { if (L[i] <= m) out.push(pts[i]); else { const k = (m - L[i - 1]) / (L[i] - L[i - 1]); out.push([K.lerp(pts[i - 1][0], pts[i][0], k), K.lerp(pts[i - 1][1], pts[i][1], k)]); break; } }
      D.trazo(out, col, w, t, 1, j);
    };
    D.txt = (s, x, y, fs, col = C.tinta, a = 1, peso = 800, al = 'center') => K.txt(g, s, x, y, fs, col, a, peso, al, '"Inter Display", Inter, sans-serif', 0);
    D.tarjeta = (x, y, w, h, a, t, fondo = C.hoja, sombra = C.azul) => {
      if (a <= 0.01) return; g.save(); g.globalAlpha = K.clamp(a); g.fillStyle = sombra; g.fillRect(x - 14, y + 14, w, h); g.fillStyle = fondo; g.fillRect(x, y, w, h); g.restore();
      D.trazo([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], C.tinta, 6, t, a, 3, true);
    };
    D.nota = (s, x, y, a, p = {}) => {
      if (a <= 0.01) return; const fs = p.fs ?? 34; g.save(); g.font = `800 ${fs}px Inter, sans-serif`; const w = g.measureText(s).width + 44; g.restore();
      const e = K.easeBack(K.clamp(a)); const yy = y + (1 - e) * 18;
      D.tarjeta(x - w / 2, yy - fs * 1.05, w, fs * 1.6, a, p.t ?? 0, p.fondo ?? C.hoja, p.sombra ?? C.azul); D.txt(s, x, yy + fs * 0.05, fs, p.color ?? C.tinta, a);
    };
    D.sello = (s, x, y, a, p = {}) => {
      if (a <= 0.01) return; const fs = p.fs ?? 80, e = K.easeBack(K.clamp(a)), k = 1.6 - 0.6 * e;
      g.save(); g.font = `900 ${fs}px Inter, sans-serif`; const w = g.measureText(s).width + 60, h = fs * 1.5;
      g.translate(x, y); g.rotate(p.rot ?? -0.06); g.scale(k, k); g.globalAlpha = K.clamp(a * 2);
      g.fillStyle = C.tinta; g.fillRect(-w / 2 - 10, -h / 2 + 10, w, h); g.fillStyle = p.color ?? C.rojo; g.fillRect(-w / 2, -h / 2, w, h);
      g.fillStyle = p.texto ?? '#fff'; g.textAlign = 'center'; g.fillText(s, 0, fs * 0.35); g.restore();
    };
    D.flecha = (x0, y0, x1, y1, a, p = {}) => {
      if (a <= 0.01) return; const col = p.color ?? C.rojo, t = p.t ?? 0, cv = p.curva ?? 20;
      const mx = (x0 + x1) / 2 + cv, my = (y0 + y1) / 2 - cv, pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([(1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * my + u * u * y1]); }
      const u = K.easeOut(a); D.trazoParcial(pts, col, p.w ?? 6, t, u, 2);
      if (u > 0.9) { const an = Math.atan2(y1 - my, x1 - mx), q = p.punta ?? 26; D.trazo([[x1 - q * Math.cos(an - 0.5), y1 - q * Math.sin(an - 0.5)], [x1, y1], [x1 - q * Math.cos(an + 0.5), y1 - q * Math.sin(an + 0.5)]], col, p.w ?? 6, t, 1, 1); }
    };
    D.resaltar = (x, y, w, h, a, col = C.amarillo) => { if (a <= 0.01) return; g.save(); g.globalAlpha = 0.85; g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + w * K.easeOut(a), y); g.lineTo(x + w * K.easeOut(a) + 6, y + h); g.lineTo(x - 4, y + h - 3); g.closePath(); g.fill(); g.restore(); };
    D.circulo = (x, y, rx, ry, a, p = {}) => { if (a <= 0.01) return; const pts = []; for (let i = 0; i <= 40; i++) { const an = -1.9 + i / 40 * Math.PI * 2.15; pts.push([x + Math.cos(an) * rx * (1 + i * 0.002), y + Math.sin(an) * ry]); } D.trazoParcial(pts, p.color ?? C.rojo, p.w ?? 7, p.t ?? 0, K.easeOut(a), 2); };
    D.tachar = (x, y, w, a, p = {}) => { if (a <= 0.01) return; D.trazoParcial([[x, y + 6], [x + w * 0.5, y - 5], [x + w, y + 4]], p.color ?? C.rojo, p.w ?? 9, p.t ?? 0, K.easeOut(a), 2); };
    D.etiqueta3D = (s, p3, dx, dy, a, p = {}) => { if (a <= 0.01) return; const [x, y] = K.proy(p3); D.trazo([[x, y], [x + dx * 0.6, y + dy * 0.75]], C.tinta, 4, p.t ?? 0, a, 1); g.save(); g.globalAlpha = K.clamp(a); g.fillStyle = C.tinta; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); g.restore(); D.nota(s, x + dx, y + dy, a, p); };
    return D;
  };
  return TI;
};
})();
