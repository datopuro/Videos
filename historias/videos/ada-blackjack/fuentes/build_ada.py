import json
subs=json.load(open('/home/claude/ada/subs.json'))
js=open('/home/claude/tools/ada.js').read()
open('/home/claude/ada/escena.html','w').write(f'''<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body>
<script>__CARICATURA__</script>
<script>
const D = __DATA__;
C.datos(D);
const g = C.lienzo();
const SUBS = {json.dumps(subs,ensure_ascii=False)};
{js}
window.listo = true;
</script>
</body></html>''')
