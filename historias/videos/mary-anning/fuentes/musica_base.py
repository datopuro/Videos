import numpy as np, subprocess, sys
from scipy.signal import fftconvolve, butter, sosfilt
SR = 44100
rng = np.random.default_rng(11)


def mtof(m): return 440 * 2 ** ((m - 69) / 12)


def env(n, a, r, sus=1.0):
    e = np.ones(n) * sus; na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, sus, na); e[-nr:] *= np.linspace(1, 0, nr); return e


def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)


def ruido(n): return rng.standard_normal(n)


def curva(t, pts): return np.interp(t, [p[0] for p in pts], [p[1] for p in pts])


def leer(mp3, dur=None):
    v = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, dtype=np.float32).astype(np.float64)
    if dur: v = np.concatenate([v, np.zeros(max(0, int(dur * SR) - len(v)))])[:int(dur * SR)]
    return v


def musica(DUR):
    N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
    nivel = lambda t: curva(t, [(0, 0.5), (21, 0.35), (37, 0.5), (73, 0.55), (79, 0.75), (98, 0.9), (113.9, 1.0), (114.0, 0.0), (118, 0.35), (153, 0.45), (170, 0.4), (198, 0.6), (209, 0.75), (215, 0.55), (256, 0.5), (277, 0.6), (290, 0.7), (305, 0.85), (315, 0.9), (DUR, 0.0)])
    prog = [[50, 57, 62, 65], [46, 53, 58, 62], [41, 48, 53, 57], [45, 52, 57, 61]]
    prog_fin = [[46, 53, 58, 62], [41, 48, 53, 57], [43, 50, 55, 58], [50, 57, 62, 66]]
    bar = 4 * 60 / 66
    t = 0.0; ci = 0; cd = 2 * bar
    while t < DUR:
        ch = (prog_fin if t > 290 else prog)[ci % 4]
        n0 = int(t * SR); n = min(int((cd + 2.5) * SR), N - n0)
        if n <= 0: break
        tt = np.arange(n) / SR; e = env(n, 1.8, 2.5); gl = 0.05 * nivel(t)
        for k, m in enumerate(ch):
            f = mtof(m)
            s = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt + 0.3) + 0.1 * np.sin(2 * np.pi * 3 * f * tt)
            s2 = np.sin(2 * np.pi * f * 1.005 * tt + 1.0)
            L[n0:n0 + n] += gl * e * (s * 0.7 + s2 * 0.3); R[n0:n0 + n] += gl * e * (s * 0.3 + s2 * 0.7)
        fb = mtof(ch[0] - 12); sb = np.sin(2 * np.pi * fb * tt) * env(n, 0.8, 2.0) * 0.07 * nivel(t)
        L[n0:n0 + n] += sb; R[n0:n0 + n] += sb
        dens = 0.25 if 114 < t < 215 else 0.55 if t < 79 or t > 215 else 0.0
        arp = [ch[0] + 12, ch[2], ch[1] + 12, ch[3], ch[2] + 12, ch[3], ch[1] + 12, ch[2]]
        for b in range(8):
            tn = t + b * bar / 4
            if tn >= DUR - 1 or rng.random() > dens: continue
            f = mtof(arp[b] + 12); i0 = int(tn * SR); dn = min(int(3 * SR), N - i0)
            x = np.arange(dn) / SR
            tone = sum(a * np.sin(2 * np.pi * f * h * x + ph) * np.exp(-x * (1.4 + h)) for h, a, ph in [(1, 1, 0), (2, 0.3, 0.2), (3, 0.1, 0.5)])
            tone *= np.minimum(1, x / 0.004) * 0.09 * nivel(tn); pan = 0.5 + 0.35 * np.sin(arp[b])
            L[i0:i0 + dn] += tone * (1 - pan) * 1.4; R[i0:i0 + dn] += tone * pan * 1.4
        t += cd; ci += 1
    a, b = int(79.0 * SR), int(113.95 * SR); tt = np.arange(b - a) / SR
    puls = (np.sin(2 * np.pi * mtof(38) * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (1.6 + tt / 20) * tt)))) * np.linspace(0.02, 0.09, b - a)
    L[a:b] += puls; R[a:b] += puls
    L = lp(L, 5000); R = lp(R, 5000)
    irn = int(3.0 * SR); ir = ruido(irn) * np.exp(-np.arange(irn) / SR * 2.0); ir2 = ruido(irn) * np.exp(-np.arange(irn) / SR * 2.0)
    ir /= np.sqrt((ir ** 2).sum()); ir2 /= np.sqrt((ir2 ** 2).sum())
    L = 0.75 * L + 0.45 * fftconvolve(L, ir)[:N]; R = 0.75 * R + 0.45 * fftconvolve(R, ir2)[:N]
    return np.stack([L, R], 1)


def efectos(DUR):
    N = int(SR * DUR); fx = np.zeros(N)
    def pon(t, x, g=1.0):
        i = int(t * SR); j = min(N, i + len(x)); fx[i:j] += x[:j - i] * g
    def tramo(t0, t1, gen, g, fi=0.5, fo=0.5):
        n = int((t1 - t0) * SR); x = gen(n) * env(n, fi, fo); pon(t0, x, g)
    viento = lambda n: bp(ruido(n), 200, 2500) * (0.7 + 0.3 * np.sin(np.arange(n) / SR * 1.3))
    lluvia = lambda n: hp(lp(ruido(n), 7000), 1500) * 0.6 + bp(ruido(n), 300, 900) * 0.3
    def boom(d=3.0, f0=70, f1=28):
        n = int(d * SR); x = np.arange(n) / SR; f = np.linspace(f0, f1, n)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2.2) + lp(ruido(n), 900) * np.exp(-x * 4) * 0.8)
    def golpe(d=0.35, f=90): n = int(d * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * f * x) * np.exp(-x * 18) + lp(ruido(n), 2000) * np.exp(-x * 40) * 0.6
    def whoosh(d=1.0, rev=False):
        n = int(d * SR); x = bp(ruido(n), 300, 4000) * np.sin(np.linspace(0, np.pi, n)) ** 2
        return x[::-1] if rev else x
    def tic(): n = int(0.03 * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * 2400 * x) * np.exp(-x * 200)
    def helic(n, k0, k1):
        x = np.arange(n) / SR; ch = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 4.8 * x)) * np.exp(-((x * 4.8) % 1) * 5)
        return lp(ruido(n), 400) * ch * np.linspace(k0, k1, n) + np.sin(2 * np.pi * 55 * x) * 0.2 * np.linspace(k0, k1, n)
    tramo(0, 20.6, viento, 0.10, 1.0, 0.6); pon(19.6, whoosh(1.6, True), 0.18)
    tramo(21.4, 33.4, lambda n: bp(ruido(n), 150, 1200), 0.025, 1, 0.5)
    for t0 in (24.0, 24.35): pon(t0, np.sin(2 * np.pi * 1800 * np.arange(int(0.6 * SR)) / SR) * np.exp(-np.arange(int(0.6 * SR)) / SR * 6), 0.05)
    tramo(35.7, 36.3, lambda n: bp(ruido(n), 800, 4000) * (0.5 + 0.5 * np.sign(np.sin(np.arange(n) / SR * 2 * np.pi * 22))), 0.06, 0.02, 0.05); pon(36.3, golpe(0.3, 120), 0.12)
    tramo(37.8, 52.4, lambda n: bp(ruido(n), 1500, 5000) * (np.sin(np.arange(n) / SR * 2 * np.pi * 24) > 0.6), 0.02, 1, 1)
    for k in range(int((66.2 - 63.6) * 8)): pon(63.6 + k / 8, tic(), 0.06)
    tramo(73.0, 85.5, lambda n: lp(ruido(n), 300) * 0.8 + np.sin(2 * np.pi * 92 * np.arange(n) / SR) * 0.3, 0.05, 1, 0.05)
    pon(85.5, boom(4.0, 80, 25), 0.55); pon(85.55, golpe(0.5, 60), 0.3)
    tramo(85.6, 113.9, viento, 0.16, 0.3, 0.05); pon(92.8, whoosh(0.8), 0.2)
    tramo(108, 113.9, lambda n: hp(ruido(n), 2000) * np.linspace(0.3, 1, n), 0.06, 0.5, 0.05)
    pon(113.95, boom(1.6, 55, 30), 0.5)
    tramo(116.0, 153.5, lluvia, 0.05, 2, 0.5); tramo(153.5, 164.0, lluvia, 0.045, 0.3, 0.5); tramo(164.0, 170.1, lluvia, 0.03, 0.3, 1); tramo(189.2, 198.7, lluvia, 0.035, 0.5, 1.5)
    tramo(132.3, 142.3, lambda n: np.sin(2 * np.pi * (620 + 40 * np.sin(np.arange(n) / SR * 7)) * np.arange(n) / SR) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 3)), 0.012, 0.5, 1)
    n = int(6.2 * SR); pon(170.1, helic(n, 0.0, 1.0) * np.sin(np.linspace(0, np.pi, n)) ** 0.5, 0.25)
    n = int(6.5 * SR); pon(182.7, helic(n, 0.7, 0.0), 0.2)
    for k in range(6): pon(203.8 + k * 0.62, golpe(0.25, 180), 0.12)
    n = int(4.0 * SR); pon(205.0, helic(n, 0.0, 0.9), 0.2)
    for t0, g in [(214.0, 0.3), (228.6, 0.25), (238.0, 0.25), (252.5, 0.2), (255.2, 0.3)]: pon(t0, golpe(0.4, 70), g)
    pon(217.6, whoosh(0.8), 0.06); pon(212.4, whoosh(0.9), 0.05)
    for t0 in (243.6, 249.8): pon(t0, whoosh(0.5), 0.05)
    pon(287.0, golpe(0.15, 900), 0.08)
    tramo(305.6, 314.5, lambda n: bp(ruido(n), 1500, 5000) * (np.sin(np.arange(n) / SR * 2 * np.pi * 24) > 0.6), 0.015, 1, 1)
    return np.stack([fx, fx], 1)


def mezclar(voz, fondo, ruta):
    N = len(voz); fondo = fondo[:N]
    w = int(0.05 * SR); e = np.sqrt(np.convolve(voz ** 2, np.ones(w) / w, 'same'))
    ev = np.convolve((e > 0.01).astype(float), np.ones(int(0.4 * SR)) / int(0.4 * SR), 'same')
    duck = (1 - 0.45 * np.clip(ev, 0, 1))[:, None]
    out = np.stack([voz, voz], 1) + fondo * duck
    out = out / np.max(np.abs(out)) * 0.9
    out.astype(np.float32).tofile('/tmp/mez.f32')
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "/tmp/mez.f32", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "44100", ruta], check=True)


if __name__ == '__main__':
    DUR = 323.0
    voz = leer('/home/claude/lar/voz.mp3', DUR)
    m = musica(DUR); f = efectos(DUR)
    vr = np.sqrt(np.mean(voz[voz != 0] ** 2)); mr = np.sqrt(np.mean(m ** 2))
    m *= (vr * 10 ** (-16 / 20)) / mr
    f *= vr / 0.25 * 4
    fondo = m + f
    np.save('/home/claude/lar/fondo.npy', fondo.astype(np.float32))
    mezclar(voz, fondo, '/home/claude/lar/mezcla.wav')
    print('ok', np.max(np.abs(fondo)))
