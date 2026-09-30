import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),suffix='gpt6-astra-pro-mcp-colabdev';
const state=JSON.parse(await fs.readFile('public/progress/progress.json','utf8'));
const target='/build/campus-portrait-gpt6-astra-pro-mcp-colabdev/progress';
await fs.mkdir(target,{recursive:true});
const files=[];
for(const view of ['front','face','side']){
 const source=path.join(root,'.output',`${view}-${suffix}.png`),filename=`work-${view}-${suffix}.png`;
 await fs.copyFile(source,path.join(target,filename));
 files.push({view,url:'progress/'+filename,path:source});
}
await fs.writeFile(path.join(target,'work-progress.json'),JSON.stringify({updatedAt:new Date().toISOString(),reviewedRevision:state.revision,score:state.score,notes:state.status,target:85,files},null,2));
console.log(`Published reviewed revision ${state.revision}, visual score ${state.score}/100.`);
