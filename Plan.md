# Suman Sarkar — 3D Portfolio Website — Project Plan

**Owner:** Suman Sarkar (Senior Associate Consultant, Infosys | ex-Capgemini | Java/Spring/Angular/Cloud)
**Goal:** A dark, premium, motion-rich personal portfolio in **Angular**, inspired by the layout/energy of the Dribbble reference ["Personal Portfolio – Framer Website" by Sk Nahid Hasan](https://dribbble.com/shots/27497608-Personal-Portfolio-Framer-Website), rebuilt with a tech-engineer identity, a 3D hero element, and tactile buttons.
**Status:** Planning complete — ready to scaffold. Photo and a couple of content decisions are still pending from Suman (see "Open Items" at the end).

---

## 1. What the reference actually is (analysis)

Fetched directly from Dribbble (not guessed):

- **Structure:** Sticky top nav (Home / About / Work / Services / Contact) → huge hero with a giant first-name in bold display type overlapping a portrait photo → floating glass-morphism info chips ("role · project" and "Let's talk" contact card) over the hero → alternating light/dark content sections (About / value props as bullet lists with a ✦ marker) → a "Work" strip showing multiple browser-frame mockups → a Services/pricing-style block → dark gradient CTA/contact section → footer.
- **Color palette (extracted from the shot):** `#6B0A04` `#930E04` `#C11B0B` (deep red/orange), `#050525` `#1C2791` (near-black navy/indigo), `#4C2870` `#9650C0` (violet). Used as large soft gradient "glow" shapes behind glass cards, not as flat fills.
- **Typography feel:** oversized, tight-tracking display sans for names/headlines; small uppercase tracked labels for eyebrows/nav; clean sans body text on white sections for contrast/readability.
- **Signature details:** crosshair corner marks (`+`) on the hero frame, thin 1px borders on glass cards, rounded pill buttons, a small "available for work" status dot, subtle diagonal gradient beams in dark sections.
- **Interaction implied by a Framer template of this kind:** magnetic/hover-lift buttons, scroll-reveal text and cards, parallax on the hero image/shapes, smooth section-to-section scroll.

We are **not** cloning this pixel-for-pixel (it's someone else's commercial template) — we're building an original site in the same spirit: bold hero, glass cards, dark/light rhythm, tactile buttons — re-skinned for a backend/cloud engineer instead of a UI/UX designer, and rebuilt as a real, hand-coded Angular app rather than a Framer export.

---

## 2. Design system

### 2.1 Palette — "Cloud Circuit" (engineer-coded version of the reference's mood)

Rationale: keeps the reference's dark-canvas-plus-glowing-gradient energy, but swaps warm red/orange for cool blues/violet with one warm accent kept for contrast and CTAs — reads as "cloud / distributed systems / code" rather than "creative studio", while still feeling premium and not generic corporate blue.

| Token | Hex | Use |
|---|---|---|
| `--bg-void` | `#05060A` | Base background (near-black, not pure black) |
| `--bg-elevated` | `#0D1020` | Card/panel background on dark sections |
| `--surface-light` | `#F5F6FA` | Light section background (About/Services alt rhythm) |
| `--ink` | `#EDEFF7` | Primary text on dark |
| `--ink-muted` | `#9AA0B4` | Secondary text on dark |
| `--ink-dark` | `#0B0C14` | Primary text on light sections |
| `--brand-blue` | `#2E6BFF` | Primary accent, links, active states |
| `--brand-cyan` | `#22D3EE` | Secondary accent, gradient partner, code/data motifs |
| `--brand-violet` | `#7C5CFF` | Gradient partner, glow shapes (keeps a nod to the reference's violet) |
| `--brand-amber` | `#FF8A3D` | Sparingly: CTA highlight, "available for work" dot, hover pop — the one warm accent |
| `--glass-border` | `rgba(255,255,255,0.08)` | 1px card borders on dark |
| `--glass-fill` | `rgba(255,255,255,0.04)` | Glass card background on dark |

Gradients:
- Hero glow: radial `--brand-blue` → `--brand-violet` → transparent, 30–40% opacity, blurred (mirrors the reference's diagonal glow beams).
- CTA/contact section: diagonal `--brand-violet` → `--bg-void`.

### 2.2 Typography

- **Display/headline:** `Clash Display` or `Space Grotesk` (both free, geometric, bold — same energy as the reference's oversized name treatment). Fallback stack: `"Space Grotesk", "Inter", sans-serif`.
- **Body/UI:** `Inter` — excellent legibility, variable font, free.
- **Mono accent** (for code snippets, tags like `Java` `Spring Boot`, terminal-style bits): `JetBrains Mono` — a natural, honest touch for a developer's site.
- Scale (rem, fluid via `clamp()`): eyebrow `0.75` · body `1` · lead `1.25` · h3 `1.5` · h2 `2.5` · h1/hero name `clamp(3.5rem, 9vw, 8rem)`.

### 2.3 Spacing, radius, elevation

- 8px base spacing scale (8/16/24/32/48/64/96/128).
- Radius: buttons/pills `999px`, cards `20px`, images `16px`.
- Elevation via soft colored glow shadows (`box-shadow: 0 0 60px rgba(46,107,255,0.25)`), not grey drop-shadows — keeps the "glass on a dark glowing canvas" look.

### 2.4 Buttons ("cool buttons" spec)

Three reusable button variants, all Angular standalone components (`<app-button>`):

1. **Magnetic primary pill** — gradient fill (`brand-blue` → `brand-violet`), text pulls toward cursor within a small radius (magnetic effect via pointer-move listener + GSAP `quickTo`), scales 1.04 on hover, subtle glow bloom on hover, ripple-out on click.
2. **Ghost/outline button** — 1px `--glass-border`, fills with a soft gradient wash on hover, used for secondary actions (e.g., "Download Résumé").
3. **Icon/social button** — circular, glass background, icon rotates/translates on hover (e.g., arrow tilts from `→` to `↗`).

All buttons: `prefers-reduced-motion` disables magnetic/scale motion and falls back to a simple color transition; fully keyboard-operable with a visible focus ring (`outline: 2px solid var(--brand-cyan)`), because motion-heavy sites frequently fail this and it's an easy, cheap win.

### 2.5 3D concept — tied to Suman's actual stack, not generic shapes

Instead of a random abstract blob (common but meaningless), the hero 3D centerpiece is a **rotating "distributed system" formation**: a small cluster of glass/metal nodes connected by thin animated lines (representing microservices/API calls), slowly rotating, reacting gently to mouse parallax, occasionally "pulsing" a line to imply a request travelling through the system. It's built from primitives (icosahedrons/spheres + `THREE.Line`), so it's cheap to render and it visually says "backend distributed systems engineer" rather than "generic 3D portfolio."

Since a photo will be added later, the plan supports **two hero layouts**, switched by one flag once the photo is ready:
- **Now (no photo yet):** 3D node-cluster centerpiece + oversized name typography, exactly like the reference's role (photo replaced by the 3D piece).
- **Later (photo ready):** reference-style layout — large portrait on one side, name/typography overlapping it, 3D node-cluster shrinks to a smaller accent element in a corner or behind floating chips.

Secondary, lighter 3D/motion touches elsewhere (kept subtle so the site stays fast):
- Skills section: a slowly rotating 3D "tag cloud" or simple orbiting ring of tech logos (Java, Spring, Angular, AWS, Azure, Docker, Kafka…) — CSS 3D transforms, not WebGL, to keep this section cheap.
- Section dividers: thin animated gradient line that "draws itself" on scroll (GSAP + SVG, no 3D needed).

---

## 3. Content architecture (from Suman's CV)

1. **Hero** — "Suman Sarkar", role line "Fullstack Java Developer · Senior Associate Consultant", one-line value prop ("I build reliable, cloud-native backend systems for enterprise-scale products"), status chip "📩 Available for new opportunities", primary CTA "Get in touch", secondary CTA "Download Résumé", 3D node-cluster.
2. **About** — condensed professional summary from the CV; quick facts strip (4+ yrs experience · Healthcare & Automotive domains · Kolkata, India · Open to relocate – Bengaluru).
3. **Experience (timeline)** — Infosys (Nov 2024–Present, Fortune 10 Healthcare client) → Capgemini (Oct 2022–Nov 2024, global luxury automotive OEM) → Capgemini Internship (Jan–Apr 2022). Each entry: role, company, dates, 2–3 top bullet achievements pulled from the CV (production incidents resolved, CI/CD ownership, mentoring, the Copilot/GPT/Claude tooling work).
4. **Work / Highlights** (per your answer: real work + architecture diagrams, no fake product shots):
   - **CMR Training Portal** (Capgemini) — greenfield web portal built from scratch.
   - **GHCP + Markdown ticket-acceleration tool** (Infosys) — won the Insta Award, 40% faster ticket resolution; show this as the flagship case-study card with the metric front and center.
   - **Enterprise Healthcare Platform microservices** (Infosys) — architecture-diagram card (simple animated SVG/3D diagram of API Gateway → Services → MQ/Kafka → DB) instead of a screenshot, with the "16+ production incidents resolved" and CI/CD stats as supporting metrics.
   - **CI/CD pipeline** — GitHub Actions/Jenkins/Maven/uDeploy/Octopus shown as a small animated pipeline diagram.
5. **Skills** — grouped chips: Languages · Backend/Frameworks · Frontend · Databases · Cloud & Messaging · DevOps/Monitoring · Practices · Tools — all pulled verbatim from the CV's Technical Skills section.
6. **Certifications & Awards** — GH-300, GH-900, AZ-900, AZ-204, AWS Technical Essentials, CEH v10; Insta Award 2026; promotion to Senior Associate Consultant.
7. **Education** — MCA (Techno International Newtown, 2022), BCA (Siliguri Institute of Technology, 2020).
8. **Contact** — headline CTA, working form (Vercel + EmailJS per your choice), plus direct links: email, phone, LinkedIn.
9. **Footer** — small nav repeat, socials, "Built with Angular" credit line, copyright.

No content is invented beyond what's on the CV; the "expected outcome" style copy blocks from the reference are replaced with real, CV-backed statements only.

---

## 4. Tech stack & architecture

| Concern | Choice | Why |
|---|---|---|
| Framework | **Angular 22** (current stable as of Sep 2026), standalone components, Signals (no NgModules) | Modern default Angular architecture; you already use Angular professionally, good for your own skill growth too |
| Change detection | Zoneless (`provideZonelessChangeDetection`) | Angular's recommended modern default; pairs well with signal-driven UI and avoids zone.js overhead during heavy animation/3D frames |
| Styling | SCSS with CSS custom properties (design tokens from §2), no heavy CSS framework | Full control over the bespoke glass/gradient look; avoids fighting a utility framework's defaults for a highly custom design |
| 3D | **Three.js**, wrapped in one small Angular service (`ThreeSceneService`) + a `<app-hero-scene>` standalone component that owns the canvas | Direct Three.js (rather than the `angular-three` renderer library) is the safer "best practice" pick for a single hero/skills visual: fewer moving parts, no dependency on a third-party renderer's API churn, easier to lazy-load and tree-shake, and Suman fully controls the render loop. `angular-three` (NGT) is noted as an alternative in Open Items below if he later wants a more declarative, template-driven 3D scene graph. |
| Animation | **GSAP + ScrollTrigger** (now 100% free for everyone, incl. all plugins, since Webflow's 2025 acquisition) | Industry-standard for scroll-reveal, magnetic buttons, and the self-drawing divider lines; far more reliable cross-browser than hand-rolled scroll listeners |
| Forms | Reactive Forms + **EmailJS** (per your choice: Vercel + EmailJS) | No backend needed; sends straight from the browser; free tier is enough for a personal portfolio |
| Routing | Single scrollable page with anchor-based "routes" (`/#about`, `/#work`) for nav highlighting; Angular Router only if a future case-study detail page is wanted | Matches the reference's one-page feel; keeps things simple |
| Images | `NgOptimizedImage`, AVIF/WebP with fallback, explicit width/height | Prevents layout shift, keeps LCP fast despite the heavy hero |
| SEO | Angular's native meta/title services, OpenGraph tags, `sitemap.xml`, `robots.txt`, JSON-LD `Person` schema using CV data | Portfolio's whole point is discoverability by recruiters/Google |
| Deployment | **Vercel** (per your choice) | Zero-config Angular support, instant previews per commit, free SSL/CDN |
| Testing | Karyby default Angular testing (Jasmine/Karma or Vitest if scaffolded with it) for components; basic Lighthouse CI check before each deploy | Keeps quality bar consistent with your professional TDD habit |

### 4.1 Performance guardrails (because "3D + animations" is exactly what tanks Lighthouse scores if unmanaged)

- Three.js scene code is **lazy-loaded** (dynamic `import()`) only when the hero enters the viewport, and only on devices that pass a basic capability check (skip/replace with a static gradient image on `prefers-reduced-motion` and on low-end/mobile if needed).
- Cap the 3D scene to a modest node/line count, `devicePixelRatio` capped at 2, pause the render loop (`renderer.setAnimationLoop`) when the hero scrolls out of view or the tab is hidden (`document.visibilitychange`).
- GSAP timelines killed/cleaned up in `ngOnDestroy` to avoid memory leaks on route/section teardown.
- Target: Lighthouse Performance ≥ 90 on desktop, ≥ 80 on mobile; LCP < 2.5s; CLS < 0.1.

### 4.2 Accessibility guardrails

- All motion respects `prefers-reduced-motion: reduce`.
- Color contrast checked against WCAG AA for text on both dark and light sections (the palette in §2.1 is chosen to pass this).
- Full keyboard navigation and visible focus states on every interactive element, including the magnetic buttons and nav.
- Semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<section aria-label="...">`, `<footer>`), alt text on all images, form labels tied to inputs.

---

## 5. Suggested folder structure

```
suman-portfolio/
├── src/
│   ├── app/
│   │   ├── core/                # tokens, services (theme, seo, three-scene, email)
│   │   │   ├── services/
│   │   │   │   ├── three-scene.service.ts
│   │   │   │   ├── seo.service.ts
│   │   │   │   └── contact.service.ts   # EmailJS wrapper
│   │   │   └── models/
│   │   ├── shared/
│   │   │   ├── ui-button/               # the 3 button variants from §2.4
│   │   │   ├── section-heading/
│   │   │   ├── glass-card/
│   │   │   └── animated-divider/
│   │   ├── features/
│   │   │   ├── hero/
│   │   │   │   ├── hero.component.ts|html|scss
│   │   │   │   └── hero-scene/          # Three.js canvas component
│   │   │   ├── about/
│   │   │   ├── experience/
│   │   │   ├── work/
│   │   │   ├── skills/
│   │   │   ├── certifications/
│   │   │   └── contact/
│   │   ├── app.component.ts
│   │   ├── app.config.ts                # zoneless provider, routes, etc.
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── data/                        # cv-data.ts (typed content extracted from CV — single source of truth)
│   │   ├── icons/  images/  fonts/
│   ├── styles/
│   │   ├── _tokens.scss                 # §2.1–2.3 as SCSS variables/CSS custom properties
│   │   ├── _mixins.scss
│   │   └── styles.scss
│   └── index.html
├── PLAN.md
├── PROMPTS.md
└── README.md
```

`assets/data/cv-data.ts` is a single typed TypeScript object holding every fact from the CV (experience, skills, certs, education) — every section component reads from this file, so nothing is duplicated or goes stale between components.

---

## 6. Milestones

| Phase | Deliverable |
|---|---|
| 0 | Angular 22 project scaffolded, design tokens wired, folder structure, base layout shell + nav |
| 1 | Hero section with 3D node-cluster + typography, magnetic buttons working |
| 2 | About, Experience timeline, Skills sections built from `cv-data.ts` |
| 3 | Work/Highlights section with the two real-work case-study cards + architecture-diagram visuals |
| 4 | Certifications, Education, Contact (EmailJS) + Footer |
| 5 | Scroll animations (GSAP ScrollTrigger) + animated dividers across all sections |
| 6 | Performance pass (lazy-load 3D, image optimization, Lighthouse ≥ 90/80), accessibility pass |
| 7 | SEO (meta/OG/JSON-LD/sitemap), responsive QA (mobile/tablet/desktop) |
| 8 | Deploy to Vercel, custom domain (optional), final QA |

`PROMPTS.md` turns each phase above into a ready-to-paste build prompt.

---

## 7. Open items (need your input before/while building)

1. **Photo** — send the headshot/photo when ready; until then the hero ships with the 3D-only layout (§2.5).
2. **EmailJS setup** — you'll need to create a free EmailJS account and give me the Service ID / Template ID / Public Key (or I can walk you through creating them) before the contact form goes live.
3. **Domain** — using a free `vercel.app` subdomain, or do you own/plan to buy a custom domain (e.g., `sumansarkar.dev`)?
4. **Phone number on the public site** — the CV has your phone number; confirm whether it should be public on the Contact section or omitted (email + LinkedIn only).
5. **angular-three (NGT) vs plain Three.js** — plan defaults to plain Three.js for simplicity/control (see §4). If you'd rather use the more declarative `angular-three` renderer library instead, say so before Phase 1 and the hero-scene prompt changes accordingly.
