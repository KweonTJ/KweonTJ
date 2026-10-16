import { repositories, topics } from "./data.mjs";
export function filterRepositories({
  scope = "featured",
  topic = "",
  query = "",
} = {}) {
  const q = query.trim().toLowerCase();
  return repositories.filter(
    (r) =>
      (scope === "all" || r.featured) &&
      (!topic || r.topics.includes(topic)) &&
      (!q ||
        [r.name, r.repo, r.description, ...r.stack]
          .join(" ")
          .toLowerCase()
          .includes(q)),
  );
}
export function labelLines(label) {
  if (label.length <= 18) return [label];
  const words = label.split(" "),
    lines = [""];
  for (const word of words) {
    if (lines.at(-1) && (lines.at(-1) + " " + word).length > 18)
      lines.push(word);
    else lines[lines.length - 1] += (lines.at(-1) ? " " : "") + word;
  }
  return lines;
}
export function makeGraph(options = {}) {
  const repos = filterRepositories(options);
  const used = new Set(repos.flatMap((r) => r.topics));
  // Compact overview is a topic map; unfold repositories by choosing a topic.
  const compactOverview = options.compact && !options.topic && !options.query;
  const includedTopics = topics.filter(
    (t) => used.has(t.id) || (compactOverview && !options.query),
  );
  const nodes = [],
    edges = [];
  const compactFocus = Boolean(options.topic);
  if (!compactFocus)
    nodes.push({
      id: "root",
      kind: "root",
      label: "Robotics",
      x: 0,
      y: 0,
      color: "#e9a383",
    });
  for (const t of includedTopics) {
    if (compactFocus && t.id !== options.topic) continue;
    const i = topics.indexOf(t),
      angle = ((-125 + i * 65) * Math.PI) / 180;
    const radius = options.compact ? 190 : 150;
    nodes.push({
      ...t,
      label: t.short || t.label,
      kind: "topic",
      x: compactFocus ? 0 : Math.cos(angle) * radius,
      y: compactFocus ? 0 : Math.sin(angle) * radius,
    });
    if (!compactFocus) edges.push({ source: "root", target: t.id });
  }
  if (!compactOverview) {
    for (const [index, r] of repos.entries()) {
      const group = repos.filter((p) => p.topics[0] === r.topics[0]);
      const i = group.indexOf(r),
        primary = topics.find((t) => t.id === r.topics[0]);
      const angle = compactFocus
        ? ((-90 + (index * 360) / Math.max(1, repos.length)) * Math.PI) / 180
        : ((-125 +
            topics.indexOf(primary) * 65 +
            (i - (group.length - 1) / 2) * 20) *
            Math.PI) /
          180;
      const radius = compactFocus
        ? repos.length > 8 && index % 2
          ? 310
          : 220
        : 315 + (i % 2) * 55;
      nodes.push({
        ...r,
        label: r.short || r.name,
        kind: "project",
        color: primary.color,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
      for (const topic of r.topics)
        if (!compactFocus || topic === options.topic)
          edges.push({ source: topic, target: r.id });
    }
    // Resolve label collisions once, with no ongoing simulation or layout animation.
    for (let pass = 0; pass < 220; pass++) {
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j];
          if (a.kind !== "project" && b.kind !== "project") continue;
          const aw =
            Math.max(...labelLines(a.label).map((l) => l.length)) * 7.5 + 22;
          const bw =
            Math.max(...labelLines(b.label).map((l) => l.length)) * 7.5 + 22;
          const dx = b.x - a.x,
            dy = b.y - a.y;
          const ox = (aw + bw) / 2 - Math.abs(dx),
            oy = 65 - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;
          const ma = a.kind === "project",
            mb = b.kind === "project",
            divisor = ma && mb ? 2 : 1;
          if (ox < oy) {
            const d = ((dx >= 0 ? 1 : -1) * (ox + 0.5)) / divisor;
            if (ma) a.x -= d;
            if (mb) b.x += d;
          } else {
            const d = ((dy >= 0 ? 1 : -1) * (oy + 0.5)) / divisor;
            if (ma) a.y -= d;
            if (mb) b.y += d;
          }
        }
    }
  }
  const ids = new Set(nodes.map((n) => n.id));
  return {
    nodes,
    edges: edges.filter((e) => ids.has(e.source) && ids.has(e.target)),
    repositories: repos,
  };
}
