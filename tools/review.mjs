import fs from 'node:fs/promises';
const [scoreText,title,notes]=process.argv.slice(2);if(!scoreText||!title||!notes)throw new Error('usage: node tools/review.mjs SCORE TITLE NOTES');
const file='public/progress/progress.json',data=JSON.parse(await fs.readFile(file,'utf8'));
const id=data.iterations.length+1,score=Number(scoreText),suffix='gpt6-astra-pro-mcp-colabdev',project=process.cwd();
data.revision=id;data.score=score;data.status=notes;data.updatedAt=new Date().toISOString();data.iterations.push({id,score,title,notes,reviewedAt:data.updatedAt});
data.files=['front','three-quarter','side','back','face'].map(v=>({title:v==='three-quarter'?'Three-quarter view':v[0].toUpperCase()+v.slice(1)+' view',url:`/progress/${v}-${suffix}.png`,image:`/progress/${v}-${suffix}.png`,path:`${project}/.output/${v}-${suffix}.png`}));
await fs.writeFile(file,JSON.stringify(data,null,2));await fs.copyFile(file,`.output/progress-${suffix}.json`);console.log(`Recorded visual iteration ${id}: ${score}/100`);
