# Música de fondo original para videos cortos, compuesta por reglas y tocada con instrumentos reales CC0.
# Referencias:
#   https://github.com/lemomo-ai/lemo-opuscar (core/audio/sampler.py, MIT): reproductor de samples que se usa aquí tal cual.
#   https://github.com/sgossner/VSCO-2-CE y https://github.com/sgossner/VCSL (CC0): orquesta y percusión afinada que suenan.
# Uso:
#   python3 fondo.py <salida.wav> <duracion_s> [estilo] [semilla] [bpm]
#   estilos: curioso, tension, calma, misterio
#   En mezcla.py: m.poner(0, m.archivo('musica.wav', 0.12), 'mus')
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import soundfile as sf
from core.audio import sampler as S
from core.audio.sfx import SR

NOTAS = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def acorde(nombre, octava=3):
    raiz = NOTAS[nombre[0]] + (1 if '#' in nombre else -1 if 'b' in nombre[1:2] else 0)
    menor = nombre.endswith('m')
    base = 12 * (octava + 1) + raiz
    return [base, base + (3 if menor else 4), base + 7]


ESTILOS = {
    'curioso': dict(bpm=104, prog=['Dm', 'Bb', 'F', 'C'], pulso='violins_pizz', bajo='contrabass_pizz', color='marimba', pad='violas', brillo='glockenspiel'),
    'tension': dict(bpm=88, prog=['Am', 'Am', 'F', 'E'], pulso='violins_spic', bajo='cellos_spic', color='timpani', pad='violins_trem', brillo=None),
    'calma': dict(bpm=76, prog=['C', 'Am', 'F', 'G'], pulso='harp', bajo='cellos', color='vibraphone', pad='violins', brillo=None),
    'misterio': dict(bpm=70, prog=['Em', 'C', 'Am', 'B'], pulso='vibraphone_bowed', bajo='contrabass', color='harp', pad='violas', brillo='tubular_bells'),
}


def componer(dur, estilo='curioso', semilla=1, bpm=None):
    e = ESTILOS[estilo]
    rng = np.random.default_rng(semilla)
    bpm = bpm or e['bpm']
    pulso = 60 / bpm
    compas = 4 * pulso
    ev = []
    n = int(np.ceil(dur / compas)) + 1
    for k in range(n):
        t0 = k * compas
        c = acorde(e['prog'][k % len(e['prog'])])
        ev.append((t0, e['bajo'], c[0] - 12, pulso * 1.6, 0.55, 0.0))
        ev.append((t0 + 2 * pulso, e['bajo'], c[0] - 12 + (7 if k % 2 else 0), pulso * 1.6, 0.45, 0.0))
        if e['pad'] and k % 2 == 0:
            for j, nota in enumerate(c):
                ev.append((t0, e['pad'], nota + 12, compas * 2, 0.28, -0.3 + 0.3 * j))
        for b in range(8):
            if rng.random() < (0.85 if b % 2 == 0 else 0.45):
                nota = c[rng.integers(3)] + 12 * (1 + (rng.random() < 0.3))
                ev.append((t0 + b * pulso / 2, e['pulso'], nota, pulso * 0.5, 0.35 + 0.2 * (b % 4 == 0), rng.uniform(-0.4, 0.4)))
        if e['color'] == 'timpani':
            ev.append((t0, 'timpani', c[0] - 12, pulso, 0.5, 0.0))
        elif k % 2 == 1:
            for b, nota in enumerate([c[2] + 12, c[1] + 12, c[0] + 24]):
                ev.append((t0 + (2 + b * 0.5) * pulso, e['color'], nota, pulso, 0.4, 0.25))
        if e['brillo'] and k % 4 == 3:
            ev.append((t0 + 3 * pulso, e['brillo'], c[0] + 36, pulso * 2, 0.16, -0.2))
    ev = [(t, i, S.name(p) if isinstance(p, (int, np.integer)) else p, d, v, pan) for t, i, p, d, v, pan in ev if t < dur]
    mix = S.render(ev, dur=dur + 1.5)
    mix = S.room(mix, size=0.5, mix=0.2)
    f = np.ones(len(mix))
    a, b = int(0.4 * SR), int(1.5 * SR)
    f[:a] = np.linspace(0, 1, a)
    f[-b:] = np.linspace(1, 0, b)
    mix = (mix * f[:, None])[: int((dur + 1.5) * SR)]
    return mix / max(1e-9, np.abs(mix).max()) * 0.9, sorted({x[1] for x in ev})


if __name__ == '__main__':
    salida, dur = sys.argv[1], float(sys.argv[2])
    estilo = sys.argv[3] if len(sys.argv) > 3 else 'curioso'
    semilla = int(sys.argv[4]) if len(sys.argv) > 4 else 1
    bpm = float(sys.argv[5]) if len(sys.argv) > 5 else None
    mix, usados = componer(dur, estilo, semilla, bpm)
    sf.write(salida, mix, SR)
    print('ok', salida, f'{len(mix) / SR:.1f} s', estilo, 'instrumentos:', ', '.join(usados))
    print('créditos:', ' | '.join(S.credits(usados)) if S.credits(usados) else 'solo CC0, sin crédito obligatorio')
