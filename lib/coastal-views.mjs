import {AREAS, REGIONS} from './geography.mjs';
// Navigation windows, not administrative boundaries or higher-resolution data.
export const COASTAL_ZONES = [
  {id:'upper-gulf',name:'อ่าวไทยตอนบน',region:'gulf',bbox:[99.7,12.6,101.3,13.65],areas:['MG','TC','CP','BP','PT']},
  {id:'east',name:'ระยอง–ตราด',region:'gulf',bbox:[100.7,11.4,102.8,13.1],areas:['RY','TR','PT']},
  {id:'west',name:'หัวหิน–ประจวบฯ',region:'gulf',bbox:[99.35,11.3,100.65,12.9],areas:['HH','PK']},
  {id:'central-gulf',name:'ชุมพร–สมุย',region:'gulf',bbox:[98.8,8.8,101,10.9],areas:['CH','SM']},
  {id:'south-gulf',name:'นครศรีฯ–นราธิวาส',region:'gulf',bbox:[99.7,6.1,102.4,8.9],areas:['NK','SK','NA']},
  {id:'north-andaman',name:'ระนอง–พังงา',region:'andaman',bbox:[97.5,8.2,98.9,10.2],areas:['RN','PN']},
  {id:'phuket-krabi',name:'ภูเก็ต–กระบี่',region:'andaman',bbox:[97.7,7.25,99.2,8.4],areas:['PH','KB']},
  {id:'south-andaman',name:'ตรัง–สตูล',region:'andaman',bbox:[98.5,6,100,7.8],areas:['TG','ST']},
];
export function coastalView(id, region='all') {
  const [kind,key]=id.split(':');
  const zone=COASTAL_ZONES.find(z=>z.id===key);
  if(kind==='zone'&&zone)return {...zone,areaIds:zone.areas};
  const area=AREAS.find(a=>a.id===key);
  if(kind==='area'&&area)return {name:area.name,region:area.region,bbox:[area.lon-.65,area.lat-.55,area.lon+.65,area.lat+.55],areaIds:[area.id]};
  return {...REGIONS[region],areaIds:AREAS.filter(a=>region==='all'||a.region===region).map(a=>a.id)};
}
export const inView=(cell,bbox)=>cell.lon>=bbox[0]&&cell.lon<=bbox[2]&&cell.lat>=bbox[1]&&cell.lat<=bbox[3];
export const distanceKm=(a,b)=>111.32*Math.hypot((a.lon-b.lon)*Math.cos((a.lat+b.lat)/2*Math.PI/180),a.lat-b.lat);
export function nearestCoastalCell(cells,area) {
  return cells.filter(c=>c.region===area.region).reduce((best,c)=>!best||distanceKm(c,area)<distanceKm(best,area)?c:best,null);
}
export function scaleBarKm(scale,zoom=1) {
  return [1,2,5,10,20,50,100].filter(km=>km/111.32*scale*zoom<=200).at(-1)??1;
}
