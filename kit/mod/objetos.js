(function () {
const T = window.THREE, K = window.K;
K.objetos = (o = {}) => {
  const O = {}, esc = o.escena || K.scene; let GC = null;
  const RB = (w, h, d, r = 0.04) => new T.RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
  const CIL = (r, h, n = 24, r2) => new T.CylinderGeometry(r2 ?? r, r, h, n);
  const p = (geo, color, padre, q = {}) => {
    let m;
    if (o.pieza) m = o.pieza(geo, color, padre, { pos: q.pos, rot: q.rot, fino: q.fino, grosor: q.grosor ?? GC ?? undefined, contorno: q.contorno ?? (q.luz ? false : undefined), sombra: q.sombra, mat: q.luz ? new T.MeshBasicMaterial({ color: q.luz }) : q.mat });
    else { m = new T.Mesh(geo, q.mat || new T.MeshStandardMaterial({ color, roughness: q.rugoso ?? 0.7, metalness: q.metal ?? 0, flatShading: !!o.facetas, emissive: q.luz ?? 0x000000, emissiveIntensity: q.luz ? (q.brillo ?? 1) : 0, envMapIntensity: 0.4 })); m.castShadow = true; padre.add(m); if (q.pos) m.position.set(...q.pos); if (q.rot) m.rotation.set(...q.rot); }
    return m;
  };
  O.p = p; O.RB = RB;
  const grupo = (padre, pos) => { const g = new T.Group(); (padre || esc).add(g); if (pos) g.position.set(...pos); return g; };
  const lienzoTex = (w, h, f) => { const c = K.lienzo(w, h), q = c.getContext('2d'); f(q, w, h); return K.texDe(c); };

  O.coche = (a = {}) => {
    const g = grupo(a.padre, a.pos), col = a.color ?? 0x18b3a8, ruedas = [];
    p(RB(1.8, 0.62, 3.9, 0.22), col, g, { pos: [0, 0.62, 0], metal: 0.2, rugoso: 0.5 });
    p(RB(1.55, 0.56, 2.0, 0.22), a.vidrio ?? 0x1a2638, g, { pos: [0, 1.12, -0.35], rugoso: 0.45 });
    p(RB(1.5, 0.12, 1.7, 0.06), col, g, { pos: [0, 1.42, -0.4], fino: true });
    for (const z of [1.92, -1.92]) p(RB(1.86, 0.22, 0.3, 0.1), 0x15121a, g, { pos: [0, 0.42, z], fino: true });
    const faros = [], calaveras = [];
    for (const s of [-1, 1]) { faros.push(p(RB(0.42, 0.14, 0.08, 0.03), 0x000000, g, { pos: [0.58 * s, 0.72, 1.95], luz: 0xfff2d0, brillo: 0.9 })); calaveras.push(p(RB(0.46, 0.14, 0.08, 0.03), 0x000000, g, { pos: [0.6 * s, 0.76, -1.95], luz: 0xff2030, brillo: a.freno ? 2.4 : 0.8 })); }
    const ll = CIL(0.38, 0.28, 28); ll.rotateZ(Math.PI / 2); const rin = CIL(0.22, 0.3, 6); rin.rotateZ(Math.PI / 2);
    for (const [x, z] of [[-0.86, 1.25], [0.86, 1.25], [-0.86, -1.25], [0.86, -1.25]]) { const w = grupo(g, [x, 0.38, z]); p(ll, 0x15121a, w, { fino: true }); p(rin, 0xd9d4e0, w, { metal: 1, rugoso: 0.25, contorno: false }); ruedas.push(w); }
    return { g, ruedas, faros, calaveras, rodar: dist => ruedas.forEach(w => w.rotation.x = dist / 0.38) };
  };

  O.casa = (a = {}) => {
    const g = grupo(a.padre, a.pos), w = a.ancho ?? 4, d = a.fondo ?? 3.4, h = a.alto ?? 2.6;
    p(RB(w, h, d, 0.03), a.color ?? 0xf0dcc0, g, { pos: [0, h / 2, 0] });
    const s = new T.Shape(); s.moveTo(-w / 2 - 0.3, 0); s.lineTo(0, a.techo ?? 1.4); s.lineTo(w / 2 + 0.3, 0); s.closePath();
    const tg = new T.ExtrudeGeometry(s, { depth: d + 0.5, bevelEnabled: false }); tg.translate(0, 0, -(d + 0.5) / 2);
    p(tg, a.colorTecho ?? 0xc8553d, g, { pos: [0, h, 0] });
    const puerta = p(RB(0.8, 1.7, 0.06, 0.02), a.colorPuerta ?? 0x8a5a3b, g, { pos: [-w * 0.2, 0.85, d / 2 + 0.02], fino: true });
    p(new T.SphereGeometry(0.05, 10, 8), 0xe2c25b, puerta, { pos: [0.28, 0, 0.05], contorno: false });
    const ventanas = [[w * 0.22, h * 0.58]].concat(a.dosVentanas === false ? [] : [[-w * 0.2, h + 0.45]]).map(([x, y]) => p(RB(0.9, 0.8, 0.06, 0.02), 0x000000, g, { pos: [x, y, d / 2 + 0.02], luz: a.luzVentana ?? 0xbfe0f0, brillo: 0.6 }));
    return { g, puerta, ventanas };
  };

  O.contacto = (a = {}) => { GC = 0.0012;
    const g = grupo(a.padre, a.pos), tomas = [];
    p(RB(0.075, 0.118, 0.008, 0.004), a.color ?? 0xf2efe6, g, { fino: true });
    for (const y of [0.026, -0.026]) { const t = grupo(g, [0, y, 0.0045]);
      for (const x of [-0.0064, 0.0064]) p(new T.BoxGeometry(0.0022, x < 0 ? 0.0085 : 0.0068, 0.001), 0x1a1a1a, t, { pos: [x, 0.004, 0], contorno: false, sombra: false });
      p(CIL(0.0025, 0.001, 12), 0x1a1a1a, t, { pos: [0, -0.008, 0], rot: [Math.PI / 2, 0, 0], contorno: false, sombra: false }); tomas.push(t); }
    p(CIL(0.003, 0.002, 10), 0xb9b4a8, g, { pos: [0, 0, 0.005], rot: [Math.PI / 2, 0, 0], contorno: false });
    g.scale.setScalar(a.escala ?? 1);
    GC = null; return { g, tomas, puntoToma: i => tomas[i].getWorldPosition(new T.Vector3()) };
  };
  O.clavija = (a = {}) => { GC = 0.0012;
    const g = grupo(a.padre, a.pos), col = a.color ?? 0x25252b;
    p(RB(0.03, 0.026, 0.03, 0.006), col, g, { pos: [0, 0, 0.022], fino: true });
    p(CIL(0.006, 0.014, 12, 0.009), col, g, { pos: [0, 0, 0.044], rot: [Math.PI / 2, 0, 0], fino: true });
    for (const x of [-0.0064, 0.0064]) p(new T.BoxGeometry(0.0016, 0.0064, 0.016), 0xc9ccd2, g, { pos: [x, 0, -0.001], metal: 0.9, rugoso: 0.3, contorno: false });
    if (a.tierra) p(CIL(0.0022, 0.017, 10), 0xc9ccd2, g, { pos: [0, -0.012, -0.0015], rot: [Math.PI / 2, 0, 0], metal: 0.9, contorno: false });
    g.scale.setScalar(a.escala ?? 1);
    GC = null; return { g, cola: () => g.localToWorld(new T.Vector3(0, 0, 0.051)) };
  };
  O.cable = (puntos, a = {}) => { GC = (a.radio ?? 0.004) * 0.35; const c = new T.CatmullRomCurve3(puntos.map(q => q.isVector3 ? q : new T.Vector3(...q))); const m = p(new T.TubeGeometry(c, a.tramos ?? 64, a.radio ?? 0.004, 8), a.color ?? 0x25252b, a.padre || esc, { contorno: a.contorno }); GC = null; return { m, curva: c }; };

  O.foco = (a = {}) => { GC = 0.0014;
    const g = grupo(a.padre, a.pos), on = a.encendido !== false;
    const pts = [new T.Vector2(0.013, 0.022), new T.Vector2(0.0135, 0.03), new T.Vector2(0.018, 0.04)]; for (let i = 0; i <= 14; i++) { const an = (-48 + i / 14 * 138) * Math.PI / 180; pts.push(new T.Vector2(Math.max(0.0002, Math.cos(an) * 0.03), 0.064 + Math.sin(an) * 0.03)); }
    const vidrio = p(new T.LatheGeometry(pts, 24), on ? 0xfff6d8 : 0xf4f7f9, g, { luz: on ? (a.luz ?? 0xffe9a8) : undefined, brillo: 1.2, mat: on || o.pieza ? undefined : new T.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.2, transparent: true, opacity: 0.55 }) });
    p(CIL(0.013, 0.022, 16), 0xb8bcc4, g, { pos: [0, 0.011, 0], metal: 0.8, rugoso: 0.35, fino: true });
    p(CIL(0.006, 0.006, 10), 0x2a2a2a, g, { pos: [0, -0.003, 0], contorno: false });
    g.scale.setScalar(a.escala ?? 1);
    GC = null; return { g, vidrio };
  };

  O.celular = (a = {}) => { GC = 0.0016;
    const g = grupo(a.padre, a.pos), w = 0.072, h = 0.152;
    p(RB(w, h, 0.008, 0.0035), a.color ?? 0x1c1c22, g, { fino: true });
    const tex = a.pantalla ? lienzoTex(360, 760, a.pantalla) : null;
    const pantalla = new T.Mesh(new T.PlaneGeometry(w - 0.006, h - 0.006), new T.MeshBasicMaterial(tex ? { map: tex } : { color: a.colorPantalla ?? 0x2f5bd3 })); pantalla.position.z = 0.0042; g.add(pantalla);
    g.scale.setScalar(a.escala ?? 1);
    GC = null; return { g, pantalla, tex, redibujar: f => { const q = tex.image.getContext('2d'); f(q, 360, 760); tex.needsUpdate = true; } };
  };

  O.bateria = (a = {}) => { GC = 0.0009;
    const g = grupo(a.padre, a.pos);
    p(CIL(0.007, 0.046, 20), a.color ?? 0x2a9d6f, g, { pos: [0, 0.023, 0], fino: true });
    p(CIL(0.0071, 0.012, 20), a.banda ?? 0xffd23f, g, { pos: [0, 0.036, 0], contorno: false });
    p(CIL(0.0025, 0.003, 12), 0xc9ccd2, g, { pos: [0, 0.0475, 0], metal: 0.9, contorno: false });
    g.scale.setScalar(a.escala ?? 1);
    GC = null; return { g };
  };

  O.refri = (a = {}) => {
    const g = grupo(a.padre, a.pos), col = a.color ?? 0xdfe5ea;
    p(RB(0.75, 1.75, 0.7, 0.04), col, g, { pos: [0, 0.875, 0], rugoso: 0.4 });
    const bis = grupo(g, [-0.375, 0, 0.35]);
    const puerta = p(RB(0.75, 1.12, 0.05, 0.02), col, bis, { pos: [0.375, 0.59, 0.03], fino: true, rugoso: 0.4 });
    p(RB(0.75, 0.56, 0.05, 0.02), col, g, { pos: [0, 1.45, 0.38], fino: true, rugoso: 0.4 });
    p(RB(0.03, 0.5, 0.04, 0.012), 0x8d949c, puerta, { pos: [0.3, 0.2, 0.04], contorno: false, metal: 0.6 });
    p(RB(0.03, 0.26, 0.04, 0.012), 0x8d949c, g, { pos: [0.3, 1.36, 0.42], contorno: false, metal: 0.6 });
    const luz = p(RB(0.66, 1.0, 0.02, 0.01), 0x000000, g, { pos: [0, 0.59, 0.33], luz: 0xfff2c8, brillo: 0.9 });
    return { g, bisagra: bis, puerta, luz, abrir: u => { bis.rotation.y = -u * 1.9; } };
  };

  O.tele = (a = {}) => {
    const g = grupo(a.padre, a.pos), w = a.ancho ?? 1.2, h = w * 0.58;
    const m = p(RB(w, h, 0.05, 0.015), 0x1c1c22, g, { pos: [0, h / 2 + 0.2, 0] });
    const tex = a.pantalla ? lienzoTex(960, 540, a.pantalla) : null;
    const pantalla = new T.Mesh(new T.PlaneGeometry(w - 0.05, h - 0.05), new T.MeshBasicMaterial(tex ? { map: tex } : { color: a.colorPantalla ?? 0x2f5bd3 })); pantalla.position.set(0, h / 2 + 0.2, 0.027); g.add(pantalla);
    p(CIL(0.025, 0.2, 10), 0x1c1c22, g, { pos: [0, 0.1, 0], fino: true }); p(RB(w * 0.4, 0.025, 0.2, 0.01), 0x1c1c22, g, { pos: [0, 0.0125, 0], fino: true });
    return { g, marco: m, pantalla, tex, redibujar: f => { const q = tex.image.getContext('2d'); f(q, 960, 540); tex.needsUpdate = true; } };
  };

  O.persona = (a = {}) => {
    const g = grupo(a.padre, a.pos), k = a.estatura ?? 1.7, col = a.color ?? 0x2f5bd3, piel = a.piel ?? 0xe9c9a6;
    const torso = p(new T.CapsuleGeometry(0.2 * k / 1.7, 0.42 * k / 1.7, 6, 14), col, g, { pos: [0, 1.08 * k / 1.7, 0] });
    const cabeza = p(new T.SphereGeometry(0.19 * k / 1.7, 20, 16), piel, g, { pos: [0, 1.62 * k / 1.7, 0] });
    const ext = (x, y, largo, c, rot = 0) => { const h = grupo(g, [x, y, 0]); p(new T.CapsuleGeometry(0.07 * k / 1.7, largo, 5, 10), c, h, { pos: [0, -largo / 2 - 0.04, 0], fino: true }); h.rotation.z = rot; return h; };
    const brazoI = ext(-0.27 * k / 1.7, 1.34 * k / 1.7, 0.46 * k / 1.7, col, -0.12), brazoD = ext(0.27 * k / 1.7, 1.34 * k / 1.7, 0.46 * k / 1.7, col, 0.12);
    const piernaI = ext(-0.1 * k / 1.7, 0.78 * k / 1.7, 0.6 * k / 1.7, a.pantalon ?? 0x2b2f3a), piernaD = ext(0.1 * k / 1.7, 0.78 * k / 1.7, 0.6 * k / 1.7, a.pantalon ?? 0x2b2f3a);
    return { g, torso, cabeza, brazoI, brazoD, piernaI, piernaD, caminar: (fase, amp = 0.5) => { const s = Math.sin(fase * Math.PI * 2) * amp; piernaI.rotation.x = s; piernaD.rotation.x = -s; brazoI.rotation.x = -s * 0.8; brazoD.rotation.x = s * 0.8; g.position.y = (a.pos?.[1] ?? 0) + Math.abs(Math.cos(fase * Math.PI * 2)) * 0.03; } };
  };

  O.moneda = (a = {}) => { GC = 0.0007; const g = grupo(a.padre, a.pos), r = a.radio ?? 0.014; p(CIL(r, r * 0.14, 32), a.color ?? 0xffd23f, g, { metal: 0.7, rugoso: 0.35, fino: true }); p(CIL(r * 0.7, r * 0.16, 32), a.centro ?? 0xe8b923, g, { metal: 0.7, rugoso: 0.4, contorno: false }); g.scale.setScalar(a.escala ?? 1); GC = null; return { g }; };
  O.billete = (a = {}) => {
    const g = grupo(a.padre, a.pos), tex = lienzoTex(620, 280, (q, w, h) => { q.fillStyle = a.fondo ?? '#bfe3c8'; q.fillRect(0, 0, w, h); q.strokeStyle = a.tinta ?? '#2a6b46'; q.lineWidth = 10; q.strokeRect(16, 16, w - 32, h - 32); q.beginPath(); q.arc(w / 2, h / 2, 82, 0, 7); q.stroke(); q.fillStyle = a.tinta ?? '#2a6b46'; q.font = '900 110px Inter, sans-serif'; q.textAlign = 'center'; q.fillText(a.texto ?? '$', w / 2, h / 2 + 40); q.font = '700 26px Inter, sans-serif'; q.fillText('RECREACIÓN · NO ES UN BILLETE REAL', w / 2, h - 34); });
    const m = new T.Mesh(new T.BoxGeometry(0.155, 0.0006, 0.07), [0, 0, 0, 0, 0, 0].map((_, i) => new T.MeshStandardMaterial(i === 2 || i === 3 ? { map: tex, roughness: 0.9 } : { color: 0xbfe3c8 }))); m.castShadow = true; g.add(m);
    g.scale.setScalar(a.escala ?? 1); return { g, m };
  };

  O.arbol = (a = {}) => { const g = grupo(a.padre, a.pos), e = a.escala ?? 1; p(CIL(0.14, 1.3, 8, 0.1), 0x8a5a3b, g, { pos: [0, 0.65, 0], fino: true }); if (a.pino) { p(new T.ConeGeometry(0.9, 1.6, 7), a.color ?? 0x2e6b3f, g, { pos: [0, 1.7, 0] }); p(new T.ConeGeometry(0.65, 1.3, 7), a.color ?? 0x2e6b3f, g, { pos: [0, 2.5, 0] }); } else for (const [x, y, z, r] of [[0, 2.0, 0, 0.8], [-0.5, 1.6, 0.2, 0.55], [0.55, 1.65, -0.1, 0.6]]) p(new T.IcosahedronGeometry(r, 1), a.color ?? 0x6ca86a, g, { pos: [x, y, z] }); g.scale.setScalar(e); return { g }; };
  O.mesa = (a = {}) => { const g = grupo(a.padre, a.pos), w = a.ancho ?? 1.2, d = a.fondo ?? 0.7, h = a.alto ?? 0.75; p(RB(w, 0.05, d, 0.015), a.color ?? 0xb98556, g, { pos: [0, h - 0.025, 0] }); for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) p(RB(0.05, h - 0.05, 0.05, 0.01), a.color ?? 0xb98556, g, { pos: [x * (w / 2 - 0.06), (h - 0.05) / 2, z * (d / 2 - 0.06)], fino: true }); return { g, alto: h }; };
  O.pared = (a = {}) => { const g = grupo(a.padre, a.pos), w = a.ancho ?? 3, h = a.alto ?? 2.4; p(new T.BoxGeometry(w, h, 0.1), a.color ?? 0xe9e1cf, g, { pos: [0, h / 2, -0.05], contorno: false, sombra: false, mat: o.pieza ? new T.MeshBasicMaterial({ color: a.color ?? 0xe9e1cf }) : undefined }); p(new T.BoxGeometry(w, 0.1, 0.02), a.zoclo ?? 0xc9bfa8, g, { pos: [0, 0.05, 0.01], contorno: false }); return { g }; };
  return O;
};
})();
