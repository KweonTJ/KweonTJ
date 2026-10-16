import test from "node:test";
import assert from "node:assert/strict";
import { repositories, topics, inventory } from "../assets/knowledge/data.mjs";
import { filterRepositories, makeGraph } from "../assets/knowledge/model.mjs";

test("public inventory has one entry per repository, with explicit exclusions", () => {
  const entries = [...repositories, ...inventory.excluded];
  assert.equal(entries.length, inventory.publicCount);
  assert.equal(new Set(entries.map((r) => r.repo)).size, inventory.publicCount);
  assert.equal(
    new Set(repositories.map((r) => r.id)).size,
    repositories.length,
  );
  const ids = new Set(topics.map((t) => t.id));
  for (const r of repositories) {
    assert.ok(r.topics.length > 0);
    assert.ok(r.topics.every((t) => ids.has(t)));
    assert.match(r.repo, /^[a-zA-Z0-9_.-]+$/);
    assert.ok(r.description && r.kind && r.stack.length);
  }
  assert.ok(repositories.some((r) => r.repo === "Artifical_Intelligence"));
  assert.ok(
    !repositories.some((r) =>
      inventory.excluded.some((e) => e.repo === r.repo),
    ),
  );
});
test("filters support shared subjects, scoped search, and highlighted work", () => {
  assert.ok(
    filterRepositories({ scope: "all", topic: "learning" }).some(
      (r) => r.id === "go2",
    ),
  );
  assert.ok(
    filterRepositories({ scope: "all", topic: "simulation" }).some(
      (r) => r.id === "go2",
    ),
  );
  assert.deepEqual(
    filterRepositories({ scope: "all", topic: "learning", query: "  ARUCO  " }),
    [],
  );
  assert.deepEqual(
    filterRepositories({ scope: "all", query: "  OMx_TuRTle_Bot  " }).map(
      (r) => r.id,
    ),
    ["omx-runtime"],
  );
  assert.ok(filterRepositories({ scope: "featured" }).every((r) => r.featured));
  assert.deepEqual(
    filterRepositories({ scope: "all", query: "no-such-repository-2379" }),
    [],
  );
});
test("every topic unfolds only its repositories, with valid finite node positions", () => {
  for (const compact of [false, true])
    for (const scope of ["all", "featured"])
      for (const topic of topics.map((t) => t.id)) {
        const g = makeGraph({ scope, topic, compact });
        const ids = new Set(g.nodes.map((n) => n.id));
        assert.equal(ids.size, g.nodes.length);
        assert.equal(
          g.nodes.filter((n) => n.kind === "project").length,
          g.repositories.length,
        );
        for (const n of g.nodes) {
          assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y));
          if (n.kind === "project") assert.ok(n.topics.includes(topic));
        }
        for (const e of g.edges) {
          assert.ok(ids.has(e.source) && ids.has(e.target));
          assert.equal(e.source, topic);
          assert.ok(
            repositories.find((r) => r.id === e.target).topics.includes(topic),
          );
        }
        assert.equal(g.edges.length, g.repositories.length);
      }
});
test("overview and empty search never create orphan edges or hidden project mismatches", () => {
  for (const compact of [false, true])
    for (const scope of ["all", "featured"])
      for (const query of ["", "zz-no-match-zz"]) {
        const g = makeGraph({ compact, scope, query });
        const ids = new Set(g.nodes.map((n) => n.id));
        assert.ok(g.edges.every((e) => ids.has(e.source) && ids.has(e.target)));
        if (compact && !query)
          assert.ok(!g.nodes.some((n) => n.kind === "project"));
        else
          assert.equal(
            g.nodes.filter((n) => n.kind === "project").length,
            g.repositories.length,
          );
      }
});
