/**
 * List Gemini models available to the configured API key.
 *
 * Env (any one):
 *   AI_API_KEY | GEMINI_API_KEY | GOOGLE_API_KEY
 *
 * Run: npx tsx scripts/list-gemini-models.mjs
 */
const KEY =
  process.env.AI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  "";

if (!KEY) {
  console.error(
    JSON.stringify({
      ok: false,
      error:
        "No API key in AI_API_KEY / GEMINI_API_KEY / GOOGLE_API_KEY",
    }),
  );
  process.exit(1);
}

const base = "https://generativelanguage.googleapis.com/v1beta/models";
const url = `${base}?key=${encodeURIComponent(KEY)}&pageSize=100`;

const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
const text = await res.text();
if (!res.ok) {
  console.error(
    JSON.stringify({
      ok: false,
      status: res.status,
      body: text.slice(0, 800),
    }),
  );
  process.exit(1);
}

const data = JSON.parse(text);
const models = (data.models || []).map((m) => ({
  name: (m.name || "").replace(/^models\//, ""),
  displayName: m.displayName || null,
  description: (m.description || "").slice(0, 160),
  inputTokenLimit: m.inputTokenLimit ?? null,
  outputTokenLimit: m.outputTokenLimit ?? null,
  supportedGenerationMethods: m.supportedGenerationMethods || [],
  canGenerateContent: (m.supportedGenerationMethods || []).includes(
    "generateContent",
  ),
}));

const generate = models
  .filter((m) => m.canGenerateContent)
  .map((m) => m.name)
  .sort();

const pro = generate.filter((n) => /pro/i.test(n));
const flash = generate.filter((n) => /flash/i.test(n));
const preferred =
  pro.find((n) => n === "gemini-2.5-pro") ||
  pro.find((n) => /gemini-2\.5-pro/i.test(n)) ||
  pro.find((n) => /gemini-3.*pro/i.test(n)) ||
  pro[pro.length - 1] ||
  generate.find((n) => /gemini-2\.5/i.test(n)) ||
  generate[0] ||
  null;

const out = {
  ok: true,
  totalModels: models.length,
  generateContentCount: generate.length,
  preferredProModel: preferred,
  proModels: pro,
  flashModels: flash,
  allGenerateContentModels: generate,
};

console.log(JSON.stringify(out, null, 2));

// Also write for CI artifacts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const dir = join(process.cwd(), "content", "automation");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "gemini-models-available.json"), JSON.stringify(out, null, 2));
