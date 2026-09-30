import {D} from './design.js';
import {eyeLayout,eyeEdgeY,faceZ} from './anatomy.js';
import {clamp,lerp,ribbon,sphere} from './geometry.js';

/** Refine the authored eye aperture into a gently curved globe while keeping its lid boundary fixed. */
export function refineEyeVolume(head,m,s){
 if(!D.eyeVolume)return;
 const {cx,cy,hw}=eyeLayout(s),centerZ=faceZ(cx,cy);
 const slopeX=(faceZ(cx+.0003,cy)-faceZ(cx-.0003,cy))/.0006;
 const slopeY=(faceZ(cx,cy+.0003)-faceZ(cx,cy-.0003))/.0006;
 const radius=.023*(D.eyeGlobeRadius||1);
 function surfaces(x,y){
  const a=(x-cx)/hw,top=eyeEdgeY(a,true,s),bottom=eyeEdgeY(a,false,s),v=clamp((y-bottom)/Math.max(.00001,top-bottom),0,1);
  const join=Math.max(0,1-a*a)*Math.sin(Math.PI*v),edge=faceZ(x,y)+.0007;
  const old=lerp(edge,centerZ+.0027*D.eyeDome,join),dx=x-cx,dy=y-cy;
  const globe=centerZ+.0027*D.eyeDome+slopeX*dx+slopeY*dy+Math.sqrt(Math.max(.000001,radius*radius-dx*dx-dy*dy))-radius;
  return {old,next:lerp(old,lerp(edge,globe,join),D.eyeRoundness??.7)};
 }
 for(const name of ['Almond eye surface ','Eye iris ']){
  const object=head.getObjectByName(name+s);if(!object)throw Error('Missing eye surface: '+name+s);
  const positions=object.geometry.getAttribute('position');
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),shape=surfaces(x,y);positions.setZ(i,z+shape.next-shape.old);}
  positions.needsUpdate=true;object.geometry.computeVertexNormals();object.geometry.computeBoundingSphere();
  if(name==='Eye iris '){object.material.color.multiplyScalar(D.irisShade??1);object.material.roughness=D.irisRoughness??.42;object.material.clearcoat=D.eyeCoating??.35;object.material.specularIntensity=D.eyeSpecular??.45;}
  else{object.material.roughness=D.scleraRoughness??.32;object.material.clearcoat=.30;object.material.specularIntensity=.35;}
 }
 for(const name of ['Small eye softbox reflection ','Secondary eye reflection ']){const object=head.getObjectByName(name+s);if(object){const p=object.position,shape=surfaces(p.x,p.y);p.z+=shape.next-shape.old;}}
 const oldLash=head.getObjectByName('Fine upper lashes '+s);if(oldLash){head.remove(oldLash);oldLash.geometry.dispose();}
 const upper=[];for(let j=0;j<=36;j++){const a=j/18-1,x=cx+a*hw,y=eyeEdgeY(a,true,s)-.00012;upper.push([x,y,faceZ(x,y)+.00072]);}
 ribbon(head,'Tapered upper lash rim '+s,upper,t=>.00031*(D.lashScale||1)*(.32+.68*Math.sin(Math.PI*t)),.00013,m.lash,{segments:40,radial:6});
 if(D.tearDuct){const a=-s*.90,x=cx+a*hw,y=eyeEdgeY(a,false,s)+.00065,duct=m.skinShadow.clone();duct.name='Soft inner eye tissue';duct.color.set('#b68b80');duct.roughness=.48;sphere(head,'Subtle inner eye tear duct '+s,[x,y,surfaces(x,y).next+.0002],[.00115,.00072,.00040],duct,24);}
}
