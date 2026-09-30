export function installRefinementStatus(){
 const base=import.meta.env.BASE_URL;
 const panel=document.createElement('section');panel.className='refinement-panel';panel.hidden=true;
 const imageLink=document.createElement('a'),image=document.createElement('img');image.alt='Latest rendered numerical cloth-refinement pass';imageLink.append(image);
 const content=document.createElement('div'),label=document.createElement('span'),title=document.createElement('h3'),description=document.createElement('p'),metrics=document.createElement('p'),file=document.createElement('code');
 label.className='eyebrow';label.textContent='LIVE REFINEMENT EVIDENCE';
 const links=document.createElement('div');links.className='refinement-links';for(const [text,path] of [['Watch numerical pass history','cloth-refinement-gpt6-astra-pro-mcp-colabdev.mp4'],['Full frame evidence','cloth-evidence-gpt6-astra-pro-mcp-colabdev.tar.gz'],['Pass ledger','cloth-refinement-gpt6-astra-pro-mcp-colabdev.jsonl']]){const a=document.createElement('a');a.href=base+'exports/'+path;a.textContent=text;const item=document.createElement('div'),location=document.createElement('code');location.textContent='/home/dev/project/3d/campus-portrait-gpt6-astra-pro-mcp-colabdev/.output/'+path;item.append(a,location);links.append(item);}content.append(label,title,description,metrics,file,links);panel.append(imageLink,content);
 document.querySelector('#download-grid')?.after(panel);
 const badge=document.createElement('p');badge.className='refinement-badge';document.querySelector('.review')?.append(badge);
 let last='';
 async function refresh(){try{
  const response=await fetch(base+'progress/cloth-progress.json?t='+Date.now(),{cache:'no-store'});if(!response.ok)return;
  const data=await response.json();if(last===data.updatedAt)return;last=data.updatedAt;
  const count=Number(data.completed)||0,total=Number(data.requested)||0;panel.hidden=count===0;
  badge.textContent=`Cloth lab: ${count.toLocaleString()} / ${total.toLocaleString()} numerical passes`;
  title.textContent=`${count.toLocaleString()} rendered cloth-refinement passes`;
  description.textContent='These are garment deformation/render/test steps, not individually reviewed artistic revisions. The visual score above is assessed separately. Frames preserve the model version used during the cloth experiment.';
  metrics.textContent=`${Number(data.uniqueGeometryStates)||0} distinct mesh states · ${Number(data.uniqueRenderedImages)||0} distinct rendered images · ${data.phase||'running'}`;
  image.src=base+data.image.replace(/^\/+/, '')+'?step='+count;imageLink.href=image.src;imageLink.target='_blank';imageLink.rel='noopener';file.textContent=data.imagePath;
 }catch(error){console.warn('Cloth progress:',error.message);}}
 refresh();setInterval(refresh,4000);
}
