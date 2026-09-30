import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const suffix='gpt6-astra-pro-mcp-colabdev';
const state=JSON.parse(await fs.readFile(`.output/cloth-candidate-${suffix}.json`,'utf8'));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/home/dev/.local/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:768,height:1024},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:4197/?render=front&clothlab=1',{waitUntil:'networkidle',timeout:120000});
 await page.waitForFunction(()=>window.studio?.ready,null,{timeout:120000});
 await page.evaluate(data=>{const mesh=window.studio.root.getObjectByName(data.name),p=mesh.geometry.getAttribute('position');if(p.array.length!==data.vertices.length)throw Error('Cloth topology mismatch');p.array.set(data.vertices);p.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();},state);
 await page.waitForTimeout(300);
 for(const view of ['front','three-quarter','side','back']){
  await page.evaluate(v=>{const s=window.studio;s.setView(v);s.renderer.render(s.scene,s.camera);s.renderer.getContext().finish();},view);
  await page.waitForTimeout(100);const png=await page.screenshot({path:`.output/cloth-final-${view}-${suffix}.png`});
  if(png.length<10000)throw Error('Unexpectedly empty candidate render '+view);console.log('Reviewed raw cloth endpoint view: '+view);
 }
}finally{await browser.close();}
