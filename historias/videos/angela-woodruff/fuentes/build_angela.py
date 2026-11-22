"""Arma escena.html (igual para el completo horizontal y los reels verticales) juntando angela0..angela9.js."""
import glob, json, os
B = '/home/claude/angela/build'
js = '\n'.join(open(f).read() for f in sorted(glob.glob(f'{B}/angela[0-9].js')))
html = ('<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head><body>\n<script>__CARICATURA__</script>\n'
        '<script>__MOD:utileria__</script>\n<script>__MOD:fondos__</script>\n<script>__MOD:voz__</script>\n<script>\n' + js + '\n</script></body></html>\n')
for d, f in [('completo', {"ancho": 1920, "alto": 1080, "fps": 24}), ('reels', {"ancho": 1080, "alto": 1920, "fps": 24})]:
    open(f'/home/claude/angela/{d}/escena.html', 'w').write(html)
    json.dump(f, open(f'/home/claude/angela/{d}/formato.json', 'w'))
print(len(html))
