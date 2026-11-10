import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {COASTAL_ZONES,coastalView,inView,nearestCoastalCell,scaleBarKm} from '../lib/coastal-views.mjs';
import {comparisonSeries,chartDomain,lineSegments} from '../lib/comparison.mjs';
import {AREAS} from '../lib/geography.mjs';
const data=JSON.parse(await readFile(new URL('../public/data/latest.json',import.meta.url),'utf8'));

test('every coastal window contains its reference areas and marine samples',()=>{
  for(const zone of COASTAL_ZONES){
    const view=coastalView('zone:'+zone.id);
    assert(data.cells.some(c=>c.region===zone.region&&inView(c,view.bbox)),zone.name);
    for(const id of zone.areas)assert(inView(AREAS.find(a=>a.id===id),view.bbox),id);
  }
  for(const area of AREAS){
    const view=coastalView('area:'+area.id);
    assert(inView(nearestCoastalCell(data.cells,area),view.bbox),area.name);
  }
  assert(scaleBarKm(600,4)/111.32*600*4<=200);
});
test('comparison uses a fixed nearest cell on the same coast and matches daily values',()=>{
  for(const metric of ['wave','wind','rain','sst'])for(const s of comparisonSeries(data,['PH','KB','SM'],metric)){
    const area=AREAS.find(a=>a.id===s.id);
    assert.equal(s.cell.region,area.region);
    assert.deepEqual(s.values,data.days.map(d=>d.cells.find(c=>c.id===s.cell.id)[metric]));
  }
  assert.equal(nearestCoastalCell([{id:'wrong-coast',lat:7.8,lon:98.15,region:'gulf'}],AREAS.find(a=>a.id==='PH')),null);
});
test('missing data splits lines, never becomes zero, and cannot create an endpoint trend',()=>{
  assert.deepEqual(lineSegments([1,null,0,3,null]),[[{value:1,index:0}],[{value:0,index:2},{value:3,index:3}]]);
  const tiny={areas:[{id:'a',name:'A',region:'gulf',lat:10,lon:100}],cells:[{id:'c',region:'gulf',lat:10,lon:100}],days:[{cells:[{id:'c',rain:null}]},{cells:[{id:'c',rain:0}]},{cells:[{id:'c',rain:4}]}]};
  const [s]=comparisonSeries(tiny,['a'],'rain');
  assert.deepEqual(s.values,[null,0,4]);assert.equal(s.delta,null);assert.equal(s.min,0);assert.equal(s.count,2);
  assert.deepEqual(chartDomain([{values:[null,null]}],'rain'),[0,1]);
  const d=chartDomain([{values:[29,30,null]}],'sst');assert(d[0]<29&&d[1]>30);
});
