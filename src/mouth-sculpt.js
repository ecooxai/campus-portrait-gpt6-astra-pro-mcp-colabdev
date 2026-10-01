import * as THREE from 'three';
import {D} from './design.js';
import {surface,gauss,lerp} from './geometry.js';
import {faceZ,faceSkinColor,mouthTop,mouthBottom} from './anatomy.js';

/** Continuous skin-merging vermilion, recessed lining and separately rounded upper teeth. */
export function buildPortraitMouth(head,m){
 const width=.0315*D.mouthWidth;
 const lining=m.mouth.clone();lining.name='Warm recessed oral lining';lining.color.set('#ffffff');lining.vertexColors=true;lining.roughness=.92;
 surface(head,'Rounded oral cavity',80,26,(u,v)=>{
  const a=u*2-1,x=width*a,top=mouthTop(a),bottom=mouthBottom(a),y=lerp(bottom,top,v);
  const depth=.006*D.oralDepth*Math.sin(Math.PI*v)*Math.sqrt(Math.max(0,1-a*a));
  const c=new THREE.Color('#432529').lerp(new THREE.Color('#713f3c'),.18+.26*Math.pow(Math.abs(a),3)+.14*Math.pow(1-v,4));
  return {p:[x,y,faceZ(x,y)+.0013-depth],c:c.toArray()};
 },lining);
 for(const upper of [true,false]){
  const mat=(upper?m.upperLip:m.lip).clone();mat.name=upper?'Integrated upper vermilion':'Integrated lower vermilion';mat.color.set('#ffffff');mat.vertexColors=true;mat.roughness=upper?.55:.43;mat.clearcoat=.10;
  surface(head,upper?'Natural upper lip volume':'Natural lower lip volume',80,20,(u,v)=>{
   if(!upper)u=1-u;const a=u*2-1,x=width*a,t=Math.abs(a),inner=upper?mouthTop(a):mouthBottom(a),taper=Math.pow(Math.max(0,1-t*t),.65);
   const baseWidth=(upper?.00325:.00415)*(D.lipFullness??1),cupid=upper?.0006*(gauss(t,.26,.14)-.35*gauss(t,0,.10)):0;
   const y=inner+(upper?1:-1)*(baseWidth*taper*v+.00010*v)+cupid*v;
   const elevation=(.00085*(1-v)+.00165*(D.lipProjection||1)*Math.sin(Math.PI*v)*Math.pow(1-v,.20))*taper+.00012;
   const tint=new THREE.Color(upper?'#ab7167':'#c88479').lerp(new THREE.Color(upper?'#a15755':'#c77573'),D.lipChroma||0);
   const c=tint.lerp(faceSkinColor(x,y),Math.pow(v,1.65)*.98);
   c.multiplyScalar(1+.025*Math.sin(a*89)*Math.sin(v*Math.PI));
   return {p:[x,y,faceZ(x,y)+elevation],c:c.toArray()};
  },mat);
 }
 const backing=m.tooth.clone();backing.name='Recessed warm dental arch';backing.color.set('#c7b29b');
 const toothZ=(x,y)=>faceZ(x,y)+.00155-D.oralDepth*.0022-(D.dentalInset||0);
 surface(head,'Continuous dental backing',80,16,(u,v)=>{const x=(1-u*2)*width*.93,a=x/width,y=mouthTop(a)+.00010-v*.0091*D.toothHeight*(1-.45*Math.abs(a));return {p:[x,y,toothZ(x,y)-.00016]};},backing);
 const teeth=[[-.0253,.0049,.0062],[-.0195,.0061,.0075],[-.0129,.0068,.0086],[-.0047,.0088,.0090],[.0043,.0088,.0090],[.0126,.0069,.0087],[.0193,.0062,.0076],[.0252,.0050,.0062]];
 const enamel=m.tooth.clone();enamel.name='Enamel arch';enamel.color.set('#ffffff');enamel.vertexColors=true;enamel.roughness=.36;
 for(let k=0;k<teeth.length;k++){
  const [center,w,h]=teeth[k],mat=enamel;
  surface(head,'Rounded incisor and lateral '+k,18,18,(u,v)=>{
   const a=u*2-1,x=(center-a*w*.497)*D.mouthWidth,t=x/width,corner=Math.pow(Math.abs(a),4);
   const y=mouthTop(t)+.00015-v*(h-.00065*corner)*D.toothHeight;
   const z=toothZ(x,y)+.00030*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
   const c=new THREE.Color('#f5ead5').lerp(new THREE.Color('#d5c3a9'),.08*Math.pow(1-v,3)+.08*corner);
   return {p:[x,y,z],c:c.toArray()};
  },mat);
 }
 // A recessed, low-contrast tongue surface breaks up the empty black lower cavity.
 if((D.tongueVisibility||0)>0){
  const mat=m.mouth.clone();mat.name='Recessed tongue surface';mat.color.set('#744343');mat.roughness=.62;
  surface(head,'Subtle tongue behind lower lip',54,10,(u,v)=>{
   const a=(u*2-1)*.78,x=width*a,b=mouthBottom(a),t=mouthTop(a),height=(t-b)*.26*(D.tongueVisibility||0),y=b+.0010+v*height;
   const local=(y-b)/Math.max(.00001,t-b),depth=.006*D.oralDepth*Math.sin(Math.PI*local)*Math.sqrt(1-a*a);
   return {p:[x,y,faceZ(x,y)+.00145-depth]};
  },mat);
 }
}
