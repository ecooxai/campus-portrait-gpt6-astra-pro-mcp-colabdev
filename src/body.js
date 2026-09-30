import {D} from './design.js';
import {sculptTieKnot} from './tie-knot.js';
import {adjustClothing} from './clothing-fit.js';
import {refreshAnatomy} from './anatomy.js';
import {applyReviewedCloth} from './cloth-bake.js';
import {refineGarmentFit} from './garment-fit.js';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {V,lerp,TAU,gauss,smoothProfile,mesh,sphere,surface,tube,loft,ribbon,patch,curvedClothPatch} from './geometry.js';
import {createHead} from './head.js';
import {makeMaterials} from './materials.js';
import {optimizeGroup} from './optimize.js';

function box(p,name,pos,size,r,mat){const b=mesh(p,name,new RoundedBoxGeometry(...size,3,r),mat);b.position.set(...pos);return b;}
function seamEllipse(p,name,y,rx,rz,cx,cz,mat,r=.0008){const pts=[];for(let k=0;k<=100;k++){const a=k/100*TAU;pts.push([cx+rx*Math.sin(a),y,cz+rz*Math.cos(a)]);}return tube(p,name,pts,r,mat,100,5);}
function legRows(s){const rows=s<0?[
 [.075,.029,.033,-.101,.042],[.16,.031,.034,-.096,.034],[.28,.043,.045,-.070,.016],[.365,.050,.049,-.042,.022],[.445,.046,.046,-.009,.050],[.49,.048,.051,.002,.057],[.545,.053,.057,-.001,.042],[.66,.066,.070,-.030,.009],[.79,.074,.077,-.071,-.012],[.91,.071,.074,-.075,-.012]
 ]:[
 [.075,.028,.034,.053,-.012],[.17,.031,.035,.066,-.006],[.28,.045,.046,.075,-.019],[.37,.050,.048,.079,-.024],[.445,.045,.045,.080,-.020],[.49,.047,.048,.079,-.014],[.565,.057,.060,.075,-.016],[.67,.070,.074,.072,-.024],[.80,.075,.079,.067,-.020],[.91,.070,.073,.068,-.015]
 ];
 return rows.map(row=>{const [y,rx,rz,cx,cz]=row;const ankle=Math.pow(Math.max(0,1-(y-.075)/.58),1.30);return [y,rx,rz,cx+(s>0?-.035*ankle:0),cz+(s<0?-.080*ankle+.024*gauss(y,.49,.12):.050*ankle)];});
}
function makeLegs(p,m){for(const s of [-1,1]){
 const rows=legRows(s),skinRows=rows.filter(a=>a[0]>=.37);
 loft(p,(s<0?'Left':'Right')+' continuous knee and thigh',skinRows,m.skin,{segments:64,rings:64,fold:(a,y)=>.0014*Math.sin(a*2)*gauss(y,.51,.04)});
 const top=s<0?.444:.429;
 const sockRows=rows.filter(a=>a[0]<top).map(a=>[a[0],a[1]+.0014,a[2]+.0014,...a.slice(3)]);let r=smoothProfile(rows,top);sockRows.push([top,r[0]+.0022,r[1]+.0022,r[2],r[3]]);
 loft(p,'Ribbed knee sock '+s,sockRows,m.socks,{segments:80,rings:64,fold:(a,y)=>.00055*Math.cos(a*84)+.0008*Math.cos(y*240)*gauss(y,.12,.045)});
 seamEllipse(p,'Sock elastic welt '+s,top,r[0]+.0024,r[1]+.0024,r[2],r[3],m.socks,.0018);
 const shoe=new THREE.Group();shoe.name='Penny loafer '+s;shoe.position.set(s<0?-.102:.018,0,s<0?-.035:.038);shoe.rotation.y=s<0?-.10:.035;p.add(shoe);
 const shoeRows=[[.011,.040,.095,0,.038],[.018,.046,.111,0,.039],[.030,.047,.113,0,.038],[.035,.045,.110,0,.038],[.050,.043,.106,0,.037],[.072,.041,.095,0,.031],[.092,.038,.074,0,.016],[.112,.031,.042,0,-.003],[.123,.029,.033,0,-.012]];
 loft(shoe,'Layered stitched rubber sole',shoeRows.slice(0,4),m.sole,{rings:12,segments:64});
 box(shoe,'Stacked low heel',[0,.014,-.027],[.070,.027,.063],.008,m.sole);
 loft(shoe,'Sculpted polished leather upper',shoeRows.slice(3),m.leather,{segments:80,rings:40});
 seamEllipse(shoe,'Leather welt',.035,.046,.111,0,.038,m.stitch,.0008);
 // Closed vamp and rounded toe: no image planes, entirely modeled geometry.


 const roof=(x,z)=>{let lo=.035,hi=.123;for(let it=0;it<22;it++){const y=(lo+hi)/2,[rx,rz,cx,cz]=smoothProfile(shoeRows,y);if(((x-cx)/rx)**2+((z-cz)/rz)**2<1)lo=y;else hi=y;}return (lo+hi)/2;};
 const moc=[];for(let k=0;k<=44;k++){const a=-Math.PI*.58+k/44*Math.PI*1.16,x=.034*Math.sin(a),z=.064+.066*Math.cos(a);moc.push([x,roof(x,z)+.0012,z]);}
 tube(shoe,'Raised moccasin seam',moc,.0012,m.leather,50,7);
 tube(shoe,'Vamp fine stitching',moc.map(p=>[p[0]*.970,p[1]+.0006,p[2]-.0005]),.00042,m.stitch,50,4);
 surface(shoe,'Curved penny saddle band',40,10,(u,v)=>{const x=(u*2-1)*.038,z=lerp(.049,.026,v);return {p:[x,roof(x,z)+.0022,z]};},m.leather);
 for(const z of [.049,.026]){const edge=[];for(let i=0;i<=32;i++){const x=lerp(-.038,.038,i/32);edge.push([x,roof(x,z)+.003,z]);}tube(shoe,'Saddle raised seam',edge,.0011,m.leather,34,6);}
 box(shoe,'Penny keeper slot',[0,roof(0,.037)+.0031,.037],[.015,.001,.0035],.0004,m.sole);
 seamEllipse(shoe,'Ankle collar piping',.122,.030,.034,0,-.012,m.leather,.0018);
 }}
function makeSkirt(p,m){
 const rows=[[.713,.232,.169,0,.0],[.733,.231,.166,0,0],[.79,.216,.158,0,0],[.885,.183,.133,-.002,-.003],[.967,.149,.110,-.005,-.004],[1.015,.132,.092,-.005,-.005],[1.035,.130,.090,-.005,-.005]];
 const fold=(a,y)=>{let amp=lerp(.013,.003,Math.pow((y-.713)/(.322),1.6));let t=((a/TAU*22)%1+1)%1;let z=t<.15?lerp(-1,1,t/.15):t<.66?lerp(1,.45,(t-.15)/.51):lerp(.45,-1,(t-.66)/.34);return amp*z+.0014*Math.sin(3*a+.6)*gauss(y,.82,.12);};
 loft(p,'Continuous twenty-two knife-pleat tartan skirt',rows,m.skirt,{segments:440,rings:65,fold});
 loft(p,'Covered inner skirt lining',[[.72,.220,.153,0,0],[.94,.150,.102,-.005,-.004],[1.025,.129,.089,-.005,-.005]],m.lining,{rings:24,segments:96});
 loft(p,'Fitted fabric waistband',[[1.016,.137,.098,-.005,-.005],[1.035,.136,.097,-.005,-.005],[1.044,.134,.096,-.005,-.005]],m.skirt,{rings:8,segments:100});
 const hem=[];for(let k=0;k<=440;k++){const a=k/440*TAU,f=fold(a,.716);hem.push([(.232+f)*Math.sin(a),.716,(.169+f)*Math.cos(a)]);}tube(p,'Double-turned tailored hem',hem,.0011,m.skirt,440,5);
 for(let k=0;k<22;k++){const a=(k+.17)/22*TAU,pts=[];for(let j=0;j<=20;j++){const y=lerp(.72,1.015,j/20),[rx,rz,cx,cz]=smoothProfile(rows,y),f=fold(a,y);pts.push([cx+(rx+f+.0003)*Math.sin(a),y,cz+(rz+f+.0003)*Math.cos(a)]);}tube(p,'Pleat edge topstitch '+k,pts,.00035,m.stitch,26,4);}
}
const shirtRows=[[1.023,.133,.096,-.005,-.005],[1.047,.144,.103,-.006,-.003],[1.080,.150,.106,-.007,-.002],[1.135,.149,.105,-.008,-.002],[1.198,.158,.117,-.008,-.005],[1.262,.159,.114,-.007,-.008],[1.320,.163,.100,-.006,-.011],[1.360,.151,.082,-.004,-.012],[1.393,.100,.057,0,-.01],[1.415,.047,.041,.002,-.006]];
function shirtZ(x,y){const [rx,rz,cx=0,cz=0]=smoothProfile(shirtRows,y);return cz+rz*Math.sqrt(Math.max(.03,1-((x-cx)/rx)**2));}
function makeShirt(p,m){
 surface(p,'Draped white cotton shirt with open neckline',128,100,(u,v)=>{const a=u*TAU,front=Math.max(0,Math.cos(a)),top=1.412-.075*Math.pow(front,10),y=lerp(1.023,top,v),[rx,rz,cx,cz]=smoothProfile(shirtRows,y);
 let f=(.0032*Math.sin(a*13+y*11)+.0018*Math.sin(a*23-y*18))*gauss(y,1.047,.040)+.003*Math.sin(a*9+y*68)*gauss(y,1.09,.07)+.0022*Math.sin(a*8-y*58)*gauss(y,1.30,.07);
 const x=rx*Math.sin(a),fw=Math.pow(front,5);for(const [center,slope,side,amp] of [[1.088,.24,.075,.0034],[1.109,-.30,-.075,.0031],[1.205,.15,.04,.0018],[1.27,-.5,.12,.0020]]){const line=center+slope*x;f+=fw*amp*(gauss(y,line,.005)-.50*gauss(y,line+.006,.008))*gauss(x,side,.062);}
 return {p:[cx+(rx+f)*Math.sin(a),y,cz+(rz+f)*Math.cos(a)],uv:[u,v]};},m.shirt);
 loft(p,'Anatomical neck',[[1.353,.050,.039,.002,0],[1.390,.042,.038,.003,.001],[1.425,.037,.035,.020,.002],[1.473,.037,.035,.029,.003]],m.skin,{segments:72,rings:44});
 // Open neckline and crisply folded collar points.
 const left=[[-.030,1.413,.044],[-.062,1.379,.062],[-.049,1.326,.126],[-.007,1.357,.090],[-.009,1.383,.055]];
 const right=[[.034,1.416,.044],[.066,1.382,.062],[.053,1.329,.126],[.011,1.360,.090],[.013,1.386,.055]];patch(p,'Upper chest within open collar',[[-.055,1.399,.038],[-.045,1.352,.068],[0,1.330,.087],[.045,1.352,.068],[.055,1.399,.038]],m.skin);
 for(const points of [left,right])for(const point of points){point[0]*=D.collarWidth??1;point[1]=1.38+(point[1]-1.38)*(D.collarLength??1);point[2]=lerp(point[2],shirtZ(point[0],point[1])+.006,D.collarLay||0);}
 curvedClothPatch(p,'Left folded open collar',left,m.shirt,.0016);curvedClothPatch(p,'Right folded open collar',right,m.shirt,.0016);
 for(const pts of [left,right])tube(p,'Collar edge seam',[...pts,pts[0]],.0008,m.seam,45,5);
 const placket=[];for(let j=0;j<=26;j++){const y=lerp(1.034,1.34,j/26);placket.push([-.005,y,shirtZ(-.005,y)+.003]);}
 ribbon(p,'Front shirt placket',placket,.0064,.0015,m.shirt,{segments:38,radial:8});
 for(let j=0;j<5;j++){const y=1.061+j*.055,z=shirtZ(-.005,y)+.006;sphere(p,'Mother of pearl shirt button',[-.005,y,z],[.0034,.0034,.001],m.button,20);}
 for(const s of [-1,1]){
 const sleeve=new THREE.Group();sleeve.name='Rolled shirt sleeve '+s;p.add(sleeve);
 const rows=[[1.065,.034,.043,s*.193,-.025],[1.091,.040,.047,s*.197,-.019],[1.15,.045,.051,s*.202,-.017],[1.24,.048,.056,s*.190,-.014],[1.319,.049,.057,s*.164,-.013],[1.357,.037,.042,s*.145,-.012]];
 loft(sleeve,'Soft elbow-length cotton sleeve',rows,m.shirt,{segments:80,rings:65,fold:(a,y)=>.0018*Math.sin(a*6+y*92)+.0022*Math.sin(a*3-y*47)*gauss(y,1.10,.032)});
 loft(sleeve,'Double-rolled sleeve cuff',[[1.061,.037,.047,s*.193,-.024],[1.069,.042,.050,s*.194,-.024],[1.086,.043,.051,s*.196,-.024],[1.091,.040,.048,s*.197,-.024]],m.shirt,{segments:80,rings:18,fold:(a)=>.0013*Math.sin(a*5)});
 seamEllipse(sleeve,'Cuff pressed edge',1.065,.042,.050,s*.194,-.024,m.seam,.0007);
 ribbon(p,'Rounded anatomical forearm behind waist '+s,[[s*.198,1.083,-.026],[s*.190,1.057,-.043],[s*.131,1.021,-.112],[s*.046,.989,-.146]],t=>.0315-.010*t,t=>.030-.008*t,m.skin,{segments:44,radial:24});
 makeHand(p,m,s);
 const ep=[[s*.086,1.262,shirtZ(s*.086,1.262)+.004],[s*.085,1.267,shirtZ(s*.085,1.267)+.004],[s*.091,1.271,shirtZ(s*.091,1.271)+.004],[s*.090,1.277,shirtZ(s*.090,1.277)+.004]];
 if(s>0){tube(p,'Small blue stitched shirt emblem',ep,.0012,m.embroidery,12,5);tube(p,'Emblem cross stitch',[[.083,1.269,shirtZ(.083,1.269)+.004],[.094,1.269,shirtZ(.094,1.269)+.004]],.0008,m.embroidery,4,5);}
 }
 // Neck tie is a curved cloth mesh with its own UVs and thickness border.
 ribbon(p,'Loose striped tie neckband',[[-.033,1.390,.050],[-.038,1.357,.073],[-.024,1.327,.112],[-.003,1.300,.128],[.023,1.336,.100],[.033,1.387,.053]],.0075,.0013,m.tie,{segments:54,radial:10});
 const knot=D.sculptedTie?sculptTieKnot(p,m):box(p,'Four-in-hand tie knot',[-.006,1.291,.129],[.037,.039,.021],.006,m.tieKnot);knot.rotation.z=-.08;
 const tieRows=[[.910,.0004,.151],[.936,.022,.153],[1.06,.027,.134],[1.20,.022,.129],[1.266,.012,.133]];
 surface(p,'Striped navy hanging tie',24,72,(u,v)=>{const y=lerp(.910,1.266,v),[w,z]=smoothProfile(tieRows,y),x=-.004+(u*2-1)*w*(D.tieWidth??1)+.007*Math.sin(v*4),yy=1.266-(1.266-y)*(D.tieLength??1),target=yy>=1.035?shirtZ(x,yy)+.008:.13+.02*(1.035-yy)/.125,zz=lerp(z,target,D.tieLay||0);return {p:[x,yy,zz+.004*Math.sin(u*Math.PI)],uv:[u,v]};},m.tie);
}
function makeHand(p,m,s){
 const g=new THREE.Group();g.name='Modeled hand behind back '+s;g.position.set(s*.027,.980+(s<0?-.006:0),-.149+(s<0?-.016:0));g.rotation.set(-.18,0,-s*.72);p.add(g);
 sphere(g,'Palm',[0,-.026,0],[.023,.040,.012],m.skin,32);
 for(let i=0;i<4;i++){let x=(i-1.5)*.011,len=[.037,.045,.043,.033][i];ribbon(g,'Finger '+i,[[x,-.047,0],[x,-.057-len*.35,-.004],[x*.92,-.049-len,-.009]],t=>.0049*(1-.24*t),t=>.0045*(1-.18*t),m.skin,{segments:14,radial:8});sphere(g,'Rounded fingertip',[x*.92,-.049-len,-.009],[.0038,.004,.0038],m.skin,16);}
 ribbon(g,'Bent thumb',[[s*.020,-.008,.001],[s*.032,-.023,-.003],[s*.029,-.046,-.006]],t=>.007*(1-.3*t),.006,m.skin,{segments:18,radial:10});
}
function makeBackpack(p,m){
 const g=new THREE.Group();g.name='Navy backpack';p.add(g);
 const bagRows=[[1.064,.068,.030],[1.082,.117,.052],[1.165,.138,.066],[1.300,.137,.066],[1.367,.114,.057],[1.405,.043,.025],[1.411,.002,.002]];
 surface(g,'Soft shaped canvas backpack',96,64,(u,v)=>{const y=lerp(1.064,1.411,v),[rx,rz]=smoothProfile(bagRows,y),a=u*TAU,sn=Math.sin(a),cs=Math.cos(a),f=.0012*Math.sin(a*9+y*64)*gauss(y,1.12,.052);return {p:[(rx+f)*Math.sign(sn)*Math.pow(Math.abs(sn),.70),y,-.176+(rz+f)*Math.sign(cs)*Math.pow(Math.abs(cs),.70)],uv:[u,v]};},m.backpack);
 box(g,'Backpack lower outer pocket',[0,1.163,-.248],[.231,.133,.034],.022,m.backpack);
 const zip=[[-.112,1.205,-.270],[-.096,1.220,-.270],[0,1.224,-.270],[.096,1.220,-.270],[.112,1.205,-.270]];
 const mainZip=[[-.113,1.093,-.222],[-.128,1.22,-.224],[-.118,1.335,-.223],[-.083,1.384,-.213],[0,1.410,-.179],[.083,1.384,-.213],[.118,1.335,-.223],[.128,1.22,-.224],[.113,1.093,-.222]];tube(g,'Main backpack zipper welt',mainZip,.0017,m.webbing,70,7);box(g,'Main zipper pull',[.114,1.346,-.229],[.007,.022,.004],.001,m.metal);
 tube(g,'Pocket zipper piping',zip,.0021,m.webbing,44,8);
 box(g,'Silver zip pull',[.064,1.214,-.272],[.007,.020,.003],.001,m.metal);
 tube(g,'Backpack top handle',[[-.043,1.407,-.163],[-.030,1.440,-.164],[.030,1.440,-.164],[.043,1.407,-.163]],.005,m.webbing,28,8);
 for(const s of [-1,1]){
 ribbon(g,'Padded shoulder strap '+s,[[s*.085,1.347,-.129],[s*.116,1.352,-.063],[s*.136,1.334,shirtZ(s*.136,1.334)+.006],[s*.139,1.280,shirtZ(s*.139,1.280)+.006],[s*.142,1.213,shirtZ(s*.142,1.213)+.006]],.017,.004,m.backpack,{segments:46,radial:12});
 ribbon(g,'Adjustable webbing strap '+s,[[s*.142,1.235,shirtZ(s*.142,1.235)+.010],[s*.146,1.185,shirtZ(s*.146,1.185)+.006],[s*.145,1.109,.036],[s*.140,1.064,.021],[s*.118,1.083,-.140]],.009,.002,m.webbing,{segments:40,radial:8});
 const bz=shirtZ(s*.142,1.236)+.014;
 box(g,'Strap ladder buckle '+s,[s*.142,1.236,bz],[.028,.036,.008],.005,m.buckle);
 for(let y of [1.225,1.237,1.247])box(g,'Buckle rail '+s,[s*.142,y,bz+.006],[.025,.0035,.004],.001,m.webbing);
 tube(g,'Backpack side seam '+s,[[s*.131,1.111,-.204],[s*.137,1.234,-.205],[s*.103,1.360,-.216]],.0009,m.stitch,32,5);
 }
}
export function createCharacter(options={}){
 refreshAnatomy();
 const root=new THREE.Group();root.name='Campus portrait | GPT-6 Astra Pro | mcp-colabdev';const m=makeMaterials();
 makeLegs(root,m);makeSkirt(root,m);makeShirt(root,m);makeBackpack(root,m);if(!options.clothLab){applyReviewedCloth(root);refineGarmentFit(root);adjustClothing(root);}const head=createHead(root,m);
 root.userData={...root.userData,description:'Original hand-authored procedural three-dimensional interpretation of the supplied clothing and stance. Unseen views are inferred.',author:'GPT-6 Astra Pro / mcp-colabdev',units:'meters',rigged:false};
 root.updateMatrixWorld(true);optimizeGroup(head);if(options.clothLab){const shirt=root.getObjectByName('Draped white cotton shirt with open neckline');root.remove(shirt);optimizeGroup(root,head);root.add(shirt);}else optimizeGroup(root,head);return {root,head,materials:m};
}
