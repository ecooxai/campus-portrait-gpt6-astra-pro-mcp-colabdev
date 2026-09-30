import * as THREE from 'three';
import {D} from './design.js';
import {loft,gauss} from './geometry.js';

/** A softly folded, tapered four-in-hand knot instead of a rounded rectangular block. */
export function sculptTieKnot(parent,materials){
 const knot=new THREE.Group();knot.name='Sculpted four-in-hand knot';knot.position.set(-.006,1.291,.129);knot.rotation.z=-.08;
 const width=D.knotWidth??1,scale=D.knotScale??1;
 const rows=[[-.027,.001,.001],[-.024,.009,.007],[-.019,.012,.008],[.013,.023,.010],[.022,.020,.009],[.025,.001,.001]].map(([y,x,z])=>[y*scale,x*width,z,0,0]);
 loft(knot,'Folded tapered tie cloth',rows,materials.tieKnot,{segments:64,rings:42,fold:(a,y)=>-.0014*(D.knotCrease??1)*gauss(Math.sin(a),0,.23)*Math.max(0,Math.cos(a))*gauss(y,-.010,.014)});
 parent.add(knot);return knot;
}
