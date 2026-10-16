export const TOPICS = [
  "joint_states",
  "objects",
  "selected_info",
  "task_status",
];
const finiteVector = (v, n) =>
  Array.isArray(v) &&
  v.length === n &&
  v.every((x) => typeof x === "number" && Number.isFinite(x));
export function jointValues(message, limits) {
  if (
    !message ||
    !Array.isArray(message.name) ||
    !Array.isArray(message.position) ||
    message.name.length !== message.position.length ||
    message.name.length > 128 ||
    new Set(message.name).size !== message.name.length
  )
    return null;
  const values = {};
  for (let i = 0; i < message.name.length; i++) {
    const name = message.name[i],
      value = message.position[i];
    if (typeof name !== "string") return null;
    if (!Object.hasOwn(limits, name)) continue;
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < limits[name][0] - 0.03 ||
      value > limits[name][1] + 0.03
    )
      return null;
    values[name] = Math.max(limits[name][0], Math.min(limits[name][1], value));
  }
  return ["joint1", "joint2", "joint3", "joint4"].every(
    (name) => name in values,
  )
    ? values
    : null;
}
export function objectRecords(message) {
  let payload;
  try {
    payload =
      typeof message?.data === "string" ? JSON.parse(message.data) : message;
  } catch {
    return [];
  }
  if (
    !payload ||
    payload.fresh !== true ||
    !Array.isArray(payload.objects) ||
    payload.objects.length > 128
  )
    return [];
  const seen = new Set();
  return payload.objects.filter((item) => {
    if (
      !item ||
      !Number.isInteger(item.marker_id) ||
      item.marker_id < 1 ||
      item.marker_id > 4 ||
      seen.has(item.marker_id) ||
      item.pose_valid !== true ||
      item.duplicate === true ||
      item.frame_id !== "base_link" ||
      !finiteVector(item.position, 3) ||
      !finiteVector(item.orientation_xyzw, 4)
    )
      return false;
    if (item.position.some((x) => Math.abs(x) > 5)) return false;
    const norm = Math.hypot(...item.orientation_xyzw);
    if (norm < 0.9 || norm > 1.1) return false;
    seen.add(item.marker_id);
    return true;
  });
}
export function selectedInfo(message) {
  try {
    const value =
      typeof message?.data === "string" ? JSON.parse(message.data) : message;
    if (!value || typeof value !== "object" || typeof value.valid !== "boolean")
      return null;
    return {
      marker_id:
        Number.isInteger(value.marker_id) &&
        value.marker_id >= 1 &&
        value.marker_id <= 4
          ? value.marker_id
          : null,
      valid: value.valid,
      reason:
        typeof value.reason === "string" ? value.reason.slice(0, 100) : "",
      request_id:
        typeof value.request_id === "string"
          ? value.request_id.slice(0, 100)
          : "",
    };
  } catch {
    return null;
  }
}
export class TelemetryConnection {
  constructor(callbacks, { staleMs = 2000 } = {}) {
    this.callbacks = callbacks;
    this.staleMs = staleMs;
    this.socket = null;
    this.lastJoint = 0;
    this.lastPacket = 0;
    this.lastSequence = -1;
    this.started = 0;
    this.timer = null;
    this.lastState = "";
  }
  connect(address) {
    if (this.socket) throw new Error("기존 연결을 먼저 해제하세요.");
    const url = new URL(address);
    if (
      !["ws:", "wss:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.hash
    )
      throw new Error("ws:// 또는 wss:// 게이트웨이 주소를 입력하세요.");
    if (location.protocol === "https:" && url.protocol !== "wss:")
      throw new Error(
        "HTTPS 홈페이지에서는 wss:// 주소가 필요합니다. 로컬 테스트는 http://localhost에서 실행하세요.",
      );
    this.lastJoint = 0;
    this.lastSequence = -1;
    this.lastState = "";
    this.started = performance.now();
    const socket = new WebSocket(url.href);
    this.socket = socket;
    this.callbacks.status("connecting", "게이트웨이에 연결하는 중…");
    socket.onopen = () => {
      if (this.socket !== socket) return;
      this.callbacks.mode(true);
      this.callbacks.status("waiting", "연결됨 · 관절 상태 대기");
    };
    socket.onmessage = (event) => {
      if (
        this.socket !== socket ||
        typeof event.data !== "string" ||
        event.data.length > 262144
      )
        return;
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        data.schema_version !== 1
      )
        return;
      if (data.type === "hello") {
        this.callbacks.hello?.(data);
        return;
      }
      if (
        data.type !== "telemetry" ||
        !TOPICS.includes(data.topic) ||
        !Number.isSafeInteger(data.sequence) ||
        data.sequence <= this.lastSequence ||
        !Number.isFinite(data.age_ms) ||
        data.age_ms < 0 ||
        data.age_ms > this.staleMs
      )
        return;
      this.lastSequence = data.sequence;
      this.lastPacket = performance.now();
      if (
        this.callbacks.packet(data.topic, data.message) === true &&
        data.topic === "joint_states"
      )
        this.lastJoint = performance.now() - data.age_ms;
      this.check();
    };
    socket.onerror = () => {
      if (this.socket === socket)
        this.callbacks.status(
          "error",
          "게이트웨이 연결 실패 · 주소와 서버 실행 상태를 확인하세요.",
        );
    };
    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.socket = null;
      clearInterval(this.timer);
      this.timer = null;
      this.callbacks.mode(false);
      this.callbacks.status("disconnected", "연결 종료 · 로컬 조작 모드");
    };
    this.timer = setInterval(() => this.check(), 250);
  }
  check() {
    if (!this.socket) return;
    const now = performance.now();
    if (
      this.socket.readyState === WebSocket.CONNECTING &&
      now - this.started > 10000
    ) {
      this.disconnect();
      this.callbacks.status(
        "error",
        "연결 시간이 초과되었습니다. 서버 주소를 확인하세요.",
      );
      return;
    }
    if (this.socket.readyState !== WebSocket.OPEN) return;
    const state =
      this.lastJoint && now - this.lastJoint <= this.staleMs
        ? "live"
        : this.lastJoint || now - this.started > this.staleMs
          ? "stale"
          : "waiting";
    if (state !== this.lastState) {
      this.lastState = state;
      this.callbacks.status(
        state,
        state === "live"
          ? "관절 텔레메트리 수신 중"
          : state === "stale"
            ? "관절 데이터 지연 · 마지막 자세 유지"
            : "연결됨 · 관절 상태 대기",
      );
    }
    this.callbacks.age?.(this.lastJoint ? now - this.lastJoint : null);
  }
  disconnect() {
    const socket = this.socket;
    this.socket = null;
    clearInterval(this.timer);
    this.timer = null;
    if (socket) socket.close(1000, "Viewer disconnected");
    this.callbacks.mode(false);
    this.callbacks.status("disconnected", "연결되지 않음 · 로컬 조작 모드");
  }
}
