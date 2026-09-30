import * as THREE from 'three';
import {D} from './design.js';
import {sphere,tube} from './geometry.js';

/** Subtle modeled nails and joint creases for the existing clasped-hand pose. */
export function addHandDetails(group,m,side){
 if(!D.handDetail)return;
 if(!m.nail){m.nail=new THREE.MeshPhysicalMaterial({name:'Natural unpolished nail',color:'#e7cab9',roughness:.48,clearcoat:.12,specularIntensity:.45});}
 if(!m.handCrease){m.handCrease=new THREE.MeshStandardMaterial({name:'Subtle hand crease',color:'#d4aa94',roughness:.85});}
 const lengths=[.037,.045,.043,.033];
 for(let i=0;i<4;i++){
  const x=(i-1.5)*.011,len=lengths[i],end=-.049-len;
  sphere(group,'Modeled fingernail '+side+' '+i,[x*.94,end+.008,-.0131],[.0028,.0058,.00050],m.nail,24);
  if(D.handDetail>0.5){
   const y=-.054-len*.32;
   tube(group,'Fine finger-joint crease '+side+' '+i,[[x-.0028,y,-.0080],[x,y-.0004,-.0087],[x+.0028,y,-.0080]],.00012,m.handCrease,8,5);
  }
 }
 sphere(group,'Modeled thumbnail '+side,[side*.029,-.039,-.012],[.0030,.0048,.00045],m.nail,24);
}
