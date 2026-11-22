
const D = __DATA__; C.datos(D); const g = C.lienzo();
const V = C.H > C.W, W = C.W, HH = C.H, TAU = Math.PI * 2;
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

const PV = V ? 1500 : 700;
const LUG = {
  sala: C.lugar('interior', { hora: 'nublado', piso: PV, pared: '#c9b8a8', tapiz: 'puntos', suelo: 'madera' }),
  oficina: C.lugar('interior', { hora: 'dia', piso: PV, pared: '#b8a890', tapiz: 'rayas', suelo: 'madera' }),
  noche: C.lugar('campo', { hora: 'noche', piso: PV, pasto: '#3f5a44' }),
  tarde: C.lugar('interior', { hora: 'tarde', piso: PV, pared: '#b8a890', tapiz: 'rayas', suelo: 'madera' })
};
const texto = (lineas, y, tam, cols) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  lineas.forEach((l, i) => { g.font = `900 ${tam}px ${C.FUENTE}`; let k = Math.min(1, W * 0.92 / g.measureText(l).width); g.font = `900 ${tam * k}px ${C.FUENTE}`; g.lineWidth = tam * k * 0.2; g.strokeStyle = '#0e0c14'; g.strokeText(l, W / 2, y + i * tam * 1.12); g.fillStyle = cols[i] || '#fff'; g.fillText(l, W / 2, y + i * tam * 1.12); }); g.restore(); };
const sello = (txt, x, y, tam, col = '#d8432f', rot = -8) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.font = `900 ${tam}px ${C.FUENTE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width + tam * 0.7, h = tam * 1.35; g.fillStyle = 'rgba(255,248,235,0.92)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, tam * 0.18); g.fill(); g.lineWidth = tam * 0.1; g.strokeStyle = col; g.stroke(); g.fillStyle = col; g.fillText(txt, 0, tam * 0.04); g.restore(); };
const parte = n => { if (!V) return; g.save(); g.font = `900 64px ${C.FUENTE}`; const w = g.measureText('PARTE ' + n).width + 70; g.fillStyle = '#d8432f'; g.beginPath(); g.roundRect((W - w) / 2, 300, w, 92, 46); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PARTE ' + n, W / 2, 348); g.restore(); };
const bandas = () => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); let gr = g.createLinearGradient(0, HH * 0.55, 0, HH); gr.addColorStop(0, 'rgba(14,12,20,0)'); gr.addColorStop(1, 'rgba(14,12,20,0.88)'); g.fillStyle = gr; g.fillRect(0, HH * 0.55, W, HH * 0.45); gr = g.createLinearGradient(0, 0, 0, HH * 0.22); gr.addColorStop(0, 'rgba(14,12,20,0.6)'); gr.addColorStop(1, 'rgba(14,12,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, HH * 0.22); g.restore(); };
const rayo = (x0, y0, x1, y1) => { const pts = [[x0, y0]]; for (let i = 1; i < 9; i++) { const u = i / 9; pts.push([x0 + (x1 - x0) * u + (C.hash(i * 7.3) - 0.5) * 120, y0 + (y1 - y0) * u]); } pts.push([x1, y1]); g.save(); g.lineJoin = 'round'; g.lineCap = 'round'; for (const [w, c] of [[40, 'rgba(190,210,255,0.35)'], [16, '#e8f0ff'], [6, '#ffffff']]) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); } g.restore(); };
const cara = (id, x, y, k, cara, o = {}) => H.per(id).dibujar(g, { t: 1, x, y, escala: k, cara, giro: o.giro || 0, mira: o.mira || [0, 0], sinParpadeo: true, vivo: false, sombra: false, pelo: o.pelo, manoD: o.manoD, manoI: o.manoI });

window.renderAt = t => {
  g.limpiar(); const n = __N__;
  const L = n === 1 ? LUG.sala : n === 2 ? LUG.oficina : n === 3 ? LUG.noche : n === 4 ? LUG.tarde : LUG.oficina;
  L.dibujar(g, { t: 1, x: 0 });
  if (n === 1) { H.obj('sillon').dibujar(g, { x: V ? 800 : 1050, y: PV, t: 1, escala: V ? 1.5 : 0.9 }); H.obj('taza').dibujar(g, { x: V ? 980 : 1180, y: PV - 120, t: 1, escala: 1.2 }); }
  if (n === 3) { H.obj('carpa').dibujar(g, { x: V ? 780 : 1000, y: PV - 200, t: 1, escala: V ? 1.0 : 0.6, luz: 1 }); }
  L.frente(g, { t: 1 }); L.luz(g, { t: 1, x: 0, focos: n === 3 ? [{ x: 780, y: PV - 400, r: 900, fuerza: 1 }] : [] });
  if (n === 3) C.niebla(g, 1, { k: 0.6, y: PV - 300 });
  const caras = { 1: 'sorpresa', 2: 'triste', 3: 'miedo', 4: 'triste', 5: 'sorpresa' };
  if (V) {
    H.per('angela').dibujar(g, { t: 1, x: n === 2 ? 420 : 470, y: 1980, escala: 3.3, cara: caras[n], giro: 0.25, mira: [0.3, -0.1], sinParpadeo: true, vivo: false, sombra: false });
    if (n === 1) H.obj('testamento').dibujar(g, { x: 850, y: 1700, t: 1, escala: 1.8, rot: 8 });
    if (n === 2) { H.obj('original').dibujar(g, { x: 760, y: 1700, t: 1, escala: 1.5, rot: -6 }); H.obj('testamento').dibujar(g, { x: 920, y: 1720, t: 1, escala: 1.5, rot: 7 }); H.obj('lupa').dibujar(g, { x: 900, y: 1640, t: 1, escala: 1.6 }); }
    if (n === 4) H.obj('maquina').dibujar(g, { x: 820, y: 1760, t: 1, escala: 1.3, hoja: 0.6 });
    bandas(); parte(n);
    if (n === 1) texto(['MURIÓ SANA.', 'ESE MISMO DÍA'], 560, 116, ['#fff', '#ffd54a']), texto(['LLEGÓ UN TESTAMENTO NUEVO'], 1440, 62, ['#fff']);
    if (n === 2) texto(['"NO HACE FALTA', 'AUTOPSIA"'], 560, 116, ['#fff', '#ffd54a']), texto(['SU HIJA NO LE CREYÓ'], 1440, 84, ['#fff']);
    if (n === 3) texto(['PARA SABER', 'DE QUÉ MURIÓ'], 560, 116, ['#fff', '#ffd54a']), texto(['TUVIERON QUE ABRIR SU TUMBA'], 1440, 60, ['#fff']);
    if (n === 4) texto(['VIO LO QUE', 'EL MÉDICO NO ESPERABA'], 560, 100, ['#fff', '#ffd54a']), texto(['EN UN PAPEL MAL ESCRITO'], 1440, 70, ['#fff']);
    texto(['KATHLEEN GRUNDY · HISTORIA REAL'], 1760, 40, ['#ffe7a8']);
  } else {
    H.per('angela').dibujar(g, { t: 1, x: 330, y: 1180, escala: 2.6, cara: 'sorpresa', giro: 0.3, mira: [0.4, -0.1], sinParpadeo: true, vivo: false, sombra: false });
    H.obj('testamento').dibujar(g, { x: 960, y: 680, t: 1, escala: 1.9, rot: 6 });
    g.save(); let gr = g.createLinearGradient(520, 0, 1280, 0); gr.addColorStop(0, 'rgba(14,12,30,0)'); gr.addColorStop(0.35, 'rgba(14,12,30,0.55)'); gr.addColorStop(1, 'rgba(14,12,30,0.7)'); g.fillStyle = gr; g.fillRect(520, 0, 760, 720); g.restore();
    g.save(); g.textAlign = 'right'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    for (const [txt, y, tam, col] of [['SU MAMÁ', 90, 92, '#ffffff'], ['ESTABA SANA', 192, 92, '#ffd54a']]) { g.font = `900 ${tam}px ${C.FUENTE}`; g.lineWidth = 20; g.strokeStyle = '#0e0c14'; g.strokeText(txt, 1240, y); g.fillStyle = col; g.fillText(txt, 1240, y); }
    g.font = `700 34px ${C.FUENTE}`; g.lineWidth = 8; g.strokeText('Hyde · 1998 · historia real', 1240, 665); g.fillStyle = '#fff'; g.fillText('Hyde · 1998 · historia real', 1240, 665); g.restore();
    sello('¿Y ESTE TESTAMENTO?', 900, 330, 50, '#d8432f', -6);
  }
};
window.listo = true;
