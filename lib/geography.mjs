import boundary from './thai-marine-boundary.json' with {type:'json'};
export const BBOX=[95.4,5.3,103.2,13.9];
export const REGIONS={all:{name:'ทะเลไทยทั้งหมด',bbox:BBOX},gulf:{name:'อ่าวไทย',bbox:[99.0,5.9,103.3,13.9]},andaman:{name:'อันดามัน',bbox:[95.3,5.3,100.2,10.7]}};
function inRing(x,y,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
export function marineRegion(lon,lat){
 const parts=boundary.geometry.coordinates;
 for(let i=0;i<parts.length;i++){const p=parts[i];if(inRing(lon,lat,p[0])&&!p.slice(1).some(r=>inRing(lon,lat,r)))return i===0?'andaman':'gulf'}
 return null;
}
export const AREAS=[
 {id:'MG',name:'ปากแม่กลอง',lon:100.025,lat:13.325,gauge:'K.55A',region:'gulf'},
 {id:'CP',name:'ปากเจ้าพระยา',lon:100.59,lat:13.42,gauge:'C.35',region:'gulf'},
 {id:'BP',name:'ปากบางปะกง',lon:100.99,lat:13.43,gauge:'Kgt.3',region:'gulf'},
 {id:'TC',name:'ปากท่าจีน',lon:100.285,lat:13.43,gauge:null,region:'gulf'},
 {id:'PT',name:'พัทยา',lon:100.79,lat:12.95,gauge:null,region:'gulf'},
 {id:'RY',name:'ระยอง',lon:101.25,lat:12.5,gauge:null,region:'gulf'},
 {id:'TR',name:'ตราด–เกาะช้าง',lon:102.35,lat:11.95,gauge:null,region:'gulf'},
 {id:'HH',name:'หัวหิน',lon:100.02,lat:12.52,gauge:null,region:'gulf'},
 {id:'PK',name:'ประจวบคีรีขันธ์',lon:99.85,lat:11.75,gauge:null,region:'gulf'},
 {id:'CH',name:'ชุมพร',lon:99.35,lat:10.35,gauge:null,region:'gulf'},
 {id:'SM',name:'เกาะสมุย',lon:100.15,lat:9.5,gauge:null,region:'gulf'},
 {id:'NK',name:'นครศรีธรรมราช',lon:100.18,lat:8.45,gauge:null,region:'gulf'},
 {id:'SK',name:'สงขลา',lon:100.65,lat:7.22,gauge:null,region:'gulf'},
 {id:'NA',name:'นราธิวาส',lon:101.9,lat:6.5,gauge:null,region:'gulf'},
 {id:'RN',name:'ระนอง',lon:98.4,lat:9.8,gauge:null,region:'andaman'},
 {id:'PN',name:'พังงา–เขาหลัก',lon:98.12,lat:8.65,gauge:null,region:'andaman'},
 {id:'PH',name:'ภูเก็ต',lon:98.15,lat:7.8,gauge:null,region:'andaman'},
 {id:'KB',name:'กระบี่',lon:98.72,lat:7.9,gauge:null,region:'andaman'},
 {id:'TG',name:'ตรัง',lon:99.25,lat:7.25,gauge:null,region:'andaman'},
 {id:'ST',name:'สตูล–หลีเป๊ะ',lon:99.3,lat:6.5,gauge:null,region:'andaman'}
];
