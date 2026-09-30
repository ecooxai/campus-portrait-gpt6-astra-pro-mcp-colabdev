import {D} from './design.js';
import {gauss,lerp,smoothProfile} from './geometry.js';

/** Continuous nasal bridge, tip and alar wings authored in model-space meters. */
export function nasalDisplacement(x,y){
 const ny=y-D.noseY,w=D.noseWidth;
 const legacy=.015*D.noseBridge*gauss(x,0,.015*w)*gauss(ny,.006,.041)
  +.0215*D.noseTip*gauss(x,0,.018*w)*gauss(ny,-.021,.015)
  +.006*(gauss(x,.014*w,.010*w)+gauss(x,-.014*w,.010*w))*gauss(ny,-.025,.008);
 const blend=D.noseSculpt||0;if(blend===0)return legacy;
 const rows=[[-.044,0,.012],[-.038,.001,.011],[-.034,.0045,.010],[-.030,.015,.0115],[-.024,.028,.0140],[-.016,.024,.0130],[-.001,.017,.0105],[.018,.0115,.0090],[.038,.0042,.012],[.064,0,.019]];
 const [height,width]=smoothProfile(rows,ny),tip=gauss(ny,-.023,.014),bridge=gauss(ny,.015,.034);
 const scale=1+(D.noseTip-1)*tip+(D.noseBridge/.72-1)*.38*bridge;
 const root=height*scale*gauss(x,0,width*w*(D.noseCrossSection||1));
 const wings=.0055*(D.noseWing||1)*(gauss(x,.0130*w,.0068*w)+gauss(x,-.0130*w,.0068*w))*gauss(ny,-.028,.0055);
 const columella=.0020*gauss(x,0,.0045*w)*gauss(ny,-.032,.004);
 return lerp(legacy,root+wings+columella,blend);
}
