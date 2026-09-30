import * as THREE from 'three';
import {surface,tube,sphere,lerp,clamp,gauss,TAU} from './geometry.js';
import {faceZ,faceSkinColor} from './head.js';

function skinColor(x,y){return faceSkinColor(x,y);}

/** Conforming eyelid patches replace detached outline tubes. */
export function buildEye(head,m,s){
 const cx=s*.035,cy=.019,hw=.018;
 const edge=(a,upper)=>{const x=cx+a*hw,curve=Math.pow(Math.max(0,1-a*a),.63),y=cy+(upper?.0066:-.0041)*curve+s*a*.0011+.0008*Math.max(0,s*a)**2;return [x,y,faceZ(x,y)+.0006];};
 const eyeZ=(x,y)=>{const a=(x-cx)/hw,t=edge(a,true)[1],b=edge(a,false)[1],v=clamp((y-b)/Math.max(.00001,t-b),0,1);const join=Math.max(0,1-a*a)*Math.sin(Math.PI*v);return lerp(faceZ(x,y)+.0007,faceZ(cx,cy)+.0027,join);};
 const white=m.eyeWhite.clone();white.name='Conforming eye whites';white.color.set('#ffffff');white.vertexColors=true;
 surface(head,'Almond eye surface '+s,64,22,(u,v)=>{const a=u*2-1,t=edge(a,true),b=edge(a,false),x=t[0],y=lerp(b[1],t[1],v),c=new THREE.Color('#e9e3da');c.lerp(new THREE.Color('#c3a5a1'),Math.pow(Math.abs(a),5)*.32);c.lerp(new THREE.Color('#949394'),Math.pow(v,7)*.12);return {p:[x,y,eyeZ(x,y)],c:c.toArray()};},white);
 const iris=m.iris.clone();iris.name='Brown iris detail';iris.color.set('#ffffff');iris.vertexColors=true;iris.roughness=.52;iris.clearcoat=.15;iris.envMapIntensity=.55;
 const ir=.0064,iy=cy+.0006;
 surface(head,'Eye iris '+s,56,28,(u,v)=>{const x=cx+(u*2-1)*ir,dy=Math.sqrt(Math.max(0,ir*ir-(x-cx)**2)),t=edge((x-cx)/hw,true)[1]-.0001,b=edge((x-cx)/hw,false)[1]+.0001,y=lerp(Math.max(iy-dy,b),Math.min(iy+dy,t),v),dx=x-cx,yy=y-iy,rho=Math.sqrt(dx*dx+yy*yy)/ir,angle=Math.atan2(yy,dx);const c=new THREE.Color('#413027'),fiber=.13*Math.sin(angle*47+rho*16)+.12*Math.sin(angle*71-rho*11);c.lerp(new THREE.Color('#88664d'),Math.max(0,fiber+.10));if(rho>.83)c.lerp(new THREE.Color('#211e1d'),(rho-.83)/.17);if(rho<.48)c.set('#111719');return {p:[x,y,eyeZ(x,y)+.00025+.00012*Math.sqrt(Math.max(0,1-rho*rho))],c:c.toArray()};},iris);
 for(const upper of [true,false]){
  surface(head,(upper?'Upper':'Lower')+' integrated eyelid '+s,64,14,(u,v)=>{if(!upper)u=1-u;const a=u*2-1,p=edge(a,upper),width=(upper?.0085:.0052)*Math.pow(Math.max(0,1-a*a),.55),x=p[0]+a*v*.002,y=p[1]+(upper?1:-1)*v*width,z=faceZ(x,y)+(.0006*(1-v)**2*(1+2*v)+.0006*v*(1-v)**2)*Math.max(0,1-a*a);return {p:[x,y,z],c:skinColor(x,y).toArray()};},m.face);
 }
 const upper=[],lower=[],crease=[];
 for(let j=0;j<=36;j++){const a=j/18-1,t=edge(a,true),b=edge(a,false);upper.push([t[0],t[1]-.00012,t[2]+.00012]);lower.push([b[0],b[1]+.0001,b[2]+.00005]);const y=t[1]+.0035*Math.sqrt(Math.max(0,1-a*a));crease.push([t[0],y,faceZ(t[0],y)+.0002]);}
 tube(head,'Fine upper lashes '+s,upper,.00031,m.lash,40,6);
 tube(head,'Subtle lower waterline '+s,lower,.00018,m.lip,40,5);
 tube(head,'Soft upper eyelid fold '+s,crease,.00012,m.lidShadow,40,4);
 const gx=cx-.0014,gy=cy+.0023;
 sphere(head,'Small eye softbox reflection '+s,[gx,gy,eyeZ(gx,gy)+.00055],[.00070,.00090,.00015],m.glint,18);
 sphere(head,'Secondary eye reflection '+s,[cx+.0017,cy-.0013,eyeZ(cx+.0017,cy-.0013)+.0005],[.00026,.00028,.00013],m.glint,14);
 for(let j=0;j<5;j++){const a=s*(.52+j*.085),p=edge(a,true),x=p[0]+s*.0011,y=p[1]+.0008;tube(head,'Outer eyelash '+s+' '+j,[p,[x,y,faceZ(x,y)+.0009]],.0001,m.lash,3,4);}
}

export function buildBrow(head,m,s){
 for(let k=0;k<180;k++){const t=(k+.4)/180,x=s*(.019+.040*t),y=.043+.0027*Math.sin(t*Math.PI)-.0044*t,w=.0016*Math.sin(Math.PI*(.14+.82*t)),jitter=Math.sin(k*2.4)*w*.95,y0=y+jitter,y1=y+w*.45,dx=-s*(.001+.0008*t);tube(head,'Brow strand '+s+' '+k,[[x,y0,faceZ(x,y0)+.00035],[x+dx*.5,(y0+y1)/2+.00025,faceZ(x+dx*.5,(y0+y1)/2+.00025)+.0004],[x+dx,y1,faceZ(x+dx,y1)+.00035]],.00012*(1-.35*t),m.brow,4,4);}
}
