from PIL import Image, ImageDraw, ImageFont
IB='/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'; IS='/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
import os
if not os.path.exists(IB): IB='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
if not os.path.exists(IS): IS=IB
F=lambda s,b=True: ImageFont.truetype(IB if b else IS,s)
ROJO=(224,74,60); BLANCO=(255,255,255); NOCHE=(14,12,20)
def centrado(d,y,t,f,col,sw=7):
    w=d.textlength(t,font=f); d.text(((1080-w)/2,y),t,font=f,fill=col,stroke_width=sw,stroke_fill=NOCHE)
P=[(1,'Cayó 5,220 m sentada en un asiento.','Oficialmente, nunca pasó.','Continúa en la Parte 2'),
   (2,'Despertó sola en la taiga, herida.','Y nadie la estaba buscando.','Continúa en la Parte 3'),
   (3,'Sobrevivió a la caída.','Lo difícil vino después.','Fin de la historia')]
for n,l1,l2,ab in P:
    im=Image.new('RGBA',(1080,1920),(0,0,0,0)); d=ImageDraw.Draw(im)
    centrado(d,300,'LARISA SAVITSKAYA',F(78),BLANCO,8)
    pw=d.textlength(f'PARTE {n} DE 3',font=F(40))+64
    d.rounded_rectangle(((1080-pw)/2,415,(1080+pw)/2,477),31,fill=ROJO)
    d.text(((1080-pw)/2+32,421),f'PARTE {n} DE 3',font=F(40),fill=BLANCO)
    centrado(d,520,l1,F(38,False),BLANCO,5); centrado(d,570,l2,F(38,False),(255,205,195),5)
    centrado(d,1600,ab,F(46),ROJO,6)
    centrado(d,1665,'Historia real · Reconstrucción animada',F(30,False),(220,218,228),4)
    im.save(f'capa{n}.png')
print('ok')
