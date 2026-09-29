import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {validateBytes} from 'gltf-validator';
const root=process.cwd(),suffix='gpt6-astra-pro-mcp-colabdev';
const out=path.join(root,'.output'),pub=path.join(root,'public/progress');await fs.mkdir(out,{recursive:true});
const args=process.argv.slice(2),rev=Number(args.find(a=>a.startsWith('--revision='))?.split('=')[1]||1);
const views=(args.find(a=>a.startsWith('--views='))?.split('=')[1]||'front,three-quarter,side,back,face').split(',');
const archive=path.join(root,'.agentwork','reviews',`r${String(rev).padStart(3,'0')}-${suffix}`);await fs.mkdir(archive,{recursive:true});
const report={revision:rev,timestamp:new Date().toISOString(),errors:[],warnings:[],views:[]};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/dev/.local/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:768,height:1024},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')report.errors.push(msg.text());if(msg.type()==='warning')report.warnings.push(msg.text());});
 await page.goto('http://127.0.0.1:4186/?render=front',{waitUntil:'networkidle',timeout:120000});await page.waitForFunction(()=>window.studio?.ready,{timeout:120000});
 report.stats=await page.evaluate(()=>window.studio.stats());
 for(const view of views){await page.evaluate(v=>window.studio.setView(v),view);await page.waitForTimeout(450);const filename=`${view}-${suffix}.png`;await page.screenshot({path:path.join(out,filename)});await fs.copyFile(path.join(out,filename),path.join(pub,filename));await fs.copyFile(path.join(out,filename),path.join(archive,filename));report.views.push(filename);console.log('Rendered '+view);}
 if(!args.includes('--no-export')){const event=page.waitForEvent('download',{timeout:120000});await page.evaluate(()=>window.studio.exportModel());const download=await event;const model=path.join(out,`campus-portrait-${suffix}.glb`);await download.saveAs(model);await fs.copyFile(model,path.join(root,'public/exports',path.basename(model)));const data=await fs.readFile(model);const val=await validateBytes(new Uint8Array(data),{maxIssues:1000});await fs.writeFile(path.join(out,`gltf-validation-${suffix}.json`),JSON.stringify(val,null,2));report.glb={bytes:data.length,errors:val.issues.numErrors,warnings:val.issues.numWarnings,infos:val.issues.numInfos};console.log('GLB '+JSON.stringify(report.glb));}
 if(!args.includes('--renders-only')){
 await page.setViewportSize({width:1440,height:1080});await page.goto('http://127.0.0.1:4186/',{waitUntil:'networkidle',timeout:120000});await page.waitForFunction(()=>window.studio?.ready);await page.screenshot({path:path.join(out,`desktop-${suffix}.png`)});
 await page.click('[data-view="side"]');report.viewButton=await page.evaluate(()=>document.querySelector('#view-name').textContent==='SIDE');await page.click('#wire');report.wireframe=await page.evaluate(()=>(()=>{const all=[];window.studio.root.traverse(o=>{if(o.isMesh)all.push(...(Array.isArray(o.material)?o.material:[o.material]));});return all.length>0&&all.every(m=>m.wireframe);})());await page.click('#wire');await page.click('#rotate');report.turntable=await page.evaluate(()=>window.studio.controls.autoRotate);await page.click('#rotate');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.studio.setView('front'));await page.waitForTimeout(650);report.mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);await page.screenshot({path:path.join(out,`mobile-${suffix}.png`)});
 report.mobileTouchTargets=await page.locator('.view-controls button').evaluateAll(bs=>bs.map(b=>({text:b.textContent,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})));
 }
 report.errors=[...new Set(report.errors)];report.warnings=[...new Set(report.warnings)];await fs.writeFile(path.join(out,`qa-${suffix}.json`),JSON.stringify(report,null,2));await fs.writeFile(path.join(archive,'qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 if(report.errors.length||report.glb?.errors||report.mobileOverflow||report.viewButton===false||report.wireframe===false||report.turntable===false)process.exitCode=1;
}finally{await browser.close();}
