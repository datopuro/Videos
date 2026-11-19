/* Mary Anning · base de la escena (sirve para el completo horizontal y los reels verticales).
   Referencias:
   https://www.geolsoc.org.uk/the-library/online-exhibitions/mary-anning-and-the-geological-society : sala de la Sociedad
     Geológica (pequeña, primer piso), plesiosaurio de 1823 y dibujos que circularon.
   https://www.nhm.ac.uk/discover/mary-anning-unsung-hero.html : acantilados de Lyme Regis, cráneo de ictiosaurio, perro Tray.
   https://wellcomecollection.org/stories/ZMkQzBAAACAADSiq : carta y dibujo del plesiosaurio (diciembre de 1823).
   kit/INDICE.md y kit/UTILERIA.md : C.historia, C.lugar, C.cuando y C.subtitulos (reglas del canal). */
const D = __DATA__; C.datos(D); const g = C.lienzo();
C.probarVoz();
const V = C.H > C.W, W = C.W, HH = C.H, CX = W / 2, TAU = Math.PI * 2;
const PISO = V ? 1180 : 840, ESC = V ? 1.7 : 1.4, K = V ? 0.66 : 1;
const KP = o => V ? Math.min(o.k ?? 1, 1.12) : (o.k ?? 1);
const sx = d => CX + d * K;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), suave = u => { u = cl(u); return u * u * (3 - 2 * u); };
const q = (frase, o) => { try { return C.cuando(frase, o); } catch (e) { return null; } };
const T = (frase, o) => C.cuando(frase, o);
const ent = (t, t0, d = 0.35) => t0 == null ? 0 : suave((t - t0) / d);

const H = C.historia({
  personajes: {
    mary_nina: { cuerpo: { complexion: 'delgado', edad: 'nino' }, piel: '#f0d2b8', pelo: { estilo: 'coleta', color: '#6b4a2f' }, ropa: { arriba: { tipo: 'vestido', color: '#8a7f6c' }, pies: { color: '#3a2c25' } } },
    mary: { cuerpo: { complexion: 'delgado' }, piel: '#f0d2b8', pelo: { estilo: 'coleta', color: '#6b4a2f' }, ropa: { arriba: { tipo: 'vestido', color: '#5b6b7a' }, pies: { color: '#3a2c25' } } },
    joseph: { cuerpo: { complexion: 'medio', edad: 'nino' }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#4a3a2a' }, ropa: { arriba: { tipo: 'camisa', color: '#d8d0c0' }, abajo: { tipo: 'pantalon', color: '#6a5642' }, pies: { color: '#2a2220' } } },
    richard: { cuerpo: { complexion: 'robusto' }, piel: '#e8c3a4', pelo: { estilo: 'corto', color: '#3a2c25' }, bigote: '#3a2c25', ropa: { arriba: { tipo: 'camisa', color: '#8a8a80' }, abajo: { tipo: 'pantalon', color: '#5a4632' }, pies: { color: '#2a2220' } } },
    molly: { cuerpo: { complexion: 'medio' }, piel: '#f0d2b8', pelo: { estilo: 'coleta', color: '#7a6a5a' }, ropa: { arriba: { tipo: 'vestido', color: '#4a4a52' }, pies: { color: '#3a2c25' } } },
    vecina: { cuerpo: { complexion: 'medio' }, piel: '#f0d2b8', pelo: { estilo: 'largo', color: '#5b4636' }, ropa: { arriba: { tipo: 'vestido', color: '#8a6a5a' }, pies: { color: '#3a2c25' } } },
    henley: { cuerpo: { complexion: 'medio' }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#5a4636' }, ropa: { arriba: { tipo: 'saco', color: '#4f5e3f' }, abajo: { tipo: 'pantalon', color: '#d9cfb8' }, pies: { color: '#1a1a1a' } } },
    birch: { cuerpo: { complexion: 'medio' }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#9a9a9a' }, bigote: '#9a9a9a', ropa: { arriba: { tipo: 'saco', color: '#7a2f2f' }, abajo: { tipo: 'pantalon', color: '#3a3f4f' }, pies: { color: '#2a2220' } } },
    cuvier: { cuerpo: { complexion: 'medio' }, piel: '#e8c3a4', pelo: { estilo: 'largo', color: '#cfcfcf' }, ropa: { arriba: { tipo: 'saco', color: '#202020' }, abajo: { tipo: 'pantalon', color: '#202020' }, pies: { color: '#1a1a1a' } } },
    clerigo: { cuerpo: { complexion: 'delgado' }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#4a3a2a' }, ropa: { arriba: { tipo: 'saco', color: '#2a2a2a' }, abajo: { tipo: 'pantalon', color: '#2a2a2a' }, pies: { color: '#1a1a1a' } } },
    presidente: { cuerpo: { complexion: 'medio' }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#6a5a4a' }, ropa: { arriba: { tipo: 'saco', color: '#2c3a52' }, abajo: { tipo: 'pantalon', color: '#2c3a52' }, pies: { color: '#1a1a1a' } } },
    amiga: { cuerpo: { complexion: 'medio' }, piel: '#f0d2b8', pelo: { estilo: 'largo', color: '#3b2a22' }, ropa: { arriba: { tipo: 'vestido', color: '#7a5a7a' }, pies: { color: '#3a2c25' } } },
    socio: { cuerpo: { complexion: 'robusto' }, piel: '#e8c3a4', pelo: { estilo: 'calvo', color: '#6a5a4a' }, ropa: { arriba: { tipo: 'saco', color: '#3a3a44' }, abajo: { tipo: 'pantalon', color: '#2a2a30' }, pies: { color: '#1a1a1a' } } }
  },
  objetos: {
    olmo: { tipo: 'arbol', alto: 900, color: '#4f7a46' },
    bebe: { tipo: 'bulto' },
    mesa: { tipo: 'mesa', color: '#8a6440', ancho: 420 },
    mesa_sala: { tipo: 'mesa', color: '#5a3d2b', ancho: 1000, alto: 160 },
    amonita: { tipo: 'amonita' },
    amonita_g: { tipo: 'amonita', radio: 46, color: '#b8a888' },
    canasta: { tipo: 'canasta' },
    martillo: { tipo: 'martillo' },
    craneo: { tipo: 'craneo' },
    ictio: { tipo: 'ictiosaurio' },
    plesio: { tipo: 'plesiosaurio' },
    plesio_mesa: { tipo: 'plesiosaurio', losa: false },
    hueso: { tipo: 'hoja', dibujo: 'hueso' },
    dibujo: { tipo: 'hoja', dibujo: 'plesiosaurio' },
    carta: { tipo: 'hoja', dibujo: 'carta' },
    articulo: { tipo: 'hoja', dibujo: 'articulo' },
    libro: { tipo: 'libro' },
    deudas: { tipo: 'libro', color: '#3f3a32' },
    vela: { tipo: 'vela' },
    cama: { tipo: 'cama', color: '#8a7f6c' },
    cama_nina: { tipo: 'cama', color: '#a9988a' },
    silla: { tipo: 'silla', color: '#7a5236' },
    silla_sala: { tipo: 'silla', color: '#4a3226', cojin: '#7a2f2f' },
    puerta: { tipo: 'puerta', color: '#5a3b26' },
    ventana: { tipo: 'ventana', exterior: 'dia', cortina: '#9a7a5a' },
    ventana_noche: { tipo: 'ventana', exterior: 'noche', cortina: '#6a5a4a' },
    escritorio: { tipo: 'escritorio', color: '#5a3b26' },
    monedas: { tipo: 'monedas' },
    caja: { tipo: 'caja', ancho: 760 },
    carreta: { tipo: 'carreta' },
    sobre: { tipo: 'sobre' },
    roca: { tipo: 'roca', color: '#7e8794' },
    roca_c: { tipo: 'roca', color: '#a9a291', ancho: 180 },
    vitral: { tipo: 'vitral' },
    vitrina: { tipo: 'vitrina' },
    tray: { tipo: 'perro' },
    lampara: { tipo: 'lampara', color: '#d9b46a' }
  }
});

const AC = { piso: PISO, alto: V ? 860 : 600 };
const LUG = {
  tormenta: C.lugar('campo', { hora: 'nublado', piso: PISO, pasto: '#5f8a4f' }),
  campo: C.lugar('campo', { hora: 'dia', piso: PISO, pasto: '#6a9a55', flores: true }),
  playa: C.lugar('acantilado', { hora: 'dia', ...AC }),
  playa_tarde: C.lugar('acantilado', { hora: 'tarde', ...AC }),
  playa_nub: C.lugar('acantilado', { hora: 'nublado', ...AC, derrumbe: true }),
  playa_izq: C.lugar('acantilado', { hora: 'dia', ...AC, mar: 'izq' }),
  noche: C.lugar('acantilado', { hora: 'noche', piso: PISO, alto: V ? 640 : 400, mar: 'izq' }),
  casa: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#cdb99a', tapiz: 'madera', ventanaX: V ? 200 : 360 }),
  casa_noche: C.lugar('interior', { hora: 'noche', piso: PISO, pared: '#b9a487', tapiz: 'madera' }),
  estudio: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#9fb0a8', tapiz: 'rayas', suelo: 'madera', ventanaX: V ? 860 : 1500 }),
  paris: C.lugar('interior', { hora: 'tarde', piso: PISO, pared: '#d3c19c', tapiz: 'rayas', suelo: 'loseta', alfombra: '#7a2f2f' }),
  subasta: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#b8a48a', tapiz: 'puntos', suelo: 'madera', alfombra: '#5a4a6a' }),
  sala: C.lugar('interior', { hora: 'noche', piso: PISO, pared: '#4f6152', tapiz: 'madera', suelo: 'madera' }),
  pasillo: C.lugar('interior', { hora: 'noche', piso: PISO, pared: '#6a5a4a', tapiz: 'rayas', suelo: 'loseta' }),
  calle: C.lugar('calle', { hora: 'nublado', piso: PISO, colores: ['#c9b8a0', '#b7a99a', '#a99c8f', '#c4b39a'] }),
  iglesia: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#bdb3a3', friso: false, suelo: 'loseta' }),
  museo: C.lugar('interior', { hora: 'noche', piso: PISO, pared: '#2f3442', friso: false, suelo: 'loseta' })
};

/* Escena: fondo → (cámara: paneo px y acercamiento z alrededor de un punto del piso) → objetos y personajes → frente → luz. */
const escena = (L, e, fn) => {
  const t = e.t, px = e.px || 0, z = e.z || 1, fx = e.fx ?? CX, sh = e.temblor ? [C.ruido(t * 23, 3) * e.temblor, C.ruido(t * 19, 7) * e.temblor] : [0, 0];
  L.dibujar(g, { t, x: px + sh[0] * 0.3, marea: e.marea });
  g.save(); g.translate(sh[0], sh[1]); g.translate(fx, PISO); g.scale(z, z); g.translate(-fx - px, -PISO);
  fn();
  g.restore();
  L.frente(g, { t, x: px }); L.luz(g, { t, x: px, focos: e.focos });
};
let G = g;
const per = (id, o) => H.per(id).dibujar(G, { ...o, escala: ESC * KP(o) });
const obj = (id, o) => H.obj(id).dibujar(G, { ...o, escala: ESC * (o.k ?? 1) });
const enMano = (o, mano, id, oo = {}) => { const k = ESC * KP(o), m = o[mano], p = o.pose || {}, ox = (p.dx || 0), oy = (p.suelo ? 92 : 0) + (p.dy || 0); H.obj(id).dibujar(G, { t: o.t, ...oo, x: o.x + (m[0] + ox) * k + (oo.dx || 0) * k, y: o.y + (m[1] + oy) * k + (oo.dy || 0) * k, escala: k * (oo.k ?? 1) }); };
const silueta = (fn, a = 0.82) => C.iluminar(g, gg => { const v = G; G = gg; try { fn(); } finally { G = v; } }, { tinte: `rgba(22,22,34,${a})` });
const cargaBebe = (id, o) => { const k = ESC * KP(o); per(id, { ...o, manoD: [30, -136], manoI: [-30, -140] }); H.obj('bebe').dibujar(G, { x: o.x - 6 * k, y: o.y - 118 * k, t: o.t, escala: k * 0.62 }); };

/* Textos en pantalla (después de L.luz). */
const etiqueta = (txt, a, o = {}) => C.rotulo(g, txt, a, { tam: o.tam || (V ? 62 : 58), y: o.y ?? (V ? 360 : 100), color: o.color || '#ffe7a8' });
const titular = (txt, a, o = {}) => C.rotulo(g, txt, a, { tam: o.tam || (V ? 96 : 104), y: o.y ?? (V ? 450 : 170), color: o.color || '#ffffff' });
const sello = (txt, x, y, a, o = {}) => {
  if (a <= 0.01) return;
  const tam = o.tam || (V ? 80 : 90), col = o.color || '#d8432f', s = 1 + 0.6 * (1 - suave(a));
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = cl(a); g.translate(x, y); g.rotate((o.rot ?? -8) * Math.PI / 180); g.scale(s, s);
  g.font = `900 ${tam}px ${C.FUENTE}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = g.measureText(txt).width + tam * 0.7, h = tam * 1.35;
  g.fillStyle = 'rgba(255,248,235,0.86)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, tam * 0.18); g.fill();
  g.lineWidth = tam * 0.1; g.strokeStyle = col; g.stroke(); g.fillStyle = col; g.fillText(txt, 0, tam * 0.04);
  g.restore();
};
const aro = (x, y, r, a) => { if (a <= 0.01) return; g.save(); g.globalAlpha = cl(a); g.lineWidth = 9; g.strokeStyle = '#ffd54a'; g.setLineDash([22, 14]); g.lineDashOffset = -a * 60; g.beginPath(); g.ellipse(x, y, r * (1.3 - 0.3 * suave(a)), r * 0.8 * (1.3 - 0.3 * suave(a)), 0, 0, TAU); g.stroke(); g.restore(); };
const rayo = (x0, y0, x1, y1, a) => {
  if (a <= 0.01) return;
  const pts = [[x0, y0]]; for (let i = 1; i < 9; i++) { const u = i / 9; pts.push([x0 + (x1 - x0) * u + (C.hash(i * 7.3) - 0.5) * 90, y0 + (y1 - y0) * u]); } pts.push([x1, y1]);
  g.save(); g.globalAlpha = cl(a); g.lineJoin = 'round'; g.lineCap = 'round';
  for (const [w, c] of [[30, 'rgba(190,210,255,0.35)'], [12, '#e8f0ff'], [5, '#ffffff']]) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
  g.restore();
};
const polvo = (x, y, a, r = 200) => { if (a <= 0.01) return; g.save(); g.globalAlpha = cl(a) * 0.85; C.masa(g, [[x - r * 0.6, y - r * 0.3, r * 0.5], [x, y - r * 0.6, r * 0.65], [x + r * 0.6, y - r * 0.25, r * 0.5], [x - r * 0.2, y, r * 0.55], [x + r * 0.3, y + r * 0.05, r * 0.5]], '#b7b0a3', { lw: 0, sombra: 18 }); g.restore(); };
const oscuro = (a, col = '#0c0d12') => C.fundido(g, a, col);
const sepia = a => { if (a <= 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'color'; g.globalAlpha = a; g.fillStyle = '#a8865a'; g.fillRect(0, 0, W, HH); g.restore(); };

const escribiendo = (t, quien, hoja, foco = true) => {
  escena(LUG.casa_noche, { t, px: 0, z: 1.12, fx: sx(0), focos: [{ x: sx(-250), y: PISO - 120, r: 600, fuerza: 1 }] }, () => {
    const golpe = Math.sin(t * 9) * 6;
    per(quien, { t, x: sx(0), y: PISO - 40, k: quien === 'mary' ? 1.0 : 1.15, cara: 'neutral', mira: [0.2, 0.9], pose: { cab: 14 }, manoD: [56 + golpe, -112] });
    obj('mesa', { x: sx(0), y: PISO + 90, t, k: 1.2 });
    const top = PISO + 90 - 150 * ESC * 1.2;
    obj(hoja, { x: sx(60), y: top, t, k: 0.5, trazo: 1 });
    obj('vela', { x: sx(-250), y: top, t, k: 0.85 });
  });
};
const inserto = (t, hojas) => {
  escena(LUG.casa_noche, { t, px: 0, z: 1, focos: [{ x: sx(-300), y: PISO - 200, r: 700, fuerza: 1 }] }, () => { obj('mesa', { x: sx(0), y: PISO + 640, t, k: 3.4 }); });
  oscuro(0.3);
  for (const h of hojas) H.obj(h.id).dibujar(g, { x: h.x ?? CX, y: h.y ?? (V ? 1020 : 900), t, escala: ESC * (h.k ?? (V ? 3.0 : 3.1)), trazo: h.trazo ?? 1, rot: h.rot || 0 });
};
const TOMAS = [];
const toma = (ini, fn) => { if (ini != null) TOMAS.push({ ini, fn }); };
