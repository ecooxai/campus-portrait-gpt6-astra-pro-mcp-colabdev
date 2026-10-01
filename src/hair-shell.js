import * as THREE from 'three';
import {D} from './design.js';
import {surface,smoothProfile,clamp,TAU,lerp,V} from './geometry.js';
import {faceZ} from './anatomy.js';
const smooth=(x)=>{x=clamp(x,0,1);return x*x*(3-2*x);};

/** A continuous scalp-to-fringe shell replaces the overlapping crown/fringe seam. */
export function buildUnifiedHairShell(hair,m){
 const sweep=D.shellSweep??.10,volume=D.shellVolume??1,ridge=D.shellRidge??.00045;
 function point(u,t){
  const a=-u*TAU,front=Math.max(0,Math.cos(a)),rear=Math.max(0,-Math.cos(a));
  const xBorder=.100*Math.sin(a),edge=smoothProfile([[-.100,.002],[-.094,.010],[-.080,.032],[-.056,.040],[-.030,.044],[0,.057],[.025,.076],[.045,.067],[.067,.040],[.100,.004]],xBorder)[0]
   -D.fringeDrop*Math.exp(-Math.pow((xBorder+.015)/.070,2))+D.fringeSplit*Math.exp(-Math.pow((xBorder-.035)/.024,2));
  const side=-.062-(D.napeDepth||0)*rear**3+(D.earSculpt?(.062+(D.earNotch||0))*Math.abs(Math.sin(a))**14:0);
  const bound=lerp(side,edge,smooth((front-.08)/.65));
  const limit=Math.acos(clamp((bound-.018)/.145,-1,1)),polar=t*limit;
  const flow=u-sweep*front*Math.pow(t,1.65),envelope=Math.sin(polar);
  const ripple=ridge*Math.sin(flow*TAU*27+Math.sin(t*3))*Math.sin(Math.PI*Math.min(t,1))**2;
  const x=(.105*volume+ripple)*Math.sin(a)*envelope,y=.018+.145*Math.cos(polar);
  let z=(.096*volume+ripple)*Math.cos(a)*envelope;
  if(front>.3&&y<.12)z=Math.max(z,faceZ(x,y)+.0035*front);
  return {p:[x,y,z],uv:[flow,t]};
 }
 const shell=surface(hair,'Unified swept crown and fringe',160,104,(u,t)=>point(u,t),m.hairCap);
 shell.userData.construction='Continuous scalp-to-fringe shell; original procedural strand UV flow.';
 const tips=Math.round(36*(D.shellTipDensity??1));
 for(let k=0;k<tips;k++){
  const angle=lerp(-1.10,1.10,(k+.5)/tips),u=(((-angle/TAU)%1)+1)%1,len=.032+(k%5)*.002;
  const tip=surface(hair,'Fine split hairline tip '+k,2,12,(w,v)=>{
   const t=.973+v*len,du=(w-.5)*.00055/(TAU*.105)*(1-v),p=point(u+du,t).p;
   p[2]+=.00055*Math.max(0,Math.cos(angle));return {p,uv:[w,v]};
  },k%3===0?m.hairMid:m.hair);
  tip.castShadow=false;tip.receiveShadow=false;
 }
 return shell;
}
