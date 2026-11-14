# Revisa que cada texto en pantalla dure lo suficiente para leerse (sin contar los subtítulos).
# Referencia: https://github.com/lemomo-ai/lemo-opuscar (core/render/readcheck.mjs, MIT): la regla de tiempo
#   (letras ÷ 15 por segundo + 1.5 s, mínimo 1.5 s; solo cuenta el primer tramo continuo y completo en cuadro).
#   Aquí no hace falta que la escena declare sus textos: se intercepta fillText/strokeText del canvas visible.
# Uso: python3 lectura.py <kit> <carpeta_video> [paso=0.1] [letras_por_s=15]
#   <kit> es la carpeta del kit que trae render.py (por ejemplo /home/claude/kit).
# Limitaciones: no ve texto dentro de texturas 3D ni del DOM; un texto que cambia (contador, máquina de escribir) cuenta como otro texto.
import inspect
import json
import os
import sys

kit, base = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
PASO = float(sys.argv[3]) if len(sys.argv) > 3 else 0.1
CPS = float(sys.argv[4]) if len(sys.argv) > 4 else 15.0
sys.path.insert(0, kit)
import render
from playwright.sync_api import sync_playwright

PARCHE = """
(() => {
  if (window.__lect) return; window.__lect = [];
  for (const f of ['fillText', 'strokeText']) {
    const o = CanvasRenderingContext2D.prototype[f];
    CanvasRenderingContext2D.prototype[f] = function (txt, x, y, ...r) {
      try {
        const c = this.canvas;
        if (c && c.isConnected && this.globalAlpha >= 0.6 && String(txt).trim()) {
          const m = this.measureText(txt), k = this.getTransform(), es = c.getBoundingClientRect().width / c.width;
          let dx = 0;
          const al = this.textAlign;
          if (al === 'center') dx = -m.width / 2; else if (al === 'right' || al === 'end') dx = -m.width;
          const p = (px, py) => [(k.a * px + k.c * py + k.e) * es, (k.b * px + k.d * py + k.f) * es];
          const a = p(x + dx, y - (m.actualBoundingBoxAscent || 0)), b = p(x + dx + m.width, y + (m.actualBoundingBoxDescent || 0));
          window.__lect.push([String(txt).trim(), Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
        }
      } catch (e) {}
      return o.call(this, txt, x, y, ...r);
    };
  }
})();
"""

BARRIDO = """
([t0, t1, paso]) => {
  const r = [];
  for (let t = t0; t < t1 - 1e-9; t += paso) {
    window.__lect = [];
    window.renderAt(t);
    r.push([t, window.__lect]);
  }
  return r;
}
"""


def letras(s):
    return sum(ch.isalpha() for ch in s)


def main():
    total = json.loads(render.lee(f"{base}/timeline.json"))["total"] if hasattr(render, "lee") else json.load(open(f"{base}/timeline.json", encoding="utf-8"))["total"]
    fmt = render.formato(base)
    W, H = fmt["ancho"], fmt["alto"]
    with sync_playwright() as p:
        params = list(inspect.signature(render.abrir).parameters)
        b, pg = render.abrir(p, base, fmt) if len(params) >= 3 and params[2] == "fmt" else render.abrir(p, base)
        pg.evaluate(PARCHE)
        datos = []
        t = 0.0
        while t < total:
            t1 = min(total, t + 20)
            datos += pg.evaluate(BARRIDO, [t, t1, PASO])
            t = t1
        b.close()
    visto, parcial = {}, {}
    for t, lista in datos:
        presentes = set()
        for txt, x0, y0, x1, y1 in lista:
            if letras(txt) < 4:
                continue
            if x0 < -2 or y0 < -2 or x1 > W + 2 or y1 > H + 2:
                parcial.setdefault(txt, t)
                continue
            presentes.add(txt)
            s = visto.setdefault(txt, {"t0": t, "dur": 0.0, "fin": False, "y": round(y0 / 20)})
            if not s["fin"]:
                s["dur"] = t + PASO - s["t0"]
        for k, s in visto.items():
            if k not in presentes and s["dur"] > 0:
                s["fin"] = True
    for k in list(visto):
        if any(o != k and o.startswith(k) and visto[o]["y"] == visto[k]["y"] for o in visto):
            del visto[k]
    malos = []
    for k, s in visto.items():
        necesita = max(1.5, letras(k) / CPS + 1.5)
        if s["dur"] + PASO * 0.5 < necesita:
            malos.append((s["t0"], k, s["dur"], necesita))
    for k, t in parcial.items():
        if k not in visto:
            malos.append((t, k, -1, 0))
    malos.sort()
    for t0, k, d, n in malos[:25]:
        print(f"CORTO  {t0:6.2f}s  dura {d:4.1f}s, necesita {n:4.1f}s  {k[:50]!r}" if d >= 0 else f"FUERA  {t0:6.2f}s  nunca entra completo al cuadro  {k[:50]!r}")
    if len(malos) > 25:
        print(f"… y {len(malos) - 25} más")
    print(f"{len(visto)} textos revisados, {len(malos)} con problema" if malos else f"{len(visto)} textos revisados, todos se alcanzan a leer")
    sys.exit(1 if malos else 0)


main()
