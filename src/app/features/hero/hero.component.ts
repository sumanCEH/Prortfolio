import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
} from '@angular/core';
import { GsapBundle, GsapService } from '../../core/services/gsap.service';
import { CV_DATA } from '../../../assets/data/cv-data';
import { ButtonComponent } from '../../shared/ui-button/button.component';
import { HeroSceneComponent } from './hero-scene/hero-scene.component';

type GsapContext = ReturnType<GsapBundle['gsap']['context']>;

@Component({
  selector: 'app-hero',
  imports: [ButtonComponent, HeroSceneComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly profile = CV_DATA.profile;
  /** Photo layout is enabled by setting profile.photoUrl in cv-data.ts. */
  protected readonly photoUrl = CV_DATA.profile.photoUrl;
  protected readonly firstName = CV_DATA.profile.name.split(' ')[0];
  protected readonly lastName = CV_DATA.profile.name.split(' ').slice(1).join(' ');
  /** "Fullstack Java Developer · Senior Associate Consultant" split into its parts, so phones can stack them. */
  protected readonly roleParts = CV_DATA.profile.role.split(' · ');

  constructor() {
    // Subtle parallax: the background glows drift slower than the page scrolls.
    // Transform-only and clipped by the hero's overflow, so no layout shift.
    afterNextRender(() => {
      if (this.motion.prefersReducedMotion()) return;

      let ctx: GsapContext | undefined;
      let destroyed = false;
      const hero = this.host.nativeElement;

      void this.motion.load().then(({ gsap }) => {
        if (destroyed) return;
        ctx = gsap.context(() => {
          hero.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
            const factor = Number(el.dataset['parallax'] ?? 0);
            gsap.to(el, {
              // Capped at 160px however tall the viewport is.
              y: () => Math.min(hero.offsetHeight * factor, 160),
              ease: 'none',
              scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
          });
        }, hero);
      });

      this.destroyRef.onDestroy(() => {
        destroyed = true;
        ctx?.revert(); // kills every tween + ScrollTrigger created above
      });
    });
  }
}
