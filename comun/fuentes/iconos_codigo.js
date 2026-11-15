/* Íconos Tabler sobre canvas. Referencias:
   https://github.com/tabler/tabler-icons (MIT): trazos de 24×24, línea de 2, puntas redondas; los "-f" son rellenos.
   https://developer.mozilla.org/docs/Web/API/Path2D: cada "d" del SVG se dibuja directo como Path2D. */
(() => {
  const K = window.K = window.K || {};
  const cache = {};
  const caminos = n => {
    if (cache[n]) return cache[n];
    const d = window.TABLER[n];
    if (!d) {
      const cerca = Object.keys(window.TABLER).filter(k => k.includes(n.replace(/-f$/, ''))).slice(0, 8);
      throw new Error(`ícono "${n}" no existe en Tabler. Parecidos: ${cerca.join(', ') || 'ninguno'} (buscar: python3 comun/iconos.py buscar <palabra>)`);
    }
    return (cache[n] = d.map(x => new Path2D(x)));
  };
  K.ico = (g, nombre, x, y, tam, o = {}) => {
    const { color = '#ffffff', grosor = 2, a = 1, u = 1, rot = 0, modo = 'aparecer', sombra = 0 } = o;
    if (a <= 0 || u <= 0) return;
    const relleno = nombre.endsWith('-f');
    const ps = caminos(nombre);
    let s = tam / 24, al = a;
    if (modo === 'aparecer') { const e = Math.min(1, u); s *= e < 1 ? 0.6 + 0.4 * (1 + 2.2 * Math.pow(e - 1, 3) + 1.2 * Math.pow(e - 1, 2)) : 1; al *= Math.min(1, u * 2.5); }
    g.save();
    g.globalAlpha *= al;
    g.translate(x, y); g.rotate(rot); g.scale(s, s); g.translate(-12, -12);
    if (sombra) { g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = sombra / s; }
    g.lineWidth = grosor; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = g.fillStyle = color;
    if (modo === 'trazar' && u < 1 && !relleno) { const L = 120; g.setLineDash([L * u, L]); }
    for (const p of ps) relleno ? g.fill(p) : g.stroke(p);
    g.restore();
  };
  K.icoExiste = n => !!window.TABLER[n];
})();
