import {D} from './design.js';
import {lerp,TAU} from './geometry.js';

/** Concentrate vertices on the visible facial planes instead of the covered rear skull. */
export function faceDomain(u,v,lowestY){
 if(!D.adaptiveFace)return {angle:u*TAU,y:lerp(lowestY,.143,v)};
 const half=Math.min(u,1-u),split=.37;
 let angle=half<split?1.18*half/split:1.18+(Math.PI-1.18)*(half-split)/(.5-split);
 if(u>.5)angle=-angle;
 let y;if(v<.10)y=lerp(lowestY,-.080,v/.10);else if(v<.80)y=lerp(-.080,.060,(v-.10)/.70);else y=lerp(.060,.143,(v-.80)/.20);
 return {angle,y};
}
