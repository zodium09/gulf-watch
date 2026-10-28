import {test} from 'node:test';
import assert from 'node:assert/strict';
import {activityAssessment,rainCategory} from '../lib/activities.mjs';
import {daily} from '../lib/forecast-engine.mjs';
import {category,legend,palette,date} from '../lib/display.mjs';
const fair={wave:.2,wind:2,gust:4,rain:0,thunder:false};
test('missing, invalid, old and failed inputs cannot become favourable activity guidance',()=>{
 for(const key of Object.keys(fair))for(const missing of [null,undefined,NaN]){
  assert.equal(activityAssessment({...fair,[key]:missing}).level,null,key);
 }
 assert.equal(activityAssessment(fair,'boat',true).level,null);
 assert.equal(category({...fair,assessmentUnavailable:true},'tourism'),null);
 assert.equal(activityAssessment({...fair,rain:-1}).level,null);
});
test('worst factor governs and thunderstorms override otherwise calm seas',()=>{
 assert.equal(activityAssessment(fair).level,1);
 assert.equal(activityAssessment({...fair,wave:2}).level,4);
 assert.equal(activityAssessment({...fair,gust:17}).level,5);
 assert.equal(activityAssessment({...fair,thunder:true}).level,5);
 assert.equal(activityAssessment({...fair,thunder:true},'tourism').label,'ควรงดกิจกรรม');
 assert.equal(activityAssessment({...fair,sst:34}).level,1,'SST must not proxy human comfort');
});
test('rain thresholds use TMD tenth-mm boundaries without gaps',()=>{
 for(const [value,expected] of [[0,1],[.1,2],[10,2],[10.05,3],[10.1,3],[35,3],[35.1,4],[90,4],[90.1,5],[100,5]])assert.equal(rainCategory(value),expected,String(value));
 assert.equal(rainCategory(null),null);assert.equal(rainCategory(-1),null);
});
test('daily aggregates require 24 valid local hourly samples and distinguish sum, mean, maximum',()=>{
 const time=Array.from({length:24},(_,i)=>`2026-10-28T${String(i).padStart(2,'0')}:00`);
 const item={hourly:{time,sea_surface_temperature:Array(24).fill(2)}};
 assert.equal(daily(item,'2026-10-28','sea_surface_temperature','sum'),48);
 assert.equal(daily(item,'2026-10-28','sea_surface_temperature'),2);
 item.hourly.sea_surface_temperature[5]=6;
 assert.equal(daily(item,'2026-10-28','sea_surface_temperature','max'),6);
 item.hourly.sea_surface_temperature[5]=null;
 assert.equal(daily(item,'2026-10-28','sea_surface_temperature','sum'),null);
 assert.equal(daily(item,'2026-10-29','sea_surface_temperature','sum'),null);
});
test('new layers have five legend colours, null handling, and correct temperature boundaries',()=>{
 for(const mode of ['rain','sst','tourism','boat']){
  assert.equal(legend(mode).length,5);assert.equal(palette(mode).length,5);assert.equal(category({},mode),null);
 }
 assert.equal(category({sst:30},'sst'),4);
 assert.equal(date('2026-07-01'),'1 ก.ค.');
});

test('accumulations belong to the preceding hour, including next midnight and excluding opening midnight',()=>{
 const time=Array.from({length:25},(_,i)=>i===24?'2026-10-29T00:00':'2026-10-28T'+String(i).padStart(2,'0')+':00');
 const precipitation=Array(25).fill(1);precipitation[0]=100;precipitation[24]=7;
 const item={hourly:{time,precipitation}};
 assert.equal(daily(item,'2026-10-28','precipitation','sum'),30);
 item.hourly.time[24]=item.hourly.time[23];
 assert.equal(daily(item,'2026-10-28','precipitation','sum'),null);
});
