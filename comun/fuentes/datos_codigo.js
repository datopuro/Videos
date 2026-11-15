/* Gráficas avanzadas sobre canvas con D3. Referencias:
   https://github.com/d3/d3 (ISC): escalas, curvas (d3-shape con contexto canvas), d3-hierarchy (treemap, pack), d3-force (red).
   https://github.com/d3/d3-sankey (BSD-3): diagrama de flujos.
   https://d3js.org/d3-shape/line#line_context: dibujar formas de D3 directo en un CanvasRenderingContext2D.
   Todo es función de u (0 a 1), sin estado entre cuadros: sirve para render por cuadros sueltos. */
(() => {
  const K = window.K = window.K || {};
  const d3 = window.d3;
  const TEMAS = {
    oscuro: { texto: '#f4f1ea', tenue: 'rgba(244,241,234,0.62)', linea: 'rgba(244,241,234,0.22)', acento: '#ffd23f', apagado: 'rgba(244,241,234,0.2)', fondoCaja: 'rgba(12,14,22,0.55)', sombra: 10, paleta: ['#ffd23f', '#4cc9f0', '#3ddc97', '#ff8c42', '#c77dff', '#ff5d5d', '#a8dadc', '#f4a261'] },
    papel: { texto: '#1d1b18', tenue: 'rgba(29,27,24,0.62)', linea: 'rgba(29,27,24,0.2)', acento: '#e4572e', apagado: 'rgba(29,27,24,0.16)', fondoCaja: 'rgba(247,243,234,0.9)', sombra: 0, paleta: ['#e4572e', '#2f5bd3', '#2a9d6f', '#f2a541', '#7b4fb0', '#1d1b18', '#4d9de0', '#c44536'] },
  };
  const cl = v => Math.max(0, Math.min(1, v));
  const eo = u => 1 - Math.pow(1 - cl(u), 3);
  K.d3graf = (g, tema = 'oscuro', cambios = {}) => {
    const C = Object.assign({}, TEMAS[tema] || TEMAS.oscuro, cambios);
    const nf = (v, dec = 0) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: dec, minimumFractionDigits: dec }).format(v);
    const tx = (s, x, y, fs, col, a = 1, peso = 700, al = 'center', base = 'alphabetic') => {
      if (a <= 0.01 || s === '' || s == null) return;
      g.save(); g.globalAlpha *= cl(a); g.font = `${peso} ${fs}px "Inter Display", Inter, sans-serif`; g.textAlign = al; g.textBaseline = base; g.fillStyle = col;
      if (C.sombra) { g.shadowColor = 'rgba(0,0,0,0.8)'; g.shadowBlur = C.sombra; }
      String(s).split('\n').forEach((l, i) => g.fillText(l, x, y + i * fs * 1.1)); g.restore();
    };
    const color = (d, i) => d.color || (d.destacar === false ? C.apagado : C.paleta[i % C.paleta.length]);
    const conDestacar = datos => datos.some(d => d.destacar) ? datos.map(d => Object.assign({}, d, { color: d.color || (d.destacar ? C.acento : C.apagado) })) : datos;
    const R = { C, d3, tx, nf };

    R.sankey = (nodos, enlaces, x, y, w, h, u, o = {}) => {
      const { suf = '', pre = '', dec = 0, ancho = 26, sep = 22, alinear = 'justify', fs = 34, valores = true } = o;
      const al = { justify: d3.sankeyJustify, left: d3.sankeyLeft, right: d3.sankeyRight, center: d3.sankeyCenter }[alinear];
      const S = d3.sankey().nodeId(n => n.id).nodeWidth(ancho).nodePadding(sep).nodeAlign(al).nodeSort(null).extent([[x, y], [x + w, y + h]]);
      const { nodes, links } = S({ nodes: nodos.map(n => Object.assign({}, n)), links: enlaces.map(l => ({ source: l.de, target: l.a, value: l.v, color: l.color })) });
      const ncol = new Map(conDestacar(nodos).map((n, i) => [n.id, color(n, i)]));
      const cols = [...new Set(nodes.map(n => n.depth))].sort((a, b) => a - b), ncols = cols.length;
      const paso = c => cl((u * (ncols + 0.6) - c) / 1.2);
      g.save();
      links.forEach(l => {
        const p = eo(paso(l.source.depth + 0.5));
        if (p <= 0) return;
        g.save(); g.beginPath(); g.rect(l.source.x1, y - 10, (l.target.x0 - l.source.x1) * p + 1, h + 20); g.clip();
        g.globalAlpha = 0.42; g.strokeStyle = l.color || ncol.get(l.source.id); g.lineWidth = Math.max(1, l.width);
        g.beginPath(); d3.sankeyLinkHorizontal().context(g)(l); g.stroke(); g.restore();
      });
      nodes.forEach(n => {
        const p = eo(paso(n.depth));
        if (p <= 0) return;
        const hh = (n.y1 - n.y0) * p, cy = (n.y0 + n.y1) / 2;
        g.fillStyle = ncol.get(n.id); g.fillRect(n.x0, cy - hh / 2, n.x1 - n.x0, hh);
        const der = n.x0 < x + w / 2, lx = der ? n.x1 + 14 : n.x0 - 14, alin = der ? 'left' : 'right';
        tx(n.e ?? n.id, lx, cy + (valores ? -4 : fs * 0.35), fs, C.texto, p, 800, alin);
        if (valores) tx(pre + nf(n.value, dec) + suf, lx, cy + fs * 0.95, fs * 0.8, C.tenue, p, 600, alin);
      });
      g.restore();
      return { nodes, links };
    };

    R.treemap = (datos, x, y, w, h, u, o = {}) => {
      const { suf = '', pre = '', dec = 0, sep = 8, fs = 38, radio = 14 } = o;
      const ds = conDestacar(datos);
      const raiz = d3.hierarchy({ children: ds.map((d, i) => Object.assign({ _i: i }, d)) }).sum(d => d.v || 0).sort((a, b) => b.value - a.value);
      d3.treemap().tile(d3.treemapSquarify.ratio(1.2)).size([w, h]).paddingInner(sep).round(true)(raiz);
      const hojas = raiz.leaves(), n = hojas.length;
      hojas.forEach((L, k) => {
        const p = eo(cl(u * (n * 0.35 + 1) - k * 0.35));
        if (p <= 0) return;
        const bw = L.x1 - L.x0, bh = L.y1 - L.y0, cx = x + (L.x0 + L.x1) / 2, cy = y + (L.y0 + L.y1) / 2, s = 0.75 + 0.25 * p;
        g.save(); g.globalAlpha *= p; g.translate(cx, cy); g.scale(s, s);
        g.beginPath(); g.roundRect(-bw / 2, -bh / 2, bw, bh, Math.min(radio, bw / 4, bh / 4)); g.fillStyle = color(L.data, L.data._i); g.fill(); g.restore();
        const f = Math.min(fs, bw / Math.max(4, String(L.data.e).length * 0.62), bh / 2.6);
        if (f >= 16) {
          const osc = (L.data.color || '').startsWith('rgba') || L.data.destacar === false;
          const col = osc ? C.texto : '#141414';
          tx(L.data.e, cx, cy - f * 0.15, f, col, p, 800, 'center');
          tx(pre + nf(L.data.v, dec) + suf, cx, cy + f * 0.95, f * 0.8, col, p * 0.85, 600, 'center');
        }
      });
      return hojas;
    };

    R.burbujas = (datos, x, y, w, h, u, o = {}) => {
      const { suf = '', pre = '', dec = 0, sep = 10, fs = 36 } = o;
      const ds = conDestacar(datos);
      const raiz = d3.hierarchy({ children: ds.map((d, i) => Object.assign({ _i: i }, d)) }).sum(d => d.v || 0).sort((a, b) => b.value - a.value);
      d3.pack().size([w, h]).padding(sep)(raiz);
      const hojas = raiz.leaves(), n = hojas.length;
      hojas.forEach((L, k) => {
        const p = cl(u * (n * 0.3 + 1) - k * 0.3);
        if (p <= 0) return;
        const r = L.r * (p < 1 ? 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2) : 1), cx = x + L.x, cy = y + L.y;
        g.beginPath(); g.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2); g.fillStyle = color(L.data, L.data._i); g.fill();
        const f = Math.min(fs, L.r / Math.max(2.2, String(L.data.e).length * 0.32));
        if (f >= 15) {
          const col = L.data.destacar === false ? C.texto : '#141414';
          tx(L.data.e, cx, cy - f * 0.1, f, col, cl(p * 1.5), 800);
          tx(pre + nf(L.data.v, dec) + suf, cx, cy + f * 0.95, f * 0.8, col, cl(p * 1.5) * 0.85, 600);
        }
      });
      return hojas;
    };

    R.area = (series, x, y, w, h, u, o = {}) => {
      const { y0 = 0, y1, x0, x1, apilada = false, suf = '', marcasY = 4, fs = 28, curva = d3.curveMonotoneX, leyenda = true } = o;
      const todos = series.flatMap(s => s.pts);
      const X = d3.scaleLinear().domain([x0 ?? d3.min(todos, p => p[0]), x1 ?? d3.max(todos, p => p[0])]).range([x, x + w]);
      let capas = series.map(s => s.pts.map(p => [p[0], 0, p[1]]));
      if (apilada) capas = capas.map((c, i) => c.map((p, j) => { const b = i ? capas[i - 1][j][2] : 0; return [p[0], b, b + p[2]]; }));
      const top = y1 ?? d3.max(capas.flat(), p => p[2]) * 1.08;
      const Y = d3.scaleLinear().domain([y0, top]).range([y + h, y]).nice(marcasY);
      g.save();
      Y.ticks(marcasY).forEach(t => { g.strokeStyle = C.linea; g.lineWidth = 2; g.beginPath(); g.moveTo(x, Y(t)); g.lineTo(x + w, Y(t)); g.stroke(); tx(nf(t) + suf, x - 14, Y(t) + fs * 0.35, fs, C.tenue, 1, 600, 'right'); });
      g.beginPath(); g.rect(x - 4, y - 40, w * eo(u) + 8, h + 80); g.clip();
      capas.forEach((c, i) => {
        const col = series[i].color || C.paleta[i % C.paleta.length];
        g.beginPath(); d3.area().x(p => X(p[0])).y0(p => Y(apilada ? p[1] : y0)).y1(p => Y(p[2])).curve(curva).context(g)(c);
        g.globalAlpha = 0.35; g.fillStyle = col; g.fill();
        g.beginPath(); d3.line().x(p => X(p[0])).y(p => Y(p[2])).curve(curva).context(g)(c);
        g.globalAlpha = 1; g.strokeStyle = col; g.lineWidth = 6; g.lineJoin = 'round'; g.stroke();
      });
      g.restore();
      if (leyenda) series.forEach((s, i) => { const c = capas[i][capas[i].length - 1]; tx(s.e, X(c[0]) - 6, Y(c[2]) - 18, fs, s.color || C.paleta[i % C.paleta.length], eo(cl(u * 1.3 - 0.3)), 800, 'right'); });
      return { X, Y };
    };

    const memoRed = new Map();
    R.red = (nodos, enlaces, x, y, w, h, u, o = {}) => {
      const { radio = 50, fs = 34, distancia = 260, carga = -1400, semilla = 'red' } = o;
      const clave = semilla + JSON.stringify([nodos.map(n => n.id), enlaces.map(l => [l.de, l.a]), w, h]);
      if (!memoRed.has(clave)) {
        const ns = nodos.map((n, i) => Object.assign({ x: w / 2 + Math.cos(i * 2.4) * 40 * Math.sqrt(i + 1), y: h / 2 + Math.sin(i * 2.4) * 40 * Math.sqrt(i + 1) }, n));
        const ls = enlaces.map(l => ({ source: l.de, target: l.a }));
        const sim = d3.forceSimulation(ns).randomSource(d3.randomLcg(0.42)).force('link', d3.forceLink(ls).id(n => n.id).distance(distancia)).force('charge', d3.forceManyBody().strength(carga)).force('center', d3.forceCenter(w / 2, h / 2)).force('choque', d3.forceCollide(radio * 1.6)).stop();
        for (let i = 0; i < 400; i++) sim.tick();
        ns.forEach(n => { n.x = Math.max(radio, Math.min(w - radio, n.x)); n.y = Math.max(radio, Math.min(h - radio, n.y)); });
        memoRed.set(clave, ns);
      }
      const ns = memoRed.get(clave), por = new Map(ns.map(n => [n.id, n])), N = ns.length;
      enlaces.forEach((l, k) => {
        const a = por.get(l.de), b = por.get(l.a), p = eo(cl(u * 1.6 - 0.3 - k / Math.max(1, enlaces.length) * 0.4));
        if (!a || !b || p <= 0) return;
        g.strokeStyle = l.color || C.linea; g.lineWidth = l.grosor || 4; g.beginPath(); g.moveTo(x + a.x, y + a.y); g.lineTo(x + a.x + (b.x - a.x) * p, y + a.y + (b.y - a.y) * p); g.stroke();
      });
      ns.forEach((n, k) => {
        const p = eo(cl(u * (N * 0.25 + 1) - k * 0.25));
        if (p <= 0) return;
        const r = (n.r || radio) * p;
        g.beginPath(); g.arc(x + n.x, y + n.y, r, 0, Math.PI * 2); g.fillStyle = n.color || (n.destacar ? C.acento : C.paleta[(k + 1) % C.paleta.length]); g.fill();
        if (n.icono && K.ico) K.ico(g, n.icono, x + n.x, y + n.y, r * 1.1, { color: '#141414', u: 1 });
        tx(n.e ?? n.id, x + n.x, y + n.y + r + fs * 1.05, fs, C.texto, p, 700);
      });
      return ns;
    };
    return R;
  };
})();
