import {D} from './design.js';
import {gauss,lerp} from './geometry.js';
/** Shared inner lip boundaries: every lip, tooth and facial opening uses the same definition. */
export function portraitMouthCurves(a){
 const t=Math.min(1,Math.abs(a));
 const oldTop=-.047+D.mouthY+.003*a*a+.0007*gauss(t,.28,.17)+(D.mouthSmile-1)*.004*a*a;
 const oldGap=((- .047+.003*a*a+.0007*gauss(t,.28,.17))-(-.0615+.0175*a*a))*D.mouthOpen;
 const newTop=-.047+D.mouthY+.0042*Math.pow(t,1.8)+.00045*gauss(t,.28,.18)-.00020*gauss(t,0,.12)+(D.mouthSmile-1)*.003*t*t;
 const gap=.0146*D.mouthOpen*Math.pow(Math.max(0,1-t*t),D.lipOpeningPower??.78);
 const strength=D.mouthSculpt||0,top=lerp(oldTop,newTop,strength);
 return {top,bottom:top-lerp(oldGap,gap,strength)};
}
