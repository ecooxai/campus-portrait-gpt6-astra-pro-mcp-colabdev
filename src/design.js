import state from './design-state.json';
const defaults={...state};
/** Explicit lab rebuilds share a renderer; the persistent JSON is the editable source of each candidate. */
export const D={...defaults};
export function replaceDesign(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Design must be an object');
 const clean={};for(const [key,value] of Object.entries(input)){
  if(!/^[A-Za-z][A-Za-z0-9]*$/.test(key)||['constructor','prototype'].includes(key))throw new Error('Invalid design key');
  if(['label','campaign'].includes(key)){if(typeof value!=='string'||value.length>180)throw new Error('Invalid design label');clean[key]=value;}
  else if(key==='candidate'){if(!Number.isInteger(value)||value<0||value>1000000)throw new Error('Invalid candidate identifier');clean[key]=value;}
  else{if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>10)throw new Error('Invalid numeric design control: '+key);clean[key]=value;}
 }
 for(const key of Object.keys(D))delete D[key];Object.assign(D,defaults,clean);return D;
}
