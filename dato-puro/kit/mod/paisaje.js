(function () {
const T = window.THREE, K = window.K;
const PALETAS = {
  ocaso: { arriba: [0.10, 0.07, 0.28], medio: [0.62, 0.20, 0.48], horizonte: [1.0, 0.55, 0.28], sol: [1.0, 0.6, 0.3], abajo: [0.25, 0.12, 0.25], niebla: 0xd8706a, pasto: 0x6f7d3a, tierra: 0xb7783f, cima: 0x5a3a5e, orilla: 0x8b6a4a, asfalto: '#3b3346', pino: 0x2f4f3a, monte: 0x4b2a5c, monte2: 0xc8607a, hemi: [0xffb38a, 0x3a2850, 1.1], luz: [0xffc08a, 2.4], contra: [0xa070ff, 0.9] },
  dia: { arriba: [0.16, 0.42, 0.85], medio: [0.45, 0.70, 0.95], horizonte: [0.82, 0.90, 0.98], sol: [1.0, 0.95, 0.8], abajo: [0.55, 0.65, 0.6], niebla: 0xcfe2f2, pasto: 0x6fa24a, tierra: 0xa9b86a, cima: 0x7d8f6a, orilla: 0x9c8a66, asfalto: '#44464f', pino: 0x2e6b3f, monte: 0x6f8fa8, monte2: 0xa8c0d0, hemi: [0xffffff, 0x6a7a55, 1.2], luz: [0xfff2d8, 2.2], contra: [0x9ec8ff, 0.5] },
  noche: { arriba: [0.01, 0.02, 0.07], medio: [0.04, 0.06, 0.16], horizonte: [0.12, 0.14, 0.30], sol: [0.6, 0.7, 1.0], abajo: [0.03, 0.04, 0.08], niebla: 0x141a33, pasto: 0x1f3030, tierra: 0x2a3340, cima: 0x1c2233, orilla: 0x2a2c38, asfalto: '#1c1d26', pino: 0x12261f, monte: 0x10162b, monte2: 0x24305a, hemi: [0x5870b0, 0x0a0c18, 0.9], luz: [0x9db4ff, 1.1], contra: [0x4050a0, 0.5] }
};
K.PALETAS_PAISAJE = PALETAS;
K.paisaje = (o = {}) => {
  const C = Object.assign({}, PALETAS[o.paleta || 'ocaso'], o.colores || {}), scene = o.escena || K.scene, v3 = a => `vec3(${a.map(x => x.toFixed(3)).join(',')})`;
  const pend = o.pendiente ?? 0.2, curva = o.curva ?? 1, L = o.largo ?? 420, W = o.ancho ?? 150, mitad = o.anchoCarretera ?? 3.0;
  const X = z => curva * (5 * Math.sin(z * 0.04) + 2 * Math.sin(z * 0.013 + 1)), Y = z => z * pend, P = z => new T.Vector3(X(z), Y(z), z);
  const ruido = (x, z) => 0.5 + 0.5 * Math.sin(x * 0.13 + z * 0.07) * Math.cos(z * 0.11 - x * 0.05) + 0.25 * Math.sin(x * 0.4 + z * 0.3);
  const despeje = o.despeje || (() => 1);
  const alto = (x, z) => { const d = Math.abs(x - X(z)), f = K.clamp((d - mitad - 1) / 22), s = f * f * (3 - 2 * f); return s * (1.2 + (o.relieve ?? 6) * ruido(x, z)) * despeje(x, z, x < X(z) ? -1 : 1); };
  const G = new T.Group(); scene.add(G);
  const cielo = new T.Mesh(new T.SphereGeometry(900, 48, 24), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vp; void main(){ float h = vp.y; vec3 top = ${v3(C.arriba)}; vec3 mid = ${v3(C.medio)}; vec3 hor = ${v3(C.horizonte)};
      vec3 c = h > 0.12 ? mix(mid, top, smoothstep(0.12, 0.55, h)) : mix(hor, mid, smoothstep(-0.02, 0.12, h));
      vec3 sd = normalize(vec3(0.15, ${(o.alturaSol ?? 0.06).toFixed(3)}, -1.0)); float s = max(dot(vp, sd), 0.0);
      c += ${v3(C.sol)} * pow(s, 18.0) * 0.8 + vec3(1.0,0.9,0.75) * smoothstep(0.9993, 0.9996, s) * 2.2;
      if (h < -0.02) c = mix(hor * 0.7, ${v3(C.abajo)}, smoothstep(-0.02, -0.3, h));
      gl_FragColor = vec4(c, 1.0); }` }));
  scene.add(cielo);
  if (o.niebla !== false) scene.fog = new T.Fog(C.niebla, o.nieblaCerca ?? 60, o.nieblaLejos ?? 330);
  const g = new T.PlaneGeometry(W, L, Math.round(W / 2), Math.round(L / 2)); g.rotateX(-Math.PI / 2); g.translate(0, 0, -L / 2 + 40);
  const p = g.attributes.position, col = [], cA = new T.Color(C.pasto), cB = new T.Color(C.tierra), cC = new T.Color(C.cima), cO = new T.Color(C.orilla);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = alto(x, z); p.setY(i, Y(z) - 0.06 + a); const c = cA.clone().lerp(cB, K.clamp(ruido(x, z) * 0.9)).lerp(cC, K.clamp(a / 9) * 0.6); if (Math.abs(x - X(z)) < mitad + 1.2) c.lerp(cO, 0.6); col.push(c.r, c.g, c.b); }
  const gi = g.toNonIndexed(), ci = []; for (const k of g.index.array) ci.push(col[k * 3], col[k * 3 + 1], col[k * 3 + 2]);
  gi.setAttribute('color', new T.Float32BufferAttribute(ci, 3)); gi.computeVertexNormals();
  G.add(new T.Mesh(gi, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, metalness: 0 })));
  if (o.carretera !== false) {
    const pts = [], uvs = [], ind = [], N = 520;
    for (let i = 0; i <= N; i++) { const z = 40 - i * (L - 20) / N, c = P(z), n = P(z - 0.5).sub(c).normalize(), lado = new T.Vector3(-n.z, 0, n.x).normalize(); for (const s of [-1, 1]) { const q = c.clone().addScaledVector(lado, mitad * s); pts.push(q.x, q.y + 0.03, q.z); uvs.push(s < 0 ? 0 : 1, i * 0.5); } }
    for (let i = 0; i < N; i++) { const a = i * 2; ind.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    const rg = new T.BufferGeometry(); rg.setAttribute('position', new T.Float32BufferAttribute(pts, 3)); rg.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2)); rg.setIndex(ind); rg.computeVertexNormals();
    const rc = K.lienzo(256, 256), q = rc.getContext('2d'); q.fillStyle = C.asfalto; q.fillRect(0, 0, 256, 256); K.semilla(3);
    for (let i = 0; i < 3000; i++) { const v = 50 + K.rnd() * 40; q.fillStyle = `rgba(${v},${v - 6},${v + 10},0.35)`; q.fillRect(K.rnd() * 256, K.rnd() * 256, 2, 2); }
    q.fillStyle = '#f1e6d2'; q.fillRect(10, 0, 8, 256); q.fillRect(238, 0, 8, 256); q.fillStyle = '#ffcf5a'; q.fillRect(122, 0, 12, 140);
    const rt = K.texDe(rc); rt.wrapT = T.RepeatWrapping;
    G.add(new T.Mesh(rg, new T.MeshStandardMaterial({ map: rt, roughness: 0.75, metalness: 0.05, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })));
  }
  K.semilla(9);
  if (o.montes !== false) for (let i = 0; i < 14; i++) { const r = 40 + K.rnd() * 50, h = 50 + K.rnd() * 70, m = new T.Mesh(new T.ConeGeometry(r, h, 5 + Math.floor(K.rnd() * 3)), new T.MeshStandardMaterial({ color: C.monte, flatShading: true, roughness: 1, fog: false })), a = -1.2 + i / 13 * 2.4; m.position.set(Math.sin(a) * 420, Y(-380) + h / 2 - 25, -380 - Math.cos(a) * 120); m.material.color.lerp(new T.Color(C.monte2), 0.25 + K.rnd() * 0.4); m.rotation.y = K.rnd() * 3; G.add(m); }
  const NP = o.pinos ?? 260;
  if (NP) { const pinos = new T.InstancedMesh(new T.ConeGeometry(0.9, 3.2, 6), new T.MeshStandardMaterial({ color: C.pino, flatShading: true, roughness: 0.9 }), NP), m4 = new T.Matrix4(); let k = 0, n = 0;
    while (k < NP && n++ < NP * 20) { const z = 30 - K.rnd() * (L - 50), s = K.rnd() < 0.5 ? -1 : 1, x = X(z) + s * (mitad + 3 + K.rnd() * 30); if (despeje(x, z, s) < 0.5) continue; const e = 0.7 + K.rnd() * 0.8; m4.compose(new T.Vector3(x, Y(z) - 0.06 + alto(x, z) + 1.5 * e, z), new T.Quaternion(), new T.Vector3(e, e, e)); pinos.setMatrixAt(k++, m4); }
    pinos.count = k; G.add(pinos); }
  if (o.luces !== false) { scene.add(new T.HemisphereLight(...C.hemi)); const s = new T.DirectionalLight(...C.luz); s.position.set(30, 40, -200); scene.add(s); const r = new T.DirectionalLight(...C.contra); r.position.set(-40, 30, 80); scene.add(r); }
  const poner = (obj, z, lado = 0) => { const c = P(z), f = P(z - 0.8), n = f.clone().sub(c).normalize(), l = new T.Vector3(-n.z, 0, n.x); obj.position.copy(c).addScaledVector(l, lado); obj.lookAt(f.addScaledVector(l, lado)); };
  const camSeguir = (z, o2 = {}) => { const c = P(z), f = P(z - 1).sub(c).normalize(), l = new T.Vector3(-f.z, 0, f.x), cam = o2.cam || K.cam; cam.position.copy(c).addScaledVector(f, -(o2.atras ?? 12)).addScaledVector(l, o2.lado ?? 2); cam.position.y += o2.alto ?? 4.5; cam.lookAt(c.clone().addScaledVector(f, o2.adelante ?? 4).add(new T.Vector3(0, o2.mira ?? 1, 0))); };
  return { G, cielo, P, X, Y, alto, poner, camSeguir, C };
};
})();
