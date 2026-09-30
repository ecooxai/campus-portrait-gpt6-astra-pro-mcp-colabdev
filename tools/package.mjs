import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const suffix='gpt6-astra-pro-mcp-colabdev';
const projectName=`campus-portrait-${suffix}`;
const project=process.cwd();
const out=path.join(project,'.output');
const exportsDir=path.join(project,'public','exports');
const readJSON=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const progress=await readJSON('public/progress/progress.json');
const qa=await readJSON(`.output/qa-${suffix}.json`);
const acceptance=await readJSON(`.output/acceptance-${suffix}.json`);
const validation=await readJSON(`.output/gltf-validation-${suffix}.json`);
const numerical=await readJSON(`.output/cloth-integrity-${suffix}.json`);
if(!acceptance.passed||qa.errors.length||validation.issues.numErrors||validation.issues.numWarnings)throw new Error('Package refused: QA or export validation has not passed.');
if(qa.revision!==progress.revision)throw new Error('Package refused: latest model revision has not been reviewed.');
await fs.mkdir(exportsDir,{recursive:true});
const implementationCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const branch=execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim();
const preview=(await fs.readFile('.agentwork/PREVIEW_URL.txt','utf8')).trim();
const pages=await fs.readFile('.agentwork/PAGES_URL.txt','utf8').then(t=>t.trim()).catch(()=>'');
const repository='https://github.com/ecooxai/campus-portrait-gpt6-astra-pro-mcp-colabdev';
const modelName=`campus-portrait-${suffix}.glb`;
const sourceName=`campus-portrait-source-${suffix}.tar.gz`;
const reportName=`verification-${suffix}.json`;
const handoffName=`HANDOFF-${suffix}.md`;
const modelBytes=(await fs.stat(path.join(out,modelName))).size;
const report={project:projectName,revision:progress.revision,visualScore:progress.score,requestedVisualScore:'85/100',requestedIterations:1000,visualTargetMet:progress.score>=85,numericalRefinement:numerical,iterationScope:'Numerical deformation/render/test passes are separate from manually reviewed model revisions',completedReviewedRevisions:progress.iterations.length,implementationCommit,branch,hosting:{repository,pages,temporaryTunnel:preview},renderTests:qa,productionAcceptance:acceptance,gltfValidation:validation};
await fs.writeFile(path.join(out,reportName),JSON.stringify(report,null,2));
await fs.copyFile(path.join(out,reportName),path.join(exportsDir,reportName));

const readme=`# Campus portrait — 3D character study

A JavaScript / Three.js reconstruction of the clothing, hair and relaxed stance in the supplied photograph. The character is real three-dimensional geometry, with independently modeled side and rear views. All character geometry and cloth patterns are authored procedurally; the photograph is not projected onto the mesh or included in this project.

## Current checkpoint

Revision **${progress.revision}**, **${progress.score}/100** subjective visual score, **${progress.iterations.length} reviewed model revisions**. The active target is **85/100** and at least **1,000 iterations**. A completed garment run contains **${numerical.passes} numerical deformation/render/test passes**, not 1,000 manually reviewed artistic revisions. The visual 85-point target **${progress.score>=85?"is recorded as reached by the current subjective review":"has not been reached"}**. Passing automated tests is not a claim that the likeness or artistic target is achieved. The model is static: no skeleton, skinning, facial blendshapes or locomotion animations.

The main remaining limitations are photographic facial likeness, fine hair structure, natural garment drape, hand refinement and unmeasured real-device frame rate. Unseen views are an authored interpretation, not facts recovered from the photograph.

## Numerical refinement evidence

The cloth ledger records ${numerical.passes} sequential passes, ${numerical.uniqueGeometryHashes} distinct mesh-state hashes and ${numerical.uniqueImageHashes} distinct rendered images. Every saved pass-frame hash was verified. The completed run is applied at 90% strength to the shirt, with attached trim carried by its deformation. The constraint metric is not a likeness score.

Time-lapse: public/exports/cloth-refinement-${suffix}.mp4

Full frame archive: public/exports/cloth-evidence-${suffix}.tar.gz

Pass ledger: public/exports/cloth-refinement-${suffix}.jsonl

## Hosting

Hosted studio: ${pages||'Not deployed'}

Editable source repository: ${repository}/tree/${branch}

The hosted studio is published from the dedicated gpt6-astra-pro-mcp-colabdev/site branch. It does not depend on the live Colab runtime. The temporary live-instance tunnel remains ${preview}.

## Run the editable project

Tested with Node 22.23.3, Three.js 0.186.1, Vite 8.3.1 and Playwright 1.63.0. Dependency versions are preserved in package-lock.json.

\`\`\`bash
npm ci
npm run dev
# Open http://127.0.0.1:4186
\`\`\`

For a portable production directory:

\`\`\`bash
npm run build:portable
PREVIEW_ROOT=./dist PORT=4196 npm run serve
# Open http://127.0.0.1:4196
\`\`\`

The Colab production command is \`npm run build\`, which writes to \`/build/${projectName}\`. Set BUILD_DIR to override that path. The static preview server serves only the configured build directory; it does not expose the project root or provide directory listings.

## Reproduce tests

Start the development server before the rendering test. Start the production server after building and before acceptance. On another machine, set CHROMIUM_PATH to its installed Chromium or Chrome executable.

\`\`\`bash
npm run qa -- --revision=${progress.revision}
npm run build
npm run serve
# In another terminal:
npm run acceptance
\`\`\`

The current Colab Chromium executable is /home/dev/.local/bin/chromium. Tests use headless Chromium with SwiftShader software WebGL. They check five model views, browser errors, camera controls, wireframe, turntable, mobile layout, touch orbit, pinch zoom, 44-pixel touch targets, downloads, private-path blocking, embedded GLB images and geometry/material round-trip equivalence. These tests are **not** measurements of physical Android/iOS devices or sustained GPU frame rates.

## Artifacts

- Model: \`public/exports/${modelName}\` (${modelBytes.toLocaleString('en-US')} bytes).
- Geometry: ${qa.stats.triangles.toLocaleString('en-US')} triangles; ${qa.stats.vertices.toLocaleString('en-US')} vertices; ${qa.stats.meshes} material-batched meshes.
- Five reviewed renders: \`public/progress/*-${suffix}.png\`.
- Review journal: \`public/progress/progress.json\`.
- Combined test report: \`public/exports/${reportName}\`.
- Next-agent context: \`${handoffName}\`.

The source archive includes the current model, embedded-texture GLB, review images, code, test scripts and documentation. It excludes node_modules, Git history, scratch files and the supplied photograph. Source geometry is editable in the authoring modules; the optimized GLB groups parts by material and preserves original part names in mesh metadata.

## Controls

Drag or swipe to orbit; pinch or scroll to zoom. Front, three-quarter, side, back and face presets are available. The Model source selector independently loads the saved GLB for comparison. Turntable, wireframe, resolution selection and PNG/GLB exports are available. The journal and file gallery poll for updates; a newer model revision reloads the viewer while retaining the selected view.

## Source map

- src/geometry.js — surfaces, monotone profile interpolation, ribbons and mesh helpers.
- src/body.js — clothing, legs, shoes, hands, backpack and character assembly.
- src/head.js — facial shape, eyes, lips, teeth, ears and layered hair.
- src/materials.js — original procedural textures and physically based materials.
- src/optimize.js — static material batching, vertex welding, degenerate-triangle removal and tangents.
- src/main.js — lighting, camera, controls, export, independent GLB loading and live progress.
- tools/qa.mjs, tools/acceptance.mjs — rendered and interactive tests.
- tools/review.mjs — append a real reviewed revision; never inflate the count.
- tools/package.mjs — gated archive and handoff packaging.

## Attribution

Three.js and its bundled addons are used under their included MIT license. See public/THIRD_PARTY_NOTICES-${suffix}.txt. No external character mesh, photographic texture, image-generation output or font file is included.
`;
await fs.writeFile('README.md',readme);
const handoff=`# Next-agent handoff — GPT-6 Astra Pro / mcp-colabdev

## Task and honest status

Build a JS/WebGL 3D model of the supplied uniform photograph. Work in Colab dev, use JavaScript and headless Chrome, do not use Blender or image generation, and do not analyze the source photograph with code. Preserve all viewpoints as real geometry. Latest user target: at least 1,000 iterations and 85/100. The completed numerical garment run has 1,000 deformation/render/test passes; it is not 1,000 manual artistic reviews. Current checkpoint: **${progress.iterations.length} reviewed model revisions, ${progress.score}/100**, target still unmet. Review history: ${progress.iterations.map(i=>`R${i.id}: ${i.score}`).join(' → ')}. Regression scores were not hidden.

Project: ${project}
Build: /build/${projectName}
Branch: ${branch}
Implementation commit at packaging: ${implementationCommit}
Public quick tunnel: ${preview}
GitHub Pages preview: ${pages||'not deployed'}
Editable source repository: ${repository}
Pages branch: gpt6-astra-pro-mcp-colabdev/site

The quick tunnel is temporary and depends on the live instance. The separate GitHub Pages deployment serves its dedicated static site branch independently of Colab. Do not confuse the two URLs. A Colab runtime backup completed successfully before the final GitHub publishing work; later code and static artifacts are persisted in the repository. The supplied photograph remains in the conversation, not in this public project. Use vision, not image-pixel extraction, when continuing its likeness.

## Live services — do not duplicate or stop unrelated work

- Vite developer preview: port 4186, Webterm terminal 729.
- Project-only static production preview: port 4197, terminal 788.
- cloudflared HTTP/2 quick tunnel to port 4197: terminal 785.

Use the mcp_colabdev Webterm proxy, not mcp_aliwebterm's separate /home/admin host. A running command should be read by terminal ID, not restarted. Colab was healthy throughout development except that the 32 native-session limit was reached. Only this task's finished command terminals were stopped to reclaim slots; the three services above were retained. A webterm run can finish its command while its native shell remains running. Clean up only owned completed terminals.

## Read and review first

Read README.md, PLAN.md, public/progress/progress.json, the combined verification report and relevant source functions. View the actual latest front, three-quarter, side, back and face PNGs. Older review evidence is retained only in .agentwork/reviews/rNNN-${suffix}/ on the live instance, not in the public gallery or source archive. Do not count an automated assertion as a new visual revision or claim 85 based on engineering tests.

## Main visual weaknesses

1. The face is still a stylized approximation: refine cheek/jaw proportions, eyelid construction, nose planes and smile anatomy using the photo visually.
2. Hair still reads as sculpted clumps, especially side and rear. Improve layered volume and strand breakup without reintroducing intersecting micro-fibers.
3. Collar, tie hang, cotton folds, forearm/hand anatomy and loafer shape can be more natural.
4. Real-device performance is unmeasured. The current 40 batched meshes and roughly 282k triangles are a reduction, not proof of a production mobile frame-rate target.

## This continuation

The active source branch is the model/tool-named likeness85-1000 branch shown above. The first ten reviews belong to the prior checkpoint; the subsequent reviews belong to this continuation. Facial surface evaluation now matches the head, duplicated seam normals are averaged, eyelids share the exact skin palette, the eye openings are recessed, and the stance and neckline have been refined.

The cloth run is deterministic and independent of reference-image pixels. src/cloth-constraints.js and src/cloth-refine.js define it; tools/cloth-run.mjs saves every pass. src/cloth-state-${suffix}.json preserves the endpoint. src/cloth-bake.js blends it at 0.90 and moves trim before src/garment-fit.js adjusts the shoulders/collar. Do not change shirt topology without updating the saved state and re-reviewing it.

Normal-map pole tangents were repaired to unit orthogonal bases with valid handedness. Unequal normal-map strength was baked into the texture so the scalar glTF normal scale remains faithful. Reflection adjustments use KHR_materials_specular rather than unexported per-material environment intensity.

The initial large candidate captures encountered a resize/render-order bug. The 1,000 small pass frames and their hashes are valid. tools/cloth-review.mjs regenerated the four large raw-endpoint views with explicit render ordering, and the integrated model was independently rendered in all five standard views. The numerical runner now waits after resizing and explicitly renders before capture.

The numerical evidence panel discloses the separate counters. Do not relabel numerical constraint scores as visual scores or mark the 85-point target complete without a justified visual review.

## Important technical lessons

- smoothProfile uses monotone PCHIP interpolation; the recovered smoothstep interpolation created terraced skin/clothing contours.
- A tangent-oriented ribbon is required for angled forearms; horizontal loft sections flattened the clasped-arm pose.
- The lower lip and dental surface require correct winding. The first continuous dental arch was accidentally inward-facing; it was repaired and re-reviewed.
- Dense fringe micro-fibers intersected the surface and caused black speckling. Merely disabling shadow casting did not resolve it; strand direction is now primarily in an original procedural texture.
- Standard tangent-space normal maps replaced the unsupported EXT_materials_bump export extension.
- The installed exporter omitted the separate sheen-intensity scalar. Materials now bake sheen intensity into sheenColor and set sheen=1; independent GLB loading checks effective material factors.
- Texture anisotropy is a viewer setting, not a portable GLB sampler property. Imported textures receive the same supported anisotropy as the authoring viewer.
- Material batching preserves head transforms, part-name metadata and per-batch shadow flags. Degenerate triangles are removed before export.
- The initial wireframe test incorrectly included unused material objects. Current tests inspect mesh-attached materials. Omitted zero-sheen values are normalized to zero before comparison, rather than treated as a visual mismatch.

## Geometry and assets

Current GLB: ${path.join(out,modelName)}
Combined report: ${path.join(out,reportName)}
GLB validator: ${validation.issues.numErrors} errors, ${validation.issues.numWarnings} warnings, ${validation.issues.numInfos} informational messages.
Bounds in model meters: ${qa.stats.bounds.map(n=>n.toFixed(4)).join(' × ')}. This is authored scale, not an inferred measurement of the photographed person.
No rig, skinning or animation is present. The generator modules remain the editable source; the GLB is a static optimized export with embedded textures.

## GitHub Pages deployment

Vite supports BASE_URL. For Pages use BASE_URL=/campus-portrait-gpt6-astra-pro-mcp-colabdev/ and BUILD_DIR=/build/campus-portrait-pages-gpt6-astra-pro-mcp-colabdev. Do not overwrite the root-hosted build with the Pages subpath build. Runtime file URLs are resolved through import.meta.env.BASE_URL. The isolated site repository is .agentwork/pages-likeness85-gpt6-astra-pro-mcp-colabdev; copy only generated files into it and push its site branch. The authenticated GitHub CLI is used through a per-command credential helper, not a printed token or changed global Git configuration. Run production acceptance with PREVIEW_URL set to the Pages URL after deployment. The tools/deploy-pages.sh file documents these scoped steps; it does not delete other workspace files.

## Continue / publish

Make an actual owned change, run tools/qa.mjs with the next revision number, inspect rendered evidence, and append a justified score with tools/review.mjs. Run the production acceptance after rebuilding, then package only when it passes. Keep binaries in .output and scratch work in .agentwork. Rebuild with npm run build to update the project-only public server; do not expose the development project root. Commit important changes on the existing model/tool-named branch. Do not claim unattended continuation or completed target counts.
`;
await fs.writeFile(handoffName,handoff);
await fs.copyFile(handoffName,path.join(out,handoffName));
await fs.copyFile(handoffName,path.join(exportsDir,handoffName));
const thirdParty=`THIRD-PARTY NOTICE\n\nThree.js (including its bundled addons)\n\n${await fs.readFile('node_modules/three/LICENSE','utf8')}`;
await fs.writeFile(`public/THIRD_PARTY_NOTICES-${suffix}.txt`,thirdParty);
progress.downloads=[
 {kind:'GLB',title:'3D character model',description:`Static geometry and embedded textures · ${(modelBytes/1e6).toFixed(2)} MB`,url:`/exports/${modelName}`,path:path.join(out,modelName)},
 {kind:'SRC',title:'Editable source archive',description:'JavaScript, model, renders, tests and handoff',url:`/exports/${sourceName}`,path:path.join(out,sourceName)},
 {kind:'QA',title:'Verification report',description:`${Object.keys(acceptance.checks).length} acceptance checks · validator ${validation.issues.numErrors} errors / ${validation.issues.numWarnings} warnings`,url:`/exports/${reportName}`,path:path.join(out,reportName)}
];
progress.updatedAt=new Date().toISOString();
await fs.writeFile('public/progress/progress.json',JSON.stringify(progress,null,2));
await fs.copyFile('public/progress/progress.json',path.join(out,`progress-${suffix}.json`));
const sourceFiles=['src','tools','public','index.html','vite.config.js','package.json','package-lock.json','README.md','PLAN.md',handoffName,'.gitignore'];
execFileSync('tar',['--exclude=*.tar.gz','--transform',`s,^,${projectName}/,`,'-czf',path.join(out,sourceName),...sourceFiles],{stdio:'inherit'});
execFileSync('gzip',['-t',path.join(out,sourceName)]);
await fs.copyFile(path.join(out,sourceName),path.join(exportsDir,sourceName));
const names=[modelName,sourceName,reportName,handoffName,`cloth-refinement-${suffix}.mp4`,`cloth-evidence-${suffix}.tar.gz`,`cloth-refinement-${suffix}.jsonl`,`cloth-integrity-${suffix}.json`,...['front','three-quarter','side','back','face'].map(v=>`${v}-${suffix}.png`)];
const manifest={project,buildDirectory:`/build/${projectName}`,revision:progress.revision,visualScore:progress.score,reviewedRevisions:progress.iterations.length,implementationCommit,branch,preview,pages,repository,files:[]};
for(const filename of names){const data=await fs.readFile(path.join(out,filename));manifest.files.push({filename,path:path.join(out,filename),bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
await fs.writeFile(path.join(out,`manifest-${suffix}.json`),JSON.stringify(manifest,null,2));
await fs.writeFile(path.join(out,`SHA256SUMS-${suffix}.txt`),manifest.files.map(f=>`${f.sha256}  ${f.filename}`).join('\n')+'\n');
console.log(JSON.stringify({revision:progress.revision,score:progress.score,files:manifest.files.map(({filename,bytes})=>({filename,bytes}))},null,2));
