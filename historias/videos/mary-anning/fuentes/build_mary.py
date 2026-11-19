"""Arma escena.html (igual para el completo horizontal y los reels verticales) juntando mary0..mary9.js."""
import glob, json, os
B = '/home/claude/mary/build'
js = '\n'.join(open(f).read() for f in sorted(glob.glob(f'{B}/mary[0-9].js')))
html = ('<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head><body>\n<script>__CARICATURA__</script>\n'
        '<script>__MOD:utileria__</script>\n<script>__MOD:fondos__</script>\n<script>__MOD:voz__</script>\n<script>\n' + js + '\n</script></body></html>\n')
for d, f in [('completo', {"ancho": 1920, "alto": 1080, "fps": 24}), ('reels', {"ancho": 1080, "alto": 1920, "fps": 24})]:
    open(f'/home/claude/mary/{d}/escena.html', 'w').write(html)
    json.dump(f, open(f'/home/claude/mary/{d}/formato.json', 'w'))
print(len(html))
