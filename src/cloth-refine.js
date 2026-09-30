import {distanceConstraint,buildGridConstraints,constrainDisplacement} from './cloth-constraints.js';
import {smoothProfile} from './geometry.js';
const collider=[[1.02,.120,.081,-.005,-.005],[1.08,.136,.091,-.007,-.002],[1.198,.144,.100,-.008,-.005],[1.32,.149,.085,-.006,-.011],[1.36,.138,.067,-.004,-.012],[1.393,.086,.042,0,-.01],[1.415,.037,.030,.002,-.006]];

export function createClothRefiner(root){
 const mesh=root.getObjectByName('Draped white cotton shirt with open neckline');
 if(!mesh?.geometry?.userData?.grid)throw new Error('Refinement needs the unbatched shirt grid.');
 const {nu,nv}=mesh.geometry.userData.grid,stride=nu+1,attribute=mesh.geometry.getAttribute('position');
 const rest=new Float64Array(attribute.array),p=new Float64Array(rest),previous=new Float64Array(rest),mass=new Float64Array(attribute.count);
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)mass[j*stride+i]=j<=1||j>=nv-1?0:1;
 const edges=buildGridConstraints(rest,nu,nv);let iteration=0,metrics=null;
 function step(){
  iteration++;let maxMovement=0,penetration=0;
  for(let id=0;id<mass.length;id++)if(mass[id]){const k=id*3;for(let c=0;c<3;c++){const old=p[k+c];p[k+c]+=(old-previous[k+c])*.81+(rest[k+c]-old)*.006;previous[k+c]=old;}p[k+1]-=.00012;}
  for(let pass=0;pass<3;pass++){
   for(const e of edges)distanceConstraint(p,e.a*3,e.b*3,e.length,mass[e.a],mass[e.b],e.stiffness);
   for(let j=0;j<=nv;j++){const a=j*stride*3,b=(j*stride+nu)*3;for(let c=0;c<3;c++)p[a+c]=p[b+c]=(p[a+c]+p[b+c])*.5;}
   for(let id=0;id<mass.length;id++){
    const k=id*3;if(!mass[id]){for(let c=0;c<3;c++)p[k+c]=rest[k+c];continue;}
    const [rx,rz,cx,cz]=smoothProfile(collider,p[k+1]),x=(p[k]-cx)/rx,z=(p[k+2]-cz)/rz,r=Math.hypot(x,z);
    if(r<1){penetration=Math.max(penetration,(1-r)*Math.min(rx,rz));p[k]=cx+x*rx/Math.max(.001,r);p[k+2]=cz+z*rz/Math.max(.001,r);}
    constrainDisplacement(p,rest,k,.018);
   }
  }
  let strainSum=0,maxStrain=0,n=0;
  for(const e of edges)if(e.stiffness>.8){const a=e.a*3,b=e.b*3,strain=Math.abs(Math.hypot(p[b]-p[a],p[b+1]-p[a+1],p[b+2]-p[a+2])/Math.max(1e-9,e.length)-1);strainSum+=strain;maxStrain=Math.max(maxStrain,strain);n++;}
  for(let id=0;id<mass.length;id++){const k=id*3;maxMovement=Math.max(maxMovement,Math.hypot(p[k]-previous[k],p[k+1]-previous[k+1],p[k+2]-previous[k+2]));for(let c=0;c<3;c++){if(!Number.isFinite(p[k+c]))throw Error('Non-finite garment vertex');attribute.array[k+c]=p[k+c];}}
  attribute.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();
  const meanStrain=strainSum/n,constraintScore=Math.max(0,100-40*Math.min(1,meanStrain/.08)-35*Math.min(1,penetration/.006)-25*Math.min(1,maxMovement/.005));
  metrics={iteration,vertices:attribute.count,constraints:edges.length,meanStrain,maxStrain,maxMovement,penetrationBeforeProjection:penetration,constraintScore,finite:true};return metrics;
 }
 function snapshot(){return {version:1,iterations:iteration,metrics,grid:{nu,nv},name:mesh.name,vertices:Array.from(attribute.array)};}
 return {step,snapshot,mesh,get metrics(){return metrics;}};
}

export function applyClothState(root,state){
 if(!state?.vertices?.length)return;
 const mesh=root.getObjectByName(state.name),attr=mesh?.geometry?.getAttribute('position');
 if(!attr||attr.array.length!==state.vertices.length)throw Error('Saved cloth topology no longer matches.');
 attr.array.set(state.vertices);attr.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();
}
