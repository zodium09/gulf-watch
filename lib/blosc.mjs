/** Decode Blosc1 + LZ4, as used by public Copernicus Zarr v2 chunks.
 * Bounds checked; no dynamic code, WASM or native dependency. */
function lz4(src, size) {
 const dst=new Uint8Array(size); let p=0,q=0;
 while(p<src.length){
  const token=src[p++];let n=token>>>4;
  if(n===15){let v;do{if(p>=src.length)throw Error('LZ4 literal length');v=src[p++];n+=v}while(v===255)}
  if(p+n>src.length||q+n>size)throw Error('LZ4 literal bounds');dst.set(src.subarray(p,p+n),q);p+=n;q+=n;
  if(p===src.length)break;
  if(p+2>src.length)throw Error('LZ4 missing offset');const off=src[p++]|(src[p++]<<8);if(!off||off>q)throw Error('LZ4 offset');
  n=(token&15)+4;if((token&15)===15){let v;do{if(p>=src.length)throw Error('LZ4 match length');v=src[p++];n+=v}while(v===255)}
  if(q+n>size)throw Error('LZ4 match bounds');for(let i=0;i<n;i++){dst[q]=dst[q-off];q++}
 }
 if(q!==size)throw Error(`LZ4 decoded ${q}, expected ${size}`);return dst;
}
export function decodeBlosc(input){
 const src=input instanceof Uint8Array?input:new Uint8Array(input);const v=new DataView(src.buffer,src.byteOffset,src.byteLength);
 if(src.length<16)throw Error('Blosc header');const flags=src[2],ts=src[3],n=v.getUint32(4,true),bs=v.getUint32(8,true),c=v.getUint32(12,true);
 if(n>32*1024*1024||!bs||!ts||c!==src.length)throw Error('Blosc size');
 if(flags&2){if(src.length!==n+16)throw Error('Blosc memcpy size');return src.slice(16)}
 if(flags&4)throw Error('Bitshuffle unsupported');if((flags>>5)!==1)throw Error('Only LZ4 Blosc supported');
 const dst=new Uint8Array(n);const blocks=Math.ceil(n/bs);
 for(let b=0;b<blocks;b++){
  let p=v.getUint32(16+b*4,true);const size=Math.min(bs,n-b*bs);const splits=((flags&16)||size<bs)?1:ts;const splitSize=size/splits;
  if(!Number.isInteger(splitSize))throw Error('Blosc split size');const block=new Uint8Array(size);
  for(let s=0;s<splits;s++){
   if(p+4>src.length)throw Error('Blosc split header');const len=v.getUint32(p,true);p+=4;if(p+len>src.length)throw Error('Blosc split bounds');
   const part=src.subarray(p,p+len);block.set(len===splitSize?part:lz4(part,splitSize),s*splitSize);p+=len;
  }
  if(flags&1){const count=size/ts;for(let i=0;i<count;i++)for(let j=0;j<ts;j++)dst[b*bs+i*ts+j]=block[j*count+i]}
  else dst.set(block,b*bs);
 }
 return dst;
}
