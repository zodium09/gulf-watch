import {Satellite, ArrowUpRight} from 'lucide-react';
import {turbidityDetails} from '../lib/turbidity.mjs';
import {date, num, isNumber, LEVELS} from '../lib/display.mjs';

export default function TurbidityPanel({cell, data, selectedDate}: {cell:any; data:any; selectedDate:string}) {
  const thresholds = data.thresholds[cell.region]?.spm;
  const result = turbidityDetails(cell, data.cells, thresholds, selectedDate);
  const region = cell.region === 'gulf' ? 'อ่าวไทย' : 'อันดามัน';
  return <section className="turbidity-panel" aria-label="วิเคราะห์ตะกอนแขวนลอย">
    <h2><Satellite size={18}/>เจาะลึกความขุ่นจาก SPM</h2>
    <p className="analysis-kicker">ค่าประมาณจากสีผิวน้ำที่ดาวเทียมสังเกต</p>
    <div className="spm-reading"><strong>{num(cell.spm, 2)}</strong><span>g/m³ = mg/L</span></div>
    <p>ตะกอนแขวนลอยอนินทรีย์ (SPM) ใช้ประกอบการศึกษาความขุ่น ไม่ใช่ค่าความขุ่น NTU/FNU</p>
    <dl>
      <div><dt>สังเกตจริง</dt><dd>{date(cell.spmDate, true)}</dd></div>
      <div><dt>ห่างจากวันที่เลือก</dt><dd>{isNumber(result.ageDays) ? `${result.ageDays} วัน` : 'ไม่ทราบ'}</dd></div>
      <div><dt>ความไม่แน่นอนจากผู้ให้บริการ</dt><dd>{num(cell.spmUncertainty)}%</dd></div>
      <div><dt>อันดับใน{region}</dt><dd>{result.level ? `${LEVELS[result.level - 1]} (Q${result.level})` : 'ข้อมูลไม่พอ'}</dd></div>
      <div><dt>เปอร์เซ็นไทล์เชิงพื้นที่</dt><dd>{num(result.percentile, 0)} / 100</dd></div>
      <div><dt>พิกเซลที่ใช้เปรียบเทียบ</dt><dd>{num(result.sampleCount, 0)}</dd></div>
    </dl>
    <p className="analysis-note">{result.ageDays > 5 ? 'ข้อมูลสังเกตห่างจากวันที่เลือกเกิน 5 วัน ยิ่งไม่เหมาะใช้แทนสภาพวันนั้น ' : ''}สี SPM คงตามภาพสังเกตล่าสุดทุกวันในไทม์ไลน์ ไม่ใช่พยากรณ์ความเข้มข้นในอนาคต</p>
    <details className="factor-details"><summary>เกณฑ์สีและข้อจำกัดการแปลผล</summary>
      <p>จุดแบ่ง Q1–Q5 ของ{region} (g/m³): {thresholds?.map((v:number) => num(v, 3)).join(' / ') ?? 'ข้อมูลไม่พอ'} · ค่าเท่าจุดแบ่งอยู่ชั้นที่สูงกว่า</p>
      <p>แบ่งเป็นกลุ่มประมาณ 20% ของพิกเซลที่ใช้ได้ในฝั่งเดียวกัน ค่าเท่ากันทำให้สัดส่วนคลาดเคลื่อน ชั้นสูงไม่ได้แปลว่าเกินมาตรฐาน และสีเดียวกันข้ามฝั่ง/ข้ามชุดอาจมีความเข้มข้นต่างกัน</p>
      <p>เปอร์เซ็นไทล์ใช้ลำดับกลางเมื่อค่าเท่ากัน ไม่ใช่เปอร์เซ็นต์โอกาสเกิดเหตุ ความไม่แน่นอนเป็นค่าจากผลิตภัณฑ์ ไม่ใช่ช่วงความเชื่อมั่น 95% ของการประเมินนี้</p>
      <p>ใช้พิกเซลไม่เป็นแผ่นดิน ค่าตามช่วงผลิตภัณฑ์ และความไม่แน่นอน 0–100% (เกณฑ์คัดกรองของแอป) เมฆ น้ำตื้น และพิกเซลผสมใกล้ฝั่งยังรบกวนได้</p>
    </details>
    <details className="factor-details"><summary>ลม คลื่น และฝนเกี่ยวข้องอย่างไร</summary>
      <dl><div><dt>คลื่นสูงสุด</dt><dd>{num(cell.wave, 2)} ม.</dd></div><div><dt>ลมสูงสุด</dt><dd>{num(cell.wind)} ม./วินาที</dd></div><div><dt>ฝนสะสม 48 ชม.</dt><dd>{num(cell.rain48)} มม.</dd></div></dl>
      <p>คลื่นและกระแสน้ำอาจกวนตะกอน แต่ต้องทราบความลึก ชนิดตะกอน และแรงเฉือนที่พื้นทะเล ฝน ณ พิกเซลทะเลไม่ใช่ฝนทั้งลุ่มน้ำหรือปริมาณตะกอนที่ปากแม่น้ำ จึงไม่บวกคะแนนความขุ่นจากปัจจัยเหล่านี้</p>
    </details>
    <a className="official-link" href="https://data.marine.copernicus.eu/product/OCEANCOLOUR_GLO_BGC_L3_NRT_009_101/description" target="_blank" rel="noreferrer">ดูผลิตภัณฑ์ Copernicus Marine<ArrowUpRight size={14}/></a>
  </section>;
}
