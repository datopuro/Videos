# Dato Puro: kit de render

Librería con la que se arman los videos del canal (kit.js, render.py, módulos en `kit/mod/`, demos en `kit/galeria/`).

Restaurar en un chat nuevo de Claude:

```bash
git clone --depth 1 https://github.com/datopuro/Videos /home/claude/dp
ln -sfn /home/claude/dp/kit /home/claude/kit
bash /home/claude/kit/instalar.sh 2>&1 | tail -3
```

En Windows (`C:\dato-puro`): `python kit/instalar.py`.
