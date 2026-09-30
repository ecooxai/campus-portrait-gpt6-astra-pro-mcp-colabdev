import {D} from './design.js';
import * as THREE from 'three';
import {clamp,smoothGridSeamNormals} from './geometry.js';
/** Smoothly lower the shoulder/collar construction while preserving the waist and sleeves. */
export function refineGarmentFit(root){
 root.updateMatrixWorld(true);
 root.traverse(o=>{
  if(!o.isMesh||o.name==='Anatomical neck')return;
  const p=o.geometry.getAttribute('position');if(!p)return;
  const toWorld=o.matrixWorld.clone(),toLocal=toWorld.clone().invert(),v=new THREE.Vector3();
  let changed=false;
  for(let i=0;i<p.count;i++){
   v.fromBufferAttribute(p,i).applyMatrix4(toWorld);
   const t=clamp((v.y-1.260)/.150,0,1),smooth=t*t*(3-2*t);
   if(smooth===0)continue;
   v.y-=(.034-D.shoulderLift)*smooth;v.applyMatrix4(toLocal);p.setXYZ(i,v.x,v.y,v.z);changed=true;
  }
  if(changed){p.needsUpdate=true;o.geometry.computeVertexNormals();const grid=o.geometry.userData.grid;if(grid)smoothGridSeamNormals(o.geometry,grid.nu,grid.nv);o.geometry.computeBoundingSphere();}
 });
}
