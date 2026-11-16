import numpy as np, subprocess
from scipy.signal import fftconvolve, butter, sosfilt
SR=44100; DUR=404.0; N=int(SR*DUR)
rng=np.random.default_rng(7)
def mtof(m): return 440*2**((m-69)/12)
BPM=70; beat=60/BPM; bar=4*beat
prog=[[47,54,59,62],[43,50,55,59],[38,45,50,54],[45,52,57,61]]
prog2=[[43,50,55,59],[38,45,50,54],[45,52,57,61],[47,54,59,62]]
L=np.zeros(N); Rr=np.zeros(N)
def env(n,a,r,sus=1.0):
    e=np.ones(n)*sus; na=int(a*SR); nr=int(r*SR)
    e[:na]=np.linspace(0,sus,na); e[-nr:]*=np.linspace(1,0,nr); return e
def nivel(t):
    pts=[(0,0.55),(30,0.7),(97,0.75),(121,0.6),(152,0.85),(156,0.45),(181,0.55),(239,0.4),(279,0.5),(297,0.4),(300,0.8),(323,1.0),(328,0.65),(358,0.55),(374,0.75),(390,0.85),(398,1.0),(404,0)]
    x=[p[0] for p in pts]; y=[p[1] for p in pts]; return np.interp(t,x,y)
def densidad(t):
    if 239<t<297: return 0.35
    if 155<t<181: return 0.55
    if 0<t<25: return 0.6
    return 0.85
t=0.0; ci=0
cd=2*bar
while t<DUR:
    ch=(prog if (t<297 or t>=358) else prog2)[ci%4]
    n0=int(t*SR); n=int((cd+2.5)*SR)
    if n0+n>N: n=N-n0
    if n<=0: break
    tt=np.arange(n)/SR; e=env(n,1.8,2.5)
    for k,m in enumerate(ch):
        f=mtof(m+12 if k==0 else m)
        s=(np.sin(2*np.pi*f*tt)+0.25*np.sin(2*np.pi*2*f*tt+0.3)+0.08*np.sin(2*np.pi*3*f*tt))
        s2=np.sin(2*np.pi*f*1.004*tt+1.0)
        g=0.05*nivel(t)
        L[n0:n0+n]+=g*e*(s*0.7+s2*0.3); Rr[n0:n0+n]+=g*e*(s*0.3+s2*0.7)
    fb=mtof(ch[0]-12); sb=np.sin(2*np.pi*fb*tt)*env(n,0.6,2.0)*0.06*nivel(t)
    L[n0:n0+n]+=sb; Rr[n0:n0+n]+=sb
    arp=[ch[0]+24,ch[1]+12,ch[2]+12,ch[3]+12,ch[2]+24,ch[3]+12,ch[1]+24,ch[2]+12]
    for b in range(16):
        tn=t+b*beat/2
        if tn>=DUR-1: break
        if rng.random()>densidad(tn) and b%4: continue
        m=arp[b%8]; f=mtof(m); dn=int(3.0*SR); i0=int(tn*SR); dn=min(dn,N-i0)
        if dn<=0: continue
        x=np.arange(dn)/SR; vel=(0.75+0.25*rng.random())*(1.15 if b%8==0 else 1.0)
        tone=sum(a*np.sin(2*np.pi*f*h*x+ph)*np.exp(-x*(1.2+h*0.9)) for h,a,ph in [(1,1,0),(2,0.35,0.2),(3,0.12,0.5),(4,0.05,0.1)])
        tone*=np.minimum(1,x/0.004)*0.11*vel*nivel(tn)
        pan=0.5+0.35*np.sin(m*0.7)
        L[i0:i0+dn]+=tone*(1-pan)*1.4; Rr[i0:i0+dn]+=tone*pan*1.4
    t+=cd; ci+=1
sos=butter(2,5200,'low',fs=SR,output='sos'); L=sosfilt(sos,L); Rr=sosfilt(sos,Rr)
ir_n=int(2.8*SR); ir=rng.standard_normal(ir_n)*np.exp(-np.arange(ir_n)/SR*2.2); ir2=rng.standard_normal(ir_n)*np.exp(-np.arange(ir_n)/SR*2.2)
ir/=np.sqrt((ir**2).sum()); ir2/=np.sqrt((ir2**2).sum())
L=0.75*L+0.45*fftconvolve(L,ir)[:N]; Rr=0.75*Rr+0.45*fftconvolve(Rr,ir2)[:N]
v=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i","voz.mp3","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
v=np.concatenate([v,np.zeros(max(0,N-len(v)))])[:N]
w=int(0.05*SR); e=np.sqrt(np.convolve(v**2,np.ones(w)/w,'same')); ev=np.convolve((e>0.01).astype(float),np.ones(int(0.4*SR))/int(0.4*SR),'same')
duck=1-0.45*np.clip(ev,0,1)
m=np.stack([L*duck,Rr*duck],1)
vr=np.sqrt(np.mean(v[v!=0]**2)); mr=np.sqrt(np.mean(m**2))
m*= (vr*10**(-17/20))/mr
out=np.stack([v,v],1)+m
out=out/np.max(np.abs(out))*0.9
out.astype(np.float32).tofile('/tmp/mez.f32')
subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","2","-i","/tmp/mez.f32","-af","loudnorm=I=-14:TP=-1.5:LRA=11","-ar","44100","mezcla.wav"],check=True)
subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","2","-i","/tmp/mez.f32","-filter_complex","pan=stereo|c0=c0|c1=c1","-t","1","-f","null","-"])
print('ok')
