import * as THREE from 'three';
import state from './cloth-state-gpt6-astra-pro-mcp-colabdev.json';
import {clamp,smoothGridSeamNormals} from './geometry.js';

/** Apply the reviewed garment state and carry its small trim details with the fabric. */
export function applyReviewedCloth(root,blend=.90){
 const shirt=root.getObjectByName(state.name),attr=shirt?.geometry?.getAttribute('position');
 if(!attr||attr.array.length!==state.vertices.length)throw Error('Reviewed cloth topology mismatch');
 const rest=new Float32Array(attr.array),delta=new Float32Array(rest.length),{nu,nv}=state.grid;
 for(let k=0;k<rest.length;k++){delta[k]=(state.vertices[k]-rest[k])*blend;attr.array[k]=rest[k]+delta[k];}
 function displacement(x,y,z){
  let angle=Math.atan2(x+.006,(z+.006)*1.45);if(angle<0)angle+=2*Math.PI;
  const u=angle/(2*Math.PI)*nu,top=1.412-.075*Math.max(0,Math.cos(angle))**10,v=clamp((y-1.023)/(top-1.023),0,1)*nv;
  const i=Math.min(nu-1,Math.floor(u)),j=Math.min(nv-1,Math.floor(v)),fu=u-i,fv=v-j,result=new THREE.Vector3();
  for(const [di,dj,w] of [[0,0,(1-fu)*(1-fv)],[1,0,fu*(1-fv)],[0,1,(1-fu)*fv],[1,1,fu*fv]]){const k=((j+dj)*(nu+1)+i+di)*3;result.x+=delta[k]*w;result.y+=delta[k+1]*w;result.z+=delta[k+2]*w;}
  return result;
 }
 root.updateMatrixWorld(true);
 root.traverse(o=>{if(!o.isMesh||!/(Front shirt placket|Mother of pearl shirt button|Small blue stitched shirt emblem|Emblem cross stitch)/.test(o.name))return;const p=o.geometry.getAttribute('position'),matrix=o.matrixWorld.clone(),inverse=matrix.clone().invert(),v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(matrix);v.add(displacement(v.x,v.y,v.z)).applyMatrix4(inverse);p.setXYZ(i,v.x,v.y,v.z);}p.needsUpdate=true;o.geometry.computeVertexNormals();});
 attr.needsUpdate=true;shirt.geometry.computeVertexNormals();smoothGridSeamNormals(shirt.geometry,nu,nv);shirt.geometry.computeBoundingSphere();
 root.userData.clothRefinement={numericalPasses:state.iterations,blend,manualArtisticReviews:false};
}
