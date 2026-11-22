/* Angela Woodruff · base de la escena (completo horizontal y reels verticales con el mismo código).
   Referencias:
   https://bbctodays.pages.dev/2/hi/in_depth/uk/2000/the_shipman_murders/the_shipman_files/609972.stm : testamento,
     máquina de escribir del consultorio, oficinas de Hyde y Warwick (archivo BBC, 31 ene 2000).
   https://www.crimeandinvestigation.co.uk/crime-files/harold-shipman/trial : juicio en Preston, Angela primera testigo.
   https://www.gov.uk/government/publications/the-shipman-inquiry-second-report-the-police-investigation-of-march-1988 :
     la investigación cerrada el 17 de abril de 1998.
   historias/videos/mary-anning/fuentes/mary0.js : cámara, ayudas de rótulos y adaptación horizontal/vertical.
   kit/INDICE.md y kit/UTILERIA.md : C.historia, C.lugar, C.cuando y C.subtitulos. */
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
    angela: { cuerpo: { complexion: 'medio' }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#4a3426' }, ropa: { arriba: { tipo: 'saco', color: '#2c3a52' }, abajo: { tipo: 'falda', color: '#5a5a60' }, pies: { color: '#2a2220' } } },
    kathleen: { cuerpo: { complexion: 'delgado', estatura: 0.94 }, piel: '#f0d2b8', pelo: { estilo: 'rizado', color: '#e6e6e6' }, ropa: { arriba: { tipo: 'saco', color: '#8a6a9a' }, abajo: { tipo: 'falda', color: '#4a4a52' }, pies: { color: '#3a2c25' } } },
    kathleen_joven: { cuerpo: { complexion: 'delgado' }, piel: '#f0d2b8', pelo: { estilo: 'coleta', color: '#5b4636' }, ropa: { arriba: { tipo: 'camisa', color: '#d8d0c0' }, abajo: { tipo: 'falda', color: '#5a5a60' }, pies: { color: '#2a2220' } } },
    abogado: { cuerpo: { complexion: 'medio' }, piel: '#e8c3a4', pelo: { estilo: 'corto', color: '#6a5a4a' }, ropa: { arriba: { tipo: 'saco', color: '#3a3f4f' }, abajo: { tipo: 'pantalon', color: '#3a3f4f' }, pies: { color: '#1a1a1a' } } },
    detective: { cuerpo: { complexion: 'robusto' }, piel: '#e8c3a4', pelo: { estilo: 'corto', color: '#9a9a9a' }, bigote: '#9a9a9a', ropa: { arriba: { tipo: 'saco', color: '#5a5a52' }, abajo: { tipo: 'pantalon', color: '#2a2a2a' }, pies: { color: '#1a1a1a' } } },
    perito: { cuerpo: { complexion: 'delgado' }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#4a3a2a' }, ropa: { arriba: { tipo: 'saco', color: '#f2f2f2' }, abajo: { tipo: 'pantalon', color: '#3a3a40' }, pies: { color: '#1a1a1a' } } },
    doctor: { cuerpo: { complexion: 'medio' }, piel: '#1a1a1a', pelo: { estilo: 'corto', color: '#1a1a1a' }, ropa: { arriba: { tipo: 'saco', color: '#1a1a1a' }, abajo: { tipo: 'pantalon', color: '#1a1a1a' }, pies: { color: '#1a1a1a' } } },
    doctora: { cuerpo: { complexion: 'delgado' }, piel: '#1a1a1a', pelo: { estilo: 'coleta', color: '#1a1a1a' }, ropa: { arriba: { tipo: 'saco', color: '#1a1a1a' }, abajo: { tipo: 'falda', color: '#1a1a1a' }, pies: { color: '#1a1a1a' } } },
    vecino: { cuerpo: { complexion: 'robusto' }, piel: '#e8c3a4', pelo: { estilo: 'calvo', color: '#6a5a4a' }, ropa: { arriba: { tipo: 'saco', color: '#3a3a44' }, abajo: { tipo: 'pantalon', color: '#2a2a30' }, pies: { color: '#1a1a1a' } } },
    vecina: { cuerpo: { complexion: 'medio' }, piel: '#f0d2b8', pelo: { estilo: 'corto', color: '#cfcfcf' }, ropa: { arriba: { tipo: 'vestido', color: '#6a5a5a' }, pies: { color: '#3a2c25' } } }
  },
  objetos: {
    sillon: { tipo: 'sillon', color: '#8a6a5a', cojin: '#b9a58a' },
    manta: { tipo: 'manta', color: '#8aa0b8' },
    taza: { tipo: 'taza' },
    mesita: { tipo: 'mesa', color: '#7a5236', ancho: 220, alto: 90 },
    mesa: { tipo: 'mesa', color: '#7a5a3e', ancho: 420 },
    mesa_larga: { tipo: 'mesa', color: '#c9b79a', ancho: 900 },
    escritorio: { tipo: 'escritorio', color: '#5a3b26' },
    escritorio_c: { tipo: 'escritorio', color: '#8a8f98' },
    ventana: { tipo: 'ventana', exterior: 'lluvia', cortina: '#9a7a8a' },
    ventana_of: { tipo: 'ventana', exterior: 'dia', cortina: '#6a7a8a' },
    puerta: { tipo: 'puerta', color: '#2f4a3a' },
    puerta2: { tipo: 'puerta', color: '#7a2f2f' },
    puerta_c: { tipo: 'puerta', color: '#5a5a62' },
    silla: { tipo: 'silla', color: '#7a5236' },
    silla_espera: { tipo: 'silla', color: '#5a6a7a', cojin: '#8a9aaa' },
    banca: { tipo: 'banca', color: '#6b4528' },
    lampara: { tipo: 'lampara', color: '#d9b46a' },
    testamento: { tipo: 'documento', estilo: 'torpe' },
    original: { tipo: 'documento', estilo: 'limpio' },
    certificado: { tipo: 'documento', estilo: 'certificado', texto: 'VEJEZ' },
    firmas: { tipo: 'documento', estilo: 'firmas' },
    sobre: { tipo: 'sobre', color: '#e8dcbc' },
    maquina: { tipo: 'maquina' },
    telefono: { tipo: 'telefono' },
    auricular: { tipo: 'auricular' },
    lupa: { tipo: 'lupa' },
    tubo: { tipo: 'tubo' },
    maletin: { tipo: 'maletin' },
    reloj: { tipo: 'reloj' },
    calendario: { tipo: 'calendario', mes: 'JUNIO 1998', dia: 24 },
    monitor: { tipo: 'monitor' },
    carpa: { tipo: 'carpa' },
    tablero: { tipo: 'tablero', n: 15 },
    lapida: { tipo: 'lapida' },
    carpeta: { tipo: 'carpeta', texto: 'GRUNDY · 1986' },
    carpeta_p: { tipo: 'carpeta', color: '#9aa8b8' },
    archivero: { tipo: 'archivero' },
    estrado: { tipo: 'estrado' },
    juez: { tipo: 'estrado', ancho: 700, color: '#4f3220' },
    libreta: { tipo: 'libro', chico: true, color: '#2c3a52' },
    coche: { tipo: 'coche', color: '#e8e8e4' },
    arbol: { tipo: 'arbol', alto: 700, color: '#4f6a46' }
  }
});
const AC = {};
const LUG = {
  casa_k: C.lugar('interior', { hora: 'nublado', piso: PISO, pared: '#c9b8a8', tapiz: 'puntos', suelo: 'madera', alfombra: '#7a5a6a' }),
  oficina_h: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#a8b4a0', tapiz: 'madera', suelo: 'loseta' }),
  oficina_w: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#b8a890', tapiz: 'rayas', suelo: 'madera', alfombra: '#2c3a52' }),
  oficina_w_tarde: C.lugar('interior', { hora: 'tarde', piso: PISO, pared: '#b8a890', tapiz: 'rayas', suelo: 'madera', alfombra: '#2c3a52' }),
  casa_a: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#d6c9a8', tapiz: 'madera', suelo: 'madera' }),
  club: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#b9c9b0', tapiz: 'madera', suelo: 'loseta' }),
  antigua: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#c8b48c', tapiz: 'madera', suelo: 'madera' }),
  calle: C.lugar('calle', { hora: 'nublado', piso: PISO, colores: ['#9a5a44', '#a8664c', '#8e5240', '#b07258'] }),
  calle_alba: C.lugar('calle', { hora: 'tarde', piso: PISO, colores: ['#9a5a44', '#a8664c', '#8e5240', '#b07258'] }),
  cementerio: C.lugar('campo', { hora: 'nublado', piso: PISO, pasto: '#5f7a54' }),
  cementerio_n: C.lugar('campo', { hora: 'noche', piso: PISO, pasto: '#3f5a44' }),
  comisaria: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#9aa8b0', tapiz: 'rayas', suelo: 'loseta' }),
  consultorio: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#c8d4cc', friso: false, suelo: 'loseta' }),
  lab: C.lugar('interior', { hora: 'noche', piso: PISO, pared: '#8fa6b8', friso: false, suelo: 'loseta' }),
  espera: C.lugar('interior', { hora: 'nublado', piso: PISO, pared: '#c4ccc0', friso: false, suelo: 'loseta' }),
  juicio: C.lugar('interior', { hora: 'dia', piso: PISO, pared: '#6b4a32', tapiz: 'madera', suelo: 'madera', alfombra: '#5a2a2a' }),
  pasillo: C.lugar('interior', { hora: 'nublado', piso: PISO, pared: '#a8a49a', tapiz: 'rayas', suelo: 'loseta' })
};
const escena = (L, e, fn) => {
  const t = e.t, px = e.px || 0, z = e.z || 1, fx = e.fx ?? CX, sh = e.temblor ? [C.ruido(t * 23, 3) * e.temblor, C.ruido(t * 19, 7) * e.temblor] : [0, 0];
  L.dibujar(g, { t, x: px + sh[0] * 0.3, marea: e.marea });
  g.save(); g.translate(sh[0], sh[1]); g.translate(fx, PISO); g.scale(z, z); g.translate(-fx - px, -PISO);
  fn();
  g.restore();
  L.frente(g, { t, x: px }); L.luz(g, { t, x: px, focos: e.focos });
};
let G = g;
const SIL = { doctor: 1, doctora: 1 };
const per = (id, o) => {
  const d = { ...(id === 'kathleen' ? { lentes: true } : {}), ...o, escala: ESC * KP(o) };
  if (SIL[id] && G === g) return C.iluminar(g, gg => H.per(id).dibujar(gg, { ...d, cara: 'neutral', sombra: false }), { tinte: 'rgba(16,16,22,1)' });
  H.per(id).dibujar(G, d);
};
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

/* Inserto: primer plano de papeles sobre una mesa oscurecida. */
const inserto = (t, hojas, L = LUG.oficina_w, os = 0.35) => {
  escena(L, { t, px: 0, z: 1 }, () => { obj('mesa', { x: sx(0), y: PISO + 640, t, k: 3.4 }); });
  oscuro(os);
  for (const h of hojas) H.obj(h.id).dibujar(g, { t, ...h, x: h.x ?? CX, y: h.y ?? (V ? 1080 : 960), escala: ESC * (h.k ?? (V ? 2.6 : 2.7)), rot: h.rot || 0 });
};
const texto = (txt, x, y, a, o = {}) => { if (a <= 0.01) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = cl(a); g.font = `800 ${o.tam || 48}px ${C.FUENTE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = (o.tam || 48) * 0.22; g.strokeStyle = '#0e0c14'; g.strokeText(txt, x, y); g.fillStyle = o.color || '#ffffff'; g.fillText(txt, x, y); g.restore(); };
const TOMAS = [];
const toma = (ini, fn) => { if (ini != null) TOMAS.push({ ini, fn }); };
