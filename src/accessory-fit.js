import * as THREE from 'three';
import {D} from './design.js';
import {clamp,smoothGridSeamNormals} from './geometry.js';
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
function updateGeometry(object,transform,matrix){
 const inverse=matrix.clone().invert(),p=new THREE.Vector3(),a=object.geometry.getAttribute('position');
 for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(matrix);transform(p);p.applyMatrix4(inverse);a.setXYZ(i,p.x,p.y,p.z);}
 a.needsUpdate=true;object.geometry.computeVertexNormals();const grid=object.geometry.userData.grid;
 if(grid)smoothGridSeamNormals(object.geometry,grid.nu,grid.nv);
 object.geometry.computeBoundingSphere();
}

/** Refine the shoe outline and carry the stitching and saddle band with it. */
export function refineAccessories(root){
 root.updateMatrixWorld(true);
 if(D.shoeFit){
  const shoes=[];root.traverse(o=>{if(o.isGroup&&o.name.startsWith('Penny loafer '))shoes.push(o);});
  for(const shoe of shoes){
   const inverse=shoe.matrixWorld.clone().invert();
   shoe.traverse(o=>{if(!o.isMesh)return;const matrix=inverse.clone().multiply(o.matrixWorld);
    updateGeometry(o,p=>{
     const toe=ease((p.z-.015)/.095),nx=Math.min(1,Math.abs(p.x)/.047),rounded=Math.pow(nx,D.toeExponent??1)*.047;
     p.x=(p.x+Math.sign(p.x)*(rounded-Math.abs(p.x))*toe)*(D.shoeWidth??1);
     if(p.y>.06)p.y=.06+(p.y-.06)*(D.shoeUpperHeight??1);
    },matrix);
   });
  }
 }
 if(D.bagFit){
  root.traverse(o=>{
   if(!o.isMesh||!/(Soft shaped canvas backpack|Backpack lower outer pocket|Pocket zipper piping|Silver zip pull|Main backpack zipper welt|Main zipper pull|Backpack top handle|Backpack side seam)/.test(o.name))return;
   updateGeometry(o,p=>{p.x*=D.bagWidth??1;p.y=1.24+(p.y-1.24)*(D.bagHeight??1)+(D.bagDrop||0);p.z=-.176+(p.z+.176)*(D.bagDepth??1)+(D.bagForward||0);},o.matrixWorld.clone());
  });
 }
}
