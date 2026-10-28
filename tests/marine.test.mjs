import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {marineRegion} from '../lib/geography.mjs';
import {peakConditions} from '../lib/forecast-engine.mjs';
import {validateSnapshot} from '../lib/snapshot-validation.mjs';
import {category,direction} from '../lib/display.mjs';
const data=JSON.parse(await readFile(new URL('../public/data/latest.json',import.meta.url),'utf8'));
test('covers both Thai coasts and excludes land, Malaysia and Cambodia',()=>{
 assert.equal(marineRegion(98.1,7.8),'andaman');
 assert.equal(marineRegion(100.3,9.5),'gulf');
 for(const [x,y] of [[100.5,13.8],[100.3,5.4],[103.5,11.5],[98.4,12]])assert.equal(marineRegion(x,y),null);
 assert(data.cells.some(c=>c.region==='gulf'));
 assert(data.cells.some(c=>c.region==='andaman'));
 assert(data.cells.every(c=>marineRegion(c.lon,c.lat)===c.region));
 assert(Buffer.byteLength(JSON.stringify(data))<4000000,'publication stays below Vercel response limit');
});
test('direction and period are taken from the same peak hour, without averaging angles',()=>{
 const time=Array.from({length:24},(_,i)=>`2026-10-28T${String(i).padStart(2,'0')}:00`);
 const height=Array(24).fill(1);height[10]=3;
 const angle=Array(24).fill(1);angle[10]=359;
 const p=peakConditions({hourly:{time,wave_height:height,wave_direction:angle,wave_period:Array(24).fill(8)}},'2026-10-28','wave_height',['wave_direction','wave_period']);
 assert.equal(p.time,'2026-10-28T10:00');assert.deepEqual(p.values,[359,8]);
 assert.equal(direction(359),'เหนือ (359°)');
 assert.deepEqual(peakConditions({hourly:{time:time.slice(1),wave_height:height.slice(1)}},'2026-10-28','wave_height',['wave_direction']).values,[null]);
 assert.equal(category({wave:null},'wave'),null);
 assert.equal(category({wave:0},'wave'),1);
});
test('missing satellite data does not remove real wave/wind forecasts',()=>{
 const s=structuredClone(data);
 for(const c of s.cells){c.spm=null;c.spmDate=null;c.chl=null;c.chlDate=null}
 const validated=validateSnapshot(s,new Date(data.generatedAt));
 assert(validated.days.every(d=>d.validTurbidity===0&&d.validBloom===0));
 assert(validated.days.every(d=>d.cells.filter(c=>c.wave!==null&&c.wind!==null).length>100));
 const bad=structuredClone(data);bad.days[0].cells[0].windDirection=500;
 assert.throws(()=>validateSnapshot(bad,new Date(data.generatedAt)));
});
