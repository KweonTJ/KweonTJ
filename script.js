"use strict";
const projects = {
  go2: {
    number: "01",
    color: "#d89b80",
    category: "LOCOMOTION / SIMULATION STUDY",
    title: "Learning to find\nstable ground.",
    description:
      "Reinforcement learning for Unitree Go2 locomotion on uneven terrain, with body-stability and path-tracking evaluation in Isaac Gym.",
    stack: ["Isaac Gym", "PyTorch", "Reinforcement learning"],
    links: [["View repository", "HIMLoco_Horizontal"]],
  },
  omx: {
    number: "02",
    color: "#e7c68a",
    category: "MANIPULATION / POLICY & RUNTIME",
    title: "A learned correction.\nA steadier grasp.",
    description:
      "PPO residual control for OpenMANIPULATOR-X pick-and-place in MuJoCo, paired with a ROS 2 workspace for perception, policy execution, and delivery coordination.",
    stack: ["MuJoCo", "PPO", "ROS 2", "OpenMANIPULATOR-X"],
    links: [
      ["Training", "omx_train_ws"],
      ["Robot runtime", "Omx_Turtle_Bot"],
    ],
  },
  perception: {
    number: "03",
    color: "#87c9c8",
    category: "PERCEPTION / MOBILE MANIPULATION",
    title: "See in three dimensions.\nMove together.",
    description:
      "RGB-D localization, coordinate transforms, and perception-guided manipulation, connected to TurtleBot3 leader–follower transport.",
    stack: ["RGB-D", "ROS 2", "TF2", "TurtleBot3"],
    links: [
      [
        "View repository",
        "3D_pereception_Based_Mobile_Manipulator-Autonomous_Navigation_System",
      ],
    ],
  },
  rescue: {
    number: "04",
    color: "#ac9fd0",
    category: "EDGE AI / RESCUE MAPPING",
    title: "Turn observations\ninto a shared map.",
    description:
      "Jetson-based person detection and RGB-D SLAM, with floor-plan alignment, a field interface, and compact rescue-mapping messages over UWB.",
    stack: ["Jetson", "RTAB-Map", "RGB-D", "UWB"],
    links: [["View repository", "AI_Rescue_Box"]],
  },
  orv: {
    number: "05",
    color: "#c4cbd3",
    category: "ROBOT INTEGRATION / SIMULATION PREVIEW",
    title: "From four wheels\nto one working system.",
    description:
      "A ROS 2 rover workspace with encoder/PID firmware, odometry, a configuration GUI, and a MuJoCo model. Hardware parameters remain to be calibrated.",
    stack: ["ROS 2", "MuJoCo", "Arduino", "Raspberry Pi"],
    links: [["View repository", "ORV_4WD"]],
    image: true,
  },
};
const tabs = [...document.querySelectorAll(".project-tab")];
const panel = document.querySelector("#project-panel");
function selectProject(tab) {
  const project = projects[tab.dataset.project];
  if (!project) return;
  for (const item of tabs) {
    const selected = item === tab;
    item.classList.toggle("is-active", selected);
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  }
  panel.setAttribute("aria-labelledby", tab.id);
  panel.style.setProperty("--project-color", project.color);
  document.querySelector("#orbit-number").textContent = project.number;
  document.querySelector("#project-category").textContent = project.category;
  const heading = document.querySelector("#project-title");
  heading.replaceChildren();
  project.title.split("\n").forEach((line, index) => {
    if (index) heading.append(document.createElement("br"));
    heading.append(document.createTextNode(line));
  });
  document.querySelector("#project-description").textContent =
    project.description;
  const stack = document.querySelector("#project-stack");
  stack.replaceChildren(
    ...project.stack.map((name) => {
      const li = document.createElement("li");
      li.textContent = name;
      return li;
    }),
  );
  const links = document.querySelector("#project-links");
  links.replaceChildren(
    ...project.links.map(([label, repository]) => {
      const a = document.createElement("a");
      a.className = "text-link";
      a.href = "https://github.com/KweonTJ/" + repository;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.append(document.createTextNode(label + " "));
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "icon-arrow");
      svg.setAttribute("viewBox", "0 0 12 12");
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.2");
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", "M2 10 10 2M2 2h8v8");
      svg.append(path);
      arrow.append(svg);
      a.append(arrow);
      return a;
    }),
  );
  document.querySelector(".project-art").hidden = !!project.image;
  document.querySelector("#project-preview").hidden = !project.image;
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener("click", () => selectProject(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (["ArrowDown", "ArrowRight"].includes(event.key))
      next = (index + 1) % tabs.length;
    if (["ArrowUp", "ArrowLeft"].includes(event.key))
      next = (index + tabs.length - 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    selectProject(tabs[next]);
    tabs[next].scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "instant",
    });
  });
}
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
