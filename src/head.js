import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { V,clamp,lerp,TAU,gauss,smoothProfile,mesh,sphere,surface,tube,loft,ribbon } from './geometry.js';
const profile=[[-.116,.002,.010],[-.109,.025,.032],[-.096,.044,.048],[-.079,.062,.060],[-.057,.077,.069],[-.029,.087,.073],[0,.092,.073],[.024,.092,.072],[.051,.09,.072],[.080,.084,.069],[.107,.072,.060],[.128,.050,.043],[.143,.002,.002]];
function delta(x,y){return .011*(gauss(x,.052,.03)+gauss(x,-.052,.03))*gauss(y,-.028,.025)-.005*(gauss(x,.037,.022)+gauss(x,-.037,.022))*gauss(y,.018,.014)+.0045*(gauss(x,.04,.026)+gauss(x,-.04,.026))*gauss(y,.043,.013)+.017*gauss(x,0,.011)*gauss(y,.006,.039)+.027*gauss(x,0,.014)*gauss(y,-.021,.012)+.006*(gauss(x,.014,.01)+gauss(x,-.014,.01))*gauss(y,-.025,.008)+.011*gauss(x,0,.043)*gauss(y,-.055,.025)+.008*gauss(x,0,.029)*gauss(y,-.091,.016);}
export function faceZ(x,y){const [rx,rz]=smoothProfile(profile,y);return rz*Math.sqrt(Math.max(.001,1-(x/rx)**2))+delta(x,y);}
function batch(group,prefix){const buckets=new Map();group.children.slice().forEach(m=>{if(!m.isMesh||!m.name.startsWith(prefix))return;let b=buckets.get(m.material.uuid);if(!b){b={mat:m.material,gs:[]};buckets.set(m.material.uuid,b);}m.updateMatrix();let g=m.geometry.clone().applyMatrix4(m.matrix);if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}b.gs.push(g);m.geometry.dispose();group.remove(m);});for(const b of buckets.values()){const g=mergeGeometries(b.gs);if(g)mesh(group,prefix+' combined',g,b.mat);b.gs.forEach(g=>g.dispose());}}
export function createHead(parent,m){
 const head=new THREE.Group();head.name='Head / sculpted face';head.position.set(.036,1.536,.011);head.rotation.z=-.085;head.rotation.y=-.025;head.scale.set(1.04,.96,1.04);parent.add(head);
 const base=new THREE.Color('#efc5b0'),blush=new THREE.Color('#eaa58f');
 surface(head,'Continuous anatomical head',128,128,(u,v)=>{
 const y=lerp(-.116,.143,v),a=u*TAU,[rx,rz]=smoothProfile(profile,y),x=rx*Math.sin(a),front=Math.max(0,Math.cos(a));
 const z=rz*Math.cos(a)+delta(x,y)*Math.pow(front,3);
 const tint=(gauss(x,.056,.024)+gauss(x,-.056,.024))*gauss(y,-.035,.018)*front*.25;
 const c=base.clone().lerp(blush,tint);return {p:[x,y,z],c:c.toArray()};
 },m.face);
 for(const s of [-1,1]){
 const ear=sphere(head,`${s} ear pinna`,[s*.091,-.014,-.005],[.017,.028,.013],m.skin,32);ear.rotation.z=-s*.13;
 sphere(head,`${s} concha`,[s*.103,-.012,.003],[.0065,.017,.006],m.skinShadow,28);
 const ep=[];for(let i=0;i<28;i++){const a=TAU*i/27;ep.push([s*(.101+.009*Math.sin(a)),-.012+.022*Math.cos(a),.005+.003*Math.cos(a)]);}tube(head,'Helix',ep,.0023,m.skin,30,7);
 tube(head,'Antihelix',[[s*.102,-.029,.011],[s*.101,-.009,.010],[s*.106,.003,.009]],.0018,m.skin,18,7);
 const cx=s*.038,cy=.018,hw=.022;
 const edge=(u,top)=>{const x=cx+u*hw,y=cy+(top?.0073:-.0048)*Math.pow(Math.max(0,1-u*u),.66)+s*u*.0012;return [x,y,faceZ(x,y)+.0018];};
 surface(head,`${s} almond sclera`,48,16,(u,v)=>{const a=u*2-1,t=edge(a,true),b=edge(a,false),x=t[0],y=lerp(b[1],t[1],v);return {p:[x,y,faceZ(x,y)+.0019+.0035*(1-a*a)*Math.sin(v*Math.PI)]};},m.eyeWhite);
 const ir=.0080;
 const irisMaterial=m.iris.clone();irisMaterial.color.set('#ffffff');irisMaterial.vertexColors=true;irisMaterial.name='Natural brown iris';
 surface(head,'Curved iris clipped by eyelids',44,22,(u,v)=>{const x=cx+(u*2-1)*ir,dy=Math.sqrt(Math.max(0,ir*ir-(x-cx)**2)),top=edge((x-cx)/hw,true)[1]-.0003,bot=edge((x-cx)/hw,false)[1]+.0003,y=lerp(Math.max(cy-dy,bot),Math.min(cy+dy,top),v),dx=x-cx,ey=y-cy,rho=Math.sqrt(dx*dx+ey*ey)/ir,angle=Math.atan2(ey,dx);let c=new THREE.Color('#302821');const fiber=.11*Math.sin(angle*49+rho*23)+.07*Math.sin(angle*77-rho*17);c.lerp(new THREE.Color('#654d35'),Math.max(0,fiber+.15)*(1-rho));if(rho>.86)c.lerp(new THREE.Color('#282421'),(rho-.86)/.14);if(rho<.53)c.set('#17191b');return {p:[x,y,faceZ(x,y)+.0062+.0013*Math.sqrt(Math.max(0,1-rho*rho))],c:c.toArray()};},irisMaterial);
 const iz=faceZ(cx,cy)+.0085;
 sphere(head,'Eye catchlight',[cx-.0018,cy+.0022,iz],[.0011,.0012,.00035],m.glint,18);
 sphere(head,'Eye secondary glint',[cx+.0019,cy-.0016,iz-.0003],[.00042,.00045,.0002],m.glint,14);
 const upper=[],lower=[],crease=[];
 for(let i=0;i<=22;i++){const u=i/11-1;upper.push(edge(u,true));lower.push(edge(u,false));const p=edge(u,true);p[1]+=.0038;p[2]=faceZ(p[0],p[1])+.001;crease.push(p);}
 tube(head,'Upper eyelid skin',upper,.0014,m.skin,30,8);
 tube(head,'Upper lash line',upper.map(p=>[p[0],p[1]-.0005,p[2]+.0007]),.0006,m.lash,30,6);
 tube(head,'Lower eyelid',lower,.0011,m.skin,30,7);
 tube(head,'Eyelid fold',crease,.00045,m.skinShadow,30,5);
 const brows=[];for(let i=0;i<=16;i++){const u=i/16,x=s*(.020+.043*u),y=.043+.0035*Math.sin(u*Math.PI)-.005*u;brows.push([x,y,faceZ(x,y)+.002]);}
 ribbon(head,'Soft tapered eyebrow',brows,t=>.0018*Math.sin(Math.PI*(.10+.84*t)),.0005,m.brow,{segments:24,radial:8});
 for(let k=0;k<10;k++){const u=.05+k*.09,x=s*(.02+.043*u),y=.043+.0035*Math.sin(u*Math.PI)-.005*u;tube(head,'Brow fiber',[[x,y,faceZ(x,y)+.0027],[x-s*.0015,y+.0018,faceZ(x,y)+.0026]],.00016,m.brow,2,4);}
 const nx=s*.0107,ny=-.0285;sphere(head,'Nostril recess',[nx,ny,faceZ(nx,ny)+.0007],[.0025,.0011,.0005],m.nostril,24);
 }
 const top=u=>-.047+.003*u*u+.0007*gauss(Math.abs(u),.28,.17),bottom=u=>-.062+.018*u*u;
 surface(head,'Recessed smiling mouth',60,18,(u,v)=>{const a=u*2-1,x=.029*a,y=lerp(bottom(a),top(a),v);return {p:[x,y,faceZ(x,y)+.0013]};},m.mouth);
 for(const upper of [true,false]){surface(head,upper?'Sculpted upper lip':'Sculpted lower lip',64,12,(u,v)=>{const a=u*2-1,x=.029*a,inner=upper?top(a):bottom(a),thickness=(upper?.0023:.0031)*Math.pow(Math.max(0,1-a*a),.65)+.00035,cupid=upper?.00045*gauss(Math.abs(a),.25,.17):0,y=inner+(upper?1:-1)*thickness*v+cupid*v,z=faceZ(x,y)+(.0017+.0014*Math.sin(v*Math.PI))*(1-a*a)+.00035;return {p:[x,y,z]};},upper?m.upperLip:m.lip);}
 for(let i=-3;i<=3;i++){const x=i*.00675,u=x/.029,y=top(u)-.0044;const tooth=mesh(head,'Individual upper incisor',new RoundedBoxGeometry(i===0?.0068:.0064,.0082,.003,2,.0008),m.tooth);tooth.position.set(x,y,faceZ(x,y)+.0023);tooth.rotation.y=-x*3.5;tooth.rotation.z=x*1.5;}

 batch(head,'Iris fiber');batch(head,'Brow fiber');
 createHair(head,m);return head;
}
function createHair(head,m){
 const hair=new THREE.Group();hair.name='Hair / swept fringe and twin ponytails';head.add(hair);
 const cp=(u,v)=>{const a=-u*TAU,front=Math.max(0,Math.cos(a)),boundY=.059*front-.062*(1-front),limit=Math.acos(clamp((boundY-.018)/.145,-1,1)),p=v*limit;return [.105*Math.sin(a)*Math.sin(p),.018+.145*Math.cos(p),.096*Math.cos(a)*Math.sin(p)];};
 surface(hair,'Closed sculpted scalp cap',96,44,(u,v)=>({p:cp(u,v)}),m.hairCap);
 const bang=(u,t)=>{const rx=.032+.043*u,ry=.140-.035*u,ex=lerp(-.094,.067,u),ey=-.004+.062*Math.pow(Math.max(0,Math.sin(Math.PI*(.02+.90*u))),.72)+.0015*Math.sin(u*39),q=Math.pow(Math.sin(t*Math.PI/2),1.12),x=lerp(rx,ex,q),y=lerp(ry,ey,t),sz=.096*Math.sqrt(Math.max(0,1-(x/.105)**2-((y-.018)/.145)**2)),z=Math.max(sz,faceZ(x,y))+.0035+.00065*Math.sin(u*62)*Math.sin(t*Math.PI);return [x,y,z];};
 surface(hair,'Continuous side-swept fringe',100,64,(u,v)=>({p:bang(1-u,v),uv:[1-u,v]}),m.hairCap);
 for(let k=0;k<155;k++){const u=(k+.4)/155,pts=[];for(let j=0;j<=30;j++){const t=j/30,p=bang(u,t);p[2]+=.00075;p[1]-=Math.pow(t,8)*.0015*Math.sin(k*2.1);pts.push(p);}tube(hair,'Fiber fringe',pts,k%11===0?.00015:.00009,k%11===0?m.hairLight:m.hairMid,30,4);}
 for(let k=0;k<22;k++){const u=(k+.4)/22,pts=[];for(let j=0;j<=12;j++){const t=.7+j/12*.3,p=bang(u,t);p[1]-=Math.pow((t-.7)/.3,3)*(.0015+.002*Math.sin(k*1.7)**2);p[2]+=.0004;pts.push(p);}ribbon(hair,'Fine tapered fringe edge '+k,pts,t=>.0012*(1-t)+.00008,.00025,m.hair,{segments:16,radial:6});}
 for(const s of [-1,1]){
 const base=[[s*.092,-.025,-.056],[s*.115,-.075,-.006],[s*.126,-.14,.062],[s*.117,-.207,.117],[s*.089,-.258,.128]];
 const baseCurve=new THREE.CatmullRomCurve3(base.map(p=>V(...p)));
 ribbon(hair,'Ponytail interior '+s,base,t=>.021*Math.pow(Math.sin(Math.PI*(.13+.87*t)),.58),t=>.018*Math.pow(Math.sin(Math.PI*(.13+.87*t)),.60),m.hairDark,{segments:42,radial:18});
 sphere(hair,'Navy elastic tie',[s*.093,-.034,-.055],[.022,.009,.022],m.webbing,22);
 for(let k=0;k<19;k++){
 const phase=k*2.399+s*.47,rad=.022*Math.sqrt((k+.5)/19),pts=[];
 for(let j=0;j<=8;j++){const t=j/8,p=baseCurve.getPoint(t),env=Math.sin(t*Math.PI);p.x+=Math.cos(phase)*rad*env+.0045*Math.sin(t*13+phase)*env+Math.pow(t,4)*Math.sin(k*3)*.011;p.z+=Math.sin(phase)*rad*env+.004*Math.sin(t*12+k)*env;p.y-=Math.pow(t,2)*((k%5)*.005);pts.push(p.toArray());}
 const width=.0065+(k%3)*.001;
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
