'use client';
import {ArrowUpRight, Satellite, Waves} from 'lucide-react';

const levels = ['ต่ำมาก', 'ต่ำ', 'ปานกลาง', 'สูง', 'สูงมาก'];
const colours = ['#407ca8', '#509b80', '#e3bd52', '#df8d4e', '#c85c50'];
const numeric = (n: number) => n.toLocaleString('th-TH', {maximumFractionDigits: 1});
const shortDate = (d: string) => `${Number(d.slice(8))}/${Number(d.slice(5, 7))}`;
const high = (cells: any[], key: string) => {
  const valid = cells.filter(c => Number.isInteger(c[key]));
  const count = valid.filter(c => c[key] >= 4).length;
  return {count, total: valid.length, percent: valid.length ? Math.round(100 * count / valid.length) : null};
};
const distance = (a: any, b: any) => Math.hypot((a.lon - b.lon) * Math.cos(a.lat * Math.PI / 180), a.lat - b.lat);

export default function Overview({data, day, setDay, select}: {data: any; day: number; setDay: (n: number) => void; select: (id: string) => void}) {
  const records = data.days[day].cells;
  const turbidity = high(records, 'turbidity'), bloom = high(records, 'bloom');
  const areas = data.areas.map((area: any) => {
    const cell = data.cells.reduce((a: any, b: any) => distance(a, area) <= distance(b, area) ? a : b);
    return {...area, ...records[data.cells.indexOf(cell)], id: area.id};
  });
  const focus = [...areas].sort((a: any, b: any) => Math.max(b.turbidity ?? 0, b.bloom ?? 0) - Math.max(a.turbidity ?? 0, a.bloom ?? 0)).slice(0, 4);
  return <section className="overview" aria-label="สรุปข้อมูลประจำวัน">
    <div className="overview-heading"><h2>ภาพรวมวันที่เลือก</h2><span>{shortDate(data.dates[day])} · ระดับสัมพัทธ์ภายในฝั่งทะเลเดียวกัน</span></div>
    <div className="summary-strip">
      <div className="summary-reading"><span><Waves size={17}/>เฝ้าระวังความขุ่น</span><div><strong>{turbidity.percent ?? '—'}<small>%</small></strong><p>{turbidity.count} จาก {turbidity.total} พิกเซล<br/>อยู่ในระดับสูง–สูงมาก</p></div></div>
      <div className="summary-reading"><span><Satellite size={17}/>เฝ้าระวังแพลงก์ตอน</span><div><strong>{bloom.percent ?? '—'}<small>%</small></strong><p>{bloom.count} จาก {bloom.total} พิกเซล<br/>อยู่ในระดับสูง–สูงมาก</p></div></div>
      <div className="summary-explainer"><strong>อ่านสีเป็นสัญญาณให้จับตา</strong><p>เปอร์เซ็นต์คือสัดส่วนพิกเซลที่มีข้อมูล<br/>ไม่ใช่โอกาสเกิดบลูมหรือพื้นที่เสียหาย</p><a href="#method">เข้าใจวิธีประเมิน <ArrowUpRight size={14}/></a></div>
    </div>
    <div className="dashboard-details">
      <div className="outlook"><div className="section-title"><h3>แนวโน้ม 6 วัน</h3><span>สัดส่วนพิกเซลเฝ้าระวังระดับสูง–สูงมาก</span></div><div className="outlook-legend"><span><i/>ความขุ่น</span><span><i/>แพลงก์ตอน</span><span>0–100%</span></div><div className="outlook-chart">{data.days.map((d: any, i: number) => {
        const t = high(d.cells, 'turbidity'), b = high(d.cells, 'bloom');
        return <button key={d.date} onClick={() => setDay(i)} className={day === i ? 'chosen' : ''} aria-pressed={day === i} aria-label={`${shortDate(d.date)} ความขุ่น ${t.percent ?? 'ไม่มีข้อมูล'} เปอร์เซ็นต์ แพลงก์ตอน ${b.percent ?? 'ไม่มีข้อมูล'} เปอร์เซ็นต์`}><div className="bar-pair"><div><span>{t.percent ?? '—'}</span><i style={{height: `${t.percent ?? 0}%`}}/></div><div><span>{b.percent ?? '—'}</span><i style={{height: `${b.percent ?? 0}%`}}/></div></div><strong>{shortDate(d.date)}</strong></button>;
      })}</div></div>
      <div className="focus-areas"><div className="section-title"><h3>จุดที่ควรจับตา</h3><span>เลือกเพื่อดูรายละเอียดบนแผนที่</span></div><div className="area-table"><div className="area-table-head"><span>จุดอ้างอิง</span><span>ความขุ่น</span><span>บลูม</span></div>{focus.map((a: any) => <button key={a.id} onClick={() => {select(a.id); document.getElementById('forecast-map')?.scrollIntoView({behavior: 'smooth', block: 'start'});}}><span>{a.name}<ArrowUpRight size={13}/></span>{['turbidity', 'bloom'].map(key => <span key={key}><i style={{background: a[key] ? colours[a[key] - 1] : '#d4dfe0'}}/>{a[key] ? levels[a[key] - 1] : 'ข้อมูลไม่พอ'}</span>)}</button>)}</div><p>เปรียบเทียบพิกเซลใกล้จุดอ้างอิง · ความเชื่อมั่นต่ำ</p></div>
    </div>
    <div className="freshwater-summary"><div><h3>ข้อมูลน้ำท่าประกอบ</h3><p>ข้อมูลสถานีเหนือน้ำประกอบการเฝ้าระวัง ยังไม่ใช่ยอดสุทธิออกทะเล และยังไม่ใช้คำนวณสีความเสี่ยง</p></div><div className="gauge-list">{data.rivers.stations.length ? data.rivers.stations.map((s: any) => <div key={s.code}><span>{s.name} · {s.code}</span><strong>{numeric(s.dischargeM3s)} <small>ม³/วินาที</small></strong><time>{s.observedAt} น.</time></div>) : <p>ยังไม่มีสถานีอัตราการไหลที่ใช้แทนพื้นที่นี้ได้ ไม่ประมาณเป็นศูนย์</p>}</div></div>
  </section>;
}

