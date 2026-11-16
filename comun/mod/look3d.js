/* Acabado de cámara para escenas 3D del kit: desenfoque de lente por profundidad y corrección de color por curvas.
   Referencias:
   https://github.com/luispablovillasenor-afk/shorts-animados-claude (MIT; plantillas/puente/lensblur.ts y grade.ts):
     el muestreo en espiral dorada con círculo de confusión, la regla de que el fondo no se derrama sobre lo cercano,
     el pase extra para lo que está delante del foco, la curva de 7 puntos con tangentes monótonas, saturación y tinte
     por zonas, y los ajustes "día" y "dorado" medidos por ellos. Se reescribió para el EffectComposer de three.js
     (ShaderPass) en lugar de la biblioteca "postprocessing".
   https://threejs.org/docs/#api/en/materials/MeshDepthMaterial y ShaderChunk "packing": profundidad empaquetada en RGBA.
   Uso: después de K.tres(...): const L = K.look3d({dof:true, color:'dia'|'dorado'|null});
        en renderAt: L.enfoque(distancia_m, desenfoque_px)  (desenfoque 0 = apagado; 10–16 px primeros planos). */
(() => {
  const K = window.K;
  const T = window.THREE;
  const KX = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1];
  const tangentes = ky => {
    const n = KX.length, h = [], d = [], m = new Array(n).fill(0);
    for (let k = 0; k < n - 1; k++) { h.push(KX[k + 1] - KX[k]); d.push((ky[k + 1] - ky[k]) / h[k]); }
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let k = 1; k < n - 1; k++) { if (d[k - 1] * d[k] <= 0) continue; const w1 = 2 * h[k] + h[k - 1], w2 = h[k] + 2 * h[k - 1]; m[k] = (w1 + w2) / (w1 / d[k - 1] + w2 / d[k]); }
    return m;
  };
  const E_CB = [0, -0.18733, 1.8556], E_CR = [1.5748, -0.46813, 0];
  const tinte = ([cb, cr]) => new T.Vector3(E_CB[0] * cb + E_CR[0] * cr, E_CB[1] * cb + E_CR[1] * cr, E_CB[2] * cb + E_CR[2] * cr);
  const AJUSTES = {
    dia: { ky: [0.0345, 0.1828, 0.3812, 0.6605, 0.8814, 0.9631, 1], sat: [0.9831, 1.2727, 1.4573], s: [-0.0291, 0.0411], m: [0.0376, -0.0104], h: [0.0144, -0.0047], vig: [0.1, 0.45] },
    dorado: { ky: [0.0311, 0.1877, 0.4017, 0.6754, 0.875, 0.9582, 1], sat: [0.8316, 0.8799, 1.7061], s: [0.0528, 0.0004], m: [0.0583, -0.0003], h: [0, 0], vig: [0.16, 0.4] },
    neutro: { ky: KX.slice(), sat: [1, 1, 1], s: [0, 0], m: [0, 0], h: [0, 0], vig: [0, 0.5] },
  };

  const DOF = {
    uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, res: { value: new T.Vector2() }, focus: { value: 10 }, cInf: { value: 0 }, nearScale: { value: 1.2 }, maxCoC: { value: 24 }, near: { value: 0.1 }, far: { value: 1000 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      #include <packing>
      uniform sampler2D tDiffuse; uniform sampler2D tDepth; uniform vec2 res;
      uniform float focus, cInf, nearScale, maxCoC, near, far;
      varying vec2 vUv;
      #define GOLDEN 2.39996323
      #define TAPS 64
      #define NEAR_TAPS 32
      float distAt(vec2 uv) { float z = unpackRGBAToDepth(texture2D(tDepth, uv)); return -perspectiveDepthToViewZ(z, near, far); }
      float cocAt(float d, float s) { float c = cInf * s * (1.0 - focus / max(d, 1e-3)); if (c < 0.0) c *= nearScale; return clamp(c, -maxCoC * s, maxCoC * s); }
      void main() {
        vec4 base = texture2D(tDiffuse, vUv);
        if (cInf < 0.25) { gl_FragColor = base; return; }
        vec2 px = 1.0 / res; float s = res.y / 1920.0;
        float d0 = distAt(vUv), R = abs(cocAt(d0, s)) * 0.958;
        vec3 acc = base.rgb; float wsum = 1.0;
        if (R > 0.5) for (int i = 0; i < TAPS; i++) {
          float rr = sqrt((float(i) + 0.5) / float(TAPS)) * R, a = float(i) * GOLDEN;
          vec2 suv = vUv + vec2(cos(a), sin(a)) * rr * px;
          float ds = distAt(suv), rs = abs(cocAt(ds, s)) * 0.958;
          if (ds > d0) rs = min(rs, R);
          float w = clamp(rs - rr + 0.5, 0.0, 1.0);
          acc += texture2D(tDiffuse, suv).rgb * w; wsum += w;
        }
        vec3 col = acc / wsum;
        float M = maxCoC * s; vec3 fg = vec3(0.0); float fw = 0.0, cov = 0.0;
        for (int i = 0; i < NEAR_TAPS; i++) {
          float rr = sqrt((float(i) + 0.5) / float(NEAR_TAPS)) * M;
          if (rr <= R) continue;
          float a = float(i) * GOLDEN + 1.0; vec2 suv = vUv + vec2(cos(a), sin(a)) * rr * px;
          float ds = distAt(suv); if (ds >= d0 * 0.97) continue;
          float rs = abs(cocAt(ds, s)), w = clamp(rs - rr + 0.5, 0.0, 1.0);
          fg += texture2D(tDiffuse, suv).rgb * w; fw += w; cov += w * (M * M) / max(rs * rs, 1.0);
        }
        if (fw > 0.0) col = mix(col, fg / fw, clamp(cov / float(NEAR_TAPS), 0.0, 1.0));
        gl_FragColor = vec4(col, base.a);
      }`,
  };

  const COLOR = {
    uniforms: { tDiffuse: { value: null }, ky: { value: KX.slice() }, km: { value: tangentes(KX) }, sat: { value: new T.Vector3(1, 1, 1) }, tS: { value: new T.Vector3() }, tM: { value: new T.Vector3() }, tH: { value: new T.Vector3() }, vig: { value: new T.Vector2(0, 0.5) }, cantidad: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float ky[7]; uniform float km[7]; uniform vec3 sat, tS, tM, tH; uniform vec2 vig; uniform float cantidad;
      varying vec2 vUv;
      float herm(float v, float x0, float x1, float y0, float y1, float m0, float m1) { float h = x1 - x0, t = (v - x0) / h, t2 = t * t, t3 = t2 * t; return (2.0*t3 - 3.0*t2 + 1.0)*y0 + (t3 - 2.0*t2 + t)*h*m0 + (-2.0*t3 + 3.0*t2)*y1 + (t3 - t2)*h*m1; }
      float curva(float v) { v = clamp(v, 0.0, 1.0);
        if (v < 0.1) return herm(v, 0.0, 0.1, ky[0], ky[1], km[0], km[1]);
        if (v < 0.25) return herm(v, 0.1, 0.25, ky[1], ky[2], km[1], km[2]);
        if (v < 0.5) return herm(v, 0.25, 0.5, ky[2], ky[3], km[2], km[3]);
        if (v < 0.75) return herm(v, 0.5, 0.75, ky[3], ky[4], km[3], km[4]);
        if (v < 0.9) return herm(v, 0.75, 0.9, ky[4], ky[5], km[4], km[5]);
        return herm(v, 0.9, 1.0, ky[5], ky[6], km[5], km[6]); }
      void main() {
        vec4 b = texture2D(tDiffuse, vUv); vec3 src = clamp(b.rgb, 0.0, 1.0);
        vec3 c = vec3(curva(src.r), curva(src.g), curva(src.b));
        float y = dot(c, vec3(0.2126, 0.7152, 0.0722));
        float wS = 1.0 - smoothstep(0.0, 0.55, y), wH = smoothstep(0.45, 1.0, y), wM = 1.0 - wS - wH;
        float s = sat.y + (sat.x - sat.y) * wS + (sat.z - sat.y) * wH;
        c = vec3(y) + s * (c - vec3(y)); c += wS * tS + wM * tM + wH * tH;
        float r = length(vUv * 2.0 - 1.0) * 0.70710678; c *= 1.0 - vig.x * smoothstep(vig.y, 1.0, r);
        gl_FragColor = vec4(mix(src, clamp(c, 0.0, 1.0), cantidad), b.a);
      }`,
  };

  K.look3d = (o = {}) => {
    const { dof = true, color = 'dia', cantidad = 1, maxCoC = 24 } = o;
    const comp = K.composer, ren = K.renderer, esc = K.scene, cam = K.cam;
    if (!comp) throw new Error('K.look3d va después de K.tres()');
    const salida = comp.passes.findIndex(p => p.constructor && p.constructor.name === 'OutputPass');
    const L = {};
    if (dof) {
      const rt = new T.WebGLRenderTarget(K.W, K.H);
      const matProf = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking });
      const pase = new T.ShaderPass(DOF);
      pase.uniforms.tDepth.value = rt.texture; pase.uniforms.res.value.set(K.W, K.H); pase.uniforms.maxCoC.value = maxCoC;
      const render = pase.render.bind(pase);
      pase.render = (r, w, rd, dt, m) => {
        if (pase.uniforms.cInf.value >= 0.25) {
          const antes = esc.overrideMaterial, fondo = esc.background;
          esc.overrideMaterial = matProf; esc.background = null;
          r.setRenderTarget(rt); r.setClearColor(0xffffff, 1); r.clear(); r.render(esc, cam);
          esc.overrideMaterial = antes; esc.background = fondo; r.setRenderTarget(null);
          pase.uniforms.near.value = cam.near; pase.uniforms.far.value = cam.far;
        }
        render(r, w, rd, dt, m);
      };
      comp.insertPass(pase, salida >= 0 ? salida : comp.passes.length);
      L.dof = pase;
    }
    if (color) {
      const pase = new T.ShaderPass(COLOR);
      comp.addPass(pase);
      L.color = pase;
    }
    L.enfoque = (dist, px = 12) => { if (L.dof) { L.dof.uniforms.focus.value = dist; L.dof.uniforms.cInf.value = px; } };
    L.colorear = (a, b = null, t = 0, cant = cantidad) => {
      if (!L.color) return;
      const A = typeof a === 'string' ? AJUSTES[a] : a, B = typeof b === 'string' ? AJUSTES[b] : b, lerp = (x, y) => x + (y - x) * t;
      const P = B ? { ky: A.ky.map((v, i) => lerp(v, B.ky[i])), sat: A.sat.map((v, i) => lerp(v, B.sat[i])), s: A.s.map((v, i) => lerp(v, B.s[i])), m: A.m.map((v, i) => lerp(v, B.m[i])), h: A.h.map((v, i) => lerp(v, B.h[i])), vig: A.vig.map((v, i) => lerp(v, B.vig[i])) } : A;
      const u = L.color.uniforms;
      u.ky.value = P.ky.slice(); u.km.value = tangentes(P.ky); u.sat.value.set(...P.sat); u.tS.value.copy(tinte(P.s)); u.tM.value.copy(tinte(P.m)); u.tH.value.copy(tinte(P.h)); u.vig.value.set(...P.vig); u.cantidad.value = cant;
    };
    if (color) L.colorear(color);
    L.AJUSTES = AJUSTES;
    return L;
  };
})();
