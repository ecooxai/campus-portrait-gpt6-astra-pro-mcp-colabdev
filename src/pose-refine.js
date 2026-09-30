import * as THREE from 'three';
import {D} from './design.js';
import {clamp,smoothGridSeamNormals} from './geometry.js';

/** A continuous, waist-anchored posture adjustment shared by the body, face, clothing and accessories. */
export function refineStandingPose(root){
 const lean=D.poseLean||0,roll=D.poseRoll||0;
 if(lean===0&&roll===0)return;
 root.updateMatrixWorld(true);
 root.traverse(o=>{
  if(!o.isMesh)return;
  const a=o.geometry.getAttribute('position'),matrix=o.matrixWorld.clone(),inverse=matrix.clone().invert(),p=new THREE.Vector3();
  for(let i=0;i<a.count;i++){
   p.fromBufferAttribute(a,i).applyMatrix4(matrix);
   const t=clamp((p.y-1.03)/.17,0,1),w=t*t*(3-2*t),angle=lean*w,tilt=roll*w;
   let x=p.x,y=p.y-1.04,z=p.z;
   const y1=y*Math.cos(angle)-z*Math.sin(angle),z1=y*Math.sin(angle)+z*Math.cos(angle);
   p.set(x*Math.cos(tilt)-y1*Math.sin(tilt),1.04+x*Math.sin(tilt)+y1*Math.cos(tilt),z1);
   p.applyMatrix4(inverse);a.setXYZ(i,p.x,p.y,p.z);
  }
  a.needsUpdate=true;o.geometry.computeVertexNormals();const grid=o.geometry.userData.grid;
  if(grid)smoothGridSeamNormals(o.geometry,grid.nu,grid.nv);
  o.geometry.computeBoundingSphere();
 });
}
