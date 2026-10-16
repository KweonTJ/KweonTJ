import test from "node:test";
import assert from "node:assert/strict";
import {
  jointValues,
  objectRecords,
  selectedInfo,
  TelemetryConnection,
} from "../simulator/telemetry.mjs";
const limits = {
  joint1: [-Math.PI, Math.PI],
  joint2: [-1.79, 1.57],
  joint3: [-0.94, 1.38],
  joint4: [-1.79, 2.04],
  gripper_left_joint: [-0.01, 0.019],
};
const joints = {
  name: ["joint3", "joint1", "joint4", "joint2"],
  position: [0.4, 0.1, -0.3, -0.2],
};
const object = {
  marker_id: 1,
  pose_valid: true,
  frame_id: "base_link",
  position: [0.3, 0.1, 0.2],
  orientation_xyzw: [0, 0, 0, 1],
};
test("joint states are applied by name, not incoming order", () => {
  assert.deepEqual(jointValues(joints, limits), {
    joint3: 0.4,
    joint1: 0.1,
    joint4: -0.3,
    joint2: -0.2,
  });
});
test("missing, duplicate, nonfinite and out-of-range joint states are rejected", () => {
  assert.equal(
    jointValues({ name: ["joint1"], position: [0.1] }, limits),
    null,
  );
  assert.equal(
    jointValues({ name: ["joint1", "joint1"], position: [0.1, 0.2] }, limits),
    null,
  );
  assert.equal(
    jointValues({ ...joints, position: [NaN, 0.1, -0.3, -0.2] }, limits),
    null,
  );
  assert.equal(
    jointValues({ ...joints, position: [0.4, 0.1, 99, -0.2] }, limits),
    null,
  );
  assert.equal(jointValues({ ...joints, position: [0.4] }, limits), null);
});
test("only fresh, valid base-frame marker poses are accepted", () => {
  assert.equal(
    objectRecords({ data: JSON.stringify({ fresh: true, objects: [object] }) })
      .length,
    1,
  );
  for (const invalid of [
    { ...object, frame_id: "camera_optical_frame" },
    { ...object, pose_valid: false },
    { ...object, duplicate: true },
    { ...object, position: [Infinity, 0, 0] },
    { ...object, orientation_xyzw: [0, 0, 0, 0] },
    { ...object, marker_id: 5 },
  ]) {
    assert.deepEqual(objectRecords({ fresh: true, objects: [invalid] }), []);
  }
  assert.deepEqual(objectRecords({ fresh: false, objects: [object] }), []);
  assert.deepEqual(objectRecords({ data: "invalid json" }), []);
});
test("duplicate marker entries do not create multiple objects", () => {
  assert.equal(
    objectRecords({ fresh: true, objects: [object, object] }).length,
    1,
  );
});
test("selection state retains invalid tracking without pretending it is a valid pose", () => {
  assert.deepEqual(
    selectedInfo({
      data: JSON.stringify({
        marker_id: 3,
        valid: false,
        reason: "CAMERA_TIMEOUT",
        request_id: "scan-1",
      }),
    }),
    {
      marker_id: 3,
      valid: false,
      reason: "CAMERA_TIMEOUT",
      request_id: "scan-1",
    },
  );
  assert.equal(selectedInfo({ data: "{bad" }), null);
  assert.equal(selectedInfo({ valid: "true" }), null);
});

test("WebSocket packets reject malformed JSON values, replay and expired frames", () => {
  const previousSocket = globalThis.WebSocket;
  const previousLocation = globalThis.location;
  class FakeSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    constructor() {
      this.readyState = 0;
    }
    close() {
      this.readyState = 3;
    }
  }
  globalThis.WebSocket = FakeSocket;
  globalThis.location = { protocol: "http:" };
  let count = 0;
  const client = new TelemetryConnection({
    mode() {},
    status() {},
    packet() {
      count++;
      return true;
    },
  });
  try {
    client.connect("ws://localhost/twin");
    const socket = client.socket;
    socket.readyState = 1;
    socket.onopen();
    for (const raw of ["null", "[]", '"text"', "{invalid"])
      assert.doesNotThrow(() => socket.onmessage({ data: raw }));
    const packet = (sequence, age_ms = 0) =>
      socket.onmessage({
        data: JSON.stringify({
          schema_version: 1,
          type: "telemetry",
          topic: "joint_states",
          sequence,
          age_ms,
          message: {},
        }),
      });
    packet(1);
    packet(1);
    packet(0);
    packet(2, 3000);
    assert.equal(count, 1);
    packet(2);
    assert.equal(count, 2);
  } finally {
    client.disconnect();
    globalThis.WebSocket = previousSocket;
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
  }
});
