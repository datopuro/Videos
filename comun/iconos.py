# Busca íconos de Tabler (MIT, https://github.com/tabler/tabler-icons) por nombre, etiqueta o categoría.
# Uso: python3 iconos.py buscar <palabras en inglés…>   → hasta 15 nombres para K.ico(g, nombre, …); "-f" = versión rellena.
import json
import os
import sys

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "npm", "node_modules", "@tabler", "icons", "icons.json")
if not os.path.exists(R):
    sys.exit("falta correr comun/instalar.sh")
d = json.load(open(R, encoding="utf-8"))
ps = [w.lower() for w in sys.argv[2:]] if len(sys.argv) > 2 and sys.argv[1] == "buscar" else sys.exit(__doc__ or "uso: iconos.py buscar <palabras>")
res = []
for n, v in d.items():
    tags = " ".join(str(x) for x in v.get("tags") or [] if x).lower()
    s = sum(3 if w == n else 2 if w in n.split("-") else 1 if w in n or w in tags or w == (v.get("category") or "").lower() else 0 for w in ps)
    if s and all(w in n or w in tags or w == (v.get("category") or "").lower() for w in ps):
        res.append((-s, len(n), n, "filled" in v.get("styles", {})))
for _, _, n, f in sorted(res)[:15]:
    print(n + (" (también " + n + "-f)" if f else ""))
print(f"{len(res)} coincidencias" if res else "sin coincidencias: probar otra palabra en inglés")
