import * as THREE from 'three';
export const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
export const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp,TAU=Math.PI*2;
export const gauss=(x,c,s)=>Math.exp(-Math.pow((x-c)/s,2));
export function smoothProfile(rows,t){
 if(t<=rows[0][0])return rows[0].slice(1);if(t>=rows.at(-1)[0])return rows.at(-1).slice(1);
 let i=0;while(rows[i+1][0]<t)i++;const p=rows[i],q=rows[i+1],h=q[0]-p[0],u=(t-p[0])/h;
 return p.slice(1).map((value,k)=>{const c=k+1,d=(q[c]-p[c])/h;let m0=d,m1=d;
 if(i>0){const hp=p[0]-rows[i-1][0],dp=(p[c]-rows[i-1][c])/hp;m0=dp*d<=0?0:(2*h+hp+h+2*hp)/((2*h+hp)/dp+(h+2*hp)/d);}
 if(i+2<rows.length){const hn=rows[i+2][0]-q[0],dn=(rows[i+2][c]-q[c])/hn;m1=dn*d<=0?0:(2*hn+h+hn+2*h)/((2*hn+h)/d+(hn+2*h)/dn);}
 return (2*u*u*u-3*u*u+1)*p[c]+(u*u*u-2*u*u+u)*h*m0+(-2*u*u*u+3*u*u)*q[c]+(u*u*u-u*u)*h*m1;
 });
}
export function mesh(parent,name,geometry,material){const m=new THREE.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function sphere(parent,name,pos,scale,mat,segments=40){const m=mesh(parent,name,new THREE.SphereGeometry(1,segments,segments>40?24:20),mat);m.position.set(...pos);m.scale.set(...scale);return m;}
export function surface(parent,name,nu,nv,fn,material){
 if(nu>64)nu=Math.ceil(nu*.75);if(nv>36)nv=Math.ceil(nv*.75);
 const p=[],uv=[],idx=[],cols=[];
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const a=fn(i/nu,j/nv);p.push(...a.p);uv.push(...(a.uv||[i/nu,j/nv]));if(a.c)cols.push(...a.c);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;idx.push(a,b,c,b,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));if(cols.length)g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.setIndex(idx);g.computeVertexNormals();return mesh(parent,name,g,material);
}
export function tube(parent,name,points,r,mat,segments=40,radial=8){const curve=new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?V(...p):p));return mesh(parent,name,new THREE.TubeGeometry(curve,segments,r,radial,false),mat);}
export function loft(parent,name,rows,mat,opts={}){
 const {segments=96,rings=80,fold=()=>0,color=null}=opts,lo=rows[0][0],hi=rows.at(-1)[0];
 return surface(parent,name,segments,rings,(u,v)=>{const y=lerp(lo,hi,v),[rx,rz,cx=0,cz=0]=smoothProfile(rows,y),a=u*TAU;const f=fold(a,y,v),x=cx+(rx+f)*Math.sin(a),z=cz+(rz+f)*Math.cos(a);return {p:[x,y,z],uv:[u,v],...(color?{c:color(x,y,z)}:{})};},mat);
}
export function ribbon(parent,name,points,width,depth,mat,opts={}){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p))),seg=opts.segments||44,radial=opts.radial||12;
 const w=typeof width==='function'?width:()=>width,d=typeof depth==='function'?depth:()=>depth;
 return surface(parent,name,radial,seg,(u,t)=>{const p=curve.getPoint(t),tang=curve.getTangent(t).normalize();let side=new THREE.Vector3().crossVectors(tang,V(0,0,1)).normalize();if(side.lengthSq()<.1)side=V(1,0,0);const normal=new THREE.Vector3().crossVectors(side,tang).normalize(),a=-u*TAU;p.addScaledVector(side,Math.cos(a)*w(t)).addScaledVector(normal,Math.sin(a)*d(t));return {p:p.toArray(),uv:[u,t]};},mat);
}
export function patch(parent,name,outline,mat){const center=outline.reduce((a,p)=>a.add(V(...p)),V()).multiplyScalar(1/outline.length),vertices=[...center.toArray(),...outline.flat()],indices=[];for(let i=0;i<outline.length;i++)indices.push(0,i+1,(i+1)%outline.length+1);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute([.5,.5,...outline.flatMap(p=>[p[0]*5+.5,p[1]*5])],2));g.setIndex(indices);g.computeVertexNormals();return mesh(parent,name,g,mat);}
