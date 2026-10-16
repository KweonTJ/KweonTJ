"use strict";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionEnabled = !reducedMotion.matches;
const motionButton = document.querySelector("#motion-toggle");
let framePending = false;
function updateScroll() {
  framePending = false;
  const y = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector(".reading-progress").style.width =
    (height > 0 ? (y / height) * 100 : 0) + "%";
  if (motionEnabled && !reducedMotion.matches) {
    for (const layer of document.querySelectorAll("[data-depth]")) {
      layer.style.transform = `translate3d(0,${Math.min(y, 1200) * Number(layer.dataset.depth)}px,0)`;
    }
  }
}
function scheduleScroll() {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateScroll);
  }
}
function setMotion(enabled) {
  motionEnabled = enabled;
  document.documentElement.dataset.motion = enabled ? "on" : "off";
  motionButton.setAttribute("aria-pressed", String(enabled));
  document.querySelector("#motion-label").textContent = enabled
    ? "Motion on"
    : "Motion off";
  for (const layer of document.querySelectorAll("[data-depth]"))
    layer.style.transform = "";
  scheduleScroll();
}
motionButton.addEventListener("click", () => setMotion(!motionEnabled));
reducedMotion.addEventListener("change", () =>
  setMotion(!reducedMotion.matches),
);
window.addEventListener("scroll", scheduleScroll, { passive: true });
window.addEventListener("resize", scheduleScroll, { passive: true });
setMotion(motionEnabled);
document.querySelector("#copy-email").addEventListener("click", async () => {
  const status = document.querySelector("#copy-status");
  try {
    await navigator.clipboard.writeText("cbnuai@chungbuk.ac.kr");
    status.textContent = "Email address copied.";
  } catch {
    status.textContent =
      "cbnuai@chungbuk.ac.kr — select the address to copy, or use the email link.";
  }
});
