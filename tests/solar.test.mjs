import test from "node:test";
import assert from "node:assert/strict";
import { solarLayout } from "../assets/knowledge/solar.mjs";

test("worlds complete a continuous orbit without rotating their text", () => {
  for (const [width, height] of [
    [280, 280],
    [1240, 600],
  ]) {
    const initial = solarLayout(width, height, 0),
      next = solarLayout(width, height, 1),
      cycle = solarLayout(width, height, 76);
    assert.equal(initial.worlds.length, 8);
    initial.worlds.forEach((p, i) => {
      assert.ok(Math.hypot(p.x - next.worlds[i].x, p.y - next.worlds[i].y) > 1);
      assert.ok(Math.abs(p.x - cycle.worlds[i].x) < 1e-8);
      assert.ok(Math.abs(p.y - cycle.worlds[i].y) < 1e-8);
    });
  }
});
test("planet bodies and upright labels remain inside the responsive stage for a full revolution", () => {
  for (const width of [280, 296, 366, 688, 928, 1240]) {
    const height = width < 700 ? Math.min(width, 440) : 600;
    for (let second = 0; second < 76; second += 0.25) {
      const l = solarLayout(width, height, second);
      for (const p of l.worlds) {
        assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
        assert.ok(p.x - p.size / 2 >= 0 && p.x + p.size / 2 <= width);
        assert.ok(p.y - p.size / 2 >= 0 && p.y + p.size / 2 <= height);
        assert.ok(p.x + p.labelOffset - p.labelWidth / 2 >= 4);
        assert.ok(p.x + p.labelOffset + p.labelWidth / 2 <= width - 4);
        assert.ok(p.y + p.size / 2 + p.labelGap + p.labelHeight < height);
      }
    }
  }
});
test("neighboring topic labels do not overlap as the orbit moves", () => {
  for (const width of [280, 296, 366, 688, 928, 1240])
    for (let second = 0; second < 76; second += 0.25) {
      const l = solarLayout(
        width,
        width < 700 ? Math.min(width, 440) : 600,
        second,
      );
      const labels = l.worlds.map((p) => ({
        left: p.x + p.labelOffset - p.labelWidth / 2,
        top: p.y + p.size / 2 + p.labelGap,
        width: p.labelWidth,
        height: p.labelHeight,
      }));
      for (let i = 0; i < labels.length; i++)
        for (let j = i + 1; j < labels.length; j++) {
          const a = labels[i],
            b = labels[j];
          const overlapX =
            Math.min(a.left + a.width, b.left + b.width) -
            Math.max(a.left, b.left);
          const overlapY =
            Math.min(a.top + a.height, b.top + b.height) -
            Math.max(a.top, b.top);
          assert.ok(
            overlapX <= 0 || overlapY <= 0,
            `overlap at ${width}px / ${second}s`,
          );
        }
    }
});

test("compact orbits remain circular and clear the profile sun", () => {
  for (const width of [280, 296, 320, 350, 390, 500, 688]) {
    const l = solarLayout(width, Math.min(width, 440));
    assert.equal(l.rx, l.ry);
    for (const p of l.worlds)
      assert.ok(Math.hypot(p.x - l.cx, p.y - l.cy) > 28 + p.size / 2 + 24);
  }
});
