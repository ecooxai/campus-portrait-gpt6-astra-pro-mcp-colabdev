import * as THREE from 'three';
import {D} from './design.js';
function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function texture(canvas){const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}

/** Original pore relief and low-amplitude roughness variation, using portable glTF textures. */
export function refineSkinSurface(m){
 const detail=D.skinPores||0;
 for(const mat of [m.skin,m.face]){mat.roughness=Math.min(.95,.56*(D.skinRoughness||1));mat.specularIntensity=D.skinSpecular??1;}
 if(D.skinWarmth)m.skin.color.lerp(new THREE.Color(D.skinWarmth>0?'#e0a58e':'#ead0be'),Math.abs(D.skinWarmth));
 if(detail<=0)return;
 const size=512,rng=random(987234),height=new Float32Array(size*size);
 for(let k=0;k<15000;k++){
  const x=rng()*size,y=rng()*size,r=.8+rng()*1.5,depth=(.010+rng()*.03)*detail,fx=x-Math.floor(x),fy=y-Math.floor(y);
  for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
   const ix=(Math.floor(x)+dx+size)%size,iy=(Math.floor(y)+dy+size)%size,rr=(dx-fx)**2+(dy-fy)**2;
   if(rr<r*r*5)height[iy*size+ix]-=depth*Math.exp(-rr/(r*r));
  }
 }
 const normalCanvas=document.createElement('canvas');normalCanvas.width=normalCanvas.height=size;
 const roughCanvas=document.createElement('canvas');roughCanvas.width=roughCanvas.height=size;
 const nc=normalCanvas.getContext('2d'),rc=roughCanvas.getContext('2d'),normal=nc.createImageData(size,size),rough=rc.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,dx=(height[y*size+(x+1)%size]-height[y*size+(x+size-1)%size])*2,dy=(height[((y+1)%size)*size+x]-height[((y+size-1)%size)*size+x])*2,len=Math.hypot(dx,dy,1);
  normal.data[i]=Math.round((.5-dx/len*.5)*255);normal.data[i+1]=Math.round((.5-dy/len*.5)*255);normal.data[i+2]=Math.round((.5+.5/len)*255);normal.data[i+3]=255;
  const value=Math.round(244+4*Math.sin(x*.09+y*.06)*Math.sin(y*.11-x*.04));rough.data[i]=rough.data[i+1]=rough.data[i+2]=value;rough.data[i+3]=255;
 }
 nc.putImageData(normal,0,0);rc.putImageData(rough,0,0);
 const n=texture(normalCanvas),r=texture(roughCanvas);n.repeat.set(3,3);r.repeat.set(2,2);
 for(const mat of [m.skin,m.face]){mat.normalMap=n;mat.normalScale.set(1,1);mat.roughnessMap=r;mat.metalnessMap=r;mat.needsUpdate=true;}
}
