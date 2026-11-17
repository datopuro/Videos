"""Saca el tiempo de cada palabra del guion directamente de la voz, sin el JSON de ElevenLabs.

ENTRADAS: carpeta del video con bloques.json (el guion por bloques y frases) y el mp3 de la voz.
SALIDAS:  alineacion.json en esa carpeta (una entrada por palabra del guion, en segundos del mp3 original),
          que prep.py ya sabe leer; y en consola, las diferencias entre lo que dice el guion y lo que se oye.

Uso: python3 kit/alinear.py carpeta_del_video        (después: python3 kit/prep.py carpeta_del_video)

Cómo funciona: un reconocedor de voz escucha el audio y da cada sílaba con su instante. Esas palabras oídas se
emparejan con las del guion; donde coinciden se copia el tiempo y donde no (un número, un nombre raro) el hueco se
reparte por sílabas entre las dos palabras vecinas que sí coincidieron. Al final el inicio y el fin de cada palabra
se ajustan al volumen real para que no caigan dentro de un silencio.

Referencias:
https://github.com/k2-fsa/sherpa-onnx : motor que corre el modelo sin GPU; de aquí sale OfflineRecognizer.from_transducer
  y la lista result.tokens / result.timestamps (un instante por sílaba).
https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3 : el modelo (25 idiomas, incluye español, licencia CC-BY-4.0);
  se baja ya convertido desde los "releases" de sherpa-onnx.
https://docs.python.org/3/library/difflib.html#difflib.SequenceMatcher : emparejar la lista de palabras del guion
  con la lista de palabras oídas.
"""
import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata

import numpy as np

KIT = os.path.dirname(os.path.abspath(__file__))
M = f"{KIT}/parakeet-v3"
URL = "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2"
SR = 16000


def preparar():
    try:
        import sherpa_onnx
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "--break-system-packages", "-q", "sherpa-onnx"], check=True)
    if not os.path.exists(f"{M}/encoder.int8.onnx"):
        print("bajando el modelo de voz (650 MB, una sola vez por sesión)...", flush=True)
        subprocess.run(f"curl -sSL {URL} | tar xj -C {KIT} && mv {KIT}/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 {M}", shell=True, check=True)


def norma(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in w if unicodedata.category(c) != "Mn" or c == "̃"))


def silabas(w):
    if re.search(r"\d", w):
        return 2.0 + 1.5 * len(re.sub(r"\D", "", w))
    return max(1, len(re.findall(r"[aeiouáéíóúü]+", w.lower())))


def energia(x):
    win = SR // 100
    n = len(x) // win
    db = 20 * np.log10(np.sqrt(np.mean(x[:n * win].reshape(n, win) ** 2, axis=1) + 1e-12))
    return db > -40


def cortes(voz, maximo=20.0):
    out, a, n = [0.0], 0, len(voz)
    while (n - a) / 100 > maximo:
        lo, hi = a + int(maximo * 60), a + int(maximo * 100)
        mejor, largo, i = None, 0, lo
        while i < hi:
            if not voz[i]:
                j = i
                while j < n and not voz[j]:
                    j += 1
                if j - i > largo:
                    mejor, largo = (i + j) // 2, j - i
                i = j
            else:
                i += 1
        a = mejor if mejor is not None else hi
        out.append(a / 100)
    return out + [n / 100]


def oir(x, voz):
    import sherpa_onnx as so
    rec = so.OfflineRecognizer.from_transducer(encoder=f"{M}/encoder.int8.onnx", decoder=f"{M}/decoder.int8.onnx", joiner=f"{M}/joiner.int8.onnx", tokens=f"{M}/tokens.txt", model_type="nemo_transducer", num_threads=2)
    oidas = []
    cs = cortes(voz)
    for a, b in zip(cs[:-1], cs[1:]):
        s = rec.create_stream()
        s.accept_waveform(SR, x[int(a * SR):int(b * SR)])
        rec.decode_stream(s)
        for tok, ts in zip(s.result.tokens, s.result.timestamps):
            if tok.startswith(" ") or not oidas:
                oidas.append([tok.strip(), a + ts])
            else:
                oidas[-1][0] += tok
    return [(w, t) for w, t in oidas if norma(w)]


def guion(cfg):
    pals = []
    for bloque in cfg["bloques"]:
        for fr in bloque:
            pals += (fr[0] if isinstance(fr, list) else fr).split(" ")
    return [p for p in pals if p]


def alinear(pals, oidas, voz, dur):
    A, B = [norma(p) for p in pals], [norma(w) for w, _ in oidas]
    ini = [None] * len(pals)
    difs = []
    sm = difflib.SequenceMatcher(None, A, B, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                ini[i1 + k] = oidas[j1 + k][1]
        elif i2 > i1:
            t0 = oidas[j1][1] if j1 < len(oidas) else (oidas[-1][1] if oidas else 0.0)
            t1 = oidas[j2][1] if j2 < len(oidas) else dur
            if j1 == j2:
                t0 = max((v for v in ini[:i1] if v is not None), default=0.0)
                t0 = t0 + (t1 - t0) * 0.5 if i1 else 0.0
            pes = np.array([silabas(p) for p in pals[i1:i2]], float)
            acum = np.concatenate([[0], np.cumsum(pes)[:-1]]) / pes.sum()
            for k in range(i2 - i1):
                ini[i1 + k] = float(t0 + (t1 - t0) * acum[k])
            difs.append((t0, " ".join(pals[i1:i2]), " ".join(w for w, _ in oidas[j1:j2])))
        elif j2 > j1:
            difs.append((oidas[j1][1], "", " ".join(w for w, _ in oidas[j1:j2])))
    n = len(voz)
    out = []
    for k, p in enumerate(pals):
        a = ini[k]
        i = int(a * 100)
        if i < n and not voz[max(0, i - 2):i + 3].any():
            j = i
            while j < n and j < i + 30 and not voz[j]:
                j += 1
            a = j / 100
        sig = ini[k + 1] if k + 1 < len(pals) else dur
        j = min(n, int(sig * 100))
        while j > int(a * 100) + 8 and not voz[j - 1]:
            j -= 1
        b = max(a + 0.06, min(sig, j / 100 + 0.02))
        out.append({"text": p, "start": round(a, 3), "end": round(b, 3), "type": "word"})
    return out, difs, sm.ratio()


def main(carpeta):
    cfg = json.load(open(f"{carpeta}/bloques.json"))
    mp3 = f"{carpeta}/{cfg.get('voz', 'voz_original.mp3')}"
    preparar()
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, dtype=np.float32)
    voz = energia(x)
    oidas = oir(x, voz)
    pals = guion(cfg)
    words, difs, parecido = alinear(pals, oidas, voz, len(x) / SR)
    json.dump({"words": words, "origen": "alinear.py (parakeet-tdt-0.6b-v3)"}, open(f"{carpeta}/alineacion.json", "w"), ensure_ascii=False)
    print(f"palabras del guion: {len(pals)} | oídas: {len(oidas)} | coincidencia: {parecido * 100:.1f} %")
    for t, g, o in difs:
        print(f"  {t:7.2f} s  guion: {g or '(nada)':40s} | voz: {o or '(nada)'}")
    if parecido < 0.85:
        print("AVISO: el audio se parece poco al guion. Revisa que sea el mp3 correcto antes de animar.")
    print("alineacion.json listo; ahora corre prep.py")
    return words, difs, parecido


if __name__ == "__main__":
    main(os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "."))
