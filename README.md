# Campus portrait — editable JavaScript 3D study

A real three-dimensional, procedurally authored interpretation of the supplied photograph. The model, clothing patterns and hair textures are original JavaScript geometry/material work. The supplied photograph is not projected onto the model and is not included in the public project or archives.

## Current checkpoint

Revision **31**, selected candidate **C160**, subjective visual assessment **91/100**. The current campaign contains **160 individually reviewed edit-and-render candidates**, **160 distinct numeric parameter states**, **144 geometry fingerprints** and **336 verified rendered JPEGs**. Rejected designs remain in the record. Material-only edits can share a geometry fingerprint.

The requested minimum of 100 reviewed candidates is complete. The **95/100 visual target is not achieved**. This remains a stylized study, not a photographic reconstruction or a claimed AAA-quality asset. Passing technical checks does not change the subjective visual assessment.

The older 1,000-step numerical cloth experiment is preserved separately and is not counted as 1,000 manual visual reviews. Current accepted model checkpoints and candidate counts are also separate: 31 saved model checkpoints versus 160 campaign candidates.

## Preview and files

Hosted studio: https://ecooxai.github.io/campus-portrait-gpt6-astra-pro-mcp-colabdev/

Editable source repository: https://github.com/ecooxai/campus-portrait-gpt6-astra-pro-mcp-colabdev

Temporary live-instance preview: https://wellington-assessed-lobby-precision.trycloudflare.com

Model: public/exports/campus-portrait-gpt6-astra-pro-mcp-colabdev.glb

Complete visual-review evidence: public/exports/campaign-evidence-gpt6-astra-pro-mcp-colabdev.tar.gz

Combined verification report: public/exports/verification-gpt6-astra-pro-mcp-colabdev.json

Detailed continuation notes: HANDOFF-gpt6-astra-pro-mcp-colabdev.md

The live viewer offers orbiting, pinch zoom, five named camera views, wireframe, a turntable, render-resolution selection, PNG export and GLB export. Its Model source selector independently reloads the saved GLB. The campaign panel includes every individual score, design state and annotated comparison sheet.

## Run the editable viewer

```bash
npm ci
npm run dev
# http://127.0.0.1:4186
```

For a portable static build:

```bash
npm run build:portable
PREVIEW_ROOT=./dist PORT=4197 npm run serve
# http://127.0.0.1:4197
```

The Colab build command, npm run build, writes to /build/campus-portrait-gpt6-astra-pro-mcp-colabdev. BUILD_DIR overrides this destination. The static server serves only its configured build directory and denies private dot-paths; do not expose the project root with a generic file server.

## Reproduce verification

Start the development viewer before the render/export suite. Build and start the static viewer before acceptance. Set CHROMIUM_PATH on machines where Chrome is not /home/dev/.local/bin/chromium.

```bash
node tools/qa.mjs --revision=31 --views=front,three-quarter,side,back,face,detail-hands,detail-shoes
node tools/audit-campaign.mjs
npm run build
# Start PORT=4197 npm run serve in another terminal.
PREVIEW_URL=http://127.0.0.1:4197 node tools/acceptance.mjs
```

The render suite checks actual browser errors, named renders, UI controls, layout and GLB validation. Acceptance checks independently imported geometry and material factors, embedded images/design metadata, touch orbit and pinch gestures, downloads, private-path handling and the campaign counter. All browser evidence here uses headless Chromium with SwiftShader software WebGL, not a physical phone GPU benchmark.

## Continue visual refinement

The editable selection is src/design-state.json. Shared design controls, anatomy and the browser rebuild API make each candidate reproducible. The runner requires a Git checkout or a locally initialized committed repository for source provenance.

```bash
node tools/campaign.mjs render path/to/candidate-spec.json
# Inspect the generated contact sheet and full-size views with vision.
node tools/campaign.mjs review path/to/individual-reviews.json
node tools/campaign.mjs accept CANDIDATE_NUMBER
node tools/annotate-campaign.mjs
node tools/publish-campaign.mjs
```

A candidate specification contains a group, view names and an array of explicit id/label/changes records. Every reviewed candidate needs an actual edit, reconstruction, rendered views and an individual score with concrete findings. Do not count retries, repeated screenshots or numerical assertions as extra visual iterations. Failed screenshot attempts are retained on the original candidate record.

Durable JPEGs and design JSONs are included in the archive. Some early scratch PNGs were not retained by a runtime restore. Reproducing an earlier candidate exactly may require its historical source commit; applying an old state to a later generator is not a guarantee of identical geometry. The current selected model can be regenerated from the included current source.

## Asset and engineering limits

The current GLB is 17,418,320 bytes, with 359,247 triangles and 54 material-batched meshes. The source generator remains editable; optimized GLB meshes preserve original part names and design metadata. No skeleton, skinning, facial blendshapes or animation is included.

Main remaining visual work: closer facial likeness, finer hair structure/root transitions, more natural hand anatomy, garment micro-drape and backpack contact. Unseen side/rear details and metric scale are authored interpretations, not measurements recovered from the photograph.

## Source map

src/anatomy.js and src/nose-anatomy.js define the continuous facial profile and shared feature boundaries. src/head.js, face-details.js, eye-volume.js, ear-sculpt.js and hair-groom.js build the head and hair. src/body.js assembles the clothed figure. clothing-fit.js, accessory-fit.js and pose-refine.js carry details coherently through fitted geometry. skin-surface.js and materials.js author portable textures/materials. geometry.js preserves the saved shirt topology while controlling other mesh densities. optimize.js batches materials, welds vertices and repairs export normals/tangents.

The source archive excludes dependency installations, Git history, scratch directories and nested archive files. The large historical numerical-cloth frame archive is a separate optional hosted download; its small ledger, baked state and integrity report are retained. No external font file is bundled. See public/THIRD_PARTY_NOTICES-gpt6-astra-pro-mcp-colabdev.txt for the included Three.js MIT notice.


# Portrait-anatomy continuation: C141–C160

This historical continuation resumed the actual saved C140 checkpoint, not the older C44 state visible in the chat. It added 20 distinct edit-and-render candidates, each individually reviewed in the existing campaign ledger. At the end of this pass the selected design is C160, revision 31, with a subjective working visual score of 91/100. The 100-candidate count requirement is exceeded; the 95-point quality requirement is not achieved. Follow the current live ledger rather than treating this historical note as the latest state in later continuations.

## Accepted changes

C144 reduces duplicated narrow smile creases and the over-pronounced philtrum. C148 replaces the detached lip border with a continuous skin-merging vermilion surface, a warmer recessed cavity and separately rounded teeth. C152 uses original fine-strand pigment and root-sensitive roughness to reduce the broad plastic-like crown highlight. C153 replaces hard nostril strokes with softly blended linings aligned to the sculpted pockets. C160 makes a conservative correction to crown height and temple clearance. More aggressive variants were reviewed and rejected; their scores and images remain in the ledger.

## Editable modules and contracts

- src/mouth-curves.js is the single shared definition for the facial opening, lips and teeth. Do not edit a mouth boundary in only one mesh.
- src/mouth-sculpt.js builds the skin-merging lip volume, oral lining, enamel and low-contrast recessed tongue. Enamel is shared across teeth for batching.
- src/hair-strand-atlas.js authors both the strand pigment and root-dependent roughness textures. It reads no photograph or external image.
- src/soft-nostrils.js conforms the new lining to the same continuous face surface as the sculpted recess.
- expression-relief.js and anatomy.js now expose separate crease, philtrum and nasal-pocket strengths.
- hair-shell.js exposes restrained templeTuck and crownLowering controls.
- main.js adds face-profile-left and side-left audit cameras. The normal UI remains compact.

All code, textures and model geometry remain JavaScript-authored. The reference photograph was reviewed visually and was not analyzed by code or included in the public project. No Blender or image-generation model was used.

## Verification at this checkpoint

The selected model was rendered in 10 views, including both side profiles and detail views of the hands and shoes. The GLB contains 359,247 triangles and 54 batched meshes; its size is 17,418,320 bytes. Validation returned 0 errors and 0 warnings. The production viewer passed 43 acceptance checks, including the new mouth parts, nasal linings, hair maps and both profile cameras. These are headless Chromium/software-WebGL tests, not measurements of physical-phone performance. The model is static, without a skeleton or animation.

## Remaining quality gap

The face and hair remain visibly stylized. Side-view eye and lip anatomy, finer hair-root structure, hand topology and closer photographic likeness still need improvement before a 95/100 assessment would be defensible. Passing the engineering tests does not close that visual gap. Preserve the strongest accepted design rather than increasing its score to satisfy the target.

## Recovery and continuation

Source branch for this pass: gpt6-astra-pro-mcp-colabdev/portrait-anatomy-c141. The reusable command controller is terminal 927; inspect its completion marker and prompt before sending another command. Some completed helper shells reached the global session cap; only known completed shells owned by this continuation were closed. The initial uncommitted audit JSON was preserved in .agentwork/portrait-anatomy-gpt6-astra-pro-mcp-colabdev/preexisting-audit.json before the current audit was regenerated. Combined tool calls occasionally received a platform block; no execution was assumed for them, and supported smaller project-scoped operations were used.

The newest available candidate ID at this checkpoint is 160. Future work must read the current ledger before choosing the next ID. Publish only the selected, verified model; do not expose the reference photograph or private workspace files.
