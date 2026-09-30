import * as THREE from 'three';
import {D} from './design.js';
import {surface,TAU,V} from './geometry.js';

const random=(seed)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
function makeStrandTexture(){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=1024;const c=canvas.getContext('2d'),rng=random(18391);
 c.clearRect(0,0,256,1024);c.lineCap='round';
 for(let k=0;k<156;k++){
  const x=12+rng()*232,width=.45+rng()*1.6,end=620+rng()*400,bend=(rng()-.5)*6;
  const shade=Math.round(22+rng()*20);c.strokeStyle=`rgba(${shade},${Math.round(shade*.93)},${Math.round(shade*.99)},${.70+rng()*.3})`;c.lineWidth=width;
  c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+bend,280,x-bend*.7,end*.8,x+bend*.2,end);c.stroke();
 }
 const fade=c.createLinearGradient(0,0,0,1024);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(.055,'rgba(0,0,0,1)');fade.addColorStop(.65,'rgba(0,0,0,1)');fade.addColorStop(1,'rgba(0,0,0,0)');c.globalCompositeOperation='destination-in';c.fillStyle=fade;c.fillRect(0,0,256,1024);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;return tex;
}
function makeCardMaterial(m){
 if(m.hairGroom)return m.hairGroom;
 const options={name:'Layered procedural hair strands',color:'#ffffff',map:makeStrandTexture(),alphaTest:.38,side:THREE.DoubleSide,depthWrite:true};
 const mat=D.hairCardShading===0?new THREE.MeshBasicMaterial(options):new THREE.MeshPhysicalMaterial({...options,roughness:D.hairCardRoughness??.82,metalness:0,clearcoat:0,specularIntensity:D.hairCardSpecular??.08});
 if(mat.isMeshPhysicalMaterial){mat.anisotropy=D.hairCardAnisotropy||0;mat.anisotropyRotation=Math.PI/2;}m.hairGroom=mat;return mat;
}
/** Multiple curved 3D strand sheets surround the existing volumetric ponytail, not an image billboard. */
export function addPonytailGroom(hair,m,baseCurve,s){
 const density=D.hairCards||0;if(density<=0)return;const mat=makeCardMaterial(m),rng=random(s<0?3193:9431),count=Math.round(32*density),frames=baseCurve.computeFrenetFrames(64,false);
 for(let k=0;k<count;k++){
  const angle=k*2.399+.14*s,rad=.026+(k%4)*.0028,phase=rng()*TAU,end=1+(rng()-.5)*.07,offset=(rng()-.5)*.006;
  const card=surface(hair,'Curved outer ponytail strand sheet '+s+' '+k,5,30,(u,v)=>{
   const t=Math.min(.997,v*end),fi=Math.min(64,Math.round(t*64)),p=baseCurve.getPoint(t),n=frames.normals[fi],b=frames.binormals[fi],normal=n.clone().multiplyScalar(Math.cos(angle)).addScaledVector(b,Math.sin(angle)),side=n.clone().multiplyScalar(-Math.sin(angle)).addScaledVector(b,Math.cos(angle));
   const envelope=Math.pow(Math.max(.0001,Math.sin(Math.PI*(.06+.92*v))),.63),wave=.0045*(D.ponytailWave||1)*Math.sin(v*11+phase)*Math.sin(Math.PI*v);
   p.addScaledVector(normal,rad*envelope+wave).addScaledVector(side,(u-.5)*(.012+Math.sin(k)*.002)*envelope+offset*Math.sin(Math.PI*v));
   p.y-=Math.pow(v,4)*(.006+(k%5)*.003)*(D.hairTipLength||1);return {p:p.toArray(),uv:[u,1-v]};
  },mat);card.castShadow=true;card.receiveShadow=true;
 }
}
