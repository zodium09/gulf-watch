'use client';
import {useMemo,useState} from 'react';
import {ChartNoAxesCombined,MapPin,ArrowUpRight} from 'lucide-react';
import {comparisonSeries,chartDomain,lineSegments,COMPARISON_METRICS} from '../lib/comparison.mjs';
import {date,num,isNumber} from '../lib/display.mjs';

const styles=[{color:'#087bba',dash:'',label:'เส้นทึบ'},{color:'#c46619',dash:'9 5',label:'เส้นประ'},{color:'#8058af',dash:'2 5',label:'เส้นจุด'}];
export default function ComparisonChart({data,day,setDay,onArea,viewAreaIds,viewName,warning}:any) {
  const [ids,setIds]=useState(['PH','KB','SM']);
  const [metric,setMetric]=useState<keyof typeof COMPARISON_METRICS>('wave');
  const [hover,setHover]=useState<number|null>(null);
  const series=useMemo(()=>comparisonSeries(data,ids,metric),[data,ids,metric]);
  const info=COMPARISON_METRICS[metric],domain=chartDomain(series,metric),active=hover??day;
  const x=(i:number)=>65+i*650/Math.max(1,data.days.length-1);
  const y=(v:number)=>250-(v-domain[0])/(domain[1]-domain[0])*210;
  const setSlot=(index:number,id:string)=>setIds(old=>old.map((v,i)=>i===index?id:v));
  const useView=()=>{const chosen=viewAreaIds.slice(0,3);setIds([chosen[0]??data.areas[0].id,chosen[1]??'',chosen[2]??''])};
  const shared=series.some((s:any,i:number)=>s.cell&&series.slice(0,i).some((t:any)=>t.cell?.id===s.cell.id));
  return <section className="comparison-section" id="compare" aria-labelledby="compare-title">
    <div className="comparison-heading"><div><span className="eyebrow"><ChartNoAxesCombined size={17}/>เทียบก่อนเลือกวันเดินทาง</span><h2 id="compare-title">ทะเลต่างจุด แนวโน้มต่างกันอย่างไร</h2><p>เปรียบเทียบพยากรณ์ 6 วัน สูงสุด 3 จุดอ้างอิง</p></div><button className="outline-button" onClick={useView}><MapPin size={15}/>ใช้จุดในมุมมองแผนที่</button></div>
    <div className="comparison-controls">{ids.map((id,i)=><label key={i}><span style={{color:styles[i].color}}>จุดที่ {i+1} · {styles[i].label}</span><select aria-label={`พื้นที่เปรียบเทียบ ${i+1}`} value={id} onChange={e=>setSlot(i,e.target.value)}>{i>0&&<option value="">ไม่เปรียบเทียบ</option>}{data.areas.map((a:any)=><option key={a.id} value={a.id} disabled={ids.includes(a.id)&&id!==a.id}>{a.name}</option>)}</select></label>)}</div>
    <div className="comparison-metrics"><div className="chart-tabs" role="group" aria-label="ตัวแปรเปรียบเทียบ">{Object.entries(COMPARISON_METRICS).map(([key,m])=><button key={key} aria-pressed={metric===key} onClick={()=>{setMetric(key as keyof typeof COMPARISON_METRICS);setHover(null)}}>{m.label}</button>)}</div><span>มุมมองแผนที่: {viewName}</span></div>
    {warning&&<p className="comparison-warning" role="status">{warning} · กราฟแสดงค่าจากชุดที่มีอยู่ กรุณาตรวจวันออกชุด</p>}
    <div className="comparison-chart-note"><strong>{info.detail} ({info.unit})</strong><span>{metric==='sst'?`แกน SST ขยายช่วง ${num(domain[0])}–${num(domain[1])} °C`:'แกนตั้งเริ่มที่ศูนย์'} · แตะวันเพื่อเปลี่ยนแผนที่</span></div>
    <div className="comparison-scroll"><svg className="comparison-chart" viewBox="0 0 790 305" role="group" aria-label={`กราฟเปรียบเทียบ${info.label}รายวัน`} onMouseLeave={()=>setHover(null)}>
      <title>{`${info.detail} ของ ${series.map((s:any)=>s.name).join(' เทียบกับ ')}`}</title><desc>แต่ละเส้นเป็นพิกเซลทะเลใกล้จุดอ้างอิงเดิมตลอด 6 วัน เส้นขาดหมายถึงไม่มีข้อมูล มีตารางตัวเลขด้านล่าง</desc>
      {[0,.25,.5,.75,1].map(t=>{const value=domain[0]+t*(domain[1]-domain[0]);return <g key={t}><line x1="65" x2="715" y1={y(value)} y2={y(value)} stroke="#dae7ed" strokeDasharray={t?'3 4':undefined}/><text x="52" y={y(value)+4} textAnchor="end">{num(value,1)}</text></g>})}
      <line x1={x(active)} x2={x(active)} y1="27" y2="250" stroke="#9bbdc7" strokeDasharray="4 4"/>
      {series.map((s:any)=>{const slot=ids.indexOf(s.id),style=styles[slot];return <g key={s.id} pointerEvents="none">{lineSegments(s.values).map((segment:any[],i:number)=><polyline key={i} points={segment.map(p=>`${x(p.index)},${y(p.value)}`).join(' ')} fill="none" stroke={style.color} strokeWidth="3" strokeDasharray={style.dash} strokeLinecap="round" strokeLinejoin="round"/>)}{s.values.map((v:any,i:number)=>isNumber(v)&&<circle key={i} cx={x(i)} cy={y(v)} r={active===i?6:4} fill="white" stroke={style.color} strokeWidth="2.5"/>)}</g>})}
      {data.days.map((d:any,i:number)=><g key={d.date} role="button" tabIndex={0} className="comparison-day" aria-pressed={day===i} aria-label={`${date(d.date)} ${series.map((s:any)=>`${s.name} ${num(s.values[i],info.digits)} ${info.unit}`).join(' · ')}`} onMouseEnter={()=>setHover(i)} onFocus={()=>setHover(i)} onBlur={()=>setHover(null)} onClick={()=>setDay(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setDay(i)}}}><rect x={x(i)-38} y="25" width="76" height="269" fill="transparent"/><text x={x(i)} y="283" textAnchor="middle" fontWeight={day===i?'600':'400'} fill={day===i?'#007e91':'#526f7d'}>{date(d.date)}</text></g>)}
      {!series.some((s:any)=>s.count)&&<text x="390" y="145" textAnchor="middle">ยังไม่มีข้อมูลตัวแปรนี้ในจุดที่เลือก</text>}
    </svg></div>
    <div className="comparison-readout" aria-live="polite"><strong>{date(data.days[active].date,true)}</strong>{series.map((s:any)=>{const style=styles[ids.indexOf(s.id)];return <span key={s.id}><i style={{borderColor:style.color,borderTopStyle:style.dash?'dashed':'solid'}}/>{s.name} <b>{num(s.values[active],info.digits)}</b> {info.unit}</span>})}</div>
    <div className="comparison-summaries">{series.map((s:any)=>{const style=styles[ids.indexOf(s.id)];return <article key={s.id} style={{borderTopColor:style.color}}><button onClick={()=>onArea(s.id)}>{s.name}<ArrowUpRight size={15}/><span className="sr-only">ดูบนแผนที่</span></button><p>{isNumber(s.delta)?<>ปลายช่วง{Math.abs(s.delta)<.00001?'เท่าเดิม':s.delta>0?'เพิ่มขึ้น':'ลดลง'} <strong>{num(Math.abs(s.delta),info.digits)} {info.unit}</strong></>:'คำนวณการเปลี่ยนแปลงไม่ได้: วันแรกหรือวันสุดท้ายไม่มีข้อมูล'}</p><dl><div><dt>ต่ำสุด–สูงสุดในช่วง</dt><dd>{num(s.min,info.digits)}–{num(s.max,info.digits)} {info.unit}</dd></div><div><dt>วันที่มีข้อมูล</dt><dd>{s.count} / {data.days.length} วัน</dd></div></dl><small>พิกเซลห่างจุดอ้างอิง {num(s.distanceKm)} กม.{s.cell&&` · ${s.cell.lat.toFixed(3)}° N, ${s.cell.lon.toFixed(3)}° E`}</small></article>})}</div>
    <p className="comparison-footnote">ใช้พิกเซลที่ใกล้จุดอ้างอิงในฝั่งเดียวกัน ไม่ใช่ค่าเฉลี่ยทั้งจังหวัด · ผลต่างเทียบวันสุดท้ายกับวันแรกของชุด ไม่ใช่แนวโน้มทางสถิติ · เส้นเชื่อมช่วยอ่านรายวัน ไม่มีข้อมูลจะเว้นช่วง{shared?' · บางจุดใช้พิกเซลเดียวกันจึงมีค่าเท่ากัน':''}</p>
    <details className="forecast-table"><summary>ดูตารางเปรียบเทียบทั้ง 6 วัน</summary><div className="table-scroll"><table><caption>{info.detail} · {info.unit} · ชุดคำนวณ {new Date(Date.parse(data.generatedAt)+7*3600000).toISOString().slice(0,16).replace('T',' ')} น.</caption><thead><tr><th>วัน</th>{series.map((s:any)=><th key={s.id}>{s.name}</th>)}</tr></thead><tbody>{data.days.map((d:any,i:number)=><tr key={d.date} className={i===day?'selected':''}><th><button aria-pressed={i===day} onClick={()=>setDay(i)}>{date(d.date)}</button></th>{series.map((s:any)=><td key={s.id}>{num(s.values[i],info.digits)}</td>)}</tr>)}</tbody></table></div></details>
  </section>;
}
