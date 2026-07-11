# Bi-monthly catalog refresh — 2026-07-11

Automated maintenance for the Indian Data Guide.

## Snapshot

| Metric | Value |
|--------|------:|
| Catalog size | 165 |
| Hard fails | 0 |
| Missing access links | n/a |
| Thin editorial fields | n/a |
| Routes fails | n/a |
| AI key present | yes |
| Audit exit | 0 |
| Audit test exit | 0 |
| AI assist exit | 0 |

## What this job does

1. Re-audits every dataset record (required fields, guides, variables, access links).
2. Optionally calls your AI API to draft better summaries for thin/generic rows.
3. Opens a PR (via workflow) so you can review before the site rebuilds.

## Next human steps

- Review `content/automation/ai-assist-2026-07-11.md` if present.
- Merge the automation PR to redeploy GitHub Pages.
- Add/update repo secrets: `AI_API_KEY`, optional `AI_BASE_URL`, `AI_MODEL`.

## Logs (truncated)

### Audit
```
{
  "total": 165,
  "hardFailCount": 0,
  "withoutAccessLink": 0,
  "residualSkipCount": 0,
  "thinCount": 0,
  "routesFail": 0,
  "hardFailSlugs": [],
  "noAccessSlugs": [],
  "thinSlugs": []
}

```

### Test
```
PASS page-content-audit.test.mjs — 165 datasets, 13 series, 20 clusters, 5 access spot-checks

```

### AI
```
Dartmouth chat 400: {"detail":"litellm.BadRequestError: AnthropicException - {\"type\":\"error\",\"error\":{\"type\":\"invalid_request_error\",\"message\":\"`temperature` is deprecated for this model.\"},\"request_id\":\"req_011Ccut9RCrS9SBzSNLhugu9\"}. Received Model Group=anthropic.claude-opus-4-8\nAvailable Model Group Fallbacks=None"}

```
