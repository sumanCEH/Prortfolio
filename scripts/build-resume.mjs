/**
 * Builds src/assets/resume.pdf from the CV data, so the résumé and the website
 * always say the same thing.
 *
 *   npm run resume
 *
 * Needs Google Chrome or Edge installed (it prints the PDF from headless Chrome).
 * Set CHROME_PATH if it is not in a standard location. Uses Node's built-in
 * TypeScript support to read cv-data.ts (Node 22.18+/24).
 */
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { CV_DATA as cv } from '../src/assets/data/cv-data.ts';

const root = path.resolve(import.meta.dirname, '..');
const fontsUrl = pathToFileURL(path.join(root, 'src/assets/fonts')).href;
const out = path.join(root, 'src/assets/resume.pdf');

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const link = (url, text) => `<a href="${esc(url)}">${esc(text ?? url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>`;

const { profile, contact } = cv;
const contactBits = [
  link(`mailto:${contact.email}`, contact.email),
  ...contact.phones.map((p) => link(`tel:${p.replace(/[^\d+]/g, '')}`, p)),
  link(contact.linkedin),
  link(contact.github),
  esc(profile.location),
].filter(Boolean);

const skills = cv.skills
  .map((g) => `<p class="skill"><b>${esc(g.category)}:</b> ${esc(g.items.join(', '))}</p>`)
  .join('');

const jobs = cv.experience
  .map(
    (j) => `
  <section class="job">
    <div class="row"><h3>${esc(j.role)}<span class="at"> | ${esc(j.company)}</span></h3><span class="dates">${esc(j.start)} – ${esc(j.end)}</span></div>
    <p class="ctx">${esc(j.context)}</p>
    <ul>${j.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
  </section>`,
  )
  .join('');

const awards = cv.awards.map((a) => `<li><b>${esc(a.title)}.</b> ${esc(a.detail)}</li>`).join('');
const certs = cv.certifications
  .map((c) => `<li>${esc(c.name)} <span class="code">(${esc(c.code)})</span></li>`)
  .join('');
const edu = cv.education
  .map((e) => `<div class="row"><p><b>${esc(e.degree)}</b> | ${esc(e.institution)}</p><span class="dates">${esc(e.year)}</span></div>`)
  .join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(profile.name)} - Resume</title>
<style>
  @font-face{font-family:Inter;font-weight:100 900;src:url('${fontsUrl}/inter-latin-wght-normal.woff2') format('woff2')}
  @font-face{font-family:'Space Grotesk';font-weight:300 700;src:url('${fontsUrl}/space-grotesk-latin-wght-normal.woff2') format('woff2')}
  @page{size:A4;margin:13mm 14mm}
  *{box-sizing:border-box}
  body{margin:0;color:#14171f;font:9.4pt/1.42 Inter,Arial,sans-serif}
  a{color:inherit;text-decoration:none}
  h1{margin:0;font:700 25pt/1.05 'Space Grotesk',Inter,sans-serif;letter-spacing:-.02em}
  .role{margin:2pt 0 0;font:600 11pt 'Space Grotesk',Inter,sans-serif;color:#1f54d6}
  .contact{margin:6pt 0 0;color:#3b4152;font-size:8.6pt}
  .contact span+span::before,.contact a+a::before{content:''}
  .contact .sep{color:#9aa0b4;padding:0 5pt}
  header{padding-bottom:8pt;border-bottom:2pt solid #1f54d6}
  .reloc{margin:3pt 0 0;color:#3b4152;font-size:8.6pt}
  h2{margin:12pt 0 5pt;padding-bottom:2.5pt;border-bottom:.7pt solid #cfd4e2;font:700 9.6pt 'Space Grotesk',Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#1f54d6}
  p{margin:0}
  .summary{color:#232838}
  .skill{margin:0 0 2pt}
  .skill b{color:#14171f}
  .row{display:flex;justify-content:space-between;align-items:baseline;gap:10pt}
  h3{margin:0;font:700 10.4pt 'Space Grotesk',Inter,sans-serif}
  .at{font-weight:500;color:#3b4152}
  .dates{flex:none;color:#3b4152;font-size:8.8pt;white-space:nowrap}
  .ctx{margin:1pt 0 3pt;color:#3b4152;font-style:italic;font-size:8.8pt}
  .job{margin-bottom:8pt;break-inside:avoid}
  ul{margin:0;padding-left:12pt}
  li{margin:0 0 1.8pt;padding-left:1pt}
  .job li{break-inside:avoid}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:0 18pt}
  .code{color:#5a6178}
  .edu .row{margin-bottom:2pt}
</style></head><body>
<header>
  <h1>${esc(profile.name)}</h1>
  <p class="role">${esc(profile.role)}</p>
  <p class="contact">${contactBits.join('<span class="sep">|</span>')}</p>
  <p class="reloc">${esc(profile.relocation)}</p>
</header>

<h2>Professional Summary</h2>
<p class="summary">${esc(profile.summary)}</p>

<h2>Technical Skills</h2>
${skills}

<h2>Professional Experience</h2>
${jobs}

<h2>Awards &amp; Recognition</h2>
<ul>${awards}</ul>

<div class="two">
  <div><h2>Certifications</h2><ul>${certs}</ul></div>
  <div class="edu"><h2>Education</h2>${edu}</div>
</div>
</body></html>`;

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) throw new Error('Chrome/Edge not found. Set CHROME_PATH to its executable.');

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
await writeFile(out, pdf);
if (process.env.RESUME_PREVIEW) await page.screenshot({ path: process.env.RESUME_PREVIEW, fullPage: true });
await browser.close();
console.log(`Wrote ${path.relative(root, out)} (${(pdf.length / 1024).toFixed(0)} KB)`);
