import {test} from 'node:test';
import assert from 'node:assert/strict';
import {forecastReadiness, defaultForecastDay} from '../lib/freshness.mjs';
import {observedSpmClass, turbidityDetails} from '../lib/turbidity.mjs';

const data = {issueDate:'2026-11-09', generatedAt:'2026-11-09T06:23:40Z', days:[{date:'2026-11-09'},{date:'2026-11-10'},{date:'2026-11-11'}],publicationStatus:{state:'succeeded'}};
test('midnight and a delayed daily update do not erase valid current forecasts',()=>{
  const now=new Date('2026-11-10T02:30:00Z');
  assert.equal(defaultForecastDay(data,now),1);
  const r=forecastReadiness(data,'2026-11-10','ok',now);
  assert.equal(r.unavailable,false);
  assert.equal(r.previousIssue,true);
  assert.equal(forecastReadiness(data,'2026-11-09','ok',now).unavailable,true);
  assert.equal(forecastReadiness(data,'2026-11-15','ok',now).unavailable,true);
});
test('expired, failed, invalid, loading and future-dated data remain unavailable',()=>{
  assert.equal(forecastReadiness(data,'2026-11-11','ok',new Date('2026-11-10T18:23:41Z')).unavailable,true);
  const now=new Date('2026-11-10T02:30:00Z');
  for(const network of ['loading','error'])assert.equal(forecastReadiness(data,'2026-11-10',network,now).unavailable,true);
  for(const changed of [{generatedAt:'invalid'},{generatedAt:'2026-11-11T00:00Z'},{publicationStatus:{state:'failed'}}])assert.equal(forecastReadiness({...data,...changed},'2026-11-10','ok',now).unavailable,true);
});
test('SPM class depends on observed concentration, not wind, waves, rain or missing SST',()=>{
  const cell={spm:3,spmUncertainty:70,region:'gulf',spmDate:'2026-11-08'};
  const q=[1,2,4,8];
  assert.equal(observedSpmClass({...cell,wave:4,wind:20,rain48:150,sst:null},q),3);
  assert.equal(observedSpmClass({...cell,wave:0,wind:0,rain48:0},q),3);
  for(const changed of [{spm:null},{spm:1001},{spmUncertainty:null},{spmUncertainty:101}])assert.equal(observedSpmClass({...cell,...changed},q),null);
  const peers=[cell,{...cell,spm:1},{...cell,spm:3},{...cell,spm:7},{...cell,region:'andaman',spm:99}];
  const result=turbidityDetails(cell,peers,q,'2026-11-10');
  assert.equal(result.percentile,50);
  assert.equal(result.sampleCount,4);
  assert.equal(result.ageDays,2);
  assert.equal(turbidityDetails({...cell,spm:null},peers,q,'2026-11-10').percentile,null);
});
