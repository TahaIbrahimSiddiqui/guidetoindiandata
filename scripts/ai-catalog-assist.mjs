/**
 * Optional AI assist for bi-monthly catalog refresh.
 *
 * Default provider: Dartmouth Chat API (OpenAI Chat Completions compatible)
 *   Base: https://chat.dartmouth.edu/api
 *   POST /chat/completions
 *   Auth: Authorization: bearer <key>
 *   Docs: https://rc.dartmouth.edu/ai/online-resources/using-the-api/
 *   Models: GET /models  (or hover model names in chat.dartmouth.edu)
 *
 * Env:
 *   AI_API_KEY | DARTMOUTH_API_KEY  (required)
 *   AI_PROVIDER  dartmouth | google | openai  (default: dartmouth)
 *   AI_MODEL     optional; auto-picks latest pro-class model from /models if unset
 *   AI_BASE_URL  default https://chat.dartmouth.edu/api for dartmouth
 *   AI_MAX_ITEMS default 12
 *   AI_BATCH_SIZE default 4
 *   AI_APPLY     write summaries into datasetSummaries.ts
 *
 * Run: npx tsx scripts/ai-catalog-assist.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { datasets } from "../src/data/datasets.ts";

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

const MAX = Math.max(1, Number(process.env.AI_MAX_ITEMS || 12));
const BATCH = Math.max(1, Number(process.env.AI_BATCH_SIZE || 4));
const APPLY =
  process.env.AI_APPLY === "1" ||
  process.env.AI_APPLY === "true" ||
  process.env.AI_APPLY === "yes";

const DARTMOUTH_BASE = (
  process.env.AI_BASE_URL || "https://chat.dartmouth.edu/api"
).replace(/\/$/, "");

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

function systemPrompt() {
  return `You maintain the Indian Data Guide catalog (public research catalog of India statistical and administrative datasets).

Return JSON only with this shape:
{
  "proposals": [
    {
      "slug": "...",
      "summary": "1-2 sentences: what researchers use this for (specific India context)",
      "bestFor": "one sentence (≥24 chars)",
      "limitations": "one honest sentence (≥24 chars)",
      "notes": "optional: access tip"
    }
  ]
}

Rules:
- Never invent DOIs or claim open access when accessType is registration/DUA/paid/request-only.
- Keep India-specific, plain language.
- Include every input slug in proposals.`;
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
  // Prefer highest Claude Opus 4.x (latest pro via Dartmouth Chat)
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
  return (data.data || [])
    .map((m) => m.id)
    .filter(Boolean);
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

/** Dartmouth Chat Completions (OpenAI-compatible path) */
async function dartmouthChat(model, userText) {
  const res = await fetch(`${DARTMOUTH_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userText },
      ],
    }),
    signal: AbortSignal.timeout(180000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Dartmouth chat ${res.status}: ${text.slice(0, 600)}`);
  }
  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content;
  return extractJson(content);
}

async function geminiGenerate(model, userText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(KEY)}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt() }] },
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
    tools: [{ google_search: {} }],
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
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userText },
      ],
    }),
    signal: AbortSignal.timeout(180000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OpenAI-compat ${res.status}: ${text.slice(0, 500)}`);
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

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
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
      const marker = "\n};\n\nexport function getDatasetSummary";
      if (!src.includes(marker)) continue;
      src = src.replace(marker, `\n  ${key}:\n    "${escaped}",${marker}`);
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
    baseUrl: PROVIDER === "dartmouth" ? DARTMOUTH_BASE : process.env.AI_BASE_URL || null,
    apply: APPLY,
    skipped: false,
    candidates: 0,
    proposals: [],
    applied: 0,
    error: null,
  };

  if (!KEY) {
    report.skipped = true;
    report.error = "AI_API_KEY not set — audit-only bi-monthly run.";
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
    console.log(JSON.stringify({ ok: true, candidates: 0, provider: PROVIDER }));
    process.exit(0);
  }

  try {
    const model = await resolveModel();
    report.model = model;

    const allProposals = [];
    for (const batch of chunk(candidates, BATCH)) {
      const userText = JSON.stringify({
        task: "Improve thin or generic catalog copy for Indian datasets",
        items: batch,
      });
      const parsed = await generate(model, userText);
      const proposals = Array.isArray(parsed.proposals) ? parsed.proposals : [];
      allProposals.push(...proposals);
    }

    report.proposals = allProposals;

    const md = [
      `# Bi-monthly AI catalog assist — ${stamp()}`,
      "",
      `- Provider: \`${PROVIDER}\``,
      `- Model: \`${model}\``,
      `- Base: \`${report.baseUrl || "n/a"}\``,
      `- Candidates: ${candidates.length}`,
      `- Proposals: ${allProposals.length}`,
      `- Apply mode: ${APPLY}`,
      "",
      "## Proposals",
      "",
    ];
    for (const p of allProposals) {
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

    if (APPLY && allProposals.length) {
      report.applied = applySummaries(allProposals);
      writeFileSync(
        join(OUT_DIR, `ai-assist-${stamp()}.json`),
        JSON.stringify(report, null, 2),
      );
    }

    console.log(
      JSON.stringify({
        ok: true,
        provider: PROVIDER,
        model,
        candidates: candidates.length,
        proposals: allProposals.length,
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
    if (process.env.AI_STRICT === "1") process.exit(1);
    process.exit(0);
  }
}

main();
