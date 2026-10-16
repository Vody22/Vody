# Lecteur minimal de .blend (2.8x, 64 bits, petit-boutiste) -> OBJ (positions, uv, faces) avec matrices des objets
import struct,sys,re
d=open(sys.argv[1],'rb').read();assert d[:7]==b'BLENDER';ps=8 if d[7:8]==b'-' else 4;E='<' if d[8:9]==b'v' else '>'
P='Q' if ps==8 else 'I'
o=12;blocks=[]
while o<len(d):
    code=d[o:o+4];size,=struct.unpack(E+'i',d[o+4:o+8]);old,=struct.unpack(E+P,d[o+8:o+8+ps]);sdna,cnt=struct.unpack(E+'ii',d[o+8+ps:o+16+ps]);h=16+ps
    blocks.append((code,size,old,sdna,cnt,o+h));o+=h+size
    if code==b'ENDB':break
dna=[b for b in blocks if b[0]==b'DNA1'][0];q=dna[5]
def al(x):return (x+3)&~3
assert d[q:q+8]==b'SDNANAME';q+=8;n,=struct.unpack(E+'i',d[q:q+4]);q+=4;names=[]
for i in range(n):
    e=d.index(b'\0',q);names.append(d[q:e].decode());q=e+1
q=dna[5]+al(q-dna[5]);assert d[q:q+4]==b'TYPE';q+=4;n,=struct.unpack(E+'i',d[q:q+4]);q+=4;types=[]
for i in range(n):
    e=d.index(b'\0',q);types.append(d[q:e].decode());q=e+1
q=dna[5]+al(q-dna[5]);assert d[q:q+4]==b'TLEN';q+=4;tlen=list(struct.unpack(E+'%dh'%n,d[q:q+2*n]));q+=2*n
q=dna[5]+al(q-dna[5]);assert d[q:q+4]==b'STRC';q+=4;n,=struct.unpack(E+'i',d[q:q+4]);q+=4;structs=[]
for i in range(n):
    t,nf=struct.unpack(E+'hh',d[q:q+4]);q+=4;fs=[]
    for j in range(nf):
        ft,fn=struct.unpack(E+'hh',d[q:q+4]);q+=4;fs.append((types[ft],names[fn]))
    structs.append((types[t],fs))
def fsize(tp,nm):
    if nm.startswith('*') or nm.startswith('(*'):s=ps
    else:s=tlen[types.index(tp)]
    m=1
    for a in re.findall(r'\[(\d+)\]',nm):m*=int(a)
    return s*m
def layout(si):
    tp,fs=structs[si];off=0;L={}
    for ft,fn in fs:
        key=re.sub(r'[\*\(\)]','',fn).split('[')[0];L[key]=(off,ft,fn);off+=fsize(ft,fn)
    return tp,L
byold={b[2]:b for b in blocks}
def S(name):
    for i,(t,f) in enumerate(structs):
        if t==name:return i
def rd(base,L,k,fmt):off=L[k][0];return struct.unpack(E+fmt,d[base+off:base+off+struct.calcsize(E+fmt)])
_,ML=layout(S('Mesh'));_,VL=layout(S('MVert'));_,LL=layout(S('MLoop'));_,PL=layout(S('MPoly'));_,UL=layout(S('MLoopUV'));_,OL=layout(S('Object'));_,CL=layout(S('CustomData'));_,CLL=layout(S('CustomDataLayer'))
vs=tlen[types.index('MVert')];ls=tlen[types.index('MLoop')];pls=tlen[types.index('MPoly')];us=tlen[types.index('MLoopUV')]
meshes={}
for b in blocks:
    if b[0][:2]!=b'ME' or b[0]==b'MEdi':continue
    if structs[b[3]][0]!='Mesh':continue
    base=b[5];name=d[base+ML['id'][0]+ (ps*2+ps*0) :base+ML['id'][0]+ps*2+66].split(b'\0')[0]
    tv,=rd(base,ML,'totvert','i');tl,=rd(base,ML,'totloop','i');tp,=rd(base,ML,'totpoly','i')
    pv,=rd(base,ML,'mvert',P);pl,=rd(base,ML,'mloop',P);pp,=rd(base,ML,'mpoly',P);pu,=rd(base,ML,'mloopuv',P)
    V=[struct.unpack(E+'3f',d[byold[pv][5]+i*vs+VL['co'][0]:][:12]) for i in range(tv)]
    Lp=[struct.unpack(E+'I',d[byold[pl][5]+i*ls+LL['v'][0]:][:4])[0] for i in range(tl)]
    Pp=[struct.unpack(E+'ii',d[byold[pp][5]+i*pls+PL['loopstart'][0]:][:8]) for i in range(tp)]
    U=[struct.unpack(E+'2f',d[byold[pu][5]+i*us+UL['uv'][0]:][:8]) for i in range(tl)] if pu in byold else None
    meshes[b[2]]=(name,V,Lp,Pp,U)
    print('mesh',name,tv,tl,tp,'uv' if U else 'nouv',file=sys.stderr)
objs=[]
for b in blocks:
    if b[0][:2]==b'OB' and structs[b[3]][0]=='Object':
        base=b[5];dp,=rd(base,OL,'data',P);M=rd(base,OL,'obmat','16f')
        if dp in meshes:objs.append((meshes[dp],M))
out=open(sys.argv[2],'w');vo=0;to=0
for (name,V,Lp,Pp,U),M in objs:
    for x,y,z in V:
        X=M[0]*x+M[4]*y+M[8]*z+M[12];Y=M[1]*x+M[5]*y+M[9]*z+M[13];Z=M[2]*x+M[6]*y+M[10]*z+M[14]
        out.write('v %f %f %f\n'%(X,Z,-Y))  # Z-haut -> Y-haut
    for u in (U or []):out.write('vt %f %f\n'%u)
    for ls_,tl_ in Pp:
        idx=[(Lp[ls_+k]+1+vo,ls_+k+1+to) for k in range(tl_)]
        for k in range(1,tl_-1):
            tri=[idx[0],idx[k],idx[k+1]]
            out.write('f '+' '.join('%d/%d'%t if U else '%d'%t[0] for t in tri)+'\n')
    vo+=len(V);to+=len(U or [])
print('objets',len(objs),file=sys.stderr)
