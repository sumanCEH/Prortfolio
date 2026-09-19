# Suman Sarkar: Portfolio

A dark, motion-rich personal portfolio for a Fullstack Java Developer, built with Angular. The hero is a live "request trace": an API call travelling through a microservice graph over a pointer-reactive dot grid. Buttons are magnetic. Sections reveal on scroll. Everything respects `prefers-reduced-motion`.

Design and content decisions live in [Plan.md](Plan.md).

## Tech stack

| Area | Choice |
|---|---|
| Framework | Angular 22, standalone components, signals, zoneless change detection |
| Rendering | Static prerender (SSG) at build time, then client hydration |
| Styling | SCSS with CSS custom properties (design tokens in `src/styles/_tokens.scss`) |
| Hero visual | Canvas 2D "live request trace" (`trace-scene.ts`), a few KB, no WebGL |
| Animation | GSAP + ScrollTrigger, loaded lazily (`gsap.service.ts`) |
| Contact form | Reactive Forms + EmailJS (no backend) |
| Tests | Vitest via `ng test` |
| Hosting | GitHub Pages via GitHub Actions (static output) |

## Run locally

Angular 22 needs **Node 22.22.3+ or 24.15+**.

```bash
npm install
npm start          # ng serve on http://localhost:4200
```

> **Node note:** this project currently lists `node@24` as a dev dependency so it builds even when the machine's global Node is older. Once you have Node 24 installed globally, remove it with `npm uninstall node`.

## Build and test

```bash
npm run build      # production build + prerender -> dist/suman-portfolio/browser
npm test           # unit tests
```

## Résumé, favicon and loading screen

- **Résumé:** `npm run resume` rebuilds `src/assets/resume.pdf` from `cv-data.ts`, so the PDF and the website never disagree. The hero's "Download Résumé" button serves it.
- **Favicon:** `public/favicon.svg` (plus `favicon.ico` and `apple-touch-icon.png`). There is no web manifest on purpose, so browsers do not offer to "install" the site as an app.
- **Loading screen:** lives in `src/index.html` so it paints instantly. It plays once per browser (remembered in localStorage). Add `?intro` to the URL to replay it, and click or press any key to skip it.

## Where the content lives

Every CV fact is in **`src/assets/data/cv-data.ts`**. No component hardcodes CV content. Search that file for `TODO` to find what still needs real values (email, LinkedIn, exact job titles, full skills list).

## Contact form: fill in EmailJS before deploying

The form sends mail with EmailJS straight from the browser.

1. Create a free account at <https://www.emailjs.com>.
2. Add an email service and a template. The template can use `{{from_name}}`, `{{reply_to}}` and `{{message}}`.
3. Paste the **Service ID**, **Template ID** and **Public Key** into:
   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts` (this is the one used by `ng build`)
4. In the EmailJS dashboard, restrict the public key to your site's domain.

Until the placeholders (`REPLACE_ME`) are replaced, the form shows a friendly "not set up yet" message instead of failing silently.

## Before going live: manual checklist

- [x] The résumé is generated from `cv-data.ts`. Re-run `npm run resume` after editing your CV data (needs Chrome or Edge installed).
- [ ] Replace `src/assets/images/og-image.png` with a real 1200x630 share image.
- [ ] Create the EmailJS account and paste the 3 real keys into `environment.prod.ts`.
- [x] Email, LinkedIn, GitHub, both phone numbers and the WhatsApp chat number are set in `cv-data.ts` (`contact`).
- [ ] Until EmailJS is configured, the contact form offers the visitor a pre-filled email link and a Gmail link instead of sending directly.
- [x] `siteUrl`, `robots.txt` and `sitemap.xml` point at the GitHub Pages address (`https://sumanceh.github.io/Prortfolio/`). Change all three if you add a custom domain.
- [ ] When the photo is ready, put it in `src/assets/images/` and set `profile.photoUrl` in `cv-data.ts`. That switches the hero to the photo layout, with the request trace as a corner accent.
- [ ] Publish it: follow **Hosting on GitHub Pages** below.

## Hosting on GitHub Pages (free)

`.github/workflows/deploy.yml` tests, builds and publishes the site on every push to `main`.

1. Push the project to `main` on GitHub.
2. In the repo go to **Settings > Pages > Build and deployment** and set **Source** to **GitHub Actions**. Do this once.
3. Open the **Actions** tab. When "Deploy to GitHub Pages" turns green, the site is live at **https://sumanceh.github.io/Prortfolio/**.

Notes:
- The workflow builds with `--base-href /<repo-name>/`, so the site works under the repo's subpath. To build the same way locally: `npx ng build --base-href /Prortfolio/`.
- A repo named `<username>.github.io` is served from the domain root. In that case change `--base-href` in the workflow to `/`, and drop `/Prortfolio` from the URLs in the environment files, `robots.txt` and `sitemap.xml`.
- GitHub Pages on a free account needs a **public** repository.
- `vercel.json` is only needed if you also deploy to Vercel. It does no harm on GitHub Pages.

## Project structure

```
src/
  app/
    core/        services (gsap, trace-scene, seo, contact) and models
    shared/      ui-button, section-heading, glass-card, animated-divider,
                 flow-diagram, count-up, icon, reveal directive
    features/    hero, about, experience, work, skills,
                 certifications, education, contact
  assets/        data/cv-data.ts, fonts, images, resume.pdf
  environments/  EmailJS keys and site URL
  styles/        design tokens, mixins, global styles
```

## Performance and accessibility

Measured on a production build with Lighthouse:

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Desktop | 100 | 100 | 100 | 100 |
| Mobile | 90 | 100 | 100 | 100 |

GSAP is a separate lazy chunk. The hero animation is plain Canvas 2D, so there is no heavy 3D download.

## Credits

Technology logos in `src/assets/icons/tech` come from [Devicon](https://devicon.dev) (MIT license). Logos are trademarks of their respective owners.
