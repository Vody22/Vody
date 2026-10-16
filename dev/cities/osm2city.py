# Prépare les quartiers de ville du jeu à partir d'extraits OpenStreetMap (© contributeurs OpenStreetMap, licence ODbL).
# Usage : python3 osm2city.py <dossier des .xml/.txt> <dossier de sortie>
# Sortie : un fichier JSON par quartier (rayon ~480 m) : b = bâtiments [hauteur_dm, x0,z0, x1,z1, ...] (décimètres, nord = -z),
# r = routes [largeur_dm, x0,z0, ...], w = eau [x0,z0,...], g = verdure [x0,z0,...], + index.json.
import sys, os, json, math, xml.etree.ElementTree as ET
SRC, OUT = sys.argv[1], sys.argv[2]
CITIES = [('intgesamt.xml','Ingolstadt'),('london.txt','Londres'),('munichbig.txt','Munich'),('newyorkexample.xml','New York (Upper West)'),('nyagain.xml','New York (Chelsea)'),('nyexample.xml','New York (Midtown)')]
RW = {'motorway':16,'trunk':14,'primary':12,'secondary':10,'tertiary':9,'residential':7,'unclassified':7,'living_street':6,'service':4.5,'pedestrian':6,'footway':2.2,'path':2,'cycleway':2.2,'steps':2,'motorway_link':8,'primary_link':8,'secondary_link':7,'trunk_link':8,'tertiary_link':7}
R = 480.0
def num(s):
    try: return float(str(s).replace(',', '.').split(';')[0].split(' ')[0].rstrip('m'))
    except: return None
index = []
for fn, name in CITIES:
    path = os.path.join(SRC, fn)
    tree = ET.parse(path); root = tree.getroot()
    b = root.find('bounds'); lat0 = (float(b.get('minlat'))+float(b.get('maxlat')))/2; lon0 = (float(b.get('minlon'))+float(b.get('maxlon')))/2
    kx = math.cos(math.radians(lat0))*111320.0; kz = 110540.0
    nodes = {}
    for n in root.iter('node'):
        nodes[n.get('id')] = ((float(n.get('lon'))-lon0)*kx, -(float(n.get('lat'))-lat0)*kz)
    B, Rd, W, Gr = [], [], [], []
    for w in root.iter('way'):
        tags = {t.get('k'): t.get('v') for t in w.findall('tag')}
        pts = [nodes[nd.get('ref')] for nd in w.findall('nd') if nd.get('ref') in nodes]
        if len(pts) < 2: continue
        closed = len(pts) > 3 and pts[0] == pts[-1]
        if 'building' in tags and closed:
            h = num(tags.get('height')) or num(tags.get('building:height'))
            if h is None:
                lv = num(tags.get('building:levels'))
                if lv: h = lv*3.2 + 1.5
            mh = num(tags.get('min_height'))
            if tags.get('building') in ('roof','canopy','carport'): continue
            B.append((h or 0, pts[:-1], tags.get('building')))
        elif 'highway' in tags and tags['highway'] in RW:
            Rd.append((RW[tags['highway']], pts))
        elif closed and (tags.get('natural') == 'water' or tags.get('waterway') == 'riverbank' or tags.get('water')):
            W.append(pts[:-1])
        elif closed and (tags.get('leisure') in ('park','garden','pitch','playground') or tags.get('landuse') in ('grass','forest','meadow','recreation_ground','village_green','cemetery')):
            Gr.append(pts[:-1])
    # choix des quartiers : centres les plus denses, à 700 m au moins les uns des autres
    cen = [(sum(p[0] for p in q)/len(q), sum(p[1] for p in q)/len(q)) for _, q, _ in B]
    xs = [c[0] for c in cen]; zs = [c[1] for c in cen]
    cand = []
    for gx in range(int(min(xs)) + 300, int(max(xs)) - 299, 100):
        for gz in range(int(min(zs)) + 300, int(max(zs)) - 299, 100):
            n = sum(1 for c in cen if (c[0]-gx)**2 + (c[1]-gz)**2 < R*R)
            cand.append((n, gx, gz))
    cand.sort(reverse=True); picks = []
    for n, gx, gz in cand:
        if n < 250: break
        if all((gx-a)**2 + (gz-b2)**2 > 700**2 for _, a, b2 in picks): picks.append((n, gx, gz))
        if len(picks) >= 4: break
    for k, (n, cx, cz) in enumerate(picks):
        q = lambda p: [round((p[0]-cx)*10), round((p[1]-cz)*10)]
        inside = lambda p, rr=R: (p[0]-cx)**2 + (p[1]-cz)**2 < rr*rr
        ob = []
        for h, pts, kind in B:
            c = (sum(p[0] for p in pts)/len(pts), sum(p[1] for p in pts)/len(pts))
            if not inside(c): continue
            ob.append([round(h*10)] + [v for p in pts for v in q(p)])
        orr = []
        for wd, pts in Rd:
            seg = []
            for p in pts:
                if inside(p, R+40): seg.append(p)
                else:
                    if len(seg) >= 2: orr.append([round(wd*10)] + [v for s in seg for v in q(s)])
                    seg = []
            if len(seg) >= 2: orr.append([round(wd*10)] + [v for s in seg for v in q(s)])
        ow = [[v for p in pts for v in q(p)] for pts in W if any(inside(p, R+200) for p in pts)]
        og = [[v for p in pts for v in q(p)] for pts in Gr if any(inside(p, R+100) for p in pts)]
        did = f"{fn.split('.')[0]}_{k}"
        json.dump({'n': name, 'b': ob, 'r': orr, 'w': ow, 'g': og}, open(os.path.join(OUT, did + '.json'), 'w'), separators=(',', ':'))
        index.append({'id': did, 'n': name, 'nb': len(ob), 'tall': sum(1 for x in ob if x[0] > 400)})
        print(did, name, len(ob), 'bâtiments', len(orr), 'routes', len(ow), 'eau', len(og), 'verdure', os.path.getsize(os.path.join(OUT, did + '.json'))//1024, 'Ko')
json.dump(index, open(os.path.join(OUT, 'index.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
