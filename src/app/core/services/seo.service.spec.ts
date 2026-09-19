import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { CV_DATA } from '../../../assets/data/cv-data';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  it('sets title, description and a Person JSON-LD block from cv-data', () => {
    const svc = TestBed.inject(SeoService);
    svc.init();
    svc.init(); // idempotent: must not duplicate tags

    const doc = TestBed.inject(DOCUMENT);
    expect(TestBed.inject(Title).getTitle()).toContain(CV_DATA.profile.name);
    expect(doc.querySelectorAll('meta[name="description"]').length).toBe(1);
    expect(doc.querySelectorAll('script#person-jsonld').length).toBe(1);

    const ld = JSON.parse(doc.querySelector('script#person-jsonld')!.textContent!);
    expect(ld['@type']).toBe('Person');
    expect(ld.name).toBe(CV_DATA.profile.name);
    expect(ld.worksFor.name).toBe(CV_DATA.profile.company);
  });
});
