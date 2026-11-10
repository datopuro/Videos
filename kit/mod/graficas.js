(function () {
const K = window.K;
const TEMAS = {
  oscuro: { texto: '#f4f1ea', tenue: 'rgba(244,241,234,0.62)', linea: 'rgba(244,241,234,0.22)', panel: 'rgba(12,14,22,0.78)', borde: 'rgba(244,241,234,0.18)', acento: '#ffd23f', mal: '#ff5d5d', bien: '#3ddc97', apagado: 'rgba(244,241,234,0.2)', sombra: 10 },
  papel: { texto: '#1d1b18', tenue: 'rgba(29,27,24,0.62)', linea: 'rgba(29,27,24,0.2)', panel: '#f7f3ea', borde: '#1d1b18', acento: '#e4572e', mal: '#e4572e', bien: '#2a9d6f', apagado: 'rgba(29,27,24,0.16)', sombra: 0 }
};
const F = '"Inter Display", Inter, sans-serif';

K.graf = (g, tema = 'oscuro', cambios = {}) => {
  const C = Object.assign({}, TEMAS[tema] || TEMAS.oscuro, cambios), G = { C };
  const tx = G.txt = (s, x, y, fs, col = C.texto, a = 1, peso = 800, al = 'center') => K.txt(g, s, x, y, fs, col, a, peso, al, F, C.sombra);
  const num = G.num = (v, dec = 0) => v.toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2))); };

  G.panel = (x, y, w, h, a = 1, r = 28) => { if (a <= 0.01) return; g.save(); g.globalAlpha = K.clamp(a); rr(x, y, w, h, r); g.fillStyle = C.panel; g.fill(); g.lineWidth = tema === 'papel' ? 5 : 2; g.strokeStyle = C.borde; g.stroke(); g.restore(); };

  G.contador = (valor, x, y, fs, u, o = {}) => {
    u = K.clamp(u); if (u <= 0) return; const v = (o.desde ?? 0) + (valor - (o.desde ?? 0)) * K.easeOut(u);
    const s = (o.pre ?? '') + num(v, o.dec ?? 0) + (o.suf ?? ''); const k = u < 1 ? 1 : 1 + 0.0 * u;
    tx(s, x, y, fs * k, o.color ?? C.acento, K.clamp(u * 4), 900, o.al ?? 'center');
    if (o.etiqueta) tx(o.etiqueta, x, y + fs * 0.42, fs * 0.26, C.tenue, K.clamp(u * 3), 700, o.al ?? 'center');
  };

  G.barras = (datos, x, y, w, h, u, o = {}) => {
    u = K.clamp(u); if (u <= 0) return; const n = datos.length, max = o.max ?? Math.max(...datos.map(d => d.v)) * 1.08, sep = o.sep ?? 0.32;
    if (o.horizontal) {
      const fh = h / n, bh = fh * (1 - sep), ex = o.anchoEtiqueta ?? w * 0.3;
      datos.forEach((d, i) => {
        const ui = K.easeOut((u * (1 + 0.12 * n) - i * 0.12)), yy = y + i * fh + (fh - bh) / 2, bw = (w - ex - (o.valores === false ? 0 : (o.reserva ?? bh * 3.2))) * d.v / max * ui, col = d.color ?? (d.destacar || !datos.some(q => q.destacar) ? C.acento : C.tenue);
        tx(d.e, x + ex - 18, yy + bh * 0.68, o.fs ?? bh * 0.5, d.destacar ? C.texto : C.tenue, K.clamp(u * 4), 700, 'right');
        g.save(); g.globalAlpha = 1; rr(x + ex, yy, Math.max(2, bw), bh, bh * 0.22); g.fillStyle = col; g.fill(); g.restore();
        if (o.valores !== false) tx((o.pre ?? '') + num(d.v * ui, o.dec ?? 0) + (o.suf ?? ''), x + ex + bw + 14, yy + bh * 0.7, o.fs ?? bh * 0.52, d.destacar ? C.texto : C.tenue, K.clamp(ui * 3), 800, 'left');
      });
      return;
    }
    const fw = w / n, bw = fw * (1 - sep), base = y + h;
    g.save(); g.strokeStyle = C.linea; g.lineWidth = 3; g.beginPath(); g.moveTo(x, base); g.lineTo(x + w, base); g.stroke(); g.restore();
    const hayDest = datos.some(q => q.destacar);
    datos.forEach((d, i) => {
      const ui = K.easeOut((u * (1 + 0.12 * n) - i * 0.12)), bh = h * d.v / max * ui, xx = x + i * fw + (fw - bw) / 2, col = d.color ?? (!hayDest || d.destacar ? C.acento : C.tenue);
      g.save(); rr(xx, base - bh, bw, Math.max(2, bh), Math.min(14, bw * 0.15)); g.fillStyle = col; g.fill(); g.restore();
      const fs = o.fs ?? Math.min(44, bw * 0.34);
      if (o.valores !== false) tx((o.pre ?? '') + num(d.v * ui, o.dec ?? 0) + (o.suf ?? ''), xx + bw / 2, base - bh - fs * 0.4, fs, d.destacar || !hayDest ? C.texto : C.tenue, K.clamp(ui * 3), 800);
      String(d.e).split('\n').forEach((l, k) => tx(l, xx + bw / 2, base + fs * 1.05 + k * fs * 0.95, fs * 0.82, d.destacar ? C.texto : C.tenue, K.clamp(u * 4), 700));
    });
  };

  G.linea = (pts, x, y, w, h, u, o = {}) => {
    u = K.clamp(u); if (u <= 0) return; const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x0 = o.x0 ?? Math.min(...xs), x1 = o.x1 ?? Math.max(...xs), y0 = o.y0 ?? Math.min(0, ...ys), y1 = o.y1 ?? Math.max(...ys) * 1.1;
    const X = v => x + (v - x0) / (x1 - x0) * w, Y = v => y + h - (v - y0) / (y1 - y0) * h;
    g.save(); g.strokeStyle = C.linea; g.lineWidth = 2; g.font = `600 ${o.fs ?? 26}px ${F}`; g.fillStyle = C.tenue;
    (o.marcasY ?? []).forEach(v => { g.beginPath(); g.moveTo(x, Y(v)); g.lineTo(x + w, Y(v)); g.stroke(); g.textAlign = 'right'; g.fillText((o.pre ?? '') + num(v, o.dec ?? 0) + (o.suf ?? ''), x - 12, Y(v) + 9); });
    (o.marcasX ?? []).forEach(v => { g.textAlign = 'center'; g.fillText(String(v), X(v), y + h + 38); });
    g.lineWidth = 3; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w, y + h); g.stroke();
    const m = (pts.length - 1) * K.ease(u), n = Math.floor(m), f = m - n, P = pts.slice(0, n + 1).map(p => [X(p[0]), Y(p[1])]);
    if (n < pts.length - 1) P.push([K.lerp(X(pts[n][0]), X(pts[n + 1][0]), f), K.lerp(Y(pts[n][1]), Y(pts[n + 1][1]), f)]);
    if (o.relleno !== false) { g.beginPath(); g.moveTo(P[0][0], y + h); P.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(P[P.length - 1][0], y + h); g.closePath(); g.globalAlpha = 0.16; g.fillStyle = o.color ?? C.acento; g.fill(); g.globalAlpha = 1; }
    g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.strokeStyle = o.color ?? C.acento; g.lineWidth = o.grosor ?? 8; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
    const fin = P[P.length - 1]; g.beginPath(); g.arc(fin[0], fin[1], 13, 0, 7); g.fillStyle = o.color ?? C.acento; g.fill(); g.restore();
    return { X, Y, punta: fin };
  };

  G.dona = (frac, x, y, r, u, o = {}) => {
    u = K.clamp(u); if (u <= 0) return; const gr = o.grosor ?? r * 0.32, a0 = -Math.PI / 2;
    g.save(); g.lineWidth = gr; g.lineCap = 'butt'; g.strokeStyle = C.apagado; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    g.strokeStyle = o.color ?? C.acento; g.beginPath(); g.arc(x, y, r, a0, a0 + Math.PI * 2 * frac * K.easeOut(u)); g.stroke(); g.restore();
    if (o.texto) tx(o.texto, x, y + r * 0.16, r * 0.42, C.texto, K.clamp(u * 3), 900);
  };

  const ICONOS = {
    persona: (s) => { g.beginPath(); g.arc(0, -s * 0.33, s * 0.17, 0, 7); g.fill(); rr(-s * 0.2, -s * 0.12, s * 0.4, s * 0.6, s * 0.16); g.fill(); },
    punto: (s) => { g.beginPath(); g.arc(0, 0, s * 0.36, 0, 7); g.fill(); },
    cuadro: (s) => { rr(-s * 0.36, -s * 0.36, s * 0.72, s * 0.72, s * 0.12); g.fill(); },
    casa: (s) => { g.beginPath(); g.moveTo(-s * 0.46, -s * 0.04); g.lineTo(0, -s * 0.46); g.lineTo(s * 0.46, -s * 0.04); g.closePath(); g.fill(); g.fillRect(-s * 0.32, -s * 0.06, s * 0.64, s * 0.5); },
    rayo: (s) => { g.beginPath(); [[0.1, -0.5], [-0.3, 0.06], [-0.02, 0.06], [-0.12, 0.5], [0.32, -0.12], [0.04, -0.12]].forEach(([a, b], i) => i ? g.lineTo(a * s, b * s) : g.moveTo(a * s, b * s)); g.closePath(); g.fill(); },
    gota: (s) => { g.beginPath(); g.moveTo(0, -s * 0.48); g.bezierCurveTo(s * 0.5, s * 0.05, s * 0.34, s * 0.46, 0, s * 0.46); g.bezierCurveTo(-s * 0.34, s * 0.46, -s * 0.5, s * 0.05, 0, -s * 0.48); g.fill(); },
    moneda: (s) => { g.beginPath(); g.arc(0, 0, s * 0.42, 0, 7); g.fill(); g.save(); g.globalCompositeOperation = 'destination-out'; g.font = `900 ${s * 0.5}px ${F}`; g.textAlign = 'center'; g.fillText('$', 0, s * 0.18); g.restore(); },
    reloj: (s) => { g.lineWidth = s * 0.1; g.beginPath(); g.arc(0, 0, s * 0.38, 0, 7); g.stroke(); g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -s * 0.22); g.lineTo(0, 0); g.lineTo(s * 0.16, s * 0.08); g.stroke(); },
    coche: (s) => { rr(-s * 0.48, -s * 0.06, s * 0.96, s * 0.28, s * 0.1); g.fill(); g.beginPath(); g.moveTo(-s * 0.3, -s * 0.04); g.lineTo(-s * 0.18, -s * 0.3); g.lineTo(s * 0.2, -s * 0.3); g.lineTo(s * 0.34, -s * 0.04); g.closePath(); g.fill(); g.beginPath(); g.arc(-s * 0.26, s * 0.24, s * 0.12, 0, 7); g.arc(s * 0.26, s * 0.24, s * 0.12, 0, 7); g.fill(); },
    foco: (s) => { g.beginPath(); g.arc(0, -s * 0.12, s * 0.32, 0, 7); g.fill(); rr(-s * 0.15, s * 0.16, s * 0.3, s * 0.3, s * 0.06); g.fill(); },
    celular: (s) => { rr(-s * 0.24, -s * 0.46, s * 0.48, s * 0.92, s * 0.09); g.fill(); g.save(); g.globalCompositeOperation = 'destination-out'; g.fillRect(-s * 0.17, -s * 0.36, s * 0.34, s * 0.64); g.restore(); },
    bateria: (s) => { rr(-s * 0.44, -s * 0.22, s * 0.8, s * 0.44, s * 0.08); g.fill(); g.fillRect(s * 0.36, -s * 0.09, s * 0.1, s * 0.18); },
    enchufe: (s) => { rr(-s * 0.28, -s * 0.16, s * 0.56, s * 0.4, s * 0.1); g.fill(); g.fillRect(-s * 0.17, -s * 0.46, s * 0.09, s * 0.32); g.fillRect(s * 0.08, -s * 0.46, s * 0.09, s * 0.32); g.fillRect(-s * 0.05, s * 0.2, s * 0.1, s * 0.28); },
    termometro: (s) => { rr(-s * 0.09, -s * 0.48, s * 0.18, s * 0.7, s * 0.09); g.fill(); g.beginPath(); g.arc(0, s * 0.3, s * 0.2, 0, 7); g.fill(); },
    check: (s) => { g.lineWidth = s * 0.16; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-s * 0.34, 0); g.lineTo(-s * 0.1, s * 0.26); g.lineTo(s * 0.36, -s * 0.28); g.stroke(); },
    cruz: (s) => { g.lineWidth = s * 0.16; g.lineCap = 'round'; g.beginPath(); g.moveTo(-s * 0.3, -s * 0.3); g.lineTo(s * 0.3, s * 0.3); g.moveTo(s * 0.3, -s * 0.3); g.lineTo(-s * 0.3, s * 0.3); g.stroke(); },
    flecha: (s) => { g.lineWidth = s * 0.14; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-s * 0.4, 0); g.lineTo(s * 0.36, 0); g.moveTo(s * 0.1, -s * 0.26); g.lineTo(s * 0.38, 0); g.lineTo(s * 0.1, s * 0.26); g.stroke(); }
  };
  G.ICONOS = ICONOS;
  G.icono = (nombre, x, y, s, color = C.texto, a = 1, rot = 0) => {
    if (a <= 0.01) return; const f = typeof nombre === 'function' ? nombre : ICONOS[nombre]; if (!f) throw new Error('icono desconocido: ' + nombre + '. Hay: ' + Object.keys(ICONOS).join(', '));
    const c = K.lienzo(Math.ceil(s * 1.2), Math.ceil(s * 1.2)), q = c.getContext('2d'), g0 = g; g = q; q.translate(s * 0.6, s * 0.6); q.fillStyle = color; q.strokeStyle = color; f(s); g = g0;
    g.save(); g.globalAlpha = K.clamp(a); g.translate(x, y); g.rotate(rot); g.drawImage(c, -s * 0.6, -s * 0.6); g.restore();
  };

  G.deCada = (n, total, x, y, w, u, o = {}) => {
    u = K.clamp(u); if (u <= 0) return 0; const cols = o.cols ?? (total <= 10 ? total : 10), filas = Math.ceil(total / cols), cel = w / cols, s = cel * (o.escala ?? 0.9);
    for (let i = 0; i < total; i++) {
      const ui = K.easeBack((u * 1.6 * (1 + total * 0.03) - i * 0.03 * 1.6) / 0.5), on = i < n && u > 0.55 + 0.3 * i / total;
      G.icono(o.icono ?? 'persona', x + (i % cols + 0.5) * cel, y + (Math.floor(i / cols) + 0.5) * cel * (o.alto ?? 1.15), s * Math.max(0.01, ui) * (on ? 1.08 : 1), on ? (o.color ?? C.acento) : C.apagado, K.clamp(ui * 2));
    }
    const hh = filas * cel * (o.alto ?? 1.15);
    if (o.texto !== false) tx(o.texto ?? `${n} de cada ${total}`, x + w / 2, y + hh + (o.fs ?? 64) * 1.15, o.fs ?? 64, C.texto, K.ap(u, 0.6, 0.3), 900);
    return hh;
  };

  G.versus = (izq, der, y, u, o = {}) => {
    u = K.clamp(u); if (u <= 0) return; const W = K.W, m = o.margen ?? 60, cw = (W - m * 3) / 2, h = o.alto ?? 420, fs = o.fs ?? 110;
    [[izq, m, -1, 0], [der, m * 2 + cw, 1, 0.18]].forEach(([d, x, lado, ret]) => {
      const ui = K.easeOut((u - ret) / 0.5); if (ui <= 0) return; const xx = x + lado * (1 - ui) * 80;
      G.panel(xx, y, cw, h, ui);
      tx(d.titulo, xx + cw / 2, y + 66, 38, C.tenue, ui, 800);
      if (d.icono) G.icono(d.icono, xx + cw / 2, y + 150, 110, d.color ?? C.texto, ui);
      tx(d.valor, xx + cw / 2, y + h - 110, d.fs ?? fs, d.color ?? C.texto, ui, 900);
      if (d.nota) tx(d.nota, xx + cw / 2, y + h - 48, 32, C.tenue, ui, 700);
    });
    if (o.vs !== false) { const a = K.ap(u, 0.5, 0.25); g.save(); g.globalAlpha = K.clamp(a); g.beginPath(); g.arc(W / 2, y + h / 2, 46 * K.easeBack(a), 0, 7); g.fillStyle = C.acento; g.fill(); g.restore(); K.txt(g, o.vs ?? 'vs', W / 2, y + h / 2 + 13, 38, '#111', a, 900, 'center', F, 0); }
  };

  G.cita = (texto, fuente, x, y, w, a, o = {}) => {
    if (a <= 0.01) return 0; const fs = o.fs ?? 50; g.save(); g.font = `700 ${fs}px ${F}`; const ls = []; let l = '';
    for (const p of texto.split(' ')) { const q = l ? l + ' ' + p : p; if (g.measureText(q).width > w - 110 && l) { ls.push(l); l = p; } else l = q; } if (l) ls.push(l); g.restore();
    const h = ls.length * fs * 1.28 + 150, e = K.easeOut(a), yy = y + (1 - e) * 30;
    G.panel(x, yy, w, h, a); g.save(); g.globalAlpha = K.clamp(a); g.fillStyle = C.acento; g.fillRect(x + 34, yy + 44, 8, h - 138); g.restore();
    ls.forEach((q, i) => tx(q, x + 68, yy + 44 + fs + i * fs * 1.28, fs, C.texto, a, 700, 'left'));
    tx('FUENTE · ' + fuente, x + 68, yy + h - 40, 28, C.tenue, a, 800, 'left');
    return h;
  };
  G.fuente = (texto, a, y = K.H - 250) => { if (a <= 0.01) return; g.save(); g.font = `700 26px ${F}`; const w = g.measureText('FUENTE · ' + texto).width + 44; g.globalAlpha = K.clamp(a) * 0.92; rr(K.W / 2 - w / 2, y - 34, w, 50, 25); g.fillStyle = C.panel; g.fill(); g.restore(); K.txt(g, 'FUENTE · ' + texto, K.W / 2, y, 26, C.tenue, a, 700, 'center', F, 0); };

  G.medidor = (frac, x, y, r, u, o = {}) => {
    u = K.clamp(u); if (u <= 0) return; const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, f = K.clamp(frac) * K.easeOut(u);
    g.save(); g.lineWidth = r * 0.16; g.lineCap = 'round'; g.strokeStyle = C.apagado; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke();
    g.strokeStyle = o.color ?? (frac > 0.66 ? C.mal : frac > 0.33 ? C.acento : C.bien); g.beginPath(); g.arc(x, y, r, a0, a0 + (a1 - a0) * f + 0.001); g.stroke();
    const an = a0 + (a1 - a0) * f; g.strokeStyle = C.texto; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * r * 0.78, y + Math.sin(an) * r * 0.78); g.stroke(); g.beginPath(); g.arc(x, y, r * 0.08, 0, 7); g.fillStyle = C.texto; g.fill(); g.restore();
    if (o.texto) tx(o.texto, x, y + r * 0.62, r * 0.24, C.tenue, K.clamp(u * 3), 800);
  };

  G.linea_tiempo = (hitos, x, y, w, u, o = {}) => {
    u = K.clamp(u); if (u <= 0) return; const n = hitos.length;
    g.save(); g.strokeStyle = C.linea; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * K.easeOut(u * 1.5), y); g.stroke(); g.restore();
    hitos.forEach((d, i) => { const ui = K.easeBack((u * (n + 1) - i - 0.3) / 0.9), xx = x + w * (n === 1 ? 0.5 : i / (n - 1)); if (ui <= 0) return;
      g.save(); g.beginPath(); g.arc(xx, y, 17 * ui, 0, 7); g.fillStyle = d.destacar ? C.acento : C.texto; g.fill(); g.restore();
      tx(d.e, xx, y - 40, o.fs ?? 44, d.destacar ? C.acento : C.texto, K.clamp(ui), 900); if (d.nota) String(d.nota).split('\n').forEach((l, k) => tx(l, xx, y + 62 + k * 34, 29, C.tenue, K.clamp(ui), 700)); });
  };
  return G;
};
})();
