# Portfolio website

The website lives beside the profile README: `index.html`, `styles.css`, `script.js`, and `assets/`. It is plain HTML, CSS, and JavaScript, with local fonts and illustrations. No package install or build is required.

## Local preview

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the server locally to inspect the website. Project tabs work with click/tap, arrow keys, Home, and End. The Motion button and the operating system's reduced-motion preference disable parallax and animated effects. The contact link opens email; Copy email works on a secure origin or localhost.

## GitHub Pages

The `Deploy portfolio to GitHub Pages` workflow publishes on changes to the website on `main`, or when run manually.

If Pages is not enabled yet, select **Settings → Pages → Build and deployment → Source → GitHub Actions** in this repository, then run the workflow from Actions. The expected project-site URL is:

https://kweontj.github.io/KweonTJ/

This URL depends on Pages being enabled and the deployment succeeding. The README links to the website source until the public deployment can be verified; after that, change the portfolio link to the published URL.

## Design and assets

The visual direction combines the layered landscapes and parallax of [Reel_23](https://github.com/engginsightsofficial-web/Reel_23) with the planet-oriented exploration of [Reel_42](https://github.com/engginsightsofficial-web/Reel_42). The website, graphics, and interactions were independently implemented; no source assets from those repositories were copied.

- `assets/landscape/`: original SVG sky, planet, mountain layers, orbital texture, favicon, and profile banner. Celestial visuals are decorative, not project test imagery.
- `assets/projects/orv-4wd.png`: original project simulation image, documented in [image provenance](../assets/projects/README.md).
- `assets/fonts/`: Manrope and Instrument Serif, distributed under their included SIL Open Font License files, retrieved from Fontsource.
- `assets/icons/`: technology marks, documented in [icon provenance](../assets/icons/README.md).

The homepage and README share five selected projects and `cbnuai@chungbuk.ac.kr`. Project summaries are based on the [repository index](repositories.md); simulation work is not presented as hardware validation.
