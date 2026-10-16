// A visual orbit, not a physical solar-system simulation. Equal angular spacing
// keeps world labels apart while the worlds circle their common research theme.
const PERIOD = 76;
const SIZES = [42, 34, 31, 39, 47, 29, 44, 36];
const PHASES = [-157.5, -112.5, -67.5, -22.5, 22.5, 67.5, 112.5, 157.5];
export function solarLayout(width, height, seconds = 0) {
  const compact = width < 700;
  const cx = width / 2,
    cy = height / 2;
  const rx = Math.max(40, Math.min(width / 2 - (compact ? 64 : 116), 470));
  const ry = Math.min(height / 2 - (compact ? 95 : 112), 220);
  const labelWidth = compact ? (width < 330 ? 104 : 120) : 190;
  return {
    cx,
    cy,
    rx,
    ry,
    worlds: PHASES.map((phase, i) => {
      const angle = (phase * Math.PI) / 180 + (seconds * Math.PI * 2) / PERIOD;
      const x = cx + Math.cos(angle) * rx,
        y = cy + Math.sin(angle) * ry;
      const size = SIZES[i] * (compact ? 0.76 : 1);
      const spread =
        Math.sign(x - cx) *
        Math.max(
          0,
          (labelWidth + 10 - 2 * rx * Math.sin(Math.PI / PHASES.length)) / 2,
        );
      const labelX = Math.max(
        labelWidth / 2 + 5,
        Math.min(width - labelWidth / 2 - 5, x + spread),
      );
      return {
        angle,
        x,
        y,
        size,
        labelWidth,
        labelOffset: labelX - x,
        depth: Math.sin(angle),
      };
    }),
  };
}
export function createSolarSystem() {
  const stage = document.getElementById("category-stage");
  const svg = document.getElementById("solar-orbits");
  const rings = document.getElementById("solar-rings");
  const trails = document.getElementById("solar-trails");
  const defs = document.getElementById("solar-defs");
  const stars = document.getElementById("solar-stars");
  const toggle = document.getElementById("orbit-toggle");
  const status = document.getElementById("orbit-status");
  const dialog = document.getElementById("project-dialog");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const buttons = [...stage.querySelectorAll(".category-node")];
  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attrs = {}) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  };
  let width = stage.clientWidth,
    height = stage.clientHeight;
  let elapsed = 0,
    lastTime = 0,
    frame = 0,
    visible = false,
    hovering = false,
    touching = false,
    userPaused = false;
  let running = false;
  const paths = [],
    gradients = [];
  for (const [i, button] of buttons.entries()) {
    const label = document.createElement("span");
    label.className = "category-label";
    for (const child of [...button.children])
      if (!child.classList.contains("category-dot")) label.append(child);
    button.append(label);
    const color = button.style.getPropertyValue("--node-color").trim();
    const gradient = make("linearGradient", {
      id: "solar-trail-" + i,
      gradientUnits: "userSpaceOnUse",
    });
    gradient.append(
      make("stop", { offset: 0, "stop-color": color, "stop-opacity": 0 }),
      make("stop", { offset: 1, "stop-color": color, "stop-opacity": 0.8 }),
    );
    defs.append(gradient);
    gradients.push(gradient);
    const path = make("path", {
      class: "solar-trail",
      stroke: "url(#solar-trail-" + i + ")",
    });
    trails.append(path);
    paths.push(path);
    button.addEventListener("pointerenter", () => {
      stage.dataset.activeWorld =
        button.dataset.openTopic || button.dataset.orbitTwin;
    });
    button.addEventListener("pointerleave", () => {
      delete stage.dataset.activeWorld;
    });
  }
  const ellipses = [0.43, 0.68, 1, 1.1].map((scale, i) => {
    const e = make("ellipse", { class: "solar-ring ring-" + i });
    rings.append(e);
    return { e, scale };
  });
  const starNodes = Array.from({ length: 44 }, (_, i) => {
    const e = make("circle", {
      class: "solar-star",
      r: i % 7 === 0 ? 1.4 : 0.7,
      opacity: 0.13 + (i % 5) * 0.07,
    });
    stars.append(e);
    return e;
  });
  function paint() {
    const layout = solarLayout(width, height, elapsed);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    for (const [i, world] of layout.worlds.entries()) {
      const button = buttons[i];
      button.style.setProperty("--orbit-x", world.x + "px");
      button.style.setProperty("--orbit-y", world.y + "px");
      button.style.setProperty("--planet-size", world.size + "px");
      button.style.setProperty("--label-width", world.labelWidth + "px");
      button.style.setProperty("--label-offset", world.labelOffset + "px");
      button.style.zIndex = String(10 + Math.round((world.depth + 1) * 5));
      const points = [];
      for (let j = 0; j <= 14; j++) {
        const angle = world.angle - 0.58 + (j * 0.58) / 14;
        points.push([
          layout.cx + Math.cos(angle) * layout.rx,
          layout.cy + Math.sin(angle) * layout.ry,
        ]);
      }
      paths[i].setAttribute(
        "d",
        points
          .map(([x, y], j) => `${j ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`)
          .join(" "),
      );
      const [x1, y1] = points[0],
        [x2, y2] = points.at(-1);
      for (const [k, v] of Object.entries({ x1, y1, x2, y2 }))
        gradients[i].setAttribute(k, String(v));
    }
    // Only these static elements need a size update, not animation-frame updates.
  }
  function resize() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    stage.classList.toggle("solar-compact", width < 700);
    const { cx, cy, rx, ry } = solarLayout(width, height, elapsed);
    for (const { e, scale } of ellipses) {
      for (const [k, v] of Object.entries({
        cx,
        cy,
        rx: rx * scale,
        ry: ry * scale,
      }))
        e.setAttribute(k, String(v));
    }
    for (const [i, e] of starNodes.entries()) {
      e.setAttribute("cx", String((((i * 167 + 43) % 997) / 997) * width));
      e.setAttribute("cy", String((((i * 239 + 91) % 991) / 991) * height));
    }
    paint();
  }
  function tick(now) {
    if (!running) return;
    if (lastTime) elapsed += Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    paint();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    const globallyOff = document.documentElement.dataset.motion === "off";
    const focused = stage.contains(document.activeElement);
    running =
      visible &&
      !document.hidden &&
      !reduced.matches &&
      !globallyOff &&
      !userPaused &&
      !hovering &&
      !focused &&
      !touching &&
      !dialog.open;
    stage.dataset.orbitState = running
      ? "running"
      : reduced.matches
        ? "reduced"
        : globallyOff
          ? "off"
          : !visible
            ? "offscreen"
            : "paused";
    status.textContent = reduced.matches
      ? "REDUCED MOTION"
      : globallyOff
        ? "MOTION OFF"
        : userPaused
          ? "ORBITS PAUSED"
          : hovering || focused
            ? "HOVER / FOCUS PAUSED"
            : "HOVER TO PAUSE";
    toggle.disabled = reduced.matches || globallyOff;
    toggle.setAttribute(
      "aria-label",
      userPaused ? "Resume orbital motion" : "Pause orbital motion",
    );
    toggle.replaceChildren(
      document.createTextNode(
        toggle.disabled
          ? "Motion off"
          : userPaused
            ? "Resume orbits"
            : "Pause orbits",
      ),
    );
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (running) frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener("click", () => {
    userPaused = !userPaused;
    sync();
  });
  stage.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") {
      hovering = true;
      sync();
    }
  });
  stage.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") {
      hovering = false;
      sync();
    }
  });
  stage.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "touch") {
        touching = true;
        sync();
      }
    },
    { passive: true },
  );
  for (const type of ["pointerup", "pointercancel"])
    stage.addEventListener(
      type,
      () => {
        touching = false;
        sync();
      },
      { passive: true },
    );
  stage.addEventListener("focusin", sync);
  stage.addEventListener("focusout", () => queueMicrotask(sync));
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
  observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      sync();
    },
    { threshold: 0 },
  ).observe(stage);
  new ResizeObserver(resize).observe(stage);
  stage.classList.add("is-solar");
  resize();
  sync();
}
