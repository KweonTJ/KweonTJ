import test from "node:test";
import assert from "node:assert/strict";
import { projectOrbit } from "../assets/knowledge/project-orbits.mjs";

test("every topic size follows a continuous closed project orbit", () => {
  for (let count = 1; count <= 15; count++) {
    const a = projectOrbit(count),
      b = projectOrbit(count, 1),
      end = projectOrbit(count, 92);
    assert.equal(a.positions.length, count);
    a.positions.forEach((p, i) => {
      assert.ok(Math.hypot(p.x - b.positions[i].x, p.y - b.positions[i].y) > 1);
      assert.ok(
        Math.hypot(p.x - end.positions[i].x, p.y - end.positions[i].y) < 1e-8,
      );
    });
  }
});
test("project body and label bounds stay separated and inside the fixed view through a full turn", () => {
  for (let count = 1; count <= 15; count++)
    for (let second = 0; second < 92; second += 0.5) {
      const { rx, ry, positions } = projectOrbit(count, second);
      for (const p of positions) {
        assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
        assert.ok(p.x - 90 >= -rx - 125 && p.x + 90 <= rx + 125);
        assert.ok(p.y + 75 < ry + 125);
      }
      for (let i = 0; i < count; i++)
        for (let j = i + 1; j < count; j++) {
          const dx = Math.abs(positions[i].x - positions[j].x),
            dy = Math.abs(positions[i].y - positions[j].y);
          assert.ok(
            dx >= 170 || dy >= 60,
            `labels overlap for ${count} projects at ${second}s`,
          );
        }
    }
});
test("an empty topic does not invent any project bodies", () => {
  assert.deepEqual(projectOrbit(0).positions, []);
  assert.ok(Number.isFinite(projectOrbit(0).rx));
});
