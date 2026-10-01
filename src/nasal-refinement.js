import * as THREE from 'three';
import {D} from './design.js';
import {gauss,smoothProfile,surface,TAU} from './geometry.js';

/** A rounded bridge/tip/alar construction with correctly placed paired nostril recesses. */
export function reconstructedNose(x,y){
 const ny=y-D.noseY,w=D.noseWidth*(D.nasalWidth??1);
 const rows=[[-.044,0,.013],[-.039,.0004,.011],[-.035,.003,.010],[-.031,.010,.011],[-.026,.021,.0135],[-.022,.025,.013],[-.015,.021,.0105],[-.004,.0145,.0086],[.012,.0095,.0080],[.030,.0045,.010],[.048,.001,.015],[.064,0,.020]];
 const [height,width]=smoothProfile(rows,ny),tip=gauss(ny,-.023,.012);
 const center=height*(1+((D.nasalTip??1)-1)*tip)*gauss(x,0,width*w);
 const wings=.0066*(D.nasalWing??1)*(gauss(x,.013*w,.0055*w)+gauss(x,-.013*w,.0055*w))*gauss(ny,-.027,.0045);
 const pockets=-.0030*(gauss(x,.0095*w,.0030*w)+gauss(x,-.0095*w,.0030*w))*gauss(ny,-.031,.0019);
 const ala=-.0010*(gauss(x,.017*w,.0017*w)+gauss(x,-.017*w,.0017*w))*gauss(ny,-.027,.0055);
 const septum=.0032*gauss(x,0,.0038*w)*gauss(ny,-.032,.0034);
 return center+wings+pockets+ala+septum;
}

export function addNostrilLinings(head,m,faceZ,skinColor){
 const strength=D.noseReconstruction||0;if(strength<=0)return;
 const w=D.noseWidth*(D.nasalWidth??1),size=D.nostrilSize??1;
 for(const s of [-1,1]){
  const material=m.nostril.clone();material.name='Recessed nasal lining';material.color.set('#ffffff');material.vertexColors=true;
  surface(head,'Recessed nostril lining '+s,32,9,(u,v)=>{
   const a=-u*TAU,cx=s*.0095*w,cy=-.031+D.noseY,x=cx+.0026*w*size*Math.cos(a)*v,y=cy+.0012*size*Math.sin(a)*v;
   const skin=skinColor(x,y),dark=new THREE.Color('#754b3e').lerp(skin,.12),c=dark.lerp(skin,.62*Math.pow(v,3));
   c.lerp(skin,1-strength);return {p:[x,y,faceZ(x,y)+.00012],c:c.toArray()};
  },material);
 }
}
