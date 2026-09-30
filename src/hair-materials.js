import {D} from './design.js';
import * as THREE from 'three';
function seeded(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export function refineHairMaterials(m){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;
 const c=canvas.getContext('2d'),random=seeded(9073);c.fillStyle='#17171c';c.fillRect(0,0,512,1024);
 for(let k=0;k<820;k++){const x=random()*512,brightness=k%5===0?.23:.11;c.strokeStyle=k%3===0?`rgba(5,8,14,${brightness})`:`rgba(93,73,61,${brightness})`;c.lineWidth=.35+random()*.9;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+1.5,260,x-2,690,x+1,1024);c.stroke();}
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=8;
 const nc=document.createElement('canvas');nc.width=nc.height=256;const ctx=nc.getContext('2d'),data=ctx.createImageData(256,256);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){const nx=.24*Math.sin(x*2.13)+.11*Math.sin(x*.77),ny=.00436*Math.cos(y*.05+x*.08),nz=Math.sqrt(1-nx*nx-ny*ny),i=(y*256+x)*4;data.data[i]=(nx+1)*127.5;data.data[i+1]=(ny+1)*127.5;data.data[i+2]=(nz+1)*127.5;data.data[i+3]=255;}
 ctx.putImageData(data,0,0);const normal=new THREE.CanvasTexture(nc);normal.colorSpace=THREE.NoColorSpace;normal.wrapS=normal.wrapT=THREE.RepeatWrapping;normal.anisotropy=8;
 for(const [name,value] of [['hairCap',1],['hair',.94],['hairMid',1.12],['hairLight',1.28],['hairDark',.70]]){
  const mat=m[name];mat.color.setRGB(Math.min(1,value),Math.min(1,value),Math.min(1,value));mat.map=map;mat.normalMap=normal;mat.normalScale=new THREE.Vector2(.11,.11);mat.roughness=Math.min(.95,(name==='hairDark'?.62:.44)*D.hairRoughness);mat.metalness=0;mat.envMapIntensity=1;if(mat.isMeshPhysicalMaterial){mat.specularIntensity=.60*D.hairHighlight;mat.clearcoat=.09;mat.clearcoatRoughness=.5;}mat.needsUpdate=true;
 }
}
