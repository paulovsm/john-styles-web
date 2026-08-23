# John Styles — Backlog

Plain-language list of what's left to do. Estimates are hands-on coding time
(review and verification add overhead on top).

Last updated on 2026-08-22 after merging the design guide, visual/mobile audit
and garment taxonomy, and starting the thumbnail optimization.

---

## Shipped / in review

| PR / branch | What | Status |
|---|---|---|
| #11 | Design system aligned to the landing page + landing hero + dashboard revamp | merged |
| #12 | Account avatar dropdown + mobile fixes | merged |
| #13 | **Mobile Tier 1** — unreadable chat, accidental deletes, blocked mobile login, iOS zoom, keyboard access | merged |
| #14 | **Mobile Tier 2** — touch targets, oversized text, thumb ergonomics | merged |
| #15 | **Perf** — fonts + route code-splitting (−65% initial download) | merged |
| #16 | **Perf** — write only changed wardrobe items | merged |
| #18 | Fleek Authority design guide and development rules | merged |
| #19 | **Visual + Mobile Tier 4** — contrast, labels, keyboard access, skip link, reduced motion and mobile-safe carousels | merged |
| #20 | Canonical garment taxonomy — 6 categories and 40 types, including composite suits and sets | merged |
| `feat/wardrobe-thumbnails` | 320px WebP thumbnails, legacy fallback, early file validation and paired Storage cleanup | in development |

---

## Next up

### Upload progress
Saving a garment on a slow connection shows only a small spinner — no percentage,
cancel or timeout, so a 20-second upload looks frozen. Add resumable uploads with
clear progress and recovery states.
_Est: ~1–2 h._

---

## Mobile audit — remaining findings

Everything below was identified in the four-part mobile audit but consciously not
implemented in Tiers 1–3. Grouped so a future pass can pick a batch.

### Touch & navigation
- **Nested scroll trap in try-on** — the item picker is a 256px scroll region
  inside a long scrolling page; drags move the wrong thing.
- **"Add item" sits top-right** of an endlessly long wardrobe — a bottom-right
  floating button would be in the thumb zone. Same idea for a bottom tab bar
  instead of the hamburger (6 destinations, currently 2 taps each).
- **Modal is a floating card, not a sheet** — 80px of dead space at the bottom
  where the thumb is, and on iOS the page behind still scrolls.

### Forms & flows
- **No mobile keyboard hints** on the wardrobe fields — brand/colour/style get
  autocorrect and wrong capitalisation; search has no search keyboard.
- **Try-on has no camera option** (unlike add-item), so the user hunts through the
  share sheet.
- **Try-on steps are unnumbered** — three undifferentiated cards with no progress.
- **Onboarding ergonomics** — Skip sits next to Continue and is easy to hit by
  accident; the card still wastes width on small screens.
- **Save button disabled with no explanation** in add-item (two hidden conditions).

### Performance & cost (follow-ups to #15 / #16)
- **`syncAllToCloud` still writes one request per item** — the header's "sync now"
  button. #16 fixed the automatic sync path only.
- **`getWardrobe` is unbounded** — the whole closet downloads on every app open.
- **Gallery page is still unbounded** — #16 limited the dashboard card only; the
  gallery itself needs "load more" pagination.
- **No fetch caching** — navigating dashboard → gallery → dashboard re-reads the
  same collection three times. A small request cache (or TanStack Query) would fix
  it broadly.
- **Long lists are not virtualised** — the dashboard wardrobe carousel renders
  every item even though ~3 are visible.
- **Previews hold base64 in memory** — `URL.createObjectURL` would avoid the copy;
  and the try-on path re-downloads an already-uploaded image just to re-encode it.

---

## Quick wins (under ~1 hour)

### Outfit "why"
Show *why* the "Look of the day" was chosen — e.g. *"For today: 21°C, meeting at
2 pm"* — using the weather and (optionally) the user's Google Calendar. The wiring
already exists; this is mostly about showing the reason clearly.
_Est: ~15–20 min._ *(For real users in production, Google must approve the calendar
connection — a separate admin step.)*

---

## Medium (1–4 hours)

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
