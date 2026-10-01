import {compareMaterials} from './material-roundtrip.mjs';
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const suffix='gpt6-astra-pro-mcp-colabdev';
const base=(process.env.PREVIEW_URL||'http://127.0.0.1:4196').replace(/\/$/,'');
const report={timestamp:new Date().toISOString(),url:base,checks:{},errors:[],warnings:[],notes:['Browser tests use headless Chromium and SwiftShader software WebGL; they are not measurements of real phone GPU performance.']};
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/dev/.local/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1080},deviceScaleFactor:1});const page=await context.newPage();page.setDefaultTimeout(120000);page.on('pageerror',e=>{report.errors.push(e.message);console.error('PAGE_ERROR:',e.message);});page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());if(m.type()==='warning')report.warnings.push(m.text());});
 await page.goto(base+'/?render=front',{waitUntil:'networkidle',timeout:120000});await page.waitForFunction(()=>window.studio?.ready,null,{timeout:120000});
 const original=await page.evaluate(()=>window.studio.stats());const imported=await page.evaluate(()=>window.studio.setModelSource('exported'));
 report.materialRoundtrip=await compareMaterials(page);report.checks.materialFactorsMatch=report.materialRoundtrip.matched;
 report.roundtrip={original,imported};
 if(original.backpackContact){
  const c=original.backpackContact,d=imported.backpackContact;report.backpackContact=c;
  report.checks.sampledBackpackClearance=c.checkedFrontVertices>0&&Number.isFinite(c.minSampledGap)&&c.minSampledGap>=-0.00001;
  report.checks.backpackContactMetadataRoundtrip=!!d&&d.checkedFrontVertices===c.checkedFrontVertices&&Math.abs(d.minSampledGap-c.minSampledGap)<1e-8;
  report.notes.push('Backpack clearance is a pre-posture sampled geometric check, not a full collision or cloth simulation.');
 }
report.checks.exportedTriangleCountMatches=original.triangles===imported.triangles;report.checks.exportedBoundsMatch=original.bounds.every((n,i)=>Math.abs(n-imported.bounds[i])<.00001);
 await page.setViewportSize({width:768,height:1024});await page.evaluate(()=>window.studio.setView('three-quarter'));await page.waitForTimeout(400);await page.screenshot({path:`.output/exported-three-quarter-${suffix}.png`});
 const glb=await fs.readFile(`.output/campus-portrait-${suffix}.glb`);const json=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString('utf8').trim());report.gltf={version:json.asset.version,meshes:json.meshes.length,textures:json.textures?.length,images:json.images?.length,extensionsUsed:json.extensionsUsed};report.checks.embeddedImages=(json.images||[]).every(i=>Number.isInteger(i.bufferView)&&!i.uri);report.checks.standardNormalMaps=!json.extensionsUsed?.includes('EXT_materials_bump');
 await page.goto(base+'/',{waitUntil:'networkidle',timeout:120000});await page.waitForFunction(()=>window.studio?.ready,null,{timeout:120000});await page.setViewportSize({width:1440,height:1080});await page.waitForTimeout(400);
 await page.locator('#file-cards').scrollIntoViewIfNeeded();await page.waitForFunction(()=>{const images=[...document.querySelectorAll('.file-card img')];return images.length===5&&images.every(i=>i.complete&&i.naturalWidth>0);},null,{timeout:30000});report.checks.galleryImagesLoaded=true;await page.screenshot({path:`.output/desktop-gallery-${suffix}.png`});await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:`.output/desktop-${suffix}.png`,fullPage:true});
 report.checks.olderCheckpointsCollapsed=await page.locator('.checkpoint-history').evaluate(e=>!e.open);
 await page.locator('.checkpoint-history summary').click();report.checks.olderCheckpointsExpandable=await page.locator('.checkpoint-history').evaluate(e=>e.open);await page.locator('.checkpoint-history summary').click();
 report.checks.progressJournal=await page.locator('.journal-entry').count()>=9;report.checks.absoluteArtifactPaths=await page.locator('.file-card code').evaluateAll(xs=>xs.length===5&&xs.every(x=>x.textContent.startsWith('/home/dev/project/3d/')));
 await page.selectOption('#model-source','exported');await page.waitForTimeout(700);report.checks.exportedSourceControl=await page.evaluate(()=>window.studio.root.visible===false);await page.selectOption('#model-source','authored');await page.waitForTimeout(200);
 const pngEvent=page.waitForEvent('download');await page.click('#capture');const png=await pngEvent;await png.saveAs(`.output/captured-view-${suffix}.png`);report.checks.pngDownload=(await fs.stat(`.output/captured-view-${suffix}.png`)).size>10000;
 for(const v of ['front','three-quarter','side','back','face']){await page.locator(`[data-view="${v}"]`).click();report.checks['view-'+v]=await page.locator('#view-name').textContent()===v.toUpperCase();}
 await page.selectOption('#quality','1');report.checks.resolutionSelector=await page.evaluate(()=>window.studio.renderer.getPixelRatio()===1);
 for(const route of ['/progress/front-'+suffix+'.png','/exports/campus-portrait-'+suffix+'.glb']){const response=await context.request.head(base+route);report.checks['http-'+route]=response.status()===200;}
 report.artifactDownloads=[];for(const href of await page.locator('.download-card').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')))){const response=await context.request.head(new URL(href,base+'/').href);report.artifactDownloads.push({href,status:response.status()});}report.checks.publishedArtifactCards=report.artifactDownloads.length>=3&&report.artifactDownloads.every(r=>r.status===200);
 const deny=await context.request.get(base+'/.git/config');report.checks.privatePathsBlocked=[403,404].includes(deny.status());
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const phone=await mobile.newPage();phone.setDefaultTimeout(120000);phone.on('pageerror',e=>{report.errors.push('mobile: '+e.message);console.error('MOBILE_PAGE_ERROR:',e.message);});await phone.goto(base+'/',{waitUntil:'networkidle',timeout:120000});await phone.waitForFunction(()=>window.studio?.ready,null,{timeout:120000});
 const cdp=await mobile.newCDPSession(phone),before=await phone.evaluate(()=>window.studio.camera.position.toArray());
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:245,y:420,id:1}]});for(let k=1;k<=5;k++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:245-k*15,y:420+k*2,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.waitForTimeout(350);
 const after=await phone.evaluate(()=>window.studio.camera.position.toArray());report.checks.touchOrbit=before.some((n,i)=>Math.abs(n-after[i])>.01);
 const distanceBefore=await phone.evaluate(()=>window.studio.controls.getDistance());
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:160,y:420,id:1},{x:230,y:420,id:2}]});for(let k=1;k<=4;k++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:160-k*6,y:420,id:1},{x:230+k*6,y:420,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.waitForTimeout(350);
 const distanceAfter=await phone.evaluate(()=>window.studio.controls.getDistance());report.checks.touchPinchZoom=Math.abs(distanceBefore-distanceAfter)>.02;
 await phone.locator('[data-view="face"]').tap();report.checks.touchPreset=await phone.locator('#view-name').textContent()==='FACE';await phone.locator('[data-view="front"]').tap();
 report.checks.mobileNoHorizontalOverflow=await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);report.checks.minimum44pxTargets=await phone.locator('.view-controls button').evaluateAll(xs=>xs.every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44;}));
 await phone.locator('#file-cards').scrollIntoViewIfNeeded();await phone.waitForFunction(()=>{const i=document.querySelector('.file-card img');return i?.complete&&i.naturalWidth>0;},null,{timeout:30000});report.checks.mobileGalleryLoads=true;await phone.screenshot({path:`.output/mobile-gallery-${suffix}.png`});await phone.evaluate(()=>scrollTo(0,0));await phone.screenshot({path:`.output/mobile-${suffix}.png`,fullPage:true});await phone.setViewportSize({width:844,height:390});await phone.waitForTimeout(400);report.checks.landscapeNoHorizontalOverflow=await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
 const numerical=await context.request.get(base+'/exports/cloth-integrity-gpt6-astra-pro-mcp-colabdev.json');if(numerical.ok()){report.numericalRefinement=await numerical.json();report.checks.thousandNumericalPasses=report.numericalRefinement.passes===1000;report.checks.verifiedFrameLedger=report.numericalRefinement.frameHashesVerified===true;}else{report.checks.thousandNumericalPasses=false;report.checks.verifiedFrameLedger=false;}report.checks.refinementDisclosure=await page.locator('.refinement-panel').textContent().then(t=>t.includes('not individually reviewed artistic revisions'));
 const campaignResponse=await context.request.get(base+'/progress/likeness95-100-'+suffix+'/ledger.json');
 if(campaignResponse.ok()){
  const ledger=await campaignResponse.json(),ids=new Set(ledger.candidates.map(c=>c.id));
  report.campaign={rendered:ledger.rendered,reviewed:ledger.reviewed,selected:ledger.selected,score:ledger.currentScore,target:ledger.target};
  report.checks.hundredReviewedCandidates=ledger.reviewed>=100&&ledger.candidates.filter(c=>c.status==='reviewed').length>=100;
  report.checks.uniqueReviewedCandidateIds=ids.size===ledger.candidates.length;
  report.checks.selectedDesignMatchesViewer=await page.evaluate(id=>window.studio.design.candidate===id,ledger.selected);
  report.checks.embeddedDesignMetadata=json.nodes.some(n=>n.extras?.design?.candidate===ledger.selected);
  report.checks.campaignPanelPresent=await page.locator('#visual-campaign').isVisible();
 }else report.checks.hundredReviewedCandidates=false;
 report.errors=[...new Set(report.errors)];report.warnings=[...new Set(report.warnings)];report.passed=report.errors.length===0&&Object.values(report.checks).every(Boolean);await fs.writeFile(`.output/acceptance-${suffix}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}finally{await browser.close();}
