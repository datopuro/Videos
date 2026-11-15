/* Circuitos animados: esquema dibujado en canvas + simulación real (análisis nodal) precalculada.
   Referencias:
   https://github.com/sharpie7/circuitjs1 (GPL-2.0, NO se copió código): idea visual de puntos de corriente que avanzan
     según la corriente real y de colorear cables por voltaje (verde positivo, gris 0, rojo negativo).
   https://en.wikipedia.org/wiki/Modified_nodal_analysis: planteamiento G·v = i por nodos.
   https://en.wikipedia.org/wiki/Backward_Euler_method y modelos "companion" (capacitor C/dt, inductor dt/L) para el transitorio.
   Diodo/LED por tramos (apagado o fuente Vf con resistencia Ron), iterando el estado hasta que sea consistente.
   Convención: cada parte va de "de" a "a"; su corriente es positiva de "de" hacia "a" a través de ella.
   Batería: "de" = negativo, "a" = positivo. Diodo/LED: "de" = ánodo, "a" = cátodo. */
(() => {
  const K = window.K = window.K || {};
  const valor = (x, t) => (typeof x === 'function' ? x(t) : x);
  const resolver = (A, b) => {
    const n = b.length;
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
      const d = A[c][c] || 1e-18;
      for (let r = c + 1; r < n; r++) { const f = A[r][c] / d; if (!f) continue; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; b[r] -= f * b[c]; }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = b[r]; for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k]; x[r] = s / (A[r][r] || 1e-18); }
    return x;
  };
  const unidad = (v, u) => {
    const a = Math.abs(v);
    if (a >= 1) return `${+v.toFixed(a >= 10 ? 1 : 2)} ${u}`;
    if (a >= 1e-3) return `${+(v * 1e3).toFixed(a >= 1e-2 ? 0 : 1)} m${u}`;
    if (a >= 1e-6) return `${+(v * 1e6).toFixed(0)} µ${u}`;
    return `0 ${u}`;
  };

  K.circuito = (def, op = {}) => {
    const { dur = 10, fps = 60, tierra = 'tierra', rint = 0.05, ron = 8 } = op;
    const nombres = Object.keys(def.nodos).filter(n => n !== tierra), idx = new Map(nombres.map((n, i) => [n, i]));
    const N = nombres.length, partes = def.partes.map(p => Object.assign({}, p));
    partes.forEach(p => { if (!(p.de in def.nodos) || !(p.a in def.nodos)) throw new Error(`circuito: nodo desconocido en ${p.tipo} (${p.de} → ${p.a})`); p.ve = 0; p.ie = 0; p.on = false; });
    const dt = 1 / fps, pasos = Math.ceil(dur * fps) + 1, V = [], I = [], Q = [], P = [];
    const sello = (G, b, p, g, inj) => {
      const i = idx.get(p.de), j = idx.get(p.a);
      if (i !== undefined) { G[i][i] += g; b[i] += inj; }
      if (j !== undefined) { G[j][j] += g; b[j] -= inj; }
      if (i !== undefined && j !== undefined) { G[i][j] -= g; G[j][i] -= g; }
    };
    const vn = (x, n) => (n === tierra ? 0 : x[idx.get(n)]);
    const q = partes.map(() => 0);
    for (let s = 0; s < pasos; s++) {
      const t = s * dt;
      let x;
      for (let it = 0; it < 25; it++) {
        const G = Array.from({ length: N }, () => new Array(N).fill(0)), b = new Array(N).fill(0);
        for (let k = 0; k < N; k++) G[k][k] += 1e-9;
        partes.forEach(p => {
          const tp = p.tipo;
          if (tp === 'resistencia' || tp === 'foco' || tp === 'motor') sello(G, b, p, 1 / Math.max(1e-6, valor(p.r, t)), 0);
          else if (tp === 'cable' || tp === 'amperimetro') sello(G, b, p, 1e4, 0);
          else if (tp === 'interruptor') sello(G, b, p, valor(p.cerrado, t) ? 1e4 : 1e-9, 0);
          else if (tp === 'bateria' || tp === 'fuente') { const g = 1 / (p.rint ?? rint); sello(G, b, p, g, -valor(p.v, t) * g); }
          else if (tp === 'fuente_i') sello(G, b, p, 0, -valor(p.i, t));
          else if (tp === 'capacitor') { const g = valor(p.c, t) / dt; sello(G, b, p, g, g * p.ve); }
          else if (tp === 'inductor') { const g = dt / valor(p.l, t); sello(G, b, p, g, -p.ie); }
          else if (tp === 'diodo' || tp === 'led') { const g = p.on ? 1 / (p.ron ?? ron) : 1e-9; sello(G, b, p, g, p.on ? g * (p.vf ?? (tp === 'led' ? 2 : 0.7)) : 0); }
          else throw new Error(`circuito: tipo desconocido "${tp}"`);
        });
        x = resolver(G, b);
        let cambio = false;
        partes.forEach(p => {
          if (p.tipo !== 'diodo' && p.tipo !== 'led') return;
          const vd = vn(x, p.de) - vn(x, p.a), vf = p.vf ?? (p.tipo === 'led' ? 2 : 0.7);
          if (p.on && vd < vf - 1e-9) { p.on = false; cambio = true; }
          else if (!p.on && vd > vf + 1e-9) { p.on = true; cambio = true; }
        });
        if (!cambio) break;
      }
      const corr = partes.map(p => {
        const vx = vn(x, p.de) - vn(x, p.a), tp = p.tipo;
        let i = 0;
        if (tp === 'resistencia' || tp === 'foco' || tp === 'motor') i = vx / Math.max(1e-6, valor(p.r, t));
        else if (tp === 'cable' || tp === 'amperimetro') i = vx * 1e4;
        else if (tp === 'interruptor') i = vx * (valor(p.cerrado, t) ? 1e4 : 1e-9);
        else if (tp === 'bateria' || tp === 'fuente') i = (vx + valor(p.v, t)) / (p.rint ?? rint);
        else if (tp === 'fuente_i') i = valor(p.i, t);
        else if (tp === 'capacitor') { i = (valor(p.c, t) / dt) * (vx - p.ve); p.ve = vx; }
        else if (tp === 'inductor') { i = p.ie + (dt / valor(p.l, t)) * vx; p.ie = i; }
        else if (tp === 'diodo' || tp === 'led') i = p.on ? (vx - (p.vf ?? (tp === 'led' ? 2 : 0.7))) / (p.ron ?? ron) : 0;
        return i;
      });
      corr.forEach((i, k) => (q[k] += i * dt));
      V.push(Object.fromEntries(Object.keys(def.nodos).map(n => [n, vn(x, n)])));
      I.push(corr); Q.push(q.slice());
      P.push(corr.map((i, k) => Math.abs(i * (vn(x, partes[k].de) - vn(x, partes[k].a)))));
    }
    const fr = t => Math.max(0, Math.min(pasos - 1, Math.round(t * fps)));
    const imax = Math.max(1e-12, ...I.flat().map(Math.abs)), vmax = Math.max(1e-12, ...V.flatMap(o => Object.values(o).map(Math.abs)));
    const pmax = partes.map((_, k) => Math.max(1e-12, ...P.map(f => f[k])));
    const CI = { partes, imax, vmax, unidad };
    CI.v = (n, t) => V[fr(t)][n];
    CI.i = (k, t) => I[fr(t)][typeof k === 'number' ? k : partes.findIndex(p => p.id === k)];
    CI.tabla = { V, I, Q, P, fps };

    const ruta = p => [def.nodos[p.de], ...(p.ruta || []), def.nodos[p.a]];
    const largo = pts => pts.slice(1).reduce((s, q, k) => s + Math.hypot(q[0] - pts[k][0], q[1] - pts[k][1]), 0);
    const enRuta = (pts, d) => {
      for (let k = 1; k < pts.length; k++) {
        const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], L = Math.hypot(x1 - x0, y1 - y0);
        if (d <= L || k === pts.length - 1) { const u = L ? Math.min(1, d / L) : 0; return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]; }
        d -= L;
      }
    };
    const tramoMayor = pts => { let m = 1, L = -1; for (let k = 1; k < pts.length; k++) { const l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); if (l > L) { L = l; m = k; } } return [pts[m - 1], pts[m], L]; };
    const colorV = (v, C) => {
      const u = Math.max(-1, Math.min(1, v / vmax));
      const [r0, g0, b0] = C.cero, [r1, g1, b1] = u >= 0 ? C.pos : C.neg, a = Math.abs(u);
      return `rgb(${Math.round(r0 + (r1 - r0) * a)},${Math.round(g0 + (g1 - g0) * a)},${Math.round(b0 + (b1 - b0) * a)})`;
    };

    CI.dibujar = (g, t, o = {}) => {
      const tema = o.tema || 'oscuro';
      const C = Object.assign(tema === 'papel'
        ? { tinta: '#1d1b18', cero: [120, 116, 108], pos: [32, 150, 90], neg: [210, 60, 50], punto: '#e4572e', texto: '#1d1b18', acento: '#e4572e' }
        : { tinta: '#f4f1ea', cero: [130, 134, 140], pos: [60, 230, 120], neg: [255, 80, 80], punto: '#ffd23f', texto: '#f4f1ea', acento: '#ffd23f' }, o.colores || {});
      const { a = 1, grosor = 6, simbolo = 150, puntos = true, voltaje = true, velocidad = 220, sep = 46, fs = 34, resaltar = [], solo = null, sinEtiquetas = false } = o;
      const f = fr(t);
      g.save(); g.globalAlpha *= a; g.lineCap = 'round'; g.lineJoin = 'round';
      partes.forEach((p, k) => {
        if (solo && !solo.includes(k) && !solo.includes(p.id)) return;
        const pts = ruta(p), [A, B, Lm] = tramoMayor(pts), ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
        const sim = p.tipo === 'cable' ? 0 : Math.min(simbolo, Lm * 0.8), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        const c0 = [mx - Math.cos(ang) * sim / 2, my - Math.sin(ang) * sim / 2], c1 = [mx + Math.cos(ang) * sim / 2, my + Math.sin(ang) * sim / 2];
        const vde = V[f][p.de], va = V[f][p.a], hi = resaltar.includes(k) || resaltar.includes(p.id);
        const linea = (q, col, w = grosor) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); q.forEach((r, j) => (j ? g.lineTo(r[0], r[1]) : g.moveTo(r[0], r[1]))); g.stroke(); };
        const iA = pts.indexOf(A), antes = [...pts.slice(0, iA + 1), c0], despues = [c1, ...pts.slice(iA + 1)];
        if (hi) { g.save(); g.shadowColor = C.acento; g.shadowBlur = 28; linea(pts, C.acento, grosor + 8); g.restore(); }
        linea(antes, voltaje ? colorV(vde, C) : C.tinta);
        linea(despues, voltaje ? colorV(va, C) : C.tinta);
        if (p.tipo === 'cable') linea([c0, c1], voltaje ? colorV((vde + va) / 2, C) : C.tinta);
        g.save(); g.translate(mx, my); g.rotate(ang); g.strokeStyle = C.tinta; g.fillStyle = C.tinta; g.lineWidth = grosor;
        const h = sim / 2, tp = p.tipo, ii = I[f][k], pw = P[f][k] / pmax[k];
        if (tp === 'resistencia' || tp === 'motor') {
          if (tp === 'motor') { g.beginPath(); g.arc(0, 0, h * 0.55, 0, Math.PI * 2); g.stroke(); g.save(); g.rotate(-ang); g.font = `800 ${h * 0.55}px Inter, sans-serif`; g.textAlign = 'center'; g.fillText('M', 0, h * 0.2); g.restore(); g.beginPath(); g.moveTo(-h, 0); g.lineTo(-h * 0.55, 0); g.moveTo(h * 0.55, 0); g.lineTo(h, 0); g.stroke(); }
          else { g.beginPath(); g.moveTo(-h, 0); for (let z = 0; z < 6; z++) g.lineTo(-h + (z + 0.5) * sim / 6, z % 2 ? 16 : -16); g.lineTo(h, 0); g.stroke(); }
        } else if (tp === 'bateria' || tp === 'fuente') {
          g.beginPath(); g.moveTo(-h, 0); g.lineTo(-10, 0); g.moveTo(10, 0); g.lineTo(h, 0); g.stroke();
          g.lineWidth = grosor; g.beginPath(); g.moveTo(-10, -18); g.lineTo(-10, 18); g.stroke(); g.lineWidth = grosor * 1.4; g.beginPath(); g.moveTo(10, -36); g.lineTo(10, 36); g.stroke();
          g.save(); g.rotate(-ang); g.font = `800 ${fs}px Inter, sans-serif`; g.textAlign = 'center'; const sx = Math.cos(ang) * 34 + Math.sin(ang) * 40, sy = Math.sin(ang) * 34 - Math.cos(ang) * 40; g.fillText('+', sx, sy + fs * 0.35); g.restore();
        } else if (tp === 'fuente_i') { g.beginPath(); g.arc(0, 0, h * 0.5, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(-h * 0.3, 0); g.lineTo(h * 0.3, 0); g.moveTo(h * 0.12, -12); g.lineTo(h * 0.3, 0); g.lineTo(h * 0.12, 12); g.stroke(); g.beginPath(); g.moveTo(-h, 0); g.lineTo(-h * 0.5, 0); g.moveTo(h * 0.5, 0); g.lineTo(h, 0); g.stroke(); }
        else if (tp === 'capacitor') { g.beginPath(); g.moveTo(-h, 0); g.lineTo(-9, 0); g.moveTo(9, 0); g.lineTo(h, 0); g.moveTo(-9, -30); g.lineTo(-9, 30); g.moveTo(9, -30); g.lineTo(9, 30); g.stroke(); }
        else if (tp === 'inductor') { g.beginPath(); g.moveTo(-h, 0); for (let z = 0; z < 4; z++) g.arc(-h + sim / 8 + z * sim / 4, 0, sim / 8, Math.PI, 0); g.stroke(); }
        else if (tp === 'diodo' || tp === 'led') {
          if (tp === 'led' && pw > 0.01) { const rg = g.createRadialGradient(0, 0, 0, 0, 0, h * 1.5); rg.addColorStop(0, p.color || '#ff4d4d'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.globalAlpha *= Math.min(1, pw); g.fillStyle = rg; g.beginPath(); g.arc(0, 0, h * 1.5, 0, Math.PI * 2); g.fill(); g.restore(); }
          g.beginPath(); g.moveTo(-h, 0); g.lineTo(-22, 0); g.moveTo(22, 0); g.lineTo(h, 0); g.moveTo(22, -26); g.lineTo(22, 26); g.stroke();
          g.beginPath(); g.moveTo(-22, -26); g.lineTo(-22, 26); g.lineTo(22, 0); g.closePath(); g.fillStyle = tp === 'led' ? (p.color || '#ff4d4d') : C.tinta; g.fill(); g.stroke();
          if (tp === 'led') { g.lineWidth = grosor * 0.6; [[-2, -36], [16, -36]].forEach(([x0, y0]) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 14, y0 - 16); g.moveTo(x0 + 14, y0 - 16); g.lineTo(x0 + 4, y0 - 14); g.moveTo(x0 + 14, y0 - 16); g.lineTo(x0 + 12, y0 - 6); g.stroke(); }); }
        } else if (tp === 'foco') {
          if (pw > 0.01) { const rg = g.createRadialGradient(0, 0, 0, 0, 0, h * 1.6); rg.addColorStop(0, p.color || '#fff2a8'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.globalAlpha *= Math.min(1, pw); g.fillStyle = rg; g.beginPath(); g.arc(0, 0, h * 1.6, 0, Math.PI * 2); g.fill(); g.restore(); }
          g.beginPath(); g.moveTo(-h, 0); g.lineTo(-h * 0.45, 0); g.moveTo(h * 0.45, 0); g.lineTo(h, 0); g.stroke(); g.beginPath(); g.arc(0, 0, h * 0.45, 0, Math.PI * 2); g.stroke();
          const r = h * 0.32; g.beginPath(); g.moveTo(-r, -r); g.lineTo(r, r); g.moveTo(-r, r); g.lineTo(r, -r); g.stroke();
        } else if (tp === 'interruptor') {
          const cerr = valor(p.cerrado, t), ab = cerr ? 0 : -0.5;
          g.beginPath(); g.moveTo(-h, 0); g.lineTo(-h * 0.45, 0); g.moveTo(h * 0.45, 0); g.lineTo(h, 0); g.stroke();
          g.beginPath(); g.arc(-h * 0.45, 0, 7, 0, Math.PI * 2); g.arc(h * 0.45, 0, 7, 0, Math.PI * 2); g.fill();
          g.beginPath(); g.moveTo(-h * 0.45, 0); g.lineTo(-h * 0.45 + Math.cos(ab) * h * 0.95, Math.sin(ab) * h * 0.95); g.stroke();
        } else if (tp === 'amperimetro') { g.beginPath(); g.arc(0, 0, h * 0.45, 0, Math.PI * 2); g.stroke(); g.save(); g.rotate(-ang); g.font = `800 ${h * 0.5}px Inter, sans-serif`; g.textAlign = 'center'; g.fillText('A', 0, h * 0.18); g.restore(); g.beginPath(); g.moveTo(-h, 0); g.lineTo(-h * 0.45, 0); g.moveTo(h * 0.45, 0); g.lineTo(h, 0); g.stroke(); }
        g.restore();
        if (puntos && Math.abs(ii) > imax * 0.004) {
          const L = largo(pts), off = ((Q[f][k] / imax) * velocidad) % sep, n = Math.floor(L / sep) + 2;
          g.fillStyle = C.punto;
          for (let z = -1; z < n; z++) { const d = z * sep + (off < 0 ? off + sep : off); if (d < 0 || d > L) continue; const [px, py] = enRuta(pts, d); g.beginPath(); g.arc(px, py, grosor * 0.95, 0, Math.PI * 2); g.fill(); }
        }
        if (!sinEtiquetas && (p.e || p.mostrar)) {
          const nx = -Math.sin(ang), ny = Math.cos(ang), lado = p.lado ?? 1, d = p.dist ?? 64, lx = mx + nx * d * lado, ly = my + ny * d * lado;
          const lin = [p.e, p.mostrar === 'i' ? unidad(Math.abs(ii), 'A') : p.mostrar === 'v' ? unidad(Math.abs(vde - va), 'V') : p.mostrar === 'p' ? unidad(P[f][k], 'W') : null].filter(Boolean);
          g.save(); g.font = `800 ${fs}px "Inter Display", Inter, sans-serif`; g.textAlign = Math.abs(nx) > 0.7 ? (nx * lado > 0 ? 'left' : 'right') : 'center'; g.fillStyle = hi ? C.acento : C.texto;
          if (tema !== 'papel') { g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 10; }
          lin.forEach((s, z) => g.fillText(s, lx, ly + (z - (lin.length - 1) / 2) * fs * 1.15 + fs * 0.35));
          g.restore();
        }
      });
      Object.entries(def.nodos).forEach(([n, [x, y]]) => {
        const grado = partes.filter(p => p.de === n || p.a === n).length;
        if (grado > 2) { g.fillStyle = voltaje ? colorV(V[f][n], C) : C.tinta; g.beginPath(); g.arc(x, y, grosor * 1.6, 0, Math.PI * 2); g.fill(); }
        if (n === tierra && o.simboloTierra !== false) { g.strokeStyle = C.tinta; g.lineWidth = grosor; [[30, 0], [20, 12], [10, 24]].forEach(([w, dy]) => { g.beginPath(); g.moveTo(x - w, y + 26 + dy); g.lineTo(x + w, y + 26 + dy); g.stroke(); }); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); }
      });
      g.restore();
    };
    return CI;
  };
})();
