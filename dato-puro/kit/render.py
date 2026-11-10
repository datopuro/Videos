import glob
import json
import os
import re
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

KIT = os.path.dirname(os.path.abspath(__file__))
SR = 44100
GL = {
    "swiftshader": ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    "gpu": ["--use-gl=angle", "--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu"],
}[os.environ.get("KIT_GL", "swiftshader")]


def lee(p):
    return open(p, encoding="utf-8").read()


def formato(base):
    f = {"ancho": 1080, "alto": 1920, "fps": 30}
    p = f"{base}/formato.json"
    if os.path.exists(p):
        f.update(json.loads(lee(p)))
    return f


def envolvente(base, fps):
    p = f"{base}/voz.f32"
    if not os.path.exists(p):
        return []
    import numpy as np
    v = np.fromfile(p, dtype=np.float32).astype(np.float64)
    paso = SR / fps
    n = int(len(v) / paso)
    r = np.sqrt(np.array([np.mean(v[int(i * paso):int((i + 1) * paso)] ** 2) for i in range(n)]) + 1e-12)
    r = r / (np.percentile(r, 95) + 1e-9)
    return [round(float(min(x, 1.0)), 3) for x in r]


def datos(base, fmt):
    tl = json.loads(lee(f"{base}/timeline.json"))
    d = {"bloques": tl["bloques"], "total": tl["total"], "formato": fmt, "rms": envolvente(base, fmt["fps"])}
    if os.path.exists(f"{KIT}/fuente.json"):
        d["fuente"] = json.loads(lee(f"{KIT}/fuente.json"))
    if os.path.exists(f"{base}/datos.json"):
        d.update(json.loads(lee(f"{base}/datos.json")))
    if os.path.exists(f"{base}/escenas.json"):
        d["escenas"] = json.loads(lee(f"{base}/escenas.json"))
    return d


def html(base, fmt, extra_js=None):
    h = lee(f"{base}/escena.html")
    pre = "window.FORMATO=" + json.dumps(fmt) + ";\n"
    if "__THREE__" in h:
        h = h.replace("__THREE__", lee(f"{KIT}/three_plus.js"))
    if "__KIT__" in h:
        h = h.replace("__KIT__", pre + lee(f"{KIT}/kit.js"))
    for m in set(re.findall(r"__MOD:([a-z0-9_]+)__", h)):
        h = h.replace(f"__MOD:{m}__", pre + lee(f"{KIT}/mod/{m}.js"))
    h = h.replace("__DATA__", json.dumps(datos(base, fmt), ensure_ascii=False))
    if extra_js:
        h = h.replace("</body>", "<script>\n" + extra_js + "\n</script></body>")
    return h


VISTOS = set()


def aviso(txt):
    txt = txt[:300]
    if txt in VISTOS or len(VISTOS) >= 8:
        return
    VISTOS.add(txt)
    print(txt, flush=True)


def abrir(p, base, extra_js=None):
    fmt = formato(base)
    b = p.chromium.launch(args=GL)
    pg = b.new_page(viewport={"width": fmt["ancho"], "height": fmt["alto"]})
    pg.on("console", lambda m: aviso("JS: " + m.text) if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: aviso("PAGEERR: " + str(e)))
    pg.set_content(html(base, fmt, extra_js))
    pg.wait_for_function("window.listo===true", timeout=60000)
    pg.evaluate("document.fonts.ready")
    return b, pg


def cuadro(pg, t):
    pg.evaluate("t => new Promise(r => { renderAt(t); requestAnimationFrame(() => requestAnimationFrame(r)); })", t)


def hoja(fs, salida, col=None, w=None, rotulos=True):
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
        if rotulos:
            n = os.path.splitext(os.path.basename(f))[0].split("_", 1)[-1]
            dr.rectangle([x, y, x + 8 + 7 * len(n), y + 14], fill=(0, 0, 0))
            dr.text((x + 4, y + 2), n, fill=(255, 255, 0))
    im.save(salida, quality=88)
    print("hoja:", salida)


def muestras(base, ts):
    os.makedirs(f"{base}/m", exist_ok=True)
    for f in glob.glob(f"{base}/m/*"):
        os.remove(f)
    with sync_playwright() as p:
        b, pg = abrir(p, base)
        for t in ts:
            cuadro(pg, t)
            pg.screenshot(path=f"{base}/m/m_{t:07.2f}.png")
        b.close()
    hoja(sorted(glob.glob(f"{base}/m/m_*.png")), f"{base}/m/hoja.jpg")


def foto(base, t, salida, extra_js=None, ocultar_subs=True):
    with sync_playwright() as p:
        b, pg = abrir(p, base, extra_js)
        if ocultar_subs:
            pg.add_style_tag(content="#cap{display:none!important}")
        cuadro(pg, t)
        pg.screenshot(path=salida, type="jpeg", quality=95)
        b.close()
    print("foto:", salida)


def total_cuadros(base):
    return int(json.loads(lee(f"{base}/timeline.json"))["total"] * formato(base)["fps"])


def cuadros(base, desde=0, hasta=10 ** 9, paso=1, fase=0):
    fps = formato(base)["fps"]
    car = f"{base}/fr"
    os.makedirs(car, exist_ok=True)
    n = total_cuadros(base)
    pend = [i for i in range(desde, min(hasta, n)) if i % paso == fase and not os.path.exists(f"{car}/f_{i:05d}.jpg")]
    t0 = time.time()
    with sync_playwright() as p:
        b, pg = abrir(p, base)
        for k, i in enumerate(pend):
            cuadro(pg, i / fps)
            tmp = f"{car}/tmp{fase}.jpg"
            pg.screenshot(path=tmp, type="jpeg", quality=94)
            os.replace(tmp, f"{car}/f_{i:05d}.jpg")
            if k % 500 == 0 and k:
                print(fase, i, n, round(time.time() - t0), flush=True)
        b.close()
    dt = time.time() - t0
    print("listo", fase, len(pend), "de", n, round(dt), "s", round(dt / max(1, len(pend)), 3), "s/cuadro", flush=True)


def paralelo(base, procesos=2):
    ps = [subprocess.Popen([sys.executable, __file__, "cuadros", base, str(procesos), str(k)]) for k in range(procesos)]
    for p in ps:
        p.wait()
    print("faltan", len([i for i in range(total_cuadros(base)) if not os.path.exists(f"{base}/fr/f_{i:05d}.jpg")]))


def codificar(base, salida):
    fps = formato(base)["fps"]
    hay = os.path.exists(f"{base}/mezcla.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(fps), "-i", f"{base}/fr/f_%05d.jpg", *(["-i", f"{base}/mezcla.wav"] if hay else []),
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", *(["-c:a", "aac", "-b:a", "192k", "-shortest"] if hay else ["-an"]),
                    "-movflags", "+faststart", f"{base}/{salida}"], check=True)
    os.makedirs(f"{base}/chk", exist_ok=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{base}/{salida}"], capture_output=True, text=True).stdout)
    fs = []
    for k in range(12):
        f = f"{base}/chk/c_{k:02d}.png"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{dur * (k + 0.5) / 12:.2f}", "-i", f"{base}/{salida}", "-frames:v", "1", f], check=True)
        fs.append(f)
    hoja(fs, f"{base}/chk/hoja.jpg")
    print("video", salida, round(dur, 2), "s")


if __name__ == "__main__":
    cmd, base = sys.argv[1], os.path.abspath(sys.argv[2])
    a = sys.argv[3:]
    if cmd == "muestras":
        muestras(base, [float(x) for x in a])
    elif cmd == "cuadros":
        cuadros(base, paso=int(a[0]) if a else 1, fase=int(a[1]) if len(a) > 1 else 0)
    elif cmd == "tramo":
        fps = formato(base)["fps"]
        cuadros(base, desde=int(float(a[0]) * fps), hasta=int(float(a[1]) * fps))
    elif cmd == "paralelo":
        paralelo(base, int(a[0]) if a else 2)
    elif cmd == "codificar":
        codificar(base, a[0])
    elif cmd == "foto":
        foto(base, float(a[0]), a[1] if len(a) > 1 else f"{base}/foto.jpg")
    elif cmd == "miniatura":
        foto(base, float(a[0]) if a else 1.0, f"{base}/miniatura.jpg", lee(f"{base}/mini.js"))
