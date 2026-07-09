/**
 * Unit tests for shipped resolveVariables() — drives real catalog + liveVariables.
 * Run: npx tsx scripts/variables-resolver.test.mjs
 */
import assert from "node:assert/strict";
import { datasets, getDatasetBySlug } from "../src/data/datasets.ts";
import { resolveVariables } from "../src/lib/variables.ts";
import { LIVE_VARIABLES } from "../src/data/liveVariables.ts";

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log("ok -", name);
  } catch (e) {
    console.error("FAIL -", name);
    console.error(e);
    process.exitCode = 1;
  }
}

test("catalog has datasets", () => {
  assert.ok(datasets.length >= 100);
});

test("every dataset resolves non-empty entries + source", () => {
  for (const d of datasets) {
    const v = resolveVariables(d);
    assert.ok(v.entries.length >= 1, `${d.slug} empty entries`);
    assert.ok(v.source && v.source.length > 5, `${d.slug} empty source`);
    for (const e of v.entries) {
      assert.ok(e.name, `${d.slug} missing name`);
      assert.ok(e.label, `${d.slug} missing label`);
    }
  }
});

test("every dataset has url from live pack or access/docs", () => {
  for (const d of datasets) {
    const v = resolveVariables(d);
    assert.ok(
      v.url || d.accessUrl || d.docsUrl,
      `${d.slug} missing url`,
    );
  }
});

test("LIVE_VARIABLES covers full catalog", () => {
  assert.equal(Object.keys(LIVE_VARIABLES).length, datasets.length);
});

test("flagship NADA codes present for PLFS", () => {
  const v = resolveVariables(getDatasetBySlug("plfs-annual-2023-24"));
  const blob = v.entries.map((e) => e.name + e.label).join(" ");
  assert.match(blob, /NIC|NCO|status|b5pt|multiplier|mult/i);
  assert.ok(v.url.includes("microdata.gov.in"));
});

test("ASUSE live pack has establishment fields", () => {
  const v = resolveVariables(getDatasetBySlug("asuse-2023-24"));
  const blob = v.entries.map((e) => e.name).join(" ");
  assert.match(blob, /nic|ownership|est_type|fsu|LEVEL/i);
});

test("resolveVariables prefers LIVE_VARIABLES over keyVariables-only", () => {
  const d = getDatasetBySlug("nfhs-5");
  const v = resolveVariables(d);
  assert.ok(LIVE_VARIABLES["nfhs-5"]);
  assert.equal(v.source, LIVE_VARIABLES["nfhs-5"].source);
});

console.log(`\n${passed} tests passed`);
