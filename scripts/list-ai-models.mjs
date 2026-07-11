/**
 * List models available to the configured API key.
 *
 * Default: Dartmouth Chat API
 *   GET https://chat.dartmouth.edu/api/models
 *   Auth: Authorization: bearer <key>
 *   Docs: https://rc.dartmouth.edu/ai/online-resources/using-the-api/
 *
 * Env:
 *   AI_API_KEY (required)
 *   AI_PROVIDER  dartmouth | google | openai  (default: dartmouth)
 *   AI_BASE_URL  optional override
 *
 * Run: npx tsx scripts/list-ai-models.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KEY =
  process.env.AI_API_KEY ||
  process.env.DARTMOUTH_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  "";

const PROVIDER = (process.env.AI_PROVIDER || "dartmouth").toLowerCase();

if (!KEY) {
  console.error(
    JSON.stringify({
      ok: false,
      error: "No API key in AI_API_KEY / DARTMOUTH_API_KEY",
    }),
  );
  process.exit(1);
}

function pickPreferred(ids) {
  const list = [...(ids || [])];
  // Prefer highest Claude Opus 4.x, then Sonnet 4.x, then GPT-5 / Gemini Pro
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

async function listDartmouth() {
  const base = (
    process.env.AI_BASE_URL || "https://chat.dartmouth.edu/api"
  ).replace(/\/$/, "");
  // Docs use lowercase "bearer"
  const res = await fetch(`${base}/models`, {
    headers: {
      Authorization: `bearer ${KEY}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(60000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Dartmouth models ${res.status}: ${text.slice(0, 600)}`);
  }
  const data = JSON.parse(text);
  const models = data.data || data.models || [];
  const ids = models
    .map((m) => m.id || m.name)
    .filter(Boolean)
    .sort();
  const pro = ids.filter((id) => /pro|sonnet|opus|gpt-4|gpt-5|claude-4/i.test(id));
  return {
    provider: "dartmouth",
    baseUrl: base,
    totalModels: ids.length,
    preferredProModel: pickPreferred(ids),
    proModels: pro,
    allModels: ids,
    sample: models.slice(0, 5),
  };
}

async function listGoogle() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(KEY)}&pageSize=100`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Gemini models ${res.status}: ${text.slice(0, 600)}`);
  const data = JSON.parse(text);
  const generate = (data.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => (m.name || "").replace(/^models\//, ""))
    .sort();
  return {
    provider: "google",
    totalModels: generate.length,
    preferredProModel: pickPreferred(generate),
    proModels: generate.filter((n) => /pro/i.test(n)),
    allModels: generate,
  };
}

async function listOpenAICompat() {
  const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const res = await fetch(`${base}/models`, {
    headers: { Authorization: `Bearer ${KEY}` },
    signal: AbortSignal.timeout(60000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OpenAI-compat models ${res.status}: ${text.slice(0, 600)}`);
  const data = JSON.parse(text);
  const ids = (data.data || []).map((m) => m.id).filter(Boolean).sort();
  return {
    provider: "openai",
    baseUrl: base,
    totalModels: ids.length,
    preferredProModel: pickPreferred(ids),
    proModels: ids.filter((id) => /pro|gpt-4|gpt-5|o3|o1/i.test(id)),
    allModels: ids,
  };
}

try {
  let out;
  if (PROVIDER === "google" || PROVIDER === "gemini") out = await listGoogle();
  else if (PROVIDER === "openai") out = await listOpenAICompat();
  else out = await listDartmouth();

  out.ok = true;
  out.listedAt = new Date().toISOString();
  console.log(JSON.stringify(out, null, 2));

  const dir = join(process.cwd(), "content", "automation");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "ai-models-available.json"), JSON.stringify(out, null, 2));
} catch (e) {
  const err = { ok: false, provider: PROVIDER, error: String(e?.message || e) };
  console.error(JSON.stringify(err, null, 2));
  process.exit(1);
}
