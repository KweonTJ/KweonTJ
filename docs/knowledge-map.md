# Connected work

Public entry: https://kweontj.github.io/KweonTJ/#work

The main page shows an **orbital atlas with six topic worlds and two digital-twin worlds**. The central sun opens the first GitHub profile page, exactly `https://github.com/KweonTJ`. Shelf Twin opens `simulator/`; OMX MuJoCo opens the desktop scene/launch guide at `lab/mujoco.html`. Both are separate clickable planets. A category opens a native `<dialog>` inside the website. Project nodes, repository notes, technology lists, shared-topic links and repository/Lab destinations appear inside that dialog. No API, LLM service or external graph library is needed at runtime.

## Content

`assets/knowledge/data.mjs` defines the reviewed topic/repository connections. The live public repository listing was checked on **2026-10-16 (KST)**: 35 public repositories, including 32 authored project/coursework/archive entries. The profile, empty `Go2_IsaacSim` and upstream `dynamixel_hardware` fork are described in the index instead of being presented as authored projects.

The six subjects are Robot learning, Perception, Autonomy, Robot systems, Simulation & twins, and ML & foundations. A repository can connect to several subjects. These are editorial topic relationships, not dependency links or hardware-validation claims. The full sources and status distinctions are in [the repository index](repositories.md). The renamed AI coursework repository now uses `Artifical_Intelligence`; the new OCR, engineering-design and two related posture repositories were checked through their READMEs and representative trees/source.

Each record has a stable `id`, original GitHub `repo` name, display name, `topics`, a scoped description, stack and project kind. Optional `featured`, `image` and `lab` fields enable highlights, existing genuine project previews, and simulator destinations. Keep coursework, archives, team work and pending hardware validation labeled accurately. New public repositories require an explicit reviewed entry; the website does not silently infer achievements or dependencies.

## Interaction

- Six topic planets open a colored project system: projects orbit the selected topic, with upright labels, decorative orbital rings and a complete list of repository backlinks. Straight relationship lines stay hidden in every dialog view, including hover and project selection; shared-topic relationships remain available in notes and backlinks. The two twin planets are ordinary links that open their respective viewer/guide in a new tab.
- Project nodes and list entries open an internal note with a real GitHub destination, related topics and other work sharing those topics.
- Topic chips change the graph. Highlights/all-work controls and case-insensitive search filter its repositories. Search is restricted to the current topic until All topics is chosen.
- Hover or graph-node focus pauses project orbits for selection. The dialog has its own Pause/Resume orbits button. Dragging pauses the orbit until explicitly resumed; nodes can be arranged and the background pans. Buttons and Ctrl/Cmd + wheel zoom. Reset restores the initial layout and responsive zoom.
- On the main page, compact atlases keep circular orbits with short numeric labels; a matching stable directory below names all six topics and both twins. These entries open the same dialog/destinations and preserve focus on close. At 900 px and below, the detail graph and note stack vertically. A focused graph starts at a readable label size instead of shrinking every project onto the phone; touch-drag pans and zoom controls reveal the rest. All topics shows a topic overview, and the complete list remains an equivalent way to navigate projects. Keyboard focus pans an offscreen node into view. Selecting a project scrolls its note into view. Previews retain their source aspect ratio on phones.
- Escape, the close button and a backdrop click close the dialog. Native dialog behavior traps focus; close returns focus to the category button. Graph arrow keys move focus between nodes; Enter/Space select. Reduced motion is respected. Without JavaScript, a repository-index link remains available.

`model.mjs` performs filtering and a deterministic layout for the all-topic graph. `project-orbits.mjs` places the focused topic’s projects on a 92-second orbit with fixed view bounds; the orbit expands for larger topic collections. Project and topic notes have matching planet colors and ring details. `solar.mjs` animates the main orbital atlas, with upright labels and equal angular spacing over a 76-second revolution. Planet colors, textured bodies, rings, fixed stars and fading trails are decorative. This is a navigation metaphor, not a physical solar-system model.

Hover or keyboard focus within the atlas pauses it for selection. The Pause/Resume orbits button controls local motion, and the existing global Motion button and operating-system reduced-motion preference are respected. Animation stops offscreen, in hidden tabs, and while the internal project dialog is open, then resumes without a time jump. A ResizeObserver recomputes the main ellipse and label bounds for the current viewport. Focused project animation also respects global Motion, reduced motion, hidden documents, offscreen state and dialog close; resizing a compact graph recalculates readable zoom. `graph.mjs` manages the modal, graph and notes. `graph.css` owns the map/dialog layout. Homepage scripts continue to handle the hero, progress indicator, motion toggle and email. GitHub Pages already copies all files under `assets/`.

## Validation

```bash
node --test tests/solar.test.mjs tests/project-orbits.test.mjs tests/knowledge.test.mjs tests/telemetry.test.mjs
python -m http.server 8879 --bind 127.0.0.1
```

Browser checks cover category-only main content, all category dialogs, correct project/repository links, filtering/search, graph drag/pan/zoom/reset, keyboard/focus/close behavior, narrow layouts, reduced motion and the JavaScript-disabled fallback. Model checks cover inventory integrity, cross-topic filtering and graph edges/positions for every scope/topic on desktop and compact layouts.

Verified on 2026-10-16 (KST): **498 Chromium browser assertions passed** at 1440, 1024, 768, 390 and 320 px, including every category's modal and links, search/scope changes, drag/pan/zoom/reset, keyboard/focus restoration, backdrop/Escape closing, narrow layouts, reduced motion, existing homepage motion/email behavior, and the JavaScript-disabled index link. No page/resource errors were recorded. **4 graph/inventory tests and 6 existing telemetry tests passed**. Screenshots were inspected for desktop and mobile category maps, topic graphs and notes. This checks the portfolio UI and content relationships, not the runtime or hardware behavior of the linked repositories.

### Orbital atlas update

Verified on 2026-10-16 (KST): **112 orbital browser assertions passed** at 1440, 768, 390 and 320 px. These cover actual position changes, hover/focus and explicit pause/resume, dialog pausing, global Motion and reduced-motion preferences, offscreen suspension, responsive overflow, exact sun/twin link targets, and new-tab navigation. The Sun target was checked with intercepted browser navigation to avoid external browser-network restrictions; the target is exactly `https://github.com/KweonTJ`, without a repository path or tab query. Both twin destinations were also opened against the local website: the shelf renderer loaded with five controls, and the MuJoCo guide displayed both native scenes. Actual mobile touch selection and twin-guide navigation passed. The existing **498 project-explorer assertions** also passed with orbital motion paused for stable selection.

**13 Node tests passed**: three full-revolution/responsive-label checks, four knowledge-map checks and six existing telemetry checks. The orbit tests sample a complete 76-second cycle at six stage widths, including the label space needed by the twin links. Decorative motion and these UI checks do not imply physical solar-system accuracy, policy inference, or hardware validation.

### Interior worlds and mobile layout update

Verified on 2026-10-16 (KST): **17 Node tests passed**, including full-turn project-orbit spacing/bounds for topic sizes 1–15 and a circular compact-atlas/profile-sun clearance check. **499 project-explorer browser assertions**, **84 shelf-control assertions**, and **50 Lab/navigation assertions** passed. **293 additional interior/motion/mobile assertions** cover six topics at 320, 360, 390, 430 and 768 px: readable project labels, round planet bodies, complete project lists, note selection/scrolling, actual touch panning, navigation/heading fit, no horizontal page overflow, and the shelf canvas matching its rendered aspect ratio. A full-turn browser measurement found no overlapping project labels for the 15-project foundations system at 390 px.

Project motion was checked for actual position changes, hover/focus freezing, explicit Pause/Resume, global Motion, reduced motion and stopping after dialog close. Shared world headers were checked for local Pause/Resume, reduced motion, offscreen suspension and return-to-map navigation. The new checks concern layout and interaction, not physical simulation or hardware operation.

The compact main atlas was separately verified with **186 browser assertions** at 320, 360, 390, 430, 700, 768 and 1440 px: circular compact rings, numbered worlds, eight readable directory entries, all six topic dialogs and focus restoration, both actual touch-opened twin tabs, the exact profile-sun target, and no horizontal page overflow. Desktop keeps its wide orbital composition.

Straight dialog connection lines were removed on 2026-10-16 (KST). **82 targeted browser assertions passed** at 1440 and 390 px across all six topics: project positions still advance, four decorative orbit rings remain, relationship lines stay hidden during hover/selection and in All topics, repository notes remain navigable, and the dialogs have no horizontal overflow. No page/resource errors were recorded.
