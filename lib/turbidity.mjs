export const TURBIDITY_METHOD = 'spm-observed-relative-v2';
const finite = n => typeof n === 'number' && Number.isFinite(n);
export const observationAge = (observed, target) => (Date.parse(target) - Date.parse(observed)) / 86400000;
export function observedSpmClass(cell, thresholds) {
  if (!finite(cell?.spm) || cell.spm <= 0 || cell.spm > 1000 || !finite(cell.spmUncertainty) || cell.spmUncertainty < 0 || cell.spmUncertainty > 100 || !thresholds?.length) return null;
  return 1 + thresholds.filter(t => cell.spm >= t).length;
}
export function turbidityDetails(cell, peers, thresholds, selectedDate) {
  const level = observedSpmClass(cell, thresholds);
  const values = peers.filter(c => c.region === cell.region && observedSpmClass(c, thresholds) !== null).map(c => c.spm);
  // Midrank percentile handles ties; this is spatial context, not a climate anomaly.
  const percentile = level === null || !values.length ? null : 100 * (values.filter(n => n < cell.spm).length + .5 * values.filter(n => n === cell.spm).length) / values.length;
  return {level, percentile, sampleCount: values.length, ageDays: observationAge(cell.spmDate, selectedDate), method: TURBIDITY_METHOD};
}
