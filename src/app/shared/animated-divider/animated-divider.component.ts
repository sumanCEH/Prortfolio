import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { GsapBundle, GsapService } from '../../core/services/gsap.service';

let nextId = 0;

type GsapContext = ReturnType<GsapBundle['gsap']['context']>;

/** Gradient line that draws itself once, when first scrolled into view. */
@Component({
  selector: 'app-animated-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './animated-divider.component.html',
  styleUrl: './animated-divider.component.scss',
})
export class AnimatedDividerComponent {
  /** Unique per instance so multiple dividers never share a duplicate DOM id. */
  protected readonly gradId = `divider-grad-${nextId++}`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly path = viewChild.required<ElementRef<SVGPathElement>>('path');

  constructor() {
    afterNextRender(() => {
      // Reduced motion: leave the line fully drawn, no animation at all.
      if (this.motion.prefersReducedMotion()) return;

      let ctx: GsapContext | undefined;
      let destroyed = false;

      void this.motion.load().then(({ gsap }) => {
        if (destroyed) return;
        const path = this.path().nativeElement;
        ctx = gsap.context(() => {
          // pathLength="1" on the SVG path normalises the dash math to 0..1.
          gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: { trigger: this.host.nativeElement, start: 'top 88%', once: true },
          });
        }, this.host.nativeElement);
      });

      this.destroyRef.onDestroy(() => {
        destroyed = true;
        ctx?.revert();
      });
    });
  }
}
