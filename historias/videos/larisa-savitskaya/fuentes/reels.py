import sys, subprocess, numpy as np
sys.path.insert(0,'/home/claude/tools'); sys.path.insert(0,'/home/claude/larp')
from musica_lar import leer, mezclar, SR
from subs import escribir, S, EX
CL='/home/claude/lar/clips/'
V=leer('/home/claude/lar/voz.mp3',323.0); FONDO=np.load('/home/claude/lar/fondo.npy').astype(np.float64)
R={1:dict(segs=[('v',0,114.67),('v',114.67,125.4)], voz=[(0,'main',0,114.67),(114.9,'cierre1'),(121.0,'sigueme_partes')]),
   2:dict(segs=[('v',0,8.6),('v',114.67,214.85),('s',214.6,11.35)], voz=[(0.1,'entrada2'),(8.6,'main',114.67,215.43),(109.5,'cierre2'),(115.8,'sigueme_partes')]),
   3:dict(segs=[('v',198.7,208.2),('v',215.43,323.0)], voz=[(0.05,'entrada3'),(9.5,'main',215.43,323.0),(110.6,'sigueme_nuevas')])}
for n,r in R.items():
    dur=sum((s[2]-s[1]) if s[0]=='v' else s[2] for s in r['segs']); N=int(dur*SR)+1
    voz=np.zeros(N); fondo=np.zeros((N,2)); t=0.0
    for s in r['segs']:
        a=s[1]; d=(s[2]-s[1]) if s[0]=='v' else s[2]
        i=int(t*SR); k=min(int(d*SR),N-i, len(FONDO)-int(a*SR)); fondo[i:i+k]+=FONDO[int(a*SR):int(a*SR)+k]; t+=d
    piezas=[]
    for ev in r['voz']:
        t0=ev[0]
        if ev[1]=='main': x=V[int(ev[2]*SR):int(ev[3]*SR)]; piezas.append((t0,ev[2],ev[3],S))
        else: x=leer(CL+ev[1]+'.mp3'); piezas.append((t0,0,1e9,EX[ev[1]]))
        i=int(t0*SR); k=min(len(x),N-i); voz[i:i+k]+=x[:k]
    mezclar(voz,fondo,f'a{n}.wav')
    escribir(f'p{n}.ass',piezas,1080,1920,58,1290,False,30)
    lst=open(f'l{n}.txt','w')
    for j,sg in enumerate(r['segs']):
        o=f'seg{n}_{j}.mp4'
        if sg[0]=='v': subprocess.run(['ffmpeg','-y','-v','error','-ss',str(sg[1]),'-i','/home/claude/lar/limpio.mp4','-t',f'{sg[2]-sg[1]:.3f}','-an','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p','-r','24',o],check=True)
        else:
            subprocess.run(['ffmpeg','-y','-v','error','-ss',str(sg[1]),'-i','/home/claude/lar/limpio.mp4','-frames:v','1',f'st{n}.png'],check=True)
            subprocess.run(['ffmpeg','-y','-v','error','-loop','1','-i',f'st{n}.png','-t',str(sg[2]),'-vf',f"zoompan=z='1+on*0.0004':d=1:s=1920x1080:fps=24",'-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p','-r','24',o],check=True)
        lst.write(f"file '{o}'\n")
    lst.close()
    subprocess.run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',f'l{n}.txt','-c','copy',f'cat{n}.mp4'],check=True)
    fc=f'[0:v]split[x][y];[x]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:6,eq=brightness=-0.25[bg];[y]scale=1080:608[fg];[bg][fg]overlay=0:656[v1];[v1][1:v]overlay=0:0[v2];[v2]subtitles=p{n}.ass[v]'
    subprocess.run(['ffmpeg','-y','-v','error','-i',f'cat{n}.mp4','-loop','1','-i',f'capa{n}.png','-i',f'a{n}.wav','-filter_complex',fc,'-map','[v]','-map','2:a','-t',f'{dur:.2f}','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-r','24','-c:a','aac','-b:a','192k','-movflags','+faststart',f'larisa_parte{n}.mp4'],check=True)
    print(n,round(dur,2))
