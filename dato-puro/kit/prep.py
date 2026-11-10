import json
import os
import re
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from trozos import trozos

SR = 44100
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
CFG = json.load(open(f"{OUT}/bloques.json", encoding="utf-8"))
TEMPO = CFG.get("tempo", 1.06)
B = CFG["bloques"]

x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{OUT}/{CFG.get('voz', 'voz_original.mp3')}", "-af", f"atempo={TEMPO}", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, dtype=np.float32).copy()
win = int(0.01 * SR)
n = len(x) // win
db = 20 * np.log10(np.sqrt(np.mean(x[:n * win].reshape(n, win) ** 2, axis=1) + 1e-12))
voz = db > -40
ini0 = float(np.argmax(voz) * 0.01)

ALI = None
if os.path.exists(f"{OUT}/alineacion.json"):
    a = json.load(open(f"{OUT}/alineacion.json", encoding="utf-8"))
    if "words" in a:
        ALI = [(w["text"], w["start"] / TEMPO, w["end"] / TEMPO) for w in a["words"] if w.get("type", "word") == "word"]
    else:
        a = a.get("alignment") or a.get("normalized_alignment") or a
        ch, t0s, t1s = a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]
        ALI, w, wi = [], "", None
        for c, p, q in zip(ch, t0s, t1s):
            if c.isspace():
                if w:
                    ALI.append((w, wi / TEMPO, fin / TEMPO))
                w = ""
                continue
            if not w:
                wi = p
            w += c
            fin = q
        if w:
            ALI.append((w, wi / TEMPO, fin / TEMPO))
    ALI_i = 0


def tramos(a, z):
    out, i = [], int(a * 100)
    while i < int(z * 100):
        if voz[i]:
            j = i
            while j < int(z * 100) and (voz[j] or (j + 4 < len(voz) and voz[j:j + 5].any())):
                j += 1
            out.append([i * 0.01, j * 0.01])
            i = j
        else:
            i += 1
    return out or [[a, z]]


def silabas(w):
    if re.search(r"\d", w):
        return 9.0 if len(re.sub(r"\D", "", w)) == 4 else 1.5
    return max(1, len(re.findall(r"[aeiouáéíóúü]+", w.lower()))) + (0.7 if re.search(r"[,:;.…?]$", w) else 0)


def tiempos(pals, a, z):
    global ALI_i
    if ALI is not None:
        out = []
        for p in pals:
            w, s, e = ALI[ALI_i]
            ALI_i += 1
            if re.sub(r"\W", "", w.lower()) != re.sub(r"\W", "", p.lower()):
                print("AVISO alineacion:", repr(w), "vs guion", repr(p))
            out.append((s, e))
        return out
    tr = tramos(a, z)
    V = sum(q - p for p, q in tr)
    pes = np.array([silabas(w) for w in pals])
    bp = np.concatenate([[0], np.cumsum(pes) / pes.sum()]) * V

    def real(v):
        acc = 0.0
        for p, q in tr:
            if acc + (q - p) >= v - 1e-9:
                return p + (v - acc)
            acc += q - p
        return tr[-1][1]
    return [(real(bp[i]), real(bp[i + 1])) for i in range(len(pals))]


bloques = {}
for k, frases in enumerate(B):
    segs, subs = [], []
    for fr in frases:
        texto, a, z = (fr + [None, None])[:3] if isinstance(fr, list) else (fr, None, None)
        a = ini0 if a is None else a
        z = len(x) / SR if z is None else z
        pals = texto.split()
        tw = tiempos(pals, a, z)
        segs.append({"texto": texto, "ini": tw[0][0], "fin": tw[-1][1]})
        j = 0
        for p in trozos(texto):
            m = len(p.split())
            ws = [{"w": pals[j + q], "ini": tw[j + q][0], "fin": tw[j + q][1]} for q in range(m)]
            subs.append({"texto": p, "ini": ws[0]["ini"], "fin": ws[-1]["fin"], "palabras": ws})
            j += m
    bloques[f"{k + 1:02d}"] = {"ini": segs[0]["ini"], "fin": segs[-1]["fin"], "segmentos": segs, "subs": subs}
total = len(x) / SR + CFG.get("cola", 1.6)
v = np.zeros(int(total * SR), np.float32)
v[:len(x)] = x
v.tofile(f"{OUT}/voz.f32")
json.dump({"sr": SR, "total": total, "bloques": bloques}, open(f"{OUT}/timeline.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for b, d in bloques.items():
    print(b, f"{d['ini']:6.2f}-{d['fin']:6.2f}", " | ".join(s["texto"] for s in d["subs"]))
print("total", round(total, 2), "| tiempos de", "ElevenLabs" if ALI is not None else "silabas+pausas")
