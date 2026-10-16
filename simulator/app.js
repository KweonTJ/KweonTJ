import * as THREE from "three";
import { OrbitControls } from "./vendor/three/OrbitControls.js";
import { RobotModel } from "./robot.js";
import {
  TelemetryConnection,
  jointValues,
  objectRecords,
  selectedInfo,
} from "./telemetry.mjs";

const $ = (id) => document.getElementById(id);
const ARM = ["joint1", "joint2", "joint3", "joint4"];
const GRIP = "gripper_left_joint";
const COLORS = [0xe2a17f, 0x8abeb3, 0xa7a1cb, 0xd7be82];
let robot,
  renderer,
  controls,
  camera,
  scene,
  spec,
  frame,
  selected = 1,
  live = false,
  savedManual,
  needsRender = true;
let targetValues = {},
  lastFrame = 0,
  feed = false,
  objectLastSeen = new Map(),
  sourceState = "local";
const objects = new Map(),
  uiRanges = new Map(),
  limits = {},
  raycaster = new THREE.Raycaster();
const viewport = $("viewport");
const degrees = (value) => (value * 180) / Math.PI;
const formatAngle = (value) => `${degrees(value).toFixed(1)}°`;
const positions = () =>
  [...objects.values()].map((o) => ({
    id: o.id,
    position: o.group.position.toArray(),
    level: o.level,
    x: o.x,
    y: o.y,
  }));
const connection = new TelemetryConnection({
  mode(enabled) {
    if (!robot || live === enabled) return;
    live = enabled;
    if (enabled) {
      savedManual = { joints: { ...targetValues }, objects: positions() };
      for (const object of objects.values()) object.group.visible = false;
      objectLastSeen.clear();
    } else {
      sourceState = "local";
      if (savedManual) {
        targetValues = { ...savedManual.joints };
        for (const item of savedManual.objects) {
          const object = objects.get(item.id);
          Object.assign(object, { x: item.x, y: item.y, level: item.level });
          object.group.quaternion.identity();
          object.group.position.fromArray(item.position);
          object.group.visible = true;
        }
      }
      updateInputs();
    }
    $("robot-controls").disabled = enabled;
    $("object-controls").disabled = enabled;
    $("reset-scene").disabled = enabled;
    $("connect").disabled = enabled;
    $("disconnect").disabled = !enabled;
    $("bridge-url").disabled = enabled;
    $("state-source").textContent = enabled ? "ROS 2 / 수신 전용" : "수동 조작";
    $("view-mode").textContent = enabled ? "ROS 2 TELEMETRY" : "LOCAL SANDBOX";
    $("view-mode").className = "view-mode";
    $("object-status").textContent = enabled
      ? "base_link 기준의 유효한 물체 좌표를 기다립니다."
      : `ID ${selected}을 선택했습니다.`;
    needsRender = true;
  },
  status(state, text) {
    sourceState = state;
    $("connection-status").textContent = text;
    $("view-mode").className =
      "view-mode" + (state === "live" ? " live" : live ? " stale" : "");
    if (live)
      $("state-source").textContent =
        state === "live" ? "ROS 2 / 수신 중" : "ROS 2 / 데이터 대기·지연";
    if (state === "connecting") {
      $("connect").disabled = true;
      $("disconnect").disabled = false;
    }
    if (["error", "disconnected"].includes(state) && !live) {
      $("connect").disabled = false;
      $("disconnect").disabled = true;
    }
  },
  hello(data) {
    $("connection-detail").textContent =
      `시각화 도메인 ${data.domain_id ?? "—"} · 수신 전용 게이트웨이`;
  },
  packet(topic, message) {
    if (!robot) return false;
    if (topic === "joint_states") {
      const values = jointValues(message, limits);
      if (!values) {
        $("connection-detail").textContent =
          "관절 이름·범위·값이 올바르지 않아 메시지를 반영하지 않았습니다.";
        return false;
      }
      targetValues = { ...targetValues, ...values };
      robot.setValues(targetValues);
      updateInputs();
      needsRender = true;
      return true;
    }
    if (topic === "objects") {
      const records = objectRecords(message),
        now = performance.now();
      for (const object of objects.values()) object.group.visible = false;
      const markerRotation = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -Math.PI / 2,
      );
      for (const record of records) {
        const object = objects.get(record.marker_id);
        const base = robot.links.get("base_link");
        const baseQuaternion = base.getWorldQuaternion(new THREE.Quaternion());
        const orientation = new THREE.Quaternion(
          ...record.orientation_xyzw,
        ).normalize();
        object.group.quaternion
          .copy(baseQuaternion)
          .multiply(orientation)
          .multiply(markerRotation.clone().invert());
        const offset = new THREE.Vector3(-0.0281, 0, 0).applyQuaternion(
          object.group.quaternion,
        );
        object.group.position
          .copy(base.localToWorld(new THREE.Vector3(...record.position)))
          .sub(offset);
        object.group.visible = true;
        objectLastSeen.set(record.marker_id, now);
      }
      $("object-status").textContent = records.length
        ? `${records.length}개 마커 좌표 수신 · base_link 기준`
        : "유효한 base_link 물체 좌표가 없습니다.";
      needsRender = true;
    }
    if (topic === "selected_info") {
      const info = selectedInfo(message);
      if (info) {
        if (info.marker_id && info.marker_id !== selected)
          selectObject(info.marker_id);
        $("object-status").textContent = info.valid
          ? `ID ${info.marker_id} 추적 중 · ${info.request_id}`
          : `인지 상태: ${info.reason || "유효 좌표 대기"}`;
      }
    }
    if (topic === "task_status") {
      $("connection-detail").textContent =
        "로봇 상태: " + String(message?.data ?? "").slice(0, 180);
    }
    return false;
  },
});

function createJointControls() {
  const names = {
    joint1: "Base rotation",
    joint2: "Shoulder",
    joint3: "Elbow",
    joint4: "Wrist",
    [GRIP]: "Gripper",
  };
  for (const name of [...ARM, GRIP]) {
    const { lower, upper } = robot.joints.get(name).limit;
    limits[name] = [lower, upper];
    const isGrip = name === GRIP;
    const label = document.createElement("label");
    label.className = "range-row";
    label.htmlFor = `range-${name}`;
    const caption = document.createElement("span");
    caption.textContent = names[name];
    const output = document.createElement("output");
    output.htmlFor = label.htmlFor;
    output.id = `value-${name}`;
    const input = document.createElement("input");
    input.type = "range";
    input.id = label.htmlFor;
    input.min = String(isGrip ? lower * 1000 : degrees(lower));
    input.max = String(isGrip ? upper * 1000 : degrees(upper));
    input.step = isGrip ? ".1" : ".1";
    input.value = String(
      isGrip ? targetValues[name] * 1000 : degrees(targetValues[name]),
    );
    input.addEventListener("input", () => {
      if (live) return;
      targetValues[name] = isGrip
        ? Number(input.value) / 1000
        : THREE.MathUtils.degToRad(Number(input.value));
      updateInputs();
      needsRender = true;
    });
    label.append(caption, output, input);
    $("joint-sliders").append(label);
    uiRanges.set(name, { input, output });
  }
  updateInputs();
}
function updateInputs() {
  for (const [name, ui] of uiRanges) {
    ui.input.value = String(
      name === GRIP ? targetValues[name] * 1000 : degrees(targetValues[name]),
    );
    ui.output.textContent =
      name === GRIP
        ? `${(targetValues[name] * 1000).toFixed(1)} mm`
        : formatAngle(targetValues[name]);
  }
  const o = objects.get(selected);
  if (o) {
    $("object-level").value = String(o.level);
    $("object-x").value = String(Math.round(o.x * 1000));
    $("object-y").value = String(Math.round(o.y * 1000));
    $("object-x-value").textContent = `${Math.round(o.x * 1000)} mm`;
    $("object-y-value").textContent = `${Math.round(o.y * 1000)} mm`;
    $("selected-summary").textContent =
      `ID ${selected} · ${live ? "ROS 좌표" : o.level ? "상단" : "하단"}`;
  }
}
function markerTexture(bits) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#000";
  for (let y = 0; y < 6; y++)
    for (let x = 0; x < 6; x++)
      if (bits[y][x]) ctx.fillRect(32 + x * 32, 32 + y * 32, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}
function makeObjects() {
  for (let id = 1; id <= 4; id++) {
    const group = new THREE.Group();
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.055, 0.05),
      new THREE.MeshStandardMaterial({
        color: COLORS[id - 1],
        roughness: 0.72,
      }),
    );
    box.castShadow = box.receiveShadow = true;
    box.userData.objectId = id;
    group.add(box);
    const marker = new THREE.Mesh(
      new THREE.PlaneGeometry(0.053333, 0.053333),
      new THREE.MeshBasicMaterial({
        map: markerTexture(spec.markers[String(id)]),
        side: THREE.DoubleSide,
      }),
    );
    marker.rotation.y = -Math.PI / 2;
    marker.position.x = -0.0281;
    group.add(marker);
    // The marker's black square is 40 mm, matching the upstream print sheet.
    const o = {
      id,
      group,
      box,
      level: id <= 2 ? 0 : 1,
      x: -0.06,
      y: id % 2 ? -0.08 : 0.08,
    };
    scene.add(group);
    objects.set(id, o);
    positionObject(o);
  }
}
function positionObject(object) {
  object.group.quaternion.identity();
  object.group.position.set(
    spec.shelf.x + object.x,
    object.y,
    spec.shelf.supportHeight +
      spec.shelf.floorTop +
      object.level * spec.shelf.stackPitch +
      0.025,
  );
  object.group.visible = true;
  needsRender = true;
}
let selectionOutline;
function selectObject(id) {
  if (!objects.has(id)) return;
  selected = id;
  for (const button of document.querySelectorAll("[data-object]"))
    button.setAttribute(
      "aria-pressed",
      String(Number(button.dataset.object) === selected),
    );
  if (selectionOutline) scene.remove(selectionOutline);
  selectionOutline?.geometry.dispose();
  selectionOutline?.material.dispose();
  selectionOutline = new THREE.BoxHelper(objects.get(id).box, 0xefbb95);
  scene.add(selectionOutline);
  if (!live) $("object-status").textContent = `ID ${id}을 선택했습니다.`;
  updateInputs();
  needsRender = true;
}
function editObject() {
  if (live || !spec) return;
  const o = objects.get(selected),
    next = {
      level: Number($("object-level").value),
      x: Number($("object-x").value) / 1000,
      y: Number($("object-y").value) / 1000,
    };
  if (
    [...objects.values()].some(
      (other) =>
        other.id !== selected &&
        other.level === next.level &&
        Math.abs(other.x - next.x) < 0.06 &&
        Math.abs(other.y - next.y) < 0.06,
    )
  ) {
    $("object-status").textContent =
      "다른 물체와 겹치는 위치입니다. 배치를 유지했습니다.";
    updateInputs();
    return;
  }
  Object.assign(o, next);
  positionObject(o);
  updateInputs();
  $("object-status").textContent =
    `ID ${selected}의 ${next.level ? "상단" : "하단"} 배치를 바꿨습니다.`;
}
const cameraPositions = {
  orbit: [-0.85, -0.95, 0.78],
  front: [-1.15, 0, 0.48],
  side: [0.18, -1.25, 0.5],
  top: [0.12, -0.001, 1.5],
};
function setCamera(name) {
  camera.position.fromArray(cameraPositions[name]);
  controls.target.set(0.1, 0, 0.2);
  controls.update();
  for (const button of document.querySelectorAll("[data-camera]"))
    button.classList.toggle("active", button.dataset.camera === name);
  needsRender = true;
}
let axes, eefCamera;
function resize() {
  if (!renderer) return;
  const { width, height } = viewport.getBoundingClientRect();
  renderer.setSize(Math.max(1, width), Math.max(1, height), false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  needsRender = true;
}
function render() {
  const width = viewport.clientWidth,
    height = viewport.clientHeight;
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, width, height);
  renderer.setClearColor(0x101826);
  renderer.render(scene, camera);
  if (feed) {
    const w = Math.round(width * (width < 500 ? 0.43 : 0.35)),
      h = Math.round(w * 0.75),
      x = width - w - 8,
      y = 8;
    const frameNode = robot.links.get("eef_usb_camera_optical_frame");
    frameNode.getWorldPosition(eefCamera.position);
    frameNode.getWorldQuaternion(eefCamera.quaternion);
    eefCamera.quaternion.multiply(
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        Math.PI,
      ),
    );
    eefCamera.aspect = w / h;
    eefCamera.updateProjectionMatrix();
    renderer.setScissorTest(true);
    renderer.setViewport(x, y, w, h);
    renderer.setScissor(x, y, w, h);
    renderer.setClearColor(0x111723);
    renderer.clear();
    renderer.render(scene, eefCamera);
    renderer.setScissorTest(false);
  }
  needsRender = false;
}
function animate(time) {
  frame = requestAnimationFrame(animate);
  const dt = Math.min((time - lastFrame) / 1000 || 0.016, 0.04);
  lastFrame = time;
  let moving = false;
  if (!live) {
    const q = {};
    for (const name of [...ARM, GRIP]) {
      const current = robot.values[name] ?? 0,
        goal = targetValues[name],
        delta = goal - current,
        maxStep = (name === GRIP ? 0.03 : 1.8) * dt;
      q[name] = current + Math.sign(delta) * Math.min(Math.abs(delta), maxStep);
      if (Math.abs(delta) > 0.00001) moving = true;
    }
    if (moving) {
      robot.setValues(q);
      needsRender = true;
    }
  }
  if (live) {
    for (const o of objects.values())
      if (
        o.group.visible &&
        time - (objectLastSeen.get(o.id) ?? -Infinity) > 1500
      ) {
        o.group.visible = false;
        $("object-status").textContent =
          "물체 좌표가 만료되어 표시를 숨겼습니다.";
        needsRender = true;
      }
  }
  selectionOutline.visible = objects.get(selected).group.visible;
  if (live)
    $("selected-summary").textContent =
      `ID ${selected} · ${objects.get(selected).group.visible ? "ROS 좌표" : "유효 좌표 없음"}`;
  if (needsRender || moving) {
    selectionOutline.update();
    const p = robot.endEffector();
    $("eef-position").textContent =
      `${p.x.toFixed(3)} / ${p.y.toFixed(3)} / ${p.z.toFixed(3)}`;
  }
  if (controls.update()) needsRender = true;
  if (needsRender) render();
}
function bindUI() {
  for (const button of document.querySelectorAll("[data-camera]"))
    button.addEventListener("click", () => setCamera(button.dataset.camera));
  for (const button of document.querySelectorAll("[data-object]"))
    button.addEventListener("click", () =>
      selectObject(Number(button.dataset.object)),
    );
  for (const id of ["object-level", "object-x", "object-y"])
    $(id).addEventListener("input", editObject);
  $("pose-stay").addEventListener("click", () => {
    targetValues = { ...spec.initialJoints };
    updateInputs();
  });
  $("pose-observe").addEventListener("click", () => {
    targetValues = {
      ...targetValues,
      joint1: 0,
      joint2: -0.6,
      joint3: 0.7,
      joint4: -0.1,
      [GRIP]: 0.019,
    };
    updateInputs();
  });
  $("gripper-open").addEventListener("click", () => {
    targetValues[GRIP] = limits[GRIP][1];
    updateInputs();
  });
  $("gripper-close").addEventListener("click", () => {
    targetValues[GRIP] = limits[GRIP][0];
    updateInputs();
  });
  $("show-axes").addEventListener("change", (event) => {
    axes.visible = event.target.checked;
    needsRender = true;
  });
  $("auto-rotate").addEventListener("change", (event) => {
    controls.autoRotate = event.target.checked;
    needsRender = true;
  });
  $("camera-feed").addEventListener("click", () => {
    feed = !feed;
    $("camera-feed").setAttribute("aria-pressed", String(feed));
    $("camera-label").hidden = !feed;
    needsRender = true;
  });
  $("fullscreen").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (viewport.requestFullscreen) await viewport.requestFullscreen();
      else
        $("model-state").textContent =
          "이 브라우저는 전체화면을 지원하지 않습니다.";
    } catch {
      $("model-state").textContent = "전체화면을 열 수 없습니다.";
    }
  });
  $("reset-scene").addEventListener("click", () => {
    if (live) return;
    targetValues = { ...spec.initialJoints };
    robot.setValues(targetValues);
    for (const o of objects.values()) {
      o.level = o.id <= 2 ? 0 : 1;
      o.x = -0.06;
      o.y = o.id % 2 ? -0.08 : 0.08;
      positionObject(o);
    }
    selectObject(1);
    setCamera("orbit");
    updateInputs();
    $("object-status").textContent = "장면을 초기화했습니다.";
  });
  $("connection-form").addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      connection.connect($("bridge-url").value.trim());
    } catch (error) {
      $("connection-status").textContent = error.message;
    }
  });
  $("disconnect").addEventListener("click", () => connection.disconnect());
  let down;
  viewport.addEventListener("pointerdown", (event) => {
    down = [event.clientX, event.clientY];
  });
  viewport.addEventListener("pointerup", (event) => {
    if (
      !down ||
      Math.hypot(event.clientX - down[0], event.clientY - down[1]) > 5
    )
      return;
    const rect = viewport.getBoundingClientRect();
    raycaster.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      ),
      camera,
    );
    const hit = raycaster.intersectObjects(
      [...objects.values()].filter((o) => o.group.visible).map((o) => o.box),
      false,
    )[0];
    if (hit) selectObject(hit.object.userData.objectId);
  });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function setMotionPreference() {
    controls.enableDamping = !reduceMotion.matches;
    if (reduceMotion.matches) {
      controls.autoRotate = false;
      $("auto-rotate").checked = false;
    }
    needsRender = true;
  }
  reduceMotion.addEventListener("change", setMotionPreference);
  setMotionPreference();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = null;
    } else if (!frame) {
      lastFrame = 0;
      needsRender = true;
      frame = requestAnimationFrame(animate);
    }
  });
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    connection.disconnect();
    controls.dispose();
    robot.dispose();
    renderer.dispose();
  });
}
async function main() {
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.domElement.setAttribute(
      "aria-label",
      "원본 로봇과 2단 선반 3D 렌더링",
    );
    viewport.append(renderer.domElement);
    renderer.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      $("loading-overlay").hidden = false;
      $("loading-text").textContent = "3D 그래픽 연결이 중단되었습니다.";
      $("loading-detail").textContent =
        "다시 불러와 장면을 복구할 수 있습니다.";
      $("retry-load").hidden = false;
    });
    const response = await fetch("./assets/scene.json");
    if (!response.ok) throw new Error("모델 데이터 응답: " + response.status);
    spec = await response.json();
    robot = new RobotModel(spec);
    targetValues = { ...spec.initialJoints };
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101826);
    scene.fog = new THREE.Fog(0x101826, 2.5, 5);
    scene.add(new THREE.HemisphereLight(0xd8e2fa, 0x5b4950, 2.9));
    const key = new THREE.DirectionalLight(0xffe0c5, 3.1);
    key.position.set(-0.7, -1, 1.8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -1;
    key.shadow.camera.right = key.shadow.camera.top = 1;
    key.shadow.camera.near = 0.05;
    key.shadow.camera.far = 4;
    key.shadow.bias = -0.0003;
    key.shadow.normalBias = 0.001;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8cb7f9, 2);
    fill.position.set(0.5, 1, 0.9);
    scene.add(fill);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({ color: 0x182334, roughness: 0.92 }),
    );
    ground.receiveShadow = true;
    ground.position.z = -0.001;
    scene.add(ground);
    const grid = new THREE.GridHelper(4, 80, 0x42506a, 0x263246);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = 0.0003;
    grid.material.transparent = true;
    grid.material.opacity = 0.42;
    scene.add(grid);
    axes = new THREE.AxesHelper(0.2);
    axes.visible = false;
    axes.position.z = 0.002;
    scene.add(axes);
    scene.add(robot.root);
    await robot.loadVisuals("./assets/", (done, total) => {
      $("loading-detail").textContent = `원본 에셋 ${done} / ${total}`;
    });
    camera = new THREE.PerspectiveCamera(40, 1, 0.01, 20);
    camera.up.set(0, 0, 1);
    eefCamera = new THREE.PerspectiveCamera(60, 4 / 3, 0.008, 4);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.3;
    controls.maxDistance = 3.5;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.autoRotateSpeed = 0.55;
    controls.dampingFactor = 0.08;
    controls.addEventListener("change", () => {
      needsRender = true;
    });
    makeObjects();
    createJointControls();
    selectObject(1);
    setCamera("orbit");
    bindUI();
    new ResizeObserver(resize).observe(viewport);
    resize();
    $("robot-controls").disabled = false;
    $("object-controls").disabled = false;
    $("reset-scene").disabled = false;
    $("connect").disabled = false;
    $("loading-overlay").hidden = true;
    $("model-state").textContent = "3D 준비됨";
    $("source-version").textContent = "SOURCE " + spec.sourceCommit.slice(0, 8);
    viewport.dataset.ready = "true";
    frame = requestAnimationFrame(animate);
  } catch (error) {
    console.error(error);
    $("loading-overlay").hidden = false;
    $("loading-text").textContent = "3D 장면을 불러오지 못했습니다.";
    $("loading-detail").textContent =
      error.message || "WebGL 지원 및 네트워크 상태를 확인하세요.";
    $("retry-load").hidden = false;
    $("model-state").textContent = "모델 로딩 실패";
  }
}
$("retry-load").addEventListener("click", () => location.reload());
main();
