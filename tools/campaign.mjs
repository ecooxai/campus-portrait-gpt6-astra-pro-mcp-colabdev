import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';

const suffix='gpt6-astra-pro-mcp-colabdev';
const campaign='likeness95-100-'+suffix;
const root=process.cwd(),work=path.join(root,'.agentwork',campaign),out=path.join(root,'.output',campaign),pub=path.join(root,'public','progress',campaign);
const stateFile=path.join(root,'src/design-state.json'),ledgerFile=path.join(pub,'ledger.json');
for(const p of [work,out,pub])await fs.mkdir(p,{recursive:true});
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
const sha=b=>createHash('sha256').update(b).digest('hex');
const saveState=async state=>{const tmp=stateFile+'.tmp';await write(tmp,state);await fs.rename(tmp,stateFile);};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let ledger=await read(ledgerFile).catch(()=>({campaign,startedAt:new Date().toISOString(),target:{minimumIterations:100,visualScore:95},baseline:{revision:25,score:80},candidates:[],sheets:[],selected:0,description:'Distinct source/parameter edits followed by browser renders and individual human-agent visual review. Numerical solver steps are not counted.'}));
async function persist(){ledger.updatedAt=new Date().toISOString();ledger.rendered=ledger.candidates.filter(c=>c.status==='rendered'||c.status==='reviewed').length;ledger.reviewed=ledger.candidates.filter(c=>c.status==='reviewed').length;ledger.currentScore=ledger.candidates.find(c=>c.id===ledger.selected)?.score??ledger.baseline.score;await write(ledgerFile,ledger);await write(path.join(out,'ledger-'+suffix+'.json'),ledger);const live=path.join('/build/campus-portrait-'+suffix,'progress',campaign);await fs.mkdir(live,{recursive:true});await write(path.join(live,'ledger.json'),ledger);}
async function browser(){return chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/dev/.local/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});}
const [action,input]=process.argv.slice(2);
if(action==='render'){
 const spec=await read(input),prior=await read(stateFile),base=spec.base||prior;
 if(!spec.group||!Array.isArray(spec.candidates)||!spec.candidates.length)throw Error('Expected group and candidate list');
 const sourceNames=(await fs.readdir(path.join(root,'src'))).filter(f=>f.endsWith('.js')).sort();
 const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 const sourceHash=sha(Buffer.concat(await Promise.all(sourceNames.map(f=>fs.readFile(path.join(root,'src',f))))));
 const b=await browser();
 try{
  for(const item of spec.candidates){
   if(ledger.candidates.some(c=>c.id===item.id))throw Error('Candidate already exists: '+item.id);
   const state={...base,...item.changes,candidate:item.id,label:item.label,campaign};
   const dir=path.join(work,`c${String(item.id).padStart(3,'0')}-${suffix}`),publicDir=path.join(pub,`c${String(item.id).padStart(3,'0')}-${suffix}`);await fs.mkdir(dir,{recursive:true});await fs.mkdir(publicDir,{recursive:true});
   const record={id:item.id,group:spec.group,label:item.label,changes:item.changes,basedOn:base.candidate||0,statePath:path.join(dir,'design-state.json'),sourceHash,sourceNames,sourceCommit,designHash:sha(JSON.stringify(state)),startedAt:new Date().toISOString(),score:null,review:null,status:'rendering',views:[],errors:[],warnings:[]};
   await write(record.statePath,state);await write(path.join(publicDir,'design-'+suffix+'.json'),state);await saveState(state);await new Promise(r=>setTimeout(r,450));
   const page=await b.newPage({viewport:{width:600,height:800},deviceScaleFactor:1});
   page.on('pageerror',e=>record.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')record.errors.push(m.text());if(m.type()==='warning')record.warnings.push(m.text());});
   try{
    await page.goto(`http://127.0.0.1:4186/?render=face&candidate=${item.id}`,{waitUntil:'networkidle',timeout:120000});
    await page.waitForFunction(id=>window.studio?.ready&&window.studio.design.candidate===id,item.id,{timeout:120000});
    record.stats=await page.evaluate(()=>{const s=window.studio;s.renderer.setAnimationLoop(null);s.controls.enableDamping=false;s.controls.autoRotate=false;let finite=true,hash=2166136261,count=0;const buf=new ArrayBuffer(4),dv=new DataView(buf);s.root.updateMatrixWorld(true);s.root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.getAttribute('position');for(let i=0;i<p.array.length;i++){const v=p.array[i];if(!Number.isFinite(v))finite=false;dv.setFloat32(0,v,true);hash=Math.imul(hash^dv.getUint32(0,true),16777619)>>>0;count++;}for(const n of o.matrixWorld.elements){dv.setFloat32(0,n,true);hash=Math.imul(hash^dv.getUint32(0,true),16777619)>>>0;}});return {...s.stats(),finite,geometryFingerprint:hash.toString(16),positionComponents:count};});
    if(!record.stats.finite)throw Error('Non-finite geometry');
    for(const view of item.views||spec.views||['face','face-three-quarter']){
     await page.evaluate(v=>{const s=window.studio;s.setView(v);s.controls.update();s.renderer.render(s.scene,s.camera);},view);await page.waitForTimeout(150);
     const png=path.join(dir,`${view}-${suffix}.png`),jpg=path.join(publicDir,`${view}-${suffix}.jpg`);
     await page.screenshot({path:png,type:'png'});await page.screenshot({path:jpg,type:'jpeg',quality:90});
     record.views.push({view,png,jpg,url:`/progress/${campaign}/${path.basename(publicDir)}/${path.basename(jpg)}`,sha256:sha(await fs.readFile(png)),bytes:(await fs.stat(png)).size});
    }
    record.errors=[...new Set(record.errors)];record.warnings=[...new Set(record.warnings)];
    if(record.errors.length)throw Error(record.errors.join('\n'));
    record.status='rendered';record.completedAt=new Date().toISOString();await write(path.join(dir,'render-report.json'),record);ledger.candidates.push(record);await persist();
    console.log(`C${String(item.id).padStart(3,'0')}: ${item.label}; ${record.views.length} rendered views; fingerprint ${record.stats.geometryFingerprint}; awaiting visual score.`);
   }catch(e){record.status='failed';record.failure=e.message;ledger.candidates.push(record);await persist();throw e;}finally{await page.close();}
  }
  const entries=ledger.candidates.filter(c=>c.group===spec.group),cols=2,cardW=640;
  const markup=`<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#e8e8e2;font-family:Arial,sans-serif;color:#26323b}.grid{display:grid;grid-template-columns:repeat(${cols},${cardW}px);gap:2px}.card{background:#f4f3ed;padding:12px 10px}.title{height:50px;font-size:15px;line-height:1.45}.title b{font-size:18px}.images{display:flex;gap:3px}.images img{width:308px;height:410px;object-fit:contain;background:#e9e8e4}.label{font-size:11px;line-height:1.5;color:#64716c}.header{height:54px;padding:14px 15px;font-size:20px}h1{margin:0;font-size:20px}</style><div class="header"><h1>${escape(spec.group)} — individually rendered candidates</h1></div><div class="grid">${entries.map(c=>`<section class="card"><div class="title"><b>C${String(c.id).padStart(3,'0')}</b> &nbsp; ${escape(c.label)}</div><div class="images">${c.views.slice(0,2).map(v=>`<img src="file://${v.png}">`).join('')}</div><div class="label">${c.views.slice(0,2).map(v=>escape(v.view)).join(' / ')} · ${c.stats.triangles.toLocaleString('en-US')} triangles · no visual score assigned yet</div></section>`).join('')}</div>`;
  const html=path.join(work,'sheet-'+spec.group+'.html');await fs.writeFile(html,markup);const sheetPage=await b.newPage({viewport:{width:1282,height:1100},deviceScaleFactor:1});await sheetPage.goto('file://'+html,{waitUntil:'load'});await sheetPage.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
  const name=`sheet-${spec.group}-${suffix}.jpg`,dest=path.join(out,name);await sheetPage.screenshot({path:dest,type:'jpeg',quality:94,fullPage:true});await fs.copyFile(dest,path.join(pub,name));await sheetPage.close();
  ledger.sheets.push({group:spec.group,ids:entries.map(c=>c.id),url:`/progress/${campaign}/${name}`,path:dest,createdAt:new Date().toISOString()});await persist();console.log('CONTACT SHEET: '+dest);
 }finally{await b.close();await saveState(prior);}
}else if(action==='review'){
 const reviews=await read(input);for(const review of reviews){const c=ledger.candidates.find(c=>c.id===review.id);if(!c||c.status!=='rendered')throw Error('Expected unreviewed rendered candidate '+review.id);if(!Number.isFinite(review.score)||review.score<0||review.score>100||!review.notes)throw Error('Provide score and concrete visual notes');c.score=review.score;c.review=review.notes;c.decision=review.decision||'not selected';c.status='reviewed';c.reviewedAt=new Date().toISOString();}
 await persist();console.log(`Individually reviewed ${reviews.length} candidates. Campaign total: ${ledger.reviewed}/${ledger.target.minimumIterations}.`);
}else if(action==='accept'){
 const c=ledger.candidates.find(c=>c.id===Number(input));if(!c||c.status!=='reviewed')throw Error('Only a visually reviewed candidate can be accepted');await saveState(await read(c.statePath));ledger.selected=c.id;c.decision='selected checkpoint';await persist();console.log(`Selected C${c.id}, ${c.score}/100: ${c.label}`);
}else if(action==='status'){
 console.log(JSON.stringify({rendered:ledger.rendered,reviewed:ledger.reviewed,selected:ledger.selected,score:ledger.currentScore,target:ledger.target,candidates:ledger.candidates.map(({id,label,score,status,decision})=>({id,label,score,status,decision}))},null,2));
}else throw Error('usage: node tools/campaign.mjs render SPEC.json | review REVIEWS.json | accept ID | status');
