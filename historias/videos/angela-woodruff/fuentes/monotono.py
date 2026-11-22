"""Corrige alineacion.json para que ninguna palabra empiece antes que la anterior (C.probarVoz lo exige)."""
import json, sys
p = sys.argv[1] + '/alineacion.json'; d = json.load(open(p)); n = 0
for a, b in zip(d['words'], d['words'][1:]):
    if b['start'] < a['start'] + 0.01:
        b['start'] = round(a['start'] + 0.02, 3); b['end'] = max(b['end'], b['start'] + 0.05); n += 1
    if a['end'] > b['start']: a['end'] = b['start']
json.dump(d, open(p, 'w'), ensure_ascii=False); print(p, 'corregidas', n)
