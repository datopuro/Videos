import glob
import os
import subprocess
import sys

from PIL import Image, ImageDraw

v, out = sys.argv[1], sys.argv[2]
cada = float(sys.argv[3]) if len(sys.argv) > 3 else 3.0
os.makedirs(out, exist_ok=True)
for f in glob.glob(f"{out}/f_*.png") + glob.glob(f"{out}/hoja_*.jpg"):
    os.remove(f)
subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vf", f"fps=1/{cada},scale=480:-2", f"{out}/f_%04d.png"], check=True)
fs = sorted(glob.glob(f"{out}/f_*.png"))
if not fs:
    sys.exit("sin cuadros")
a = Image.open(fs[0])
w, h = a.size
col = 5 if w >= h else 10
por_hoja = col * 4
for k in range(0, len(fs), por_hoja):
    parte = fs[k:k + por_hoja]
    filas = (len(parte) + col - 1) // col
    im = Image.new("RGB", (w * col, h * filas))
    dr = ImageDraw.Draw(im)
    for i, f in enumerate(parte):
        x, y = (i % col) * w, (i // col) * h
        im.paste(Image.open(f), (x, y))
        s = (k + i) * cada
        dr.text((x + 6, y + h - 16), f"{int(s // 60):02d}:{s % 60:04.1f}", fill=(255, 255, 0))
    im.save(f"{out}/hoja_{k // por_hoja}.jpg", quality=85)
print(len(fs), "cuadros, cada", cada, "s")
