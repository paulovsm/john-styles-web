# John Styles — Backlog

Plain-language list of what's left to do, grouped by size. Estimates are hands-on
coding time (verification/tests add overhead on top).

## Recently shipped / in review
- **Design system + landing hero + dashboard revamp** — PR #11
- **Account menu (avatar dropdown)** — PR #12

---

## Quick wins (under ~1 hour)

### Outfit "why"
Show *why* the "Look of the day" was chosen — e.g. *"For today: 21°C, meeting at
2 pm"* — using the weather and (optionally) the user's Google Calendar. The wiring
already exists; this is mostly about showing the reason clearly.
_Est: ~15–20 min._ *(For real users in production, Google must approve the calendar
connection — a separate admin step.)*

### Fix the e-commerce links
Review and correct the links that point to the Fleek store (landing + insights), so
they go to the right place. Scope depends on whether we just fix URLs or deep-link to
specific products.
_Est: ~30 min–1 h._

---

## Medium (1–4 hours)

### Garment types (Taxonomy)
Today the app only knows broad groups (tops / bottoms / shoes). Teach it the *specific*
piece — shirt, polo, t-shirt, pants, sneakers, etc. — with one clean field. The wardrobe
summary then shows one big **total** plus small tags for **only the types you own** (no
grid full of "0"s). Numbers always match reality.
_Est: ~1–1.5 h._

### Landing page translations
The landing page is Portuguese-only, while the app already supports English and Spanish.
Make the landing translatable too.
_Est: ~1 h (many text snippets, ×3 languages)._

### Newsletter sign-up (wave 2)
The "join the movement" email box currently just opens the visitor's email app (looks
broken). Make it actually **save the address**. Needs one decision: where to store the
emails (recommended: the existing database — no extra tools).
_Est: ~45 min + a storage decision._

### Improve overall SEO
Audit and improve search-engine visibility: page titles/descriptions, social-share
previews (Open Graph), sitemap, and structured data. Some pieces already exist (sitemap,
share image) — this fills the gaps and makes them consistent across pages.
_Est: ~2–4 h._

---

## Large / needs a decision + R&D (days, not hours)

### Photo treatment (background removal + consistent framing)
Automatically clean up wardrobe/try-on photos: remove the background and put every piece
in the same position/framing so the closet looks uniform and professional. Needs a
decision on the method (a background-removal service vs. an on-device model) and how to
standardize framing.
_Est: ~1–2 days; requires an approach decision first._

### Full-look photo → auto-split into pieces
Let the user photograph a **whole outfit** (or a full-body look), then automatically
**detect and separate the individual garments** into wardrobe items. This is an AI/
computer-vision feature (detect + crop each piece), so it needs research and an approach
decision before building.
_Est: ~2–4 days; requires an approach decision first._

---

## Deferred / dropped
- **History vs Gallery consolidation** — dropped (they are genuinely distinct: History =
  chat log, Gallery = saved try-on looks).
- **More landing testimonials**, **AI-persona clarity** — dropped by request.
- **Store link "open in new tab"** — dropped (keep same-tab experience).
