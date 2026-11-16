from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
LI='/usr/share/fonts/truetype/google-fonts/Lora-Italic-Variable.ttf'
LB='/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf'
def F(s,it=False):
    f=ImageFont.truetype(LI if it else LB,s)
    try: f.set_variation_by_name('Bold Italic' if it else 'Bold')
    except Exception: pass
    return f
ROSA=(243,183,198); CREMA=(255,246,234); NOCHE=(24,16,36)
def txt(d,x,y,t,f,col,sw=9,anchor='l'):
    w=d.textlength(t,font=f)
    if anchor=='c': x=x-w/2
    if anchor=='r': x=x-w
    d.text((x,y),t,font=f,fill=col,stroke_width=sw,stroke_fill=NOCHE)
def vertical(n,frame,cx,w,y0,t1,t2,sal):
    src=Image.open(frame).convert('RGB')
    bg=src.resize((1920,1080)).crop((660,0,1260,1080)).resize((1080,1920),Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
    bg=Image.eval(bg,lambda v:int(v*0.8)).convert('RGBA')
    x0=max(0,min(1920-w,cx-w//2)); fg=src.crop((x0,0,x0+w,1080)); h=int(1080*1080/w); fg=fg.resize((1080,h),Image.LANCZOS).convert('RGBA')
    m=np.ones((h,1080),dtype=np.float32); k=60
    for i in range(k): m[i,:]=i/k; m[h-1-i,:]=np.minimum(m[h-1-i,:],i/k)
    fg.putalpha(Image.fromarray((m*255).astype('uint8'))); bg.alpha_composite(fg,(0,y0))
    ov=Image.new('RGBA',(1080,1920),(0,0,0,0)); d=ImageDraw.Draw(ov)
    for y in range(1150,1920): d.line((0,y,1080,y),fill=(20,12,30,int(min(225,(y-1150)*0.45))))
    for y in range(0,320): d.line((0,y,1080,y),fill=(20,12,30,int((320-y)*0.6)))
    bg=Image.alpha_composite(bg,ov); d=ImageDraw.Draw(bg)
    pw=d.textlength(f'PARTE {n}',font=F(64))+70
    d.rounded_rectangle(((1080-pw)/2,110,(1080+pw)/2,200),45,fill=ROSA)
    d.text(((1080-pw)/2+35,118),f'PARTE {n}',font=F(64),fill=NOCHE)
    txt(d,540,1230,t1,F(112),CREMA,10,'c'); txt(d,540,1365,t2,F(112),ROSA,10,'c')
    txt(d,540,1530,'ADA BLACKJACK · HISTORIA REAL',F(40),CREMA,5,'c')
    bg.convert('RGB').save(f'miniatura_parte{n}.jpg',quality=92)
vertical(1,'c/e_43.png',1010,700,-330,'DEJÓ A SU HIJO','POR UN AÑO','')
vertical(2,'c/d_226.png',800,1100,330,'SOLA EN','EL ÁRTICO','')
vertical(3,'c/e_325.png',1150,1000,20,'NO ERA QUIEN','ESPERABA','')
def yt(frame,x0,w,nombre):
    src=Image.open(frame).convert('RGB'); y0=0
    im=src.crop((x0,y0,x0+w,w*9//16)).resize((1280,720),Image.LANCZOS).convert('RGBA')
    g=Image.new('RGBA',(1280,720)); d=ImageDraw.Draw(g)
    for x in range(480,1280): d.line((x,0,x,720),fill=(20,12,30,int(min(215,(x-480)*0.5))))
    im=Image.alpha_composite(im,g); d=ImageDraw.Draw(im)
    txt(d,1250,130,'2 AÑOS SOLA',F(100),CREMA,9,'r'); txt(d,1250,255,'EN UNA ISLA',F(100),ROSA,9,'r')
    bw=d.textlength('HISTORIA REAL',font=F(40))+54
    d.rounded_rectangle((1250-bw,420,1250,485),32,fill=ROSA); d.text((1250-bw+27,427),'HISTORIA REAL',font=F(40),fill=NOCHE)
    txt(d,1250,520,'Ada Blackjack · 1923',F(40,True),CREMA,5,'r')
    im.convert('RGB').save(nombre,quality=93)
yt('c/c_140.png',0,1920,'miniatura_youtube.jpg')
s=Image.new('RGB',(1620,960))
for i in range(3): s.paste(Image.open(f'miniatura_parte{i+1}.jpg').resize((540,960)),(i*540,0))
s.save('minis.jpg')
