# Índice del kit de historias (leer esto, no el código)

Restaurar: `git clone --depth 1 https://github.com/datopuro/Videos /home/claude/repo && ln -sfn /home/claude/repo/historias/kit /home/claude/kit` · dependencias: `sh kit/instalar.sh`
Render: `python3 kit/render.py muestras|tramo|paralelo|codificar <carpeta> ...` · revisión: `revisa_auto.py <mp4>` (texto) y `revisa.py <mp4> <dir> <seg>` (hoja).
Carpeta de escena: `escena.html`, `formato.json` ({"ancho","alto","fps"}; vertical 1080×1920), `timeline.json`, `voz.f32` opcional (mueve bocas con `habla:true`).
Archivos JS: `caricatura.js` (base, fondos, efectos, personaje B) + `rig2.js` (animación v2, `personaje2`). render.py los inyecta juntos en `__CARICATURA__`.
Ejemplos completos: `escenas/juliane_piloto.html` (v1.2) y `escenas/juliane_caida.html` (v2, la referencia actual).

## Esqueleto de escena.html
```html
<script>__CARICATURA__</script><script>
const D = __DATA__; C.datos(D); const g = C.lienzo();
const p = C.personaje2({...receta});  const lug = C.lugar({...receta_fondo});
window.renderAt = t => { g.limpiar(); const cam = C.encuadre(x, y, zoom);
  lug.fondo(g, cam, t); C.iluminar(g, gg => p.dibujar(gg, {t, x, y, cara, pose, mira}), {tinte, borde});
  lug.frente(g, cam, t); /* efectos, textos */ };
window.listo = true;</script>
```

## Funciones públicas
| Función | Qué hace |
|---|---|
| `C.personaje2(rec).dibujar(g,{t,x,y,escala,cara,pose,mira:[x,y],manoI,manoD,pelo,falda,lentes,descalzo,habla,sombra})` | Personaje estilo B (el aprobado). Pose libre `{sentado,suelo,tor,cab,hombros,dx,dy,bi,bd,pi,pd}` |
| `C.personajeB(rec)` | Estilo B v1.2 con poses de catálogo `C.POSES_B` (más simple) |
| `C.cara2(nombre|obj)`, `C.mezclarCara2(a,b,k)` | Caras `C.CARAS2`: neutral feliz tranquila miedo terror apretada sorpresa dolor triste dormida; campos cej cejI cejD cejY ojoH plato boca ab rubor sucio |
| `C.pista(t,[[t0,v],[t1,v,'sal'],...])` | Animación por claves (números o vectores); curvas suave sal ent reb lin |
| `C.resorte(fn,t,{t0,f,z})` | Sigue a `fn(t)` con retraso y rebote (pelo, ropa, cámara) |
| `C.ruido(t,s)`, `C.dardos(t,s,per)`, `C.hash(n)` | Ruido suave; saltos rápidos (miradas); aleatorio fijo |
| `C.ik2(a,b,l1,l2,elige)` | Codo/rodilla para que mano/pie llegue a un punto |
| `C.iluminar(g,fn,{tinte,borde,off,bordeK})` | Tinte de escena + luz de contorno sobre lo que dibuje `fn` |
| `C.cache(w,h,fn)` | Dibuja algo grande una vez (canvas reutilizable) |
| `C.lugar(rec).fondo(g,cam,t)` / `.frente(g,cam,t)` | Fondo por capas cielo/lejos/fondo/medio/frente con paralaje |
| `C.encuadre(x,y,zoom)`, `C.camLerp(a,b,u)`, `cam.temblor`, `cam.rot` | Cámara |
| `C.gradacion(g,arriba,abajo,k)`, `C.rayos`, `C.lluvia`, `C.niebla`, `C.relampago(g,t,t0)`, `C.grano`, `C.vineta`, `C.fundido` | Luz y ambiente |
| `C.rotulo`, `C.cartel(g,titulo,sub,a)`, `C.globo(g,txt,x,y,a)`, `C.subTemp`, `C.dividida` | Textos |
| `C.asientoFrente`, `C.brazosAsiento`, `C.cinturonFrente`, `C.rr` | Objetos sueltos |
| `C.ventana(t,t0,t1,d)`, `C.suave`, `C.salida`, `C.rebote`, `C.lerp`, `C.clamp` | Utilidades de tiempo |

Módulos de fondo (`mod`): cielo sol nubes ciudad_lejana edificios calle pared piso ventana puerta estante mostrador letrero lampara arbol colinas rect · dosel selva_lejos selva_troncos suelo_selva helecho hoja_grande dosel_abajo · avion_interior cabina.

## Recetas
Personaje (`personajes/*.json`): `{id, cuerpo:{complexion,estatura,cabeza,ojos}, piel, pelo:{estilo:largo|corto|coleta|calvo,color}, ropa:{arriba:{tipo,color}, abajo:{tipo,color}, pies:{color,descalzo:'i'|'d'|'ambos'}}}`.
Fondo (`fondos/*.json`): `{id, hora, capas:{cielo|lejos|fondo|medio|frente:[{mod, ...parámetros}]}}` → `C.lugar(rec)`.

## Si necesito X, uso Y
| Necesito | Uso |
|---|---|
| Expresión que cambia | `C.mezclarCara2(a,b,C.suave((t-t0)/0.4))`; golpe: `C.rebote` |
| Movimiento con anticipación | `C.pista` con curvas `reb`/`sal` |
| Pelo/vestido con viento | `pelo:[dx,dy]`, `falda:[dx,dy]` + `C.resorte` |
| Mano que agarra algo | `manoI`/`manoD` en coordenadas del personaje |
| Personaje integrado a la luz | envolver `dibujar` en `C.iluminar` |
| Fondo enorme que gira | `C.cache` + `drawImage` |
| Susto | `cam.temblor` + `C.relampago` + `plato:1` |
| Sonido real (papel, puerta, pasos) | `SONIDO.md`: `sfx_buscar.py` (Freesound CC0, solo en la laptop) + `m.archivo(ruta, amp)` en `mezcla.py` |
| Transición tinta o puertas | `dato-puro/kit/mod/transiciones.js` (tipos `tinta`, `puertas`, `papel`…): copiar con `cp`, probar |
| Diálogo con boca | `habla` (número 0..1 o `C.rms(t)` si hay voz.f32); la narración NO mueve bocas |

Límites: el personaje solo existe de frente (no perfil ni espalda); manos sin dedos.
