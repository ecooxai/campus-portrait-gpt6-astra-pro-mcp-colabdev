import * as THREE from 'three';
import {D} from './design.js';
const rng=(seed)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
/** Authored strand color and root-sensitive roughness. No external image is read. */
export function applyStrandAtlas(m){
 if(!D.strandAtlas)return;
 const size=1024,random=rng(128713),color=document.createElement('canvas');color.width=color.height=size;
 const ctx=color.getContext('2d');ctx.fillStyle='#16161a';ctx.fillRect(0,0,size,size);
 for(let k=0;k<3500;k++){
  const x=random()*size,w=.35+random()*.75,shade=18+Math.floor(random()*30),alpha=.25+random()*.40,wiggle=(random()-.5)*3;
  ctx.strokeStyle=`rgba(${shade},${Math.round(shade*.91)},${Math.round(shade*.94)},${alpha})`;ctx.lineWidth=w;
  for(const shift of [-size,0,size]){ctx.beginPath();ctx.moveTo(x+shift,0);ctx.bezierCurveTo(x+shift+wiggle,size*.24,x+shift-wiggle*.4,size*.77,x+shift,size);ctx.stroke();}
 }
 const pigment=new THREE.CanvasTexture(color);pigment.colorSpace=THREE.SRGBColorSpace;pigment.wrapS=pigment.wrapT=THREE.RepeatWrapping;pigment.anisotropy=8; pigment.name='Original fine hair pigment';
 const roughCanvas=document.createElement('canvas');roughCanvas.width=roughCanvas.height=size;const rc=roughCanvas.getContext('2d'),image=rc.createImageData(size,size),columns=new Float32Array(size),rand=rng(71128);
 for(let x=0;x<size;x++)columns[x]=rand();
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const t=1-y/(size-1),root=Math.exp(-Math.pow(t/.24,2)),clump=.5+.5*Math.sin(x*.028+1.6*Math.sin(x*.011)+y*.0009),fiber=columns[x];
  const variation=D.strandRoughnessVariation??.18;
  let rough=.70+variation*(.55*(clump-.5)+.45*(fiber-.5))+(D.rootRoughness??.22)*root;
  rough=Math.max(.35,Math.min(1,rough));const value=Math.round(255*rough),i=(y*size+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=value;image.data[i+3]=255;
 }
 rc.putImageData(image,0,0);const roughness=new THREE.CanvasTexture(roughCanvas);roughness.colorSpace=THREE.NoColorSpace;roughness.wrapS=roughness.wrapT=THREE.RepeatWrapping;roughness.anisotropy=8;roughness.name='Original strand and root roughness';
 for(const name of ['hairCap','hair','hairMid','hairLight','hairDark']){
  const mat=m[name];mat.map=pigment;mat.roughnessMap=roughness;mat.metalnessMap=roughness;mat.roughness=(D.strandBaseRoughness??.70)*(name==='hairDark'?1.1:1);mat.roughness=Math.min(.99,mat.roughness);
  if(mat.isMeshPhysicalMaterial){mat.specularIntensity=D.strandSpecular??.44;mat.clearcoat=.005;mat.anisotropy=D.strandAnisotropy??.30;}
  mat.needsUpdate=true;
 }
}
