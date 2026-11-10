(function () {
const C = {};
const F = window.FORMATO || {};
C.W = F.ancho || 1920; C.H = F.alto || 1080; C.FPS = F.fps || 24;
C.LINEA = '#1d1b22';
C.LW = 5;
C.SUELO = 880;

C.clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
C.lerp = (a, b, u) => a + (b - a) * u;
C.suave = u => { u = C.clamp(u); return u * u * (3 - 2 * u); };
C.salida = u => 1 - Math.pow(1 - C.clamp(u), 3);
C.rebote = u => { u = C.clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
C.ventana = (t, t0, t1, d = 0.35) => C.salida((t - t0) / d) * (1 - C.salida((t - t1) / d));
C.rng = s => { let x = (s * 9301 + 49297) % 233280 || 1; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; };
const R = Math.PI / 180;

C.lienzo = (id = 'cv') => {
  const css = document.createElement('style');
  css.textContent = `html,body{margin:0;width:${C.W}px;height:${C.H}px;overflow:hidden;background:#000}`;
  document.head.appendChild(css);
  const c = document.createElement('canvas'); c.width = C.W; c.height = C.H; c.id = id;
  document.body.appendChild(c);
  const g = c.getContext('2d');
  g.limpiar = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, C.W, C.H); };
  return g;
};

C.datos = D => { C.D = D; C.RMS = D.rms || []; C.FPS = (D.formato || {}).fps || C.FPS; };
C.rms = t => { const i = Math.floor(t * C.FPS); return C.RMS[i] || 0; };

C.camara = (g, cam, prof = 1) => {
  const z = 1 + ((cam.zoom ?? 1) - 1) * prof;
  const tb = cam.temblor || 0;
  const sx = tb ? Math.sin((cam.t || 0) * 71) * tb * 12 : 0;
  const sy = tb ? Math.cos((cam.t || 0) * 53) * tb * 9 : 0;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(C.W / 2 + sx, C.H / 2 + sy);
  g.scale(z, z);
  g.rotate((cam.rot || 0) * R);
  g.translate(-C.W / 2 - (cam.x || 0) * prof, -C.H / 2 - (cam.y || 0) * prof);
};
C.camLerp = (a, b, u) => ({ x: C.lerp(a.x || 0, b.x || 0, u), y: C.lerp(a.y || 0, b.y || 0, u), zoom: C.lerp(a.zoom ?? 1, b.zoom ?? 1, u), rot: C.lerp(a.rot || 0, b.rot || 0, u), temblor: C.lerp(a.temblor || 0, b.temblor || 0, u) });
C.encuadre = (x, y, zoom) => ({ x: x - C.W / 2, y: y - C.H / 2, zoom });

const trazo = (g, col, lw = C.LW) => { g.lineWidth = lw; g.strokeStyle = C.LINEA; g.fillStyle = col; g.fill(); g.stroke(); };
const segmento = (g, a, b, ancho, col) => {
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]);
  g.strokeStyle = C.LINEA; g.lineWidth = ancho + C.LW * 2; g.stroke();
  g.strokeStyle = col; g.lineWidth = ancho; g.stroke();
};
const punta = (p, ang, L) => [p[0] + Math.sin(ang * R) * L, p[1] + Math.cos(ang * R) * L];
const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };

C.POSES = {
  parado: { torso: 0, cabeza: 0, bd: [6, 12], bi: [-5, 10], pd: [3, 0], pi: [-3, 0] },
  senalar: { torso: -3, cabeza: -4, bd: [95, 5], bi: [-5, 12], pd: [4, 0], pi: [-4, 0] },
  brazos_cruzados: { torso: -2, cabeza: 0, bd: [25, 115], bi: [18, 120], pd: [6, 0], pi: [-6, 0] },
  manos_cabeza: { torso: 3, cabeza: 6, bd: [150, 115], bi: [145, 120], pd: [4, 0], pi: [-4, 0] },
  encogido: { torso: 14, cabeza: 18, bd: [12, 70], bi: [4, 75], pd: [10, -18], pi: [-2, -14] },
  mirar_reloj: { torso: 2, cabeza: 22, bd: [40, 100], bi: [-5, 10], pd: [3, 0], pi: [-3, 0] },
  sentado: { torso: -4, cabeza: 0, bd: [35, 40], bi: [30, 45], pd: [85, -85], pi: [80, -80] },
  agachado: { torso: 35, cabeza: 10, bd: [40, 20], bi: [30, 25], pd: [70, -110], pi: [40, -95] },
  saludar: { torso: 0, cabeza: -3, bd: [212, 28], bi: [-5, 10], pd: [3, 0], pi: [-3, 0] }
};
C.ciclo = (tipo, fase) => {
  const w = fase * 2 * Math.PI, s = Math.sin(w);
  if (tipo === 'correr') return {
    torso: 14, cabeza: -6, bd: [-45 * s, 85], bi: [45 * s, 85],
    pd: [40 * s, -C.clamp(70 * Math.sin(w + 1.9), 5, 90)], pi: [-40 * s, -C.clamp(70 * Math.sin(w + 1.9 + Math.PI), 5, 90)], rebote: Math.abs(Math.cos(w)) * 14
  };
  return {
    torso: 3, cabeza: 0, bd: [-22 * s, 18], bi: [22 * s, 18],
    pd: [24 * s, -C.clamp(38 * Math.sin(w + 1.6), 0, 45)], pi: [-24 * s, -C.clamp(38 * Math.sin(w + 1.6 + Math.PI), 0, 45)], rebote: Math.abs(Math.cos(w)) * 5
  };
};
C.mezclarPose = (a, b, k) => {
  const o = {};
  for (const n of ['torso', 'cabeza', 'rebote']) o[n] = C.lerp(a[n] || 0, b[n] || 0, k);
  for (const n of ['bd', 'bi', 'pd', 'pi']) o[n] = [C.lerp(a[n][0], b[n][0], k), C.lerp(a[n][1], b[n][1], k)];
  return o;
};

C.CARAS = {
  neutral: { ceja: 0, cejaY: 0, parp: 0.12, sonrisa: 0.15, boca: 0, ojo: 1, pupX: 0, pupY: 0 },
  feliz: { ceja: -4, cejaY: 5, parp: 0.25, sonrisa: 0.95, boca: 0.3, ojo: 1, pupX: 0, pupY: 0 },
  triste: { ceja: 20, cejaY: 2, parp: 0.38, sonrisa: -0.65, boca: 0, ojo: 1, pupX: 0, pupY: 0.35 },
  miedo: { ceja: 22, cejaY: 12, parp: 0, sonrisa: -0.45, boca: 0.45, ojo: 1.18, pupX: 0, pupY: 0 },
  enojo: { ceja: -24, cejaY: -5, parp: 0.32, sonrisa: -0.55, boca: 0.1, ojo: 1, pupX: 0, pupY: 0 },
  sorpresa: { ceja: 0, cejaY: 15, parp: 0, sonrisa: 0, boca: 0.75, ojo: 1.22, pupX: 0, pupY: 0 },
  duda: { ceja: 12, cejaY: 7, parp: 0.2, sonrisa: -0.15, boca: 0, ojo: 1, pupX: 0.5, pupY: -0.5 },
  cansado: { ceja: 8, cejaY: -2, parp: 0.62, sonrisa: -0.2, boca: 0, ojo: 1, pupX: 0, pupY: 0.2 },
  asco: { ceja: -12, cejaY: 0, parp: 0.45, sonrisa: -0.75, boca: 0.15, ojo: 0.95, pupX: 0, pupY: 0 },
  orgullo: { ceja: -6, cejaY: 3, parp: 0.48, sonrisa: 0.65, boca: 0, ojo: 1, pupX: 0, pupY: 0 }
};
C.mezclarCara = (a, b, k) => { const o = {}; for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) o[n] = C.lerp(a[n] ?? 0, b[n] ?? a[n] ?? 0, k); return o; };
const cara = c => typeof c === 'string' ? C.CARAS[c] : { ...C.CARAS.neutral, ...c };

const parpadeo = (t, s) => {
  const per = 2.6 + (s % 7) * 0.45, ph = (t + s * 0.73) % per;
  return ph < 0.14 ? Math.sin(ph / 0.14 * Math.PI) : 0;
};

C.personaje = rec => {
  const cu = rec.cuerpo || {};
  const comp = { delgado: [56, 19], medio: [70, 23], robusto: [92, 27] }[cu.complexion || 'medio'];
  const nino = cu.edad === 'nino', mayor = cu.edad === 'mayor';
  const esc = (cu.estatura || 1) * (nino ? 0.68 : 1);
  const base0 = nino ? 88 : 76;
  const L = { muslo: 92, pierna: 92, torso: 150 * (cu.torso || 1), brazo: 76, ante: 74, cabeza: base0 * (cu.cabeza || 1) };
  const ojosK = cu.ojos || 1;
  const piel = rec.piel || '#f1d3b6';
  const ropa = rec.ropa || {};
  const arriba = ropa.arriba || { tipo: 'playera', color: '#4a7bd0' };
  const abajo = ropa.abajo || { tipo: 'pantalon', color: '#2d3142' };
  const pies = ropa.pies || { tipo: 'tenis', color: '#f2f2f2' };
  const pelo = rec.pelo || { estilo: 'corto', color: '#2b211b' };
  const acc = new Set((rec.accesorios || []).map(a => a.tipo));
  const accCol = Object.fromEntries((rec.accesorios || []).map(a => [a.tipo, a.color || '#555']));
  const semilla = rec.semilla ?? [...(rec.id || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0);
  const mangaLarga = ['sudadera', 'camisa', 'bata', 'saco', 'chamarra'].includes(arriba.tipo);

  const pie = (g, p, ang, lado) => {
    g.save(); g.translate(p[0], p[1]); g.rotate(-ang * R * 0.3);
    if (pies.descalzo === lado || pies.descalzo === 'ambos') { g.beginPath(); g.ellipse(7, 1, 17, 9, 0, 0, Math.PI * 2); trazo(g, piel); g.restore(); return; }
    g.beginPath(); g.ellipse(9, 2, 22, 11, 0, 0, Math.PI * 2); trazo(g, pies.color);
    if (pies.acento) { g.beginPath(); g.ellipse(9, 8, 20, 4, 0, 0, Math.PI * 2); g.fillStyle = pies.acento; g.fill(); }
    g.restore();
  };
  const pierna = (g, cad, ang, lado) => {
    const rod = punta(cad, ang[0], L.muslo), tob = punta(rod, ang[0] + ang[1], L.pierna);
    const cMuslo = abajo.tipo === 'falda' ? piel : abajo.color;
    const cPierna = ['short', 'falda'].includes(abajo.tipo) ? piel : abajo.color;
    segmento(g, cad, rod, comp[1] + 4, cMuslo);
    segmento(g, rod, tob, comp[1] + 2, cPierna);
    pie(g, tob, ang[0] + ang[1], lado);
  };
  const brazo = (g, hom, ang) => {
    const codo = punta(hom, ang[0], L.brazo), mano = punta(codo, ang[0] + ang[1], L.ante);
    segmento(g, hom, codo, comp[1], arriba.color);
    segmento(g, codo, mano, comp[1] - 2, mangaLarga ? arriba.color : piel);
    g.beginPath(); g.arc(mano[0], mano[1], comp[1] * 0.62, 0, Math.PI * 2); trazo(g, piel);
  };
  const torso = (g, cad, ang, resp) => {
    g.save(); g.translate(cad[0], cad[1]); g.rotate(-ang * R);
    const h = L.torso * resp, wa = comp[0], wb = comp[0] * 0.92;
    if (acc.has('mochila')) { rrect(g, -wa / 2 - 26, -h * 0.92, 34, h * 0.6, 10); trazo(g, accCol.mochila); }
    const largo = ['bata', 'vestido'].includes(arriba.tipo) ? 70 : 6;
    g.beginPath();
    g.moveTo(-wa / 2, -h + 14); g.quadraticCurveTo(-wa / 2, -h, -wa / 2 + 14, -h);
    g.lineTo(wa / 2 - 14, -h); g.quadraticCurveTo(wa / 2, -h, wa / 2, -h + 14);
    g.lineTo(wb / 2 + (largo > 10 ? 14 : 0), largo); g.lineTo(-wb / 2 - (largo > 10 ? 14 : 0), largo); g.closePath();
    trazo(g, arriba.color);
    g.strokeStyle = C.LINEA; g.lineWidth = 3;
    if (arriba.tipo === 'sudadera') { g.beginPath(); g.moveTo(-wa * 0.3, -h + 4); g.quadraticCurveTo(0, -h + 26, wa * 0.3, -h + 4); g.stroke(); rrect(g, -wb * 0.3, -h * 0.35, wb * 0.6, h * 0.18, 6); g.stroke(); }
    if (arriba.tipo === 'camisa' || arriba.tipo === 'bata' || arriba.tipo === 'saco') { g.beginPath(); g.moveTo(-12, -h); g.lineTo(0, -h + 18); g.lineTo(12, -h); g.moveTo(0, -h + 18); g.lineTo(0, largo); g.stroke(); }
    if (acc.has('delantal')) { rrect(g, -wb * 0.42, -h * 0.62, wb * 0.84, h * 0.62 + 36, 6); trazo(g, accCol.delantal, 3); }
    if (acc.has('gafete')) { rrect(g, wa * 0.08, -h * 0.72, 18, 24, 3); trazo(g, '#fff', 3); }
    if (abajo.tipo === 'falda') { g.beginPath(); g.moveTo(-wb / 2, -4); g.lineTo(wb / 2, -4); g.lineTo(wb / 2 + 16, 46); g.lineTo(-wb / 2 - 16, 46); g.closePath(); trazo(g, abajo.color); }
    g.restore();
    return punta(cad, 180 + ang, h - 10);
  };
  const peloAtras = (g, r) => {
    g.fillStyle = pelo.color;
    if (pelo.estilo === 'largo') { g.beginPath(); g.ellipse(-r * 0.25, r * 0.55, r * 1.02, r * 1.25, 0, 0, Math.PI * 2); trazo(g, pelo.color); }
    if (pelo.estilo === 'coleta') { g.beginPath(); g.ellipse(-r * 1.05, r * 0.2, r * 0.35, r * 0.6, 0.4, 0, Math.PI * 2); trazo(g, pelo.color); }
    if (pelo.estilo === 'afro' || pelo.estilo === 'rizado') {
      const n = pelo.estilo === 'afro' ? 11 : 9, rr = pelo.estilo === 'afro' ? r * 1.32 : r * 1.08;
      g.beginPath(); for (let i = 0; i < n; i++) { const a = Math.PI * (0.95 + 1.1 * i / (n - 1)); g.moveTo(Math.cos(a) * rr * 0.82 + r * 0.32, Math.sin(a) * rr * 0.82 - r * 0.05); g.arc(Math.cos(a) * rr * 0.82, Math.sin(a) * rr * 0.82 - r * 0.05, r * 0.32, 0, Math.PI * 2); }
      trazo(g, pelo.color);
    }
  };
  const peloFrente = (g, r) => {
    const e = pelo.estilo;
    if (e === 'calvo' || e === 'afro' || e === 'rizado') return;
    g.beginPath();
    g.arc(0, 0, r * 1.02, Math.PI * 1.02, Math.PI * 1.98);
    if (e === 'fleco') { g.lineTo(r * 0.95, -r * 0.05); g.quadraticCurveTo(r * 0.5, -r * 0.5, r * 0.15, -r * 0.2); g.quadraticCurveTo(-r * 0.4, -r * 0.55, -r * 1.02, -r * 0.05); }
    else if (e === 'rapado') { g.quadraticCurveTo(0, -r * 0.62, -r * 1.02, -r * 0.05); }
    else { g.lineTo(r * 0.9, -r * 0.35); g.quadraticCurveTo(r * 0.2, -r * 0.6, -r * 0.6, -r * 0.42); g.lineTo(-r * 1.02, -r * 0.05); }
    g.closePath(); trazo(g, e === 'rapado' ? pelo.color + 'aa' : pelo.color);
    if (mayor) { g.strokeStyle = '#ddd'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r * 0.9, Math.PI * 1.15, Math.PI * 1.45); g.stroke(); }
  };
  const ojo = (g, x, y, c, cierre, s) => {
    const rx = 13.5 * c.ojo * s, ry = 17 * c.ojo * s;
    g.save();
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    g.clip();
    g.beginPath(); g.arc(x + c.pupX * 4 + 2, y + c.pupY * 5 + 1, 8 * s, 0, Math.PI * 2); g.fillStyle = C.LINEA; g.fill();
    g.beginPath(); g.arc(x + c.pupX * 4 + 4, y + c.pupY * 5 - 2, 2 * s, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    const p = C.clamp(Math.max(c.parp, cierre));
    if (p > 0.01) { g.fillStyle = piel; g.fillRect(x - rx - 2, y - ry - 2, rx * 2 + 4, (ry * 2 + 2) * p); }
    g.restore();
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.strokeStyle = C.LINEA; g.lineWidth = 3.5; g.stroke();
    if (p > 0.05) { g.beginPath(); g.moveTo(x - rx, y - ry + (ry * 2) * p); g.lineTo(x + rx, y - ry + (ry * 2) * p); g.stroke(); }
  };
  const cabeza = (g, cen, ang, c, t, habla) => {
    const r = base0, kc = L.cabeza / base0, lw0 = C.LW;
    g.save(); g.translate(cen[0], cen[1]); g.rotate(-ang * R); g.scale(kc, kc); C.LW = lw0 / kc;
    peloAtras(g, r);
    g.beginPath(); g.ellipse(0, 0, r, r * 1.04, 0, 0, Math.PI * 2); trazo(g, piel);
    g.beginPath(); g.ellipse(-r * 0.62, r * 0.08, 9, 13, 0, 0, Math.PI * 2); trazo(g, piel, 3.5);
    if (acc.has('barba')) { g.beginPath(); g.arc(0, r * 0.1, r * 0.98, Math.PI * 0.08, Math.PI * 0.92); g.quadraticCurveTo(0, r * 0.75, r * 0.98, r * 0.25); g.closePath(); trazo(g, pelo.color); }
    const cierre = parpadeo(t, semilla);
    ojo(g, r * 0.12, -r * 0.08, c, cierre, ojosK);
    ojo(g, r * 0.56, -r * 0.08, c, cierre, 0.92 * ojosK);
    g.strokeStyle = C.LINEA; g.lineWidth = 5; g.lineCap = 'round';
    const cy = -r * 0.42 - c.cejaY;
    for (const [x, s] of [[r * 0.12, 1], [r * 0.56, -1]]) {
      g.beginPath(); g.moveTo(x - 16, cy + Math.sin(c.ceja * R) * 16 * s); g.lineTo(x + 16, cy - Math.sin(c.ceja * R) * 16 * s); g.stroke();
    }
    g.beginPath(); g.arc(r * 0.42, r * 0.2, 4, 0, Math.PI * 2); g.fillStyle = C.LINEA; g.fill();
    const ab = C.clamp(c.boca + habla * 0.75);
    const bx = r * 0.36, by = r * 0.5, bw = 27 + ab * 8, curva = c.sonrisa * 14;
    if (ab < 0.06) { g.beginPath(); g.moveTo(bx - bw / 2, by - curva * 0.4); g.quadraticCurveTo(bx, by + curva, bx + bw / 2, by - curva * 0.4); g.lineWidth = 4.5; g.stroke(); }
    else {
      const h = 7 + ab * 32;
      g.beginPath(); g.moveTo(bx - bw / 2, by - curva * 0.4);
      g.quadraticCurveTo(bx, by + curva * 0.6 - h * 0.15, bx + bw / 2, by - curva * 0.4);
      g.quadraticCurveTo(bx + bw * 0.3, by + h + curva * 0.3, bx, by + h + curva * 0.3);
      g.quadraticCurveTo(bx - bw * 0.3, by + h + curva * 0.3, bx - bw / 2, by - curva * 0.4);
      g.closePath(); g.fillStyle = '#5a1f24'; g.fill(); g.lineWidth = 4; g.stroke();
      if (h > 16) { g.save(); g.clip(); g.beginPath(); g.ellipse(bx, by + h + curva * 0.3, bw * 0.3, h * 0.35, 0, 0, Math.PI * 2); g.fillStyle = '#d96b72'; g.fill(); g.restore(); }
    }
    peloFrente(g, r);
    if (acc.has('gorro')) {
      g.beginPath(); g.arc(0, -r * 0.05, r * 1.06, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); trazo(g, accCol.gorro);
      rrect(g, -r * 1.1, -r * 0.42, r * 2.2, r * 0.3, 10); trazo(g, accCol.gorro);
    }
    if (acc.has('gorra')) {
      g.beginPath(); g.arc(0, -r * 0.2, r * 1.0, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); trazo(g, accCol.gorra);
      g.beginPath(); g.ellipse(r * 0.95, -r * 0.3, r * 0.6, r * 0.12, 0.05, 0, Math.PI * 2); trazo(g, accCol.gorra);
    }
    if (acc.has('lentes')) {
      g.strokeStyle = C.LINEA; g.lineWidth = 4;
      for (const x of [r * 0.12, r * 0.56]) { g.beginPath(); g.arc(x, -r * 0.08, 17, 0, Math.PI * 2); g.stroke(); }
      g.beginPath(); g.moveTo(r * 0.12 + 17, -r * 0.08); g.lineTo(r * 0.56 - 17, -r * 0.08); g.stroke();
    }
    if (acc.has('audifonos')) { g.beginPath(); g.arc(0, -r * 0.05, r * 1.08, Math.PI * 1.1, Math.PI * 1.9); g.lineWidth = 8; g.strokeStyle = accCol.audifonos; g.stroke(); rrect(g, -r * 0.8, -r * 0.05, 22, 36, 8); trazo(g, accCol.audifonos); }
    if (c.sucio) { g.save(); g.globalAlpha = c.sucio; g.fillStyle = '#6b4a2f'; for (const [x, y, rr] of [[-r * 0.35, r * 0.5, 6], [r * 0.78, r * 0.3, 4], [-r * 0.2, -r * 0.62, 5]]) { g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill(); } g.restore(); }
    C.LW = lw0;
    g.restore();
  };

  return {
    rec,
    alto: () => (L.muslo + L.pierna + L.torso + L.cabeza * 2) * esc,
    esc,
    caderaY: pose => { const p = typeof pose === 'string' ? C.POSES[pose] : pose; return (Math.max(L.muslo * Math.cos(p.pd[0] * R) + L.pierna * Math.cos((p.pd[0] + p.pd[1]) * R), L.muslo * Math.cos(p.pi[0] * R) + L.pierna * Math.cos((p.pi[0] + p.pi[1]) * R)) + 8) * esc; },
    dibujar(g, e) {
      const t = e.t || 0;
      let p = e.pose && typeof e.pose === 'object' ? e.pose : C.POSES[e.pose || 'parado'];
      if (e.ciclo) p = C.ciclo(e.ciclo, e.fase || 0);
      if (e.poseB) p = C.mezclarPose(p, typeof e.poseB === 'string' ? C.POSES[e.poseB] : e.poseB, e.k || 0);
      let c = cara(e.cara || 'neutral');
      if (e.caraB) c = C.mezclarCara(c, cara(e.caraB), e.k2 ?? e.k ?? 0);
      const resp = 1 + Math.sin(t * 2 * Math.PI / 3.6 + semilla) * 0.012;
      const habla = e.habla ? C.rms(t) : 0;
      const enc = mayor ? 8 : 0;
      const hY = Math.max(
        L.muslo * Math.cos(p.pd[0] * R) + L.pierna * Math.cos((p.pd[0] + p.pd[1]) * R),
        L.muslo * Math.cos(p.pi[0] * R) + L.pierna * Math.cos((p.pi[0] + p.pi[1]) * R)) + 8;
      g.save();
      g.translate(e.x, e.y ?? C.SUELO);
      if (e.sombra !== false) { g.save(); g.scale(1, 0.22); g.beginPath(); g.ellipse(0, 0, 70 * esc, 70 * esc, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(20,15,30,0.18)'; g.fill(); g.restore(); }
      g.scale((e.mira ?? 1) * esc * (e.escala ?? 1), esc * (e.escala ?? 1));
      const cad = [0, -hY + (p.rebote || 0)];
      const tor = p.torso + enc;
      const hom = punta(cad, 180 + tor, L.torso * resp - 18);
      const homB = [hom[0] - comp[0] * 0.18, hom[1] + 4];
      brazo(g, homB, p.bi);
      pierna(g, [cad[0] - 8, cad[1]], p.pi, 'i');
      pierna(g, [cad[0] + 8, cad[1]], p.pd, 'd');
      const cuello = torso(g, cad, tor, resp);
      const cc = punta(cuello, 180 + tor + p.cabeza * 0.5, L.cabeza * 0.95 + 6);
      cabeza(g, cc, tor + p.cabeza, c, t, habla);
      brazo(g, [hom[0] + comp[0] * 0.12, hom[1] + 4], p.bd);
      g.restore();
    }
  };
};

C.TINTES = { manana: 'rgba(255,236,200,0.08)', tarde: null, atardecer: 'rgba(255,120,60,0.16)', noche: 'rgba(25,35,90,0.38)', interior: 'rgba(255,245,220,0.05)' };
C.tinte = (g, hora, k = 1) => {
  const c = C.TINTES[hora]; if (!c) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = k; g.fillStyle = c; g.fillRect(0, 0, C.W, C.H); g.restore();
};

const M = {};
M.cielo = (g, o, ctx) => {
  const cols = { dia: ['#8ec9f0', '#e7f4fb'], manana: ['#9fd3f2', '#fdf1d8'], atardecer: ['#5b4c8f', '#f6a26b'], noche: ['#0e1430', '#2b3466'], nublado: ['#a9b6c2', '#dfe4e8'] }[o.tipo || 'dia'];
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const gr = g.createLinearGradient(0, 0, 0, C.H); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]);
  g.fillStyle = gr; g.fillRect(0, 0, C.W, C.H);
  if (o.tipo === 'noche') { const r = C.rng(o.semilla || 3); g.fillStyle = '#fff'; for (let i = 0; i < 90; i++) { g.globalAlpha = 0.4 + r() * 0.6; g.fillRect(r() * C.W, r() * C.H * 0.6, 2, 2); } }
  g.restore();
};
M.sol = (g, o) => { g.beginPath(); g.arc(o.x, o.y, o.r || 60, 0, Math.PI * 2); g.fillStyle = o.color || '#ffe9a8'; g.fill(); };
M.nubes = (g, o, ctx) => {
  const r = C.rng(o.semilla || 5);
  for (let i = 0; i < (o.n || 5); i++) {
    const x = (r() * (C.W + 600) - 300 + ctx.t * (o.vel || 6)) % (C.W + 600) - 300, y = 80 + r() * 260, s = 0.6 + r() * 0.8;
    g.beginPath(); for (const [dx, dy, rr] of [[0, 0, 40], [45, -18, 50], [95, 0, 38], [50, 12, 42]]) { g.moveTo(x + dx * s + rr * s, y + dy * s); g.arc(x + dx * s, y + dy * s, rr * s, 0, Math.PI * 2); }
    g.fillStyle = o.color || 'rgba(255,255,255,0.85)'; g.fill();
  }
};
M.ciudad_lejana = (g, o) => {
  const r = C.rng(o.semilla || 7); let x = (o.x0 ?? -400);
  g.fillStyle = o.color || '#9aa8bf';
  while (x < (o.x1 ?? C.W + 400)) { const w = 60 + r() * 120, h = 120 + r() * 260; g.fillRect(x, (o.base || C.SUELO - 40) - h, w, h + 40); x += w + r() * 10; }
};
M.edificios = (g, o) => {
  const r = C.rng(o.semilla || 11); let x = o.x0 ?? -300;
  const pal = o.colores || ['#e8b07a', '#c97b63', '#8fb3a0', '#d9cfa8', '#9db0cf'];
  const base = o.base || C.SUELO - 60;
  while (x < (o.x1 ?? C.W + 300)) {
    const w = 180 + r() * 160, h = 260 + r() * 300, col = pal[Math.floor(r() * pal.length)];
    g.beginPath(); g.rect(x, base - h, w, h); trazo(g, col);
    g.beginPath(); g.rect(x - 8, base - h - 16, w + 16, 18); trazo(g, '#6d6a75');
    const nc = Math.max(2, Math.floor(w / 70)), nf = Math.floor((h - 90) / 80);
    for (let i = 0; i < nf; i++) for (let j = 0; j < nc; j++) {
      const wx = x + 22 + j * (w - 44) / nc, wy = base - h + 30 + i * 80;
      g.beginPath(); g.rect(wx, wy, (w - 44) / nc - 18, 46);
      trazo(g, (o.noche && r() > 0.45) ? '#ffe39a' : '#bfe0f0', 3.5);
    }
    x += w + 6;
  }
};
M.calle = (g, o) => {
  const y = o.y ?? C.SUELO - 60;
  g.fillStyle = o.banqueta || '#cfc8bd'; g.fillRect(-2000, y, C.W + 4000, 90);
  g.strokeStyle = C.LINEA; g.lineWidth = C.LW; g.beginPath(); g.moveTo(-2000, y); g.lineTo(C.W + 2000, y); g.stroke();
  g.fillStyle = o.asfalto || '#5d5f69'; g.fillRect(-2000, y + 90, C.W + 4000, C.H);
  g.beginPath(); g.moveTo(-2000, y + 90); g.lineTo(C.W + 2000, y + 90); g.stroke();
  g.fillStyle = '#f1e6a8'; for (let x = -2000; x < C.W + 2000; x += 160) g.fillRect(x, y + 165, 80, 10);
};
M.pared = (g, o) => {
  const x0 = o.x0 ?? -800, x1 = o.x1 ?? C.W + 800, y0 = o.y0 ?? -400, y1 = o.y1 ?? C.SUELO - 40;
  g.fillStyle = o.color || '#e9e1cf'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 2;
  if (o.tipo === 'azulejo') { for (let x = x0; x < x1; x += 60) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); } for (let y = y0; y < y1; y += 60) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); } }
  if (o.tipo === 'ladrillo') { let f = 0; for (let y = y0; y < y1; y += 40, f++) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); for (let x = x0 + (f % 2) * 50; x < x1; x += 100) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 40); g.stroke(); } } }
  if (o.zoclo !== false) { g.fillStyle = o.zocloColor || 'rgba(0,0,0,0.15)'; g.fillRect(x0, y1 - 26, x1 - x0, 26); }
};
M.piso = (g, o) => {
  const y = o.y ?? C.SUELO - 40;
  g.fillStyle = o.color || '#c9b49a'; g.fillRect(-2000, y, C.W + 4000, C.H);
  g.strokeStyle = C.LINEA; g.lineWidth = C.LW; g.beginPath(); g.moveTo(-2000, y); g.lineTo(C.W + 2000, y); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.13)'; g.lineWidth = 2;
  if (o.tipo === 'loseta') { for (let x = -2000; x < C.W + 2000; x += 140) { g.beginPath(); g.moveTo(x, y); g.lineTo(C.W / 2 + (x - C.W / 2) * 1.8, C.H + 200); g.stroke(); } for (const yy of [y + 50, y + 120, y + 220]) { g.beginPath(); g.moveTo(-2000, yy); g.lineTo(C.W + 2000, yy); g.stroke(); } }
  if (o.tipo === 'madera') { for (let yy = y + 30; yy < C.H + 200; yy += 34) { g.beginPath(); g.moveTo(-2000, yy); g.lineTo(C.W + 2000, yy); g.stroke(); } }
};
M.ventana = (g, o) => {
  g.beginPath(); g.rect(o.x, o.y, o.w || 220, o.h || 180); trazo(g, '#f4f1ea');
  g.beginPath(); g.rect(o.x + 12, o.y + 12, (o.w || 220) - 24, (o.h || 180) - 24); trazo(g, o.vista || '#b9def2', 3.5);
  g.strokeStyle = C.LINEA; g.lineWidth = 4; g.beginPath(); g.moveTo(o.x + (o.w || 220) / 2, o.y + 12); g.lineTo(o.x + (o.w || 220) / 2, o.y + (o.h || 180) - 12); g.stroke();
};
M.puerta = (g, o, ctx) => {
  const w = o.w || 170, h = o.h || 320, y = (o.base ?? C.SUELO - 40) - h;
  if (o.automatica) {
    const ab = C.clamp(o.abre ?? 0) * w * 0.48;
    g.beginPath(); g.rect(o.x - 10, y - 10, w + 20, h + 10); trazo(g, '#8b8f99');
    g.fillStyle = o.interior || '#e8e4d8'; g.fillRect(o.x, y, w, h);
    for (const [x, s] of [[o.x - ab, 1], [o.x + w / 2 + ab, -1]]) { g.beginPath(); g.rect(x, y, w / 2, h); g.fillStyle = 'rgba(190,225,240,0.72)'; g.fill(); g.strokeStyle = C.LINEA; g.lineWidth = 4; g.stroke(); }
    return;
  }
  g.beginPath(); g.rect(o.x, y, w, h); trazo(g, o.color || '#a26b44');
  g.beginPath(); g.arc(o.x + w - 24, y + h * 0.55, 8, 0, Math.PI * 2); trazo(g, '#e2c25b', 3);
};
M.estante = (g, o) => {
  const r = C.rng(o.semilla || 13), w = o.w || 360, h = o.h || 300, base = o.base ?? C.SUELO - 40, n = o.niveles || 4;
  const pal = o.colores || ['#e85d4a', '#f2b33d', '#4f9d69', '#3f7cc2', '#efe6d2', '#b05aa8'];
  g.beginPath(); g.rect(o.x, base - h, w, h); trazo(g, o.color || '#d7d3cb');
  for (let i = 0; i < n; i++) {
    const y = base - h + (i + 1) * h / n;
    g.beginPath(); g.rect(o.x, y - 8, w, 10); trazo(g, '#9c978e', 3);
    let x = o.x + 8;
    while (x < o.x + w - 30 && !(o.vacio && r() < o.vacio)) {
      const bw = 20 + r() * 26, bh = 30 + r() * (h / n - 50);
      g.beginPath(); g.rect(x, y - 8 - bh, bw, bh); trazo(g, pal[Math.floor(r() * pal.length)], 3);
      x += bw + 3;
    }
  }
};
M.mostrador = (g, o) => {
  const w = o.w || 520, h = o.h || 190, base = o.base ?? C.SUELO + 40;
  g.beginPath(); g.rect(o.x, base - h, w, h); trazo(g, o.color || '#c96f4a');
  g.beginPath(); g.rect(o.x - 16, base - h - 16, w + 32, 22); trazo(g, o.cubierta || '#efe7da');
};
M.letrero = (g, o) => {
  g.font = `800 ${o.tam || 64}px "Arial Black", Arial, sans-serif`;
  const w = g.measureText(o.texto).width + 60, h = (o.tam || 64) + 34;
  rrect(g, o.x - w / 2, o.y - h / 2, w, h, 12); trazo(g, o.fondo || '#f4f1ea');
  g.fillStyle = o.color || '#2d3142'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.texto, o.x, o.y + 3);
};
M.lampara = (g, o) => {
  g.strokeStyle = C.LINEA; g.lineWidth = 3; g.beginPath(); g.moveTo(o.x, -400); g.lineTo(o.x, o.y || 120); g.stroke();
  g.beginPath(); g.moveTo(o.x - 50, (o.y || 120) + 40); g.lineTo(o.x - 22, o.y || 120); g.lineTo(o.x + 22, o.y || 120); g.lineTo(o.x + 50, (o.y || 120) + 40); g.closePath(); trazo(g, o.color || '#3d4f5c');
};
M.arbol = (g, o) => {
  const s = o.escala || 1, b = o.base ?? C.SUELO - 40;
  g.beginPath(); g.rect(o.x - 16 * s, b - 170 * s, 32 * s, 170 * s); trazo(g, '#8a5a3b');
  g.beginPath(); for (const [dx, dy, r] of [[0, -250, 95], [-70, -200, 70], [70, -195, 75], [0, -330, 70]]) { g.moveTo(o.x + (dx + r) * s, b + dy * s); g.arc(o.x + dx * s, b + dy * s, r * s, 0, Math.PI * 2); }
  trazo(g, o.color || '#6ca86a');
};
M.colinas = (g, o) => {
  const base = o.base ?? C.SUELO - 40;
  g.beginPath(); g.moveTo(-2000, base);
  for (let x = -2000; x <= C.W + 2000; x += 40) g.lineTo(x, base - (o.alto || 120) * (0.5 + 0.5 * Math.sin(x / (o.ancho || 380) + (o.fase || 0))));
  g.lineTo(C.W + 2000, C.H + 400); g.lineTo(-2000, C.H + 400); g.closePath(); trazo(g, o.color || '#8fbf7a');
};
M.rect = (g, o) => { g.beginPath(); rrect(g, o.x, o.y, o.w, o.h, o.r || 4); trazo(g, o.color || '#ccc', o.lw ?? C.LW); };
C.MODULOS = M;

C.lugar = rec => {
  const prof = { cielo: 0, lejos: 0.25, fondo: 0.55, medio: 1, frente: 1.35 };
  const capa = (g, n, cam, t) => {
    const items = (rec.capas || {})[n]; if (!items) return;
    C.camara(g, { ...cam, t }, prof[n]);
    for (const it of items) { const f = M[it.mod]; if (!f) throw new Error('módulo desconocido: ' + it.mod); f(g, it, { t, cam }); }
  };
  return {
    rec,
    fondo(g, cam, t) { for (const n of ['cielo', 'lejos', 'fondo', 'medio']) capa(g, n, cam, t); C.tinte(g, rec.hora, 1); C.camara(g, { ...cam, t }, 1); },
    frente(g, cam, t) { capa(g, 'frente', cam, t); C.tinte(g, rec.hora, 0.45); g.setTransform(1, 0, 0, 1, 0, 0); }
  };
};

C.rotulo = (g, texto, a, o = {}) => {
  if (a <= 0.01) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = C.clamp(a);
  g.font = `900 ${o.tam || 92}px "Arial Black", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const y = o.y ?? C.H * 0.14, s = 0.85 + 0.15 * C.rebote(a);
  g.translate(C.W / 2, y); g.scale(s, s);
  g.lineWidth = 16; g.strokeStyle = C.LINEA; g.lineJoin = 'round'; g.strokeText(texto, 0, 0);
  g.fillStyle = o.color || '#ffffff'; g.fillText(texto, 0, 0);
  g.restore();
};
C.globo = (g, texto, x, y, a, o = {}) => {
  if (a <= 0.01) return;
  g.save(); g.globalAlpha = C.clamp(a);
  g.font = `700 ${o.tam || 40}px Arial, sans-serif`;
  const w = g.measureText(texto).width + 50, h = (o.tam || 40) + 40;
  if (o.pensamiento) { for (const [dx, dy, r] of [[-10, 40, 9], [-26, 68, 6]]) { g.beginPath(); g.arc(x + dx, y + h / 2 + dy - 30, r, 0, Math.PI * 2); trazo(g, '#fff', 4); } }
  rrect(g, x - w / 2, y - h / 2, w, h, h / 2); trazo(g, '#fff', 4);
  if (!o.pensamiento) { g.beginPath(); g.moveTo(x - 14, y + h / 2 - 3); g.lineTo(x - 30, y + h / 2 + 32); g.lineTo(x + 10, y + h / 2 - 3); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.LINEA; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 14, y + h / 2); g.lineTo(x - 30, y + h / 2 + 32); g.lineTo(x + 10, y + h / 2); g.stroke(); }
  g.fillStyle = C.LINEA; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, x, y + 2);
  g.restore();
};
C.fundido = (g, a, color = '#000') => { if (a <= 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = C.clamp(a); g.fillStyle = color; g.fillRect(0, 0, C.W, C.H); g.restore(); };
C.vineta = (g, k = 0.35) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const gr = g.createRadialGradient(C.W / 2, C.H / 2, C.H * 0.45, C.W / 2, C.H / 2, C.W * 0.75); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${k})`); g.fillStyle = gr; g.fillRect(0, 0, C.W, C.H); g.restore(); };
C.dividida = (g, a, dibujarIzq, dibujarDer) => {
  const x = C.W / 2;
  g.save(); g.beginPath(); g.rect(0, 0, x - 4, C.H); g.clip(); dibujarIzq(); g.restore();
  g.save(); g.beginPath(); g.rect(x + 4, 0, C.W, C.H); g.clip(); dibujarDer(); g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#fff'; g.fillRect(x - 6, 0, 12, C.H);
};


Object.assign(C.CARAS, {
  dormida: { ceja: 4, cejaY: -2, parp: 1, sonrisa: -0.1, boca: 0, ojo: 1, pupX: 0, pupY: 0 },
  dolor: { ceja: 24, cejaY: 6, parp: 0.5, sonrisa: -0.7, boca: 0.25, ojo: 1, pupX: 0, pupY: 0.2 },
  alivio: { ceja: 10, cejaY: 6, parp: 0.3, sonrisa: 0.45, boca: 0.1, ojo: 1, pupX: 0, pupY: -0.2 },
  tranquila: { ceja: 2, cejaY: 2, parp: 0.3, sonrisa: 0.35, boca: 0, ojo: 1, pupX: 0, pupY: 0 }
});
Object.assign(C.POSES, {
  acostado_asiento: { torso: -4, cabeza: -50, bd: [20, 30], bi: [12, 35], pd: [85, -85], pi: [80, -80] },
  sentado_suelo: { torso: 4, cabeza: 0, bd: [25, 30], bi: [15, 40], pd: [80, -60], pi: [75, -55] },
  sujetarse: { torso: 6, cabeza: 4, bd: [60, 60], bi: [55, 65], pd: [85, -85], pi: [80, -80] }
});

const blob = (g, x, y, r, n, rnd) => { g.moveTo(x + r, y); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = r * (0.55 + rnd() * 0.25); g.moveTo(x + Math.cos(a) * r * 0.55 + rr, y + Math.sin(a) * r * 0.55); g.arc(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, rr, 0, Math.PI * 2); } };

M.dosel = (g, o, ctx) => {
  const r = C.rng(o.semilla || 21), pal = o.colores || ['#1f4d2b', '#2a6b37', '#357d3f', '#4a9348', '#23592f'];
  const x0 = o.x0 ?? -900, x1 = o.x1 ?? C.W + 900, y0 = o.y0 ?? -700, y1 = o.y1 ?? C.H + 700;
  g.fillStyle = o.fondo || '#12301c'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  const cl = o.claro;
  if (cl) {
    g.beginPath(); g.ellipse(cl.x, cl.y, cl.r * 1.25, cl.r, 0, 0, Math.PI * 2); g.fillStyle = '#4a3a26'; g.fill();
    const rr = C.rng(77); g.strokeStyle = '#2e2216'; g.lineWidth = 6; g.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const a = rr() * 6.28, d = rr() * cl.r * 0.9; const x = cl.x + Math.cos(a) * d, y = cl.y + Math.sin(a) * d * 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rr() - 0.5) * 60, y + (rr() - 0.5) * 40); g.stroke(); }
    if (o.dibujarClaro) o.dibujarClaro(g, ctx);
  }
  const paso = o.paso || 105;
  for (let y = y0; y < y1; y += paso * 0.8) for (let x = x0 + ((y / paso) % 2) * paso * 0.5; x < x1; x += paso) {
    const cx = x + (r() - 0.5) * paso * 0.7, cy = y + (r() - 0.5) * paso * 0.6, rad = paso * (0.55 + r() * 0.5);
    const col = pal[Math.floor(r() * pal.length)], s = r();
    if (cl && Math.hypot((cx - cl.x) / 1.25, cy - cl.y) < cl.r + rad * 0.35) continue;
    const mov = Math.sin(ctx.t * 0.9 + s * 9) * 2.5;
    g.beginPath(); blob(g, cx + 6, cy + 10, rad, 6, r); g.fillStyle = 'rgba(5,20,10,0.45)'; g.fill();
    g.beginPath(); blob(g, cx + mov, cy, rad, 6, r); g.fillStyle = col; g.fill(); g.lineWidth = 3; g.strokeStyle = 'rgba(10,30,15,0.55)'; g.stroke();
    g.beginPath(); g.arc(cx - rad * 0.25 + mov, cy - rad * 0.25, rad * 0.38, 0, Math.PI * 2); g.fillStyle = 'rgba(190,230,140,0.18)'; g.fill();
  }
};

M.selva_lejos = (g, o, ctx) => {
  const r = C.rng(o.semilla || 31), base = o.base ?? C.SUELO - 60, alto = o.alto || 420;
  g.fillStyle = o.color || '#5f8f78';
  g.beginPath();
  for (let x = o.x0 ?? -1200; x < (o.x1 ?? C.W + 1200); x += 70 + r() * 60) { const rad = 70 + r() * 90, y = base - alto * (0.55 + r() * 0.45); blob(g, x, y, rad, 5, r); g.rect(x - 6, y, 12, base - y + 40); }
  g.rect(o.x0 ?? -1200, base - alto * 0.5, (o.x1 ?? C.W + 1200) - (o.x0 ?? -1200), alto + 600);
  g.fill();
};

M.selva_troncos = (g, o, ctx) => {
  const r = C.rng(o.semilla || 41), base = o.base ?? C.SUELO;
  const pal = o.colores || ['#4b3527', '#5a4030', '#3f2d22'];
  let x = o.x0 ?? -900;
  while (x < (o.x1 ?? C.W + 900)) {
    const w = (o.ancho || 60) * (0.6 + r() * 0.9), col = pal[Math.floor(r() * pal.length)], lean = (r() - 0.5) * 40;
    g.beginPath(); g.moveTo(x - w * 0.9, base + 10); g.quadraticCurveTo(x - w * 0.5, base - 60, x - w / 2 + lean * 0.1, base - 160);
    g.lineTo(x - w / 2 + lean, -900); g.lineTo(x + w / 2 + lean, -900); g.lineTo(x + w / 2 + lean * 0.1, base - 160);
    g.quadraticCurveTo(x + w * 0.5, base - 60, x + w * 0.95, base + 10); g.closePath(); trazo(g, col);
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - w * 0.15 + lean * 0.3, base - 40); g.lineTo(x - w * 0.1 + lean * 0.8, base - 600); g.stroke();
    if (r() < (o.lianas ?? 0.5)) { const lx = x + w / 2 + lean * 0.5, ly = base - 650 - r() * 200; g.strokeStyle = '#2f4a22'; g.lineWidth = 6; g.beginPath(); g.moveTo(lx, -900); g.quadraticCurveTo(lx + 80 + Math.sin(ctx.t * 0.8 + x) * 8, ly + 200, lx + 140, ly + 380 + r() * 200); g.stroke(); }
    x += (o.sep || 260) * (0.6 + r() * 0.9);
  }
};

M.suelo_selva = (g, o) => {
  const r = C.rng(o.semilla || 51), y = o.y ?? C.SUELO - 20;
  g.beginPath(); g.moveTo(-2000, y);
  for (let x = -2000; x <= C.W + 2000; x += 60) g.lineTo(x, y + Math.sin(x / 170) * 10 + Math.sin(x / 47) * 4);
  g.lineTo(C.W + 2000, C.H + 600); g.lineTo(-2000, C.H + 600); g.closePath(); trazo(g, o.color || '#4a3826');
  g.fillStyle = 'rgba(30,20,10,0.35)'; g.fillRect(-2000, y + 70, C.W + 4000, C.H);
  const hojas = ['#6b7d2f', '#8a7a35', '#5a6b2a', '#7d5a2c'];
  for (let i = 0; i < (o.n || 140); i++) { const x = -600 + r() * (C.W + 1200), yy = y + 8 + r() * 260; g.save(); g.translate(x, yy); g.rotate(r() * 6.28); g.beginPath(); g.ellipse(0, 0, 14 + r() * 10, 5 + r() * 3, 0, 0, Math.PI * 2); g.fillStyle = hojas[Math.floor(r() * 4)]; g.fill(); g.restore(); }
  for (let i = 0; i < (o.charcos || 3); i++) { const x = r() * C.W, yy = y + 60 + r() * 150; g.beginPath(); g.ellipse(x, yy, 90 + r() * 80, 14 + r() * 8, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(140,170,170,0.35)'; g.fill(); }
};

M.helecho = (g, o, ctx) => {
  const s = o.escala || 1, b = o.base ?? C.SUELO, n = o.n || 7, col = o.color || '#3f7a3a';
  const mov = Math.sin((ctx.t || 0) * 1.3 + o.x) * 3;
  for (let i = 0; i < n; i++) {
    const a = (-70 + i * 140 / (n - 1)) * R, L = (150 + (i % 2) * 40) * s;
    const ex = o.x + Math.sin(a) * L + mov, ey = b - Math.cos(a) * L * 0.9;
    g.strokeStyle = C.LINEA; g.lineWidth = 3; g.beginPath(); g.moveTo(o.x, b); g.quadraticCurveTo(o.x + Math.sin(a) * L * 0.4, b - L * 0.75, ex, ey); g.stroke();
    for (let k = 1; k < 8; k++) { const u = k / 8, px = C.lerp(o.x, ex, u), py = C.lerp(b, ey, u) - Math.sin(u * Math.PI) * L * 0.15; for (const sg of [-1, 1]) { g.beginPath(); g.ellipse(px + sg * 12 * s * (1 - u * 0.6), py, 16 * s * (1 - u * 0.6), 6 * s, a + sg * 0.6, 0, Math.PI * 2); g.fillStyle = col; g.fill(); g.lineWidth = 2; g.stroke(); } }
  }
};

M.hoja_grande = (g, o, ctx) => {
  const s = o.escala || 1, mov = Math.sin((ctx.t || 0) * 0.9 + (o.x || 0)) * 0.03;
  g.save(); g.translate(o.x, o.y); g.rotate((o.ang || 0) * R + mov); g.scale(s, s);
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(160, -150, 360, -40); g.quadraticCurveTo(170, 120, 0, 0); g.closePath();
  g.fillStyle = o.color || '#183a20'; g.fill(); g.lineWidth = C.LW / s; g.strokeStyle = C.LINEA; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 4 / s; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(180, -40, 360, -40); g.stroke();
  g.restore();
};

M.dosel_abajo = (g, o, ctx) => {
  const r = C.rng(o.semilla || 61), cx = C.W / 2, cy = C.H * 0.42;
  const gr = g.createRadialGradient(cx, cy, 20, cx, cy, C.W * 0.6); gr.addColorStop(0, '#f4f6d8'); gr.addColorStop(0.35, '#b9d6a0'); gr.addColorStop(1, '#2b5130');
  g.fillStyle = gr; g.fillRect(-800, -800, C.W + 1600, C.H + 1600);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r() * 0.3, d = 1500, w = 50 + r() * 70;
    const bx = cx + Math.cos(a) * d, by = cy + Math.sin(a) * d * 0.8, tx = cx + Math.cos(a) * 180, ty = cy + Math.sin(a) * 140;
    const nx = -Math.sin(a), ny = Math.cos(a);
    g.beginPath(); g.moveTo(bx + nx * w * 2, by + ny * w * 2); g.lineTo(tx + nx * w * 0.25, ty + ny * w * 0.25); g.lineTo(tx - nx * w * 0.25, ty - ny * w * 0.25); g.lineTo(bx - nx * w * 2, by - ny * w * 2); g.closePath(); trazo(g, '#3a2a1f');
  }
  const t = ctx.t || 0;
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = 250 + r() * 650, rad = 90 + r() * 170, mv = Math.sin(t * 0.7 + i) * 6;
    g.beginPath(); blob(g, cx + Math.cos(a) * d + mv, cy + Math.sin(a) * d * 0.75, rad, 6, r); g.fillStyle = ['#163a1e', '#1d4a25', '#122d17'][i % 3]; g.fill();
  }
};

C.asientoLado = (g, x, y, s = 1, o = {}) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  const col = o.color || '#4a5f8a', col2 = o.color2 || '#3a4c70';
  if (o.patas !== false) { g.strokeStyle = C.LINEA; g.lineWidth = 8; g.beginPath(); g.moveTo(-20, -60); g.lineTo(-30, 0); g.moveTo(70, -60); g.lineTo(80, 0); g.stroke(); }
  rrect(g, -70, -100, 160, 38, 14); trazo(g, col);
  g.beginPath(); g.moveTo(-72, -95); g.lineTo(-92, -340); g.quadraticCurveTo(-90, -362, -66, -360); g.lineTo(-40, -360); g.quadraticCurveTo(-28, -350, -32, -330); g.lineTo(-30, -98); g.closePath(); trazo(g, col2);
  rrect(g, -96, -372, 64, 70, 16); trazo(g, o.cabecera || '#e9e6dc');
  if (o.brazo !== false) { rrect(g, -40, -150, 110, 20, 8); trazo(g, '#9aa1ad'); }
  g.restore();
};
C.cinturon = (g, x, y, s = 1, ang = 0) => {
  g.save(); g.translate(x, y); g.rotate(ang * R); g.scale(s, s);
  rrect(g, -55, -14, 110, 20, 6); trazo(g, '#7b7f88', 3.5);
  rrect(g, -14, -18, 28, 28, 5); trazo(g, '#d7d9de', 3.5);
  g.restore();
};

M.avion_interior = (g, o, ctx) => {
  const t = ctx.t, x0 = -900, x1 = C.W + 900, piso = o.piso ?? 980;
  g.fillStyle = o.pared || '#ddd6c6'; g.fillRect(x0, -600, x1 - x0, piso + 600);
  g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(x0, 520, x1 - x0, 40);
  for (let x = o.vx0 ?? 60; x < x1; x += o.vsep || 420) {
    const w = 150, h = 210, y = o.vy ?? 250;
    rrect(g, x - 18, y - 18, w + 36, h + 36, 70); trazo(g, '#c9c1ae');
    g.save(); rrect(g, x, y, w, h, 60); g.clip();
    const tor = C.clamp(o.tormenta ?? 0), rel = C.clamp(o.relampago ?? 0);
    const top = tor > 0 ? `rgb(${C.lerp(120, 22, tor)},${C.lerp(180, 26, tor)},${C.lerp(235, 42, tor)})` : '#78b4eb';
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, top); gr.addColorStop(1, tor > 0 ? `rgb(${C.lerp(220, 50, tor)},${C.lerp(235, 54, tor)},${C.lerp(250, 70, tor)})` : '#e3f1fb');
    g.fillStyle = gr; g.fillRect(x, y, w, h);
    const rn = C.rng(Math.floor(x));
    for (let i = 0; i < 4; i++) { const cxx = x + ((rn() * w * 2 - t * 90 * (1 + tor)) % (w * 2) + w * 2) % (w * 2) - w * 0.5, cyy = y + 30 + rn() * h * 0.8; g.beginPath(); g.ellipse(cxx, cyy, 60, 24, 0, 0, Math.PI * 2); g.fillStyle = tor > 0.3 ? `rgba(60,62,78,${0.6 + tor * 0.3})` : 'rgba(255,255,255,0.9)'; g.fill(); }
    if (o.ala && Math.abs(x - o.ala) < 5) { g.beginPath(); g.moveTo(x - 10, y + h * 0.62); g.lineTo(x + w + 10, y + h * 0.48); g.lineTo(x + w + 10, y + h * 0.6); g.lineTo(x - 10, y + h * 0.8); g.closePath(); g.fillStyle = tor > 0.3 ? '#8a8f9c' : '#c9ced8'; g.fill(); g.strokeStyle = C.LINEA; g.lineWidth = 3; g.stroke(); }
    if (tor > 0.2) { g.strokeStyle = `rgba(200,210,230,${tor * 0.5})`; g.lineWidth = 2; for (let i = 0; i < 14; i++) { const rx = x + ((i * 37 + t * 900) % (w + 40)) - 20, ry = y + ((i * 53 + t * 1400) % (h + 40)) - 20; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - 14, ry + 22); g.stroke(); } }
    if (rel > 0) { g.fillStyle = `rgba(235,240,255,${rel})`; g.fillRect(x, y, w, h); if (o.ala && Math.abs(x - o.ala) < 5) { g.strokeStyle = `rgba(255,255,255,${rel})`; g.lineWidth = 6; g.beginPath(); g.moveTo(x + w * 0.7, y - 5); g.lineTo(x + w * 0.55, y + h * 0.25); g.lineTo(x + w * 0.72, y + h * 0.3); g.lineTo(x + w * 0.58, y + h * 0.55); g.stroke(); } }
    g.restore();
    rrect(g, x, y, w, h, 60); g.strokeStyle = C.LINEA; g.lineWidth = C.LW; g.stroke();
  }
  g.beginPath(); g.moveTo(x0, 150); g.lineTo(x1, 150); g.lineTo(x1, -600); g.lineTo(x0, -600); g.closePath(); trazo(g, '#cfc7b4');
  for (let x = x0; x < x1; x += 300) { rrect(g, x + 6, 20, 288, 120, 18); trazo(g, '#e6e0d2', 3.5); g.fillStyle = '#9b9384'; g.fillRect(x + 120, 110, 60, 10); }
  g.fillStyle = o.alfombra || '#5a4a5e'; g.fillRect(x0, piso, x1 - x0, C.H + 600);
  g.strokeStyle = C.LINEA; g.lineWidth = C.LW; g.beginPath(); g.moveTo(x0, piso); g.lineTo(x1, piso); g.stroke();
};

C.gradacion = (g, arriba, abajo, k = 1, modo = 'multiply') => {
  if (k <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = modo; g.globalAlpha = C.clamp(k);
  const gr = g.createLinearGradient(0, 0, 0, C.H); gr.addColorStop(0, arriba); gr.addColorStop(1, abajo);
  g.fillStyle = gr; g.fillRect(0, 0, C.W, C.H); g.restore();
};
C.rayos = (g, t, o = {}) => {
  const k = o.k ?? 1; if (k <= 0) return;
  const r = C.rng(o.semilla || 3);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < (o.n || 5); i++) {
    const x = (o.x ?? C.W * 0.5) + (r() - 0.5) * (o.disp || 900), w = 40 + r() * (o.ancho || 120), a = (o.ang ?? 18) * R;
    const pul = 0.6 + 0.4 * Math.sin(t * (0.5 + r()) + i * 2);
    const L = C.H * 1.6, dx = Math.tan(a) * L;
    const gr = g.createLinearGradient(x, 0, x + dx, L); gr.addColorStop(0, `rgba(${o.color || '255,245,200'},${0.35 * k * pul})`); gr.addColorStop(0.7, `rgba(${o.color || '255,245,200'},0)`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w / 2, -20); g.lineTo(x + w / 2, -20); g.lineTo(x + dx + w * 1.6, L); g.lineTo(x + dx - w * 1.6, L); g.closePath(); g.fill();
  }
  g.restore();
};
C.lluvia = (g, t, o = {}) => {
  const k = o.k ?? 1; if (k <= 0) return;
  const r = C.rng(o.semilla || 9), n = o.n || 220, v = o.vel || 1500, ang = (o.ang ?? 12) * R;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.strokeStyle = `rgba(${o.color || '210,225,240'},${0.35 * k})`; g.lineWidth = o.grosor || 2; g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i < n; i++) { const x0 = r() * (C.W + 400) - 200, sp = 0.7 + r() * 0.6, len = (24 + r() * 26) * sp; const y = ((r() * C.H + t * v * sp) % (C.H + 100)) - 50; const x = x0 - Math.tan(ang) * y; g.moveTo(x, y); g.lineTo(x - Math.tan(ang) * len, y + len); }
  g.stroke(); g.restore();
};
C.niebla = (g, t, o = {}) => {
  const k = o.k ?? 1; if (k <= 0) return;
  const r = C.rng(o.semilla || 4);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < (o.n || 6); i++) {
    const y = (o.y ?? C.H * 0.6) + (r() - 0.5) * (o.alto || 400), w = 700 + r() * 700, x = ((r() * C.W + t * (12 + r() * 20)) % (C.W + w)) - w / 2;
    const gr = g.createRadialGradient(x, y, 10, x, y, w / 2); gr.addColorStop(0, `rgba(${o.color || '220,230,225'},${0.22 * k})`); gr.addColorStop(1, `rgba(${o.color || '220,230,225'},0)`);
    g.fillStyle = gr; g.save(); g.translate(x, y); g.scale(1, 0.28); g.translate(-x, -y); g.fillRect(x - w / 2, y - w / 2, w, w); g.restore();
  }
  g.restore();
};
C.relampago = (g, t, t0, o = {}) => {
  const u = t - t0; if (u < 0 || u > 0.9) return 0;
  const v = u < 0.08 ? 1 : u < 0.16 ? 0.25 : u < 0.24 ? 0.9 : Math.max(0, 1 - (u - 0.24) / 0.66) * 0.6;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen'; g.globalAlpha = v * (o.k ?? 1); g.fillStyle = o.color || '#eef2ff'; g.fillRect(0, 0, C.W, C.H); g.restore();
  return v;
};
C.cartel = (g, titulo, sub, a, o = {}) => {
  if (a <= 0.01) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const x = o.x ?? 110, y = o.y ?? C.H - 250, u = C.salida(a);
  g.globalAlpha = C.clamp(a);
  g.font = `900 ${o.tam || 74}px "Arial Black", Arial, sans-serif`; const w = Math.max(g.measureText(titulo).width, 300) + 60;
  g.fillStyle = o.acento || '#f2b134'; g.fillRect(x - 24, y - 70, 14, 150 * u);
  g.fillStyle = 'rgba(12,14,18,0.78)'; g.fillRect(x - 10, y - 70, w * u, 150);
  g.save(); g.beginPath(); g.rect(x - 10, y - 70, w * u, 150); g.clip();
  g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.fillText(titulo, x + 16, y - 10);
  g.font = `700 ${o.tamSub || 38}px Arial, sans-serif`; g.fillStyle = o.acento || '#f2b134'; g.fillText(sub, x + 18, y + 50);
  g.restore(); g.restore();
};
C.subTemp = (g, texto, a) => {
  if (!texto || a <= 0.01) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = C.clamp(a);
  g.font = '600 40px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = Math.min(g.measureText(texto).width + 50, C.W - 120);
  g.fillStyle = 'rgba(0,0,0,0.62)'; rrect(g, C.W / 2 - w / 2, C.H - 112, w, 64, 12); g.fill();
  g.fillStyle = '#fff'; g.fillText(texto, C.W / 2, C.H - 79, C.W - 160);
  g.restore();
};
C.grano = (g, t, k = 0.05) => {
  const r = C.rng(Math.floor(t * 24) + 1);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = k;
  for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? '#fff' : '#000'; g.fillRect(r() * C.W, r() * C.H, 2, 2); }
  g.restore();
};


C.CARAS_B = {
  neutral: { cej: 0, cejY: 0, ojoH: 1, boca: 'linea', ab: 0, pupX: 0, pupY: 0, rubor: 0.35 },
  feliz: { cej: -6, cejY: 4, ojoH: 0.9, boca: 'sonrisa', ab: 0.5, pupX: 0, pupY: 0, rubor: 0.55 },
  tranquila: { cej: 0, cejY: 2, ojoH: 0.85, boca: 'sonrisa', ab: 0, pupX: 0, pupY: 0, rubor: 0.4 },
  miedo: { cej: 22, cejY: 9, ojoH: 1.15, boca: 'o', ab: 0.6, pupX: 0, pupY: 0, rubor: 0.15 },
  sorpresa: { cej: 10, cejY: 14, ojoH: 1.25, boca: 'o', ab: 1, pupX: 0, pupY: 0, rubor: 0.2 },
  dolor: { cej: 26, cejY: 2, ojoH: 0.35, boca: 'abajo_abierta', ab: 0.6, pupX: 0, pupY: 0.2, rubor: 0.2 },
  triste: { cej: 22, cejY: 4, ojoH: 0.8, boca: 'abajo', ab: 0, pupX: 0, pupY: 0.3, rubor: 0.25 },
  dormida: { cej: 4, cejY: -2, ojoH: 0, boca: 'linea', ab: 0, pupX: 0, pupY: 0, rubor: 0.25 },
  alivio: { cej: 14, cejY: 6, ojoH: 0.55, boca: 'sonrisa', ab: 0.15, pupX: 0, pupY: -0.2, rubor: 0.4 },
  enojo: { cej: -22, cejY: -4, ojoH: 0.85, boca: 'abajo', ab: 0.1, pupX: 0, pupY: 0, rubor: 0.3 },
  cansada: { cej: 8, cejY: -2, ojoH: 0.5, boca: 'linea', ab: 0, pupX: 0, pupY: 0.2, rubor: 0.2 }
};
C.POSES_B = {
  parado: { tor: 0, cab: 0, bi: [10, 6], bd: [10, 6], pi: [4, 0], pd: [4, 0] },
  brazos_abiertos: { tor: 0, cab: 0, bi: [45, 20], bd: [45, 20], pi: [8, 0], pd: [8, 0] },
  manos_boca: { tor: 4, cab: 4, bi: [20, 150], bd: [20, 150], pi: [4, 0], pd: [4, 0] },
  manos_cabeza: { tor: 0, cab: 6, bi: [120, 120], bd: [120, 120], pi: [6, 0], pd: [6, 0] },
  encogida: { tor: 6, cab: 10, bi: [25, 120], bd: [25, 120], pi: [2, 0], pd: [2, 0] },
  sujetarse: { tor: 0, cab: -4, bi: [40, 60], bd: [40, 60], pi: [6, 0], pd: [6, 0], sentado: true },
  sentado: { tor: 0, cab: 0, bi: [18, 45], bd: [18, 45], pi: [10, 0], pd: [10, 0], sentado: true },
  sentado_suelo: { tor: 0, cab: 4, bi: [14, 40], bd: [14, 40], suelo: true },
  abrazar_rodillas: { tor: 0, cab: 8, bi: [22, 75], bd: [22, 75], suelo: true },
  acostado_asiento: { tor: 0, cab: 0, bi: [25, 20], bd: [30, 15], pi: [10, 0], pd: [14, 0], sentado: true },
  senalar: { tor: 0, cab: 0, bi: [10, 6], bd: [95, 0], pi: [4, 0], pd: [4, 0] }
};
C.cicloB = (fase) => { const w = fase * 2 * Math.PI, s = Math.sin(w); return { tor: 0, cab: 0, bi: [10 + 14 * s, 10], bd: [10 - 14 * s, 10], pi: [4 + 9 * s, 0], pd: [4 - 9 * s, 0], paso: s, rebote: Math.abs(Math.cos(w)) * 6 }; };
C.mezclarB = (a, b, k) => {
  if (k <= 0) return a; if (k >= 1) return b;
  const o = { ...(k < 0.5 ? a : b) };
  for (const n of ['tor', 'cab', 'rebote', 'paso']) o[n] = C.lerp(a[n] || 0, b[n] || 0, k);
  for (const n of ['bi', 'bd', 'pi', 'pd']) { const x = a[n] || [0, 0], y = b[n] || [0, 0]; o[n] = [C.lerp(x[0], y[0], k), C.lerp(x[1], y[1], k)]; }
  return o;
};
C.mezclarCaraB = (a, b, k) => { const o = { ...(k < 0.5 ? a : b) }; for (const n of ['cej', 'cejY', 'ojoH', 'ab', 'pupX', 'pupY', 'rubor', 'sucio']) o[n] = C.lerp(a[n] ?? 0, b[n] ?? a[n] ?? 0, k); return o; };
const caraB = c => typeof c === 'string' ? C.CARAS_B[c] : { ...C.CARAS_B.neutral, ...c };
const poseB = p => typeof p === 'string' ? C.POSES_B[p] : p;

C.personajeB = rec => {
  const cu = rec.cuerpo || {}, esc = (cu.estatura || 1) * (cu.edad === 'nino' ? 0.75 : 1);
  const piel = rec.piel || '#f3d6bd', ropa = rec.ropa || {}, pelo = rec.pelo || { estilo: 'corto', color: '#3b2a20' };
  const arriba = ropa.arriba || { tipo: 'playera', color: '#4a7bd0' }, abajo = ropa.abajo || { tipo: 'pantalon', color: '#2d3142' }, pies = ropa.pies || { color: '#f2f2f2' };
  const acc = new Set((rec.accesorios || []).map(a => a.tipo)), accCol = Object.fromEntries((rec.accesorios || []).map(a => [a.tipo, a.color || '#555']));
  const semilla = [...(rec.id || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0);
  const R0 = 78 * (cu.cabeza || 1), ancho = { delgada: 0.9, delgado: 0.9, medio: 1, media: 1, robusto: 1.25 }[cu.complexion || 'medio'];
  const vestido = arriba.tipo === 'vestido', manga = ['sudadera', 'camisa', 'chamarra', 'saco'].includes(arriba.tipo), pantalon = !vestido && ['pantalon', 'pants'].includes(abajo.tipo);
  const lineaC = (pts, w, col) => { g_.lineCap = 'round'; g_.lineJoin = 'round'; g_.beginPath(); g_.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g_.lineTo(p[0], p[1]); g_.strokeStyle = col; g_.lineWidth = w; g_.stroke(); };
  let g_;
  const ext = (o, ang, L, lado) => [o[0] + Math.sin(ang * R) * L * lado, o[1] + Math.cos(ang * R) * L];
  const extremidad = (pts, col, grueso) => { lineaC(pts, grueso + 7, C.LINEA); lineaC(pts, grueso, col); };
  const brazo = (hom, a, lado, t) => {
    const codo = ext(hom, a[0], 66, lado), mano = ext(codo, a[0] + a[1], 58, lado);
    extremidad([hom, codo, mano], manga ? arriba.color : piel, manga ? 11 : 7);
    if (manga) extremidad([codo, mano], arriba.color, 11);
    g_.beginPath(); g_.arc(mano[0], mano[1], 9, 0, Math.PI * 2); g_.fillStyle = piel; g_.fill(); g_.lineWidth = 3.5; g_.strokeStyle = C.LINEA; g_.stroke();
  };
  const pie = (p, lado) => {
    const desc = pies.descalzo === (lado < 0 ? 'i' : 'd') || pies.descalzo === 'ambos';
    g_.beginPath(); g_.ellipse(p[0] + lado * 5, p[1] + 2, desc ? 11 : 15, desc ? 7 : 9, 0, 0, Math.PI * 2); g_.fillStyle = desc ? piel : pies.color; g_.fill(); g_.lineWidth = 3.5; g_.strokeStyle = C.LINEA; g_.stroke();
  };
  const pierna = (cad, a, lado, p) => {
    const col = pantalon ? abajo.color : piel, gr = pantalon ? 13 : 7;
    let rod, tob;
    if (p.suelo) { rod = [cad[0] + lado * 42, cad[1] + 22]; tob = [cad[0] + lado * 74, cad[1] + 44]; }
    else if (p.sentado) { rod = [cad[0] + lado * 8, cad[1] + 16]; tob = ext(rod, a[0], 82, lado); }
    else { rod = ext(cad, a[0], 50, lado); tob = ext(rod, a[0] + a[1], 48, lado); }
    if (p.paso && !p.sentado && !p.suelo) tob[1] -= Math.max(0, p.paso * lado) * 10;
    extremidad([cad, rod, tob], col, gr); pie(tob, lado);
  };
  const peloAtras = (r) => {
    const e = pelo.estilo;
    if (e === 'largo') {
      g_.beginPath(); g_.moveTo(-r, 0); g_.arc(0, 0, r * 1.06, Math.PI, 0);
      g_.lineTo(r * 1.08, r * 1.2); g_.quadraticCurveTo(r * 0.85, r * 1.32, r * 0.62, r * 1.15); g_.lineTo(r * 0.5, r * 0.5);
      g_.lineTo(-r * 0.5, r * 0.5); g_.lineTo(-r * 0.62, r * 1.15); g_.quadraticCurveTo(-r * 0.85, r * 1.32, -r * 1.08, r * 1.2); g_.closePath();
      g_.fillStyle = pelo.color; g_.fill(); g_.lineWidth = C.LW; g_.strokeStyle = C.LINEA; g_.stroke();
    }
    if (e === 'coleta') { g_.beginPath(); g_.ellipse(r * 0.95, -r * 0.35, r * 0.28, r * 0.55, 0.5, 0, Math.PI * 2); g_.fillStyle = pelo.color; g_.fill(); g_.lineWidth = C.LW; g_.strokeStyle = C.LINEA; g_.stroke(); }
  };
  const peloFrente = (r, mx) => {
    const e = pelo.estilo; if (e === 'calvo') return;
    g_.beginPath();
    if (e === 'corto') { g_.arc(0, -r * 0.02, r * 1.02, Math.PI * 1.02, Math.PI * 1.98); g_.lineTo(r * 0.92, -r * 0.18); g_.quadraticCurveTo(r * 0.2 + mx, -r * 0.62, -r * 0.35 + mx, -r * 0.38); g_.quadraticCurveTo(-r * 0.7, -r * 0.5, -r * 0.98, -r * 0.1); }
    else { g_.arc(0, -r * 0.08, r * 1.0, Math.PI * 1.08, Math.PI * 1.92); g_.quadraticCurveTo(mx * 0.5, -r * 0.55, -r * 0.95, -r * 0.28); }
    g_.closePath(); g_.fillStyle = pelo.color; g_.fill(); g_.lineWidth = C.LW; g_.strokeStyle = C.LINEA; g_.stroke();
  };
  const boca = (x, y, c, w, habla) => {
    g_.strokeStyle = C.LINEA; g_.lineWidth = 4.5; g_.lineCap = 'round';
    const ab = C.clamp(c.ab + habla * 0.9);
    const f = habla > 0.08 ? (c.boca === 'sonrisa' ? 'sonrisa' : 'o') : c.boca;
    if (f === 'linea' || (f === 'o' && ab < 0.05)) { g_.beginPath(); g_.moveTo(x - w / 2, y); g_.lineTo(x + w / 2, y); g_.stroke(); return; }
    if (f === 'sonrisa') {
      if (ab < 0.1) { g_.beginPath(); g_.moveTo(x - w / 2, y - 3); g_.quadraticCurveTo(x, y + 10, x + w / 2, y - 3); g_.stroke(); return; }
      g_.beginPath(); g_.moveTo(x - w / 2, y - 3); g_.lineTo(x + w / 2, y - 3); g_.quadraticCurveTo(x, y + 6 + ab * 18, x - w / 2, y - 3); g_.closePath(); g_.fillStyle = '#4a1a20'; g_.fill(); g_.stroke(); return;
    }
    if (f === 'abajo') { g_.beginPath(); g_.moveTo(x - w / 2, y + 5); g_.quadraticCurveTo(x, y - 8, x + w / 2, y + 5); g_.stroke(); return; }
    if (f === 'abajo_abierta') { g_.beginPath(); g_.moveTo(x - w / 2, y + 8); g_.quadraticCurveTo(x, y - 6 - ab * 8, x + w / 2, y + 8); g_.closePath(); g_.fillStyle = '#4a1a20'; g_.fill(); g_.stroke(); return; }
    g_.beginPath(); g_.ellipse(x, y + 3, w * (0.16 + ab * 0.1), w * (0.18 + ab * 0.22), 0, 0, Math.PI * 2); g_.fillStyle = '#4a1a20'; g_.fill(); g_.stroke();
  };
  const cabeza = (cen, ang, c, t, habla, mira, e) => {
    const r = R0;
    g_.save(); g_.translate(cen[0], cen[1]); g_.rotate(ang * R);
    peloAtras(r);
    g_.beginPath(); g_.ellipse(0, 0, r, r * 0.95, 0, 0, Math.PI * 2); g_.fillStyle = piel; g_.fill(); g_.lineWidth = C.LW; g_.strokeStyle = C.LINEA; g_.stroke();
    const mx = mira * r * 0.16;
    const bl = (() => { const per = 2.8 + (semilla % 7) * 0.4, ph = (t + semilla * 0.37) % per; return ph < 0.13 ? Math.sin(ph / 0.13 * Math.PI) : 0; })();
    const oh = c.ojoH * (1 - bl);
    for (const s of [-1, 1]) { g_.beginPath(); g_.ellipse(s * r * 0.55 + mx * 0.6, r * 0.35, r * 0.13, r * 0.08, 0, 0, Math.PI * 2); g_.fillStyle = `rgba(230,120,120,${c.rubor})`; g_.fill(); }
    if (c.sucio) { g_.save(); g_.globalAlpha = c.sucio; g_.fillStyle = '#6b4a2f'; for (const [x, y, rr] of [[-r * 0.45, r * 0.5, 6], [r * 0.62, r * 0.12, 4.5], [-r * 0.18, -r * 0.48, 5], [r * 0.3, r * 0.62, 3.5]]) { g_.beginPath(); g_.arc(x, y, rr, 0, Math.PI * 2); g_.fill(); } g_.restore(); }
    const ex = r * 0.3, ey = r * 0.06, erx = r * 0.1 * (cu.ojos || 1), ery = r * 0.14 * (cu.ojos || 1);
    for (const s of [-1, 1]) {
      const x = s * ex + mx;
      if (oh < 0.08) { g_.beginPath(); g_.moveTo(x - erx, ey); g_.quadraticCurveTo(x, ey + ery * 0.5, x + erx, ey); g_.lineWidth = 4; g_.strokeStyle = C.LINEA; g_.stroke(); }
      else {
        g_.beginPath(); g_.ellipse(x + c.pupX * erx * 0.5 + mira * erx * 0.35, ey + c.pupY * ery * 0.4, erx, ery * oh, 0, 0, Math.PI * 2); g_.fillStyle = C.LINEA; g_.fill();
        g_.beginPath(); g_.arc(x + c.pupX * erx * 0.5 + mira * erx * 0.35 + erx * 0.35, ey - ery * 0.35 * oh, erx * 0.32, 0, Math.PI * 2); g_.fillStyle = '#fff'; g_.fill();
      }
      const y1 = ey - ery * 1.55 - c.cejY, lev = Math.sin(c.cej * R) * erx * 1.6, inner = -s;
      g_.beginPath(); g_.moveTo(x - inner * erx * 1.2, y1 + lev * 0.25); g_.lineTo(x + inner * erx * 1.2, y1 - lev); g_.lineWidth = 4.5; g_.strokeStyle = C.LINEA; g_.lineCap = 'round'; g_.stroke();
    }
    if (acc.has('lentes')) { g_.lineWidth = 3.5; g_.strokeStyle = C.LINEA; for (const s of [-1, 1]) { g_.beginPath(); g_.arc(s * ex + mx, ey, erx * 2.1, 0, Math.PI * 2); g_.stroke(); } g_.beginPath(); g_.moveTo(-ex + mx + erx * 2.1, ey); g_.lineTo(ex + mx - erx * 2.1, ey); g_.stroke(); }
    boca(mx * 0.8, r * 0.5, c, r * 0.32, habla);
    peloFrente(r, mx);
    if (acc.has('gorro')) { g_.beginPath(); g_.arc(0, -r * 0.08, r * 1.06, Math.PI * 1.04, Math.PI * 1.96); g_.closePath(); g_.fillStyle = accCol.gorro; g_.fill(); g_.lineWidth = C.LW; g_.strokeStyle = C.LINEA; g_.stroke(); rrect(g_, -r * 1.1, -r * 0.42, r * 2.2, r * 0.28, 10); g_.fill(); g_.stroke(); }
    if (acc.has('gorra')) { g_.beginPath(); g_.arc(0, -r * 0.2, r * 1.0, Math.PI * 1.05, Math.PI * 1.95); g_.closePath(); g_.fillStyle = accCol.gorra; g_.fill(); g_.lineWidth = C.LW; g_.strokeStyle = C.LINEA; g_.stroke(); g_.beginPath(); g_.ellipse(mx, -r * 0.3, r * 0.75, r * 0.13, 0, 0, Math.PI * 2); g_.fill(); g_.stroke(); }
    g_.restore();
  };
  const torso = (tor) => {
    g_.save(); g_.rotate(tor * R);
    const w = 34 * ancho, wb = (vestido ? 56 : 40) * ancho, yb = vestido ? -88 : -96;
    if (!vestido && abajo.tipo === 'falda') { g_.beginPath(); g_.moveTo(-36 * ancho, -104); g_.lineTo(36 * ancho, -104); g_.lineTo(48 * ancho, -62); g_.lineTo(-48 * ancho, -62); g_.closePath(); g_.fillStyle = abajo.color; g_.fill(); g_.lineWidth = C.LW; g_.strokeStyle = C.LINEA; g_.stroke(); }
    g_.beginPath(); g_.moveTo(-w, -222); g_.quadraticCurveTo(0, -238, w, -222); g_.lineTo(wb, yb); g_.quadraticCurveTo(0, yb + 10, -wb, yb); g_.closePath();
    g_.fillStyle = arriba.color; g_.fill(); g_.lineWidth = C.LW; g_.strokeStyle = C.LINEA; g_.stroke();
    if (arriba.tipo === 'camisa' || arriba.tipo === 'saco') { g_.beginPath(); g_.moveTo(-12, -232); g_.lineTo(0, -212); g_.lineTo(12, -232); g_.moveTo(0, -212); g_.lineTo(0, yb + 4); g_.lineWidth = 3; g_.stroke(); }
    if (vestido) { g_.beginPath(); g_.moveTo(-w * 0.9, -150); g_.quadraticCurveTo(0, -140, w * 0.9, -150); g_.lineWidth = 3; g_.strokeStyle = 'rgba(0,0,0,0.25)'; g_.stroke(); }
    if (acc.has('mochila')) { rrect(g_, -w - 14, -205, 12, 70, 5); g_.fillStyle = accCol.mochila; g_.fill(); }
    g_.restore();
  };
  return {
    rec, esc, R0,
    cabezaEn: (x, y, escala = 1) => [x, y - 300 * esc * escala],
    dibujar(g, e) {
      g_ = g; const t = e.t || 0;
      let p = poseB(e.pose || 'parado');
      if (e.ciclo) p = C.cicloB(e.fase || 0);
      if (e.poseB) p = C.mezclarB(p, poseB(e.poseB), e.k || 0);
      let c = caraB(e.cara || 'neutral'); if (e.caraB) c = C.mezclarCaraB(c, caraB(e.caraB), e.k2 ?? e.k ?? 0);
      const habla = e.habla ? C.rms(t) : 0, mira = e.mira ?? 0;
      const k = esc * (e.escala ?? 1), resp = Math.sin(t * 2 * Math.PI / 3.4 + semilla) * 1.6;
      g.save(); g.translate(e.x, e.y ?? C.SUELO);
      if (e.sombra !== false) { g.save(); g.scale(1, 0.2); g.beginPath(); g.ellipse(0, 0, 70 * k, 70 * k, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(15,10,20,0.22)'; g.fill(); g.restore(); }
      g.scale(k, k);
      const baja = p.suelo ? 92 : 0;
      g.translate(0, baja - (p.rebote || 0));
      const cad = [0, -100];
      pierna([cad[0] - 18 * ancho, cad[1]], p.pi || [0, 0], -1, p); pierna([cad[0] + 18 * ancho, cad[1]], p.pd || [0, 0], 1, p);
      const hi = [-34 * ancho - 2, -212 + resp * 0.5], hd = [34 * ancho + 2, -212 + resp * 0.5];
      torso(p.tor || 0);
      brazo(hi, p.bi, -1, t); brazo(hd, p.bd, 1, t);
      const cuello = [Math.sin((p.tor || 0) * R) * 228, -232 + resp * 0.3];
      cabeza([cuello[0] + Math.sin(((p.tor || 0) + (p.cab || 0)) * R) * R0 * 0.85, cuello[1] - R0 * 0.82], (p.tor || 0) + (p.cab || 0) + (e.ladeo || 0), c, t, habla, mira, e);
      g.restore();
    }
  };
};

C.asientoFrente = (g, x, y, s = 1, o = {}) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  const col = o.color || '#4a5f8a', col2 = o.color2 || '#3a4c70';
  rrect(g, -78, -360, 156, 250, 26); g.fillStyle = col2; g.fill(); g.lineWidth = C.LW; g.strokeStyle = C.LINEA; g.stroke();
  rrect(g, -60, -372, 120, 56, 16); g.fillStyle = o.cabecera || '#e9e6dc'; g.fill(); g.stroke();
  rrect(g, -84, -128, 168, 40, 14); g.fillStyle = col; g.fill(); g.stroke();
  if (o.patas !== false) { g.strokeStyle = C.LINEA; g.lineWidth = 8; g.beginPath(); g.moveTo(-60, -88); g.lineTo(-64, 0); g.moveTo(60, -88); g.lineTo(64, 0); g.stroke(); }
  g.restore();
};
C.brazosAsiento = (g, x, y, s = 1) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  for (const sx of [-1, 1]) { rrect(g, sx * 84 - 14, -190, 28, 90, 10); g.fillStyle = '#9aa1ad'; g.fill(); g.lineWidth = 4; g.strokeStyle = C.LINEA; g.stroke(); }
  g.restore();
};
C.cinturonFrente = (g, x, y, s = 1) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  rrect(g, -66, -112, 132, 18, 6); g.fillStyle = '#7b7f88'; g.fill(); g.lineWidth = 3.5; g.strokeStyle = C.LINEA; g.stroke();
  rrect(g, -15, -117, 30, 28, 5); g.fillStyle = '#d7d9de'; g.fill(); g.stroke();
  g.restore();
};

M.cabina = (g, o, ctx) => {
  const t = ctx.t, tor = C.clamp(o.tormenta ?? 0), rel = C.clamp(o.relampago ?? 0);
  g.fillStyle = '#d9d1bf'; g.fillRect(-900, -600, C.W + 1800, C.H + 1200);
  g.beginPath(); g.moveTo(-900, -600); g.lineTo(C.W + 900, -600); g.lineTo(C.W + 900, 150); g.lineTo(1350, 230); g.lineTo(570, 230); g.lineTo(-900, 150); g.closePath(); g.fillStyle = '#cfc7b4'; g.fill(); g.lineWidth = C.LW; g.strokeStyle = C.LINEA; g.stroke();
  for (const [x0, x1] of [[-900, 570], [1350, C.W + 900]]) { g.beginPath(); g.moveTo(x0, 150 + (x0 < 0 ? 0 : 0)); }
  g.beginPath(); g.moveTo(-900, 150); g.lineTo(570, 230); g.lineTo(570, 330); g.lineTo(-900, 300); g.closePath(); g.fillStyle = '#e6e0d2'; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(C.W + 900, 150); g.lineTo(1350, 230); g.lineTo(1350, 330); g.lineTo(C.W + 900, 300); g.closePath(); g.fillStyle = '#e6e0d2'; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(570, 230); g.lineTo(1350, 230); g.lineTo(1350, 820); g.lineTo(570, 820); g.closePath(); g.fillStyle = '#c8bfab'; g.fill(); g.stroke();
  for (let i = 0; i < 4; i++) { const yy = 420 + i * 110, ww = 300 - i * 50; rrect(g, 960 - ww / 2, yy, ww, 70, 14); g.fillStyle = '#3e5179'; g.fill(); g.lineWidth = 3; g.stroke(); }
  const vents = o.ventanas || [[160, 400, 0.9], [-260, 380, 1.05]];
  for (const [vx, vy, vs] of vents) {
    const w = 120 * vs, h = 170 * vs;
    g.save(); rrect(g, vx, vy, w, h, 50 * vs); g.clip();
    const gr = g.createLinearGradient(0, vy, 0, vy + h); gr.addColorStop(0, `rgb(${C.lerp(120, 22, tor)},${C.lerp(180, 26, tor)},${C.lerp(235, 42, tor)})`); gr.addColorStop(1, `rgb(${C.lerp(225, 50, tor)},${C.lerp(238, 54, tor)},${C.lerp(250, 70, tor)})`);
    g.fillStyle = gr; g.fillRect(vx, vy, w, h);
    const rn = C.rng(Math.floor(vx + 900));
    for (let i = 0; i < 3; i++) { const cx = vx + ((rn() * w * 2 - t * 70) % (w * 2) + w * 2) % (w * 2) - w * 0.4, cy = vy + 20 + rn() * h * 0.8; g.beginPath(); g.ellipse(cx, cy, 44 * vs, 17 * vs, 0, 0, Math.PI * 2); g.fillStyle = tor > 0.3 ? 'rgba(60,62,78,0.85)' : 'rgba(255,255,255,0.9)'; g.fill(); }
    if (rel > 0) { g.fillStyle = `rgba(235,240,255,${rel})`; g.fillRect(vx, vy, w, h); }
    g.restore();
    rrect(g, vx - 12 * vs, vy - 12 * vs, w + 24 * vs, h + 24 * vs, 58 * vs); g.lineWidth = 14 * vs; g.strokeStyle = '#c9c1ae'; g.stroke(); g.lineWidth = C.LW; g.strokeStyle = C.LINEA; g.stroke();
  }
  g.beginPath(); g.moveTo(-900, 900); g.lineTo(570, 820); g.lineTo(1350, 820); g.lineTo(C.W + 900, 900); g.lineTo(C.W + 900, C.H + 600); g.lineTo(-900, C.H + 600); g.closePath(); g.fillStyle = o.alfombra || '#5a4a5e'; g.fill(); g.lineWidth = C.LW; g.strokeStyle = C.LINEA; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.moveTo(820, 820); g.lineTo(1100, 820); g.lineTo(1300, C.H + 600); g.lineTo(620, C.H + 600); g.closePath(); g.fill();
};

window.C = C;
})();
