import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CV_DATA } from '../../../assets/data/cv-data';
import { GsapService } from '../../core/services/gsap.service';
import { ExperienceComponent } from './experience.component';

function setup() {
  TestBed.configureTestingModule({
    imports: [ExperienceComponent],
    // Reduced motion, so the reveal directive never loads GSAP in the test environment.
    providers: [{ provide: GsapService, useValue: { prefersReducedMotion: () => true, load: vi.fn() } }],
  });
  const fixture = TestBed.createComponent(ExperienceComponent);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('ExperienceComponent', () => {
  it('renders every bullet of every job, so desktop and search engines see all of them', () => {
    const { el } = setup();
    const rendered = el.querySelectorAll('.entry__bullets li').length;
    const expected = CV_DATA.experience.reduce((n, j) => n + j.bullets.length, 0);
    expect(rendered).toBe(expected);
  });

  it('marks bullets past the collapsed limit so phones can hide them', () => {
    const { el } = setup();
    const first = el.querySelector('.entry')!;
    const items = [...first.querySelectorAll('.entry__bullets li')];
    expect(items.slice(0, 4).every((li) => !li.classList.contains('is-extra'))).toBe(true);
    expect(items.slice(4).every((li) => li.classList.contains('is-extra'))).toBe(true);
  });

  it('toggles a job open and closed, updating aria-expanded and the label', () => {
    const { fixture, el } = setup();
    const entry = el.querySelector('.entry')!;
    const toggle = entry.querySelector<HTMLButtonElement>('.entry__toggle')!;
    const extra = CV_DATA.experience[0].bullets.length - 4;

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.textContent?.trim()).toBe(`Show ${extra} more`);
    expect(toggle.getAttribute('aria-controls')).toBe(entry.querySelector('.entry__bullets')!.id);

    toggle.click();
    fixture.detectChanges();
    expect(entry.classList.contains('is-open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.textContent?.trim()).toBe('Show less');

    toggle.click();
    fixture.detectChanges();
    expect(entry.classList.contains('is-open')).toBe(false);
  });

  it('shows no toggle for a job with few bullets', () => {
    const { el } = setup();
    const shortJob = CV_DATA.experience.findIndex((j) => j.bullets.length <= 4);
    expect(shortJob).toBeGreaterThanOrEqual(0);
    expect(el.querySelectorAll('.entry')[shortJob].querySelector('.entry__toggle')).toBeNull();
  });
});
