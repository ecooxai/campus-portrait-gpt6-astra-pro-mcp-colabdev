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
