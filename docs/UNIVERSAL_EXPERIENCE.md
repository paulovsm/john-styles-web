# John Styles — Universal Stylist Pilot

## Decision

The approved universal presentation is promoted to the root and internal pages.
Production functionality is preserved: existing chat mode, onboarding catalog,
authentication, storage and subscription lead form. The experimental experience
remains available under:

`https://fleekauthority.com/teste-novo-app`

It is a full-product pilot, not a landing-page-only campaign. Landing, login,
onboarding and authenticated routes share the same path prefix.

## Product promise

Fleek Authority is the place where women and men transform their style across
work, everyday life, dates, celebrations, formal events, travel, leisure and
wellbeing. The experience starts from identity, context and the existing
wardrobe instead of a fixed professional or gendered dress code.

John Styles is the expert solution Fleek brings to the experience: a visible
Chief Stylist Officer and digital stylist who listens, interprets context,
recommends and explains. Fleek remains the brand, destination and ecosystem;
John is not a substitute for the whole brand. The client remains the author and
final decision-maker, while artificial intelligence is the transparent engine
behind the service.

Core message: **“Transforme seu estilo para tudo o que você vive.”**
Supporting line: **“Na Fleek Authority, você encontra curadoria, ferramentas e
John Styles, o expert digital que conhece seu guarda-roupa e resolve o que
vestir em cada ocasião.”**

## Architecture

- One React/Vite application and one deployment.
- React Router uses `/teste-novo-app` as its basename when that prefix is
  present; internal links remain inside the pilot automatically.
- Accounts, Firebase data, APIs and usage limits are shared with the current
  product because both experiences use the same origin and backend.
- The browser marks the pilot `noindex, nofollow` until launch approval.
- `/api` and Firebase auth-handler paths stay at the origin root.
- Production and pilot use the universal presentation. Only the pilot receives
  `noindex, nofollow`, expanded onboarding occasions and the experimental agent
  mode. Public canonical URLs retain their existing unprefixed paths.

## Experience contract

Client requests to the John Styles chat include `experience: "universal"` in
the pilot and `experience: "legacy"` elsewhere. The n8n workflow should use the
field to select the appropriate system message. Until that workflow is updated,
its existing neutral-gender contract remains the fallback.

Universal responses must:

- address women and men naturally without guessing gender;
- consider professional and non-professional occasions;
- ask for context when it materially changes the recommendation;
- avoid presenting Store or Subscription as established, comprehensive
  services;
- explain recommendations without judging body, budget or wardrobe size.

## Commercial concepts

Fleek Store and Fleek Subscription remain visible in the pilot. They are
explicitly labeled as concepts in development. Copy must disclose that catalog,
format and availability are limited or still being validated.

## Visual direction

The pilot uses Fleek's strict monochromatic system:

- white canvas (`#FFFFFF`) and fog surfaces (`#EEF1F0`);
- deep panels (`#0C0C0C`) and carbon content (`#1A211E`);
- hairline structure (`#E0E0E0` and `#CCCFCD`);
- black or white primary actions, according to contrast;
- red (`#CC2E39`) only as a rare, single editorial punctuation.

Warm paper, oxblood, olive, gold, gradients and recurring colored UI are not
part of the approved universal experience. Layout alternates flat white and
near-black bands, uses 4/8 px radii and avoids decorative shadows.

Photography shows women and men with equal agency, realistic bodies and
intentional styling across work and life. Avoid corporate stock clichés,
runway poses, gender stereotypes and visual promises of inaccessible luxury.
Hero imagery is composed and approved at 360 px first, keeps faces and key
styling inside a central safe area, and uses close framing plus high contrast
for immediate mobile impact before desktop crops are considered.

John appears at relevant decision points through a consistent signature: name,
Chief Stylist Officer role and a disclosed digital representation. The current
`JohnStyles.jpg` asset is provisional until a canonical, licensed portrait and
its crop variants are approved.

## Definition of done

- Direct navigation and refresh work on the pilot root and nested routes.
- Root and pilot links never leak into the other experience.
- Landing, login, onboarding, dashboard and chat expose the universal message.
- Expanded occasions are offered only in the pilot until the product decision
  is promoted globally.
- PT, EN and ES preserve the same meaning.
- Mobile 320/360 px, desktop 1440 px, light/dark themes, keyboard and reduced
  motion are verified.
- Root landing regression, tests, lint and production build pass.
- n8n prompt behavior, women's sample wardrobe and real try-on quality are
  tracked separately when external or manual validation is required.
