import {portraitMouthCurves} from './mouth-curves.js';
import {expressionRelief,portraitColor} from './expression-relief.js';
import {nasalDisplacement} from './nose-anatomy.js';
import * as THREE from 'three';
import {D} from './design.js';
import {clamp,gauss,lerp,smoothProfile} from './geometry.js';

const baseProfile=[[-.108,.002,.012],[-.102,.025,.034],[-.091,.044,.049],[-.075,.063,.061],[-.053,.078,.070],[-.029,.087,.073],[0,.092,.073],[.024,.092,.072],[.051,.09,.072],[.080,.084,.069],[.107,.072,.060],[.128,.050,.043],[.143,.002,.002]];
export const profile=[];
export function refreshAnatomy(){profile.splice(0,profile.length,...baseProfile.map(([y,rx,rz])=>[
 y-D.chinLength*clamp((-.035-y)/.073,0,1),
 rx*(1+(D.jawWidth-1)*gauss(y,-.063,.027)+(D.chinWidth-1)*gauss(y,-.099,.013)+(D.cheekWidth-1)*gauss(y,-.019,.035)),rz
]));}
refreshAnatomy();
export function eyeLayout(s){return {cx:s*.035*D.eyeSpacing,cy:.019+D.eyeY,hw:.018*D.eyeWidth,top:.0066*D.eyeUpper,bottom:.0041*D.eyeLower};}
export function eyeEdgeY(a,upper,s){const l=eyeLayout(s),arch=Math.pow(Math.max(0,1-a*a),D.eyeCurvePower??.63);return l.cy+(upper?l.top:-l.bottom)*arch+D.eyeSlope*(s*a*.0011+.0008*Math.max(0,s*a)**2)+(D.eyeOuterLift||0)*s*a;}
export function mouthTop(a){return portraitMouthCurves(a).top;}
export function mouthBottom(a){return portraitMouthCurves(a).bottom;}
export function faceDelta(x,y){
 const ny=y-D.noseY,w=D.noseWidth,smileT=clamp((-.025-y)/.028,0,1),smileX=.015+.018*smileT;
 const smileFold=-.0012*D.smileFold*(gauss(x,smileX,.0035)+gauss(x,-smileX,.0035))*gauss(y,-.039+D.mouthY*.5,.018);
 return smileFold+expressionRelief(x,y)
 -.0035*D.noseGroove*(1-(D.noseReconstruction||0))*(gauss(x,.0102*w,.0032*w)+gauss(x,-.0102*w,.0032*w))*gauss(ny,-.0284,.0025)
 +.011*D.cheekForward*(gauss(x,.052,.030)+gauss(x,-.052,.030))*gauss(y,-.028,.025)
 +D.faceFlat*.006*(gauss(x,.063,.033)+gauss(x,-.063,.033))*gauss(y,0,.080)
 -.005*(gauss(x,.037*D.eyeSpacing,.022*D.eyeWidth)+gauss(x,-.037*D.eyeSpacing,.022*D.eyeWidth))*gauss(y,.018+D.eyeY,.014)
 +.0045*D.browRidge*(gauss(x,.040*D.eyeSpacing,.026)+gauss(x,-.040*D.eyeSpacing,.026))*gauss(y,.043+D.browY,.013)
 +nasalDisplacement(x,y)
 +.007*gauss(x,0,.039)*gauss(y,-.055+D.mouthY,.025)
 +.0025*(D.philtrumRelief??1)*(gauss(x,.004,.003*(D.philtrumWidth??1))+gauss(x,-.004,.003*(D.philtrumWidth??1)))*gauss(y,-.039+D.mouthY*.5,.010)
 +.008*D.chinForward*gauss(x,0,.029)*gauss(y,-.091-D.chinLength,.016);
}
export function faceZ(x,y){const [rx,rz]=smoothProfile(profile,y),front=Math.sqrt(Math.max(.0001,1-(x/Math.max(.001,rx))**2));return rz*front+faceDelta(x,y)*front**3;}
export function faceSkinColor(x,y,frontOverride=null){
 const [rx]=smoothProfile(profile,y),front=frontOverride??Math.sqrt(Math.max(.0001,1-(x/Math.max(.001,rx))**2));
 const tint=(gauss(x,.056,.024)+gauss(x,-.056,.024))*gauss(y,-.028,.023)*front*.34*D.skinBlush;
 const c=new THREE.Color('#efc0a6').lerp(new THREE.Color('#dc9385'),tint);
 c.lerp(new THREE.Color('#c99e92'),.065*(gauss(x,.036,.022)+gauss(x,-.036,.022))*gauss(y,.003,.009)*front);
 c.lerp(new THREE.Color('#df9b87'),.09*gauss(x,0,.020)*gauss(y,-.026,.022)*front);
 if(D.skinWarmth)c.lerp(new THREE.Color(D.skinWarmth>0?'#e0a58e':'#ead0be'),Math.abs(D.skinWarmth));
 if(D.skinVariation){const n=(Math.sin(x*613+y*319)*Math.sin(x*257-y*503)+Math.sin(x*1803+y*2211)*.25)*.008*D.skinVariation;c.multiplyScalar(1+n);}
 return portraitColor(c,x,y,front);
}
export function sculptedHeadPoint(x,y,z,front){
 if(front>.6)for(const s of [-1,1]){const l=eyeLayout(s),a=(x-l.cx)/l.hw;if(Math.abs(a)<1){const upper=eyeEdgeY(a,true,s),lower=eyeEdgeY(a,false,s),v=(y-lower)/Math.max(.00001,upper-lower);if(v>0&&v<1)z-=.0045*Math.sin(Math.PI*v)*(1-a*a);}}
 if(D.oralDepth>0&&front>.6){const a=x/(.0315*D.mouthWidth);if(Math.abs(a)<1){const top=mouthTop(a),bottom=mouthBottom(a),v=(y-bottom)/Math.max(.00001,top-bottom);if(v>0&&v<1)z-=.009*D.oralDepth*Math.pow(Math.sin(Math.PI*v),.55)*Math.sqrt(1-a*a);}}
 return [x,y,z];
}
