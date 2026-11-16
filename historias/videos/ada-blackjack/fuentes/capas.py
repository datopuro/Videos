import json
from PIL import Image, ImageDraw, ImageFont
LI='/usr/share/fonts/truetype/google-fonts/Lora-Italic-Variable.ttf'
LB='/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf'
def F(s,it=False,b='Bold'):
    f=ImageFont.truetype(LI if it else LB,s)
    try: f.set_variation_by_name('Bold Italic' if it else 'Bold')
    except Exception as e: pass
    return f
ROSA=(243,183,198); CREMA=(255,246,234); NOCHE=(24,16,36)
def centrado(d,y,t,f,col,sw=7):
    w=d.textlength(t,font=f); d.text(((1080-w)/2,y),t,font=f,fill=col,stroke_width=sw,stroke_fill=NOCHE)
PARTES=[
 (1,'Aceptó un trabajo de un año.','Nadie le dijo que serían dos.','Continúa en la Parte 2'),
 (2,'Se quedó sola con un hombre enfermo.','Y con un lápiz, hizo cuentas.','Continúa en la Parte 3'),
 (3,'Oyó un ruido entre la niebla.','Era un barco. Llegaba un año tarde.','Fin de la historia')]
for n,l1,l2,ab in PARTES:
    im=Image.new('RGBA',(1080,1920),(0,0,0,0)); d=ImageDraw.Draw(im)
    centrado(d,320,'ADA BLACKJACK',F(84),CREMA,8)
    pw=d.textlength(f'PARTE {n} DE 3',font=F(40))+64
    d.rounded_rectangle(((1080-pw)/2,435,(1080+pw)/2,497),31,fill=ROSA)
    d.text(((1080-pw)/2+32,441),f'PARTE {n} DE 3',font=F(40),fill=NOCHE)
    centrado(d,540,l1,F(38,True),CREMA,5); centrado(d,590,l2,F(38,True),CREMA,5)
    centrado(d,1590,ab,F(46,True),ROSA,6)
    centrado(d,1655,'Historia real · Reconstrucción animada',F(30),(225,215,235),4)
    im.save(f'capa{n}.png')
s=json.load(open('/home/claude/ada/subs.json'))
cortes=[(0,155.0),(155.0,299.7),(299.7,404.0)]
def tc(x): h=int(x//3600);m=int(x%3600//60);return f'{h}:{m:02d}:{x%60:05.2f}'
for n,(a,b) in enumerate(cortes,1):
    o=open(f'p{n}.ass','w')
    o.write('''[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: S,DejaVu Sans,60,&H00EAF6FF,&H00FFFFFF,&H00241018,&H80000000,-1,0,0,0,100,100,0,0,1,6,2,8,70,70,1300,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
''')
    for i0,i1,t in s:
        if i1>a and i0<b:
            o.write(f'Dialogue: 0,{tc(max(i0,a)-a)},{tc(min(i1,b)-a)},S,,0,0,0,,{t}\n')
