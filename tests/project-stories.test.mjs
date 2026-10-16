import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { repositories } from "../assets/knowledge/data.mjs";
import { projectStories } from "../assets/knowledge/project-stories.mjs";

test("every mapped project has its own complete case introduction", () => {
  assert.deepEqual(
    Object.keys(projectStories).sort(),
    repositories.map((r) => r.id).sort(),
  );
  const headlines = new Set();
  for (const r of repositories) {
    const story = projectStories[r.id];
    assert.ok(
      story.headline && !headlines.has(story.headline),
      r.id + " needs a distinct introduction",
    );
    headlines.add(story.headline);
    assert.ok(
      story.status && story.work.length >= 2,
      r.id + " needs scope and engineering context",
    );
    for (const pair of [...story.work, ...(story.facts || [])])
      assert.ok(
        pair.length === 2 &&
          pair.every((t) => typeof t === "string" && t.trim()),
      );
  }
});

test("project previews use existing local assets with captions", () => {
  for (const r of repositories) {
    const story = projectStories[r.id],
      image = story.image || r.image;
    if (!image) continue;
    assert.ok(image.startsWith("./"));
    assert.ok(
      existsSync(new URL("../" + image, import.meta.url)),
      r.id + " has a missing preview",
    );
    assert.ok(story.caption, r.id + " needs a preview caption");
  }
});
