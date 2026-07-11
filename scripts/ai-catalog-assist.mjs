/**
 * Optional AI assist for bi-monthly catalog refresh.
 *
 * Default: Google Gemini Pro + Google Search grounding
 * (generativelanguage.googleapis.com).
 *
 * Env:
 *   AI_API_KEY | GEMINI_API_KEY | GOOGLE_API_KEY  (required for AI)
 *   AI_PROVIDER   google | openai   (default: google)
 *   AI_MODEL      default gemini-2.5-pro (latest stable pro with Search)
 *   AI_BASE_URL   optional override (OpenAI-compatible path if provider=openai)
 *   AI_GOOGLE_SEARCH  "true" (default) | "false" — enable Search grounding
 *   AI_MAX_ITEMS  default 12
 *   AI_BATCH_SIZE default 4 (datasets per Gemini call)
 *   AI_APPLY      write summaries into datasetSummaries.ts
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
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.OPENAI_API_KEY ||
  "";

const PROVIDER = (
  process.env.AI_PROVIDER ||
  (process.env.AI_BASE_URL ? "openai" : "google")
).toLowerCase();

const MODEL =
  process.env.AI_MODEL ||
  (PROVIDER === "google" ? "gemini-2.5-pro" : "gpt-4o-mini");

const GOOGLE_SEARCH =
  process.env.AI_GOOGLE_SEARCH !== "0" &&
  process.env.AI_GOOGLE_SEARCH !== "false" &&
  process.env.AI_GOOGLE_SEARCH !== "no";

const MAX = Math.max(1, Number(process.env.AI_MAX_ITEMS || 12));
const BATCH = Math.max(1, Number(process.env.AI_BATCH_SIZE || 4));
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

function systemPrompt() {
  return `You maintain the Indian Data Guide catalog (public research catalog of India statistical and administrative datasets).

Use Google Search (when available) to verify current official access pages, host institutions, and access friction for each dataset. Prefer .gov.in, Dataverse DOIs, and well-known academic hosts.

Return JSON only with this shape:
{
  "proposals": [
    {
      "slug": "...",
      "summary": "1-2 sentences: what researchers use this for (specific India context)",
      "bestFor": "one sentence (≥24 chars)",
      "limitations": "one honest sentence (≥24 chars)",
      "notes": "optional: verified access tip or URL status",
      "suggestedAccessUrl": "optional https URL only if search confirms a better official portal"
    }
  ]
}

Rules:
- Never invent DOIs or claim open access when accessType is registration/DUA/paid/request-only.
- Keep India-specific, plain language, no marketing fluff.
- Only include suggestedAccessUrl when you are confident from search results.
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

/** Google Gemini generateContent + optional Google Search grounding */
async function geminiGenerate(userText) {
  const model = MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(KEY)}`;

  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt() }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      // JSON mode; if the API rejects with tools, we retry without mime type.
      responseMimeType: "application/json",
    },
  };

  if (GOOGLE_SEARCH) {
    body.tools = [{ google_search: {} }];
  }

  async function post(payload) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(180000),
    });
    const text = await res.text();
    return { res, text };
  }

  let { res, text } = await post(body);

  // Some model/tool combos reject responseMimeType with google_search — retry.
  if (!res.ok && GOOGLE_SEARCH && /responseMimeType|mime|tool/i.test(text)) {
    const retry = structuredClone(body);
    delete retry.generationConfig.responseMimeType;
    retry.contents[0].parts[0].text +=
      "\n\nRespond with a single JSON object only, no markdown.";
    ({ res, text } = await post(retry));
  }

  if (!res.ok) {
    throw new Error(`Gemini API ${res.status}: ${text.slice(0, 600)}`);
  }

  const data = JSON.parse(text);
  const parts = data.candidates?.[0]?.content?.parts || [];
  const content = parts.map((p) => p.text || "").join("\n");
  const grounding =
    data.candidates?.[0]?.groundingMetadata ||
    data.candidates?.[0]?.grounding_metadata ||
    null;

  return { parsed: extractJson(content), grounding, raw: data };
}

/** OpenAI-compatible fallback (no Google Search) */
async function openaiChat(userText) {
  const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
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
  if (!res.ok) throw new Error(`OpenAI-compatible API ${res.status}: ${text.slice(0, 500)}`);
  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content;
  return { parsed: extractJson(content), grounding: null, raw: data };
}

async function generate(userText) {
  if (PROVIDER === "openai") return openaiChat(userText);
  return geminiGenerate(userText);
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
    provider: PROVIDER,
    model: MODEL,
    googleSearch: PROVIDER === "google" && GOOGLE_SEARCH,
    apply: APPLY,
    skipped: false,
    candidates: 0,
    proposals: [],
    groundingNotes: [],
    applied: 0,
    error: null,
  };

  if (!KEY) {
    report.skipped = true;
    report.error =
      "AI_API_KEY / GEMINI_API_KEY / GOOGLE_API_KEY not set — audit-only bi-monthly run.";
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
    console.log(JSON.stringify({ ok: true, candidates: 0, provider: PROVIDER, model: MODEL }));
    process.exit(0);
  }

  try {
    const allProposals = [];
    for (const batch of chunk(candidates, BATCH)) {
      const userText = JSON.stringify({
        task: "Improve thin or generic catalog copy; use Google Search to verify access hosts when possible",
        items: batch,
      });
      const { parsed, grounding } = await generate(userText);
      const proposals = Array.isArray(parsed.proposals) ? parsed.proposals : [];
      allProposals.push(...proposals);
      if (grounding) {
        report.groundingNotes.push({
          batchSlugs: batch.map((b) => b.slug),
          webSearchQueries: grounding.webSearchQueries || grounding.web_search_queries || null,
          groundingChunks: (grounding.groundingChunks || grounding.grounding_chunks || [])
            .slice(0, 8)
            .map((c) => c.web?.uri || c.web?.title || c),
        });
      }
    }

    report.proposals = allProposals;

    const md = [
      `# Bi-monthly AI catalog assist — ${stamp()}`,
      "",
      `- Provider: \`${PROVIDER}\``,
      `- Model: \`${MODEL}\``,
      `- Google Search grounding: ${report.googleSearch ? "on" : "off"}`,
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
      if (p.suggestedAccessUrl) md.push(`- **suggestedAccessUrl:** ${p.suggestedAccessUrl}`);
      md.push("");
    }
    if (report.groundingNotes.length) {
      md.push("## Search grounding (sample)", "");
      for (const g of report.groundingNotes) {
        md.push(`- Batch \`${(g.batchSlugs || []).join(", ")}\``);
        if (g.webSearchQueries) md.push(`  - Queries: ${JSON.stringify(g.webSearchQueries)}`);
      }
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
        model: MODEL,
        googleSearch: report.googleSearch,
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
