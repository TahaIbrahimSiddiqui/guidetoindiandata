/**
 * Agentic SEO assist for Indian Data Guide.
 *
 * Proposes seoTitle, seoDescription, and faq[] per dataset slug.
 * Writes reports under content/automation/. Optionally applies to
 * src/data/datasetSeo.ts when AI_APPLY=true.
 *
 * NEVER edits LandingExperience, MapExperience, or marketing layouts.
 *
 * Env (same as ai-catalog-assist):
 *   AI_API_KEY | DARTMOUTH_API_KEY
 *   AI_PROVIDER  dartmouth | google | openai  (default: dartmouth)
 *   AI_MODEL, AI_BASE_URL, AI_MAX_ITEMS, AI_BATCH_SIZE
 *   AI_APPLY     write into datasetSeo.ts
 *   SEO_PRIORITY thin | all  (default: thin — prioritize weak meta)
 *
 * Run: npx tsx scripts/ai-seo-assist.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { datasets } from "../src/data/datasets.ts";
import { DATASET_SEO } from "../src/data/datasetSeo.ts";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "content", "automation");

const KEY =
  process.env.AI_API_KEY ||
  process.env.DARTMOUTH_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.OPENAI_API_KEY ||
  "";

const PROVIDER = (process.env.AI_PROVIDER || "dartmouth").toLowerCase();
const MAX = Math.max(1, Number(process.env.AI_MAX_ITEMS || 16));
const BATCH = Math.max(1, Number(process.env.AI_BATCH_SIZE || 4));
const APPLY =
  process.env.AI_APPLY === "1" ||
  process.env.AI_APPLY === "true" ||
  process.env.AI_APPLY === "yes";
const PRIORITY = (process.env.SEO_PRIORITY || "thin").toLowerCase();

const DARTMOUTH_BASE = (
  process.env.AI_BASE_URL || "https://chat.dartmouth.edu/api"
).replace(/\/$/, "");

mkdirSync(OUT_DIR, { recursive: true });

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function needsSeoHelp(d) {
  const existing = DATASET_SEO[d.slug];
  if (existing?.seoDescription && existing?.seoTitle) return false;
  const s = (d.summary || "").trim();
  if (s.length < 80) return true;
  if (/is used for research and analysis on/i.test(s)) return true;
  if (!d.bestFor || d.bestFor.trim().length < 24) return true;
  if (!existing?.faq?.length) return true;
  return false;
}

function systemPrompt() {
  return `You write SEO metadata for the Indian Data Guide (public catalog of India statistical and research datasets).

Return JSON only:
{
  "proposals": [
    {
      "slug": "...",
      "seoTitle": "short SERP title (≤55 chars, no site name)",
      "seoDescription": "1–2 sentences ≤155 chars: what the data is, India context, access hint",
      "faq": [
        { "question": "...?", "answer": "honest 1–2 sentences from the record only" }
      ],
      "targetQueries": ["optional: 1–3 search intents this page can rank for"]
    }
  ]
}

Rules:
- Never invent open access when accessType is registration, data-use-agreement, request-only, or paid-subscription.
- Never invent DOIs or URLs not provided in the input.
- seoTitle: specific (e.g. "NFHS-5 microdata India") not keyword spam.
- faq: 2–4 items max; answers must follow accessType and geography/time from input.
- Include every input slug in proposals.
- Do not mention landing pages, solar maps, or site navigation.`;
}

function extractJson(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Empty model text");
  try {
    return JSON.parse(raw);
  } catch {
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) return JSON.parse(fence[1].trim());
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("Could not parse JSON from model response");
  }
}

function pickPreferredModel(ids) {
  const list = [...(ids || [])];
  const opus = list
    .filter((id) => /claude.*opus-4/i.test(id))
    .sort()
    .reverse();
  if (opus[0]) return opus[0];
  const sonnet = list
    .filter((id) => /claude.*sonnet-4/i.test(id))
    .sort()
    .reverse();
  if (sonnet[0]) return sonnet[0];
  const prefer = [
    /openai\.gpt-5(?!.*mini)/i,
    /vertex_ai\.gemini-3\.1-pro/i,
    /vertex_ai\.gemini-2\.5-pro/i,
    /gpt-4o(?!-mini)/i,
    /claude.*haiku/i,
  ];
  for (const re of prefer) {
    const hit = list.find((id) => re.test(id));
    if (hit) return hit;
  }
  return list[0] || null;
}

async function listDartmouthModels() {
  const res = await fetch(`${DARTMOUTH_BASE}/models`, {
    headers: {
      Authorization: `bearer ${KEY}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(60000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Dartmouth /models ${res.status}: ${text.slice(0, 400)}`);
  }
  const data = JSON.parse(text);
  return (data.data || []).map((m) => m.id).filter(Boolean);
}

async function resolveModel() {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  if (PROVIDER === "dartmouth") {
    const ids = await listDartmouthModels();
    const pick = pickPreferredModel(ids);
    if (!pick) throw new Error("No models returned from Dartmouth /models");
    return pick;
  }
  if (PROVIDER === "google") return "gemini-2.5-pro";
  return "gpt-4o-mini";
}

async function dartmouthChat(model, userText) {
  const body = {
    model,
    stream: false,
    messages: [
      { role: "system", content: systemPrompt() },
      {
        role: "user",
        content:
          userText +
          "\n\nRespond with a single JSON object only (no markdown fences).",
      },
    ],
  };
  if (!/claude.*opus-4/i.test(model)) {
    body.temperature = 0.25;
  }

  const res = await fetch(`${DARTMOUTH_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Dartmouth chat ${res.status}: ${text.slice(0, 600)}`);
  }
  const data = JSON.parse(text);
  return extractJson(data.choices?.[0]?.message?.content);
}

async function geminiGenerate(model, userText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(KEY)}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt() }] },
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig: {
      temperature: 0.25,
      responseMimeType: "application/json",
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${text.slice(0, 500)}`);
  const data = JSON.parse(text);
  const content = (data.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || "")
    .join("\n");
  return extractJson(content);
}

async function openaiChat(model, userText) {
  const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userText },
      ],
    }),
    signal: AbortSignal.timeout(180000),
  });
  const text = await res.text();
  if (!res.ok)
    throw new Error(`OpenAI-compat ${res.status}: ${text.slice(0, 500)}`);
  const data = JSON.parse(text);
  return extractJson(data.choices?.[0]?.message?.content);
}

async function generate(model, userText) {
  if (PROVIDER === "google" || PROVIDER === "gemini") {
    return geminiGenerate(model, userText);
  }
  if (PROVIDER === "openai") return openaiChat(model, userText);
  return dartmouthChat(model, userText);
}

function pickCandidates() {
  const pool =
    PRIORITY === "all"
      ? datasets
      : datasets.filter(needsSeoHelp);
  return pool.slice(0, MAX).map((d) => ({
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
    summary: d.summary,
    accessUrl: d.accessUrl || null,
    dataDoi: d.dataDoi || null,
    existingSeo: DATASET_SEO[d.slug] || null,
  }));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function escapeTsString(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, " ");
}

function formatFaq(faq) {
  if (!Array.isArray(faq) || !faq.length) return "[]";
  const items = faq
    .slice(0, 4)
    .filter((f) => f?.question && f?.answer)
    .map(
      (f) =>
        `      { question: "${escapeTsString(f.question)}", answer: "${escapeTsString(f.answer)}" }`,
    );
  return `[\n${items.join(",\n")},\n    ]`;
}

/**
 * Rewrite DATASET_SEO object entries for proposed slugs.
 * Preserves file header comments and export shape.
 */
function applySeo(proposals) {
  const path = join(ROOT, "src/data/datasetSeo.ts");
  let src = readFileSync(path, "utf8");
  let applied = 0;

  for (const p of proposals) {
    if (!p?.slug) continue;
    const slug = String(p.slug).trim();
    const title = p.seoTitle ? String(p.seoTitle).trim() : "";
    const desc = p.seoDescription ? String(p.seoDescription).trim() : "";
    if (!title && !desc && !p.faq?.length) continue;
    if (title.length > 70) continue;
    if (desc.length > 200) continue;

    const entry = `  "${slug}": {
    seoTitle: "${escapeTsString(title || slug)}",
    seoDescription: "${escapeTsString(desc || title)}",
    faq: ${formatFaq(p.faq)},
  }`;

    const keyRe = new RegExp(
      `  "${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}":\\s*\\{[\\s\\S]*?\\n  \\},?`,
      "m",
    );
    if (keyRe.test(src)) {
      src = src.replace(keyRe, `${entry},`);
      applied++;
    } else {
      const marker = "export const DATASET_SEO: Record<string, DatasetSeoEntry> = {";
      if (!src.includes(marker)) continue;
      // Insert after opening brace of the record
      src = src.replace(
        marker,
        `${marker}\n${entry},`,
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
    provider: PROVIDER,
    model: null,
    priority: PRIORITY,
    apply: APPLY,
    skipped: false,
    candidates: 0,
    proposals: [],
    applied: 0,
    opportunities: [],
    error: null,
    guardrails: {
      neverEdit: [
        "src/components/LandingExperience.tsx",
        "src/components/MapExperience.tsx",
        "src/components/ObsidianGraphFull.tsx",
      ],
      applyTarget: "src/data/datasetSeo.ts",
    },
  };

  if (!KEY) {
    report.skipped = true;
    report.error = "AI_API_KEY not set — SEO assist skipped.";
    writeFileSync(
      join(OUT_DIR, `seo-assist-${stamp()}.json`),
      JSON.stringify(report, null, 2),
    );
    writeFileSync(
      join(OUT_DIR, "seo-assist-latest.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify({ ok: true, skipped: true, reason: report.error }),
    );
    process.exit(0);
  }

  const candidates = pickCandidates();
  report.candidates = candidates.length;

  if (!candidates.length) {
    writeFileSync(
      join(OUT_DIR, `seo-assist-${stamp()}.json`),
      JSON.stringify(report, null, 2),
    );
    writeFileSync(
      join(OUT_DIR, "seo-assist-latest.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify({ ok: true, candidates: 0 }));
    process.exit(0);
  }

  try {
    const model = await resolveModel();
    report.model = model;

    const allProposals = [];
    for (const batch of chunk(candidates, BATCH)) {
      const userText = JSON.stringify({
        task: "Propose SEO metadata and FAQs for Indian dataset catalog pages",
        items: batch,
      });
      const parsed = await generate(model, userText);
      const proposals = Array.isArray(parsed.proposals) ? parsed.proposals : [];
      allProposals.push(...proposals);
    }

    report.proposals = allProposals;
    report.opportunities = allProposals.flatMap((p) =>
      (p.targetQueries || []).map((q) => ({ slug: p.slug, query: q })),
    );

    const md = [
      `# Agentic SEO assist — ${stamp()}`,
      "",
      `- Provider: \`${PROVIDER}\``,
      `- Model: \`${model}\``,
      `- Priority: \`${PRIORITY}\``,
      `- Candidates: ${candidates.length}`,
      `- Proposals: ${allProposals.length}`,
      `- Apply mode: ${APPLY}`,
      "",
      "> Does not edit landing or solar map components.",
      "",
      "## Proposals",
      "",
    ];
    for (const p of allProposals) {
      md.push(`### \`${p.slug}\``);
      if (p.seoTitle) md.push(`- **seoTitle:** ${p.seoTitle}`);
      if (p.seoDescription) md.push(`- **seoDescription:** ${p.seoDescription}`);
      if (p.targetQueries?.length) {
        md.push(`- **queries:** ${p.targetQueries.join("; ")}`);
      }
      if (p.faq?.length) {
        md.push("- **faq:**");
        for (const f of p.faq) {
          md.push(`  - Q: ${f.question}`);
          md.push(`    A: ${f.answer}`);
        }
      }
      md.push("");
    }

    if (report.opportunities.length) {
      md.push("## Target queries", "");
      for (const o of report.opportunities) {
        md.push(`- \`${o.slug}\` ← ${o.query}`);
      }
      md.push("");
    }

    writeFileSync(join(OUT_DIR, `seo-assist-${stamp()}.md`), md.join("\n"));
    writeFileSync(join(OUT_DIR, "seo-assist-latest.md"), md.join("\n"));
    writeFileSync(
      join(OUT_DIR, `seo-assist-${stamp()}.json`),
      JSON.stringify(report, null, 2),
    );
    writeFileSync(
      join(OUT_DIR, "seo-assist-latest.json"),
      JSON.stringify(report, null, 2),
    );

    if (APPLY && allProposals.length) {
      report.applied = applySeo(allProposals);
      writeFileSync(
        join(OUT_DIR, `seo-assist-${stamp()}.json`),
        JSON.stringify(report, null, 2),
      );
      writeFileSync(
        join(OUT_DIR, "seo-assist-latest.json"),
        JSON.stringify(report, null, 2),
      );
    }

    console.log(
      JSON.stringify({
        ok: true,
        candidates: candidates.length,
        proposals: allProposals.length,
        applied: report.applied,
        provider: PROVIDER,
        model,
      }),
    );
  } catch (err) {
    report.error = String(err?.message || err);
    writeFileSync(
      join(OUT_DIR, `seo-assist-${stamp()}.json`),
      JSON.stringify(report, null, 2),
    );
    writeFileSync(
      join(OUT_DIR, "seo-assist-latest.json"),
      JSON.stringify(report, null, 2),
    );
    console.error(report.error);
    process.exit(1);
  }
}

main();
