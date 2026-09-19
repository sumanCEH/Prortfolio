import { describe, expect, it } from 'vitest';
import { CV_DATA } from './cv-data';

describe('CV_DATA', () => {
  it('has unique project ids', () => {
    const ids = CV_DATA.projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has dialable phone numbers and a digits-only WhatsApp number', () => {
    for (const p of CV_DATA.contact.phones) expect(p.replace(/[^\d]/g, '')).toMatch(/^91\d{10}$/);
    expect(CV_DATA.contact.whatsapp).toMatch(/^\d{11,15}$/);
  });

  it('lists only certifications that have a credential link', () => {
    for (const c of CV_DATA.certifications) expect(c.url).toContain('linkedin.com');
  });

  it('lists every orbit chip in the skills groups', () => {
    const all = CV_DATA.skills.flatMap((g) => g.items);
    for (const tech of CV_DATA.orbitTech) {
      expect(all.some((item) => item.includes(tech))).toBe(true);
    }
  });

  it('never names the automotive client directly', () => {
    expect(JSON.stringify(CV_DATA)).not.toMatch(/mercedes/i);
  });

  it('gives every diagram node a label', () => {
    for (const p of CV_DATA.projects) {
      for (const n of p.diagram ?? []) expect(n.label.length).toBeGreaterThan(0);
    }
  });
});
