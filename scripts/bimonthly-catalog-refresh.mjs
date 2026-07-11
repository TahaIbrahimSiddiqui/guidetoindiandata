/**
 * Catalog maintenance entrypoint (CI + local).
 *
 * Steps:
 *  1) Optional AI discovery of new datasets
 *  2) Optional AI assist for thin existing copy
 *  3) Full content/link audit (real resolvers)
 *  4) Write stamp + human report under content/automation/
 *
 * Run: npx tsx scripts/bimonthly-catalog-refresh.mjs
 * Env: SCRATCH, AI_*, AI_APPLY, DISCOVERY_*
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { datasets } from "../src/data/datasets.ts";

const ROOT = process.cwd();
const OUT = join(ROOT, "content", "automation");
const SCRATCH =
  process.env.SCRATCH || join(ROOT, "content", "automation", ".scratch");
mkdirSync(OUT, { recursive: true });
mkdirSync(SCRATCH, { recursive: true });

const stamp = new Date().toISOString().slice(0, 10);

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
    env: { ...process.env, SCRATCH, ...env },
  });
  return {
    status: r.status ?? 1,
    stdout: r.stdout || "",
    stderr: r.stderr || "",
  };
}

// 1) Optional discovery, then copy assist.
const discovery = run("npx", ["tsx", "scripts/ai-dataset-discovery.mjs"]);
const ai = run("npx", ["tsx", "scripts/ai-catalog-assist.mjs"]);

// 2) Audit after any automated edits so invalid additions cannot open a PR.
const audit = run("npx", ["tsx", "scripts/page-content-audit.mjs"]);
const test = run("npx", ["tsx", "scripts/page-content-audit.test.mjs"]);

const auditJsonPath = join(SCRATCH, "page-content-audit.json");
let auditSummary = { total: datasets.length };
if (existsSync(auditJsonPath)) {
  try {
    const a = JSON.parse(readFileSync(auditJsonPath, "utf8"));
    auditSummary = {
      total: a.total,
      hardFailCount: a.hardFailCount,
      withoutAccessLink: a.withoutAccessLink,
      thinCount: a.thinCount,
      routesFail: a.routesFail,
    };
  } catch {
    /* ignore */
  }
}

const report = {
  stamp,
  ranAt: new Date().toISOString(),
  catalogSize: auditSummary.total ?? datasets.length,
  auditSummary,
  steps: {
    discovery: {
      status: discovery.status,
      tail: (discovery.stdout + discovery.stderr).slice(-800),
    },
    audit: {
      status: audit.status,
      tail: (audit.stdout + audit.stderr).slice(-800),
    },
    test: {
      status: test.status,
      tail: (test.stdout + test.stderr).slice(-800),
    },
    ai: { status: ai.status, tail: (ai.stdout + ai.stderr).slice(-800) },
  },
  aiKeyPresent: Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY),
};

writeFileSync(
  join(OUT, `bimonthly-${stamp}.json`),
  JSON.stringify(report, null, 2),
);
writeFileSync(
  join(OUT, "refresh-latest.json"),
  JSON.stringify(report, null, 2),
);

const md = `# Catalog discovery refresh — ${stamp}

Automated maintenance for the Indian Data Guide.

## Snapshot

| Metric | Value |
|--------|------:|
| Catalog size | ${report.catalogSize} |
| Hard fails | ${auditSummary.hardFailCount ?? "n/a"} |
| Missing access links | ${auditSummary.withoutAccessLink ?? "n/a"} |
| Thin editorial fields | ${auditSummary.thinCount ?? "n/a"} |
| Routes fails | ${auditSummary.routesFail ?? "n/a"} |
| AI key present | ${report.aiKeyPresent ? "yes" : "no"} |
| Discovery exit | ${discovery.status} |
| Audit exit | ${audit.status} |
| Audit test exit | ${test.status} |
| AI assist exit | ${ai.status} |

## What this job does

1. Looks for genuinely new India datasets from configured source pages.
2. Rejects duplicates and incomplete candidates before touching the catalog.
3. Adds only validated records to \`src/data/discoveredDatasets.ts\`.
4. Re-audits every dataset record before the workflow can open a PR.

## Next human steps

- Review the PR diff for any added records in \`src/data/discoveredDatasets.ts\`.
- Check \`content/automation/discovery-latest.md\` for accepted/rejected candidates.
- Merge the automation PR to redeploy GitHub Pages when the additions look right.

## Logs (truncated)

### Discovery
\`\`\`
${(discovery.stdout || discovery.stderr || "").slice(0, 1200)}
\`\`\`

### Audit
\`\`\`
${(audit.stdout || audit.stderr || "").slice(0, 1200)}
\`\`\`

### Test
\`\`\`
${(test.stdout || test.stderr || "").slice(0, 800)}
\`\`\`

### AI
\`\`\`
${(ai.stdout || ai.stderr || "").slice(0, 800)}
\`\`\`
`;

writeFileSync(join(OUT, `bimonthly-${stamp}.md`), md);
// Latest pointer for the PR body
writeFileSync(join(OUT, "LATEST.md"), md);

console.log(
  JSON.stringify(
    {
      ok: audit.status === 0 && test.status === 0,
      stamp,
      catalogSize: report.catalogSize,
      discoveryStatus: discovery.status,
      auditStatus: audit.status,
      testStatus: test.status,
      aiStatus: ai.status,
    },
    null,
    2,
  ),
);

// Fail the job only if audit/test hard-fail (AI optional)
if (audit.status !== 0 || test.status !== 0) process.exit(1);
process.exit(0);
