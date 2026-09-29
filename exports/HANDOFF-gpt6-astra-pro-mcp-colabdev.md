# Next-agent handoff — GPT-6 Astra Pro / mcp-colabdev

## Task and honest status

Build a JS/WebGL 3D model of the supplied uniform photograph. Work in Colab dev, use JavaScript and headless Chrome, do not use Blender or image generation, and do not analyze the source photograph with code. Preserve all viewpoints as real geometry. User target: at least 20,000 edit/review iterations and greater than 95/100. Current checkpoint: **10 reviewed model revisions, 70/100**, target still unmet. Review history: R1: 43 → R2: 57 → R3: 61 → R4: 63 → R5: 66 → R6: 67 → R7: 66 → R8: 69 → R9: 70 → R10: 70. Regression scores were not hidden.

Project: /home/dev/project/3d/campus-portrait-gpt6-astra-pro-mcp-colabdev
Build: /build/campus-portrait-gpt6-astra-pro-mcp-colabdev
Branch: gpt6-astra-pro-mcp-colabdev/recovery-body-viewer
Implementation commit at packaging: 15dd7eeebe6c5096baff4857caf2711ff7cb5242
Public quick tunnel: https://contrary-commands-usual-earn.trycloudflare.com
GitHub Pages preview: https://ecooxai.github.io/campus-portrait-gpt6-astra-pro-mcp-colabdev/
Editable source repository: https://github.com/ecooxai/campus-portrait-gpt6-astra-pro-mcp-colabdev
Pages branch: gpt6-astra-pro-mcp-colabdev/site

The quick tunnel is temporary and depends on the live instance. The separate GitHub Pages deployment serves its dedicated static site branch independently of Colab. Do not confuse the two URLs. A Colab runtime backup completed successfully before the final GitHub publishing work; later code and static artifacts are persisted in the repository. The supplied photograph remains in the conversation, not in this public project. Use vision, not image-pixel extraction, when continuing its likeness.

## Live services — do not duplicate or stop unrelated work

- Vite developer preview: port 4186, Webterm terminal 673.
- Project-only static production preview: port 4196, terminal 684.
- cloudflared HTTP/2 quick tunnel to port 4196: terminal 685.

Use the mcp_colabdev Webterm proxy, not mcp_aliwebterm's separate /home/admin host. A running command should be read by terminal ID, not restarted. Colab was healthy throughout development except that the 32 native-session limit was reached. Only this task's finished command terminals were stopped to reclaim slots; the three services above were retained. A webterm run can finish its command while its native shell remains running. Clean up only owned completed terminals.

## Read and review first

Read README.md, PLAN.md, public/progress/progress.json, the combined verification report and relevant source functions. View the actual latest front, three-quarter, side, back and face PNGs. Older review evidence is retained only in .agentwork/reviews/rNNN-gpt6-astra-pro-mcp-colabdev/ on the live instance, not in the public gallery or source archive. Do not count an automated assertion as a new visual revision or claim 95 based on engineering tests.

## Main visual weaknesses

1. The face is still a stylized approximation: refine cheek/jaw proportions, eyelid construction, nose planes and smile anatomy using the photo visually.
2. Hair still reads as sculpted clumps, especially side and rear. Improve layered volume and strand breakup without reintroducing intersecting micro-fibers.
3. Collar, tie hang, cotton folds, forearm/hand anatomy and loafer shape can be more natural.
4. Real-device performance is unmeasured. The current 40 batched meshes and roughly 282k triangles are a reduction, not proof of a production mobile frame-rate target.

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

Current GLB: /home/dev/project/3d/campus-portrait-gpt6-astra-pro-mcp-colabdev/.output/campus-portrait-gpt6-astra-pro-mcp-colabdev.glb
Combined report: /home/dev/project/3d/campus-portrait-gpt6-astra-pro-mcp-colabdev/.output/verification-gpt6-astra-pro-mcp-colabdev.json
GLB validator: 0 errors, 0 warnings, 0 informational messages.
Bounds in model meters: 0.4973 × 1.7007 × 0.4683. This is authored scale, not an inferred measurement of the photographed person.
No rig, skinning or animation is present. The generator modules remain the editable source; the GLB is a static optimized export with embedded textures.

## GitHub Pages deployment

Vite supports BASE_URL. For Pages use BASE_URL=/campus-portrait-gpt6-astra-pro-mcp-colabdev/ and BUILD_DIR=/build/campus-portrait-pages-gpt6-astra-pro-mcp-colabdev. Do not overwrite the root-hosted build with the Pages subpath build. Runtime file URLs are resolved through import.meta.env.BASE_URL. The isolated site repository is .agentwork/pages-gpt6-astra-pro-mcp-colabdev; copy only generated files into it and push its site branch. The authenticated GitHub CLI is used through a per-command credential helper, not a printed token or changed global Git configuration. Run production acceptance with PREVIEW_URL set to the Pages URL after deployment. The tools/deploy-pages.sh file documents these scoped steps; it does not delete other workspace files.

## Continue / publish

Make an actual owned change, run tools/qa.mjs with the next revision number, inspect rendered evidence, and append a justified score with tools/review.mjs. Run the production acceptance after rebuilding, then package only when it passes. Keep binaries in .output and scratch work in .agentwork. Rebuild with npm run build to update the project-only public server; do not expose the development project root. Commit important changes on the existing model/tool-named branch. Do not claim unattended continuation or completed target counts.
