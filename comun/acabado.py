"""Acabado de cine para los dos canales: desenfoque de movimiento por cuadro y color final del video.

ENTRADAS:
  - En la escena (opcional): window.DESENFOQUE = [{desde: s, hasta: s, muestras: 6, obturador: 0.5}, ...]
    Tramos donde cada cuadro se arma promediando varios instantes muy juntos.
  - En formato.json (opcional): "color": {"exposicion": 0.1, "temperatura": 0.3, "contraste": 1.08,
    "saturacion": 1.1, "vineta": 0.4}. Valores neutros: 0, 0, 1, 1, 0.
SALIDAS:
  - captura(): guarda el cuadro (con desenfoque si cae en un tramo).
  - filtro_color(): cadena -vf para ffmpeg, o None si no hay "color".

Por qué funciona el desenfoque: una cámara de cine deja el obturador abierto media fracción de cuadro (obturador de
180°), así que lo que se mueve rápido sale como estela. Aquí se imita dibujando la escena en varios instantes dentro de
esa media fracción y promediando los píxeles. Cuesta tantas veces el render como muestras: usarlo solo en tramos
rápidos (transiciones, objetos que cruzan, golpes de cámara).

Referencias:
https://github.com/remotion-dev/remotion/blob/main/packages/skills/skills/remotion-markup/motion-blur.md : idea de
  muestrear instantes fraccionarios dentro del cuadro y promediar (samples, shutterAngle).
https://en.wikipedia.org/wiki/Rotary_disc_shutter : obturador de 180° = exposición de medio cuadro.
https://ffmpeg.org/ffmpeg-filters.html#exposure , #colortemperature , #eq , #vignette : filtros del color final
  (exposición en pasos, temperatura en kelvin con pl=1 para no oscurecer, contraste/saturación, viñeta por ángulo).
"""
import io
import math

import numpy as np
from PIL import Image


def tramos(pg):
    try:
        return pg.evaluate("window.DESENFOQUE || []") or []
    except Exception:
        return []


def captura(pg, t, fps, dibujar, salida, lista=None, calidad=94):
    tr = next((d for d in (lista or []) if d.get("desde", 0) <= t <= d.get("hasta", 1e9)), None)
    if not tr:
        dibujar(pg, t)
        pg.screenshot(path=salida, type="jpeg", quality=calidad)
        return 1
    n = max(2, int(tr.get("muestras", 6)))
    ob = float(tr.get("obturador", 0.5)) / fps
    acc = None
    for k in range(n):
        dibujar(pg, max(0.0, t + ob * (k / (n - 1) - 0.5)))
        im = np.asarray(Image.open(io.BytesIO(pg.screenshot(type="png"))).convert("RGB"), dtype=np.float32)
        acc = im if acc is None else acc + im
    Image.fromarray(np.clip(acc / n + 0.5, 0, 255).astype(np.uint8)).save(salida, quality=calidad)
    return n


def filtro_color(fmt):
    c = (fmt or {}).get("color")
    if not c:
        return None
    f = []
    if c.get("exposicion"):
        f.append(f"exposure=exposure={float(c['exposicion']):.3f}")
    if c.get("temperatura"):
        k = 6500 - 2500 * max(-1.0, min(1.0, float(c["temperatura"])))
        f.append(f"colortemperature=temperature={k:.0f}:mix=0.6:pl=1")
    if c.get("contraste", 1) != 1 or c.get("saturacion", 1) != 1:
        f.append(f"eq=contrast={float(c.get('contraste', 1)):.3f}:saturation={float(c.get('saturacion', 1)):.3f}")
    if c.get("vineta"):
        f.append(f"vignette=angle={math.pi / 2 * 0.55 * max(0.0, min(1.0, float(c['vineta']))):.4f}")
    return ",".join(f) or None
