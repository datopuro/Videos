"""Música y efectos de Mary Anning, mezcla del completo y de los reels.
ENTRADAS: voz del completo, voz de los reels (ya armada por reels_def.py), alineacion.json de cada carpeta.
SALIDAS:  mary/completo/mezcla.wav y mary/reels/mezcla.wav a −14 LUFS; fondo.npy (música + efectos del completo).
Referencias:
https://ffmpeg.org/ffmpeg-filters.html#loudnorm : normalizar a −14 LUFS integrados (nivel de redes).
https://en.wikipedia.org/wiki/Sidechain_compression : bajar la música cuando habla la voz (ducking).
Base de síntesis (pads, arpegio, reverberación, golpes, viento): musica_base.py, copiada del video de Larisa
(historias/videos/larisa-savitskaya/fuentes/musica_lar.py) y con progresión, tempo y efectos propios de esta historia."""
import sys, json
import numpy as np
sys.path.insert(0, '/home/claude/mary/build')
from musica_base import leer, mezclar, SR, env, bp, lp, hp, ruido, curva, mtof, fftconvolve
from tiempos import cargar, cuando
from reels_def import plan, CORTES

PC = cargar('/home/claude/mary/completo')
c = lambda f, **k: cuando(PC, f, **k)
rng = np.random.default_rng(23)


def musica(DUR):
    N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
    pts = [(0, 0.35), (10, 0.5), (24, 0.45), (45, 0.4), (49, 0.55), (67, 0.5), (110, 0.6), (127, 0.45), (142, 0.55), (170, 0.6), (189, 0.8),
           (206, 0.65), (221, 0.85), (250, 0.75), (264, 0.8), (277, 0.6), (299, 0.5), (314, 0.35), (322, 0.5), (344, 0.75), (351, 0.8), (366, 1.0), (371, 0.9), (DUR, 0.0)]
    nivel = lambda t: curva(t, pts)
    prog = [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59]]
    prog_fin = [[41, 48, 53, 57], [43, 50, 55, 59], [48, 55, 60, 64], [48, 52, 55, 60]]
    bar = 4 * 60 / 62
    t = 0.0; ci = 0; cd = 2 * bar
    while t < DUR:
        ch = (prog_fin if t > 344 else prog)[ci % 4]
        n0 = int(t * SR); n = min(int((cd + 2.5) * SR), N - n0)
        if n <= 0: break
        tt = np.arange(n) / SR; e = env(n, 2.0, 2.5); gl = 0.05 * nivel(t)
        for m in ch:
            f = mtof(m)
            s = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt + 0.3) + 0.08 * np.sin(2 * np.pi * 3 * f * tt)
            s2 = np.sin(2 * np.pi * f * 1.004 * tt + 1.0)
            L[n0:n0 + n] += gl * e * (s * 0.7 + s2 * 0.3); R[n0:n0 + n] += gl * e * (s * 0.3 + s2 * 0.7)
        fb = mtof(ch[0] - 12); sb = np.sin(2 * np.pi * fb * tt) * env(n, 0.8, 2.0) * 0.07 * nivel(t)
        L[n0:n0 + n] += sb; R[n0:n0 + n] += sb
        dens = 0.0 if 314 < t < 322 else 0.35 if t < 189 else 0.55
        arp = [ch[0] + 12, ch[2], ch[1] + 12, ch[3], ch[2] + 12, ch[3], ch[1] + 12, ch[2]]
        for b in range(8):
            tn = t + b * bar / 4
            if tn >= DUR - 1 or rng.random() > dens: continue
            f = mtof(arp[b] + 12); i0 = int(tn * SR); dn = min(int(3 * SR), N - i0)
            x = np.arange(dn) / SR
            tone = sum(a * np.sin(2 * np.pi * f * h * x + ph) * np.exp(-x * (1.6 + h)) for h, a, ph in [(1, 1, 0), (2, 0.3, 0.2), (3, 0.1, 0.5)])
            tone *= np.minimum(1, x / 0.004) * 0.08 * nivel(tn); pan = 0.5 + 0.35 * np.sin(arp[b])
            L[i0:i0 + dn] += tone * (1 - pan) * 1.4; R[i0:i0 + dn] += tone * pan * 1.4
        t += cd; ci += 1
    a, b = int(206.8 * SR), int(231.5 * SR); tt = np.arange(b - a) / SR
    puls = np.sin(2 * np.pi * mtof(33) * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 1.2 * tt))) * np.linspace(0.02, 0.07, b - a)
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
    def boom(d=3.0, f0=70, f1=28):
        n = int(d * SR); x = np.arange(n) / SR; f = np.linspace(f0, f1, n)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2.2) + lp(ruido(n), 900) * np.exp(-x * 4) * 0.8
    def golpe(d=0.35, f=90): n = int(d * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * f * x) * np.exp(-x * 18) + lp(ruido(n), 2000) * np.exp(-x * 40) * 0.6
    def piedras(d=2.0):
        n = int(d * SR); x = np.zeros(n)
        for k in range(26):
            i = int(rng.random() * n * 0.8); m = int(0.06 * SR); y = bp(ruido(m), 400 + rng.random() * 1500, 3500) * np.exp(-np.arange(m) / SR * 60)
            x[i:i + m] += y[:max(0, min(m, n - i))] * (0.4 + rng.random())
        return x + lp(ruido(n), 300) * np.exp(-np.arange(n) / SR * 1.5) * 0.6
    mar = lambda n: lp(ruido(n), 700) * (0.55 + 0.45 * np.sin(np.arange(n) / SR * 2 * np.pi / 6.5)) + hp(lp(ruido(n), 5000), 1500) * 0.15 * (0.5 + 0.5 * np.sin(np.arange(n) / SR * 2 * np.pi / 6.5))
    lluvia = lambda n: hp(lp(ruido(n), 7000), 1500) * 0.6 + bp(ruido(n), 300, 900) * 0.3
    pluma = lambda n: bp(ruido(n), 2500, 7000) * (np.sin(np.arange(n) / SR * 2 * np.pi * 3.1) > 0.2)
    def tic(): n = int(0.05 * SR); x = np.arange(n) / SR; return lp(ruido(n), 3000) * np.exp(-x * 120) + np.sin(2 * np.pi * 900 * x) * np.exp(-x * 90) * 0.5
    tR = c('cae sobre un árbol')
    tramo(0, c('y mata a tres mujeres'), lluvia, 0.06, 0.4, 0.6); pon(tR + 0.05, boom(3.5, 90, 30), 0.6); pon(tR + 0.02, hp(ruido(int(0.4 * SR)), 2000) * np.exp(-np.arange(int(0.4 * SR)) / SR * 10), 0.25)
    for a, b in [(c('Se llama Mary Anning.'), c('Veintitrés años después')), (c('Su papá es carpintero'), c('Y lleva el nombre')), (c('Mary y su hermano Joseph salen'), c('Desde entonces, Mary anota')),
                 (c('El señor del pueblo les paga'), c('Poco después, el cirujano')), (c('En mil ochocientos veinte, no lo encuentra.'), c('Sin fósiles, no hay dinero.')),
                 (c('Mary se queda en Lyme Regis'), c('Adentro, el reverendo')), (c('Mary sigue yendo al acantilado.'), c('En una carta cuenta')), (c('Lo aprendieron, en buena parte'), c('Pero lo único de ella'))]:
        tramo(a, b, mar, 0.05, 0.6, 0.6)
    tramo(c('Cuando Mary tiene once años'), c('Se lastima,'), lambda n: bp(ruido(n), 200, 2000), 0.05, 0.6, 0.2)
    pon(c('resbala de noche') + 0.9, piedras(1.6), 0.2)
    tramo(c('Después de una tormenta'), c('En mil ochocientos veinte, no lo encuentra.'), lluvia, 0.045, 0.8, 0.6)
    tramo(c('Después de una tormenta'), c('En mil ochocientos veinte, no lo encuentra.'), mar, 0.06, 0.8, 0.6)
    pon(c('se come un pedazo') + 0.2, boom(2.5, 60, 25), 0.45); pon(c('se come un pedazo') + 0.25, piedras(2.4), 0.3)
    pon(c('Mary tiene que llegar') + 2.0, piedras(1.4), 0.2)
    for t0 in (c('Mary encuentra el resto'),): [pon(t0 + 0.5 + k * 0.9, golpe(0.12, 900), 0.06) for k in range(4)]
    pon(c('en una subasta en Londres') + 0.2, golpe(0.2, 300), 0.25); pon(c('en una subasta en Londres') + 0.55, golpe(0.2, 300), 0.25)
    tramo(c('Tres años después, diez de diciembre'), c('Es su hallazgo más importante'), mar, 0.05, 0.6, 0.6)
    for k in range(10): pon(c('Tres años después, diez de diciembre') + 1.2 + k * 1.3, golpe(0.12, 900), 0.06)
    for a, b in [(c('Mary lo mide, lo dibuja') + 1.4, c('Ese dibujo empieza a circular')), (c('Desde entonces, Mary anota') + 1.6, c('El señor del pueblo les paga')), (c('En una carta cuenta'), c('Y el nueve de marzo'))]:
        tramo(a, b, pluma, 0.02, 0.2, 0.2)
    for f, v in [('es un fraude.', 1), ('es un fraude', 2)]: pon(c(f, vez=v), golpe(0.3, 70), 0.35)
    for f in ['SIN SU', 'Si encuentra algo que valga', 'Si no, venden otro mueble.', 'no deja entrar a mujeres.', 'El animal es real.', 'Creen que es de un cocodrilo.']:
        try: pon(c(f) + (0.4 if f == 'Si encuentra algo que valga' else 0.3 if f == 'Si no, venden otro mueble.' else 0), golpe(0.3, 70), 0.3)
        except KeyError: pass
    tD = c('un derrumbe mata a Tray') + 0.5
    pon(tD, boom(3.0, 55, 22), 0.55); pon(tD + 0.05, piedras(2.8), 0.4)
    tramo(c('Hasta llegar a París.'), c('Hasta llegar a París.') + 2.0, lambda n: bp(ruido(n), 300, 4000) * np.sin(np.linspace(0, np.pi, n)) ** 2, 0.06, 0.1, 0.1)
    return np.stack([fx, fx], 1)


if __name__ == '__main__':
    DUR = json.load(open('/home/claude/mary/completo/timeline.json'))['total'] + 0.5
    voz = leer('/home/claude/mary/completo/voz_original.mp3', DUR)
    m = musica(DUR); f = efectos(DUR)
    vr = np.sqrt(np.mean(voz[np.abs(voz) > 0.01] ** 2)); mr = np.sqrt(np.mean(m ** 2))
    m *= (vr * 10 ** (-17 / 20)) / mr
    f *= vr / 0.25 * 4
    fondo = m + f
    np.save('/home/claude/mary/build/fondo.npy', fondo.astype(np.float32))
    mezclar(voz, fondo, '/home/claude/mary/completo/mezcla.wav')
    P, TOT = plan(); RD = json.load(open('/home/claude/mary/reels/timeline.json'))['total'] + 0.5
    vr_ = leer('/home/claude/mary/reels/voz_original.mp3', RD); NR = len(vr_); fr = np.zeros((NR, 2))
    def copia(t0, a, d):
        i, j = int(t0 * SR), int(a * SR); n = min(int(d * SR), NR - i, len(fondo) - j)
        if n <= 0 or j < 0: return
        x = fondo[j:j + n].copy(); k = int(0.25 * SR); k = min(k, n // 2); x[:k] *= np.linspace(0, 1, k)[:, None]; x[n - k:] *= np.linspace(1, 0, k)[:, None]
        fr[i:i + n] += x
    for n, r in P.items():
        piezas = r['piezas']; ms = [p for _, p in piezas if p[0] == 'm'][0]
        antes = [(t0, p) for t0, p in piezas if t0 < [tt for tt, pp in piezas if pp[0] == 'm'][0]]
        t_m = [tt for tt, pp in piezas if pp[0] == 'm'][0]
        if antes: copia(r['ini'], max(0, ms[1] - (t_m - r['ini'])), t_m - r['ini'] + 0.25)
        copia(t_m, ms[1], ms[2] - ms[1])
        copia(t_m + ms[2] - ms[1] - 0.25, ms[2] - 0.25 if n < 4 else ms[2] - 0.25, r['fin'] - (t_m + ms[2] - ms[1]) + 0.25)
    mezclar(vr_, fr, '/home/claude/mary/reels/mezcla.wav')
    print('ok', round(DUR, 2), round(RD, 2))
