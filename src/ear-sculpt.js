import * as THREE from 'three';
import {D} from './design.js';
import {surface,tube,sphere,TAU,gauss} from './geometry.js';
import {faceSkinColor} from './anatomy.js';

/** An original curved auricle: conchal bowl, rolled helix, antihelix and lobule. */
export function buildSculptedEar(head,m,s){
 const group=new THREE.Group();group.name='Anatomically sculpted ear '+s;group.position.set(s*(.095+(D.earOutset||0)),-.012,-.006);group.rotation.set(D.earTilt||0,-s*(D.earYaw??.24),-s*.10);const size=D.earSize||1;group.scale.set(size,size,size);head.add(group);
 const skin=m.face.clone();skin.name='Warm auricular skin';skin.color.set('#ffffff');skin.vertexColors=true;skin.roughness=.60;
 const base=faceSkinColor(s*.083,-.016),warm=new THREE.Color('#cb8f7c');
 const rootSkin=m.skin.clone();rootSkin.name='Auricular root skin';rootSkin.color.copy(base);rootSkin.roughness=.62;
 sphere(group,'Continuous ear root attachment '+s,[s*-.001,-.003,-.001],[.010,.0205,.0103],rootSkin,36);
 const contour=a=>{const c=Math.cos(a),sn=Math.sin(a),ry=c>0?.026:.0245,rz=.0122*(1+.16*c);return [ry*c-.0015*sn,rz*sn-.002*c];};
 const point=(a,r)=>{const [y,z]=contour(a),rim=.0050*gauss(r,.84,.13),bowl=-.0028*gauss(r,.32,.26),attach=-.003*Math.max(0,-Math.sin(a))*r;return [s*(.009+rim+bowl+attach),y*r,z*r];};
 surface(group,'Curved conchal bowl '+s,80,36,(u,v)=>{const a=-s*u*TAU,r=v,p=point(a,r),tint=.18*(D.earWarmth??1)*gauss(r,.40,.35),c=base.clone().lerp(warm,tint);return {p,c:c.toArray()};},skin);
 // The rear skin closes the outer silhouette, rather than leaving a flat ear card.
 surface(group,'Rear auricular skin '+s,72,24,(u,v)=>{const a=s*u*TAU,r=v,[y,z]=contour(a);return {p:[s*(.003+.003*Math.sin(Math.PI*r*.6)),y*r,z*r],c:base.toArray()};},skin);
 const helix=[];for(let j=0;j<=76;j++){const a=TAU*j/76,p=point(a,.87);p[0]+=s*.0008;helix.push(p);}tube(group,'Rolled helix rim '+s,helix,.00155,m.skin,80,8);
 const inner=[[-.017,-.001],[-.008,.004],[.005,.0048],[.015,.003],[.019,-.001]];
 tube(group,'Antihelix main fold '+s,inner.map(([y,z])=>[s*.0095,y,z]),.00135,m.skin,40,7);
 tube(group,'Superior antihelix branch '+s,[[s*.0095,.004,.0048],[s*.010,.012,-.003],[s*.0094,.017,-.006]],.0011,m.skin,22,7);
 const shadow=m.skinShadow.clone();shadow.name='Conchal shadow';shadow.color.copy(base).lerp(new THREE.Color('#a56b5b'),.25);
 sphere(group,'Ear canal recess '+s,[s*.0055,-.0025,-.0035],[.0018,.0050,.0036],shadow,28);
 sphere(group,'Tragus cartilage '+s,[s*.0105,-.002,-.0072],[.0021,.0057,.0033],m.skin,28);
 sphere(group,'Soft earlobe '+s,[s*.0082,-.021,.0008],[.0050,.0062,.0062],m.skin,28);
}
