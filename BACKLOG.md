# John Styles — Backlog

Plain-language list of what's left to do. Estimates are hands-on coding time
(review and verification add overhead on top).

Last updated after the mobile-experience audit (4 parallel sweeps: layout,
touch/navigation, forms/flows, performance/accessibility).

---

## Shipped / in review

| PR | What | Risk |
|---|---|---|
| #11 | Design system aligned to the landing page + landing hero + dashboard revamp | merged |
| #12 | Account avatar dropdown + mobile fixes | merged |
| #13 | **Mobile Tier 1** — unreadable chat, accidental deletes, blocked mobile login, iOS zoom, keyboard access | low |
| #14 | **Mobile Tier 2** — touch targets, oversized text, thumb ergonomics | low |
| #15 | **Perf** — fonts + route code-splitting (−65% initial download) | none |
| #16 | **Perf** — write only changed wardrobe items | ⚠️ medium (data) |

---

## Next up

### Garment types (Taxonomy) — approved, then overtaken
Teach the app the *specific* piece (shirt / polo / t-shirt / pants / sneakers…)
with one clean field instead of the broad tops/bottoms/shoes buckets. The wardrobe
summary then shows one big **total** plus tags for **only the types you own**, so a
small closet stops looking empty. Numbers always match reality.

Decisions already made: keep a single leaf `type` field and derive `category` from
it; persist the derived category so outfit/insights/filters keep working unchanged.
The garment labels on cards today are an interim fix that this replaces.
_Est: ~1–1.5 h._

### Image thumbnails
Photos are stored at full size (1500px) but displayed small (~160px), so phones
download roughly **9× more data than needed** per thumbnail. Generate a small copy
at upload and use it in grids/carousels.

**No migration needed** — few photos exist so far, so this applies to new uploads
only; existing photos keep working (just heavier). Best done *before* users upload
a lot, since the benefit scales with photo count.
_Est: ~1–2 h._

### Mobile Tier 4 — accessibility & polish
Two items worth doing:
- **Error text is hard to read** — error messages use a red below the readability
  standard on white, so people misread or miss them.
- **Filter dropdowns have no labels** — a screen-reader user hears three identical
  "combo box" controls on the wardrobe page with no idea what each one filters.

The rest is cosmetic: alt text on user photos, skip link, reduced-motion support,
missing `h1` on chat, heading levels, carousel arrows overlapping photos on touch.
_Est: ~2–3 h total._

---

## Quick wins (under ~1 hour)

### Outfit "why"
Show *why* the "Look of the day" was chosen — e.g. *"For today: 21°C, meeting at
2 pm"* — using the weather and (optionally) the user's Google Calendar. The wiring
already exists; this is mostly about showing the reason clearly.
_Est: ~15–20 min._ *(For real users in production, Google must approve the calendar
connection — a separate admin step.)*

### Fix the e-commerce links
Review and correct the links pointing to the Fleek store (landing + insights).
Scope depends on whether we just fix URLs or deep-link to specific products.
_Est: ~30 min–1 h._

---

## Medium (1–4 hours)

### Upload progress
Saving a garment on a slow connection shows only a small spinner — no percentage,
no cancel, no timeout, so a 20-second upload looks frozen. Needs resumable uploads.
_Est: ~1–2 h._

### Landing page translations
The landing page is Portuguese-only while the app already supports English and
Spanish. Make it translatable too.
_Est: ~1 h._

### Newsletter sign-up
The "join the movement" email box currently just opens the visitor's email app
(which looks broken to anyone without a mail client configured). Make it actually
**save the address**. Needs one decision: where to store the emails (recommended:
the existing database — no extra tools).
_Est: ~45 min + a storage decision._

### Improve overall SEO
Audit and improve search visibility: page titles/descriptions, social-share
previews (Open Graph), sitemap, structured data. Some pieces already exist — this
fills the gaps and makes them consistent.
_Est: ~2–4 h._

### Slim down the icon library
We use ~30 icons but pull them from a library of ~11,000. Extra weight for no
benefit. Low value per unit of effort (touches ~23 files), hence deferred.
_Est: ~1 h._

---

## Large / needs a decision + R&D (days, not hours)

### Photo treatment (background removal + consistent framing)
Automatically clean up wardrobe photos: remove the background and put every piece
in the same position/framing so the closet looks uniform and professional. Needs a
decision on method (background-removal service vs. on-device model).
_Est: ~1–2 days; requires an approach decision first._

### Full-look photo → auto-split into pieces
Let the user photograph a **whole outfit**, then automatically **detect and separate
the individual garments** into wardrobe items. An AI/computer-vision feature
(detect + crop each piece) needing research before building.
_Est: ~2–4 days; requires an approach decision first._

### Connect the app to the store
When a wardrobe is thin, have John recommend **buyable Fleek pieces** to fill the
gaps ("no shoes yet — here are 3 from the store"). Turns the closet into a sales
funnel; today the app and the store are entirely separate experiences.
_Est: multi-day; product decision first._

---

## Deferred / dropped
- **History vs Gallery consolidation** — dropped: they are genuinely distinct
  (History = chat log, Gallery = saved try-on looks; "Recent looks" is a preview
  of the Gallery, which is a normal pattern).
- **More landing testimonials**, **AI-persona clarity** (the human photo labelled
  "John Styles") — dropped by request.
- **Store link "open in new tab"** — dropped: keep the same-tab experience.
- **Separate mobile-only UI** (instead of responsive) — considered and set aside:
  it means building and maintaining two parallel interfaces. Revisit only for a
  specific high-friction screen (e.g. the camera-first wardrobe flow).
