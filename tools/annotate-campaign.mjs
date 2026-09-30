import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const suffix='gpt6-astra-pro-mcp-colabdev',name='likeness95-100-'+suffix;
const pub=path.resolve('public/progress',name),work=path.resolve('.agentwork',name),out=path.resolve('.output',name);
const ledger=JSON.parse(await fs.readFile(path.join(pub,'ledger.json'),'utf8'));
const requested=process.argv.slice(2),groups=requested.length?requested:[...new Set(ledger.candidates.filter(c=>c.status==='reviewed').map(c=>c.group))];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b=await chromium.launch({executablePath:'/home/dev/.local/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{for(const group of groups){
 const items=ledger.candidates.filter(c=>c.group===group);if(items.some(c=>c.status!=='reviewed'))continue;
 const markup=`<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#e7e8e0;color:#28352d;font-family:Arial,sans-serif}.header{padding:16px;height:56px;font-size:20px}.grid{display:grid;grid-template-columns:repeat(2,640px);gap:2px}.card{padding:12px 10px;background:#f5f4ee}.title{height:58px;font-size:15px;line-height:1.5}.title b{font-size:17px}.score{float:right;font-size:20px}.images{display:flex;gap:3px}.images img{width:308px;height:410px;object-fit:contain}.note{height:72px;font-size:11px;line-height:1.55;margin-top:8px;color:#647267}.selected{box-shadow:inset 0 0 0 2px #6d8b74}.tag{font-size:9px;letter-spacing:1px;color:#617d6c}</style><div class="header">${esc(group)} — individual visual review</div><div class="grid">${items.map(c=>`<section class="card ${c.decision==='selected checkpoint'?'selected':''}"><div class="title"><span class="score">${c.score}/100</span><b>C${String(c.id).padStart(3,'0')}</b><br>${esc(c.label)}</div><div class="images">${c.views.slice(0,2).map(v=>`<img src="file://${v.jpg}">`).join('')}</div><div class="note">${esc(c.review)}<br><span class="tag">${esc(c.decision)} · SUBJECTIVE VISUAL ASSESSMENT</span></div></section>`).join('')}</div>`;
 const file=path.join(work,'reviewed-sheet-'+group+'.html');await fs.writeFile(file,markup);const p=await b.newPage({viewport:{width:1282,height:1200},deviceScaleFactor:1});await p.goto('file://'+file,{waitUntil:'load'});await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));const image='sheet-'+group+'-'+suffix+'.jpg';await p.screenshot({path:path.join(out,image),type:'jpeg',quality:94,fullPage:true});await fs.copyFile(path.join(out,image),path.join(pub,image));await p.close();console.log('Annotated '+group);
}}finally{await b.close();}
