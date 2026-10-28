// Conservative screening rules, not calibrated accident probabilities.
export const ACTIVITY_METHOD = 'weather-screening-v1';
const finite = n => typeof n === 'number' && Number.isFinite(n);
export const RISK_LABELS = ['ปัจจัยต่ำ', 'ควรติดตาม', 'ควรระวัง', 'ควรหลีกเลี่ยง', 'ควรงดกิจกรรม'];
export const TOURISM_LABELS = ['เอื้อต่อกิจกรรม', 'มีข้อจำกัดเล็กน้อย', 'ควรปรับแผน', 'ไม่เอื้อต่อกิจกรรม', 'ควรงดกิจกรรม'];
export const RISK_RULES = [
  {key:'wave', label:'คลื่นนัยสำคัญสูงสุด', unit:'ม.', limits:[0.5,1,2,3]},
  {key:'wind', label:'ลมสูงสุด', unit:'ม./วินาที', limits:[5,8,11,14]},
  {key:'gust', label:'ลมกระโชกสูงสุด', unit:'ม./วินาที', limits:[8,11,14,17]},
  {key:'rain', label:'ฝนสะสม 24 ชั่วโมง', unit:'มม.', limits:[10.1,35.1,90.1,150]},
];
export function rainCategory(n) {
  if (!finite(n) || n < 0) return null;
  const r = Math.round(n * 10) / 10;
  return r < 0.1 ? 1 : r <= 10 ? 2 : r <= 35 ? 3 : r <= 90 ? 4 : 5;
}
export function activityAssessment(cell, activity = 'boat', unavailable = false) {
  const missing = RISK_RULES.filter(r => !finite(cell?.[r.key]) || cell[r.key] < 0).map(r => r.label);
  if (typeof cell?.thunder !== 'boolean') missing.push('ฝนฟ้าคะนอง');
  const factors = RISK_RULES.map(r => ({...r, value:cell?.[r.key], level:finite(cell?.[r.key]) && cell[r.key] >= 0 ? 1+r.limits.filter(t=>cell[r.key]>=t).length : null}));
  if (unavailable || missing.length) return {level:null,label:unavailable?'ข้อมูลยังไม่พร้อมใช้วางแผน':'ข้อมูลยังไม่ครบ',missing,factors,reasons:[],method:ACTIVITY_METHOD};
  const level = Math.max(...factors.map(f=>f.level), cell.thunder ? 5 : 1);
  const reasons = factors.filter(f=>f.level===level).map(f=>f.label);
  if (cell.thunder) reasons.unshift('แบบจำลองระบุฝนฟ้าคะนอง');
  return {level,label:(activity==='tourism'?TOURISM_LABELS:RISK_LABELS)[level-1],missing:[],factors,reasons,method:ACTIVITY_METHOD};
}
