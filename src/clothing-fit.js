import * as THREE from 'three';
import {D} from './design.js';
import {clamp,smoothProfile,smoothGridSeamNormals} from './geometry.js';

/** Adjust only the shirt and sleeve meshes, retaining their baked topology. */
export function adjustClothing(root){
 if(!D.clothingFit)return;
 root.updateMatrixWorld(true);
 root.traverse(o=>{
  if(!o.isMesh)return;
  const sleeve=/Soft elbow-length cotton sleeve|Double-rolled sleeve cuff|Cuff pressed edge/.test(o.name);
  const shirt=o.name==='Draped white cotton shirt with open neckline';
  const arm=/Rounded anatomical forearm/.test(o.name);
  const skirt=/knife-pleat tartan skirt|inner skirt lining|tailored hem|Pleat edge topstitch/.test(o.name);
  if(!sleeve&&!shirt&&!skirt&&!arm)return;
  const pos=o.geometry.getAttribute('position'),matrix=o.matrixWorld.clone(),inverse=matrix.clone().invert(),p=new THREE.Vector3();
  for(let i=0;i<pos.count;i++){
   p.fromBufferAttribute(pos,i).applyMatrix4(matrix);
   if(sleeve){
    const sign=Math.sign(p.x),center=sign*smoothProfile([[1.04,.194],[1.10,.199],[1.18,.195],[1.26,.177],[1.36,.145]],p.y)[0];
    p.x=center+(p.x-center)*(D.sleeveScale??1)-sign*(D.sleeveInset||0);
    p.z=-.02+(p.z+.02)*(D.sleeveScale??1);
   }
   if(shirt){const t=clamp((p.y-1.04)/.11,0,1),w=t*t*(3-2*t);p.x=-.006+(p.x+.006)*(1+((D.shirtWidth??1)-1)*w);}
   if(arm&&D.handClearance){const w=clamp((1.080-p.y)/.095,0,1);p.z-=D.handClearance*w*w*(3-2*w);}
   if(skirt){const f=1+((D.skirtFlare??1)-1)*clamp((1.025-p.y)/.31,0,1);p.x*=f;p.z*=f;}
   p.applyMatrix4(inverse);pos.setXYZ(i,p.x,p.y,p.z);
  }
  pos.needsUpdate=true;o.geometry.computeVertexNormals();const grid=o.geometry.userData.grid;
  if(grid)smoothGridSeamNormals(o.geometry,grid.nu,grid.nv);
  o.geometry.computeBoundingSphere();
 });
}
