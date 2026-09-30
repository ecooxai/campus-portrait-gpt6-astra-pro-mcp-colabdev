/** Bounded position-based constraints operating only on authored garment vertices. */
export function distanceConstraint(p,a,b,length,wa,wb,stiffness){
 const total=wa+wb;if(total===0)return;
 const x=p[b]-p[a],y=p[b+1]-p[a+1],z=p[b+2]-p[a+2];
 const actual=Math.hypot(x,y,z);if(actual<1e-12)return;
 const scale=(actual-length)/actual*stiffness/total;
 p[a]+=x*scale*wa;p[a+1]+=y*scale*wa;p[a+2]+=z*scale*wa;
 p[b]-=x*scale*wb;p[b+1]-=y*scale*wb;p[b+2]-=z*scale*wb;
}
export function buildGridConstraints(rest,columns,rows){
 const edges=[],stride=columns+1;
 function add(a,b,k){const x=rest[b*3]-rest[a*3],y=rest[b*3+1]-rest[a*3+1],z=rest[b*3+2]-rest[a*3+2];edges.push({a,b,length:Math.hypot(x,y,z),stiffness:k});}
 for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){
  const id=j*stride+i;
  if(i<columns)add(id,id+1,.84);if(j<rows)add(id,id+stride,.88);
  if(i<columns&&j<rows){add(id,id+stride+1,.28);add(id+1,id+stride,.28);}
  if(i+2<=columns)add(id,id+2,.05);if(j+2<=rows)add(id,id+stride*2,.04);
 }
 return edges;
}
export function constrainDisplacement(p,rest,k,maxDistance){
 const x=p[k]-rest[k],y=p[k+1]-rest[k+1],z=p[k+2]-rest[k+2],d=Math.hypot(x,y,z);
 if(d>maxDistance){const s=maxDistance/d;p[k]=rest[k]+x*s;p[k+1]=rest[k+1]+y*s;p[k+2]=rest[k+2]+z*s;}
}
