import subprocess
import sys

import numpy as np

W, H = 54, 96


def cuadros(video):
    fps = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip().split("/")
    fps = float(fps[0]) / float(fps[1] if len(fps) > 1 else 1)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W).astype(np.float32), fps


def tramos(mascara, fps, minimo):
    r, ini = [], None
    for i, m in enumerate(list(mascara) + [False]):
        if m and ini is None:
            ini = i
        if not m and ini is not None:
            if (i - ini) / fps >= minimo:
                r.append((ini / fps, i / fps))
            ini = None
    return r


def lista(ts, tope=12):
    s = " ".join(f"{t:.2f}" for t in ts[:tope])
    return s + (f" … (+{len(ts) - tope})" if len(ts) > tope else "")


def revisar(f, fps):
    n = len(f)
    brillo = f.mean(axis=(1, 2))
    d = np.abs(f[1:] - f[:-1]).mean(axis=(1, 2))
    d2 = np.abs(f[2:] - f[:-2]).mean(axis=(1, 2))
    print(f"{n} cuadros, {n / fps:.1f} s, {fps:.0f} fps")
    avisos = 0
    osc = tramos(brillo < 6, fps, 0.3)
    if osc:
        avisos += 1
        print("OSCURO (casi negro):", " ".join(f"{a:.1f}-{b:.1f}" for a, b in osc))
    fijo = tramos(d < 0.12, fps, 5)
    if fijo:
        avisos += 1
        print("TOMA FIJA de más de 5 s:", " ".join(f"{a:.1f}-{b:.1f}" for a, b in fijo))
    suelto = [(i + 1) / fps for i in range(len(d2)) if min(d[i], d[i + 1]) > 6 and d2[i] < 0.35 * min(d[i], d[i + 1])]
    if suelto:
        avisos += 1
        print("CUADRO SUELTO (un cuadro distinto a sus vecinos; parpadeo o cuadro fuera de orden):", lista(suelto))
    med = float(np.median(d)) + 0.05
    cortes = [(i + 1) / fps for i in range(len(d)) if d[i] > max(14, 12 * med)]
    salto = [(i + 1) / fps for i in range(1, len(d) - 1) if 4 * med + 2.5 < d[i] <= max(14, 12 * med) and d[i] > 3.5 * max(d[i - 1], d[i + 1], 0.2)]
    if salto:
        avisos += 1
        print("SALTO (brinco de un cuadro que no es corte; revisar con una muestra en ese tiempo):", lista(salto))
    cortes = [t for k, t in enumerate(cortes) if k == 0 or t - cortes[k - 1] > 0.3]
    print("cortes o transiciones:", lista(cortes, 40) if cortes else "ninguno")
    print("sin avisos" if not avisos else f"{avisos} tipo(s) de aviso: sacar muestras solo de esos tiempos")


if __name__ == "__main__":
    revisar(*cuadros(sys.argv[1]))
