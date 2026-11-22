"""Música y efectos de Angela Woodruff; mezcla del completo y de los reels.
ENTRADAS: voz del completo, voz de los reels (reels_def.py), alineacion.json de cada carpeta y sonidos reales en
          /home/claude/angela/sonidos (copiados con comun/sonidos.py, todos CC0).
SALIDAS:  angela/completo/mezcla.wav y angela/reels/mezcla.wav a −14 LUFS.
Referencias:
https://ffmpeg.org/ffmpeg-filters.html#loudnorm : normalizar a −14 LUFS integrados.
https://en.wikipedia.org/wiki/Sidechain_compression : bajar la música cuando habla la voz.
historias/videos/mary-anning/fuentes/musica_mary.py : estructura de música sintetizada + efectos + armado de reels.
comun/sonidos.py : teléfono, puerta, lluvia y papel reales (CC0, sin crédito obligatorio)."""
import sys, json, subprocess
import numpy as np
sys.path.insert(0, '/home/claude/angela/build')
from musica_base import leer, mezclar, SR, env, bp, lp, hp, ruido, curva, mtof, fftconvolve
from tiempos import cargar, cuando
from reels_def import plan

A = '/home/claude/angela'
PC = cargar(f'{A}/completo')
c = lambda f, **k: cuando(PC, f, **k)
rng = np.random.default_rng(41)


def snd(nombre):
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"{A}/sonidos/{nombre}", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout, dtype=np.float32).astype(float)
    return x / (np.max(np.abs(x)) + 1e-9)


def musica(DUR):
    N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
    pts = [(0, 0.45), (14, 0.4), (33, 0.5), (51, 0.6), (55, 0.45), (82, 0.5), (130, 0.65), (150, 0.6), (164, 0.8), (177, 0.7), (197, 0.95), (220, 0.8),
           (222, 0.65), (238, 0.85), (251, 0.55), (272, 0.75), (280, 0.9), (287, 0.6), (293, 0.75), (302, 0.6), (DUR, 0.0)]
    nivel = lambda t: curva(t, pts)
    prog = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]]
    bar = 4 * 60 / 58; t = 0.0; ci = 0; cd = 2 * bar
    while t < DUR:
        ch = prog[ci % 4]; n0 = int(t * SR); n = min(int((cd + 2.5) * SR), N - n0)
        if n <= 0: break
        tt = np.arange(n) / SR; e = env(n, 2.2, 2.5); gl = 0.045 * nivel(t)
        for m in ch:
            f = mtof(m); s = np.sin(2 * np.pi * f * tt) + 0.2 * np.sin(2 * np.pi * 2 * f * tt + 0.4); s2 = np.sin(2 * np.pi * f * 1.003 * tt + 1.1)
            L[n0:n0 + n] += gl * e * (s * 0.7 + s2 * 0.3); R[n0:n0 + n] += gl * e * (s * 0.3 + s2 * 0.7)
        sb = np.sin(2 * np.pi * mtof(ch[0] - 12) * tt) * env(n, 0.8, 2.0) * 0.07 * nivel(t); L[n0:n0 + n] += sb; R[n0:n0 + n] += sb
        dens = 0.3 if t < 164 else 0.5 if t < 222 else 0.35
        arp = [ch[3] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[1] + 12, ch[2] + 12, ch[0] + 12]
        for b in range(8):
            tn = t + b * bar / 4
            if tn >= DUR - 1 or rng.random() > dens: continue
            f = mtof(arp[b]); i0 = int(tn * SR); dn = min(int(3 * SR), N - i0); x = np.arange(dn) / SR
            tone = sum(a * np.sin(2 * np.pi * f * h * x + ph) * np.exp(-x * (1.8 + h)) for h, a, ph in [(1, 1, 0), (2, 0.35, 0.2), (3, 0.12, 0.5)])
            tone *= np.minimum(1, x / 0.004) * 0.08 * nivel(tn); pan = 0.5 + 0.35 * np.sin(arp[b])
            L[i0:i0 + dn] += tone * (1 - pan) * 1.4; R[i0:i0 + dn] += tone * pan * 1.4
        t += cd; ci += 1
    a, b = int(c('Abren la tumba de Kathleen') * SR), int(c('El siete de septiembre, lo arrestan.') * SR); tt = np.arange(b - a) / SR
    puls = np.sin(2 * np.pi * mtof(38) * tt) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 1.0 * tt))) * np.linspace(0.02, 0.06, b - a); L[a:b] += puls; R[a:b] += puls
    L = lp(L, 5000); R = lp(R, 5000)
    irn = int(3.0 * SR); ir = ruido(irn) * np.exp(-np.arange(irn) / SR * 2.0); ir2 = ruido(irn) * np.exp(-np.arange(irn) / SR * 2.0)
    ir /= np.sqrt((ir ** 2).sum()); ir2 /= np.sqrt((ir2 ** 2).sum())
    L = 0.75 * L + 0.45 * fftconvolve(L, ir)[:N]; R = 0.75 * R + 0.45 * fftconvolve(R, ir2)[:N]
    return np.stack([L, R], 1)


def efectos(DUR, P, cf):
    N = int(SR * DUR); fx = np.zeros(N)
    def pon(t, x, g=1.0):
        if t is None: return
        i = int(t * SR); j = min(N, i + len(x));
        if j > i: fx[i:j] += x[:j - i] * g
    def golpe(d=0.3, f=70): n = int(d * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * f * x) * np.exp(-x * 18) + lp(ruido(n), 2000) * np.exp(-x * 40) * 0.6
    def toc(): n = int(0.12 * SR); x = np.arange(n) / SR; return bp(ruido(n), 300, 1500) * np.exp(-x * 45) + np.sin(2 * np.pi * 140 * x) * np.exp(-x * 40)
    def teclas(d):
        n = int(d * SR); x = np.zeros(n); t = 0.0
        while t < d - 0.1:
            i = int(t * SR); m = int(0.03 * SR); y = hp(ruido(m), 1500) * np.exp(-np.arange(m) / SR * 160); x[i:i + m] += y[:max(0, min(m, n - i))] * (0.6 + 0.4 * rng.random()); t += 0.07 + rng.random() * 0.09
        return x
    tel, puerta, lluvia, papel, libro, paso = (snd(f) for f in ['owlish-home-202-phone-phone3.wav', 'kenney-rpg-door-close-1.ogg', 'ylmir-rain-1.ogg', 'owlish-home-202-paper-stationery-stationery-19.wav', 'kenney-rpg-book-close.ogg', 'rubberduck-general-100-2-sfx100v2-footstep-wood-02.ogg'])
    def tramo(t0, t1, x, g):
        if t0 is None or t1 is None: return
        n = int((t1 - t0) * SR); y = np.resize(x, n) * env(n, 0.6, 0.6); pon(t0, y, g)
    tP = cf('Pocos días después, una oficina'); pon(tP, tel[:int(1.6 * SR)], 0.35)
    pon(cf('Su hija es abogada'), tel[:int(0.8 * SR)], 0.12)
    pon(cf('Su médico de años') and cf('Su médico de años') + 3.4, puerta, 0.4)
    for a, b in [(cf('Pero no hay autopsia, y la entierran.'), cf('Pocos días después, una oficina')), (cf('Para saber de qué murió Kathleen'), cf('Abren la tumba de Kathleen'))]: tramo(a, b, lluvia, 0.18)
    tramo(cf('Abren la tumba de Kathleen'), cf('Mientras esperan los resultados'), lluvia, 0.1)
    for f in ['Deja todo a su médico.', 'Ese detalle le va a costar', 'En el certificado escribe', 'El nuevo deja todo al doctor Shipman.', 'El testamento nuevo está mal escrito', 'Así que revisa', 'Los peritos la comparan', 'Y en el papel hay huellas', 'El certificado decía vejez.', 'La policía investigó en silencio', 'Todo empezó con un papel']:
        pon(cf(f), papel, 0.25)
    pon(cf('Hay algo más.') and cf('Hay algo más.') + 0.2, teclas(cf('Ese papel no parece escrito por ella.') - cf('Hay algo más.') - 0.4) if cf('Hay algo más.') else np.zeros(1), 0.12)
    for f, d in [('El testamento tiene dos testigos', 0.25), ('Angela los busca', 0.25)]:
        t0 = cf(f)
        if t0 is not None: [pon(t0 + d + k * 0.22, toc(), 0.25) for k in range(3)]
    for f in ['Nada para su hija.', 'No se parecen.', 'el testamento es falso.', 'es la misma.', 'cerró el caso sin cargos.', 'el testamento falso era el motivo.', 'y de falsificar el testamento', 'sobredosis de morfina']:
        t0 = cf(f); pon(t0 and t0 + 0.3, golpe(), 0.3)
    pon(cf('El siete de septiembre, lo arrestan.') and cf('El siete de septiembre, lo arrestan.') + 1.2, puerta, 0.45)
    pon(cf('Cuando termina'), libro, 0.3)
    return np.stack([fx, fx], 1)


def q(Pal, f, **k):
    try: return cuando(Pal, f, **k)
    except KeyError: return None


if __name__ == '__main__':
    DUR = json.load(open(f'{A}/completo/timeline.json'))['total'] + 0.5
    voz = leer(f'{A}/completo/voz_original.mp3', DUR)
    m = musica(DUR); f = efectos(DUR, PC, lambda s, **k: q(PC, s, **k))
    vr = np.sqrt(np.mean(voz[np.abs(voz) > 0.01] ** 2)); m *= (vr * 10 ** (-17 / 20)) / np.sqrt(np.mean(m ** 2)); f *= vr / 0.25 * 1.6
    fondo = m + f
    mezclar(voz, fondo, f'{A}/completo/mezcla.wav')
    P, TOT = plan(); RD = json.load(open(f'{A}/reels/timeline.json'))['total'] + 0.5
    vr_ = leer(f'{A}/reels/voz_original.mp3', RD); NR = len(vr_); fr = np.zeros((NR, 2))
    def copia(t0, a, d):
        i, j = int(t0 * SR), int(a * SR); n = min(int(d * SR), NR - i, len(fondo) - j)
        if n <= 0 or j < 0: return
        x = fondo[j:j + n].copy(); k = min(int(0.25 * SR), n // 2); x[:k] *= np.linspace(0, 1, k)[:, None]; x[n - k:] *= np.linspace(1, 0, k)[:, None]; fr[i:i + n] += x
    for n, r in P.items():
        piezas = r['piezas']; t_m, ms = [(tt, pp) for tt, pp in piezas if pp[0] == 'm'][0]
        if t_m > r['ini']: copia(r['ini'], max(0, ms[1] - (t_m - r['ini'])), t_m - r['ini'] + 0.25)
        copia(t_m, ms[1], ms[2] - ms[1]); copia(t_m + ms[2] - ms[1] - 0.25, ms[2] - 0.25, r['fin'] - (t_m + ms[2] - ms[1]) + 0.25)
    mezclar(vr_, fr, f'{A}/reels/mezcla.wav')
    print('ok', round(DUR, 2), round(RD, 2))
