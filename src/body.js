import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {V,lerp,TAU,gauss,smoothProfile,mesh,sphere,surface,tube,loft,ribbon,patch} from './geometry.js';
import {createHead} from './head.js';
import {makeMaterials} from './materials.js';

function box(p,name,pos,size,r,mat){const b=mesh(p,name,new RoundedBoxGeometry(...size,3,r),mat);b.position.set(...pos);return b;}
function seamEllipse(p,name,y,rx,rz,cx,cz,mat,r=.0008){const pts=[];for(let k=0;k<=100;k++){const a=k/100*TAU;pts.push([cx+rx*Math.sin(a),y,cz+rz*Math.cos(a)]);}return tube(p,name,pts,r,mat,100,5);}
function legRows(s){return s<0?[
 [.075,.029,.033,-.101,.042],[.16,.031,.034,-.096,.034],[.28,.043,.045,-.070,.016],[.365,.050,.049,-.042,.022],[.445,.046,.046,-.009,.050],[.49,.048,.051,.002,.057],[.545,.053,.057,-.001,.042],[.66,.066,.070,-.030,.009],[.79,.074,.077,-.071,-.012],[.91,.071,.074,-.075,-.012]
 ]:[
 [.075,.028,.034,.053,-.012],[.17,.031,.035,.066,-.006],[.28,.045,.046,.075,-.019],[.37,.050,.048,.079,-.024],[.445,.045,.045,.080,-.020],[.49,.047,.048,.079,-.014],[.565,.057,.060,.075,-.016],[.67,.070,.074,.072,-.024],[.80,.075,.079,.067,-.020],[.91,.070,.073,.068,-.015]
 ];}
function makeLegs(p,m){for(const s of [-1,1]){
 const rows=legRows(s),skinRows=rows.filter(a=>a[0]>=.37);
 loft(p,(s<0?'Left':'Right')+' continuous knee and thigh',skinRows,m.skin,{segments:64,rings:64,fold:(a,y)=>.0014*Math.sin(a*2)*gauss(y,.51,.04)});
 const top=s<0?.444:.429;
 const sockRows=rows.filter(a=>a[0]<top).map(a=>[a[0],a[1]+.0014,a[2]+.0014,...a.slice(3)]);let r=smoothProfile(rows,top);sockRows.push([top,r[0]+.0022,r[1]+.0022,r[2],r[3]]);
 loft(p,'Ribbed knee sock '+s,sockRows,m.socks,{segments:80,rings:64,fold:(a,y)=>.00055*Math.cos(a*84)+.0008*Math.cos(y*240)*gauss(y,.12,.045)});
 seamEllipse(p,'Sock elastic welt '+s,top,r[0]+.0024,r[1]+.0024,r[2],r[3],m.socks,.0018);
 const shoe=new THREE.Group();shoe.name='Penny loafer '+s;shoe.position.set(s<0?-.102:.053,0,s<0?.045:-.012);shoe.rotation.y=s<0?-.13:.075;p.add(shoe);
 const shoeRows=[[.011,.040,.095,0,.038],[.018,.046,.111,0,.039],[.030,.047,.113,0,.038],[.035,.045,.110,0,.038],[.050,.043,.106,0,.037],[.072,.041,.095,0,.031],[.092,.038,.074,0,.016],[.112,.031,.042,0,-.003],[.123,.029,.033,0,-.012]];
 loft(shoe,'Layered stitched rubber sole',shoeRows.slice(0,4),m.sole,{rings:12,segments:64});
 box(shoe,'Stacked low heel',[0,.014,-.027],[.070,.027,.063],.008,m.sole);
 loft(shoe,'Sculpted polished leather upper',shoeRows.slice(3),m.leather,{segments:80,rings:40});
 seamEllipse(shoe,'Leather welt',.035,.046,.111,0,.038,m.stitch,.0008);
 // Closed vamp and rounded toe: no image planes, entirely modeled geometry.
 sphere(shoe,'Rounded toe vamp',[0,.059,.089],[.042,.024,.065],m.leather,48);
 sphere(shoe,'Instep tongue',[0,.089,.025],[.032,.014,.055],m.leather,40);
 const moc=[];for(let k=0;k<=42;k++){const a=-Math.PI*.58+k/42*Math.PI*1.16;moc.push([.035*Math.sin(a),.080-.014*Math.cos(a),.064+.066*Math.cos(a)]);}tube(shoe,'Raised moccasin seam',moc,.0016,m.leather,50,7);
 tube(shoe,'Vamp fine stitching',moc.map(p=>[p[0]*.966,p[1]+.0013,p[2]-.0006]),.00048,m.stitch,50,4);
 ribbon(shoe,'Penny saddle band',[[-.038,.076,.029],[-.025,.095,.037],[0,.103,.041],[.025,.095,.037],[.038,.076,.029]],.012,.0018,m.leather,{segments:32,radial:10});
 box(shoe,'Penny keeper slot',[0,.105,.041],[.014,.0011,.003],.0005,m.sole);
 seamEllipse(shoe,'Ankle collar piping',.122,.030,.034,0,-.012,m.leather,.0018);
 }}
function makeSkirt(p,m){
 const rows=[[.713,.232,.169,0,.0],[.733,.231,.166,0,0],[.79,.216,.158,0,0],[.885,.183,.133,-.002,-.003],[.967,.149,.110,-.005,-.004],[1.015,.132,.092,-.005,-.005],[1.035,.130,.090,-.005,-.005]];
 const fold=(a,y)=>{let amp=lerp(.013,.003,Math.pow((y-.713)/(.322),1.6));let t=((a/TAU*22)%1+1)%1;let z=t<.15?lerp(-1,1,t/.15):t<.66?lerp(1,.45,(t-.15)/.51):lerp(.45,-1,(t-.66)/.34);return amp*z+.0014*Math.sin(3*a+.6)*gauss(y,.82,.12);};
 loft(p,'Continuous twenty-two knife-pleat tartan skirt',rows,m.skirt,{segments:440,rings:65,fold});
 loft(p,'Covered inner skirt lining',[[.72,.220,.153,0,0],[.94,.150,.102,-.005,-.004],[1.025,.129,.089,-.005,-.005]],m.lining,{rings:24,segments:96});
 loft(p,'Fitted fabric waistband',[[1.016,.133,.094,-.005,-.005],[1.035,.132,.092,-.005,-.005],[1.044,.127,.090,-.005,-.005]],m.skirt,{rings:8,segments:100});
 const hem=[];for(let k=0;k<=440;k++){const a=k/440*TAU,f=fold(a,.716);hem.push([(.232+f)*Math.sin(a),.716,(.169+f)*Math.cos(a)]);}tube(p,'Double-turned tailored hem',hem,.0011,m.skirt,440,5);
 for(let k=0;k<22;k++){const a=(k+.17)/22*TAU,pts=[];for(let j=0;j<=20;j++){const y=lerp(.72,1.015,j/20),[rx,rz,cx,cz]=smoothProfile(rows,y),f=fold(a,y);pts.push([cx+(rx+f+.0003)*Math.sin(a),y,cz+(rz+f+.0003)*Math.cos(a)]);}tube(p,'Pleat edge topstitch '+k,pts,.00035,m.stitch,26,4);}
}
const shirtRows=[[1.023,.133,.096,-.005,-.005],[1.047,.144,.103,-.006,-.003],[1.080,.150,.106,-.007,-.002],[1.135,.149,.105,-.008,-.002],[1.198,.158,.117,-.008,-.005],[1.262,.173,.119,-.007,-.008],[1.320,.179,.105,-.006,-.011],[1.360,.162,.083,-.004,-.012],[1.393,.100,.057,0,-.01],[1.415,.047,.041,.002,-.006]];
function shirtZ(x,y){const [rx,rz,cx=0,cz=0]=smoothProfile(shirtRows,y);return cz+rz*Math.sqrt(Math.max(.03,1-((x-cx)/rx)**2));}
function makeShirt(p,m){
 surface(p,'Draped white cotton shirt with open neckline',128,100,(u,v)=>{const a=u*TAU,front=Math.max(0,Math.cos(a)),top=1.412-.075*Math.pow(front,10),y=lerp(1.023,top,v),[rx,rz,cx,cz]=smoothProfile(shirtRows,y);
 const f=(.0032*Math.sin(a*13+y*11)+.0018*Math.sin(a*23-y*18))*gauss(y,1.047,.040)+.003*Math.sin(a*9+y*68)*gauss(y,1.09,.07)+.0022*Math.sin(a*8-y*58)*gauss(y,1.30,.07);
 return {p:[cx+(rx+f)*Math.sin(a),y,cz+(rz+f)*Math.cos(a)],uv:[u,v]};},m.shirt);
 loft(p,'Anatomical neck',[[1.353,.050,.039,.002,0],[1.390,.042,.038,.003,.001],[1.425,.037,.035,.005,.002],[1.473,.037,.035,.006,.003]],m.skin,{segments:72,rings:44});
 // Open neckline and crisply folded collar points.
 const left=[[-.012,1.335,.116],[-.053,1.363,.074],[-.052,1.406,.032],[-.032,1.427,.036],[.000,1.371,.051]];
 const right=[[.008,1.335,.117],[.053,1.363,.075],[.050,1.406,.032],[.029,1.427,.036],[.001,1.371,.052]];
 patch(p,'Left folded open collar',left,m.shirt);patch(p,'Right folded open collar',right,m.shirt);
 for(const pts of [left,right])tube(p,'Collar edge seam',[...pts,pts[0]],.0008,m.seam,45,5);
 const placket=[];for(let j=0;j<=26;j++){const y=lerp(1.034,1.34,j/26);placket.push([-.005,y,shirtZ(-.005,y)+.003]);}
 ribbon(p,'Front shirt placket',placket,.0064,.0015,m.shirt,{segments:38,radial:8});
 for(let j=0;j<5;j++){const y=1.061+j*.055,z=shirtZ(-.005,y)+.006;sphere(p,'Mother of pearl shirt button',[-.005,y,z],[.0034,.0034,.001],m.button,20);}
 for(const s of [-1,1]){
 const sleeve=new THREE.Group();sleeve.name='Rolled shirt sleeve '+s;p.add(sleeve);
 const rows=[[1.065,.039,.047,s*.211,-.025],[1.091,.046,.052,s*.219,-.019],[1.15,.053,.057,s*.223,-.017],[1.24,.055,.061,s*.208,-.014],[1.319,.054,.062,s*.177,-.013],[1.357,.040,.044,s*.155,-.012]];
 loft(sleeve,'Soft elbow-length cotton sleeve',rows,m.shirt,{segments:80,rings:65,fold:(a,y)=>.0018*Math.sin(a*6+y*92)+.0022*Math.sin(a*3-y*47)*gauss(y,1.10,.032)});
 loft(sleeve,'Double-rolled sleeve cuff',[[1.061,.041,.050,s*.211,-.024],[1.069,.047,.054,s*.213,-.024],[1.086,.048,.055,s*.216,-.024],[1.091,.044,.052,s*.217,-.024]],m.shirt,{segments:80,rings:18,fold:(a)=>.0013*Math.sin(a*5)});
 seamEllipse(sleeve,'Cuff pressed edge',1.065,.046,.054,s*.213,-.024,m.seam,.0007);
 loft(p,'Forearm behind waist '+s,[[.988,.026,.027,s*.145,-.130],[1.02,.029,.029,s*.180,-.086],[1.061,.031,.032,s*.208,-.028],[1.095,.032,.034,s*.215,-.020]],m.skin,{segments:48,rings:36});
 makeHand(p,m,s);
 const ep=[[s*.086,1.262,shirtZ(s*.086,1.262)+.004],[s*.085,1.267,shirtZ(s*.085,1.267)+.004],[s*.091,1.271,shirtZ(s*.091,1.271)+.004],[s*.090,1.277,shirtZ(s*.090,1.277)+.004]];
 if(s>0){tube(p,'Small blue stitched shirt emblem',ep,.0012,m.embroidery,12,5);tube(p,'Emblem cross stitch',[[.083,1.269,shirtZ(.083,1.269)+.004],[.094,1.269,shirtZ(.094,1.269)+.004]],.0008,m.embroidery,4,5);}
 }
 // Neck tie is a curved cloth mesh with its own UVs and thickness border.
 ribbon(p,'Loose striped tie neckband',[[-.039,1.397,.053],[-.061,1.351,.090],[-.033,1.320,.116],[-.004,1.300,.128],[.040,1.336,.110],[.047,1.394,.053]],.011,.0018,m.tie,{segments:54,radial:10});
 const knot=box(p,'Four-in-hand tie knot',[-.006,1.291,.129],[.037,.039,.021],.006,m.tie);knot.rotation.z=-.08;
 const tieRows=[[.910,.0004,.151],[.936,.022,.153],[1.06,.027,.143],[1.20,.022,.140],[1.266,.012,.142]];
 surface(p,'Striped navy hanging tie',24,72,(u,v)=>{const y=lerp(.910,1.266,v),[w,z]=smoothProfile(tieRows,y),x=-.004+(u*2-1)*w+.007*Math.sin(v*4);return {p:[x,y,z+.004*Math.sin(u*Math.PI)],uv:[u,v]};},m.tie);
}
function makeHand(p,m,s){
 const g=new THREE.Group();g.name='Modeled hand behind back '+s;g.position.set(s*.133,.987,-.145);g.rotation.set(.12,0,s*.58);p.add(g);
 sphere(g,'Palm',[0,-.026,0],[.023,.040,.012],m.skin,32);
 for(let i=0;i<4;i++){let x=(i-1.5)*.011,len=[.037,.045,.043,.033][i];ribbon(g,'Finger '+i,[[x,-.047,0],[x,-.057-len*.35,-.004],[x*.92,-.049-len,-.009]],t=>.0049*(1-.24*t),t=>.0045*(1-.18*t),m.skin,{segments:14,radial:8});sphere(g,'Rounded fingertip',[x*.92,-.049-len,-.009],[.0038,.004,.0038],m.skin,16);}
 ribbon(g,'Bent thumb',[[s*.020,-.008,.001],[s*.032,-.023,-.003],[s*.029,-.046,-.006]],t=>.007*(1-.3*t),.006,m.skin,{segments:18,radial:10});
}
function makeBackpack(p,m){
 const g=new THREE.Group();g.name='Navy backpack';p.add(g);
 box(g,'Padded backpack main compartment',[0,1.246,-.177],[.273,.339,.121],.047,m.backpack);
 box(g,'Backpack lower outer pocket',[0,1.163,-.248],[.231,.133,.034],.022,m.backpack);
 const zip=[[-.112,1.205,-.270],[-.096,1.220,-.270],[0,1.224,-.270],[.096,1.220,-.270],[.112,1.205,-.270]];
 tube(g,'Pocket zipper piping',zip,.0021,m.webbing,44,8);
 box(g,'Silver zip pull',[.064,1.214,-.272],[.007,.020,.003],.001,m.metal);
 tube(g,'Backpack top handle',[[-.043,1.407,-.163],[-.030,1.440,-.164],[.030,1.440,-.164],[.043,1.407,-.163]],.005,m.webbing,28,8);
 for(const s of [-1,1]){
 ribbon(g,'Padded shoulder strap '+s,[[s*.083,1.408,-.167],[s*.141,1.383,-.073],[s*.157,1.348,.049],[s*.151,1.28,.101],[s*.149,1.213,.107]],.018,.006,m.backpack,{segments:46,radial:12});
 ribbon(g,'Adjustable webbing strap '+s,[[s*.149,1.235,.110],[s*.153,1.185,.112],[s*.158,1.109,.092],[s*.151,1.063,.031],[s*.129,1.094,-.140]],.010,.002,m.webbing,{segments:40,radial:8});
 const buck=box(g,'Strap ladder buckle '+s,[s*.150,1.236,.119],[.029,.041,.009],.006,m.buckle);buck.rotation.z=s*.04;
 for(let y of [1.224,1.238,1.248])box(g,'Buckle rail '+s,[s*.150,y,.126],[.027,.004,.005],.001,m.webbing);
 tube(g,'Backpack side seam '+s,[[s*.131,1.111,-.204],[s*.137,1.234,-.205],[s*.121,1.381,-.201]],.0009,m.stitch,32,5);
 }
}
export function createCharacter(){
 const root=new THREE.Group();root.name='Campus portrait | GPT-6 Astra Pro | mcp-colabdev';const m=makeMaterials();
 makeLegs(root,m);makeSkirt(root,m);makeShirt(root,m);makeBackpack(root,m);const head=createHead(root,m);
 root.userData={description:'Original hand-authored procedural three-dimensional interpretation of the supplied clothing and stance. Unseen views are inferred.',author:'GPT-6 Astra Pro / mcp-colabdev',units:'meters',rigged:false};
 return {root,head,materials:m};
}
