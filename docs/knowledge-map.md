# Connected work

Public entry: https://kweontj.github.io/KweonTJ/#work

The main page shows **six topic categories only**. A category opens a native `<dialog>` inside the website. Project nodes, repository notes, technology lists, shared-topic links and repository/Lab destinations appear inside that dialog. No API, LLM service or external graph library is needed at runtime.

## Content

`assets/knowledge/data.mjs` defines the reviewed topic/repository connections. The live public repository listing was checked on **2026-10-16 (KST)**: 35 public repositories, including 32 authored project/coursework/archive entries. The profile, empty `Go2_IsaacSim` and upstream `dynamixel_hardware` fork are described in the index instead of being presented as authored projects.

The six subjects are Robot learning, Perception, Autonomy, Robot systems, Simulation & twins, and ML & foundations. A repository can connect to several subjects. These are editorial topic relationships, not dependency links or hardware-validation claims. The full sources and status distinctions are in [the repository index](repositories.md). The renamed AI coursework repository now uses `Artifical_Intelligence`; the new OCR, engineering-design and two related posture repositories were checked through their READMEs and representative trees/source.

Each record has a stable `id`, original GitHub `repo` name, display name, `topics`, a scoped description, stack and project kind. Optional `featured`, `image` and `lab` fields enable highlights, existing genuine project previews, and simulator destinations. Keep coursework, archives, team work and pending hardware validation labeled accurately. New public repositories require an explicit reviewed entry; the website does not silently infer achievements or dependencies.

## Interaction

- Category buttons open a topic-centered graph and a complete list of repository backlinks.
- Project nodes and list entries open an internal note with a real GitHub destination, related topics and other work sharing those topics.
- Topic chips change the graph. Highlights/all-work controls and case-insensitive search filter its repositories. Search is restricted to the current topic until All topics is chosen.
- Nodes can be dragged; the background pans. Buttons and Ctrl/Cmd + wheel zoom. Reset restores the deterministic layout.
- On compact screens, a focused graph unfolds one topic. All topics shows the topic overview, and the note/list remains an equivalent way to navigate projects. Selecting a project scrolls its note into view.
- Escape, the close button and a backdrop click close the dialog. Native dialog behavior traps focus; close returns focus to the category button. Graph arrow keys move focus between nodes; Enter/Space select. Reduced motion is respected. Without JavaScript, a repository-index link remains available.

`model.mjs` performs filtering and a deterministic initial layout; no animation/force simulation runs after rendering. `graph.mjs` manages the modal, graph and notes. `graph.css` owns the map/dialog layout. Homepage scripts continue to handle the hero, progress indicator, motion toggle and email. GitHub Pages already copies all files under `assets/`.

## Validation

```bash
node --test tests/knowledge.test.mjs tests/telemetry.test.mjs
python -m http.server 8879 --bind 127.0.0.1
```

Browser checks cover category-only main content, all category dialogs, correct project/repository links, filtering/search, graph drag/pan/zoom/reset, keyboard/focus/close behavior, narrow layouts, reduced motion and the JavaScript-disabled fallback. Model checks cover inventory integrity, cross-topic filtering and graph edges/positions for every scope/topic on desktop and compact layouts.

Verified on 2026-10-16 (KST): **498 Chromium browser assertions passed** at 1440, 1024, 768, 390 and 320 px, including every category's modal and links, search/scope changes, drag/pan/zoom/reset, keyboard/focus restoration, backdrop/Escape closing, narrow layouts, reduced motion, existing homepage motion/email behavior, and the JavaScript-disabled index link. No page/resource errors were recorded. **4 graph/inventory tests and 6 existing telemetry tests passed**. Screenshots were inspected for desktop and mobile category maps, topic graphs and notes. This checks the portfolio UI and content relationships, not the runtime or hardware behavior of the linked repositories.
