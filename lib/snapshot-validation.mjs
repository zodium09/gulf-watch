import {AREAS,VERSION,bangkokDay} from './forecast-engine.mjs';
import {marineRegion} from './geography.mjs';
const finite=n=>typeof n==='number'&&Number.isFinite(n);
export function validateSnapshot(s,now=new Date()){
 if(!s||s.schema!==3||s.method!==VERSION||s.issueDate!==bangkokDay(now)||s.confidence!=='low_unvalidated')throw Error('Snapshot method/date mismatch');
 const generated=Date.parse(s.generatedAt),age=+now-generated;
 if(!finite(generated)||age>7200000||age< -300000)throw Error('Snapshot generation time out of range');
 if(!Array.isArray(s.cells)||s.cells.length<20||s.cells.length>6000||!Array.isArray(s.days)||s.days.length!==6)throw Error('Snapshot coverage invalid');
 const seen=new Set();for(const c of s.cells){
  if(typeof c.id!=='string'||seen.has(c.id)||!finite(c.lat)||!finite(c.lon)||marineRegion(c.lon,c.lat)!==c.region||!['gulf','andaman'].includes(c.region))throw Error('Cell coordinates invalid');seen.add(c.id);
  for(const [key,dateKey] of [['spm','spmDate'],['chl','chlDate']])if(c[key]!==null){const a=(Date.parse(s.issueDate)-Date.parse(c[dateKey]))/86400000;if(!finite(c[key])||c[key]<=0||c[key]>100000||!finite(a)||a<0||a>5)throw Error('Satellite value/date invalid')}
 }
 const quantile=values=>{const a=values.filter(finite).sort((a,b)=>a-b);if(a.length<20)return null;return [.2,.4,.6,.8].map(p=>{const i=(a.length-1)*p,j=Math.floor(i);return a[j]+(a[Math.min(j+1,a.length-1)]-a[j])*(i-j)})};
 const thresholds=Object.fromEntries(['gulf','andaman'].map(region=>[region,{spm:quantile(s.cells.filter(c=>c.region===region).map(c=>c.spm)),chl:quantile(s.cells.filter(c=>c.region===region).map(c=>c.chl))}]));
 const category=(n,q)=>n===null||!q?null:1+q.filter(t=>n>=t).length;
 const distance=(a,b)=>111.32*Math.hypot((a.lon-b.lon)*Math.cos((a.lat+b.lat)/2*Math.PI/180),a.lat-b.lat);
 for(let i=0;i<6;i++){
  const day=s.days[i],expected=new Date(Date.parse(s.issueDate)+i*86400000).toISOString().slice(0,10);
  if(day.date!==expected||s.dates[i]!==expected||day.cells.length!==s.cells.length)throw Error('Forecast days do not match');
  let nt=0,nb=0;
  for(let j=0;j<s.cells.length;j++){
   const c=s.cells[j],r=day.cells[j];if(r.id!==c.id)throw Error('Forecast cell mismatch');
   const complete=r.forcingValid===true&&[r.wave,r.wind,r.sst,r.rain48,r.solar,r.calm].every(finite);
   if(complete&&(r.wave<0||r.wave>25||r.wind<0||r.wind>100||r.sst<0||r.sst>45||r.rain48<0||r.rain48>2000||r.solar<0||r.solar>60||r.calm<0||r.calm>24))throw Error('Forcing values out of range');
   // Recalculate watch classes on the publishing server from the supplied
   // satellite measurements and source-computed daily conditions.
   for(const k of ['wave','wind','gust','wavePeriod'])if(r[k]!==null&&(!finite(r[k])||r[k]<0||r[k]>(k==='wave'?25:k==='wavePeriod'?50:150)))throw Error('Invalid wave/wind value');
   for(const k of ['waveDirection','windDirection'])if(r[k]!==null&&(!finite(r[k])||r[k]<0||r[k]>360))throw Error('Invalid direction');
   const qt=thresholds[c.region].spm,qb=thresholds[c.region].chl;
   const near=AREAS.slice(0,4).some(a=>distance(c,a)<=15),t=category(c.spm,qt),b=category(c.chl,qb);
   const turb=complete&&t!==null?Math.min(5,t+Number(r.wave>=.5||r.wind>=6||(near&&r.rain48>=20))):null;
   const bloom=complete&&b!==null?Math.max(1,Math.min(5,b+Number(r.calm>=12&&r.solar>=10&&r.sst>=28)-Number(r.calm<6||r.solar<6))):null;
   if(r.turbidity!==null&&(!Number.isInteger(r.turbidity)||r.turbidity<1||r.turbidity>5))throw Error('Invalid turbidity class');
   if(r.bloom!==null&&(!Number.isInteger(r.bloom)||r.bloom<1||r.bloom>5))throw Error('Invalid bloom class');
   if(!complete&&(r.turbidity!==null||r.bloom!==null))throw Error('Missing forcing must not acquire a colour');
   r.turbidity=turb;r.bloom=bloom;
   if(r.turbidity!==null)nt++;if(r.bloom!==null)nb++;
  }
  if(['gulf','andaman'].some(region=>day.cells.filter((c,j)=>s.cells[j].region===region&&finite(c.wave)&&finite(c.wind)).length<20))throw Error('Wave/wind coverage too low');day.validTurbidity=nt;day.validBloom=nb;
 }
 s.thresholds=thresholds;s.areas=AREAS;return s;
}
