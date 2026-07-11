/**
 * Optional AI assist for bi-monthly catalog refresh.
 * OpenAI-compatible Chat Completions API.
 *
 * Env:
 *   AI_API_KEY   (required) — bearer token
 *   AI_BASE_URL  (optional) — default https://api.openai.com/v1
 *   AI_MODEL     (optional) — default gpt-4o-mini
 *   AI_MAX_ITEMS (optional) — max datasets to rewrite (default 12)
 *   AI_APPLY     (optional) — if "1"/"true", write summary proposals into datasetSummaries.ts
 *
 * Run: npx tsx scripts/ai-catalog-assist.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { datasets } from "../src/data/datasets.ts";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "content", "automation");
const KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
const BASE = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(
  /\/$/,
  "",
);
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const MAX = Math.max(1, Number(process.env.AI_MAX_ITEMS || 12));
const APPLY =
  process.env.AI_APPLY === "1" ||
  process.env.AI_APPLY === "true" ||
  process.env.AI_APPLY === "yes";

mkdirSync(OUT_DIR, { recursive: true });

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function needsSummaryHelp(d) {
  const s = (d.summary || "").trim();
  if (s.length < 60) return true;
  if (/is used for research and analysis on/i.test(s)) return true;
  if ((d.bestFor || "").trim().length < 24) return true;
  if ((d.limitations || "").trim().length < 24) return true;
  return false;
}

async function chat(messages) {
  const url = `${BASE}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages,
    }),
    signal: AbortSignal.timeout(120000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`AI API ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  return JSON.parse(content);
}

function pickCandidates() {
  return datasets
    .filter(needsSummaryHelp)
    .slice(0, MAX)
    .map((d) => ({
      slug: d.slug,
      title: d.title,
      shortTitle: d.shortTitle,
      host: d.host,
      institution: d.institution,
      categories: d.categories,
      geographyLevel: d.geographyLevel,
      timeCoverage: d.timeCoverage,
      accessType: d.accessType,
      bestFor: d.bestFor,
      limitations: d.limitations,
      exampleUses: d.exampleUses,
      summary: d.summary,
      accessUrl: d.accessUrl || null,
      docsUrl: d.docsUrl || null,
      dataDoi: d.dataDoi || null,
    }));
}

function applySummaries(proposals) {
  const path = join(ROOT, "src/data/datasetSummaries.ts");
  let src = readFileSync(path, "utf8");
  let applied = 0;
  for (const p of proposals) {
    if (!p?.slug || !p?.summary) continue;
    const summary = String(p.summary).trim().replace(/\s+/g, " ");
    if (summary.length < 40 || summary.length > 320) continue;
    const escaped = summary.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const key = `"${p.slug}"`;
    const re = new RegExp(`${key}:\\s*\\n?\\s*"[^"]*"`, "m");
    if (re.test(src)) {
      src = src.replace(re, `${key}:\n    "${escaped}"`);
      applied++;
    } else {
      // Insert before closing `};` of DATASET_SUMMARIES
      const marker = "\n};\n\nexport function getDatasetSummary";
      if (!src.includes(marker)) continue;
      src = src.replace(
        marker,
        `\n  ${key}:\n    "${escaped}",${marker}`,
      );
      applied++;
    }
  }
  writeFileSync(path, src);
  return applied;
}

async function main() {
  const report = {
    ranAt: new Date().toISOString(),
    model: MODEL,
    baseUrl: BASE,
    apply: APPLY,
    skipped: false,
    candidates: 0,
    proposals: [],
    applied: 0,
    error: null,
  };

  if (!KEY) {
    report.skipped = true;
    report.error =
      "AI_API_KEY (or OPENAI_API_KEY) not set — audit-only bi-monthly run.";
    writeFileSync(
      join(OUT_DIR, `ai-assist-${stamp()}.json`),
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify({ ok: true, skipped: true, reason: report.error }));
    process.exit(0);
  }

  const candidates = pickCandidates();
  report.candidates = candidates.length;

  if (!candidates.length) {
    writeFileSync(
      join(OUT_DIR, `ai-assist-${stamp()}.json`),
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify({ ok: true, candidates: 0 }));
    process.exit(0);
  }

  try {
    const result = await chat([
      {
        role: "system",
        content: `You maintain the Indian Data Guide catalog. For each dataset, write concise researcher-facing copy.
Return JSON only:
{
  "proposals": [
    {
      "slug": "...",
      "summary": "1-2 sentences: what researchers use this for (specific India context)",
      "bestFor": "one sentence (≥24 chars)",
      "limitations": "one honest sentence (≥24 chars)",
      "notes": "optional access/link refresh tip"
    }
  ]
}
Rules: no invented DOIs or URLs; do not claim open access if accessType is restricted; keep India-specific; plain language.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Improve thin or generic catalog copy",
          items: candidates,
        }),
      },
    ]);

    const proposals = Array.isArray(result.proposals) ? result.proposals : [];
    report.proposals = proposals;

    const md = [
      `# Bi-monthly AI catalog assist — ${stamp()}`,
      "",
      `- Model: \`${MODEL}\``,
      `- Candidates: ${candidates.length}`,
      `- Proposals: ${proposals.length}`,
      `- Apply mode: ${APPLY}`,
      "",
      "## Proposals",
      "",
    ];
    for (const p of proposals) {
      md.push(`### \`${p.slug}\``);
      if (p.summary) md.push(`- **summary:** ${p.summary}`);
      if (p.bestFor) md.push(`- **bestFor:** ${p.bestFor}`);
      if (p.limitations) md.push(`- **limitations:** ${p.limitations}`);
      if (p.notes) md.push(`- **notes:** ${p.notes}`);
      md.push("");
    }
    writeFileSync(join(OUT_DIR, `ai-assist-${stamp()}.md`), md.join("\n"));
    writeFileSync(
      join(OUT_DIR, `ai-assist-${stamp()}.json`),
      JSON.stringify(report, null, 2),
    );

    if (APPLY && proposals.length) {
      report.applied = applySummaries(proposals);
      writeFileSync(
        join(OUT_DIR, `ai-assist-${stamp()}.json`),
        JSON.stringify(report, null, 2),
      );
    }

    console.log(
      JSON.stringify({
        ok: true,
        candidates: candidates.length,
        proposals: proposals.length,
        applied: report.applied,
      }),
    );
  } catch (e) {
    report.error = String(e?.message || e);
    writeFileSync(
      join(OUT_DIR, `ai-assist-${stamp()}.json`),
      JSON.stringify(report, null, 2),
    );
    console.error(report.error);
    // Non-fatal for the overall workflow: exit 0 after writing error report
    // unless AI_STRICT=1
    if (process.env.AI_STRICT === "1") process.exit(1);
    process.exit(0);
  }
}

main();
