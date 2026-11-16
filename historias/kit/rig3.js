/* Personaje v3 del canal de historias: C.personaje3(receta). Misma receta y mismas opciones de dibujo que
   C.personaje2 (rig2.js), que se conserva intacto para que los videos ya publicados rendericen igual.
   Qué cambia: cuello, cabeza más chica (el cuerpo mide lo mismo: hombros en -212, cadera en -100), manos con pulgar,
   codos y rodillas redondeados, sombra propia en cada parte, sombra de la cabeza sobre cuello y pecho, sombra de piso,
   grosor de línea casi constante en pantalla, parpadeo irregular, respiración visible y giro de frente a perfil.
   Referencias:
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/getTransform : escala actual del lienzo, para
     compensar el grosor de línea cuando la cámara se acerca o se aleja.
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/arcTo : esquina redondeada en codo y rodilla.
   https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/clip : sombra propia (la misma figura desplazada
     hacia la luz, dentro de su propio recorte).
   https://github.com/luispablovillasenor-afk/shorts-animados-claude (referencias/BIBLIA_DE_ESTILO.md, MIT): parpadeo a
     intervalos irregulares, sombra de contacto, sombras frías y proporción de cabeza más chica en adultos.
   https://github.com/lemomo-ai/lemo-opuscar (TECHNIQUE.md): no delinear el brazo sobre el torso como costura; el hombro
     acompaña al brazo cuando sube.
   Opciones nuevas al dibujar: giro (-1 perfil izquierdo … 0 frente … 1 perfil derecho), sombra (false para quitar la
   de piso: saltos, caídas, personajes dentro de un vehículo), vivo (false quita los micro movimientos de ojos). */
(function () {
const C = window.C, R = Math.PI / 180, TAU = Math.PI * 2, hash = C.hash, cl = C.clamp;
C.LUZ = C.LUZ || [-0.55, -0.83];
const hex = h => typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h);
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const frio = (h, k) => { if (!hex(h)) return h; const [r, g, b] = rgb(h); return `rgb(${Math.round(r * (1 - k))},${Math.round(g * (1 - k * 0.9))},${Math.round(Math.min(255, b * (1 - k * 0.62)))})`; };
const claro = (h, k) => hex(h) ? `rgb(${rgb(h).map(v => Math.round(v + (255 - v) * k)).join(',')})` : h;
C.frio = frio;
C.grosor = g => { const m = g.getTransform(); return cl(Math.pow(Math.hypot(m.a, m.b) || 1, -0.65), 0.55, 3); };

C.caminar = (t, o = {}) => {
  const ritmo = o.ritmo ?? 1.9, dir = o.dir ?? 1, amp = o.amp ?? 26, f = t * ritmo * Math.PI, s = Math.sin(f), c = Math.cos(f);
  const pierna = (w, lev, L) => [w * amp * L * dir, -Math.max(0, lev) * 46 * L * dir];
  return { pi: pierna(s, c, -1), pd: pierna(-s, -c, 1), bi: [s * amp * 0.9 * dir, -14 * dir], bd: [s * amp * 0.9 * dir, 14 * dir], dy: -Math.abs(c) * 5, tor: dir * 1.5, cab: 0 };
};

C.personaje3 = rec => {
  const cu = rec.cuerpo || {}, nino = cu.edad === 'nino', esc = (cu.estatura || 1) * (nino ? 0.75 : 1);
  const piel = rec.piel || '#f3d6bd', ropa = rec.ropa || {}, pelo = rec.pelo || { estilo: 'corto', color: '#3b2a20' };
  const arriba = ropa.arriba || { tipo: 'playera', color: '#4a7bd0' }, abajo = ropa.abajo || { tipo: 'pantalon', color: '#2d3142' }, pies = ropa.pies || { color: '#f2f2f2' };
  const semilla = [...(rec.id || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0);
  const R0 = (nino ? 70 : 64) * (cu.cabeza || 1), ancho = { delgada: 0.9, delgado: 0.9, medio: 1, media: 1, robusto: 1.25 }[cu.complexion || 'medio'];
  const vestido = arriba.tipo === 'vestido', manga = ['sudadera', 'camisa', 'chamarra', 'saco'].includes(arriba.tipo), pantalon = !vestido && ['pantalon', 'pants'].includes(abajo.tipo);
  const L = C.LINEA, LZ = C.LUZ;
  let q = 1;
  const camino3 = (g, pts, r) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); if (pts.length === 3) { g.arcTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1], r); g.lineTo(pts[2][0], pts[2][1]); } else for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); };
  const extremidad = (g, pts, col, gr, o = {}) => {
    g.lineCap = 'round'; g.lineJoin = 'round';
    camino3(g, pts, gr * 1.3); g.strokeStyle = L; g.lineWidth = gr + 7 * q; g.stroke();
    camino3(g, pts, gr * 1.3); g.strokeStyle = col; g.lineWidth = gr; g.stroke();
    if (o.sombra !== false) { g.save(); g.translate(-LZ[0] * gr * 0.27, -LZ[1] * gr * 0.27); camino3(g, pts, gr * 1.3); g.strokeStyle = frio(col, 0.2); g.lineWidth = gr * 0.44; g.stroke(); g.restore(); }
  };
  const pinta = (g, cam, col, o = {}) => {
    const off = o.off ?? 7;
    g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
    cam(); g.fillStyle = col; g.fill();
    g.save(); cam(); g.clip();
    if (off) { g.fillStyle = frio(col, o.k ?? 0.2); g.fillRect(-900, -900, 1800, 1800); g.save(); g.translate(LZ[0] * off, LZ[1] * off); cam(); g.fillStyle = col; g.fill(); g.restore(); }
    if (o.dentro) o.dentro();
    g.restore();
    if ((o.lw ?? 5) > 0) { cam(); g.lineWidth = (o.lw ?? 5) * q; g.strokeStyle = L; g.stroke(); }
    g.restore();
  };
  const ext = (o, ang, len, lado) => [o[0] + Math.sin(ang * R) * len * lado, o[1] + Math.cos(ang * R) * len];
  const mano = (g, codo, m, lado) => {
    const a = Math.atan2(m[1] - codo[1], m[0] - codo[0]);
    g.save(); g.translate(m[0], m[1]); g.rotate(a);
    pinta(g, () => { g.beginPath(); g.ellipse(-2, -lado * 8.5, 5.5, 4, -lado * 0.5, 0, TAU); }, piel, { off: 0, lw: 3.5 });
    pinta(g, () => { g.beginPath(); g.ellipse(4, 0, 12, 9.5, 0, 0, TAU); }, piel, { off: 3.5, lw: 3.5 });
    g.restore();
  };
  const brazo = (g, hom, a, lado, obj) => {
    let codo, m;
    if (obj) [codo, m] = C.ik2(hom, obj, 66, 58, (p, r2) => (p[1] + p[0] * lado * 0.4 > r2[1] + r2[0] * lado * 0.4 ? p : r2));
    else { codo = ext(hom, a[0], 66, lado); m = ext(codo, a[0] + a[1], 58, lado); }
    if (manga) extremidad(g, [hom, codo, m], arriba.color, 12);
    else {
      extremidad(g, [hom, codo, m], piel, 8);
      if (!vestido || arriba.manga) { const d = Math.hypot(codo[0] - hom[0], codo[1] - hom[1]) || 1, fin = [hom[0] + (codo[0] - hom[0]) / d * 30, hom[1] + (codo[1] - hom[1]) / d * 30]; extremidad(g, [hom, fin], arriba.color, 15, { sombra: false }); }
    }
    if (manga) { const d = Math.hypot(m[0] - codo[0], m[1] - codo[1]) || 1, u = [(m[0] - codo[0]) / d, (m[1] - codo[1]) / d]; g.beginPath(); g.moveTo(m[0] - u[0] * 5 - u[1] * 8, m[1] - u[1] * 5 + u[0] * 8); g.lineTo(m[0] - u[0] * 5 + u[1] * 8, m[1] - u[1] * 5 - u[0] * 8); g.lineWidth = 3 * q; g.strokeStyle = L; g.lineCap = 'round'; g.stroke(); }
    mano(g, codo, m, lado);
  };
  const pie = (g, p, lado, desc, gi) => {
    const dir = Math.abs(gi) > 0.3 ? Math.sign(gi) : lado, largo = Math.abs(gi) > 0.3 ? 21 : 16;
    g.save(); g.translate(p[0], p[1]);
    if (desc) { pinta(g, () => { g.beginPath(); g.ellipse(dir * 5, 2, 12, 7, 0, 0, TAU); }, piel, { off: 3, lw: 3.5 }); g.restore(); return; }
    const cam = () => { g.beginPath(); g.moveTo(-dir * 9, 9); g.lineTo(-dir * 9, -1); g.quadraticCurveTo(-dir * 8, -9, dir * 2, -8); g.quadraticCurveTo(dir * largo, -7, dir * (largo + 3), 3); g.quadraticCurveTo(dir * (largo + 4), 9, dir * (largo - 2), 9); g.closePath(); };
    pinta(g, cam, pies.color, { off: 3.5, lw: 3.5, dentro: () => { g.fillStyle = frio(pies.color, 0.34); g.fillRect(-40, 4.5, 80, 10); } });
    g.restore();
  };
  const pierna = (g, cad, a, lado, p, desc, gi) => {
    const col = pantalon ? abajo.color : piel, gr = pantalon ? 14 : 8; let rod, tob;
    if (p.suelo) { rod = [cad[0] + lado * 42, cad[1] + 22]; tob = [cad[0] + lado * 74, cad[1] + 44]; }
    else if (p.sentado) { rod = [cad[0] + lado * 8 + gi * 40, cad[1] + 16]; tob = ext(rod, a[0], 82 * (a[2] ?? 1), lado); }
    else { rod = ext(cad, a[0], 50, lado); tob = ext(rod, a[0] + a[1], 48, lado); }
    extremidad(g, [cad, rod, tob], col, gr);
    if (pantalon && !desc) { g.beginPath(); g.moveTo(tob[0] - 9, tob[1] - 7); g.lineTo(tob[0] + 9, tob[1] - 7); g.lineWidth = 3 * q; g.strokeStyle = L; g.lineCap = 'round'; g.stroke(); }
    pie(g, tob, lado, desc, gi);
  };
  const peloAtras = (g, r, d, t, gi) => {
    const e = pelo.estilo;
    if (e === 'largo') {
      const m = Math.min(1, Math.hypot(d[0], d[1]) / 70), fl = s => Math.sin(t * 13 + s * 2.1) * m * r * 0.13, fl2 = s => Math.cos(t * 10 + s * 1.3) * m * r * 0.09, des = -gi * r * 0.16;
      const T0 = s => [s * r * 1.08 + d[0] + s * m * r * 0.5 + fl(s) * 2 + des, r * 1.3 + d[1] + fl2(s) * 2];
      const T1 = s => { const p = [s * r * 0.62 + d[0] * 0.92 + fl(s + 3) + des, r * 1.25 + d[1] * 0.92 + fl2(s + 3)], o = T0(s); return [p[0] + (o[0] - p[0]) * m * 0.72, p[1] + (o[1] - p[1]) * m * 0.72]; };
      pinta(g, () => {
        g.beginPath(); g.moveTo(-r * 1.06, 0); g.arc(0, 0, r * 1.06, Math.PI, 0);
        let a = T0(1), b = T1(1);
        g.quadraticCurveTo((r * 1.06 + a[0]) / 2 + r * 0.14 + fl(5), a[1] / 2, a[0], a[1]);
        g.quadraticCurveTo((a[0] + b[0]) / 2 + d[0] * 0.08, (a[1] + b[1]) / 2 + r * 0.16 + d[1] * 0.08, b[0], b[1]);
        g.quadraticCurveTo((r * 0.5 + b[0]) / 2 + fl(7), (r * 0.5 + b[1]) / 2, r * 0.5, r * 0.5);
        g.lineTo(-r * 0.5, r * 0.5);
        a = T0(-1); b = T1(-1);
        g.quadraticCurveTo((-r * 0.5 + b[0]) / 2 + fl(9), (r * 0.5 + b[1]) / 2, b[0], b[1]);
        g.quadraticCurveTo((a[0] + b[0]) / 2 + d[0] * 0.08, (a[1] + b[1]) / 2 + r * 0.16 + d[1] * 0.08, a[0], a[1]);
        g.quadraticCurveTo((-r * 1.06 + a[0]) / 2 - r * 0.14 + fl(11), a[1] / 2, -r * 1.06, 0);
        g.closePath();
      }, pelo.color, { off: 8, k: 0.26 });
    }
    if (e === 'coleta') { const s = Math.abs(gi) > 0.1 ? -Math.sign(gi) : 1; pinta(g, () => { g.beginPath(); g.ellipse(s * r * 0.98 + d[0] * 0.3, -r * 0.3 + d[1] * 0.3, r * 0.3, r * 0.6, s * 0.5, 0, TAU); }, pelo.color, { off: 5, k: 0.26 }); }
    if (e === 'afro') pinta(g, () => { g.beginPath(); for (let i = 0; i < 9; i++) { const a = Math.PI * (1 + i / 8), x = Math.cos(a) * r * 0.95, y = Math.sin(a) * r * 0.9 - r * 0.1; g.moveTo(x + r * 0.42, y); g.arc(x, y, r * 0.42, 0, TAU); } }, pelo.color, { off: 6, k: 0.26, lw: 0 });
  };
  const peloFrente = (g, r, mx, d) => {
    const e = pelo.estilo; if (e === 'calvo') return;
    const cam = () => {
      g.beginPath();
      if (e === 'corto' || e === 'afro') { g.arc(0, -r * 0.02, r * 1.02, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(r * 0.92, -r * 0.18); g.quadraticCurveTo(r * 0.2 + mx, -r * 0.62, -r * 0.35 + mx, -r * 0.38); g.quadraticCurveTo(-r * 0.7, -r * 0.5, -r * 0.98, -r * 0.1); }
      else if (e === 'rizado') { g.arc(0, -r * 0.02, r * 1.04, Math.PI * 1.0, Math.PI * 2.0); for (let i = 0; i <= 4; i++) { const x = r * 0.9 - i * r * 0.45 + mx * 0.4; g.arc(x, -r * 0.3, r * 0.24, 0, Math.PI, false); } }
      else { g.arc(0, -r * 0.08, r * 1.0, Math.PI * 1.08, Math.PI * 1.92); g.quadraticCurveTo(mx * 0.5 + d[0] * 0.06, -r * 0.55 + Math.min(0, d[1]) * 0.07, -r * 0.95, -r * 0.28); }
      g.closePath();
    };
    pinta(g, cam, pelo.color, { off: 6, k: 0.26, dentro: () => { g.beginPath(); g.arc(-r * 0.1 + mx * 0.3, -r * 0.1, r * 0.82, Math.PI * 1.22, Math.PI * 1.45); g.strokeStyle = claro(pelo.color, 0.3); g.lineWidth = r * 0.07; g.lineCap = 'round'; g.stroke(); } });
  };
  const trazoFill = (g, col, lw) => { g.fillStyle = col; g.fill(); g.lineWidth = lw * q; g.strokeStyle = L; g.stroke(); };
  const boca = (g, x, y, c, w, habla) => {
    g.strokeStyle = L; g.lineWidth = 4.5 * q; g.lineCap = 'round'; g.lineJoin = 'round';
    const ab = cl(c.ab + habla * 0.9), f = habla > 0.08 && (c.boca === 'linea' || c.boca === 'sonrisa' || c.boca === 'abajo') ? (c.boca === 'sonrisa' ? 'sonrisa_h' : 'o') : c.boca;
    if (f === 'linea' || (f === 'o' && ab < 0.05)) { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.stroke(); return; }
    if (f === 'sonrisa') { g.beginPath(); g.moveTo(x - w / 2, y - 3); g.quadraticCurveTo(x, y + 10, x + w / 2, y - 3); g.stroke(); return; }
    if (f === 'sonrisa_h') { g.beginPath(); g.moveTo(x - w / 2, y - 3); g.lineTo(x + w / 2, y - 3); g.quadraticCurveTo(x, y + 6 + ab * 20, x - w / 2, y - 3); g.closePath(); trazoFill(g, '#4a1a20', 4.5); return; }
    if (f === 'abajo') { g.beginPath(); g.moveTo(x - w / 2, y + 5); g.quadraticCurveTo(x, y - 8, x + w / 2, y + 5); g.stroke(); return; }
    if (f === 'abajo_abierta') { g.beginPath(); g.moveTo(x - w / 2, y + 8); g.quadraticCurveTo(x, y - 6 - ab * 8, x + w / 2, y + 8); g.closePath(); trazoFill(g, '#4a1a20', 4.5); return; }
    if (f === 'dientes') { C.rr(g, x - w * 0.55, y - 7, w * 1.1, 15, 6); trazoFill(g, '#fff', 4); g.beginPath(); for (const k of [-0.2, 0.2]) { g.moveTo(x + w * k, y - 7); g.lineTo(x + w * k, y + 8); } g.moveTo(x - w * 0.55, y); g.lineTo(x + w * 0.55, y); g.lineWidth = 2.5 * q; g.stroke(); return; }
    if (f === 'grito') {
      const bw = w * (0.72 + ab * 0.22), bh = w * (0.5 + ab * 0.55);
      g.save(); g.beginPath(); g.ellipse(x, y + bh * 0.45, bw, bh, 0, 0, TAU); g.fillStyle = '#4a1a20'; g.fill(); g.clip();
      g.fillStyle = '#fff'; g.fillRect(x - bw, y + bh * 0.45 - bh, bw * 2, bh * 0.34);
      g.beginPath(); g.ellipse(x, y + bh * 1.35, bw * 0.75, bh * 0.5, 0, 0, TAU); g.fillStyle = '#d96b72'; g.fill(); g.restore();
      g.beginPath(); g.ellipse(x, y + bh * 0.45, bw, bh, 0, 0, TAU); g.lineWidth = 4.5 * q; g.strokeStyle = L; g.stroke(); return;
    }
    g.beginPath(); g.ellipse(x, y + 3, w * (0.16 + ab * 0.1), w * (0.18 + ab * 0.22), 0, 0, TAU); trazoFill(g, '#4a1a20', 4.5);
  };
  const parpadeo = t => {
    const T = t + semilla * 0.37, n = Math.floor(T / 0.9); let b = 0;
    for (const i of [n - 1, n]) if (hash(i * 3.1 + semilla) < 0.3) {
      const t0 = i * 0.9 + hash(i * 7.7 + semilla) * 0.6;
      for (const dd of (hash(i * 1.3 + semilla) < 0.2 ? [0, 0.26] : [0])) { const ph = (T - t0 - dd) / 0.14; if (ph > 0 && ph < 1) b = Math.max(b, Math.sin(ph * Math.PI)); }
    }
    return b;
  };
  const oreja = (g, x, r) => pinta(g, () => { g.beginPath(); g.ellipse(x, r * 0.1, r * 0.13, r * 0.19, 0, 0, TAU); }, piel, { off: 2, lw: 4, dentro: () => { g.beginPath(); g.arc(x, r * 0.1, r * 0.07, 0.6, 3.6); g.strokeStyle = frio(piel, 0.3); g.lineWidth = 2.5 * q; g.stroke(); } });
  const cabeza = (g, cen, ang, c, e, mira, d, gi) => {
    const r = R0, t = e.t || 0, ag = Math.abs(gi), sg = gi < 0 ? -1 : 1;
    g.save(); g.translate(cen[0], cen[1]); g.rotate(ang * R);
    peloAtras(g, r, d, t, gi);
    const orejas = pelo.estilo !== 'largo';
    const xo = -sg * r * (0.97 - 0.36 * Math.pow(ag, 2.5)), fuera = Math.abs(xo) > r * 0.84;
    if (orejas && ag <= 0.12) for (const s of [-1, 1]) oreja(g, s * r * 0.97, r);
    else if (orejas && fuera) oreja(g, xo, r);
    if (ag > 0.55) { const u = (ag - 0.55) / 0.45; pinta(g, () => { g.beginPath(); g.ellipse(sg * r * (0.86 + 0.14 * u), r * 0.2, r * 0.17, r * 0.12, sg * 0.25, 0, TAU); }, piel, { off: 0, lw: 5 }); }
    pinta(g, () => { g.beginPath(); g.ellipse(0, 0, r, r * 0.95, 0, 0, TAU); }, piel, { off: r * 0.11, k: 0.16 });
    if (orejas && ag > 0.12 && !fuera) oreja(g, xo, r);
    const viv = e.vivo === false ? [0, 0] : [C.dardos(t, semilla, 1.7) * 0.07, C.dardos(t, semilla + 9, 2.3) * 0.04];
    const mr = [mira[0] + viv[0], (mira[1] || 0) + viv[1]], mx = mr[0] * r * 0.16 + gi * r * 0.4, my = mr[1] * r * 0.07;
    const bl = e.sinParpadeo ? 0 : parpadeo(t), oh = c.ojoH * (1 - bl);
    for (const s of [-1, 1]) { if (s === sg && ag > 0.45) continue; g.beginPath(); g.ellipse(s * r * 0.55 * (1 - 0.4 * ag) + mx * 0.85, r * 0.36 + my, r * 0.14, r * 0.085, 0, 0, TAU); g.fillStyle = `rgba(230,120,120,${c.rubor})`; g.fill(); }
    if (c.sucio) { g.save(); g.globalAlpha = c.sucio; g.fillStyle = '#6b4a2f'; for (const [x, y, w] of [[-r * 0.45, r * 0.5, 6], [r * 0.62, r * 0.12, 4.5], [-r * 0.18, -r * 0.48, 5]]) { g.beginPath(); g.arc(x + mx * 0.5, y, w, 0, TAU); g.fill(); } g.restore(); }
    const ex = r * 0.31, ey = r * 0.05 + my, erx0 = r * 0.105 * (cu.ojos || 1), ery = r * 0.15 * (cu.ojos || 1), pl = cl(c.plato || 0), ojos = [];
    for (const s of [-1, 1]) {
      const lejos = s === sg && ag > 0.04; if (lejos && ag > 0.86) continue;
      const kx = lejos ? 1 - 0.55 * ag : 1, x = lejos ? mx + sg * ex * (1 - 0.55 * ag) : mx - sg * ex * (1 - 0.9 * ag) * (ag > 0.04 ? 1 : -s * sg), erx = erx0 * kx;
      ojos.push([x, erx]);
      if (oh < 0.08) { g.beginPath(); if (c.boca === 'dientes') { g.moveTo(x - s * erx * 1.3, ey - ery * 0.5); g.lineTo(x + s * erx * 0.9, ey); g.lineTo(x - s * erx * 1.3, ey + ery * 0.5); } else { g.moveTo(x - erx * 1.1, ey); g.quadraticCurveTo(x, ey + ery * 0.55, x + erx * 1.1, ey); } g.lineWidth = 4 * q; g.strokeStyle = L; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
      else {
        if (pl > 0.02) { g.beginPath(); g.ellipse(x, ey, erx * (1 + pl * 1.05), ery * oh * (1 + pl * 0.75), 0, 0, TAU); trazoFill(g, '#fff', 3.5); }
        const k = 1 - pl * 0.42, px = x + mr[0] * erx * (0.35 + pl * 0.7), py = ey + mr[1] * ery * (0.3 + pl * 0.6);
        g.beginPath(); g.ellipse(px, py, erx * k, ery * oh * k, 0, 0, TAU); g.fillStyle = L; g.fill();
        g.beginPath(); g.arc(px + erx * 0.35 * k, py - ery * 0.35 * oh * k, erx * 0.32 * k, 0, TAU); g.fillStyle = '#fff'; g.fill();
      }
      const cj = (s < 0 ? c.cejI : c.cejD) ?? c.cej, y1 = ey - ery * (1.55 + pl * 0.75) - c.cejY, lev = Math.sin(cj * R) * erx0 * 1.6, inn = -s;
      g.beginPath(); g.moveTo(x - inn * erx * 1.25, y1 + lev * 0.25); g.lineTo(x + inn * erx * 1.25, y1 - lev); g.lineWidth = 4.5 * q; g.strokeStyle = L; g.lineCap = 'round'; g.stroke();
    }
    if (e.lentes) { g.lineWidth = 3.5 * q; g.strokeStyle = L; for (const [x, erx] of ojos) { g.beginPath(); g.ellipse(x, ey, erx * 2.3, erx0 * 2.3, 0, 0, TAU); g.fillStyle = 'rgba(220,240,255,0.18)'; g.fill(); g.stroke(); } if (ojos.length === 2) { const [a, b] = ojos[0][0] < ojos[1][0] ? ojos : [ojos[1], ojos[0]]; g.beginPath(); g.moveTo(a[0] + a[1] * 2.3, ey); g.lineTo(b[0] - b[1] * 2.3, ey); g.stroke(); } }
    if (ag <= 0.75) { g.beginPath(); if (ag < 0.08) { g.moveTo(mx - r * 0.045, r * 0.25 + my); g.quadraticCurveTo(mx, r * 0.3 + my, mx + r * 0.045, r * 0.25 + my); } else { g.moveTo(mx + sg * r * 0.02, r * 0.1 + my); g.quadraticCurveTo(mx + sg * r * (0.06 + 0.16 * ag), r * 0.22 + my, mx + sg * r * (0.05 + 0.14 * ag), r * 0.27 + my); g.lineTo(mx + sg * r * 0.01, r * 0.29 + my); } g.lineWidth = 3.2 * q; g.strokeStyle = frio(piel, 0.42); g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
    boca(g, mx * 0.88 + (ag > 0.5 ? sg * r * 0.06 : 0), r * 0.52 + my, c, r * 0.34 * (1 - 0.42 * ag), e.habla || 0);
    if (rec.bigote) { g.beginPath(); g.moveTo(mx * 0.88 - r * 0.2 * (1 - 0.4 * ag), r * 0.42 + my); g.quadraticCurveTo(mx * 0.88, r * 0.34 + my, mx * 0.88 + r * 0.2 * (1 - 0.4 * ag), r * 0.42 + my); g.lineWidth = r * 0.085; g.strokeStyle = rec.bigote; g.lineCap = 'round'; g.stroke(); }
    peloFrente(g, r, mr[0] * r * 0.16 + gi * r * 0.26, d);
    if (rec.gorra) { pinta(g, () => { g.beginPath(); g.arc(0, -r * 0.2, r * 1.04, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); }, rec.gorra, { off: 6 }); const s = ag > 0.15 ? sg : 1; pinta(g, () => { g.beginPath(); g.ellipse(s * r * (0.35 + 0.5 * ag), -r * 0.36, r * (0.86 - 0.2 * ag), r * 0.13, 0, 0, TAU); }, rec.gorraVisera || rec.gorra, { off: 3 }); }
    g.restore();
  };
  const torso = (g, ox, hs, fa, wk, cen) => {
    const w = 35 * ancho * wk, wb = (vestido ? 56 : 40) * ancho * wk, yb = vestido ? -88 : -96, f = fa || [0, 0], en = Math.abs(f[1]) * 0.25;
    if (pantalon) pinta(g, () => { C.rr(g, -wb + 3, -108, wb * 2 - 6, 30, 9); }, abajo.color, { off: 4 });
    if (!vestido && abajo.tipo === 'falda') pinta(g, () => { g.beginPath(); g.moveTo(-36 * ancho * wk, -104); g.lineTo(36 * ancho * wk, -104); g.lineTo(48 * ancho * wk, -62); g.lineTo(-48 * ancho * wk, -62); g.closePath(); }, abajo.color, { off: 6 });
    if (!vestido && abajo.tipo === 'short') pinta(g, () => { C.rr(g, -wb, -108, wb * 2, 44, 8); }, abajo.color, { off: 5 });
    const cam = () => { g.beginPath(); g.moveTo(-w + ox, -221 - hs); g.quadraticCurveTo(ox, -236 - hs, w + ox, -221 - hs); g.quadraticCurveTo(w + ox + 6, -160, wb + en + f[0], yb + f[1]); g.quadraticCurveTo(f[0] * 0.5, yb + 10 + f[1] * 0.4, -wb - en + f[0], yb + f[1] * 0.8); g.quadraticCurveTo(-w + ox - 6, -160, -w + ox, -221 - hs); g.closePath(); };
    pinta(g, cam, arriba.color, { off: 8, dentro: () => {
      g.beginPath(); g.ellipse(cen[0] + 5, -224 - hs, R0 * 0.72, 17, 0, 0, TAU); g.fillStyle = 'rgba(22,16,44,0.2)'; g.fill();
      g.strokeStyle = frio(arriba.color, 0.34); g.lineWidth = 3 * q; g.lineCap = 'round';
      if (arriba.tipo === 'sudadera') { C.rr(g, -22 * wk + ox * 0.3, -150, 44 * wk, 30, 8); g.stroke(); g.beginPath(); for (const s of [-1, 1]) { g.moveTo(ox + s * 7, -224 - hs); g.lineTo(ox + s * 8, -196 - hs); } g.stroke(); }
      if (vestido) { g.beginPath(); g.moveTo(-w * 0.95 + ox * 0.6, -152); g.quadraticCurveTo(ox * 0.6, -142, w * 0.95 + ox * 0.6, -152); g.stroke(); }
      if (!vestido) { g.beginPath(); g.moveTo(-wb + 4, yb - 8); g.quadraticCurveTo(0, yb, wb - 4, yb - 8); g.stroke(); }
    } });
    g.strokeStyle = L; g.lineWidth = 3 * q; g.lineCap = 'round'; g.lineJoin = 'round';
    if (arriba.tipo === 'camisa' || arriba.tipo === 'saco') { g.beginPath(); g.moveTo(-13 * wk + ox, -231 - hs); g.lineTo(ox, -210 - hs); g.lineTo(13 * wk + ox, -231 - hs); g.moveTo(ox, -210 - hs); g.lineTo(ox * 0.2, yb + 4); g.stroke(); g.fillStyle = L; for (const y of [-188, -160, -132]) { g.beginPath(); g.arc(ox * 0.6 + 6 * wk, y, 2.6 * q, 0, TAU); g.fill(); } }
    else { g.beginPath(); g.moveTo(-15 * wk + ox, -230 - hs); g.quadraticCurveTo(ox, -214 - hs, 15 * wk + ox, -230 - hs); g.stroke(); }
  };
  return {
    rec, esc, R0, v: 3,
    dibujar(g, e) {
      const t = e.t || 0, p = { tor: 0, cab: 0, bi: [10, 6], bd: [10, 6], pi: [4, 0], pd: [4, 0], ...(e.pose || {}) };
      const c = C.cara2(e.cara || 'neutral'), k = esc * (e.escala ?? 1), mira = Array.isArray(e.mira) ? e.mira : [e.mira || 0, 0];
      const gi = cl(e.giro ?? 0, -1, 1), ag = Math.abs(gi), sg = gi < 0 ? -1 : 1, wk = 1 - 0.3 * ag;
      const resp = Math.sin(t * TAU / 3.6 + semilla), hs = (p.hombros || 0) + resp * 2.6;
      g.save(); g.translate(e.x, e.y);
      if (e.sombra !== false && !e.enObjeto) { g.save(); g.scale(k, k * 0.16); const gr = g.createRadialGradient(0, 0, 14, 0, 0, 96); gr.addColorStop(0, 'rgba(18,14,34,0.3)'); gr.addColorStop(1, 'rgba(18,14,34,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 96, 0, TAU); g.fill(); g.restore(); }
      g.scale(k, k); g.translate(p.dx || 0, (p.suelo ? 92 : 0) + (p.dy || 0));
      q = C.grosor(g);
      const cad = [0, -100], desc = e.descalzo ?? pies.descalzo, ox = Math.sin((p.tor || 0) * R) * 112, sep = 18 * ancho * wk;
      const hy = -210 - hs, hi = [(-33 * ancho - 2) * wk + ox, hy], hd = [(33 * ancho + 2) * wk + ox, hy];
      const lejos = ag > 0.35 ? sg : 0, atras = e.brazosAtras;
      const dib = { i: () => brazo(g, hi, p.bi, -1, e.manoI), d: () => brazo(g, hd, p.bd, 1, e.manoD) };
      const orden = sg > 0 ? [[cad[0] + sep, p.pd, 1, 'd'], [cad[0] - sep, p.pi, -1, 'i']] : [[cad[0] - sep, p.pi, -1, 'i'], [cad[0] + sep, p.pd, 1, 'd']];
      for (const [x, a, lado, n] of (ag > 0.35 ? orden : orden.slice().reverse())) pierna(g, [x, cad[1]], a, lado, p, desc === n || desc === 'ambos', gi);
      if (lejos) dib[lejos > 0 ? 'd' : 'i']();
      const ca = (p.tor || 0) + (p.cab || 0), base = [ox * 1.06, -226 - hs * 0.8];
      const cen = [base[0] + Math.sin(ca * R) * R0 * 0.9 + (p.cabDx || 0) + gi * 6, base[1] - 10 - R0 * 0.86 + resp * 0.8 + (p.cabDy || 0)];
      torso(g, ox, hs * 0.7, e.falda, wk, cen);
      extremidad(g, [[base[0], base[1] + 8], [cen[0] * 0.5 + base[0] * 0.5, cen[1] + R0 * 0.5]], piel, 19 * (nino ? 0.85 : 1), { sombra: false });
      g.save(); g.beginPath(); g.moveTo(base[0], base[1] - 2); g.lineTo(cen[0] * 0.5 + base[0] * 0.5, cen[1] + R0 * 0.5); g.strokeStyle = frio(piel, 0.24); g.lineWidth = 19 * (nino ? 0.85 : 1); g.lineCap = 'butt'; g.stroke(); g.restore();
      if (atras) { if (lejos <= 0) dib.d(); if (lejos >= 0) dib.i(); }
      cabeza(g, cen, ca, c, e, mira, e.pelo || [0, 0], gi);
      if (!atras) { if (lejos <= 0) dib.d(); if (lejos >= 0) dib.i(); }
      g.restore();
    }
  };
};
})();
