# Portfolio website

The website lives beside the profile README: `index.html`, `styles.css`, `script.js`, `assets/`, and separate `lab/` / `simulator/` routes. It is plain HTML, CSS, and JavaScript, with local fonts and illustrations. No package install or build is required.

## Local preview

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the server locally to inspect the website. The main Work section displays six orbiting topic worlds and two digital-twin shortcuts; the central sun links to the GitHub profile. A category opens an internal dialog with a colored project system: related project planets orbit the selected subject, and notes use the same planet/ring details. Hover or focus pauses the graph, with a separate Pause/Resume orbits control. The main atlas uses circular compact orbits with numbered worlds and a matching readable topic/twin directory. On phones and narrow tablets, graph and notes stack; the graph keeps readable labels and supports drag-to-pan instead of shrinking everything to fit. Use arrows to focus graph nodes, Enter/Space to select, and Escape to close. The Motion button and the operating system's reduced-motion preference disable parallax and animated effects. The contact link opens email; Copy email works on a secure origin or localhost.

## GitHub Pages

The `Deploy portfolio to GitHub Pages` workflow publishes on changes to the website on `main`, or when run manually.

GitHub Pages was enabled and the deployment [completed successfully on 2026-10-16](https://github.com/KweonTJ/KweonTJ/actions/runs/38860069502). The published project-site URL is:

https://kweontj.github.io/KweonTJ/

The profile README links directly to the published portfolio. If Pages must be configured again, select **Settings → Pages → Build and deployment → Source → GitHub Actions**, then run the workflow manually. Successful deployment was confirmed from GitHub Actions; direct requests to the Pages hostname are blocked by the current execution environment’s network policy.

## Design and assets

The visual direction combines the layered landscapes and parallax of [Reel_23](https://github.com/engginsightsofficial-web/Reel_23) with the planet-oriented exploration of [Reel_42](https://github.com/engginsightsofficial-web/Reel_42). The website, graphics, and interactions were independently implemented; no source assets from those repositories were copied.

- `assets/landscape/`: original SVG sky, planet, mountain layers, orbital texture, favicon, and profile banner. Celestial visuals are decorative, not project test imagery.
- `assets/projects/orv-4wd.png`: original project simulation image, documented in [image provenance](../assets/projects/README.md).
- `assets/fonts/`: Manrope and Instrument Serif, distributed under their included SIL Open Font License files, retrieved from Fontsource.
- `assets/icons/`: technology marks, documented in [icon provenance](../assets/icons/README.md).

The homepage presents six topic planets, two separate digital-twin planets and a central sun linking to `https://github.com/KweonTJ`, with 32 connected repositories inside an internal project explorer. The README retains five selected projects and `cbnuai@chungbuk.ac.kr`. Project summaries are based on the [repository index](repositories.md); simulation work is not presented as hardware validation. See [knowledge map details](knowledge-map.md).

## Interactive shelf page

The homepage opens [Shelf Twin Lab](https://kweontj.github.io/KweonTJ/simulator/) in a new tab. The static deployment includes its local Three.js renderer, original robot meshes, and exported shelf model. See [simulator details](simulator.md) and [ROS 2 bridge setup](../bridge/README.md). ROS bridge processes run on a separate host, not on GitHub Pages.

## Digital Twin Lab

The Lab navigation and homepage callout open `lab/`, a visual selection page for available twins. The browser shelf viewer keeps its `simulator/` URL and direct project link. Desktop MuJoCo has a separate `lab/mujoco.html` preview and launch guide, with its runtime clearly labeled. Pages includes both directories. Native source lives in `KweonTJ/omx_train_ws`; the existing delivery training model remains unchanged. `assets/knowledge/world.css` and `world.mjs` share the orbital headers, star background, motion controls and return navigation across the Lab, shelf viewer and MuJoCo guide. Shelf uses teal, MuJoCo uses lilac, and Lab uses the homepage peach. Decorative satellite motion pauses offscreen/in hidden tabs and respects reduced motion. Mobile planet bodies remain circular and narrow headings/navigation wrap without horizontal page overflow.
