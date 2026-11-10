import {nearestCoastalCell,distanceKm} from './coastal-views.mjs';
const finite=n=>typeof n==='number'&&Number.isFinite(n);
export const COMPARISON_METRICS = {
  wave:{label:'คลื่น',unit:'ม.',detail:'คลื่นนัยสำคัญสูงสุดรายวัน',digits:2},
  wind:{label:'ลม',unit:'ม./วินาที',detail:'ลมสูงสุดรายวันที่ระดับ 10 เมตร',digits:1},
  rain:{label:'ฝน',unit:'มม./24 ชม.',detail:'ฝนสะสม 00:00–24:00 น. เวลาไทย',digits:1},
  sst:{label:'อุณหภูมิทะเล',unit:'°C',detail:'อุณหภูมิผิวน้ำเฉลี่ย 24 ชั่วโมง',digits:1},
};
export function comparisonSeries(data,ids,metric) {
  return ids.filter(Boolean).map(id=>data.areas.find(a=>a.id===id)).filter(Boolean).map(area=>{
    const cell=nearestCoastalCell(data.cells,area);
    const values=data.days.map(d=>{const n=cell?d.cells.find(c=>c.id===cell.id)?.[metric]:null;return finite(n)?n:null});
    const valid=values.filter(finite);
    return {id:area.id,name:area.name,cell,distanceKm:cell?distanceKm(cell,area):null,values,count:valid.length,min:valid.length?Math.min(...valid):null,max:valid.length?Math.max(...valid):null,delta:finite(values[0])&&finite(values.at(-1))?values.at(-1)-values[0]:null};
  });
}
export function chartDomain(series,metric) {
  const values=series.flatMap(s=>s.values).filter(finite);
  if(!values.length)return [0,1];
  if(metric==='sst')return [Math.floor((Math.min(...values)-.3)*2)/2,Math.ceil((Math.max(...values)+.3)*2)/2];
  const max=Math.max(...values);
  return [0,max>0?max*1.15:1];
}
// Split at missing days. Never interpolate through missing observations.
export function lineSegments(values) {
  const segments=[];let current=[];
  values.forEach((value,index)=>{if(finite(value))current.push({value,index});else if(current.length){segments.push(current);current=[]}});
  if(current.length)segments.push(current);
  return segments;
}
