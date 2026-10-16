// Focused topic systems use one spaced orbit so text stays upright and selectable.
export function projectOrbit(count, seconds = 0) {
  const rx = count > 10 ? 480 : count > 6 ? 340 : 270,
    ry = rx * 0.68;
  return {
    rx,
    ry,
    positions: Array.from({ length: count }, (_, i) => {
      const angle =
        -Math.PI / 2 + (i * 2 * Math.PI) / count + (seconds * 2 * Math.PI) / 92;
      return { x: rx * Math.cos(angle), y: ry * Math.sin(angle) };
    }),
  };
}
export function createProjectOrbits({ svg, dialog, button, onFrame }) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let graph,
    moving = [],
    elapsed = 0,
    last = 0,
    frame = 0,
    hover = false,
    visible = false,
    userPaused = false,
    pointing = false;
  const allowed = () =>
    !!graph &&
    moving.length > 0 &&
    dialog.open &&
    visible &&
    !document.hidden &&
    !reduced.matches &&
    document.documentElement.dataset.motion !== "off" &&
    !hover &&
    !pointing &&
    !svg.contains(document.activeElement) &&
    !userPaused;
  function sync() {
    const run = allowed();
    svg.dataset.orbitState = run
      ? "running"
      : moving.length
        ? "paused"
        : "overview";
    dialog.dataset.orbitState = svg.dataset.orbitState;
    button.disabled =
      !moving.length ||
      reduced.matches ||
      document.documentElement.dataset.motion === "off";
    button.textContent = button.disabled
      ? "Orbits off"
      : userPaused
        ? "Resume orbits"
        : "Pause orbits";
    button.setAttribute(
      "aria-label",
      userPaused ? "Resume project orbits" : "Pause project orbits",
    );
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (run) frame = requestAnimationFrame(tick);
  }
  function position() {
    const layout = projectOrbit(moving.length, elapsed);
    for (const [i, node] of moving.entries())
      Object.assign(node, layout.positions[i]);
    onFrame();
  }
  function tick(now) {
    if (!allowed()) {
      sync();
      return;
    }
    if (last) elapsed += Math.min((now - last) / 1000, 0.05);
    last = now;
    position();
    frame = requestAnimationFrame(tick);
  }
  function configure(next) {
    graph = next;
    elapsed = 0;
    const center = graph.nodes.find((n) => n.kind === "topic");
    moving =
      center && !graph.nodes.some((n) => n.kind === "root")
        ? graph.nodes.filter((n) => n.kind === "project")
        : [];
    const layer = svg.querySelector(".project-orbit-decor");
    layer?.replaceChildren();
    svg.classList.toggle("has-orbits", moving.length > 0);
    if (moving.length) {
      position();
      const { rx, ry } = projectOrbit(moving.length);
      const ns = "http://www.w3.org/2000/svg";
      for (const scale of [0.48, 0.75, 1, 1.1]) {
        const ring = document.createElementNS(ns, "ellipse");
        for (const [k, v] of Object.entries({
          cx: 0,
          cy: 0,
          rx: rx * scale,
          ry: ry * scale,
          class: "project-orbit-ring",
        }))
          ring.setAttribute(k, v);
        layer?.append(ring);
      }
      for (let i = 0; i < 40; i++) {
        const star = document.createElementNS(ns, "circle");
        for (const [k, v] of Object.entries({
          cx: (((i * 173) % 991) / 991) * (rx + 100) * 2 - rx - 100,
          cy: (((i * 251) % 997) / 997) * (ry + 70) * 2 - ry - 70,
          r: i % 6 === 0 ? 1.4 : 0.7,
          class: "project-orbit-star",
        }))
          star.setAttribute(k, v);
        layer?.append(star);
      }
      // Fixed bounds prevent the view from zooming in/out as the planets move.
      svg.setAttribute(
        "viewBox",
        `${-rx - 125} ${-ry - 80} ${2 * rx + 250} ${2 * ry + 205}`,
      );
    }
    sync();
  }
  button.addEventListener("click", () => {
    userPaused = !userPaused;
    sync();
  });
  svg.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") {
      hover = true;
      sync();
    }
  });
  svg.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") {
      hover = false;
      sync();
    }
  });
  svg.addEventListener("pointerdown", () => {
    pointing = true;
    sync();
  });
  for (const type of ["pointerup", "pointercancel"])
    svg.addEventListener(type, () => {
      pointing = false;
      queueMicrotask(sync);
    });
  svg.addEventListener("focusin", sync);
  svg.addEventListener("focusout", () => queueMicrotask(sync));
  reduced.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  const observer = new MutationObserver(sync);
  observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(svg);
  return {
    configure,
    pause() {
      userPaused = true;
      sync();
    },
    stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    },
  };
}
