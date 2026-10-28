import argparse,json,requests
from qgis.core import QgsApplication,QgsVectorLayer
from shapely.geometry import shape,mapping,box
from shapely.ops import unary_union
parser=argparse.ArgumentParser(description='Prepare static marine mask and Natural Earth land context (one-time, not the daily job)')
parser.add_argument('--land',required=True,help='Path to official Natural Earth ne_10m_land.shp')
a=parser.parse_args()
endpoint='https://geo.vliz.be/geoserver/MarineRegions/ows'
filter="sovereign1='Thailand' AND sovereign2 IS NULL"
r=requests.get(endpoint,params={'service':'WFS','version':'1.0.0','request':'GetFeature','typeName':'MarineRegions:eez','outputFormat':'application/json','CQL_FILTER':filter},timeout=60);r.raise_for_status();raw=r.json()
g=unary_union([shape(f['geometry']) for f in raw['features']]).simplify(.004,preserve_topology=True)
assert g.is_valid
# Keep a deterministic west-to-east ordering; geography.mjs assigns the basins.
gj=mapping(g);gj['coordinates']=sorted(gj['coordinates'],key=lambda p:min(q[0] for q in p[0]))
out={'type':'Feature','properties':{'name':'Thailand EEZ, excluding joint regimes','source':'https://www.marineregions.org/','wfs':endpoint,'license':'CC BY 4.0','filter':filter,'mrgids':[f['properties']['mrgid'] for f in raw['features']]},'geometry':gj}
json.dump(out,open('lib/thai-marine-boundary.json','w',encoding='utf8'),separators=(',',':'))
app=QgsApplication([],False);app.initQgis();layer=QgsVectorLayer(a.land,'land','ogr');assert layer.isValid()
clip=box(95,5,104,14.5);features=[]
for f in layer.getFeatures():
 s=shape(json.loads(f.geometry().asJson()))
 if s.intersects(clip):
  q=s.intersection(clip).simplify(.005,preserve_topology=True)
  if q.geom_type in ['Polygon','MultiPolygon']:features.append(mapping(q))
json.dump(features,open('lib/coastline.json','w'),separators=(',',':'))
print('Prepared Thai marine mask and land context')
