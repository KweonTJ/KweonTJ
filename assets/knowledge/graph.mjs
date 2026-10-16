import { repositories, topics, inventory } from "./data.mjs";
import { filterRepositories, labelLines, makeGraph } from "./model.mjs";
import { createSolarSystem } from "./solar.mjs";
const $ = (id) => document.getElementById(id);
const svg = $("knowledge-graph"),
  viewport = $("graph-viewport"),
  inspector = $("graph-detail");
const NS = "http://www.w3.org/2000/svg";
const compact = matchMedia("(max-width: 700px)");
const dialog = $("project-dialog");
let opener;
const state = {
  scope: "all",
  topic: "",
  query: "",
  selected: "root",
  zoom: 1,
  pan: { x: 0, y: 0 },
};
let graph,
  nodes = new Map(),
  elements = new Map(),
  edgeElements = [],
  drag,
  hovered = "";
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};
const se = (tag, attrs = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};
const topicById = (id) => topics.find((t) => t.id === id);
const announce = (text) => {
  $("graph-announcement").textContent = text;
};
function external(label, url) {
  const a = el("a", "map-link", label);
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.append(arrow());
  return a;
}
function arrow() {
  const icon = se("svg", {
    class: "backlink-arrow",
    viewBox: "0 0 12 12",
    width: 12,
    height: 12,
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 1.2,
    "aria-hidden": "true",
  });
  icon.append(se("path", { d: "M2 10 10 2M2 2h8v8" }));
  return icon;
}
function topicButton(t) {
  const b = el("button", "detail-topic", t.label);
  b.type = "button";
  b.style.setProperty("--node-color", t.color);
  b.addEventListener("click", () => selectTopic(t.id));
  return b;
}
function projectButton(r) {
  const b = el("button", "backlink");
  b.type = "button";
  b.append(el("span", "backlink-dot"));
  b.style.setProperty("--node-color", topicById(r.topics[0]).color);
  const text = el("span");
  text.append(el("strong", "", r.name), el("small", "", r.kind));
  b.append(text, arrow());
  b.addEventListener("click", () => selectProject(r.id));
  return b;
}
function updateInspector() {
  inspector.replaceChildren();
  const r = repositories.find((r) => r.id === state.selected),
    t = topicById(state.selected);
  const eyebrow = el(
    "p",
    "eyebrow",
    r ? "PROJECT NOTE" : t ? "TOPIC NOTE" : "CONNECTED WORK",
  );
  const title = el(
    "h3",
    "",
    r ? r.name : t ? t.label : "Follow the connections.",
  );
  title.id = "graph-detail-title";
  inspector.append(eyebrow, title);
  if (r) {
    inspector.append(el("p", "detail-kind", r.kind));
    if (r.image) {
      const img = el("img", "detail-preview");
      img.src = r.image;
      img.alt = r.name + " model preview";
      img.width = 640;
      img.height = 400;
      img.loading = "lazy";
      inspector.append(img);
    }
    inspector.append(el("p", "detail-description", r.description));
    const stack = el("ul", "detail-stack");
    for (const name of r.stack) stack.append(el("li", "", name));
    inspector.append(stack);
    const links = el("div", "detail-links");
    links.append(
      external("View repository", "https://github.com/KweonTJ/" + r.repo),
    );
    if (r.lab)
      links.append(
        external(
          r.id === "omx-training" ? "MuJoCo scenes" : "Open shelf twin",
          r.lab,
        ),
      );
    inspector.append(links);
    const tags = el("div", "detail-topics");
    for (const id of r.topics) tags.append(topicButton(topicById(id)));
    inspector.append(el("h4", "detail-heading", "CONNECTED TOPICS"), tags);
    const related = repositories
      .filter(
        (p) => p.id !== r.id && p.topics.some((id) => r.topics.includes(id)),
      )
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
      .slice(0, 4);
    const list = el("div", "backlinks");
    for (const p of related) list.append(projectButton(p));
    inspector.append(
      el("h4", "detail-heading", "SHARED TOPICS / RELATED WORK"),
      list,
    );
  } else if (t) {
    inspector.append(el("p", "detail-description", t.description));
    const keywords = el("ul", "detail-stack");
    for (const name of t.keywords) keywords.append(el("li", "", name));
    inspector.append(keywords);
    const related = filterRepositories({
      scope: "all",
      topic: t.id,
      query: state.query,
    });
    inspector.append(
      el("h4", "detail-heading", related.length + " REPOSITORY BACKLINKS"),
    );
    const list = el("div", "backlinks");
    for (const p of related) list.append(projectButton(p));
    inspector.append(list);
  } else {
    inspector.append(
      el(
        "p",
        "detail-description",
        "Learning, perception and control meet in the same systems. Pick a topic to follow its projects, or select a project to see the ideas it connects.",
      ),
    );
    const links = el("div", "topic-directory");
    for (const t of topics) {
      const b = topicButton(t);
      b.append(
        el(
          "span",
          "",
          String(repositories.filter((r) => r.topics.includes(t.id)).length),
        ),
      );
      links.append(b);
    }
    inspector.append(links);
    const note = el(
      "p",
      "detail-footnote",
      `${repositories.length} repositories mapped from ${inventory.publicCount} public repos. Profile, an empty repo and an upstream fork stay in the index.`,
    );
    inspector.append(
      note,
      external(
        "Full repository index",
        "https://github.com/KweonTJ/KweonTJ/blob/main/docs/repositories.md",
      ),
    );
  }
  inspector.scrollTop = 0;
  $("graph-selection").textContent = r ? r.name : t ? t.label : "All topics";
}
function updateHighlight() {
  const id = hovered || state.selected;
  const active = id && id !== "root" && nodes.has(id);
  const connected = new Set([id]);
  if (active)
    for (const e of graph.edges)
      if (e.source === id || e.target === id) {
        connected.add(e.source);
        connected.add(e.target);
      }
  for (const [key, g] of elements) {
    g.classList.toggle("is-selected", key === state.selected);
    g.classList.toggle("is-neighbor", active && connected.has(key));
    g.classList.toggle("is-muted", active && !connected.has(key));
    g.setAttribute("aria-pressed", String(key === state.selected));
  }
  for (const { data, path } of edgeElements) {
    path.classList.toggle(
      "is-active",
      active && (data.source === id || data.target === id),
    );
    path.classList.toggle(
      "is-muted",
      active && data.source !== id && data.target !== id,
    );
  }
}
function focusNode(id) {
  for (const [key, g] of elements) g.tabIndex = key === id ? 0 : -1;
  elements.get(id)?.focus({ preventScroll: true });
}
function transform() {
  viewport.setAttribute(
    "transform",
    `translate(${state.pan.x} ${state.pan.y}) scale(${state.zoom})`,
  );
  $("graph-zoom-in").disabled = state.zoom >= 2.5;
  $("graph-zoom-out").disabled = state.zoom <= 0.65;
}
function positionEdges() {
  for (const { data, path } of edgeElements) {
    const a = nodes.get(data.source),
      b = nodes.get(data.target);
    path.setAttribute("d", `M${a.x},${a.y} L${b.x},${b.y}`);
  }
}
function resetView() {
  state.zoom = 1;
  state.pan = { x: 0, y: 0 };
  transform();
}
function render() {
  graph = makeGraph({ ...state, compact: compact.matches });
  nodes = new Map(graph.nodes.map((n) => [n.id, n]));
  elements.clear();
  edgeElements = [];
  viewport.replaceChildren();
  const edgeGroup = se("g", { "aria-hidden": "true", class: "graph-edges" }),
    nodeGroup = se("g", { class: "graph-nodes" });
  viewport.append(edgeGroup, nodeGroup);
  for (const e of graph.edges) {
    const path = se("path", { class: "graph-edge" });
    edgeGroup.append(path);
    edgeElements.push({ data: e, path });
  }
  for (const n of graph.nodes) {
    const g = se("g", {
      class: "graph-node node-" + n.kind,
      "data-node": n.id,
      role: "button",
      tabindex: n.id === state.selected ? 0 : -1,
      "aria-label":
        n.kind === "root"
          ? "Robotics, all topics"
          : n.kind === "topic"
            ? n.label +
              ", topic, " +
              repositories.filter((r) => r.topics.includes(n.id)).length +
              " repositories"
            : n.name + ", " + n.kind,
      "aria-pressed": "false",
      transform: `translate(${n.x} ${n.y})`,
    });
    g.style.setProperty("--node-color", n.color);
    // A full-size invisible target is easier to click than a tiny graph dot.
    const lines = labelLines(n.label),
      width = Math.max(65, ...lines.map((l) => l.length * 8.5));
    g.append(
      se("rect", {
        class: "node-hit",
        x: -width / 2,
        y: -22,
        width,
        height: lines.length * 19 + 48,
        rx: 8,
      }),
    );
    g.append(
      se("circle", {
        class: "node-halo",
        r: n.kind === "root" ? 34 : n.kind === "topic" ? 25 : 18,
      }),
    );
    g.append(
      se("circle", {
        class: "node-core",
        r: n.kind === "root" ? 11 : n.kind === "topic" ? 8 : 4.5,
      }),
    );
    const text = se("text", {
      y: n.kind === "root" ? 39 : 29,
      "text-anchor": "middle",
      "aria-hidden": "true",
    });
    for (const [i, line] of lines.entries()) {
      const span = se("tspan", {
        x: 0,
        dy: i ? (compact.matches ? 25 : 19) : 0,
      });
      span.textContent = line;
      text.append(span);
    }
    g.append(text);
    if (n.kind === "topic") {
      const count = se("text", {
        class: "node-count",
        y: -24,
        "text-anchor": "middle",
        "aria-hidden": "true",
      });
      count.textContent = String(
        repositories.filter((r) => r.topics.includes(n.id)).length,
      ).padStart(2, "0");
      g.append(count);
    }
    nodeGroup.append(g);
    elements.set(n.id, g);
  }
  positionEdges();
  const xs = graph.nodes.map((n) => n.x),
    ys = graph.nodes.map((n) => n.y);
  const minX = Math.min(-80, ...xs) - 115,
    maxX = Math.max(80, ...xs) + 115,
    minY = Math.min(-60, ...ys) - 65,
    maxY = Math.max(60, ...ys) + 100;
  svg.setAttribute("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
  resetView();
  if (![...elements.values()].some((g) => g.tabIndex === 0)) {
    const id = nodes.has("root") ? "root" : graph.nodes[0]?.id;
    if (id) elements.get(id).tabIndex = 0;
  }
  for (const b of document.querySelectorAll("[data-graph-scope]"))
    b.setAttribute(
      "aria-pressed",
      String(b.dataset.graphScope === state.scope),
    );
  for (const b of document.querySelectorAll("[data-graph-topic]"))
    b.setAttribute(
      "aria-pressed",
      String(b.dataset.graphTopic === state.topic),
    );
  $("graph-count").textContent =
    graph.repositories.length + " / " + repositories.length + " repositories";
  $("graph-empty").hidden = graph.repositories.length !== 0;
  $("graph-mobile-hint").hidden =
    !compact.matches || !!state.topic || !!state.query;
  $("graph-fallback").hidden = true;
  svg.removeAttribute("hidden");
  $("dialog-title").textContent = state.topic
    ? topicById(state.topic).label
    : "Connected projects";
  updateHighlight();
  updateInspector();
}
function selectTopic(id) {
  state.topic = id;
  state.selected = id || "root";
  hovered = "";
  if (id && !repositories.some((r) => r.featured && r.topics.includes(id)))
    state.scope = "all";
  render();
  if (compact.matches && dialog.open)
    dialog.scrollTo({ top: 0, behavior: "instant" });
  announce(
    (id ? topicById(id).label : "All topics") +
      ": " +
      graph.repositories.length +
      " repositories",
  );
}
function selectProject(id) {
  const r = repositories.find((r) => r.id === id);
  if (!r) return;
  state.selected = id;
  hovered = "";
  if (!nodes.has(id)) {
    state.scope = "all";
    state.query = "";
    $("graph-search").value = "";
    if (!state.topic || !r.topics.includes(state.topic))
      state.topic = r.topics[0];
    render();
  } else {
    updateHighlight();
    updateInspector();
  }
  announce(r.name + ". Details updated.");
  if (compact.matches)
    inspector.scrollIntoView({
      block: "start",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
}
function activate(id) {
  if (id === "root") {
    state.query = "";
    $("graph-search").value = "";
    selectTopic("");
  } else if (topicById(id)) selectTopic(id);
  else selectProject(id);
}
for (const b of document.querySelectorAll("[data-graph-scope]"))
  b.addEventListener("click", () => {
    state.scope = b.dataset.graphScope;
    state.selected = state.topic || "root";
    render();
    announce(graph.repositories.length + " repositories in this view");
  });
const filters = $("graph-topics");
for (const t of topics) {
  const b = topicButton(t);
  b.className = "topic-filter";
  b.dataset.graphTopic = t.id;
  b.setAttribute("aria-pressed", "false");
  filters.append(b);
}
$("graph-all-topics").addEventListener("click", () => selectTopic(""));
$("graph-search").addEventListener("input", (e) => {
  state.query = e.target.value;
  state.selected = state.topic || "root";
  if (state.query.trim()) state.scope = "all";
  render();
  announce(graph.repositories.length + " matching repositories");
});
function point(e) {
  const p = svg.createSVGPoint();
  p.x = e.clientX;
  p.y = e.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}
function zoomTo(next, p = { x: 0, y: 0 }) {
  next = Math.max(0.65, Math.min(2.5, next));
  const f = next / state.zoom;
  state.pan = {
    x: p.x - (p.x - state.pan.x) * f,
    y: p.y - (p.y - state.pan.y) * f,
  };
  state.zoom = next;
  transform();
}
$("graph-zoom-in").addEventListener("click", () => zoomTo(state.zoom * 1.2));
$("graph-zoom-out").addEventListener("click", () => zoomTo(state.zoom / 1.2));
$("graph-reset").addEventListener("click", () => {
  render();
  announce("Graph layout and zoom reset.");
});
svg.addEventListener(
  "wheel",
  (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoomTo(state.zoom * Math.exp(-e.deltaY * 0.003), point(e));
  },
  { passive: false },
);
svg.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  const p = point(e),
    id = e.target.closest("[data-node]")?.dataset.node;
  drag = { id, start: p, last: p, moved: false, pointer: e.pointerId };
  svg.setPointerCapture(e.pointerId);
  svg.classList.add("is-dragging");
  e.preventDefault();
});
svg.addEventListener("pointermove", (e) => {
  if (!drag || drag.pointer !== e.pointerId) return;
  const p = point(e);
  if (Math.hypot(p.x - drag.start.x, p.y - drag.start.y) > 5) drag.moved = true;
  if (!drag.moved) return;
  const dx = p.x - drag.last.x,
    dy = p.y - drag.last.y;
  if (drag.id) {
    const n = nodes.get(drag.id);
    n.x += dx / state.zoom;
    n.y += dy / state.zoom;
    elements.get(n.id).setAttribute("transform", `translate(${n.x} ${n.y})`);
    positionEdges();
  } else {
    state.pan.x += dx;
    state.pan.y += dy;
    transform();
  }
  drag.last = p;
});
function endDrag(e, cancelled = false) {
  if (!drag || drag.pointer !== e.pointerId) return;
  const { id, moved } = drag;
  drag = undefined;
  svg.classList.remove("is-dragging");
  if (svg.hasPointerCapture(e.pointerId))
    svg.releasePointerCapture(e.pointerId);
  if (!cancelled && id && !moved) {
    activate(id);
    if (elements.has(id)) focusNode(id);
  }
}
svg.addEventListener("pointerup", (e) => endDrag(e));
svg.addEventListener("pointercancel", (e) => endDrag(e, true));
svg.addEventListener("click", (e) => {
  if (e.detail === 0) {
    const id = e.target.closest("[data-node]")?.dataset.node;
    if (id) activate(id);
  }
});
svg.addEventListener("keydown", (e) => {
  const id = e.target.closest("[data-node]")?.dataset.node;
  if (!id) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate(id);
    if (elements.has(id)) focusNode(id);
    return;
  }
  if (e.key === "Home") {
    e.preventDefault();
    focusNode(graph.nodes[0].id);
    return;
  }
  const dir = {
    ArrowRight: [1, 0],
    ArrowLeft: [-1, 0],
    ArrowDown: [0, 1],
    ArrowUp: [0, -1],
  }[e.key];
  if (!dir) return;
  e.preventDefault();
  const a = nodes.get(id);
  const next = graph.nodes
    .filter((n) => n.id !== id)
    .map((n) => {
      const dx = n.x - a.x,
        dy = n.y - a.y;
      const ahead = dx * dir[0] + dy * dir[1],
        side = Math.abs(dx * dir[1] - dy * dir[0]);
      return { n, ahead, score: Math.hypot(dx, dy) + side * 1.7 };
    })
    .filter((n) => n.ahead > 0)
    .sort((a, b) => a.score - b.score)[0];
  if (next) focusNode(next.n.id);
});
svg.addEventListener("pointerover", (e) => {
  if (drag) return;
  const id = e.target.closest("[data-node]")?.dataset.node;
  hovered = id || "";
  updateHighlight();
});
svg.addEventListener("pointerleave", () => {
  hovered = "";
  updateHighlight();
});
svg.addEventListener("focusin", (e) => {
  hovered = e.target.closest("[data-node]")?.dataset.node || "";
  updateHighlight();
});
svg.addEventListener("focusout", () => {
  hovered = "";
  updateHighlight();
});
function openTopic(id) {
  opener = document.activeElement;
  state.scope = "all";
  state.topic = id;
  state.query = "";
  state.selected = id;
  hovered = "";
  $("graph-search").value = "";
  render();
  document.documentElement.classList.add("dialog-open");
  dialog.showModal();
  dialog.scrollTop = 0;
}
$("dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.documentElement.classList.remove("dialog-open");
  opener?.focus({ preventScroll: true });
});
dialog.addEventListener("click", (e) => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  )
    dialog.close();
});
for (const button of document.querySelectorAll("[data-open-topic]")) {
  const id = button.dataset.openTopic,
    t = topicById(id),
    count = repositories.filter((r) => r.topics.includes(id)).length;
  button.querySelector(".category-count").textContent =
    String(count).padStart(2, "0") + " repositories ↗";
  button.setAttribute(
    "aria-label",
    `${t.label}, ${count} repositories. Open project explorer`,
  );
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-controls", "project-dialog");
  button.addEventListener("click", () => openTopic(id));
}
$("category-summary").textContent =
  String(topics.length).padStart(2, "0") + " TOPICS / " + "02 TWINS";
compact.addEventListener("change", () => {
  if (dialog.open) render();
});
createSolarSystem();
