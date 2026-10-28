'use client';
import {useMemo,useState} from 'react';
import {Plus,Minus,LocateFixed} from 'lucide-react';
import coastline from '../lib/coastline.json';
import boundary from '../lib/thai-marine-boundary.json';
import {REGIONS} from '../lib/geography.mjs';
import {COLORS,MODES,valueLabel,isNumber} from '../lib/display.mjs';

export default function MarineMap({data,cells,chosen,mode,region,onChoose}:any){
 const [zoom,setZoom]=useState(1);
 const box=REGIONS[region as keyof typeof REGIONS].bbox;
 const [west,south,east,north]=box,cx=(west+east)/2,cy=(south+north)/2,cos=Math.cos(cy*Math.PI/180),scale=Math.min(860/((east-west)*cos),780/(north-south));
 const xy=(lon:number,lat:number)=>[500+(lon-cx)*scale*cos,450-(lat-cy)*scale];
 const path=(g:any)=>(g.type==='MultiPolygon'?g.coordinates:g.type==='Polygon'?[g.coordinates]:[]).flatMap((p:any)=>p.map((r:any)=>r.map(([x,y]:number[],i:number)=>{const [a,b]=xy(x,y);return `${i?'L':'M'}${a.toFixed(1)} ${b.toFixed(1)}`}).join(' ')+'Z')).join(' ');
 const land=useMemo(()=>coastline.map(path).join(' '),[region]);
 const marine=useMemo(()=>path(boundary.geometry),[region]);
 const stepX=data.gridStep.lon*scale*cos,stepY=data.gridStep.lat*scale;
 const center=zoom>1&&chosen?xy(chosen.lon,chosen.lat):[500,450];
 const view=`translate(500 450) scale(${zoom}) translate(${-center[0]} ${-center[1]})`;
 const arrows:any[]=[];const bins=new Set();
 if(mode==='wind'||mode==='wave')for(const c of cells){const [x,y]=xy(c.lon,c.lat);const key=Math.floor(x/60)+':'+Math.floor(y/60),d=c[mode==='wind'?'windDirection':'waveDirection'];if(!bins.has(key)&&isNumber(c[mode])&&isNumber(d)){bins.add(key);arrows.push({...c,x,y,d})}}
 const navigate=(e:React.KeyboardEvent)=>{if(!chosen||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const dx=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,dy=e.key==='ArrowDown'?-1:e.key==='ArrowUp'?1:0;const candidates=cells.filter((c:any)=>dx?(c.lon-chosen.lon)*dx>data.gridStep.lon*.5:(c.lat-chosen.lat)*dy>data.gridStep.lat*.5);const target={lon:chosen.lon+dx*data.gridStep.lon,lat:chosen.lat+dy*data.gridStep.lat};const dist=(c:any)=>Math.hypot((c.lon-target.lon)*cos,c.lat-target.lat);if(candidates.length)onChoose(candidates.reduce((a:any,b:any)=>dist(a)<dist(b)?a:b))};
 return <div className="map-frame national-map"><p className="sr-only" id="map-help">ใช้ปุ่มลูกศรบนแป้นพิมพ์เพื่อเลือกพิกเซลข้างเคียง ขยายแล้วแผนที่จะจัดศูนย์กลางตรงจุดที่เลือก</p><svg className="gulf-map" viewBox="0 0 1000 900" role="group" tabIndex={0} onKeyDown={navigate} aria-describedby="map-help" aria-label={`แผนที่${MODES[mode as keyof typeof MODES]} ${REGIONS[region as keyof typeof REGIONS].name}`}><defs><clipPath id="canvas"><rect width="1000" height="900"/></clipPath><clipPath id="thai-water"><path d={marine} clipRule="evenodd"/></clipPath><marker id="flow-head" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="#183e4b"/></marker></defs><g clipPath="url(#canvas)"><rect width="1000" height="900" fill="#e4eff0"/><g transform={view}>
 {[96,98,100,102].map(x=><path key={x} d={`M${xy(x,north)[0]} 0V900`} stroke="#c4d7d7" strokeDasharray="3 8"/>)}{[6,8,10,12].map(y=><path key={y} d={`M0 ${xy(west,y)[1]}H1000`} stroke="#c4d7d7" strokeDasharray="3 8"/>)}
 <g clipPath="url(#thai-water)">{cells.map((c:any)=>{const [x,y]=xy(c.lon,c.lat);return <rect key={c.id} x={x-stepX/2} y={y-stepY/2} width={stepX+.1} height={stepY+.1} fill={c.colour??'#d4dfe0'} fillOpacity=".9" stroke="#e4eff0" strokeWidth=".3" className="water-cell" onClick={()=>onChoose(c)}><title>{`${c.lat.toFixed(3)}° N ${c.lon.toFixed(3)}° E · ${valueLabel(c,mode)}`}</title></rect>})}</g>
 <path d={land} fill="#f5f3ec" stroke="#9aafa8" strokeWidth=".7" fillRule="evenodd" pointerEvents="none"/>
 <path d={marine} fill="none" stroke="#537f84" strokeWidth=".8" strokeDasharray="4 4" pointerEvents="none"/>
 {arrows.map(c=><g key={c.id} transform={`translate(${c.x} ${c.y}) rotate(${c.d})`} pointerEvents="none"><path d="M0 -7V7" stroke="#183e4b" strokeWidth="1.6" markerEnd="url(#flow-head)"/></g>)}
 {data.areas.filter((a:any)=>['CP','TR','HH','CH','SM','SK','PN','PH','ST'].includes(a.id)).map((a:any)=>{const [x,y]=xy(a.lon,a.lat);return <g key={a.id} className="area-marker" role="button" tabIndex={0} aria-label={`เลือก${a.name}`} onClick={()=>onChoose(cells.reduce((p:any,q:any)=>Math.hypot(p.lon-a.lon,p.lat-a.lat)<Math.hypot(q.lon-a.lon,q.lat-a.lat)?p:q))} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();onChoose(cells.reduce((p:any,q:any)=>Math.hypot(p.lon-a.lon,p.lat-a.lat)<Math.hypot(q.lon-a.lon,q.lat-a.lat)?p:q))}}}><circle cx={x} cy={y} r="3.5" fill="#fff" stroke="#315b5d"/><text x={x+6} y={y-7} className="national-label">{a.name}</text></g>})}
 {chosen&&(()=>{const [x,y]=xy(chosen.lon,chosen.lat);return <rect x={x-stepX/2-1} y={y-stepY/2-1} width={stepX+2} height={stepY+2} fill="none" stroke="#173e43" strokeWidth="2" pointerEvents="none"/>})()}
 </g><text x="34" y="44" className="national-map-title">{REGIONS[region as keyof typeof REGIONS].name}</text><text x="34" y="68" className="national-map-subtitle">เส้นประ: ขอบเขต EEZ จาก Marine Regions</text><g className="svg-scale"><path d={`M35 820v8h${100/111.32*scale*zoom/cos*cos}v-8`} fill="none" stroke="#31585d" strokeWidth="2"/><text x="35" y="852">100 กม. โดยประมาณ</text></g></g></svg><div className="map-controls"><button aria-label="ขยายแผนที่" onClick={()=>setZoom(n=>Math.min(4,n+.5))} disabled={zoom>=4}><Plus size={18}/></button><button aria-label="ย่อแผนที่" onClick={()=>setZoom(n=>Math.max(1,n-.5))} disabled={zoom<=1}><Minus size={18}/></button><button aria-label="กลับมุมมองเริ่มต้น" onClick={()=>setZoom(1)}><LocateFixed size={18}/></button></div><div className="north">N<span>↑</span></div></div>;
}
