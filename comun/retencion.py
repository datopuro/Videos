#!/usr/bin/env python3
"""Lee la curva de retención de un video corto y dice dónde se va la gente y qué se decía en ese momento.

ENTRADAS:
  curva   CSV de YouTube Studio (Analytics → Interacción → Retención de público → descargar) o una lista de
          puntos "segundo,porcentaje" (uno por línea) sacada de Instagram, Facebook o TikTok. La posición puede venir
          en segundos o en porcentaje del video (en ese caso hace falta --duracion).
  --video carpeta del video con timeline.json (opcional): cruza cada caída con las palabras y el bloque del guion.
  --duracion segundos (si la curva viene en porcentaje del video).
SALIDAS: en consola, cuatro cosas:
  1. Fuga del gancho: cuántos de cada 100 se fueron en los primeros 3 s (y a 1 s y 5 s).
  2. Caídas bruscas: los 3 momentos con más pérdida por segundo, con lo que decía la voz.
  3. Pendiente: cuánto se pierde por segundo en la parte media (del 20 % al 85 % del video).
  4. Final: cuántos de cada 100 llegan al último segundo.
  y una sola recomendación: el problema más grande primero.

Modo comparar:
  python3 retencion.py comparar tabla.csv
  tabla.csv con columnas: video,red,vistas,prom_s,duracion (prom_s = segundos vistos en promedio).
  Para cada red da cuántas veces la mediana del propio canal hizo cada video (vistas y segundos vistos).

Referencias:
https://github.com/Jakeschincariol/youtube-agent-skill/tree/main/skills/yt-retention : idea de separar fuga del gancho,
  caídas puntuales y pendiente, y de cruzar cada caída con la transcripción (aquí con timeline.json, que trae cada palabra).
https://github.com/Jakeschincariol/youtube-agent-skill/tree/main/skills/yt-viral : comparar cada video contra la mediana
  de su propio canal, no por vistas totales.
https://support.google.com/youtube/answer/9314415 : qué es la retención de público en YouTube Studio y cómo se exporta.
"""
import csv
import json
import os
import statistics
import sys


def leer_curva(ruta):
    filas = []
    with open(ruta, newline="", encoding="utf-8-sig", errors="replace") as fh:
        for r in csv.reader(fh):
            nums = []
            for c in r:
                c = c.strip().replace("%", "").replace(",", ".") if c.count(",") == 1 and "." not in c else c.strip().replace("%", "").replace(",", "")
                try:
                    nums.append(float(c))
                except ValueError:
                    pass
            if len(nums) >= 2:
                filas.append((nums[0], nums[1]))
    filas.sort()
    return filas


def valor(filas, x):
    if x <= filas[0][0]:
        return filas[0][1]
    for (x0, y0), (x1, y1) in zip(filas, filas[1:]):
        if x0 <= x <= x1:
            return y0 + (y1 - y0) * (x - x0) / ((x1 - x0) or 1)
    return filas[-1][1]


def palabras(carpeta):
    if not carpeta:
        return []
    tl = json.load(open(os.path.join(carpeta, "timeline.json"), encoding="utf-8"))
    out = []
    for b, blo in sorted(tl.get("bloques", {}).items()):
        for s in blo.get("subs", []):
            for w in s.get("palabras", []):
                out.append((w["ini"], w["fin"], w["w"], b, s["texto"]))
    return out


def dicho(pals, t0, t1):
    ws = [p for p in pals if p[1] >= t0 - 0.3 and p[0] <= t1 + 0.3]
    if not ws:
        return ""
    return f'bloque {ws[0][3]}: "{" ".join(p[2] for p in ws)}"'


def analizar(args):
    ruta = args[0]
    dur = float(args[args.index("--duracion") + 1]) if "--duracion" in args else None
    carpeta = args[args.index("--video") + 1] if "--video" in args else None
    filas = leer_curva(ruta)
    if len(filas) < 6:
        sys.exit("no pude leer al menos 6 puntos de la curva")
    if max(x for x, _ in filas) <= 100.5 and dur and max(x for x, _ in filas) > dur * 1.05:
        filas = [(x / 100 * dur, y) for x, y in filas]
    elif dur is None:
        dur = filas[-1][0]
    if max(y for _, y in filas) <= 1.5:
        filas = [(x, y * 100) for x, y in filas]
    pals = palabras(carpeta)
    ini = filas[0][1] or 100
    k = 100 / ini
    f1, f3, f5 = [(ini - valor(filas, s)) * k for s in (1, 3, 5)]
    print(f"Duración: {dur:.1f} s | puntos: {len(filas)}")
    print(f"\n1. FUGA DEL GANCHO: se van {f1:.0f} de cada 100 al segundo 1, {f3:.0f} al segundo 3 y {f5:.0f} al segundo 5.")
    if pals:
        print("   Lo que se dice en esos 3 s:", dicho(pals, 0, 3))
    caidas = []
    for (x0, y0), (x1, y1) in zip(filas, filas[1:]):
        if x0 < 3:
            continue
        caidas.append(((y0 - y1) * k / ((x1 - x0) or 1), x0, x1, (y0 - y1) * k))
    caidas.sort(reverse=True)
    print("\n2. CAÍDAS BRUSCAS (fuera del gancho):")
    elegidas = []
    for v, x0, x1, d in caidas:
        if len(elegidas) == 3 or v <= 0:
            break
        if any(abs(x0 - e[1]) < 2 for e in elegidas):
            continue
        elegidas.append((v, x0, x1, d))
        print(f"   {x0:5.1f}–{x1:5.1f} s: se van {d:.1f} de cada 100 ({v:.1f} por segundo) {dicho(pals, x0, x1)}")
    a, b = dur * 0.2, dur * 0.85
    pend = (valor(filas, a) - valor(filas, b)) * k / ((b - a) or 1)
    print(f"\n3. PENDIENTE (de {a:.0f} s a {b:.0f} s): se van {pend:.2f} de cada 100 por segundo.")
    fin = max(0.0, valor(filas, dur) * k)
    print(f"\n4. FINAL: llegan al último segundo {fin:.0f} de cada 100.")
    mayor = max([("gancho", f3 / 3), ("caida", elegidas[0][0] if elegidas else 0), ("pendiente", pend)], key=lambda z: z[1])
    print("\nLO MÁS GRANDE:", {
        "gancho": "la fuga de los primeros 3 s. Se arregla en la primera frase y el cuadro 0, no en la edición.",
        "caida": f"la caída en {elegidas[0][1]:.1f} s si la hay. Revisar ese momento: cambio de tema sin aviso, dato que no se entiende o pausa larga.",
        "pendiente": "la pendiente pareja. Es ritmo: cortar frases y datos que no hacen falta."}[mayor[0]])
    print("Ojo: una sola curva es un caso, no un patrón. Comparar contra otros videos del canal antes de cambiar reglas.")


def comparar(args):
    filas = list(csv.DictReader(open(args[0], encoding="utf-8-sig")))
    redes = {}
    for f in filas:
        redes.setdefault(f["red"], []).append(f)
    for red, vs in redes.items():
        vis = [float(v["vistas"]) for v in vs if v.get("vistas")]
        seg = [float(v["prom_s"]) for v in vs if v.get("prom_s")]
        mv = statistics.median(vis) if vis else None
        ms = statistics.median(seg) if seg else None
        print(f"\n{red}: {len(vs)} videos | mediana {mv:.0f} vistas" + (f", {ms:.1f} s vistos" if ms else ""))
        if len(vs) < 4:
            print("   (menos de 4 videos: la mediana todavía no dice mucho)")
        for v in sorted(vs, key=lambda v: -float(v.get("vistas") or 0)):
            xv = float(v["vistas"]) / mv if mv and v.get("vistas") else None
            xs = float(v["prom_s"]) / ms if ms and v.get("prom_s") else None
            pct = f", {100 * float(v['prom_s']) / float(v['duracion']):.0f} de cada 100 s" if v.get("prom_s") and v.get("duracion") else ""
            print(f"   {v['video'][:28]:28s} {xv or 0:5.1f}× vistas" + (f"  {xs:4.2f}× s vistos ({float(v['prom_s']):.1f} s{pct})" if xs else ""))


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__.split("Referencias:")[0])
    comparar(a[1:]) if a[0] == "comparar" else analizar(a)
