import { projectStories } from "./project-stories.mjs";

const node = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

export function createVisitMotion(dialog) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false,
    paused = false,
    button,
    observer;
  function sync() {
    const disabled =
      reduced.matches || document.documentElement.dataset.motion === "off";
    dialog.dataset.visitMotion =
      dialog.open &&
      dialog.dataset.view === "project" &&
      visible &&
      !document.hidden &&
      !disabled &&
      !paused
        ? "on"
        : "off";
    if (!button) return;
    button.disabled = disabled;
    button.textContent = disabled
      ? "Motion off"
      : paused
        ? "Resume scene"
        : "Pause scene";
    button.setAttribute(
      "aria-label",
      paused ? "Resume project scene" : "Pause project scene",
    );
  }
  reduced.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  const changes = new MutationObserver(sync);
  changes.observe(dialog, {
    attributes: true,
    attributeFilter: ["open", "data-view"],
  });
  changes.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
  return {
    watch(hero, control) {
      observer?.disconnect();
      visible = false;
      button = control;
      button.addEventListener("click", () => {
        paused = !paused;
        sync();
      });
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      });
      observer.observe(hero);
      sync();
    },
    clear() {
      observer?.disconnect();
      visible = false;
      button = undefined;
      sync();
    },
  };
}

export function buildProjectVisit({
  repo,
  peers,
  topics,
  onSelect,
  topicButton,
  projectButton,
  external,
}) {
  const story = projectStories[repo.id];
  const index = peers.findIndex((p) => p.id === repo.id);
  const sequence = String(index + 1).padStart(2, "0");
  const wrap = node("div", "project-visit");
  const rail = node("nav", "visit-index");
  rail.setAttribute("aria-label", "Projects in this topic");
  rail.append(
    node("p", "eyebrow", "EXPLORE / " + String(peers.length).padStart(2, "0")),
  );
  const list = node("div", "visit-index-list");
  for (const [i, r] of peers.entries()) {
    const b = node("button", "visit-project");
    b.type = "button";
    b.id = "visit-nav-" + r.id;
    b.dataset.visitProject = r.id;
    if (r.id === repo.id) b.setAttribute("aria-current", "true");
    b.append(
      node("span", "visit-project-number", String(i + 1).padStart(2, "0")),
      node("span", "", r.name),
    );
    b.addEventListener("click", () => onSelect(r.id, b.id));
    list.append(b);
  }
  rail.append(list);
  const main = node("article", "visit-main");
  const hero = node("div", "visit-hero");
  const seed = [...repo.id].reduce((v, c) => v + c.charCodeAt(0), 0);
  hero.dataset.surface = ["terrain", "bands", "ice", "cloud"][seed % 4];
  hero.style.setProperty("--visit-tilt", `${(seed % 50) - 25}deg`);
  const secondary =
    topics.find((t) => t.id === repo.topics[1]) ||
    topics.find((t) => t.id === repo.topics[0]);
  wrap.style.setProperty("--visit-secondary", secondary.color);
  const sky = node("div", "visit-sky");
  sky.setAttribute("aria-hidden", "true");
  sky.append(
    node("span", "visit-distant"),
    node("span", "visit-world"),
    node("span", "visit-moon"),
  );
  const upper = node("div", "visit-hero-top");
  upper.append(node("span", "", "PROJECT WORLD / " + sequence));
  const motion = node("button", "visit-motion", "Pause scene");
  motion.type = "button";
  motion.id = "visit-motion";
  upper.append(motion);
  const copy = node("div", "visit-hero-copy");
  copy.append(node("p", "eyebrow detail-kind", repo.kind));
  const title = node("h3", "visit-title", repo.name);
  title.id = "graph-detail-title";
  copy.append(title, node("p", "visit-headline", story.headline));
  const links = node("div", "detail-links visit-links");
  links.append(
    external("View repository", "https://github.com/KweonTJ/" + repo.repo),
  );
  if (repo.lab)
    links.append(
      external(
        repo.id === "omx-training" ? "MuJoCo scenes" : "Open shelf twin",
        repo.lab,
      ),
    );
  const read = node("a", "visit-read", "Read project ↓");
  read.href = "#visit-story";
  read.addEventListener("click", (e) => {
    e.preventDefault();
    const section = wrap.querySelector("#visit-story");
    section.focus({ preventScroll: true });
    section.scrollIntoView({
      block: "start",
      behavior:
        document.documentElement.dataset.motion === "off" ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
    });
  });
  links.append(read);
  copy.append(links);
  hero.append(sky, upper, copy);
  const facts = node("dl", "visit-facts");
  for (const [value, label] of story.facts || [
    [repo.stack[0], "Primary toolkit"],
    [repo.stack[1] || repo.kind, "Approach"],
    [repo.kind, "Project scope"],
  ]) {
    const fact = node("div");
    fact.append(node("dt", "", label), node("dd", "", value));
    facts.append(fact);
  }
  const body = node("section", "visit-story");
  body.id = "visit-story";
  body.tabIndex = -1;
  body.setAttribute("aria-label", repo.name + " project introduction");
  const overview = node("div", "visit-overview");
  overview.append(
    node("p", "eyebrow", "01 / THE IDEA"),
    node("p", "detail-description", repo.description),
  );
  const stack = node("ul", "detail-stack");
  for (const item of repo.stack) stack.append(node("li", "", item));
  overview.append(stack);
  const engineering = node("div", "visit-engineering");
  engineering.append(node("p", "eyebrow", "02 / INSIDE THE WORK"));
  const work = node("div", "visit-work");
  for (const [heading, text] of story.work) {
    const part = node("div", "visit-work-item");
    part.append(node("h4", "", heading), node("p", "", text));
    work.append(part);
  }
  engineering.append(work);
  const scope = node("div", "visit-scope");
  scope.append(
    node("p", "eyebrow", "03 / CURRENT SCOPE"),
    node("p", "", story.status),
  );
  body.append(overview, engineering, scope);
  const image = story.image || repo.image;
  if (image) {
    const figure = node("figure", "visit-preview");
    const img = node("img", "detail-preview");
    img.src = image;
    img.alt = story.caption || repo.name + " project preview";
    img.loading = "lazy";
    figure.append(
      img,
      node("figcaption", "", story.caption || repo.name + " project preview"),
    );
    body.append(figure);
  }
  const related = node("div", "visit-related");
  const tags = node("div", "detail-topics");
  for (const id of repo.topics)
    tags.append(topicButton(topics.find((t) => t.id === id)));
  related.append(node("p", "eyebrow", "CONNECTED TOPICS"), tags);
  const others = node("div", "backlinks");
  for (const r of peers.filter((r) => r.id !== repo.id).slice(0, 3))
    others.append(projectButton(r));
  related.append(node("h4", "detail-heading", "MORE IN THIS SYSTEM"), others);
  const footer = node("div", "visit-pagination");
  for (const [id, label, offset] of [
    ["visit-prev", "← Previous project", -1],
    ["visit-next", "Next project →", 1],
  ]) {
    const target = peers[(index + offset + peers.length) % peers.length];
    const b = node("button", "", label);
    b.id = id;
    b.type = "button";
    b.disabled = peers.length < 2;
    b.addEventListener("click", () => onSelect(target.id, id));
    footer.append(b);
  }
  main.append(hero, facts, body, related, footer);
  wrap.append(rail, main);
  return {
    element: wrap,
    hero,
    motion,
    revealCurrent() {
      const current = list.querySelector('[aria-current="true"]');
      if (!current) return;
      if (matchMedia("(max-width:700px)").matches)
        list.scrollLeft = Math.max(0, current.offsetLeft - 8);
      else
        list.scrollTop = Math.max(0, current.offsetTop - list.clientHeight / 2);
    },
  };
}
