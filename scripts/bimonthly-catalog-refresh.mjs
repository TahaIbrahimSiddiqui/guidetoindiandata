/**
 * Bi-monthly catalog maintenance entrypoint (CI + local).
 *
 * Steps:
 *  1) Full content/link audit (real resolvers)
 *  2) Optional AI assist (if AI_API_KEY set)
 *  3) Write stamp + human report under content/automation/
 *
 * Run: npx tsx scripts/bimonthly-catalog-refresh.mjs
 * Env: SCRATCH, AI_*, AI_APPLY
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

// 1) Audit
const audit = run("npx", ["tsx", "scripts/page-content-audit.mjs"]);
const test = run("npx", ["tsx", "scripts/page-content-audit.test.mjs"]);

// 2) Optional AI
const ai = run("npx", ["tsx", "scripts/ai-catalog-assist.mjs"]);

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
  catalogSize: datasets.length,
  auditSummary,
  steps: {
    audit: { status: audit.status, tail: (audit.stdout + audit.stderr).slice(-800) },
    test: { status: test.status, tail: (test.stdout + test.stderr).slice(-800) },
    ai: { status: ai.status, tail: (ai.stdout + ai.stderr).slice(-800) },
  },
  aiKeyPresent: Boolean(
    process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
  ),
};

writeFileSync(join(OUT, `bimonthly-${stamp}.json`), JSON.stringify(report, null, 2));

const md = `# Bi-monthly catalog refresh — ${stamp}

Automated maintenance for the Indian Data Guide.

## Snapshot

| Metric | Value |
|--------|------:|
| Catalog size | ${datasets.length} |
| Hard fails | ${auditSummary.hardFailCount ?? "n/a"} |
| Missing access links | ${auditSummary.withoutAccessLink ?? "n/a"} |
| Thin editorial fields | ${auditSummary.thinCount ?? "n/a"} |
| Routes fails | ${auditSummary.routesFail ?? "n/a"} |
| AI key present | ${report.aiKeyPresent ? "yes" : "no"} |
| Audit exit | ${audit.status} |
| Audit test exit | ${test.status} |
| AI assist exit | ${ai.status} |

## What this job does

1. Re-audits every dataset record (required fields, guides, variables, access links).
2. Optionally calls your AI API to draft better summaries for thin/generic rows.
3. Opens a PR (via workflow) so you can review before the site rebuilds.

## Next human steps

- Review \`content/automation/ai-assist-${stamp}.md\` if present.
- Merge the automation PR to redeploy GitHub Pages.
- Add/update repo secrets: \`AI_API_KEY\`, optional \`AI_BASE_URL\`, \`AI_MODEL\`.

## Logs (truncated)

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
      catalogSize: datasets.length,
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
