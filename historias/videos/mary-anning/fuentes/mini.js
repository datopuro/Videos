
const D = __DATA__; C.datos(D); const g = C.lienzo();
const V = C.H > C.W, W = C.W, HH = C.H, TAU = Math.PI * 2;
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


const LUG = {
  playa: C.lugar('acantilado', { hora: 'dia', piso: V ? 1500 : 700, alto: V ? 1100 : 520 }),
  tarde: C.lugar('acantilado', { hora: 'tarde', piso: V ? 1500 : 700, alto: V ? 1100 : 520 }),
  tormenta: C.lugar('campo', { hora: 'nublado', piso: V ? 1500 : 700 }),
  pasillo: C.lugar('interior', { hora: 'noche', piso: V ? 1500 : 700, pared: '#6a5a4a', tapiz: 'rayas', suelo: 'loseta' }),
  sala: C.lugar('interior', { hora: 'noche', piso: V ? 1500 : 700, pared: '#4f6152', tapiz: 'madera', suelo: 'madera' })
};
const texto = (lineas, y, tam, cols) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  lineas.forEach((l, i) => { g.font = `900 ${tam}px ${C.FUENTE}`; let k = Math.min(1, W * 0.92 / g.measureText(l).width); g.font = `900 ${tam * k}px ${C.FUENTE}`; g.lineWidth = tam * k * 0.2; g.strokeStyle = '#0e0c14'; g.strokeText(l, W / 2, y + i * tam * 1.12); g.fillStyle = cols[i] || '#fff'; g.fillText(l, W / 2, y + i * tam * 1.12); }); g.restore(); };
const sello = (txt, x, y, tam, col = '#d8432f', rot = -8) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.font = `900 ${tam}px ${C.FUENTE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width + tam * 0.7, h = tam * 1.35; g.fillStyle = 'rgba(255,248,235,0.92)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, tam * 0.18); g.fill(); g.lineWidth = tam * 0.1; g.strokeStyle = col; g.stroke(); g.fillStyle = col; g.fillText(txt, 0, tam * 0.04); g.restore(); };
const parte = n => { if (!V) return; g.save(); g.font = `900 64px ${C.FUENTE}`; const w = g.measureText('PARTE ' + n).width + 70; g.fillStyle = '#d8432f'; g.beginPath(); g.roundRect((W - w) / 2, 300, w, 92, 46); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PARTE ' + n, W / 2, 348); g.restore(); };
const bandas = () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); let gr = g.createLinearGradient(0, HH * 0.55, 0, HH); gr.addColorStop(0, 'rgba(14,12,20,0)'); gr.addColorStop(1, 'rgba(14,12,20,0.88)'); g.fillStyle = gr; g.fillRect(0, HH * 0.55, W, HH * 0.45); gr = g.createLinearGradient(0, 0, 0, HH * 0.22); gr.addColorStop(0, 'rgba(14,12,20,0.6)'); gr.addColorStop(1, 'rgba(14,12,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, HH * 0.22); g.restore(); };
const rayo = (x0, y0, x1, y1) => { const pts = [[x0, y0]]; for (let i = 1; i < 9; i++) { const u = i / 9; pts.push([x0 + (x1 - x0) * u + (C.hash(i * 7.3) - 0.5) * 120, y0 + (y1 - y0) * u]); } pts.push([x1, y1]); g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; for (const [w, c] of [[40, 'rgba(190,210,255,0.35)'], [16, '#e8f0ff'], [6, '#ffffff']]) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); } g.restore(); };
const cara = (id, x, y, k, cara, o = {}) => H.per(id).dibujar(g, { t: 1, x, y, escala: k, cara, giro: o.giro || 0, mira: o.mira || [0, 0], sinParpadeo: true, vivo: false, sombra: false, pelo: o.pelo, manoD: o.manoD, manoI: o.manoI });
window.renderAt = t => {
  g.limpiar(); const n = Math.round(t);
  const L = n === 1 ? LUG.tormenta : n === 2 ? LUG.tarde : n === 3 ? LUG.pasillo : n === 4 ? LUG.sala : LUG.tormenta;
  L.dibujar(g, { t: 1, x: 0 });
  if (n === 1 || n === 5) { H.obj('olmo').dibujar(g, { x: V ? 820 : 1040, y: L.piso, t: 1, escala: V ? 1.3 : 0.75 }); }
  if (n === 3) H.obj('puerta').dibujar(g, { x: V ? 820 : 1030, y: L.piso, t: 1, escala: V ? 1.7 : 1.1, abierta: 0 });
  if (n === 4) { H.obj('mesa_sala').dibujar(g, { x: W / 2, y: L.piso + 40, t: 1, escala: V ? 1.0 : 0.6 }); }
  L.frente(g, { t: 1 }); L.luz(g, { t: 1, x: 0, focos: n === 4 ? [{ x: W / 2, y: L.piso - 300, r: 900, fuerza: 1 }] : [] });
  if (n === 1 || n === 5) rayo(V ? 760 : 1000, -20, V ? 830 : 1040, V ? 600 : 220);
  if (V) {
    const ids = { 1: 'mary', 2: 'mary', 3: 'mary', 4: 'mary' }, caras = { 1: 'sorpresa', 2: 'triste', 3: 'miedo', 4: 'triste' };
    cara(ids[n], n === 1 ? 470 : 540, 1980, 3.3, caras[n], { giro: n === 3 ? -0.35 : 0.25, mira: n === 3 ? [0.7, -0.2] : [0.3, -0.1], pelo: [-14, 0] });
    if (n === 1) H.obj('bebe').dibujar(g, { x: 880, y: 1640, t: 1, escala: 2.0 });
    if (n === 2) H.obj('canasta').dibujar(g, { x: 860, y: 1700, t: 1, escala: 1.9, lleno: 0 });
    if (n === 4) H.obj('dibujo').dibujar(g, { x: 800, y: 1680, t: 1, escala: 2.6, rot: -6 });
    bandas(); parte(n);
    if (n === 1) texto(['UN RAYO MATÓ', 'A 3 MUJERES'], 560, 120, ['#fff', '#ffd54a']), texto(['LA BEBÉ SOBREVIVIÓ'], 1440, 92, ['#fff']);
    if (n === 2) texto(['CASI UN AÑO', 'SIN ENCONTRAR NADA'], 560, 110, ['#fff', '#ffd54a']), texto(['Y EMPEZARON A VENDER', 'LOS MUEBLES'], 1420, 72, ['#fff', '#fff']);
    if (n === 3) { texto(['DIJERON QUE', 'ERA UN FRAUDE'], 560, 120, ['#fff', '#ffd54a']); sello('SOLO HOMBRES', 700, 1250, 70); texto(['Y A ELLA NO LA DEJARON ENTRAR'], 1440, 60, ['#fff']); }
    if (n === 4) { texto(['SU DIBUJO', 'SOBRE LA MESA'], 560, 120, ['#fff', '#ffd54a']); texto(['¿Y SU NOMBRE?'], 1440, 96, ['#fff']); }
    texto(['MARY ANNING · HISTORIA REAL'], 1760, 40, ['#ffe7a8']);
  } else {
    cara('mary', 330, 1180, 2.6, 'sorpresa', { giro: 0.3, mira: [0.4, -0.1], pelo: [-12, 0] });
    H.obj('dibujo').dibujar(g, { x: 940, y: 640, t: 1, escala: 1.9, rot: 6 });
    g.save(); let gr = g.createLinearGradient(520, 0, 1280, 0); gr.addColorStop(0, 'rgba(14,12,30,0)'); gr.addColorStop(0.35, 'rgba(14,12,30,0.55)'); gr.addColorStop(1, 'rgba(14,12,30,0.7)'); g.fillStyle = gr; g.fillRect(520, 0, 760, 720); g.restore();
    g.save(); g.textAlign = 'right'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    for (const [txt, y, tam, col] of [['SOBREVIVIÓ', 120, 104, '#ffffff'], ['A UN RAYO', 232, 104, '#ffd54a']]) { g.font = `900 ${tam}px ${C.FUENTE}`; g.lineWidth = 20; g.strokeStyle = '#0e0c14'; g.strokeText(txt, 1240, y); g.fillStyle = col; g.fillText(txt, 1240, y); }
    g.font = `700 34px ${C.FUENTE}`; g.lineWidth = 8; g.strokeText('Mary Anning · 1824 · historia real', 1240, 665); g.fillStyle = '#fff'; g.fillText('Mary Anning · 1824 · historia real', 1240, 665); g.restore();
    sello('¿FRAUDE?', 960, 470, 74, '#d8432f', -7);
  }
};
window.listo = true;
