import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const suffix='gpt6-astra-pro-mcp-colabdev',name='likeness95-100-'+suffix;
const root=process.cwd(),pub=path.join(root,'public/progress',name);
const ledger=JSON.parse(await fs.readFile(path.join(pub,'ledger.json'),'utf8'));
const sha=data=>createHash('sha256').update(data).digest('hex');
const records=[],problems=[],ids=new Set(),designs=new Set(),parameters=new Set(),geometries=new Set(),images=new Set();
for(const c of ledger.candidates){
 if(ids.has(c.id))problems.push('Duplicate candidate '+c.id);ids.add(c.id);
 if(c.status!=='reviewed'||!Number.isFinite(c.score)||!c.review)problems.push('Incomplete visual review C'+c.id);
 const dir=path.join(pub,'c'+String(c.id).padStart(3,'0')+'-'+suffix);
 const design=JSON.parse(await fs.readFile(path.join(dir,'design-'+suffix+'.json'),'utf8'));
 const hash=sha(JSON.stringify(design));designs.add(hash);if(hash!==c.designHash)problems.push('Design hash mismatch C'+c.id);
 const numeric=Object.fromEntries(Object.entries(design).filter(([key])=>!['candidate','label','campaign'].includes(key)).sort(([a],[b])=>a.localeCompare(b)));
 parameters.add(sha(JSON.stringify(numeric)));
 if(c.stats?.geometryFingerprint)geometries.add(c.stats.geometryFingerprint);
 if(c.views.length<2)problems.push('Insufficient rendered views C'+c.id);
 const evidence=[];
 for(const v of c.views){
  const file=path.join(root,'public',v.url.replace(/^\/+/,'')),bytes=await fs.readFile(file);
  if(bytes[0]!==255||bytes[1]!==216||bytes.length<10000)problems.push('Invalid JPEG evidence C'+c.id+' '+v.view);
  const imageHash=sha(bytes);images.add(imageHash);evidence.push({view:v.view,url:v.url,bytes:bytes.length,sha256:imageHash});
 }
 records.push({id:c.id,score:c.score,designHash:hash,sourceCommit:c.sourceCommit||null,geometryFingerprint:c.stats?.geometryFingerprint,evidence});
}
const selected=ledger.candidates.find(c=>c.id===ledger.selected);
if(!selected||selected.status!=='reviewed')problems.push('Selected design has no visual review');
const minimum=Number(process.env.MIN_CANDIDATES||100);
if(ledger.reviewed<minimum)problems.push('Required reviewed candidates not reached');
const report={generatedAt:new Date().toISOString(),campaign:name,minimumRequired:minimum,rendered:ledger.rendered,reviewed:ledger.reviewed,uniqueCandidateIds:ids.size,distinctDesignStates:designs.size,distinctNumericParameterStates:parameters.size,distinctGeometryFingerprints:geometries.size,evidenceImageCount:records.reduce((n,r)=>n+r.evidence.length,0),distinctEvidenceImages:images.size,selected:ledger.selected,visualScore:selected?.score,visualTarget:95,visualTargetReached:(selected?.score??0)>=95,problems,passed:problems.length===0,records,notes:['Scores are subjective visual assessments, not computed similarity to the photograph.','Earlier numerical cloth-solver steps are separate and excluded.','Failed screenshot retries remain attached to their original candidate and are not counted again.','Durable JPEG evidence is verified here; some original scratch PNGs were not retained by the runtime restore.']};
await fs.writeFile(path.join(root,'.output','campaign-audit-'+suffix+'.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,records:undefined},null,2));if(!report.passed)process.exitCode=1;
