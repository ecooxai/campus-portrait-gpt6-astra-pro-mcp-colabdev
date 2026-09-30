import {buildSculptedEar} from './ear-sculpt.js';
import {D} from './design.js';
import {profile,faceDelta as delta,faceZ,faceSkinColor,sculptedHeadPoint,mouthTop,mouthBottom} from './anatomy.js';
export {faceZ,faceSkinColor} from './anatomy.js';
import {refineHairMaterials} from './hair-materials.js';
import {buildEye,buildBrow} from './face-details.js';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { V,clamp,lerp,TAU,gauss,smoothProfile,mesh,sphere,surface,tube,loft,ribbon } from './geometry.js';
function batch(group,prefix){const buckets=new Map();group.children.slice().forEach(m=>{if(!m.isMesh||!m.name.startsWith(prefix))return;let b=buckets.get(m.material.uuid);if(!b){b={mat:m.material,gs:[]};buckets.set(m.material.uuid,b);}m.updateMatrix();let g=m.geometry.clone().applyMatrix4(m.matrix);if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}b.gs.push(g);m.geometry.dispose();group.remove(m);});for(const b of buckets.values()){const g=mergeGeometries(b.gs);if(g)mesh(group,prefix+' combined',g,b.mat);b.gs.forEach(g=>g.dispose());}}
export function createHead(parent,m){
 const head=new THREE.Group();head.name='Head / sculpted face';head.position.set(.036+D.headX,1.536+D.headY,.011+D.headZ);head.rotation.set(D.headPitch,-.025,-.085+D.headRoll);head.scale.set(1.075*D.headWidth,1.025*D.headHeight,1.045*D.headDepth);parent.add(head);
 surface(head,'Continuous anatomical head',192,192,(u,v)=>{
 const y=lerp(profile[0][0],.143,v),a=u*TAU,[rx,rz]=smoothProfile(profile,y),x=rx*Math.sin(a),front=Math.max(0,Math.cos(a)),z=rz*Math.cos(a)+delta(x,y)*front**3;
 return {p:sculptedHeadPoint(x,y,z,front),c:faceSkinColor(x,y,front).toArray()};
 },m.face);
 for(const s of [-1,1]){
 if(D.earSculpt){buildSculptedEar(head,m,s);}else{
 const ear=sphere(head,`${s} ear pinna`,[s*.091,-.014,-.005],[.017,.028,.013],m.skin,32);ear.rotation.z=-s*.13;
 sphere(head,`${s} concha`,[s*.103,-.012,.003],[.0065,.017,.006],m.skinShadow,28);
 const ep=[];for(let i=0;i<28;i++){const a=TAU*i/27;ep.push([s*(.101+.009*Math.sin(a)),-.012+.022*Math.cos(a),.005+.003*Math.cos(a)]);}tube(head,'Helix',ep,.0023,m.skin,30,7);
 tube(head,'Antihelix',[[s*.102,-.029,.011],[s*.101,-.009,.010],[s*.106,.003,.009]],.0018,m.skin,18,7);
 }
 buildEye(head,m,s);buildBrow(head,m,s);
 const nostril=[];for(let j=0;j<=12;j++){const t=j/12,x=s*(.0080+.0054*t)*D.noseWidth,y=-.0283+D.noseY-.00045*Math.sin(t*Math.PI);nostril.push([x,y,faceZ(x,y)+.00022]);}tube(head,'Curved nostril detail',nostril,.00032,m.nostril,16,6);
 }
 const top=mouthTop,bottom=mouthBottom;
 surface(head,'Recessed smiling mouth',60,18,(u,v)=>{const a=u*2-1,x=.0315*D.mouthWidth*a,y=lerp(bottom(a),top(a),v);return {p:[x,y,faceZ(x,y)+.0013-D.oralDepth*.006*Math.sin(Math.PI*v)*Math.sqrt(Math.max(0,1-a*a))]};},m.mouth);
 for(const upper of [true,false]){const material=(upper?m.upperLip:m.lip).clone();material.name=upper?'Natural upper lip':'Natural lower lip';const tint=material.color.clone();material.color.set('#ffffff');material.vertexColors=true;
 surface(head,upper?'Sculpted upper lip':'Sculpted lower lip',64,14,(u,v)=>{const a=u*2-1,x=.0315*D.mouthWidth*a,inner=upper?top(a):bottom(a),thickness=((upper?.0023:.0031)*Math.pow(Math.max(0,1-a*a),.65)+.00035)*D.lipThickness,cupid=upper?.00045*gauss(Math.abs(a),.25,.17):0,y=inner+(upper?1:-1)*thickness*v+cupid*v,z=faceZ(x,y)+((.0017+.0014*Math.sin(v*Math.PI))*(1-a*a)+.00035)*D.lipProjection,c=tint.clone().lerp(faceSkinColor(x,y),D.lipBlend*Math.pow(v,1.5));return {p:[x,y,z],c:c.toArray()};},material);}
 const dentalBase=m.tooth.clone();dentalBase.name='Warm dental arch shadow';dentalBase.color.set('#cfc1ad');surface(head,'Soft dental arch backing',96,16,(u,v)=>{const x=(1-u*2)*.0292*D.mouthWidth,a=x/(.0315*D.mouthWidth),y=top(a)+.0001-v*(.0091*D.toothHeight*(1-.45*Math.abs(a)));return {p:[x,y,faceZ(x,y)+.00145-D.oralDepth*.0022]};},dentalBase);
 const teeth=[[-.0253,.0049,.0062],[-.0195,.0061,.0075],[-.0129,.0068,.0086],[-.0047,.0088,.0090],[.0043,.0088,.0090],[.0126,.0069,.0087],[.0193,.0062,.0076],[.0252,.0050,.0062]];
 for(let k=0;k<teeth.length;k++){const [center,width,height]=teeth[k];surface(head,'Individually shaped upper tooth '+k,16,14,(u,v)=>{const a=u*2-1,x=(center-a*width*.498)*D.mouthWidth,local=x/(.0315*D.mouthWidth),corner=Math.pow(Math.abs(a),5),y=top(local)+.0002-v*(height-.00065*corner)*D.toothHeight,z=faceZ(x,y)+.0016+.00040*Math.sin(u*Math.PI)*Math.sin(v*Math.PI)-D.oralDepth*.0022;return {p:[x,y,z]};},m.tooth);}




 batch(head,'Iris fiber');batch(head,'Brow fiber');
 createHair(head,m);head.traverse(o=>{if(o.isMesh&&(o.name.startsWith('Fiber')||o.name.startsWith('Fine tapered'))){o.castShadow=false;o.receiveShadow=false;}});return head;
}
function createHair(head,m){
 refineHairMaterials(m);
 const hair=new THREE.Group();hair.name='Hair / swept fringe and twin ponytails';head.add(hair);
 const cp=(u,v)=>{const a=-u*TAU,front=Math.max(0,Math.cos(a)),boundY=.095*front-.062*(1-front),limit=Math.acos(clamp((boundY-.018)/.145,-1,1)),p=v*limit;return [.105*Math.sin(a)*Math.sin(p),.018+.145*Math.cos(p),.096*Math.cos(a)*Math.sin(p)];};
 surface(hair,'Closed sculpted scalp cap',96,44,(u,v)=>({p:cp(u,v)}),m.hairCap);
 const bang=(u,t)=>{const rx=.032+.043*u,ry=.140-.035*u,ex=lerp(-.094,.067,u),ey0=smoothProfile([[-.094,.010],[-.080,.032],[-.056,.040],[-.030,.044],[0,.057],[.025,.076],[.045,.067],[.067,.040]],ex)[0]+.0003*Math.sin(u*39),ey=ey0-D.fringeDrop*Math.exp(-Math.pow((ex+.015)/.070,2))+D.fringeSplit*Math.exp(-Math.pow((ex-.035)/.024,2))+D.fringeEdge*Math.sin(u*43),q=Math.pow(Math.sin(t*Math.PI/2),1.12),x=lerp(rx,ex,q),y=lerp(ry,ey,t),sz=.096*Math.sqrt(Math.max(0,1-(x/.105)**2-((y-.018)/.145)**2)),z=Math.max(sz,faceZ(x,y))+.00065+(.0012+D.fringeLift)*Math.sin(t*Math.PI/2)**2;return [x,y,z];};
 surface(hair,'Continuous side-swept fringe',100,64,(u,v)=>({p:bang(1-u,v),uv:[1-u,v]}),m.hairCap);
 // Subpixel fibers intersected the combed surface. The same strand direction is now baked into original UV texture.
 for(const s of [-1,1]){
 const base=[[s*.092,-.025,-.056],[s*.115,-.075,-.006],[s*.126,-.14,.062],[s*.117,-.207,.117],[s*.090,s<0?-.230:-.248,.119]].map((p,i)=>[p[0]+s*D.ponytailSpread*i/4,-.025+(p[1]+.025)*D.ponytailLength,p[2]+D.ponytailForward*i/4]);
 const baseCurve=new THREE.CatmullRomCurve3(base.map(p=>V(...p)));
 ribbon(hair,'Ponytail interior '+s,base,t=>.021*Math.pow(Math.sin(Math.PI*(.13+.87*t)),.58),t=>.018*Math.pow(Math.sin(Math.PI*(.13+.87*t)),.60),m.hairDark,{segments:42,radial:18});
 sphere(hair,'Navy elastic tie',[s*.093,-.034,-.055],[.022,.009,.022],m.webbing,22);
 for(let k=0;k<36;k++){
 const phase=k*2.399+s*.47,rad=.032*D.ponytailBulk*Math.sqrt((k+.5)/36),pts=[];
 for(let j=0;j<=8;j++){const t=j/8,p=baseCurve.getPoint(t),env=Math.sin(t*Math.PI);p.x+=Math.cos(phase)*rad*env+.0070*D.ponytailWave*Math.sin(t*13+phase)*env+Math.pow(t,4)*Math.sin(k*3)*.011;p.z+=Math.sin(phase)*rad*env+.0065*D.ponytailWave*Math.sin(t*12+k)*env;p.y-=Math.pow(t,2)*((k%5)*.005);pts.push(p.toArray());}
 const width=(.0045+(k%3)*.0006)*Math.sqrt(D.ponytailBulk);
 ribbon(hair,'Layered wavy ponytail tress '+s+' '+k,pts,t=>Math.max(.00015,width*Math.pow(Math.sin(Math.PI*(.065+.935*t)),.62)),t=>.0028*Math.sin(Math.PI*(.08+.92*t)),k%4===0?m.hairMid:m.hair,{segments:38,radial:8});
 const curve=new THREE.CatmullRomCurve3(pts.map(p=>V(...p)));
 for(let f=-1;f<=1;f++){const arr=[];for(let j=0;j<=26;j++){const t=j/26,p=curve.getPoint(t);p.x+=f*.0021*Math.sin(Math.PI*t);p.z+=.0030*Math.sin(Math.PI*(.08+.92*t));arr.push(p);}tube(hair,'Fiber tail',arr,.00012,k%4===0?m.hairLight:m.hairMid,26,4);}
 }
 for(let k=0;k<14;k++){const pts=[],phase=k*1.76;for(let j=0;j<=20;j++){const t=j/20,p=baseCurve.getPoint(t),env=Math.sin(Math.PI*t);p.x+=s*(.021+.006*Math.sin(phase))*env+.006*Math.sin(t*15+phase)*env;p.z+=Math.cos(phase)*.024*env;p.y-=t*t*(.01+(k%3)*.008);pts.push(p);}tube(hair,'Fiber flyaway',pts,.00016,m.hairMid,25,4);}
 const side=[[s*.085,.065,.023],[s*.094,.012,.021],[s*.083,-.065,.037],[s*.095,-.112,.042]];
 ribbon(hair,'Temple framing lock '+s,side,t=>.0055*D.templeWidth*Math.sin(Math.PI*(.13+.87*t)),.002,m.hair,{segments:32,radial:10});
 }
 batch(hair,'Fiber');
}

