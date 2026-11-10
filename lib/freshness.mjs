// Operational freshness limit for this app, not a provider accuracy guarantee.
export const MAX_FORECAST_AGE_HOURS = 36;
export const localDay = (now = new Date()) => new Date(+now + 7 * 3600000).toISOString().slice(0, 10);
export function defaultForecastDay(data, now = new Date()) {
  const index = data.days.findIndex(d => d.date >= localDay(now));
  return index < 0 ? data.days.length - 1 : index;
}
export function forecastReadiness(data, selectedDate, network = 'ok', now = new Date()) {
  const today = localDay(now);
  const ageHours = (+now - Date.parse(data.generatedAt)) / 3600000;
  const stale = !Number.isFinite(ageHours) || ageHours < -5 / 60 || ageHours > MAX_FORECAST_AGE_HOURS;
  let reason = '';
  if (network === 'loading') reason = 'กำลังตรวจสอบชุดข้อมูลล่าสุด';
  else if (network === 'error' || data.publicationStatus?.state === 'failed') reason = 'ตรวจสอบข้อมูลล่าสุดไม่สำเร็จ กดตรวจข้อมูลล่าสุดเพื่อลองอีกครั้ง';
  else if (stale) reason = 'ชุดพยากรณ์หมดอายุใช้งานของแอป (เกิน 36 ชั่วโมงหรือเวลาข้อมูลไม่ถูกต้อง)';
  else if (!data.days?.some(d => d.date === selectedDate)) reason = 'วันที่เลือกอยู่นอกช่วงพยากรณ์';
  else if (selectedDate < today) reason = 'วันที่เลือกเป็นข้อมูลย้อนหลัง เลือกวันนี้หรือวันถัดไปเพื่อดูผลคัดกรอง';
  return {unavailable: !!reason, reason, stale, ageHours, previousIssue: data.issueDate < today};
}
