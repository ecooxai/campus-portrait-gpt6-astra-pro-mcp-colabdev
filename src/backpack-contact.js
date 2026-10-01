import * as THREE from 'three';
import {D} from './design.js';
import {clamp,lerp,smoothGridSeamNormals,TAU} from './geometry.js';
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};

/** Fit the backpack to actual shirt geometry; this is a geometric constraint, not a cloth simulation. */
export function fitBackpackContact(root){
 if(!D.packFit)return;
 const shirt=root.getObjectByName('Draped white cotton shirt with open neckline'),bag=root.getObjectByName('Navy backpack');
 if(!shirt||!bag)throw Error('Backpack contact requires the authored shirt and bag');
 root.updateMatrixWorld(true);
 const nx=13,ny=19,x0=-.135,x1=.135,y0=1.075,y1=1.370,field=new Float64Array(nx*ny).fill(NaN),ray=new THREE.Raycaster();
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
  const x=lerp(x0,x1,i/(nx-1)),y=lerp(y0,y1,j/(ny-1));ray.set(new THREE.Vector3(x,y,-1),new THREE.Vector3(0,0,1));
  const hit=ray.intersectObject(shirt,false)[0];if(hit)field[j*nx+i]=hit.point.z;
 }
 function backZ(x,y){
  const fu=(x-x0)/(x1-x0)*(nx-1),fv=(y-y0)/(y1-y0)*(ny-1);if(fu<0||fv<0||fu>nx-1||fv>ny-1)return null;
  const i=Math.min(nx-2,Math.floor(fu)),j=Math.min(ny-2,Math.floor(fv)),u=fu-i,v=fv-j;let sum=0,weight=0;
  for(const [dx,dy,w] of [[0,0,(1-u)*(1-v)],[1,0,u*(1-v)],[0,1,(1-u)*v],[1,1,u*v]]){const value=field[(j+dy)*nx+i+dx];if(Number.isFinite(value)){sum+=value*w;weight+=w;}}
  return weight>.65?sum/weight:null;
 }
 const gaps=[],clearance=D.packClearance??.005,contact=clamp(D.packConform??.85,0,1);
 bag.traverse(object=>{
  if(!object.isMesh)return;
  const attr=object.geometry.getAttribute('position'),uv=object.geometry.getAttribute('uv'),matrix=object.matrixWorld.clone(),inverse=matrix.clone().invert(),p=new THREE.Vector3();
  const strap=/(shoulder strap|webbing strap|buckle|Buckle rail)/.test(object.name),shell=object.name==='Soft shaped canvas backpack';
  for(let i=0;i<attr.count;i++){
   p.fromBufferAttribute(attr,i).applyMatrix4(matrix);const originalZ=p.z,w=strap?ease((-.015-originalZ)/.115):1,angle=(D.packTilt||0)*w,yy=p.y-1.20,zz=p.z+.176;
   p.y=1.20+yy*Math.cos(angle)-zz*Math.sin(angle)-(D.packDrop||0)*w;p.z=-.176+yy*Math.sin(angle)+zz*Math.cos(angle)+(D.packShift||0)*w;
   if(shell&&uv){const facing=Math.cos(uv.getX(i)*TAU),front=ease((facing-.15)/.75),body=backZ(p.x,p.y);if(front>0&&body!==null){const limit=body-clearance;p.z=lerp(p.z,limit,(p.z>limit?1:contact)*front);if(front>.99)gaps.push(body-p.z);}}
   p.applyMatrix4(inverse);attr.setXYZ(i,p.x,p.y,p.z);
  }
  attr.needsUpdate=true;object.geometry.computeVertexNormals();const grid=object.geometry.userData.grid;if(grid)smoothGridSeamNormals(object.geometry,grid.nu,grid.nv);object.geometry.computeBoundingSphere();
 });
 root.userData.backpackContact={method:'Posterior shirt ray samples before the shared posture transform',fieldSamples:field.filter(Number.isFinite).length,checkedFrontVertices:gaps.length,minSampledGap:gaps.length?Math.min(...gaps):null,maxSampledGap:gaps.length?Math.max(...gaps):null,meanSampledGap:gaps.length?gaps.reduce((a,b)=>a+b,0)/gaps.length:null,clearanceTarget:clearance,notFullCollisionSimulation:true};
}
