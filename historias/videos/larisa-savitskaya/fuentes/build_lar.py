js=''.join(open(f'/home/claude/tools/lar{i}.js').read()+'\n' for i in range(4))
open('/home/claude/lar/escena.html','w').write('''<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body>
<script>__CARICATURA__</script>
<script>
const D = __DATA__;
C.datos(D);
const g = C.lienzo();
'''+js+'''
window.listo = true;
</script>
</body></html>''')
