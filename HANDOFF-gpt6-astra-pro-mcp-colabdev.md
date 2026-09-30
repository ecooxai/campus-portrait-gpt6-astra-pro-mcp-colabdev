# Continuation handoff — GPT-6 Astra Pro / mcp-colabdev

## Honest task status

Latest campaign target: at least 100 actual edit-and-preview candidates, continuing toward 95/100 visual quality. Current selected candidate: C100; main saved revision: 29; subjective visual score: 88.5/100. The candidate-count target is complete. The 95-point quality target is not complete. Do not convert passing engineering tests into a 95-point visual score.

The campaign audit verifies 100 unique reviewed IDs, 100 numeric parameter states, 91 geometry fingerprints and 216 distinct JPEG views. Material-only edits may share a geometry fingerprint. Rejected candidates and failed screenshot attempts were retained; retries were not counted as new iterations.

Project: /home/dev/project/3d/campus-portrait-gpt6-astra-pro-mcp-colabdev
Root preview build: /build/campus-portrait-gpt6-astra-pro-mcp-colabdev
Pages build: /build/campus-portrait-pages-gpt6-astra-pro-mcp-colabdev
Source branch: gpt6-astra-pro-mcp-colabdev/likeness95-100
Implementation commit captured at packaging: 1e866a09f46c9a740a80ab6c92f96b47a8c62e9c
Repository: https://github.com/ecooxai/campus-portrait-gpt6-astra-pro-mcp-colabdev
Hosted Pages studio: https://ecooxai.github.io/campus-portrait-gpt6-astra-pro-mcp-colabdev/
Temporary instance tunnel: https://employers-decrease-decision-indexes.trycloudflare.com

The figure remains static optimized geometry, not a rigged or animated character. Its metric scale and unseen side/rear details are authored interpretations. The source photograph remains only in the conversation, not in the public project or archive. Use direct visual observation of that reference when continuing; do not perform pixel measurements or image analysis on it.

## Current live services

After the most recent Colab restore, the owned project-only static server uses port 4197, terminal 848. The Vite development viewer uses port 4186, terminal 892. The cloudflared tunnel uses terminal 878 and points only to port 4197. The reusable command controller is terminal 903. These IDs describe the current live runtime, not a guarantee after another restore. Check status/listeners before starting replacements, and never stop unrelated terminals.

The mcp_colabdev Webterm proxy is the intended environment. The separate mcp_aliwebterm /home/admin host is not this development instance. Webterm run commands leave native shells allocated after their command finishes. The global 32-session limit was reached repeatedly; only known completed owned sessions were closed. Reusing controller 903 with webterm write 903 --enter avoids creating a shell for every edit. Wait for a unique JOB_*_EXIT marker and the shell prompt before sending the next command. The terminal's running=true flag alone does not mean a foreground command is active.

The platform occasionally returned: "This tool call was blocked by OpenAI because we couldn't determine the safety status of the request." No execution was assumed for those calls. Smaller, explicit project-scoped operations were used where supported. C56 had a genuine screenshot timeout; its failed attempt is recorded and the retry succeeded with a 120-second timeout in a fresh browser.

## Restore and evidence caveats

A restore removed .agentwork while preserving source, .output and public artifacts. The previous eye batch C45–48 had already rendered; it was reviewed without double-counting or rerendering. The campaign accept action now falls back to the durable public design JSON if its old scratch state is missing.

Some early full-resolution scratch PNGs no longer exist. The durable JPEGs, state JSONs and annotated comparison sheets are preserved and audited. Older sourceCommit fields are present only where they were recorded; source hashes and rendered proof are also retained. Exact historical replay can require the corresponding code version. Loading old controls into the current generator may include later construction changes.

The former 1,000-step cloth experiment is historical numerical evidence, separate from the 100 visual candidates. Its accepted deformation remains in src/cloth-state-gpt6-astra-pro-mcp-colabdev.json. Do not relabel numerical steps as manual visual reviews. Its large frame archive is an optional separate hosted artifact and is excluded from nested source archives.

## Current implementation map

- design-state.json contains the accepted C100 controls. design.js validates replacements and supports explicit reconstruction in a shared renderer.
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

Current GLB: /home/dev/project/3d/campus-portrait-gpt6-astra-pro-mcp-colabdev/.output/campus-portrait-gpt6-astra-pro-mcp-colabdev.glb
Source archive: /home/dev/project/3d/campus-portrait-gpt6-astra-pro-mcp-colabdev/.output/campus-portrait-source-gpt6-astra-pro-mcp-colabdev.tar.gz
Review evidence archive: /home/dev/project/3d/campus-portrait-gpt6-astra-pro-mcp-colabdev/.output/campaign-evidence-gpt6-astra-pro-mcp-colabdev.tar.gz
Combined verification: /home/dev/project/3d/campus-portrait-gpt6-astra-pro-mcp-colabdev/.output/verification-gpt6-astra-pro-mcp-colabdev.json
Main metrics: 286601 triangles, 276506 vertices, 51 material-batched meshes, 14610840 GLB bytes.
Validator: 0 errors, 0 warnings, 0 informational issues.
Production checks: 33, passed=true, tested URL=http://127.0.0.1:4197.

Material comparison checks effective sheen, specular intensity, anisotropy, coating, alpha masking, sidedness, texture transforms, normals and roughness maps. Exported design metadata is checked against the selected campaign ID. Browser tests use software WebGL; actual phone frame rate, memory pressure and thermal behavior remain unmeasured.

The remaining visual gap is substantial enough that 95/100 must not be claimed: facial likeness remains stylized, hair roots/strand structure need more natural treatment, hand topology is simplified, and backpack contact and fine cloth drape can be improved. Start with the actual latest front, face, profile, back and detail-hand images rather than assuming the numeric score guarantees realism.

## Continue and publish

Start new candidate IDs at 101. Make real explicit changes, use tools/campaign.mjs, inspect the resulting images and append individual reviews. Keep the strongest accepted candidate rather than promoting a regression. tools/audit-campaign.mjs checks evidence integrity, not artistic quality. tools/qa.mjs and acceptance.mjs verify the selected asset. tools/package-checkpoint.mjs refuses packaging when technical verification or selected-state alignment is incomplete, but permits an honestly labeled below-target checkpoint.

Intermediates belong in .agentwork; important binaries and evidence in .output. Preserve public JPEG/state evidence in Git. Do not publish the reference photograph. Commit significant changes on a model/tool-named branch. The Pages site branch is gpt6-astra-pro-mcp-colabdev/site; preserve its existing history and push normally, never force-replace it. Keep the root-hosted and Pages-subpath builds separate. Verify the deployed commit and run acceptance against the hosted URL after publishing.
