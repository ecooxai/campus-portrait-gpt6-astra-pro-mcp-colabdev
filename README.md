# Campus portrait — 3D character study

A JavaScript / Three.js reconstruction of the clothing, hair and relaxed stance in the supplied photograph. The character is real three-dimensional geometry, with independently modeled side and rear views. All character geometry and cloth patterns are authored procedurally; the photograph is not projected onto the mesh or included in this project.

## Current checkpoint

Revision **25**, **80/100** subjective visual score, **25 reviewed model revisions**. The active target is **85/100** and at least **1,000 iterations**. A completed garment run contains **1000 numerical deformation/render/test passes**, not 1,000 manually reviewed artistic revisions. The visual 85-point target **has not been reached**. Passing automated tests is not a claim that the likeness or artistic target is achieved. The model is static: no skeleton, skinning, facial blendshapes or locomotion animations.

The main remaining limitations are photographic facial likeness, fine hair structure, natural garment drape, hand refinement and unmeasured real-device frame rate. Unseen views are an authored interpretation, not facts recovered from the photograph.

## Numerical refinement evidence

The cloth ledger records 1000 sequential passes, 1000 distinct mesh-state hashes and 976 distinct rendered images. Every saved pass-frame hash was verified. The completed run is applied at 90% strength to the shirt, with attached trim carried by its deformation. The constraint metric is not a likeness score.

Time-lapse: public/exports/cloth-refinement-gpt6-astra-pro-mcp-colabdev.mp4

Full frame archive: public/exports/cloth-evidence-gpt6-astra-pro-mcp-colabdev.tar.gz

Pass ledger: public/exports/cloth-refinement-gpt6-astra-pro-mcp-colabdev.jsonl

## Hosting

Hosted studio: https://ecooxai.github.io/campus-portrait-gpt6-astra-pro-mcp-colabdev/

Editable source repository: https://github.com/ecooxai/campus-portrait-gpt6-astra-pro-mcp-colabdev/tree/gpt6-astra-pro-mcp-colabdev/likeness85-1000

The hosted studio is published from the dedicated gpt6-astra-pro-mcp-colabdev/site branch. It does not depend on the live Colab runtime. The temporary live-instance tunnel remains https://pet-loose-tied-prepare.trycloudflare.com.

## Run the editable project

Tested with Node 22.23.3, Three.js 0.186.1, Vite 8.3.1 and Playwright 1.63.0. Dependency versions are preserved in package-lock.json.

```bash
npm ci
npm run dev
# Open http://127.0.0.1:4186
```

For a portable production directory:

```bash
npm run build:portable
PREVIEW_ROOT=./dist PORT=4196 npm run serve
# Open http://127.0.0.1:4196
```

The Colab production command is `npm run build`, which writes to `/build/campus-portrait-gpt6-astra-pro-mcp-colabdev`. Set BUILD_DIR to override that path. The static preview server serves only the configured build directory; it does not expose the project root or provide directory listings.

## Reproduce tests

Start the development server before the rendering test. Start the production server after building and before acceptance. On another machine, set CHROMIUM_PATH to its installed Chromium or Chrome executable.

```bash
npm run qa -- --revision=25
npm run build
npm run serve
# In another terminal:
npm run acceptance
```

The current Colab Chromium executable is /home/dev/.local/bin/chromium. Tests use headless Chromium with SwiftShader software WebGL. They check five model views, browser errors, camera controls, wireframe, turntable, mobile layout, touch orbit, pinch zoom, 44-pixel touch targets, downloads, private-path blocking, embedded GLB images and geometry/material round-trip equivalence. These tests are **not** measurements of physical Android/iOS devices or sustained GPU frame rates.

## Artifacts

- Model: `public/exports/campus-portrait-gpt6-astra-pro-mcp-colabdev.glb` (10,882,848 bytes).
- Geometry: 368,909 triangles; 206,192 vertices; 41 material-batched meshes.
- Five reviewed renders: `public/progress/*-gpt6-astra-pro-mcp-colabdev.png`.
- Review journal: `public/progress/progress.json`.
- Combined test report: `public/exports/verification-gpt6-astra-pro-mcp-colabdev.json`.
- Next-agent context: `HANDOFF-gpt6-astra-pro-mcp-colabdev.md`.

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

Three.js and its bundled addons are used under their included MIT license. See public/THIRD_PARTY_NOTICES-gpt6-astra-pro-mcp-colabdev.txt. No external character mesh, photographic texture, image-generation output or font file is included.
