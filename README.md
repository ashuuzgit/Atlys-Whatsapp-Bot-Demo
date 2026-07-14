# Atlys Visa MCP — Dubai prototype

A localhost **MCP server** that answers patterned Dubai-visa queries from **structured data** (not LLM guesswork) and runs a **deterministic upsell engine**. Proves the thesis before any WhatsApp/Meta setup: the LLM handles language, this server handles the truth (visa rules) and the money (upsell).

## Why this shape
- **Bot never *decides* to upsell.** The LLM extracts slots from free text → **code** decides what/whether to offer → the LLM only rewords the pitch. That's how the upsell is *guaranteed*, not left to chance.
- **No hallucinated visa rules.** Eligibility, docs, price, processing all come from `src/data/visas.ts` — the exact NPS root cause ("AI Bot Issue") this avoids.

## Run the demo (no MCP client needed)
```bash
cd D:\atlys-visa-mcp
npm install
npm run demo
```
Shows the engine firing across 6 cases: group discount, express-beats-group (ranking), multi-entry upgrade, visa guarantee, angry-user suppression, and the MMT price note.

## Run as an MCP server (connect to Claude Desktop)
```bash
npm start        # runs on stdio
```
Add to your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "atlys-visa": {
      "command": "npx",
      "args": ["tsx", "D:\\atlys-visa-mcp\\src\\index.ts"]
    }
  }
}
```
Restart Claude Desktop, then chat naturally — it will call the tools. Try:
> "Indian passport, Dubai visa, we're a group of 10 travelling next week."

## Tools exposed
| Tool | Job |
|---|---|
| `list_dubai_visa_options` | The WhatsApp button menu (5–6 options + price) |
| `get_required_documents` | Exact doc checklist for a selected visa |
| `check_eligibility` | Strict lookup: can-apply + docs + price + MMT note |
| `parse_message` | Free text → structured slots (fallback extractor) |
| `get_upsell_offer` | **The money tool** — ranked, gated, guarded, deduped, logged |

## The upsell engine (`src/engine/upsell.ts`)
- **Ranked** — `score = conversion × margin`, returns one best offer (no spam)
- **Eligibility-gated** — only offers what the visa actually supports
- **Sentiment-guarded** — frustrated user → zero upsells
- **Deduped** — never re-pitch an offer already shown
- **Logged** — every offer → `offers_log.jsonl` → feedback loop to reorder ranking

Offers today: group discount, express, multi-entry, longer validity, insurance, visa guarantee, concierge, multi-country bundle. Add more by pushing a candidate in `candidateOffers()`.

## How it maps to the WhatsApp plan
This same server is the brain. Later, swap the MCP client from Claude Desktop to your **WhatsApp Cloud API webhook** — nothing here is throwaway:
```
WhatsApp Cloud API  →  your webhook  →  (calls these MCP tools)  →  deep-link to Atlys app
```
The bot greets → lists Dubai options → collects/lists docs → **surfaces the upsell** → redirects to the app for the actual visa. Not end-to-end; WhatsApp is the front door and upsell surface.

## Files
```
src/
  index.ts            MCP server (registers the 5 tools)
  demo.ts             standalone CLI demo (npm run demo)
  data/visas.ts       MOCK Dubai catalogue — swap for real Atlys data
  engine/slots.ts     free text → structured signals
  engine/eligibility.ts   strict eligibility lookup (+ MMT note)
  engine/upsell.ts    the deterministic upsell engine
  lib/logger.ts       offer logging (feedback-loop hook)
```

> All visa data, pricing, and offers are **illustrative prototype mocks**, not Atlys's real logic. Replace `src/data/visas.ts` and the offer table with production data.
