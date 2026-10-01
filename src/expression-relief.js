import * as THREE from 'three';
import {D} from './design.js';
import {clamp,gauss} from './geometry.js';

/** Continuous, small-scale facial muscle relief. Coordinates are authored, not measured from the photograph. */
export function expressionRelief(x,y){
 const strength=D.expressionRelief||0;if(strength===0)return 0;
 const mouthWidth=.0315*D.mouthWidth,cornerY=-.044+D.mouthY;
 const cheekLift=.0031*(D.cheekLiftRelief??1)*(gauss(x,.043,.023)+gauss(x,-.043,.023))*gauss(y,-.012,.014);
 const lowerLid=.0015*(D.lowerLidRelief??1)*(gauss(x,.033*D.eyeSpacing,.020)+gauss(x,-.033*D.eyeSpacing,.020))*gauss(y,.008+D.eyeY,.0045);
 const t=clamp((-.022+D.mouthY*.35-y)/.030,0,1),creaseX=.018+(mouthWidth-.016)*t;
 const crease=-.0015*(D.softCreaseStrength??1)*(gauss(x,creaseX,.0027*(D.softCreaseSpread??1))+gauss(x,-creaseX,.0027*(D.softCreaseSpread??1)))*gauss(y,-.037+D.mouthY*.6,.016);
 const dimple=-.0014*(D.dimpleRelief??1)*(gauss(x,mouthWidth+.002,.0047)+gauss(x,-mouthWidth-.002,.0047))*gauss(y,cornerY-.003,.006);
 const chinSulcus=-.0016*(D.chinSulcusRelief??1)*gauss(x,0,.024)*gauss(y,-.072+D.mouthY,.0055);
 return strength*(cheekLift+lowerLid+crease+dimple+chinSulcus);
}

/** Low-frequency vascular color, separate from pore relief and lighting. */
export function portraitColor(color,x,y,front){
 const strength=D.vascularColor||0;
 if(strength>0){
  const cheeks=(gauss(x,.044,.027)+gauss(x,-.044,.027))*gauss(y,-.022,.022)*front;
  const underEyes=(gauss(x,.033,.020)+gauss(x,-.033,.020))*gauss(y,.007,.0055)*front;
  const smileCorners=(gauss(x,.032,.005)+gauss(x,-.032,.005))*gauss(y,-.045,.012)*front;
  color.lerp(new THREE.Color('#d48d80'),strength*.19*cheeks);
  color.lerp(new THREE.Color('#bba398'),strength*.085*underEyes);
  color.lerp(new THREE.Color('#bd8e7e'),strength*.08*smileCorners);
 }
 return color.multiplyScalar(D.skinValue??1);
}
