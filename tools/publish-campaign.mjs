import fs from 'node:fs/promises';
import path from 'node:path';
const name='likeness95-100-gpt6-astra-pro-mcp-colabdev';
const source=path.resolve('public/progress',name);
const target=path.join('/build/campus-portrait-gpt6-astra-pro-mcp-colabdev/progress',name);
let count=0;
async function copyFolder(from,to){
 await fs.mkdir(to,{recursive:true});
 for(const entry of await fs.readdir(from,{withFileTypes:true})){
  if(entry.isSymbolicLink())continue;
  const src=path.join(from,entry.name),dst=path.join(to,entry.name);
  if(entry.isDirectory()){await copyFolder(src,dst);continue;}
  if(!/\.(json|jpg|png)$/.test(entry.name))continue;
  const a=await fs.stat(src),b=await fs.stat(dst).catch(()=>null);
  if(b&&a.size===b.size&&b.mtimeMs>=a.mtimeMs)continue;
  await fs.copyFile(src,dst);count++;
 }
}
await copyFolder(source,target);console.log(`Published ${count} changed campaign evidence files to the project-only preview.`);
