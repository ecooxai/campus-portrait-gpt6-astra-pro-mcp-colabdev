import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const suffix='gpt6-astra-pro-mcp-colabdev',projectName='campus-portrait-'+suffix,campaign='likeness95-100-'+suffix;
const root=process.cwd(),out=path.join(root,'.output'),exportsDir=path.join(root,'public/exports');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const progress=await read('public/progress/progress.json'),ledger=await read('public/progress/'+campaign+'/ledger.json'),design=await read('src/design-state.json');
const qa=await read('.output/qa-'+suffix+'.json'),validation=await read('.output/gltf-validation-'+suffix+'.json'),acceptance=await read('.output/acceptance-'+suffix+'.json'),audit=await read('.output/campaign-audit-'+suffix+'.json');
if(!audit.passed||ledger.reviewed<100||!acceptance.passed||qa.errors.length||validation.issues.numErrors||validation.issues.numWarnings)throw Error('Checkpoint packaging refused: verification is incomplete.');
if(qa.revision!==progress.revision||qa.stats.designCandidate!==design.candidate||ledger.selected!==design.candidate)throw Error('Checkpoint packaging refused: model, export and review selection do not match.');
await fs.mkdir(exportsDir,{recursive:true});
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),branch=execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim();
const repository='https://github.com/ecooxai/'+projectName,pages='https://ecooxai.github.io/'+projectName+'/';
const tunnel=await fs.readFile('.agentwork/PREVIEW_URL.txt','utf8').then(s=>s.trim()).catch(()=>'Not recorded');
const model=projectName+'.glb',source='campus-portrait-source-'+suffix+'.tar.gz',evidence='campaign-evidence-'+suffix+'.tar.gz',verification='verification-'+suffix+'.json',handoff='HANDOFF-'+suffix+'.md';
const modelBytes=(await fs.stat(path.join(out,model))).size;
const rootAcceptance=await read('.output/acceptance-root-'+suffix+'.json').catch(()=>null);
const report={project:projectName,revision:progress.revision,selectedCandidate:design.candidate,visualScore:ledger.currentScore,requestedVisualScore:95,requestedReviewedCandidates:100,completedReviewedCandidates:ledger.reviewed,savedModelCheckpoints:progress.iterations.length,goalComplete:ledger.reviewed>=100&&ledger.currentScore>=95,implementationCommit:commit,branch,hosting:{repository,pages,temporaryTunnel:tunnel},renderTests:qa,productionAcceptance:acceptance,rootAcceptance,campaignAudit:audit,gltfValidation:validation,limitations:['The model is a stylized interpretation, not a 95/100 photographic likeness.','Static optimized geometry only: no skeleton, skinning or animation.','Side and rear details are authored interpretations of unseen areas.','Headless SwiftShader checks are not measurements of physical phone GPU performance.']};
await fs.writeFile(path.join(out,verification),JSON.stringify(report,null,2));await fs.copyFile(path.join(out,verification),path.join(exportsDir,verification));
await fs.copyFile(path.join(out,'campaign-audit-'+suffix+'.json'),path.join(exportsDir,'campaign-audit-'+suffix+'.json'));
const fence='```';
const readme=`# Campus portrait — editable JavaScript 3D study

A real three-dimensional, procedurally authored interpretation of the supplied photograph. The model, clothing patterns and hair textures are original JavaScript geometry/material work. The supplied photograph is not projected onto the model and is not included in the public project or archives.

## Current checkpoint

Revision **${progress.revision}**, selected candidate **C${design.candidate}**, subjective visual assessment **${ledger.currentScore}/100**. The current campaign contains **${audit.reviewed} individually reviewed edit-and-render candidates**, **${audit.distinctNumericParameterStates} distinct numeric parameter states**, **${audit.distinctGeometryFingerprints} geometry fingerprints** and **${audit.evidenceImageCount} verified rendered JPEGs**. Rejected designs remain in the record. Material-only edits can share a geometry fingerprint.

The requested minimum of 100 reviewed candidates is complete. The **95/100 visual target is not achieved**. This remains a stylized study, not a photographic reconstruction or a claimed AAA-quality asset. Passing technical checks does not change the subjective visual assessment.

The older 1,000-step numerical cloth experiment is preserved separately and is not counted as 1,000 manual visual reviews. Current accepted model checkpoints and candidate counts are also separate: ${progress.iterations.length} saved model checkpoints versus ${ledger.reviewed} campaign candidates.

## Preview and files

Hosted studio: ${pages}

Editable source repository: ${repository}

Temporary live-instance preview: ${tunnel}

Model: public/exports/${model}

Complete visual-review evidence: public/exports/${evidence}

Combined verification report: public/exports/${verification}

Detailed continuation notes: ${handoff}

The live viewer offers orbiting, pinch zoom, five named camera views, wireframe, a turntable, render-resolution selection, PNG export and GLB export. Its Model source selector independently reloads the saved GLB. The campaign panel includes every individual score, design state and annotated comparison sheet.

## Run the editable viewer

${fence}bash
npm ci
npm run dev
# http://127.0.0.1:4186
${fence}

For a portable static build:

${fence}bash
npm run build:portable
PREVIEW_ROOT=./dist PORT=4197 npm run serve
# http://127.0.0.1:4197
${fence}

The Colab build command, npm run build, writes to /build/${projectName}. BUILD_DIR overrides this destination. The static server serves only its configured build directory and denies private dot-paths; do not expose the project root with a generic file server.

## Reproduce verification

Start the development viewer before the render/export suite. Build and start the static viewer before acceptance. Set CHROMIUM_PATH on machines where Chrome is not /home/dev/.local/bin/chromium.

${fence}bash
node tools/qa.mjs --revision=${progress.revision} --views=front,three-quarter,side,back,face,detail-hands,detail-shoes
node tools/audit-campaign.mjs
npm run build
# Start PORT=4197 npm run serve in another terminal.
PREVIEW_URL=http://127.0.0.1:4197 node tools/acceptance.mjs
${fence}

The render suite checks actual browser errors, named renders, UI controls, layout and GLB validation. Acceptance checks independently imported geometry and material factors, embedded images/design metadata, touch orbit and pinch gestures, downloads, private-path handling and the campaign counter. All browser evidence here uses headless Chromium with SwiftShader software WebGL, not a physical phone GPU benchmark.

## Continue visual refinement

The editable selection is src/design-state.json. Shared design controls, anatomy and the browser rebuild API make each candidate reproducible. The runner requires a Git checkout or a locally initialized committed repository for source provenance.

${fence}bash
node tools/campaign.mjs render path/to/candidate-spec.json
# Inspect the generated contact sheet and full-size views with vision.
node tools/campaign.mjs review path/to/individual-reviews.json
node tools/campaign.mjs accept CANDIDATE_NUMBER
node tools/annotate-campaign.mjs
node tools/publish-campaign.mjs
${fence}

A candidate specification contains a group, view names and an array of explicit id/label/changes records. Every reviewed candidate needs an actual edit, reconstruction, rendered views and an individual score with concrete findings. Do not count retries, repeated screenshots or numerical assertions as extra visual iterations. Failed screenshot attempts are retained on the original candidate record.

Durable JPEGs and design JSONs are included in the archive. Some early scratch PNGs were not retained by a runtime restore. Reproducing an earlier candidate exactly may require its historical source commit; applying an old state to a later generator is not a guarantee of identical geometry. The current selected model can be regenerated from the included current source.

## Asset and engineering limits

The current GLB is ${modelBytes.toLocaleString('en-US')} bytes, with ${qa.stats.triangles.toLocaleString('en-US')} triangles and ${qa.stats.meshes} material-batched meshes. The source generator remains editable; optimized GLB meshes preserve original part names and design metadata. No skeleton, skinning, facial blendshapes or animation is included.

Main remaining visual work: closer facial likeness, finer hair structure/root transitions, more natural hand anatomy, garment micro-drape and backpack contact. Unseen side/rear details and metric scale are authored interpretations, not measurements recovered from the photograph.

## Source map

src/anatomy.js and src/nose-anatomy.js define the continuous facial profile and shared feature boundaries. src/head.js, face-details.js, eye-volume.js, ear-sculpt.js and hair-groom.js build the head and hair. src/body.js assembles the clothed figure. clothing-fit.js, accessory-fit.js and pose-refine.js carry details coherently through fitted geometry. skin-surface.js and materials.js author portable textures/materials. geometry.js preserves the saved shirt topology while controlling other mesh densities. optimize.js batches materials, welds vertices and repairs export normals/tangents.

The source archive excludes dependency installations, Git history, scratch directories and nested archive files. The large historical numerical-cloth frame archive is a separate optional hosted download; its small ledger, baked state and integrity report are retained. No external font file is bundled. See public/THIRD_PARTY_NOTICES-${suffix}.txt for the included Three.js MIT notice.
`;
await fs.writeFile('README.md',readme);
const handoffText=`# Continuation handoff — GPT-6 Astra Pro / mcp-colabdev

## Honest task status

Latest campaign target: at least 100 actual edit-and-preview candidates, continuing toward 95/100 visual quality. Current selected candidate: C${design.candidate}; main saved revision: ${progress.revision}; subjective visual score: ${ledger.currentScore}/100. The candidate-count target is complete. The 95-point quality target is not complete. Do not convert passing engineering tests into a 95-point visual score.

The campaign audit verifies ${audit.uniqueCandidateIds} unique reviewed IDs, ${audit.distinctNumericParameterStates} numeric parameter states, ${audit.distinctGeometryFingerprints} geometry fingerprints and ${audit.evidenceImageCount} distinct JPEG views. Material-only edits may share a geometry fingerprint. Rejected candidates and failed screenshot attempts were retained; retries were not counted as new iterations.

Project: ${root}
Root preview build: /build/${projectName}
Pages build: /build/campus-portrait-pages-${suffix}
Source branch: ${branch}
Implementation commit captured at packaging: ${commit}
Repository: ${repository}
Hosted Pages studio: ${pages}
Temporary instance tunnel: ${tunnel}

The figure remains static optimized geometry, not a rigged or animated character. Its metric scale and unseen side/rear details are authored interpretations. The source photograph remains only in the conversation, not in the public project or archive. Use direct visual observation of that reference when continuing; do not perform pixel measurements or image analysis on it.

## Current live services

After the most recent Colab restore, the owned project-only static server uses port 4197, terminal 939. The Vite development viewer uses port 4186, terminal 937. The cloudflared tunnel uses terminal 941 and points only to port 4197. The reusable command controller is terminal 927. These IDs describe the current live runtime, not a guarantee after another restore. Check status/listeners before starting replacements, and never stop unrelated terminals.

The mcp_colabdev Webterm proxy is the intended environment. The separate mcp_aliwebterm /home/admin host is not this development instance. Webterm run commands leave native shells allocated after their command finishes. The global 32-session limit was reached repeatedly; only known completed owned sessions were closed. Reusing controller 927 with webterm write 927 --enter avoids creating a shell for every edit. Wait for a unique JOB_*_EXIT marker and the shell prompt before sending the next command. The terminal's running=true flag alone does not mean a foreground command is active.

The platform occasionally returned: "This tool call was blocked by OpenAI because we couldn't determine the safety status of the request." No execution was assumed for those calls. Smaller, explicit project-scoped operations were used where supported. C56 had a genuine screenshot timeout; its failed attempt is recorded and the retry succeeded with a 120-second timeout in a fresh browser.

## Restore and evidence caveats

A restore removed .agentwork while preserving source, .output and public artifacts. The previous eye batch C45–48 had already rendered; it was reviewed without double-counting or rerendering. The campaign accept action now falls back to the durable public design JSON if its old scratch state is missing.

Some early full-resolution scratch PNGs no longer exist. The durable JPEGs, state JSONs and annotated comparison sheets are preserved and audited. Older sourceCommit fields are present only where they were recorded; source hashes and rendered proof are also retained. Exact historical replay can require the corresponding code version. Loading old controls into the current generator may include later construction changes.

The former 1,000-step cloth experiment is historical numerical evidence, separate from the ${ledger.reviewed} visual candidates. Its accepted deformation remains in src/cloth-state-${suffix}.json. Do not relabel numerical steps as manual visual reviews. Its large frame archive is an optional separate hosted artifact and is excluded from nested source archives.

## Continuation after C100

The latest user asked why work stopped and requested continuation. The visible chat had ended with a Thinking failed interruption, but the live saved project already contained the completed C100 campaign. The continuation did not re-count those existing candidates. It added ${ledger.reviewed-100} further distinct rendered and individually reviewed candidates, starting at C101, on the current source branch.

Accepted changes include continuous cheek/smile relief and controlled facial color, a seamless crown-to-fringe hair shell, a more natural eye-white/iris balance, facially concentrated mesh sampling, a recessed dental arch and tapered backpack contact. These are improvements to a stylized model; they do not establish photographic likeness or the requested 95-point quality target.

Rejected experiments remain reproducible in the source and evidence ledger. The sharp reconstructed nose variants and speckled geometric scalp filaments were NOT selected. Keep noseReconstruction and shellFibers disabled in the accepted state unless a later independently reviewed change fixes their defects. More polygons, darker shading or extra strands are not automatically an improvement.

backpack-contact.js uses a sampled posterior-shirt ray field before the shared posture transform. Its clearance statistics cover only sampled front-facing bag vertices and are NOT a full collision-simulation result. A height taper preserves the rounded bag top; the first untapered variants were rejected for a projecting shelf-like artifact.

face-domain.js concentrates head vertices around the face while leaving the protected baked-shirt topology unchanged. The adaptive face has a higher vertex count than C100; performance on physical phones remains unmeasured. expression-relief.js and skinValue affect the authored skin coloration, not the reference photo or the scene exposure.

## Current implementation map

- design-state.json contains the accepted C${design.candidate} controls. design.js validates replacements and supports explicit reconstruction in a shared renderer.
- anatomy.js owns shared face, eye and mouth boundaries. nose-anatomy.js supplies the continuous bridge, tip and alar displacement. head.js assembles the head, lips, teeth, ears and hair.
- eye-volume.js conforms eye curvature while preserving aperture boundaries. ear-sculpt.js includes a conchal shell, cartilage and connective root.
- hair-materials.js uses portable directional reflection controls. hair-groom.js surrounds the volumetric ponytails with original curved strand sheets; strong specular variants were rejected after rear-view inspection.
- skin-surface.js supplies subtle original pore normals and roughness maps. Normal strength is stored uniformly for glTF portability. Roughness and zero-factor metalness share the packed texture to avoid unnecessary export merging.
- clothing-fit.js is applied after the saved cloth bake. It changes sleeves, shirt width and skirt flare while moving seams coherently. tie-knot.js supplies the tapered cloth knot. accessory-fit.js carries shoe and backpack trim through shape changes.
- hand-details.js adds restrained nails/creases. The forearm ends required real closed skin geometry; merely adding clearance left dark open-looking wrist seams. The selected model uses wrist caps and no extra separate bridge sphere.
- pose-refine.js adjusts the body, clothing, face and accessories together around the waist. The accepted forward lean is modest.
- geometry.js reduces general mesh density but explicitly preserves the baked shirt's topology. Changing that protected grid breaks the cloth-state contract. optimize.js handles batching, welding, degenerate removal and valid tangent bases.
- main.js exposes normal view controls plus detail cameras, independent exported-GLB loading and the rebuild API. Close-up views hide the large title overlay. Runtime asset URLs honor Vite's BASE_URL for Pages.

## Verification and remaining work

Current GLB: ${path.join(out,model)}
Source archive: ${path.join(out,source)}
Review evidence archive: ${path.join(out,evidence)}
Combined verification: ${path.join(out,verification)}
Main metrics: ${qa.stats.triangles} triangles, ${qa.stats.vertices} vertices, ${qa.stats.meshes} material-batched meshes, ${modelBytes} GLB bytes.
Validator: ${validation.issues.numErrors} errors, ${validation.issues.numWarnings} warnings, ${validation.issues.numInfos} informational issues.
Production checks: ${Object.keys(acceptance.checks).length}, passed=${acceptance.passed}, tested URL=${acceptance.url}.

Material comparison checks effective sheen, specular intensity, anisotropy, coating, alpha masking, sidedness, texture transforms, normals and roughness maps. Exported design metadata is checked against the selected campaign ID. Browser tests use software WebGL; actual phone frame rate, memory pressure and thermal behavior remain unmeasured.

The remaining visual gap is substantial enough that 95/100 must not be claimed: facial likeness remains stylized, hair roots/strand structure need more natural treatment, hand topology is simplified, and backpack contact and fine cloth drape can be improved. Start with the actual latest front, face, profile, back and detail-hand images rather than assuming the numeric score guarantees realism.

## Continue and publish

Start new candidate IDs at ${Math.max(...ledger.candidates.map(c=>c.id))+1}. Make real explicit changes, use tools/campaign.mjs, inspect the resulting images and append individual reviews. Keep the strongest accepted candidate rather than promoting a regression. tools/audit-campaign.mjs checks evidence integrity, not artistic quality. tools/qa.mjs and acceptance.mjs verify the selected asset. tools/package-checkpoint.mjs refuses packaging when technical verification or selected-state alignment is incomplete, but permits an honestly labeled below-target checkpoint.

Intermediates belong in .agentwork; important binaries and evidence in .output. Preserve public JPEG/state evidence in Git. Do not publish the reference photograph. Commit significant changes on a model/tool-named branch. The Pages site branch is gpt6-astra-pro-mcp-colabdev/site; preserve its existing history and push normally, never force-replace it. Keep the root-hosted and Pages-subpath builds separate. Verify the deployed commit and run acceptance against the hosted URL after publishing.
`;
await fs.writeFile(handoff,handoffText);await fs.copyFile(handoff,path.join(out,handoff));await fs.copyFile(handoff,path.join(exportsDir,handoff));
await fs.writeFile('PLAN.md',`# Current project plan\n\nLatest target: at least 100 individually reviewed edit-and-render candidates and 95/100 visual quality.\n\nCurrent checkpoint: revision ${progress.revision}, C${design.candidate}, ${ledger.currentScore}/100. Candidate count: ${ledger.reviewed}. The count target is complete; the visual target is not.\n\nContinue with real visual refinement, separate subjective review from numerical tests, preserve rejected candidates and verify exported geometry/materials before publishing. See README.md and ${handoff} for the current workflow and remaining defects.\n`);
progress.downloads=[
 {kind:'GLB',title:'Current 3D character model',description:`Static geometry and embedded textures · ${(modelBytes/1e6).toFixed(2)} MB`,url:'/exports/'+model,path:path.join(out,model)},
 {kind:'SRC',title:'Editable project archive',description:`JavaScript, current model, ${ledger.reviewed} reviewed states and rendered evidence`,url:'/exports/'+source,path:path.join(out,source)},
 {kind:'QA',title:'Verification and review audit',description:`${Object.keys(acceptance.checks).length} acceptance checks · ${ledger.reviewed} reviewed candidates · visual target still unmet`,url:'/exports/'+verification,path:path.join(out,verification)}
];
progress.updatedAt=new Date().toISOString();progress.campaign={reviewed:ledger.reviewed,selected:design.candidate,score:ledger.currentScore,goalComplete:report.goalComplete,evidenceURL:'/exports/'+evidence,auditURL:'/exports/campaign-audit-'+suffix+'.json'};
await fs.writeFile('public/progress/progress.json',JSON.stringify(progress,null,2));
await fs.copyFile('public/progress/progress.json',path.join(out,'progress-'+suffix+'.json'));
await fs.copyFile(path.join(out,'campaign-audit-'+suffix+'.json'),path.join(root,'public/progress',campaign,'audit-'+suffix+'.json'));
execFileSync('tar',['-C',path.join(root,'public/progress'),'-czf',path.join(out,evidence),campaign]);
execFileSync('gzip',['-t',path.join(out,evidence)]);await fs.copyFile(path.join(out,evidence),path.join(exportsDir,evidence));
const sourceFiles=['src','tools','public','index.html','vite.config.js','package.json','package-lock.json','README.md','PLAN.md','PLAN-'+campaign+'.md',handoff,'.gitignore'];
execFileSync('tar',['--exclude=*.tar.gz','--transform',`s,^,${projectName}/,`,'-czf',path.join(out,source),...sourceFiles]);
execFileSync('gzip',['-t',path.join(out,source)]);await fs.copyFile(path.join(out,source),path.join(exportsDir,source));
const listing=execFileSync('tar',['-tzf',path.join(out,source)],{encoding:'utf8',maxBuffer:8*1024*1024}).trim().split('\n');
if(listing.some(file=>file.includes('/node_modules/')||file.includes('/.git/')||file.includes('/.agentwork/')))throw Error('Unexpected private or dependency directory in source archive');
const filenames=[model,source,evidence,verification,handoff,'campaign-audit-'+suffix+'.json',...['front','three-quarter','side','back','face','detail-hands','detail-shoes'].map(v=>v+'-'+suffix+'.png')];
const manifest={project:root,revision:progress.revision,selectedCandidate:design.candidate,reviewedCandidates:ledger.reviewed,visualScore:ledger.currentScore,visualTarget:95,goalComplete:report.goalComplete,implementationCommit:commit,branch,pages,tunnel,sourceArchiveEntries:listing.length,files:[]};
for(const filename of filenames){const bytes=await fs.readFile(path.join(out,filename));manifest.files.push({filename,path:path.join(out,filename),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
await fs.writeFile(path.join(out,'manifest-'+suffix+'.json'),JSON.stringify(manifest,null,2));
await fs.copyFile(path.join(out,'manifest-'+suffix+'.json'),path.join(exportsDir,'manifest-'+suffix+'.json'));
await fs.writeFile(path.join(out,'SHA256SUMS-'+suffix+'.txt'),manifest.files.map(f=>f.sha256+'  '+f.filename).join('\n')+'\n');
await fs.copyFile(path.join(out,'SHA256SUMS-'+suffix+'.txt'),path.join(exportsDir,'SHA256SUMS-'+suffix+'.txt'));
console.log(JSON.stringify({revision:manifest.revision,selected:manifest.selectedCandidate,reviewed:manifest.reviewedCandidates,score:manifest.visualScore,goalComplete:manifest.goalComplete,archiveEntries:listing.length,artifacts:manifest.files.map(({filename,bytes})=>({filename,bytes}))},null,2));
