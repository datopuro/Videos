import re, json, subprocess, sys, unicodedata, difflib
import numpy as np
SR=16000
x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i","voz.mp3","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32)
win=160; n=len(x)//win
db=20*np.log10(np.sqrt(np.mean(x[:n*win].reshape(n,win)**2,axis=1)+1e-12)); voz=db>-42
segs=[]
for l in open('trans.txt'):
    m=re.match(r"\s*([\d.]+)-\s*([\d.]+)\s+(.*)",l)
    if not m: continue
    a,b,s=float(m[1]),float(m[2]),m[3].strip()
    if s.startswith('['): continue
    i0,i1=int(a*100),int(b*100); v=np.where(voz[i0:i1])[0]
    if len(v): a,b=(i0+v[0])/100,(i0+v[-1]+1)/100
    segs.append([a,b,s])
g=open('guion.md').read()
g=g[g.index('[PARTE 1 INICIO]'):g.index('## 4. Reels')]
import re as _r; g=_r.sub(r'\[PARTE \d (INICIO|FIN)\]','',g)
NUM=[('Veinticuatro de agosto de mil novecientos ochenta y uno','24 de agosto de 1981'),('cinco mil doscientos veinte metros','5,220 metros'),('veinte años','20 años'),('mil novecientos ochenta y uno','1981'),('Veinticuatro de agosto','24 de agosto'),('tres y veintiún','3:21'),('cinco mil metros','5,000 metros'),('Cinco horas','5 horas'),('treinta y siete personas','37 personas'),('setenta y cinco rublos','75 rublos'),('ciento cincuenta','150'),('diciembre de mil novecientos ochenta y cinco','diciembre de 1985'),('cuatro años','4 años'),('Ocho años','8 años'),('dos mil uno','2001'),('veinte años','20 años'),('ocho minutos','8 minutos')]
for a,b in NUM: g=g.replace(a,b)
gw=g.split()
def nz(w): w=unicodedata.normalize('NFD',w.lower()); w=''.join(c for c in w if unicodedata.category(c)!='Mn'); return re.sub(r'[^a-z0-9]','',w.replace('$',''))
tw=[];tseg=[]
for k,(a,b,s) in enumerate(segs):
    for w in s.split(): tw.append(nz(w)); tseg.append(k)
gn=[nz(w) for w in gw]
sm=difflib.SequenceMatcher(None,gn,tw,autojunk=False)
asig=[None]*len(gw)
for tag,i1,i2,j1,j2 in sm.get_opcodes():
    if tag in('equal','replace'):
        for i in range(i1,i2): asig[i]=tseg[min(j2-1,j1+(i-i1))] if j2>j1 else None
last=0
for i in range(len(gw)):
    if asig[i] is None: asig[i]=last
    asig[i]=max(asig[i],last); last=asig[i]
lines={}
for w,k in zip(gw,asig): lines.setdefault(k,[]).append(w)
out=[]
def sil(w): return max(1,len(re.findall(r"[aeiouáéíóúü]+",w.lower())))
for k in sorted(lines):
    a,b,_=segs[k]; ws=lines[k]
    chunks=[[]]
    for w in ws:
        chunks[-1].append(w)
        if w.endswith(('.','?','!','»',':')) and len(' '.join(chunks[-1]))>14: chunks.append([])
    chunks=[c for c in chunks if c]
    res=[]
    for c in chunks:
        while len(' '.join(c))>58:
            best=None
            for k in range(2,len(c)-1):
                l1=' '.join(c[:k]); sc=abs(len(l1)-len(' '.join(c))/2)-(12 if c[k-1][-1] in ',.:;' else 0)
                if best is None or sc<best[0]: best=(sc,k)
            res.append(c[:best[1]]); c=c[best[1]:]
        res.append(c)
    chunks=res
    chunks=[c for c in chunks if c]
    tot=sum(sil(w) for w in ws); t=a
    for c in chunks:
        d=(b-a)*sum(sil(w) for w in c)/tot; out.append([t,t+d,' '.join(c)]); t+=d
m=[]
for o in out:
    if m and o[0]-m[-1][1]<0.3 and len(m[-1][2])+len(o[2])<=52 and not m[-1][2].endswith(('.','?','!','»',':')):
        m[-1][1]=o[1]; m[-1][2]+=' '+o[2]
    else: m.append(o)
for i,o in enumerate(m):
    nxt=m[i+1][0] if i+1<len(m) else o[1]+1.5
    o[1]=round(min(max(o[1]+0.35,o[0]+0.9),nxt-0.02),2); o[0]=round(o[0]-0.05,2)
json.dump(m,open('subs.json','w'),ensure_ascii=False)
print(len(m))
for o in m: print(o[0],o[2])
