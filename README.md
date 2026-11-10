# Videos: kits de render

Un repo, dos proyectos separados. Cada uno solo usa su carpeta.

| Carpeta | Proyecto |
|---|---|
| `dato-puro/kit/` | Dato Puro (divulgación, videos verticales) |
| `historias/kit/` | Canal de historias animadas |

## Restaurar en un chat nuevo de Claude

Dato Puro:
```bash
git clone --depth 1 https://github.com/datopuro/Videos /home/claude/repo && ln -sfn /home/claude/repo/dato-puro/kit /home/claude/kit && bash /home/claude/kit/instalar.sh 2>&1 | tail -3
```

Historias:
```bash
git clone --depth 1 https://github.com/datopuro/Videos /home/claude/repo && ln -sfn /home/claude/repo/historias/kit /home/claude/kit
```

Al cambiar un kit, subir el cambio a su carpeta para que el siguiente chat baje la versión nueva.
