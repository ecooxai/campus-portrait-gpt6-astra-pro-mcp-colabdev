import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const suffix='gpt6-astra-pro-mcp-colabdev',root=process.cwd();
const steps=Number(process.env.CLOTH_STEPS||1000);
if(!Number.isInteger(steps)||steps<1||steps>20000)throw Error('Invalid refinement pass count');
const work=path.join(root,'.agentwork',`cloth-refinement-${suffix}`),frames=path.join(work,'frames');
await fs.mkdir(frames,{recursive:true});
const ledger=path.join(root,'.output',`cloth-refinement-${suffix}.jsonl`);
await fs.writeFile(ledger,'');
const started=new Date().toISOString(),geometryHashes=new Set(),imageHashes=new Set();
let completed=0,latest=null;
async function publish(phase){
 const state={kind:'numerical-cloth-refinement',phase,started,updatedAt:new Date().toISOString(),completed,requested:steps,uniqueGeometryStates:geometryHashes.size,uniqueRenderedImages:imageHashes.size,metrics:latest,visualReviewScore:70,visualScoreMeaning:'Last manually reviewed model score; constraint scores below are not likeness scores.',image:'/progress/cloth-latest-'+suffix+'.png',imagePath:root+'/.output/cloth-latest-'+suffix+'.png',ledgerPath:ledger};
 for(const directory of ['public/progress','/build/campus-portrait-gpt6-astra-pro-mcp-colabdev/progress']){await fs.mkdir(directory,{recursive:true});await fs.writeFile(path.join(directory,'cloth-progress.json'),JSON.stringify(state,null,2));}
 await fs.writeFile(path.join(root,'.output',`cloth-run-${suffix}.json`),JSON.stringify(state,null,2));
}
await publish('starting');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/dev/.local/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:320,height:480},deviceScaleFactor:1});
 page.on('pageerror',error=>console.error('BROWSER:',error.message));
 await page.goto('http://127.0.0.1:4197/?render=front&clothlab=1',{waitUntil:'networkidle',timeout:120000});
 await page.waitForFunction(()=>window.studio?.ready);
 await page.evaluate(()=>{window.studio.renderer.setAnimationLoop(null);window.studio.controls.enableDamping=false;window.refiner=window.studio.createClothRefiner(window.studio.root);});
 await page.screenshot({path:path.join(frames,'0000.png')});
 for(let i=1;i<=steps;i++){
  const before=Date.now();
  latest=await page.evaluate(async()=>{
   const result=window.refiner.step(),s=window.studio;s.renderer.render(s.scene,s.camera);s.renderer.getContext().finish();
   const vertices=window.refiner.mesh.geometry.getAttribute('position').array;
   const digest=await crypto.subtle.digest('SHA-256',vertices);
   return {...result,geometrySHA256:Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('')};
  });
  const file=path.join(frames,String(i).padStart(4,'0')+'.png');
  const png=await page.screenshot({path:file});
  latest.imageSHA256=createHash('sha256').update(png).digest('hex');latest.elapsedMilliseconds=Date.now()-before;latest.framePath=file;
  geometryHashes.add(latest.geometrySHA256);imageHashes.add(latest.imageSHA256);completed=i;
  await fs.appendFile(ledger,JSON.stringify({...latest,passKind:'deform-render-test',manuallyReviewed:false})+'\n');
  if(i%20===0||i===1||i===steps){
   await fs.copyFile(file,path.join(root,'.output',`cloth-latest-${suffix}.png`));
   for(const directory of ['public/progress','/build/campus-portrait-gpt6-astra-pro-mcp-colabdev/progress'])await fs.copyFile(file,path.join(directory,`cloth-latest-${suffix}.png`));
   await publish('running');console.log(`${i}/${steps} constraintScore=${latest.constraintScore.toFixed(2)} meanStrain=${latest.meanStrain.toFixed(5)} uniqueGeometry=${geometryHashes.size}`);
  }
 }
 const snapshot=await page.evaluate(()=>window.refiner.snapshot());
 await fs.writeFile(path.join(root,'.output',`cloth-candidate-${suffix}.json`),JSON.stringify(snapshot));
 await page.setViewportSize({width:768,height:1024});await page.waitForTimeout(500);
 for(const view of ['front','three-quarter','side','back']){await page.evaluate(v=>{window.studio.setView(v);window.studio.renderer.render(window.studio.scene,window.studio.camera);window.studio.renderer.getContext().finish();},view);await page.screenshot({path:path.join(root,'.output',`cloth-final-${view}-${suffix}.png`)});}
 await publish('completed-awaiting-visual-review');
 console.log(JSON.stringify({completed,uniqueGeometryStates:geometryHashes.size,uniqueRenderedImages:imageHashes.size,ledger},null,2));
}catch(error){latest={...latest,error:error.message};await publish('stopped-on-error');throw error;}finally{await browser.close();}
