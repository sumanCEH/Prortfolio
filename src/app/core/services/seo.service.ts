import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { CV_DATA } from '../../../assets/data/cv-data';
import { environment } from '../../../environments/environment';

/**
 * Sets the page title, description, Open Graph / Twitter tags, canonical URL
 * and JSON-LD Person data, all derived from cv-data.ts. It runs during
 * prerender, so crawlers and link-preview bots see it in the static HTML.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  init(): void {
    const { profile, contact, skills, education } = CV_DATA;
    const jobTitle = profile.role.split('·')[0].trim(); // "Fullstack Java Developer"
    const title = `${profile.name} | ${jobTitle}`;
    const seniority = profile.role.split('·')[1]?.trim() ?? '';
    const description =
      `${profile.name} is a ${jobTitle} and ${seniority} at ${profile.company}, building reliable, ` +
      `cloud-native backend systems with ${CV_DATA.orbitTech.slice(0, 5).join(', ')}.`;
    const base = environment.siteUrl.replace(/\/$/, '');
    const url = `${base}/`;
    // TODO: Suman should replace this placeholder with a real social-share image.
    const image = `${base}/assets/images/og-image.png`;

    this.title.setTitle(title);
    this.tag({ name: 'description', content: description });
    this.tag({ name: 'robots', content: 'index, follow' });
    this.tag({ name: 'author', content: profile.name });

    // Open Graph
    this.tag({ property: 'og:type', content: 'website' });
    this.tag({ property: 'og:site_name', content: profile.name });
    this.tag({ property: 'og:title', content: title });
    this.tag({ property: 'og:description', content: description });
    this.tag({ property: 'og:url', content: url });
    this.tag({ property: 'og:image', content: image });
    this.tag({ property: 'og:image:width', content: '1200' });
    this.tag({ property: 'og:image:height', content: '630' });
    this.tag({ property: 'og:image:alt', content: `${profile.name}, ${jobTitle}` });

    // Twitter Card
    this.tag({ name: 'twitter:card', content: 'summary_large_image' });
    this.tag({ name: 'twitter:title', content: title });
    this.tag({ name: 'twitter:description', content: description });
    this.tag({ name: 'twitter:image', content: image });

    this.setCanonical(url);

    const sameAs = [contact.linkedin, contact.github].filter(Boolean);
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      url,
      image,
      jobTitle,
      description: profile.valueProposition,
      worksFor: { '@type': 'Organization', name: profile.company },
      alumniOf: education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
      knowsAbout: skills.flatMap((g) => g.items),
      homeLocation: { '@type': 'Place', name: profile.location },
      ...(sameAs.length ? { sameAs } : {}),
    });
  }

  /** Adds or updates one <meta> tag, so repeated calls never duplicate it. */
  private tag(def: { name?: string; property?: string; content: string }): void {
    const selector = def.name ? `name="${def.name}"` : `property="${def.property}"`;
    this.meta.updateTag(def, selector);
  }

  private setCanonical(href: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setJsonLd(data: object): void {
    let script = this.doc.head.querySelector<HTMLScriptElement>('script#person-jsonld');
    if (!script) {
      script = this.doc.createElement('script');
      script.id = 'person-jsonld';
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    // Escape "<" so no value can ever close the script tag early.
    script.textContent = JSON.stringify(data).replace(/</g, '\u003c');
  }
}
