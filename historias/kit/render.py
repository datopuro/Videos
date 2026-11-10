import glob
import json
import os
import subprocess
import sys
import time

import numpy as np
from playwright.sync_api import sync_playwright

KIT = os.path.dirname(os.path.abspath(__file__))
SR = 44100


def formato(base):
    f = {"ancho": 1920, "alto": 1080, "fps": 24}
    p = f"{base}/formato.json"
    if os.path.exists(p):
        f.update(json.load(open(p)))
    return f


def envolvente(base, fps):
    p = f"{base}/voz.f32"
    if not os.path.exists(p):
        return []
    v = np.fromfile(p, dtype=np.float32).astype(np.float64)
    paso = SR / fps
    n = int(len(v) / paso)
    r = np.array([np.sqrt(np.mean(v[int(i * paso):int((i + 1) * paso)] ** 2) + 1e-12) for i in range(n)])
    r = r / (np.percentile(r, 95) + 1e-9)
    return [round(float(min(x, 1.0)), 3) for x in r]


def datos(base, fmt):
    tl = json.load(open(f"{base}/timeline.json"))
    d = {"bloques": tl["bloques"], "total": tl["total"], "formato": fmt, "rms": envolvente(base, fmt["fps"])}
    if os.path.exists(f"{KIT}/fuente.json"):
        d["fuente"] = json.load(open(f"{KIT}/fuente.json"))
    for extra in ("datos.json", "escenas.json"):
        p = f"{base}/{extra}"
        if os.path.exists(p):
            d[extra.split(".")[0]] = json.load(open(p))
    return d


def html(base, fmt):
    h = open(f"{base}/escena.html").read()
    pre = "window.FORMATO=" + json.dumps(fmt) + ";\n"
    if "__THREE__" in h:
        h = h.replace("__THREE__", open(f"{KIT}/three_plus.js").read())
    if "__KIT__" in h:
        h = h.replace("__KIT__", pre + open(f"{KIT}/kit.js").read())
    if "__CARICATURA__" in h:
        h = h.replace("__CARICATURA__", pre + open(f"{KIT}/caricatura.js").read() + (open(f"{KIT}/rig2.js").read() if os.path.exists(f"{KIT}/rig2.js") else ""))
    return h.replace("__DATA__", json.dumps(datos(base, fmt), ensure_ascii=False))


def abrir(p, base, fmt):
    if os.environ.get("KIT_GL", "") == "gpu":
        args = ["--use-gl=angle", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"]
    else:
        args = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
    b = p.chromium.launch(args=args)
    pg = b.new_page(viewport={"width": fmt["ancho"], "height": fmt["alto"]})
    pg.on("console", lambda m: print("JS:", m.text) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: print("PAGEERR:", e))
    pg.set_content(html(base, fmt))
    pg.wait_for_function("window.listo===true", timeout=60000)
    pg.evaluate("document.fonts.ready")
    return b, pg


def cuadro(pg, t):
    pg.evaluate("t => new Promise(r => { renderAt(t); requestAnimationFrame(() => requestAnimationFrame(r)); })", t)


def hoja(fs, salida, col=None, w=None):
    from PIL import Image, ImageDraw
    if not fs:
        return
    a = Image.open(fs[0])
    hor = a.width >= a.height
    col = col or (4 if hor else 6)
    w = w or (480 if hor else 270)
    h = int(w * a.height / a.width)
    filas = (len(fs) + col - 1) // col
    im = Image.new("RGB", (w * min(col, len(fs)), h * filas))
    dr = ImageDraw.Draw(im)
    for i, f in enumerate(fs):
        x, y = (i % col) * w, (i // col) * h
        im.paste(Image.open(f).convert("RGB").resize((w, h)), (x, y))
        dr.text((x + 6, y + h - 16), os.path.basename(f), fill=(255, 255, 0))
    im.save(salida, quality=88)
    print("hoja:", salida)


def muestras(base, ts):
    fmt = formato(base)
    os.makedirs(f"{base}/m", exist_ok=True)
    for f in glob.glob(f"{base}/m/*"):
        os.remove(f)
    with sync_playwright() as p:
        b, pg = abrir(p, base, fmt)
        for t in ts:
            cuadro(pg, t)
            pg.screenshot(path=f"{base}/m/m_{t:07.2f}.png")
        b.close()
    hoja(sorted(glob.glob(f"{base}/m/m_*.png")), f"{base}/m/hoja.jpg")


def cuadros(base, desde=0, hasta=10 ** 9, paso=1, fase=0):
    fmt = formato(base)
    fps = fmt["fps"]
    car = f"{base}/fr"
    os.makedirs(car, exist_ok=True)
    n = int(json.load(open(f"{base}/timeline.json"))["total"] * fps)
    pend = [i for i in range(desde, min(hasta, n)) if i % paso == fase and not os.path.exists(f"{car}/f_{i:06d}.jpg")]
    t0 = time.time()
    with sync_playwright() as p:
        b, pg = abrir(p, base, fmt)
        for k, i in enumerate(pend):
            cuadro(pg, i / fps)
            tmp = f"{car}/tmp{fase}.jpg"
            pg.screenshot(path=tmp, type="jpeg", quality=94)
            os.replace(tmp, f"{car}/f_{i:06d}.jpg")
            if k % 200 == 0:
                print(fase, i, n, round(time.time() - t0), flush=True)
        b.close()
    print("listo", fase, len(pend), "de", n, round(time.time() - t0), "s", flush=True)


def paralelo(base, procesos=2):
    ps = [subprocess.Popen([sys.executable, __file__, "cuadros", base, str(procesos), str(k)]) for k in range(procesos)]
    for p in ps:
        p.wait()
    fps = formato(base)["fps"]
    faltan = len([i for i in range(int(json.load(open(f"{base}/timeline.json"))["total"] * fps)) if not os.path.exists(f"{base}/fr/f_{i:06d}.jpg")])
    print("faltan", faltan)


def codificar(base, salida):
    fps = formato(base)["fps"]
    entrada_audio = ["-i", f"{base}/mezcla.wav"] if os.path.exists(f"{base}/mezcla.wav") else []
    audio = ["-c:a", "aac", "-b:a", "192k", "-shortest"] if entrada_audio else ["-an"]
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(fps), "-i", f"{base}/fr/f_%06d.jpg", *entrada_audio,
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", *audio,
                    "-movflags", "+faststart", f"{base}/{salida}"], check=True)
    os.makedirs(f"{base}/chk", exist_ok=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{base}/{salida}"], capture_output=True, text=True).stdout)
    fs = []
    for k in range(12):
        t = dur * (k + 0.5) / 12
        f = f"{base}/chk/c_{k:02d}.png"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.2f}", "-i", f"{base}/{salida}", "-frames:v", "1", f], check=True)
        fs.append(f)
    hoja(fs, f"{base}/chk/hoja.jpg")
    print("video", salida, round(dur, 2), "s")


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "muestras":
        muestras(os.path.abspath(sys.argv[2]), [float(x) for x in sys.argv[3:]])
    elif cmd == "cuadros":
        cuadros(os.path.abspath(sys.argv[2]), paso=int(sys.argv[3]) if len(sys.argv) > 3 else 1, fase=int(sys.argv[4]) if len(sys.argv) > 4 else 0)
    elif cmd == "tramo":
        fps = formato(os.path.abspath(sys.argv[2]))["fps"]
        cuadros(os.path.abspath(sys.argv[2]), desde=int(float(sys.argv[3]) * fps), hasta=int(float(sys.argv[4]) * fps))
    elif cmd == "paralelo":
        paralelo(os.path.abspath(sys.argv[2]), int(sys.argv[3]) if len(sys.argv) > 3 else 2)
    elif cmd == "codificar":
        codificar(os.path.abspath(sys.argv[2]), sys.argv[3])
