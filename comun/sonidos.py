#!/usr/bin/env python3
"""Biblioteca de sonidos sin internet para los dos canales: 730 efectos, 44 transiciones, 85 remates y 31 canciones,
cada uno con su licencia comprobada. Los archivos NO están en este repo: se bajan de GitHub la primera vez (9 s, 250 MB).

ENTRADAS: palabras a buscar (español o inglés), o ids de sonidos y la carpeta del video.
SALIDAS:  lista de candidatos con duración y licencia; o los sonidos copiados a <carpeta>/sonidos/ con CREDITOS.txt.

Uso:
  python3 comun/sonidos.py buscar puerta madera              (--tipo sfx|transicion|remate|musica, --libre = solo CC0, --n 12)
  python3 comun/sonidos.py ver kenney-rpg-door-open-1
  python3 comun/sonidos.py copiar <carpeta_video> id1 id2 ...
  python3 comun/sonidos.py categorias
En mezcla.py: m.archivo('sonidos/<id>.ogg', 0.4)  (ffmpeg lee ogg, wav y mp3).

Referencias:
https://github.com/kaomei/stickman-video-director : la biblioteca (assets/b-audio-library), su catalog.json con
  etiquetas, duración y licencia por sonido, y CREDITS.md con el texto de crédito exacto de cada pieza CC-BY.
  Código del repo con licencia MIT; cada grabación conserva su propia licencia (825 CC0, 59 CC-BY-4.0, 6 CC-BY-3.0).
https://git-scm.com/docs/git-sparse-checkout : bajar solo la carpeta de audio sin clonar todo el repo (que pesa ~550 MB).
https://creativecommons.org/publicdomain/zero/1.0/ : CC0, se usa sin dar crédito.
https://creativecommons.org/licenses/by/4.0/ : CC-BY, exige crédito en la descripción del video y decir qué se cambió.
"""
import json
import os
import shutil
import subprocess
import sys
import unicodedata

REPO = "https://github.com/kaomei/stickman-video-director"
COMMIT = "f59453689af24255aa5989151fc9ab83f4d6357c"
SUB = "skills/directing-stickman-videos/assets/b-audio-library"
DEST = os.environ.get("SONIDOS_DIR", "/home/claude/sonidos")
LIB = f"{DEST}/{SUB}"

TIPOS = {"sfx": "sfx", "efecto": "sfx", "transicion": "transition", "remate": "stinger", "musica": "music"}
ES = {
    "puerta": "door", "llave": "keys", "cerradura": "lock", "pasos": "footsteps walk", "paso": "footstep walk", "papel": "paper",
    "libro": "book", "hoja": "page", "dinero": "money", "moneda": "coin", "monedas": "coins", "billete": "money", "agua": "water",
    "lluvia": "rain", "salpicar": "splash", "chapoteo": "splash", "golpe": "impact hit punch", "pegar": "punch hit", "puño": "punch",
    "madera": "wood", "metal": "metal", "vidrio": "glass", "cristal": "glass", "plastico": "plastic", "tela": "cloth",
    "cuero": "leather", "cocina": "kitchen", "plato": "plate", "beber": "drinking", "perro": "dog", "gato": "cat",
    "caballo": "horse", "pasto": "grass", "hierba": "grass", "nieve": "snow", "bosque": "forest", "fuego": "fire",
    "aplausos": "applause", "telefono": "phone", "camara": "camera", "campana": "bell", "boton": "click", "clic": "click",
    "interfaz": "interface ui", "error": "error", "zumbido": "whoosh", "barrido": "swish whoosh", "latigo": "whip",
    "espada": "blade", "cuchillo": "blade", "rechinido": "creak", "crujido": "creak", "chistoso": "comedy", "comedia": "comedy",
    "rebote": "boing bounce", "chirrido": "squeak", "baba": "slime squish", "ambiente": "ambience", "maquina": "machine",
    "rio": "stream", "arroyo": "stream", "naturaleza": "nature", "borrar": "erase", "electrico": "zap electronic",
    "juego": "game 8bit", "videojuego": "game 8bit pixel", "misterio": "mysterious", "suspenso": "suspense", "miedo": "horror eerie",
    "terror": "horror", "triste": "sad", "alegre": "upbeat happy", "calma": "calm", "tranquilo": "calm relaxed",
    "epico": "epic", "accion": "action", "tension": "tension suspense", "final": "ending", "inicio": "opening",
    "trompeta": "trumpet", "piano": "piano", "bici": "bicycle", "bicicleta": "bicycle", "claxon": "horn", "bocina": "horn",
    "caida": "drop", "abrir": "open", "cerrar": "close", "pagina": "page", "escribir": "scratch pencil", "lapiz": "pencil",
}


def sin_acentos(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")


def bajar():
    if os.path.exists(f"{LIB}/catalog.json"):
        return
    print("bajando la biblioteca de sonidos (250 MB, una vez por sesión)...", file=sys.stderr, flush=True)
    shutil.rmtree(DEST, ignore_errors=True)
    q = dict(check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run(["git", "clone", "-q", "--filter=blob:none", "--no-checkout", "--sparse", REPO, DEST], **q)
    subprocess.run(["git", "-C", DEST, "sparse-checkout", "set", SUB], **q)
    subprocess.run(["git", "-C", DEST, "checkout", "-q", COMMIT], **q)


def catalogo():
    bajar()
    return json.load(open(f"{LIB}/catalog.json", encoding="utf-8"))["assets"]


def texto(a):
    return sin_acentos(" ".join([a["id"], a["title"], a["category"]] + [t for t in a["tags"] if t.isascii()]))


def licencia(a):
    return a["license"]["id"].replace("-1.0", "").replace("CC-BY-", "BY")


def linea(a, p=None):
    return f"{a['id']:44s} {a['kind']:10s} {a['duration']:6.2f} s  {licencia(a):5s} {a['category']}" + (f"  [{p}]" if p else "")


def buscar(args):
    tipo, libre, n, pals = None, False, 12, []
    i = 0
    while i < len(args):
        if args[i] == "--tipo":
            tipo = TIPOS[sin_acentos(args[i + 1])]
            i += 2
        elif args[i] == "--n":
            n = int(args[i + 1])
            i += 2
        elif args[i] == "--libre":
            libre = True
            i += 1
        else:
            pals.append(sin_acentos(args[i]))
            i += 1
    grupos = [[p] + ES.get(p, "").split() for p in pals]
    res = []
    for a in catalogo():
        if (tipo and a["kind"] != tipo) or (libre and a["license"]["id"] != "CC0-1.0"):
            continue
        tx = texto(a)
        palabras = set(sin_acentos(" ".join([a["title"], a["category"]] + [t for t in a["tags"] if t.isascii()])).replace("-", " ").split())
        p = 0
        for g in grupos:
            v = max((3 if w in palabras else 1 if w in tx else 0) for w in g if w)
            if v == 0:
                p = -1
                break
            p += v
        if p > 0 or not grupos:
            res.append((p, a))
    res.sort(key=lambda r: (-r[0], r[1]["kind"] != "sfx", r[1]["duration"]))
    for p, a in res[:n]:
        print(linea(a))
    print(f"{len(res)} resultados" + (" (muestro los primeros %d)" % n if len(res) > n else ""))
    if not res:
        print("sin resultados: prueba en inglés o con 'categorias'")


def ver(args):
    cat = {a["id"]: a for a in catalogo()}
    for i in args:
        a = cat[i]
        print(linea(a))
        print("  etiquetas:", ", ".join(t for t in a["tags"] if t.isascii()))
        print("  autor:", a["author"], "| fuente:", a["source_url"])
        print("  archivo:", f"{LIB}/{a['path']}")
        if a["license"].get("attribution_required"):
            print("  crédito obligatorio:", a["license"]["attribution"].replace("\n", " / "))


def copiar(args):
    carpeta, ids = args[0], args[1:]
    cat = {a["id"]: a for a in catalogo()}
    falta = [i for i in ids if i not in cat]
    if falta:
        sys.exit("no existen: " + ", ".join(falta) + " (usa los ids tal cual los da 'buscar')")
    os.makedirs(f"{carpeta}/sonidos", exist_ok=True)
    ruta_cred = f"{carpeta}/sonidos/CREDITOS.txt"
    previos = json.load(open(f"{carpeta}/sonidos/usados.json")) if os.path.exists(f"{carpeta}/sonidos/usados.json") else []
    usados = list(dict.fromkeys(previos + ids))
    for i in ids:
        a = cat[i]
        ext = os.path.splitext(a["path"])[1]
        shutil.copyfile(f"{LIB}/{a['path']}", f"{carpeta}/sonidos/{i}{ext}")
        print(f"sonidos/{i}{ext}   {a['duration']:.2f} s  {licencia(a)}")
    by = [cat[i] for i in usados if cat[i]["license"].get("attribution_required")]
    cc0 = [cat[i] for i in usados if not cat[i]["license"].get("attribution_required")]
    with open(ruta_cred, "w", encoding="utf-8") as f:
        if by:
            f.write("PEGAR EN LA DESCRIPCIÓN DEL VIDEO (licencia CC-BY: obligatorio):\n\n")
            for a in by:
                f.write("\n".join(l for l in a["license"]["attribution"].strip().splitlines() if not l.startswith("Library copy")) + "\nCambios: recortado, volumen ajustado y sincronizado con la animación.\n\n")
        else:
            f.write("Ningún sonido exige crédito.\n\n")
        if cc0:
            f.write("Sin obligación de crédito (CC0), para registro:\n")
            for a in cc0:
                f.write(f"- {a['id']}: {a['author']}, {a['source_url']}\n")
    json.dump(usados, open(f"{carpeta}/sonidos/usados.json", "w"))
    print(f"créditos en {ruta_cred}" + (f"  ({len(by)} exigen crédito en la descripción)" if by else "  (ninguno exige crédito)"))


def categorias(args):
    import collections
    c = collections.Counter((a["kind"], a["category"]) for a in catalogo())
    for (k, cat), n in sorted(c.items()):
        print(f"{k:10s} {cat:24s} {n}")


if __name__ == "__main__":
    ord_ = {"buscar": buscar, "ver": ver, "copiar": copiar, "categorias": categorias}
    if len(sys.argv) < 2 or sys.argv[1] not in ord_:
        sys.exit(__doc__.split("Referencias:")[0])
    ord_[sys.argv[1]](sys.argv[2:])
