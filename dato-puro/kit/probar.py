import os
import subprocess
import sys
import time

KIT = os.path.dirname(os.path.abspath(__file__))
DEMOS = {
    "tinta": [1, 2.6, 5.8, 7],
    "graficas": [1, 4.6, 7.3, 9.8, 11.8, 13.9, 15.8],
    "objetos": [1, 4.2, 6.5, 10.2],
    "paisaje": [0.5, 3.75, 6.05, 8.35],
}

solo = sys.argv[1:]
fallas = []
for nombre, tiempos in DEMOS.items():
    if solo and nombre not in solo:
        continue
    t0 = time.time()
    r = subprocess.run([sys.executable, os.path.join(KIT, "render.py"), "muestras", os.path.join(KIT, "galeria", nombre), *map(str, tiempos)], capture_output=True, text=True)
    salida = r.stdout + r.stderr
    mal = r.returncode != 0 or "PAGEERR" in salida or "JS:" in salida
    print(("FALLA" if mal else "ok   "), nombre, round(time.time() - t0), "s")
    if mal:
        fallas.append(nombre)
        print(salida[-1500:])
print("hojas en kit/galeria/<demo>/m/hoja.jpg")
sys.exit(1 if fallas else 0)
