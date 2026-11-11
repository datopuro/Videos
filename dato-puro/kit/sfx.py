import json
import subprocess

import numpy as np

SR = 44100


class Mezcla:
    def __init__(self, base, semilla=8):
        self.base = base
        self.tl = json.load(open(f"{base}/timeline.json", encoding="utf-8"))
        self.B = self.tl["bloques"]
        self.total = self.tl["total"]
        self.voz = np.fromfile(f"{base}/voz.f32", dtype=np.float32).astype(np.float64)
        self.N = len(self.voz)
        self.fx = np.zeros(self.N)
        self.mus = np.zeros(self.N)
        self.rng = np.random.default_rng(semilla)
        self.tt = np.arange(self.N) / SR

    def S(self, b, i=0):
        return self.B[b]["segmentos"][i]["ini"]

    @staticmethod
    def limpia(w):
        return "".join(c for c in w.lower() if c not in "¿?¡!,.:;…\"'“”«»()—–-")

    def W(self, b, palabra, n=0):
        p, k = self.limpia(palabra), 0
        for sb in self.B[b]["subs"]:
            for w in sb["palabras"]:
                if self.limpia(w["w"]) == p:
                    if k == n:
                        return w["ini"]
                    k += 1
        raise KeyError(f"{palabra} (aparición {n}) no está en el bloque {b}")

    def env(self, n, at, dec):
        t = np.arange(n) / SR
        return np.clip(t / max(at, 1e-4), 0, 1) * np.exp(-t / dec)

    def lp(self, x, k):
        return np.convolve(x, np.ones(k) / k, "same")

    def poner(self, t, x, pista="fx"):
        arr = self.fx if pista == "fx" else self.mus
        i = int(max(t, 0) * SR)
        m = min(len(x), self.N - i)
        if m > 0:
            arr[i:i + m] += x[:m]

    def archivo(self, ruta, amp=0.5, recorte=None):
        a = ["ffmpeg", "-v", "error", "-i", ruta]
        if recorte:
            a += ["-ss", str(recorte[0]), "-t", str(recorte[1] - recorte[0])]
        x = np.frombuffer(subprocess.run(a + ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, dtype=np.float32).astype(np.float64)
        return self.norm(x, amp)

    def norm(self, x, amp):
        return amp * x / max(np.abs(x).max(), 1e-9)

    def boom(self, amp, d=3.0, f0=70, f1=28):
        n = int(d * SR)
        t = np.arange(n) / SR
        f = f1 + (f0 - f1) * np.exp(-t * 3)
        cuerpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * self.env(n, 0.004, d / 4)
        r1 = self.lp(self.rng.standard_normal(n), 60) * self.env(n, 0.002, d / 5)
        r2 = self.lp(self.rng.standard_normal(n), 8) * self.env(n, 0.001, 0.15)
        return self.norm(cuerpo + 1.6 * r1 / np.abs(r1).max() + 0.4 * r2 / np.abs(r2).max(), amp)

    def whoosh(self, d, amp, k=40):
        n = int(d * SR)
        return self.norm(self.lp(self.rng.standard_normal(n), k), amp) * np.sin(np.linspace(0, np.pi, n)) ** 2

    def oleaje(self, d, amp, sube=True):
        n = int(d * SR)
        e = np.linspace(0, 1, n) ** 2 if sube else np.linspace(1, 0, n) ** 2
        return self.norm(self.lp(self.rng.standard_normal(n), 120), amp) * e

    def brillo(self, d, amp, f0=2400, notas=14):
        n = int(d * SR)
        t = np.arange(n) / SR
        x = np.zeros(n)
        for k in range(notas):
            f = f0 * (1 + 0.5 * self.rng.random()) * (1.5 ** (k % 3))
            i0 = int(self.rng.random() * d * 0.8 * SR)
            x[i0:] += np.sin(2 * np.pi * f * t[:n - i0]) * self.env(n - i0, 0.002, 0.25)
        return self.norm(x, amp)

    def campana(self, amp, f, d=2.5):
        n = int(d * SR)
        t = np.arange(n) / SR
        x = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2.0 * f * t) + 0.25 * np.sin(2 * np.pi * 3.01 * f * t)) * self.env(n, 0.004, 0.7)
        return self.norm(x, amp)

    def bip(self, amp, f, d=0.08):
        n = int(d * SR)
        t = np.arange(n) / SR
        return amp * np.sin(2 * np.pi * f * t) * self.env(n, 0.002, 0.03)

    def click(self, amp, d=0.02):
        n = int(d * SR)
        return self.norm(self.rng.standard_normal(n) * self.env(n, 0.0005, 0.004), amp)

    def tecleo(self, t0, t1, amp=0.03, cps=14):
        t = t0
        while t < t1:
            self.poner(t, self.click(amp * (0.6 + 0.4 * self.rng.random())))
            t += (0.6 + 0.8 * self.rng.random()) / cps

    def chiptune(self, amp, f, d=0.12, duty=0.5):
        n = int(d * SR)
        t = np.arange(n) / SR
        return amp * np.where((t * f) % 1 < duty, 1.0, -1.0) * self.env(n, 0.002, d / 2)

    def nota(self, f, t0, t1, armonicos=((1, 1.0), (2, 0.35), (3, 0.15), (4, 0.07))):
        n = int((t1 - t0) * SR)
        t = np.arange(n) / SR
        x = np.zeros(n)
        for det in (-0.004, 0.0, 0.004):
            for h, a in armonicos:
                x += a * np.sin(2 * np.pi * f * (1 + det) * h * t + self.rng.random() * 6.28)
        at = min(2.5, (t1 - t0) / 3)
        return self.lp(x * np.clip(t / at, 0, 1) * np.clip((t1 - t0 - t) / at, 0, 1), 6)

    def pad(self, acordes, nivel=0.07, grave=45, zumbido=0.01):
        hz = lambda m: 440 * 2 ** ((m - 69) / 12)
        dur = self.total / len(acordes)
        for i, ac in enumerate(acordes):
            t0 = max(0, i * dur - 1.5)
            t1 = min(self.total, (i + 1) * dur + 1.5)
            for m in ac:
                self.poner(t0, self.nota(hz(m), t0, t1) * (1.2 if m < grave else 0.55), "mus")
        self.mus = self.mus / max(np.abs(self.mus).max(), 1e-9) * nivel
        if zumbido:
            self.mus += zumbido * np.sin(2 * np.pi * 36.7 * self.tt) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * self.tt))

    def arpegio(self, notas, t0, t1, paso=0.25, amp=0.02, forma="seno"):
        hz = lambda m: 440 * 2 ** ((m - 69) / 12)
        t, k = t0, 0
        while t < t1:
            f = hz(notas[k % len(notas)])
            x = self.chiptune(amp, f, paso * 0.9) if forma == "cuadrada" else self.campana(amp, f, paso * 3)
            self.poner(t, x, "mus")
            t += paso
            k += 1

    def finalizar(self, lufs=-14):
        m = self.voz + self.fx + self.mus
        m /= max(1.0, np.abs(m).max() / 0.95)
        m.astype(np.float32).tofile(f"{self.base}/mezcla.f32")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", f"{self.base}/mezcla.f32",
                        "-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=11", "-ar", str(SR), f"{self.base}/mezcla.wav"], check=True)
        print("ok mezcla")
