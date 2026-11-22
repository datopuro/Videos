import json
K='/home/claude/kit/audio/'
CORTES=[0.0,81.72,164.36,222.3,302.10]
X={'E2':(0.0,9.05),'E3':(9.1,17.8),'E4':(17.8,27.68),'C1':(27.68,33.83),'C2':(33.83,40.18),'C3':(40.18,45.2)}
SP=(K+'sigueme_partes.mp3',4.13); SN=(K+'sigueme_nuevas.mp3',3.11)
def m(n): return ('m',CORTES[n-1],CORTES[n])
REELS={1:[m(1),('z',0.35),('x',*X['C1']),('z',0.45),('s',*SP),('z',0.9)],
       2:[('x',*X['E2']),('z',0.35),m(2),('z',0.3),('x',*X['C2']),('z',0.45),('s',*SP),('z',0.9)],
       3:[('x',*X['E3']),('z',0.35),m(3),('z',0.3),('x',*X['C3']),('z',0.45),('s',*SP),('z',0.9)],
       4:[('x',*X['E4']),('z',0.35),m(4),('z',0.7),('s',*SN),('z',1.2)]}
HUECO=1.0
def dur(p): return p[1] if p[0]=='z' else p[2] if p[0]=='s' else p[2]-p[1]
def plan():
    t=0.0; out={}
    for n,ps in REELS.items():
        ini=t; piezas=[]
        for p in ps: piezas.append((t,p)); t+=dur(p)
        out[n]=dict(ini=ini,fin=t,piezas=piezas); t+=HUECO
    return out,t
