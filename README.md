# Suman Sarkar: Portfolio

A dark, motion-rich personal portfolio for a Fullstack Java Developer, built with Angular. The hero has a real-time 3D "distributed system" made of nodes and request pulses. Buttons are magnetic. Sections reveal on scroll. Everything respects `prefers-reduced-motion`.

Design and content decisions live in [Plan.md](Plan.md).

## Tech stack

| Area | Choice |
|---|---|
| Framework | Angular 22, standalone components, signals, zoneless change detection |
| Rendering | Static prerender (SSG) at build time, then client hydration |
| Styling | SCSS with CSS custom properties (design tokens in `src/styles/_tokens.scss`) |
| 3D | Three.js, loaded lazily after the page settles (`three-scene.core.ts`) |
| Animation | GSAP + ScrollTrigger, loaded lazily (`gsap.service.ts`) |
| Contact form | Reactive Forms + EmailJS (no backend) |
| Tests | Vitest via `ng test` |
| Hosting | Vercel (static output) |

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
- **Favicon:** `public/favicon.svg` (plus `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` and `site.webmanifest`).
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
- [ ] Set `siteUrl` in both environment files to the real URL. Update the same URL in `public/robots.txt` and `public/sitemap.xml`.
- [ ] When the photo is ready, put it in `src/assets/images/` and set `profile.photoUrl` in `cv-data.ts`. That switches the hero to the photo layout, with the 3D cluster as a corner accent.
- [ ] Push to GitHub, import the repo in Vercel, and let it auto-deploy on every push. `vercel.json` already sets the output directory.
- [ ] Optional: attach a custom domain in the Vercel project settings.

## Project structure

```
src/
  app/
    core/        services (gsap, three-scene, seo, contact) and models
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
| Mobile | 85 | 100 | 100 | 100 |

Three.js and GSAP are separate lazy chunks and are not in the initial bundle.

## Credits

Technology logos in `src/assets/icons/tech` come from [Devicon](https://devicon.dev) (MIT license). Logos are trademarks of their respective owners.
