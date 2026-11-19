"""Busca en alineacion.json el segundo en que la voz dice una frase (igual que C.cuando)."""
import json, re, unicodedata
def norma(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', s)).strip()
def cargar(carpeta):
    w = json.load(open(f'{carpeta}/alineacion.json'))['words']
    P = [(norma(x['text']), x['start'], x['end']) for x in w]
    return [p for p in P if p[0]]
def cuando(P, frase, vez=1, fin=False):
    q = norma(frase).split(); c = 0
    for i in range(len(P) - len(q) + 1):
        if all(P[i + j][0] == x for j, x in enumerate(q)):
            c += 1
            if c == vez: return P[i + len(q) - 1][2] if fin else P[i][1]
    raise KeyError(frase)
