import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { V,clamp,lerp,TAU,gauss,smoothProfile,mesh,sphere,surface,tube,loft,ribbon } from './geometry.js';
const profile=[[-.116,.002,.010],[-.109,.025,.032],[-.096,.044,.048],[-.079,.062,.060],[-.057,.077,.069],[-.029,.087,.073],[0,.092,.073],[.024,.092,.072],[.051,.09,.072],[.080,.084,.069],[.107,.072,.060],[.128,.050,.043],[.143,.002,.002]];
function delta(x,y){return .011*(gauss(x,.052,.03)+gauss(x,-.052,.03))*gauss(y,-.028,.025)-.005*(gauss(x,.037,.022)+gauss(x,-.037,.022))*gauss(y,.018,.014)+.0045*(gauss(x,.04,.026)+gauss(x,-.04,.026))*gauss(y,.043,.013)+.017*gauss(x,0,.011)*gauss(y,.006,.039)+.027*gauss(x,0,.014)*gauss(y,-.021,.012)+.006*(gauss(x,.014,.01)+gauss(x,-.014,.01))*gauss(y,-.025,.008)+.011*gauss(x,0,.043)*gauss(y,-.055,.025)+.008*gauss(x,0,.029)*gauss(y,-.091,.016);}
export function faceZ(x,y){const [rx,rz]=smoothProfile(profile,y);return rz*Math.sqrt(Math.max(.001,1-(x/rx)**2))+delta(x,y);}
function batch(group,prefix){const buckets=new Map();group.children.slice().forEach(m=>{if(!m.isMesh||!m.name.startsWith(prefix))return;let b=buckets.get(m.material.uuid);if(!b){b={mat:m.material,gs:[]};buckets.set(m.material.uuid,b);}m.updateMatrix();let g=m.geometry.clone().applyMatrix4(m.matrix);if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}b.gs.push(g);m.geometry.dispose();group.remove(m);});for(const b of buckets.values()){const g=mergeGeometries(b.gs);if(g)mesh(group,prefix+' combined',g,b.mat);b.gs.forEach(g=>g.dispose());}}
export function createHead(parent,m){
 const head=new THREE.Group();head.name='Head / sculpted face';head.position.set(.009,1.536,.011);head.rotation.z=-.033;head.rotation.y=-.025;parent.add(head);
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
 const edge=(u,top)=>{const x=cx+u*hw,y=cy+(top?.0093:-.0065)*Math.pow(Math.max(0,1-u*u),.66)+s*u*.0012;return [x,y,faceZ(x,y)+.0018];};
 surface(head,`${s} almond sclera`,48,16,(u,v)=>{const a=u*2-1,t=edge(a,true),b=edge(a,false),x=t[0],y=lerp(b[1],t[1],v);return {p:[x,y,faceZ(x,y)+.0019+.0035*(1-a*a)*Math.sin(v*Math.PI)]};},m.eyeWhite);
 const iz=faceZ(cx,cy)+.0062;
 sphere(head,'Iris limbal rim',[cx,cy+.0005,iz],[.0075,.0075,.0013],m.pupil,32);
 sphere(head,'Warm brown iris',[cx,cy+.0005,iz+.0005],[.0068,.0068,.00115],m.iris,32);
 for(let k=0;k<28;k++){const a=k/28*TAU;const pts=[.0036,.0064].map(r=>[cx+Math.cos(a)*r,cy+.0005+Math.sin(a)*r,iz+.00153]);tube(head,'Iris fiber',pts,.00016,k%2?m.irisLight:m.iris,2,4);}
 sphere(head,'Pupil',[cx,cy+.0007,iz+.00155],[.00345,.00365,.0008],m.pupil,28);
 sphere(head,'Eye catchlight',[cx-.0021,cy+.0034,iz+.0024],[.0017,.0015,.00045],m.glint,20);
 sphere(head,'Eye secondary glint',[cx+.0023,cy-.0019,iz+.0023],[.0006,.00065,.0003],m.glint,16);
 const upper=[],lower=[],crease=[];
 for(let i=0;i<=22;i++){const u=i/11-1;upper.push(edge(u,true));lower.push(edge(u,false));const p=edge(u,true);p[1]+=.0038;p[2]=faceZ(p[0],p[1])+.001;crease.push(p);}
 tube(head,'Upper eyelid skin',upper,.0016,m.skin,30,8);
 tube(head,'Upper lash line',upper.map(p=>[p[0],p[1]-.0005,p[2]+.0007]),.0007,m.lash,30,6);
 tube(head,'Lower eyelid',lower,.0011,m.skin,30,7);
 tube(head,'Eyelid fold',crease,.00045,m.skinShadow,30,5);
 const brows=[];for(let i=0;i<=16;i++){const u=i/16,x=s*(.020+.043*u),y=.043+.0035*Math.sin(u*Math.PI)-.005*u;brows.push([x,y,faceZ(x,y)+.002]);}
 ribbon(head,'Soft tapered eyebrow',brows,t=>.0018*Math.sin(Math.PI*(.10+.84*t)),.0005,m.brow,{segments:24,radial:8});
 for(let k=0;k<10;k++){const u=.05+k*.09,x=s*(.02+.043*u),y=.043+.0035*Math.sin(u*Math.PI)-.005*u;tube(head,'Brow fiber',[[x,y,faceZ(x,y)+.0027],[x-s*.0015,y+.0018,faceZ(x,y)+.0026]],.00016,m.brow,2,4);}
 const nx=s*.0107,ny=-.0285;sphere(head,'Nostril recess',[nx,ny,faceZ(nx,ny)+.0007],[.0033,.0015,.001],m.skinShadow,24);
 }
 const top=u=>-.047+.003*u*u+.0007*gauss(Math.abs(u),.28,.17),bottom=u=>-.061+.017*u*u;
 surface(head,'Recessed smiling mouth',60,18,(u,v)=>{const a=u*2-1,x=.029*a,y=lerp(bottom(a),top(a),v);return {p:[x,y,faceZ(x,y)+.0013]};},m.mouth);
 for(const upper of [true,false]){const pts=[];for(let i=0;i<=36;i++){const u=i/18-1,x=.029*u,y=upper?top(u):bottom(u);pts.push([x,y,faceZ(x,y)+.002]);}tube(head,upper?'Upper lip vermilion':'Lower lip vermilion',pts,upper?.00125:.0018,m.lip,48,8);}
 for(let i=-3;i<=3;i++){const x=i*.00675,u=x/.029,y=top(u)-.0032;const tooth=mesh(head,'Individual upper incisor',new RoundedBoxGeometry(i===0?.0068:.0064,.0056,.003,2,.0008),m.tooth);tooth.position.set(x,y,faceZ(x,y)+.0023);tooth.rotation.y=-x*3.5;tooth.rotation.z=x*1.5;}

 batch(head,'Iris fiber');batch(head,'Brow fiber');
 createHair(head,m);return head;
}
function createHair(head,m){
 const hair=new THREE.Group();hair.name='Hair / swept fringe and twin ponytails';head.add(hair);
 const cp=(u,v)=>{const a=-u*TAU,front=Math.max(0,Math.cos(a)),boundY=.065*front-.056*(1-front),y=lerp(.152,boundY,v);let rx,rz;
 if(y>.143){const t=(.152-y)/.009;rx=.008*t;rz=.008*t;}else{[rx,rz]=smoothProfile(profile,y);rx+=.006;rz+=.006;}
 const x=rx*Math.sin(a),z=rz*Math.cos(a)+delta(x,Math.min(y,.143))*Math.pow(front,3);return [x,y,z];};
 surface(hair,'Closed sculpted scalp cap',96,44,(u,v)=>({p:cp(u,v)}),m.hair);
 for(let k=0;k<115;k++){const u=k/115,pts=[];for(let i=0;i<=21;i++){const v=.05+i/21*.95,p=cp(u+.004*Math.sin(v*4+k),v);p[0]*=1.007;p[2]+=.00035*Math.cos(-u*TAU);p[1]+=.00035;pts.push(p);}tube(hair,'Fiber cap',pts,k%9===0?.00022:.00011,k%9===0?m.hairLight:k%3?m.hairMid:m.hairDark,22,4);}
 const ends=[[-.088,.015,.047],[-.078,.031,.065],[-.065,.041,.080],[-.051,.043,.088],[-.036,.046,.094],[-.022,.049,.095],[-.008,.054,.095],[.006,.062,.093],[.021,.069,.089],[.040,.057,.080],[.065,.024,.055]];
 ends.forEach((end,k)=>{
 const root=[.036+k*.0017,.130-k*.0004,.050],mid=[lerp(root[0],end[0],.34),.095,.079],pre=[lerp(root[0],end[0],.80),lerp(.09,end[1],.67),Math.max(.081,end[2]+.004)];
 const pts=[root,mid,pre,end],w=.009+(k<8?.004:.001);
 ribbon(hair,'Overlapping swept fringe '+k,pts,t=>Math.max(.00045,w*Math.pow(Math.sin(Math.PI*(.06+.94*t)),.64)),t=>.0025*Math.sin(Math.PI*(.1+.9*t)),k%3===0?m.hairMid:m.hair,{segments:36,radial:12});
 const curve=new THREE.CatmullRomCurve3(pts.map(p=>V(...p)));
 for(let h=-2;h<=2;h++){const strand=[];for(let j=0;j<=22;j++){const t=j/22,p=curve.getPoint(t),tan=curve.getTangent(t),side=new THREE.Vector3().crossVectors(tan,V(0,0,1)).normalize();p.addScaledVector(side,h*w*.21*Math.sin(Math.PI*(.06+.94*t)));p.z+=.0028*Math.sin(Math.PI*(.1+.9*t));strand.push(p);}tube(hair,'Fiber fringe',strand,.00013,h===-1?m.hairLight:m.hairMid,22,4);}
 });
 for(const s of [-1,1]){
 const base=[[s*.087,-.018,-.065],[s*.111,-.071,-.065],[s*.124,-.143,-.026],[s*.111,-.204,.019],[s*.080,-.233,.041]];
 ribbon(hair,'Ponytail core '+s,base,t=>.026*Math.pow(Math.sin(Math.PI*(.13+.85*t)),.58),t=>.025*Math.pow(Math.sin(Math.PI*(.16+.84*t)),.6),m.hair,{segments:48,radial:24});
 sphere(hair,'Navy elastic tie',[s*.091,-.032,-.061],[.025,.012,.025],m.webbing,24);
 for(let k=0;k<9;k++){
 const offset=(k-4)*.0055,points=base.map((p,i)=>[p[0]+offset*Math.sin((i/4+.18)*Math.PI),p[1]+(i/4)*((k%3)*.006),p[2]+Math.cos(k*1.9)*.012+Math.sin(i*2+k)*.003]);points.at(-1)[0]+=s*(k%3-1)*.008;
 const width=.0075+(k%3)*.0016;
 ribbon(hair,'Wavy ponytail lock '+s+' '+k,points,t=>Math.max(.00035,width*Math.pow(Math.sin(Math.PI*(.08+.92*t)),.6)),t=>.006*Math.sin(Math.PI*(.12+.88*t)),k%3===0?m.hairMid:m.hair,{segments:38,radial:10});
 const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p)));
 for(let h=-1;h<=1;h++){const arr=[];for(let j=0;j<=23;j++){const t=j/23,p=curve.getPoint(t);p.x+=h*.0025*Math.sin(t*Math.PI);p.z+=.006*Math.sin(Math.PI*(.12+.88*t));arr.push(p);}tube(hair,'Fiber tail',arr,.00013,h===0?m.hairLight:m.hairMid,23,4);}
 }
 const side=[[s*.085,.065,.023],[s*.094,.012,.021],[s*.083,-.065,.037],[s*.095,-.112,.042]];
 ribbon(hair,'Temple framing lock '+s,side,t=>.0055*Math.sin(Math.PI*(.13+.87*t)),.002,m.hair,{segments:32,radial:10});
 }
 batch(hair,'Fiber');
}
