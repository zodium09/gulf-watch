import {decodeBlosc} from './blosc.mjs';
export const VERSION='gulf-screening-v2.1';
export const AREAS=[
 {id:'MG',name:'ปากแม่กลอง',lon:100.025,lat:13.325,gauge:'K.55A'},
 {id:'TC',name:'ปากท่าจีน',lon:100.285,lat:13.43,gauge:null},
 {id:'CP',name:'ปากเจ้าพระยา',lon:100.59,lat:13.42,gauge:'C.35'},
 {id:'BP',name:'ปากบางปะกง',lon:100.99,lat:13.43,gauge:'Kgt.3'},
 {id:'KB',name:'คลองด่าน–บางบ่อ',lon:100.78,lat:13.43,gauge:null},
 {id:'BS',name:'บางแสน',lon:100.88,lat:13.275,gauge:null},
 {id:'SR',name:'ศรีราชา–เกาะสีชัง',lon:100.82,lat:13.15,gauge:null},
 {id:'PT',name:'พัทยา',lon:100.79,lat:12.95,gauge:null},
 {id:'BB',name:'บ้านแหลม',lon:100.105,lat:13.18,gauge:null},
 {id:'MID',name:'กลางอ่าวตอนใน',lon:100.5,lat:13.15,gauge:null}
];
const BBOX=[99.85,12.65,101.1,13.65],DAY=86400000;
export const bangkokDay=(now=new Date())=>new Date(+now+7*3600000).toISOString().slice(0,10);
const shift=(date,n)=>new Date(Date.parse(date)+n*DAY).toISOString().slice(0,10);
const distance=(x,y,x2,y2)=>111.32*Math.hypot((x-x2)*Math.cos((y+y2)/2*Math.PI/180),y-y2);
const finite=v=>v!==null&&Number.isFinite(v);
const round=(v,n=3)=>finite(v)?+v.toFixed(n):null;
export async function fetchChecked(url,as='json'){
 let last;
 for(let i=0;i<2;i++){
  try {const r=await fetch(url,{signal:AbortSignal.timeout(45000),headers:{Accept:as==='json'?'application/json':'application/octet-stream'}});if(!r.ok){const detail=(await r.text()).slice(0,160);if(r.status===429&&i===0){const retry=Number(r.headers.get('Retry-After'))||20;await new Promise(resolve=>setTimeout(resolve,Math.min(60,Math.max(5,retry))*1000))}throw Error(`HTTP ${r.status}: ${new URL(url).hostname}: ${detail}`)}return as==='bytes'?new Uint8Array(await r.arrayBuffer()):as==='text'?r.text():r.json()}
  catch(e){last=e;if(i===0)await new Promise(r=>setTimeout(r,700))}
 }
 throw last;
}
async function mapLimit(items,n,fn){const result=new Array(items.length);let next=0;await Promise.all(Array.from({length:Math.min(n,items.length)},async()=>{for(;;){let i=next++;if(i>=items.length)return;result[i]=await fn(items[i],i)}}));return result}
function val(bytes,index,dtype){const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);if(dtype==='<f4')return v.getFloat32(index*4,true);if(dtype==='<f8')return v.getFloat64(index*8,true);if(dtype==='<i2')return v.getInt16(index*2,true);if(dtype==='<u2')return v.getUint16(index*2,true);if(dtype==='|u1')return v.getUint8(index);if(dtype==='|i1')return v.getInt8(index);if(dtype==='<i4')return v.getInt32(index*4,true);throw Error('Unsupported Zarr dtype '+dtype)}
async function openSatellite(kind){
 const dataset=kind==='spm'?'cmems_obs-oc_glo_bgc-transp_nrt_l3-multi-4km_P1D_202311':'cmems_obs-oc_glo_bgc-plankton_nrt_l3-multi-4km_P1D_202411';
 const url=`https://stac.marine.copernicus.eu/metadata/OCEANCOLOUR_GLO_BGC_L3_NRT_009_101/${dataset}/dataset.stac.json`;
 const catalog=await fetchChecked(url);const base=catalog.assets.timeChunked.href;const meta=(await fetchChecked(base+'/.zmetadata')).metadata;
 const chunk=async(variable,key)=>{const z=meta[variable+'/.zarray'];if(z.filters?.length)throw Error('Unexpected Zarr filter');const payload=await fetchChecked(base+'/'+variable+'/'+key,'bytes');return z.compressor?decodeBlosc(payload):payload};
 const coords=async(variable)=>{const bytes=await chunk(variable,'0');const z=meta[variable+'/.zarray'];return Array.from({length:z.shape[0]},(_,i)=>val(bytes,i,z.dtype))};
 const [lat,lon]=await Promise.all([coords('latitude'),coords('longitude')]);
 const tc=catalog.assets.timeChunked.viewDims.time.coords;if(tc.type!=='minMaxStep'||tc.step!==DAY)throw Error('Unexpected satellite time grid');
 return {catalog,base,meta,chunk,lat,lon,tc,url};
}
async function satelliteSnapshot(kind,issue){
 const z=await openSatellite(kind);const variable=kind==='spm'?'SPM':'CHL';
 const iy=z.lat.map((v,i)=>v>=BBOX[1]&&v<=BBOX[3]?i:-1).filter(v=>v>=0);const ix=z.lon.map((v,i)=>v>=BBOX[0]&&v<=BBOX[2]?i:-1).filter(v=>v>=0);
 if(!iy.length||!ix.length)throw Error('Satellite coverage absent');
 const latest=Math.min(z.tc.len-1,Math.floor((Date.parse(issue)-z.tc.min)/DAY));
 const cells=iy.flatMap(i=>ix.map(j=>({i,j,lat:z.lat[i],lon:z.lon[j],value:null,date:null,uncertainty:null,land:false})));
 for(let t=latest;t>=Math.max(0,latest-4);t--){
  const date=new Date(z.tc.min+t*DAY).toISOString().slice(0,10);const age=(Date.parse(issue)-Date.parse(date))/DAY;if(age<0||age>5)continue;
  const unresolved=cells.filter(c=>c.value===null&&!c.land);if(!unresolved.length)break;
  const variables=[variable,variable+'_uncertainty','flags'];const loaded={};
  await mapLimit(variables,2,async v=>{const a=z.meta[v+'/.zarray'];const keys=[...new Set(unresolved.map(c=>[Math.floor(t/a.chunks[0]),Math.floor(c.i/a.chunks[1]),Math.floor(c.j/a.chunks[2])].join('.')))];loaded[v]={};for(const key of keys)loaded[v][key]=await z.chunk(v,key)});
  const get=(v,c)=>{const a=z.meta[v+'/.zarray'],at=z.meta[v+'/.zattrs'];const key=[Math.floor(t/a.chunks[0]),Math.floor(c.i/a.chunks[1]),Math.floor(c.j/a.chunks[2])].join('.');const pos=((t%a.chunks[0])*a.chunks[1]+c.i%a.chunks[1])*a.chunks[2]+c.j%a.chunks[2];let n=val(loaded[v][key],pos,a.dtype);if(n===(at._FillValue??at.missing_value??a.fill_value))return null;return n*(at.scale_factor??1)+(at.add_offset??0)};
  for(const c of unresolved){const f=get('flags',c);if(f!==null&&(f&1)){c.land=true;continue}const n=get(variable,c),u=get(variable+'_uncertainty',c);if(f===null||!finite(n)||n<=0||!finite(u)||u>100||u<0)continue;c.value=round(n,5);c.uncertainty=round(u);c.date=date}
 }
 return {cells,lat:z.lat,lon:z.lon,source:{provider:'Copernicus Marine',product:'OCEANCOLOUR_GLO_BGC_L3_NRT_009_101',dataset:z.catalog.id??kind,catalog:z.url,latest:new Date(z.tc.min+latest*DAY).toISOString().slice(0,10)}};
}
function quantiles(values){const a=values.filter(finite).sort((a,b)=>a-b);if(a.length<20)throw Error('Insufficient valid satellite cells');return [.2,.4,.6,.8].map(p=>{const i=(a.length-1)*p;const j=Math.floor(i);return a[j]+(a[Math.min(j+1,a.length-1)]-a[j])*(i-j)})}
const classify=(v,q)=>finite(v)?1+q.filter(t=>v>=t).length:null;
function daily(item,date,variable,agg='mean'){
 const h=item?.hourly;if(!h?.[variable])return null;const values=h.time.flatMap((t,i)=>t.startsWith(date)?[h[variable][i]]:[]);
 if(values.length!==24||!values.every(finite))return null;if(agg==='max')return Math.max(...values);const sum=values.reduce((a,b)=>a+b,0);return agg==='sum'?sum:sum/24;
}
async function forcing(cells,issue){
 // Satellite sampling is 4 km; meteorological fields are coarser. Query one
 // actual water-pixel representative per 0.125-degree bin and retain the
 // provider's real grid coordinates for the distance/coverage test.
 const bins=new Map();const indexes=[];
 for(const c of cells){const key=Math.floor(c.lat/.125)+':'+Math.floor(c.lon/.125);if(!bins.has(key))bins.set(key,{cell:c,index:bins.size});indexes.push(bins.get(key).index)}
 const representatives=[...bins.values()].map(v=>v.cell);
 const getAll=async(mode)=>{
  const endpoint=mode==='marine'?'https://marine-api.open-meteo.com/v1/marine':'https://api.open-meteo.com/v1/forecast';
  const groups=Array.from({length:Math.ceil(representatives.length/80)},(_,i)=>representatives.slice(i*80,i*80+80));
  const results=await mapLimit(groups,1,async subset=>{const p=new URLSearchParams({latitude:subset.map(c=>c.lat.toFixed(6)).join(','),longitude:subset.map(c=>c.lon.toFixed(6)).join(','),start_date:shift(issue,-1),end_date:shift(issue,5),timezone:'Asia/Bangkok',hourly:mode==='marine'?'wave_height,sea_surface_temperature':'precipitation,wind_speed_10m,shortwave_radiation',...(mode==='marine'?{cell_selection:'sea'}:{models:'gfs_seamless',wind_speed_unit:'ms'})});const d=await fetchChecked(endpoint+'?'+p);const a=Array.isArray(d)?d:[d];if(a.length!==subset.length)throw Error('Weather response count mismatch');return a});const unique=results.flat();return indexes.map(i=>unique[i]);
 };
 return Promise.all([getAll('marine'),getAll('weather')]);
}
async function riverContext(){
 const url='https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel_load';
 try{const d=await fetchChecked(url);const rows=[...(d.waterlevel_data?.data??[]),...(d.waterlevel_manual_data?.data??[])];const codes=['K.55A','C.35','Kgt.3'];return {source:url,status:'ok',stations:codes.flatMap(code=>{const r=rows.find(r=>r.station?.tele_station_oldcode===code&&r.discharge!==null&&r.discharge!==undefined);return r?[{code,name:r.station.tele_station_name?.th,dischargeM3s:+r.discharge,observedAt:r.waterlevel_datetime,dailyEquivalentMm3:round(+r.discharge*86400/1e6),scope:'upstream_snapshot_not_mouth_discharge'}]:[]})}}
 catch{return {source:url,status:'unavailable',stations:[]}}
}
export async function buildForecast(now=new Date()){
 const issue=bangkokDay(now);const started=new Date().toISOString();
 const [sp,ch,rivers]=await Promise.all([satelliteSnapshot('spm',issue),satelliteSnapshot('chl',issue),riverContext()]);
 if(sp.cells.length!==ch.cells.length||sp.cells.some((c,i)=>Math.abs(c.lon-ch.cells[i].lon)>1e-5||Math.abs(c.lat-ch.cells[i].lat)>1e-5))throw Error('Satellite grids do not match');
 const cells=sp.cells.flatMap((c,i)=>{const b=ch.cells[i];return !c.land&&!b.land&&(c.value!==null||b.value!==null)?[{id:c.i+'-'+c.j,lat:c.lat,lon:c.lon,spm:c.value,chl:b.value,spmDate:c.date,chlDate:b.date,spmUncertainty:c.uncertainty,chlUncertainty:b.uncertainty}]:[]});
 const qt=quantiles(cells.map(c=>c.spm)),qb=quantiles(cells.map(c=>c.chl));const [marine,weather]=await forcing(cells,issue);
 const dates=Array.from({length:6},(_,i)=>shift(issue,i));const days=dates.map(date=>{
  const records=cells.map((c,i)=>{const m=marine[i],w=weather[i];const wave=daily(m,date,'wave_height','max'),wind=daily(w,date,'wind_speed_10m','max'),sst=daily(m,date,'sea_surface_temperature'),solarRaw=daily(w,date,'shortwave_radiation','sum');const solar=finite(solarRaw)?solarRaw*3600/1e6:null;const rain=daily(w,date,'precipitation','sum'),previous=daily(w,shift(date,-1),'precipitation','sum');const rain48=finite(rain)&&finite(previous)?rain+previous:null;
   const wh=new Map(w.hourly.time.map((t,k)=>[t,w.hourly.wind_speed_10m[k]]));let calm=0;for(let k=0;k<m.hourly.time.length;k++){let t=m.hourly.time[k],wv=m.hourly.wave_height[k],wi=wh.get(t);if(t.startsWith(date)&&finite(wv)&&finite(wi)&&wv<.3&&wi<3)calm++}
   const snap=distance(c.lon,c.lat,m.longitude,m.latitude);const complete=[wave,wind,sst,solar,rain48].every(finite)&&snap<=20;
   const near=AREAS.slice(0,4).some(a=>distance(c.lon,c.lat,a.lon,a.lat)<=15);
   const t=classify(c.spm,qt),b=classify(c.chl,qb);const turbidity=complete&&t!==null?Math.min(5,t+Number(wave>=.5||wind>=6||(near&&rain48>=20))):null;
   const bloom=complete&&b!==null?Math.max(1,Math.min(5,b+Number(calm>=12&&solar>=10&&sst>=28)-Number(calm<6||solar<6))):null;
   return {id:c.id,turbidity,bloom,wave,wind,sst,rain48,solar,calm,forcingValid:complete};
  });return {date,cells:records,validTurbidity:records.filter(c=>c.turbidity!==null).length,validBloom:records.filter(c=>c.bloom!==null).length};
 });
 if(days.some(d=>d.validTurbidity<20||d.validBloom<20))throw Error('Forecast coverage insufficient; previous publication retained');
 const obsDates=cells.flatMap(c=>[c.spmDate,c.chlDate]).filter(Boolean).sort();
 return {schema:2,method:VERSION,generatedAt:new Date().toISOString(),runStartedAt:started,issueDate:issue,timezone:'Asia/Bangkok',confidence:'low_unvalidated',dates,observationRange:[obsDates[0],obsDates.at(-1)],gridStep:{lat:Math.abs(sp.lat[1]-sp.lat[0]),lon:Math.abs(sp.lon[1]-sp.lon[0])},bbox:BBOX,thresholds:{spm:qt.map(v=>round(v,5)),chl:qb.map(v=>round(v,5))},cells,days,areas:AREAS,rivers,sources:[sp.source,ch.source,{provider:'Open-Meteo / NOAA GFS',url:'https://open-meteo.com/en/docs'},{provider:'Open-Meteo Marine',url:'https://open-meteo.com/en/docs/marine-weather-api'}],limitations:['Relative screening, not event probability or harmful species confirmation','Satellite initial state held constant; no growth, sediment transport or salinity model','River flow is qualitative context only; no uncalibrated GEOGLOWS coupling','Clouds, sediment interference and mixed coastal pixels limit satellite interpretation'],updateCadence:'daily'};
}
