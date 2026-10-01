import * as THREE from 'three';
import {D} from './design.js';
import {surface,TAU} from './geometry.js';
import {faceZ,faceSkinColor} from './anatomy.js';
/** Small skin-conforming nasal linings aligned with the sculpted recesses. */
export function buildSoftNostrils(head,m){
 if(!D.softNostrils)return;
 const width=D.noseWidth,drop=D.nostrilDrop??.0026,size=D.nostrilScale??1;
 for(const s of [-1,1]){
  const mat=m.nostril.clone();mat.name='Soft recessed nasal tissue';mat.color.set('#ffffff');mat.vertexColors=true;mat.roughness=.86;
  surface(head,'Softly bounded nasal lining '+s,44,12,(u,v)=>{
   const a=-u*TAU,cx=s*.0102*width,cy=-.0284+D.noseY-drop;
   const x=cx+.00255*width*size*Math.cos(a)*v;
   const y=cy+.00085*size*Math.sin(a)*v+s*.00018*Math.cos(a)*v;
   const skin=faceSkinColor(x,y),c=new THREE.Color('#61473f').lerp(skin,.14+.84*Math.pow(v,2.3));
   return {p:[x,y,faceZ(x,y)+.00016],c:c.toArray()};
  },mat);
 }
}
