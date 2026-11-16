import json
S=json.load(open('/home/claude/lar/subs.json'))
EX={'entrada2':[(0.0,3.9,'Larisa Savitskaya acaba de caer 5,000 metros,'),(3.9,8.2,'sentada en un asiento, después de que su avión chocara con un bombardero.')],
 'entrada3':[(0.0,2.7,'Larisa cayó 5,000 metros'),(2.7,5.2,'y pasó tres días sola en la taiga, herida.'),(5.2,9.4,'Ya está a salvo. Pero su historia, no.')],
 'cierre1':[(0.0,2.2,'Cayó sola, herida,'),(2.2,4.1,'y nadie la está buscando.'),(4.1,5.9,'¿Cuánto puede aguantar?')],
 'cierre2':[(0.0,1.9,'La encontraron.'),(1.9,6.1,'Pero ¿qué hace un país con una sobreviviente de un accidente que decidió borrar?')],
 'sigueme_partes':[(0.0,4.0,'Sígueme para no perderte las siguientes partes y nuevas historias.')],
 'sigueme_nuevas':[(0.0,3.0,'Sígueme para no perderte nuevas historias.')]}
def tc(x): x=max(0,x); return f'{int(x//3600)}:{int(x%3600//60):02d}:{x%60:05.2f}'
def cab(w,h,fs,mv,box):
    return f'''[Script Info]
ScriptType: v4.00+
PlayResX: {w}
PlayResY: {h}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: S,Inter,{fs},&H00F6FAFF,&H00FFFFFF,{'&H70180E12' if box else '&H00180E12'},&H80000000,-1,0,0,0,100,100,0,0,{3 if box else 1},{14 if box else 6},{0 if box else 2},{2 if box else 8},90,90,{mv},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
def wrap(t,n):
    if len(t)<=n: return t
    w=t.split(); best=None
    for k in range(1,len(w)):
        a=' '.join(w[:k]); b=' '.join(w[k:]); s=max(len(a),len(b))
        if best is None or s<best[0]: best=(s,a+'\\N'+b)
    return best[1]
def escribir(ruta, piezas, w, h, fs, mv, box, n):
    o=open(ruta,'w'); o.write(cab(w,h,fs,mv,box))
    for (off,a,b,lista) in piezas:
        for i0,i1,t in lista:
            if i1>a and i0<b: o.write(f'Dialogue: 0,{tc(max(i0,a)-a+off)},{tc(min(i1,b)-a+off)},S,,0,0,0,,{wrap(t,n)}\n')
if __name__=='__main__':
    escribir('full.ass',[(0,0,1e9,S)],1920,1080,48,46,True,60)
