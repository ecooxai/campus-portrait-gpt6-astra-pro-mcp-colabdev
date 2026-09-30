import {refineHairMaterials} from './hair-materials.js';
import {buildEye,buildBrow} from './face-details.js';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { V,clamp,lerp,TAU,gauss,smoothProfile,mesh,sphere,surface,tube,loft,ribbon } from './geometry.js';
const profile=[[-.108,.002,.012],[-.102,.025,.034],[-.091,.044,.049],[-.075,.063,.061],[-.053,.078,.070],[-.029,.087,.073],[0,.092,.073],[.024,.092,.072],[.051,.09,.072],[.080,.084,.069],[.107,.072,.060],[.128,.050,.043],[.143,.002,.002]];
function delta(x,y){const smileT=clamp((-.025-y)/.028,0,1),smileX=.015+.018*smileT,smileFold=-.0012*(gauss(x,smileX,.0035)+gauss(x,-smileX,.0035))*gauss(y,-.039,.018);return smileFold-.0035*(gauss(x,.0102,.0032)+gauss(x,-.0102,.0032))*gauss(y,-.0284,.0025)+.011*(gauss(x,.052,.03)+gauss(x,-.052,.03))*gauss(y,-.028,.025)-.005*(gauss(x,.037,.022)+gauss(x,-.037,.022))*gauss(y,.018,.014)+.0045*(gauss(x,.04,.026)+gauss(x,-.04,.026))*gauss(y,.043,.013)+.015*gauss(x,0,.015)*gauss(y,.006,.041)+.0215*gauss(x,0,.018)*gauss(y,-.021,.015)+.006*(gauss(x,.014,.01)+gauss(x,-.014,.01))*gauss(y,-.025,.008)+.007*gauss(x,0,.039)*gauss(y,-.055,.025)+.0025*(gauss(x,.004,.003)+gauss(x,-.004,.003))*gauss(y,-.039,.010)+.008*gauss(x,0,.029)*gauss(y,-.091,.016);}
export function faceZ(x,y){const [rx,rz]=smoothProfile(profile,y);const front=Math.sqrt(Math.max(.0001,1-(x/Math.max(.001,rx))**2));return rz*front+delta(x,y)*front**3;}
function batch(group,prefix){const buckets=new Map();group.children.slice().forEach(m=>{if(!m.isMesh||!m.name.startsWith(prefix))return;let b=buckets.get(m.material.uuid);if(!b){b={mat:m.material,gs:[]};buckets.set(m.material.uuid,b);}m.updateMatrix();let g=m.geometry.clone().applyMatrix4(m.matrix);if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}b.gs.push(g);m.geometry.dispose();group.remove(m);});for(const b of buckets.values()){const g=mergeGeometries(b.gs);if(g)mesh(group,prefix+' combined',g,b.mat);b.gs.forEach(g=>g.dispose());}}
export function createHead(parent,m){
 const head=new THREE.Group();head.name='Head / sculpted face';head.position.set(.036,1.536,.011);head.rotation.z=-.085;head.rotation.y=-.025;head.scale.set(1.075,1.025,1.045);parent.add(head);
 const base=new THREE.Color('#efc0a6'),blush=new THREE.Color('#dc9385');
 surface(head,'Continuous anatomical head',192,192,(u,v)=>{
 const y=lerp(-.108,.143,v),a=u*TAU,[rx,rz]=smoothProfile(profile,y),x=rx*Math.sin(a),front=Math.max(0,Math.cos(a));
 let z=rz*Math.cos(a)+delta(x,y)*Math.pow(front,3);
 if(front>.6)for(const side of [-1,1]){const q=(x-side*.035)/.018;if(Math.abs(q)<1){const arch=Math.pow(1-q*q,.63),tilt=side*q*.0011+.0008*Math.max(0,side*q)**2,upper=.019+.0066*arch+tilt,lower=.019-.0041*arch+tilt,v=(y-lower)/Math.max(.00001,upper-lower);if(v>0&&v<1)z-=.0045*Math.sin(Math.PI*v)*(1-q*q);}}

 const tint=(gauss(x,.056,.024)+gauss(x,-.056,.024))*gauss(y,-.028,.023)*front*.34;
 const c=base.clone().lerp(blush,tint);c.lerp(new THREE.Color('#c99e92'),.065*(gauss(x,.036,.022)+gauss(x,-.036,.022))*gauss(y,.003,.009)*front);c.lerp(new THREE.Color('#df9b87'),.09*gauss(x,0,.020)*gauss(y,-.026,.022)*front);return {p:[x,y,z],c:c.toArray()};
 },m.face);
 for(const s of [-1,1]){
 const ear=sphere(head,`${s} ear pinna`,[s*.091,-.014,-.005],[.017,.028,.013],m.skin,32);ear.rotation.z=-s*.13;
 sphere(head,`${s} concha`,[s*.103,-.012,.003],[.0065,.017,.006],m.skinShadow,28);
 const ep=[];for(let i=0;i<28;i++){const a=TAU*i/27;ep.push([s*(.101+.009*Math.sin(a)),-.012+.022*Math.cos(a),.005+.003*Math.cos(a)]);}tube(head,'Helix',ep,.0023,m.skin,30,7);
 tube(head,'Antihelix',[[s*.102,-.029,.011],[s*.101,-.009,.010],[s*.106,.003,.009]],.0018,m.skin,18,7);
 buildEye(head,m,s);buildBrow(head,m,s);
 const nostril=[];for(let j=0;j<=12;j++){const t=j/12,x=s*(.0080+.0054*t),y=-.0283-.00045*Math.sin(t*Math.PI);nostril.push([x,y,faceZ(x,y)+.00022]);}tube(head,'Curved nostril detail',nostril,.00032,m.nostril,16,6);
 }
 const top=u=>-.047+.003*u*u+.0007*gauss(Math.abs(u),.28,.17),bottom=u=>-.0615+.0175*u*u;
 surface(head,'Recessed smiling mouth',60,18,(u,v)=>{const a=u*2-1,x=.0315*a,y=lerp(bottom(a),top(a),v);return {p:[x,y,faceZ(x,y)+.0013]};},m.mouth);
 for(const upper of [true,false]){surface(head,upper?'Sculpted upper lip':'Sculpted lower lip',64,12,(u,v)=>{const a=u*2-1,x=.0315*a,inner=upper?top(a):bottom(a),thickness=(upper?.0023:.0031)*Math.pow(Math.max(0,1-a*a),.65)+.00035,cupid=upper?.00045*gauss(Math.abs(a),.25,.17):0,y=inner+(upper?1:-1)*thickness*v+cupid*v,z=faceZ(x,y)+(.0017+.0014*Math.sin(v*Math.PI))*(1-a*a)+.00035;return {p:[x,y,z]};},upper?m.upperLip:m.lip);}
 const dentalBase=m.tooth.clone();dentalBase.name='Warm dental arch shadow';dentalBase.color.set('#cfc1ad');surface(head,'Soft dental arch backing',96,16,(u,v)=>{const x=(1-u*2)*.0292,a=x/.0315,y=top(a)+.0001-v*(.0091*(1-.45*Math.abs(a)));return {p:[x,y,faceZ(x,y)+.00145]};},dentalBase);
 const teeth=[[-.0253,.0049,.0062],[-.0195,.0061,.0075],[-.0129,.0068,.0086],[-.0047,.0088,.0090],[.0043,.0088,.0090],[.0126,.0069,.0087],[.0193,.0062,.0076],[.0252,.0050,.0062]];
 for(let k=0;k<teeth.length;k++){const [center,width,height]=teeth[k];surface(head,'Individually shaped upper tooth '+k,16,14,(u,v)=>{const a=u*2-1,x=center-a*width*.498,local=x/.0315,corner=Math.pow(Math.abs(a),5),y=top(local)+.0002-v*(height-.00065*corner),z=faceZ(x,y)+.0016+.00040*Math.sin(u*Math.PI)*Math.sin(v*Math.PI);return {p:[x,y,z]};},m.tooth);}




 batch(head,'Iris fiber');batch(head,'Brow fiber');
 createHair(head,m);head.traverse(o=>{if(o.isMesh&&(o.name.startsWith('Fiber')||o.name.startsWith('Fine tapered'))){o.castShadow=false;o.receiveShadow=false;}});return head;
}
function createHair(head,m){
 refineHairMaterials(m);
 const hair=new THREE.Group();hair.name='Hair / swept fringe and twin ponytails';head.add(hair);
 const cp=(u,v)=>{const a=-u*TAU,front=Math.max(0,Math.cos(a)),boundY=.095*front-.062*(1-front),limit=Math.acos(clamp((boundY-.018)/.145,-1,1)),p=v*limit;return [.105*Math.sin(a)*Math.sin(p),.018+.145*Math.cos(p),.096*Math.cos(a)*Math.sin(p)];};
 surface(hair,'Closed sculpted scalp cap',96,44,(u,v)=>({p:cp(u,v)}),m.hairCap);
 const bang=(u,t)=>{const rx=.032+.043*u,ry=.140-.035*u,ex=lerp(-.094,.067,u),ey=smoothProfile([[-.094,.010],[-.080,.032],[-.056,.040],[-.030,.044],[0,.057],[.025,.076],[.045,.067],[.067,.040]],ex)[0]+.0003*Math.sin(u*39),q=Math.pow(Math.sin(t*Math.PI/2),1.12),x=lerp(rx,ex,q),y=lerp(ry,ey,t),sz=.096*Math.sqrt(Math.max(0,1-(x/.105)**2-((y-.018)/.145)**2)),z=Math.max(sz,faceZ(x,y))+.00065+.0012*Math.sin(t*Math.PI/2)**2;return [x,y,z];};
 surface(hair,'Continuous side-swept fringe',100,64,(u,v)=>({p:bang(1-u,v),uv:[1-u,v]}),m.hairCap);
 // Subpixel fibers intersected the combed surface. The same strand direction is now baked into original UV texture.
 for(const s of [-1,1]){
 const base=[[s*.092,-.025,-.056],[s*.115,-.075,-.006],[s*.126,-.14,.062],[s*.117,-.207,.117],[s*.090,s<0?-.230:-.248,.119]];
 const baseCurve=new THREE.CatmullRomCurve3(base.map(p=>V(...p)));
 ribbon(hair,'Ponytail interior '+s,base,t=>.021*Math.pow(Math.sin(Math.PI*(.13+.87*t)),.58),t=>.018*Math.pow(Math.sin(Math.PI*(.13+.87*t)),.60),m.hairDark,{segments:42,radial:18});
 sphere(hair,'Navy elastic tie',[s*.093,-.034,-.055],[.022,.009,.022],m.webbing,22);
 for(let k=0;k<36;k++){
 const phase=k*2.399+s*.47,rad=.032*Math.sqrt((k+.5)/36),pts=[];
 for(let j=0;j<=8;j++){const t=j/8,p=baseCurve.getPoint(t),env=Math.sin(t*Math.PI);p.x+=Math.cos(phase)*rad*env+.0070*Math.sin(t*13+phase)*env+Math.pow(t,4)*Math.sin(k*3)*.011;p.z+=Math.sin(phase)*rad*env+.0065*Math.sin(t*12+k)*env;p.y-=Math.pow(t,2)*((k%5)*.005);pts.push(p.toArray());}
 const width=.0045+(k%3)*.0006;
 ribbon(hair,'Layered wavy ponytail tress '+s+' '+k,pts,t=>Math.max(.00015,width*Math.pow(Math.sin(Math.PI*(.065+.935*t)),.62)),t=>.0028*Math.sin(Math.PI*(.08+.92*t)),k%4===0?m.hairMid:m.hair,{segments:38,radial:8});
 const curve=new THREE.CatmullRomCurve3(pts.map(p=>V(...p)));
 for(let f=-1;f<=1;f++){const arr=[];for(let j=0;j<=26;j++){const t=j/26,p=curve.getPoint(t);p.x+=f*.0021*Math.sin(Math.PI*t);p.z+=.0030*Math.sin(Math.PI*(.08+.92*t));arr.push(p);}tube(hair,'Fiber tail',arr,.00012,k%4===0?m.hairLight:m.hairMid,26,4);}
 }
 for(let k=0;k<14;k++){const pts=[],phase=k*1.76;for(let j=0;j<=20;j++){const t=j/20,p=baseCurve.getPoint(t),env=Math.sin(Math.PI*t);p.x+=s*(.021+.006*Math.sin(phase))*env+.006*Math.sin(t*15+phase)*env;p.z+=Math.cos(phase)*.024*env;p.y-=t*t*(.01+(k%3)*.008);pts.push(p);}tube(hair,'Fiber flyaway',pts,.00016,m.hairMid,25,4);}
 const side=[[s*.085,.065,.023],[s*.094,.012,.021],[s*.083,-.065,.037],[s*.095,-.112,.042]];
 ribbon(hair,'Temple framing lock '+s,side,t=>.0055*Math.sin(Math.PI*(.13+.87*t)),.002,m.hair,{segments:32,radial:10});
 }
 batch(hair,'Fiber');
}

export function faceSkinColor(x,y){
 const [rx]=smoothProfile(profile,y),front=Math.sqrt(Math.max(.0001,1-(x/Math.max(.001,rx))**2));
 const tint=(gauss(x,.056,.024)+gauss(x,-.056,.024))*gauss(y,-.028,.023)*front*.34;
 const c=new THREE.Color('#efc0a6').lerp(new THREE.Color('#dc9385'),tint);
 c.lerp(new THREE.Color('#c99e92'),.065*(gauss(x,.036,.022)+gauss(x,-.036,.022))*gauss(y,.003,.009)*front);
 c.lerp(new THREE.Color('#df9b87'),.09*gauss(x,0,.020)*gauss(y,-.026,.022)*front);
 return c;
}
