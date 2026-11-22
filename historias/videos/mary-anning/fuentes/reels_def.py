import json
K='/home/claude/kit/audio/'
CORTES=[0.0,110.45,206.5,276.8,371.19]
X={'E2':(0.0,10.1),'E3':(10.35,21.5),'E4':(21.55,30.95),'C1':(31.1,37.35),'C2':(37.45,47.15),'C3':(47.2,55.3)}
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
