'use client';
import {MapPin, Scan, ArrowUpRight} from 'lucide-react';
import {COASTAL_ZONES} from '../lib/coastal-views.mjs';

export default function CoastalNavigator({areas,region,viewId,viewName,onView}:any) {
  return <section className="coastal-nav" aria-label="ซูมพื้นที่ชายฝั่ง">
    <div className="coastal-nav-title"><div><strong><Scan size={19}/>ซูมสำรวจชายฝั่ง</strong><p>เลือกโซน หรือเจาะดูจุดหมายที่สนใจ</p></div><button onClick={()=>onView('overview')} className="outline-button">ภาพรวมฝั่งทะเล</button></div>
    <div className="coastal-zones" role="group" aria-label="เลือกโซนชายฝั่ง">{COASTAL_ZONES.filter(z=>region==='all'||z.region===region).map(z=><button key={z.id} aria-pressed={viewId===`zone:${z.id}`} onClick={()=>onView(`zone:${z.id}`)}>{z.name}<ArrowUpRight size={13}/></button>)}</div>
    <div className="coastal-destination"><label htmlFor="coastal-area"><MapPin size={16}/>ซูมรายพื้นที่</label><select id="coastal-area" value={viewId.startsWith('area:')?viewId.slice(5):''} onChange={e=>e.target.value&&onView(`area:${e.target.value}`)}><option value="">เลือกจุดหมาย…</option>{areas.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}</select><span aria-live="polite">มุมมอง: {viewName}</span></div>
    <p className="coastal-resolution">กรอบโซนใช้ช่วยนำทาง · การซูมขยายข้อมูลเดิม (~12 กม.) ไม่เพิ่มความละเอียดของแบบจำลอง</p>
  </section>;
}
