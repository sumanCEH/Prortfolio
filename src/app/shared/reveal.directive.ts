import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { GsapBundle, GsapService } from '../core/services/gsap.service';

type GsapContext = ReturnType<GsapBundle['gsap']['context']>;

/**
 * Fades and slides an element up ONCE the first time it crosses ~80% of the
 * viewport height. `once: true` means scrolling back never replays it.
 * Under prefers-reduced-motion nothing is touched, so content just appears.
 *
 * All GSAP work lives in a gsap.context that is reverted on destroy, which
 * kills the tween and its ScrollTrigger (no leaks or duplicate triggers).
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  readonly revealDelay = input(0);
  readonly revealY = input(32);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(GsapService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (motion.prefersReducedMotion()) return;

      let ctx: GsapContext | undefined;
      let destroyed = false;

      void motion.load().then(({ gsap }) => {
        if (destroyed) return;
        ctx = gsap.context(() => {
          gsap.from(el, {
            opacity: 0,
            y: this.revealY(),
            duration: 0.8,
            delay: this.revealDelay(),
            ease: 'power3.out',
            clearProps: 'opacity,transform',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          });
        }, el);
      });

      destroyRef.onDestroy(() => {
        destroyed = true;
        ctx?.revert();
      });
    });
  }
}
