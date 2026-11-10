import glob
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
from render import abrir, cuadro

OCULTAR = "#cap{display:none!important}"


def portadas(base, ts, con_subs=False):
    car = f"{base}/portadas"
    os.makedirs(car, exist_ok=True)
    for f in glob.glob(f"{car}/*"):
        os.remove(f)
    fs = []
    with sync_playwright() as p:
        b, pg = abrir(p, base)
        if not con_subs:
            pg.add_style_tag(content=OCULTAR)
        for t in ts:
            cuadro(pg, t)
            f = f"{car}/portada_{t:06.2f}.jpg"
            pg.screenshot(path=f, type="jpeg", quality=95)
            fs.append(f)
        b.close()
    guia(fs, f"{car}/hoja_guia.jpg")
    print("portadas:", len(fs), "en", car)


def guia(fs, salida, col=4, w=360):
    h = int(w * 16 / 9)
    filas = (len(fs) + col - 1) // col
    hoja = Image.new("RGB", (w * min(col, len(fs)), h * filas))
    k = w / 1080  # guia pensada para vertical 1080x1920
    for i, f in enumerate(fs):
        im = Image.open(f).convert("RGB").resize((w, h))
        ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(ov)
        d.rectangle([0, 0, w, int(420 * k)], fill=(0, 0, 0, 150))
        d.rectangle([0, int(1500 * k), w, h], fill=(0, 0, 0, 150))
        d.line([0, int(240 * k), w, int(240 * k)], fill=(255, 200, 0, 255), width=1)
        d.line([0, int(1680 * k), w, int(1680 * k)], fill=(255, 200, 0, 255), width=1)
        im = Image.alpha_composite(im.convert("RGBA"), ov).convert("RGB")
        hoja.paste(im, ((i % col) * w, (i // col) * h))
    hoja.save(salida, quality=88)
    print("hoja guia:", salida)


if __name__ == "__main__":
    base = os.path.abspath(sys.argv[1])
    args = sys.argv[2:]
    con_subs = "--subs" in args
    ts = [float(x) for x in args if x != "--subs"]
    portadas(base, ts, con_subs)
