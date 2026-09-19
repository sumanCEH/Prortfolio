import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { GsapBundle, GsapService } from '../../core/services/gsap.service';

type GsapContext = ReturnType<GsapBundle['gsap']['context']>;

/**
 * Counts from 0 up to `value` once, when first scrolled into view.
 * The template shows the final number by default (so prerendered HTML, no-JS
 * and reduced-motion users see it). Assistive tech gets the final
 * value via a hidden span instead of hearing every intermediate number.
 */
@Component({
  selector: 'app-count-up',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="num" aria-hidden="true">{{ display() ?? value() }}</span
    ><span class="suffix" aria-hidden="true">{{ suffix() }}</span
    ><span class="sr-only">{{ value() }}{{ suffix() }}</span>`,
  styles: `
    :host {
      display: inline-flex;
      align-items: baseline;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class CountUpComponent {
  readonly value = input.required<number>();
  readonly suffix = input('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(GsapService);
  private readonly destroyRef = inject(DestroyRef);
  /** Bound in the template so the prerendered HTML already contains the final number. */
  protected readonly display = signal<number | null>(null);

  constructor() {
    afterNextRender(() => {
      if (this.motion.prefersReducedMotion()) return;

      let ctx: GsapContext | undefined;
      let destroyed = false;

      void this.motion.load().then(({ gsap }) => {
        if (destroyed) return;
        const state = { v: 0 };
        this.display.set(0);
        ctx = gsap.context(() => {
          gsap.to(state, {
            v: this.value(),
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => this.display.set(Math.round(state.v)),
            scrollTrigger: { trigger: this.host.nativeElement, start: 'top 85%', once: true },
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
