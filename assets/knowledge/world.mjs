const body = document.querySelector(".world-page");
const hero = body?.querySelector(".lab-intro,.hub-intro");
if (hero) {
  const emblem = document.createElement("div");
  emblem.className = "world-emblem";
  emblem.setAttribute("aria-hidden", "true");
  for (const cls of [
    "world-emblem-core",
    "world-emblem-ring",
    "world-emblem-ring",
    "world-satellite",
  ]) {
    const item = document.createElement("span");
    item.className = cls;
    emblem.append(item);
  }
  const caption = document.createElement("span");
  caption.className = "world-emblem-caption";
  caption.textContent = body.dataset.worldLabel;
  emblem.append(caption);
  hero.append(emblem);
  const motion = document.createElement("button");
  motion.type = "button";
  motion.className = "world-motion";
  motion.id = "world-motion-toggle";
  hero.after(motion);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false,
    paused = false;
  function sync() {
    body.dataset.worldMotion =
      !paused && !reduced.matches && !document.hidden && visible ? "on" : "off";
    motion.disabled = reduced.matches;
    motion.textContent = reduced.matches
      ? "모션 꺼짐"
      : paused
        ? "궤도 재생"
        : "궤도 정지";
    motion.setAttribute(
      "aria-label",
      paused ? "장식 궤도 애니메이션 재생" : "장식 궤도 애니메이션 정지",
    );
  }
  motion.addEventListener("click", () => {
    paused = !paused;
    sync();
  });
  reduced.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(hero);
  sync();
}
