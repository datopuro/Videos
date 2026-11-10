import re
import subprocess
import sys

import numpy as np

SR = 44100


def leer(mp3, tempo):
    x = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-af", f"atempo={tempo}", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(x, dtype=np.float32).copy()


def pausas(x, umbral=-40, minimo=0.15):
    win = int(0.01 * SR)
    n = len(x) // win
    db = 20 * np.log10(np.sqrt(np.mean(x[:n * win].reshape(n, win) ** 2, axis=1) + 1e-12))
    voz = db > umbral
    ini = float(np.argmax(voz) * 0.01)
    fin = float((n - np.argmax(voz[::-1])) * 0.01)
    out, i = [], int(ini * 100)
    while i < int(fin * 100):
        if not voz[i]:
            j = i
            while j < n and not voz[j]:
                j += 1
            if (j - i) * 0.01 >= minimo:
                out.append((i * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    return ini, fin, out


def silabas(w):
    if re.search(r"\d", w):
        return 9.0 if len(re.sub(r"\D", "", w)) == 4 else 1.5
    return max(1, len(re.findall(r"[aeiouáéíóúü]+", w.lower())))


if __name__ == "__main__":
    mp3, guion = sys.argv[1], sys.argv[2]
    tempo = float(sys.argv[3]) if len(sys.argv) > 3 else 1.06
    x = leer(mp3, tempo)
    ini, fin, ps = pausas(x)
    print(f"voz {ini:.2f}-{fin:.2f}  duracion {len(x) / SR:.2f}")
    print("pausas:", " ".join(f"{a:.2f}-{b:.2f}" for a, b in ps))
    frases = [f.strip() for f in re.split(r"(?<=[.?!:])\s+", open(guion).read().replace("\n", " ")) if f.strip()]
    tot = sum(silabas(w) for f in frases for w in f.split())
    tramos, p0 = [], ini
    for a, b in ps:
        tramos.append((p0, a)); p0 = b
    tramos.append((p0, fin))
    hablado = sum(b - a for a, b in tramos)

    def real(v):
        acc = 0.0
        for a, b in tramos:
            if acc + (b - a) >= v:
                return a + (v - acc)
            acc += b - a
        return fin
    acc, malas = 0, 0
    for f in frases[:-1]:
        acc += sum(silabas(w) for w in f.split())
        t = real(hablado * acc / tot)
        p = min(ps, key=lambda q: abs(q[0] - t)) if ps else (t, t)
        ok = abs(p[0] - t) < 1.0
        malas += not ok
        print(f"{'OK ' if ok else '?? '}{f[:50]:50s} pred {t:6.2f}  pausa {p[0]:6.2f}-{p[1]:6.2f}")
    print(f"{len(frases)} frases, {len(ps)} pausas, {malas} finales sin pausa cercana")
