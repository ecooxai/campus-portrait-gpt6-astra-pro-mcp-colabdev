import * as THREE from 'three';
function tex(size,draw){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function makeMaterials(){
 // Original procedural cloth patterns only. The photograph is never read by this code.
 const cloth=tex(512,(c,s)=>{c.fillStyle='#f2f1ef';c.fillRect(0,0,s,s);for(let x=0;x<s;x+=3){c.strokeStyle=x%2?'#e5e5e4':'#fcfcfc';c.lineWidth=.65;c.beginPath();c.moveTo(x,0);c.lineTo(x,s);c.stroke();}for(let y=0;y<s;y+=4){c.fillStyle='rgba(130,130,142,.055)';c.fillRect(0,y,s,1);}});cloth.repeat.set(2,2);
 const plaid=tex(1024,(c,s)=>{
 c.fillStyle='#202733';c.fillRect(0,0,s,s);
 for(let x=0;x<s;x+=256){c.fillStyle='rgba(151,166,184,.18)';c.fillRect(x+33,0,46,s);c.fillRect(x+103,0,20,s);c.fillStyle='rgba(6,10,20,.36)';c.fillRect(x+170,0,47,s);c.fillStyle='rgba(163,176,192,.28)';c.fillRect(x+24,0,3,s);c.fillRect(x+87,0,3,s);c.fillRect(x+132,0,2,s);}
 for(let y=0;y<s;y+=256){c.fillStyle='rgba(157,173,193,.17)';c.fillRect(0,y+33,s,46);c.fillRect(0,y+103,s,20);c.fillStyle='rgba(4,8,17,.34)';c.fillRect(0,y+173,s,41);c.fillStyle='rgba(173,185,199,.18)';c.fillRect(0,y+24,s,3);c.fillRect(0,y+87,s,3);c.fillRect(0,y+132,s,2);}
 for(let i=0;i<s;i+=3){c.fillStyle='rgba(216,222,229,.065)';c.fillRect(i,0,1,s);}for(let i=0;i<s;i+=4){c.fillStyle='rgba(0,0,0,.10)';c.fillRect(0,i,s,1);}
 });plaid.repeat.set(3,1);
 const tieMap=tex(512,(c,s)=>{c.fillStyle='#17253d';c.fillRect(0,0,s,s);for(let y=-s;y<2*s;y+=104){c.strokeStyle='#edc46b';c.lineWidth=5;c.beginPath();c.moveTo(0,y);c.lineTo(s,y-192);c.stroke();c.strokeStyle='rgba(4,9,22,.4)';c.lineWidth=1;c.beginPath();c.moveTo(0,y+6);c.lineTo(s,y-186);c.stroke();}for(let i=0;i<s;i+=3){c.strokeStyle='rgba(144,171,209,.055)';c.beginPath();c.moveTo(i,0);c.lineTo(0,i);c.stroke();}});
 const rib=tex(256,(c,s)=>{c.fillStyle='#202639';c.fillRect(0,0,s,s);for(let i=0;i<s;i+=8){c.fillStyle='#282e41';c.fillRect(i,0,2,s);c.fillStyle='#1c2231';c.fillRect(i+3,0,2,s);}for(let i=0;i<s;i+=3){c.fillStyle='rgba(130,139,155,.04)';c.fillRect(0,i,s,1);}});rib.repeat.set(2,2);
 const bump=tex(128,(c,s)=>{const rand=rng(54);c.fillStyle='#888';c.fillRect(0,0,s,s);for(let n=0;n<6000;n++){const g=110+Math.floor(rand()*40);c.fillStyle=`rgb(${g},${g},${g})`;c.fillRect(rand()*s,rand()*s,1,1);}});bump.colorSpace=THREE.NoColorSpace;bump.repeat.set(3,3);
 const hairTex=tex(512,(c,s)=>{c.fillStyle='#19191e';c.fillRect(0,0,s,s);const random=rng(284);for(let k=0;k<280;k++){const x=random()*s;c.strokeStyle=k%7?'rgba(75,67,65,.16)':'rgba(7,9,14,.25)';c.lineWidth=.4+random()*.7;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+5,170,x-4,350,x+1,s);c.stroke();}});
 const microNormal=tex(128,(c,s)=>{const pixels=c.createImageData(s,s);for(let y=0;y<s;y++)for(let x=0;x<s;x++){const nx=.21*Math.sin(x*2.6+y*.2)+.12*Math.sin(x*.91-y*1.3),ny=.17*Math.sin(y*2.1+x*.3)+.10*Math.cos(x*1.3+y*.9),nz=Math.sqrt(Math.max(.1,1-nx*nx-ny*ny)),i=(y*s+x)*4;pixels.data[i]=Math.round((nx+1)*127.5);pixels.data[i+1]=Math.round((ny+1)*127.5);pixels.data[i+2]=Math.round((nz+1)*127.5);pixels.data[i+3]=255;}c.putImageData(pixels,0,0);});microNormal.colorSpace=THREE.NoColorSpace;microNormal.repeat.set(4,4);
 const S=(color,roughness=.6,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
 const P=(color,roughness=.5,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness,...extra});
 const m={
 skin:P('#efc0a6',.56,{sheen:.15,sheenColor:'#ffcfc0',normalMap:microNormal,normalScale:new THREE.Vector2(.12,.12)}),face:P('#ffffff',.56,{vertexColors:true,sheen:.14,sheenColor:'#f6c8af',normalMap:microNormal,normalScale:new THREE.Vector2(.08,.08)}),
 lidShadow:S('#c9a48f',.9),nostril:S('#855a4d',.9),skinShadow:S('#bf8878',.67),upperLip:P('#b88177',.57,{clearcoat:.05}),lip:P('#c58d81',.50,{clearcoat:.10,side:THREE.DoubleSide}),mouth:S('#3e2328',.94),toothSeam:S('#bcad9e',.8),tooth:P('#f4ecdc',.39),
 eyeWhite:P('#e6e0d8',.38,{clearcoat:.35}),iris:P('#443229',.3,{clearcoat:1}),irisLight:S('#795442',.35),pupil:P('#101416',.18,{clearcoat:1}),glint:new THREE.MeshBasicMaterial({color:'#fffaf0'}),lash:S('#322529',.7),brow:S('#3a3030',.9),
 hairCap:P('#ffffff',.47,{map:hairTex,clearcoat:.06,clearcoatRoughness:.65}),hair:P('#19191e',.48,{metalness:0,clearcoat:.07,clearcoatRoughness:.6}),hairLight:P('#302d33',.51,{metalness:0}),hairMid:P('#242228',.48,{metalness:0}),hairDark:S('#141319',.54),
 shirt:P('#ffffff',.84,{map:cloth,sheen:.22,sheenColor:'#eee9e4',side:THREE.DoubleSide}),seam:S('#d7dce2',.9),button:P('#f4f2ed',.32),
 skirt:P('#ffffff',.89,{map:plaid,sheen:.2,sheenColor:'#8d99ae',side:THREE.DoubleSide}),lining:S('#252c3a',1,{side:THREE.DoubleSide}),tie:P('#ffffff',.65,{map:tieMap,sheen:.4,sheenColor:'#8092b7',side:THREE.DoubleSide}),socks:S('#ffffff',.95,{map:rib}),
 leather:P('#141920',.26,{metalness:.07,clearcoat:.55,clearcoatRoughness:.27}),sole:S('#151820',.76),stitch:S('#545b66',.76),backpack:P('#293d57',.95,{sheen:.18,sheenColor:'#6e8299'}),webbing:S('#263747',.93),buckle:S('#161c23',.44),metal:P('#a4a8ae',.26,{metalness:.83}),embroidery:S('#abc5e3',.8)
 };m.tieKnot=m.tie.clone();m.tieKnot.map=m.tie.map.clone();m.tieKnot.map.repeat.set(.38,.13);m.tieKnot.map.needsUpdate=true;m.backpack.normalMap=microNormal;m.backpack.normalScale=new THREE.Vector2(.35,.35);Object.entries(m).forEach(([name,mat])=>{mat.name=name;if(mat.isMeshPhysicalMaterial&&mat.sheen>0){mat.sheenColor.multiplyScalar(mat.sheen);mat.sheen=1;}});return m;
}
