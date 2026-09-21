import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { GsapService } from '../../core/services/gsap.service';

export type ButtonVariant = 'primary' | 'ghost' | 'icon';

type QuickTo = (value: number) => unknown;

/**
 * One button API, three looks (Plan.md §2.4):
 *  - primary: gradient pill with magnetic pull, glow and click ripple
 *  - ghost:   outlined pill that washes with gradient on hover
 *  - icon:    circular glass button; the arrow tilts from → to ↗ on hover
 *
 * Renders a real <a> (when `href` is set) or <button>, so Enter/Space and
 * focus behave natively. Motion is disabled under prefers-reduced-motion.
 */
@Component({
  selector: 'app-button',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  host: { '[class]': '"app-button app-button--" + variant() + (block() ? " app-button--block" : "")' },
})
export class ButtonComponent {
  private readonly gsapSvc = inject(GsapService);

  readonly variant = input<ButtonVariant>('primary');
  readonly href = input<string>();
  readonly download = input<string | boolean>(false);
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  /** Accessible name; required for icon-only buttons. */
  readonly label = input<string>();
  /** Icon variant only: draw the built-in arrow that rotates to ↗ on hover. */
  readonly arrow = input(false);
  /** On phones, stretch to fill its cell so paired buttons share a row equally. */
  readonly block = input(false);

  protected readonly isExternal = computed(() => /^https?:\/\//.test(this.href() ?? ''));
  protected readonly downloadAttr = computed(() => {
    const d = this.download();
    return d === true ? '' : d === false ? null : d;
  });
  protected readonly magnetic = computed(() => this.variant() !== 'ghost');

  private readonly zone = viewChild<ElementRef<HTMLElement>>('zone');
  private readonly control = viewChild<ElementRef<HTMLElement>>('control');

  private moveX?: QuickTo;
  private moveY?: QuickTo;
  private gsap?: Awaited<ReturnType<GsapService['load']>>['gsap'];

  constructor() {
    afterNextRender(() => {
      if (!this.magnetic() || this.gsapSvc.prefersReducedMotion()) return;
      void this.gsapSvc.load().then(({ gsap }) => {
        const el = this.control()?.nativeElement;
        if (!el) return;
        this.gsap = gsap;
        const opts = { duration: 0.45, ease: 'power3.out' };
        this.moveX = gsap.quickTo(el, 'x', opts) as QuickTo;
        this.moveY = gsap.quickTo(el, 'y', opts) as QuickTo;
      });
    });
  }

  /** Pointer tracked only inside the wrapper, a small halo around the button. */
  protected onPointerMove(e: PointerEvent): void {
    if (!this.moveX || !this.moveY || e.pointerType === 'touch') return;
    if (this.gsapSvc.prefersReducedMotion()) return;
    const zone = this.zone()?.nativeElement;
    if (!zone) return;

    const r = zone.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    // Gentle pull, capped so the button never runs away from the pointer.
    const pull = this.variant() === 'icon' ? 0.25 : 0.22;
    const cap = (v: number, max: number) => Math.max(-max, Math.min(max, v));
    this.moveX(cap(dx * pull, 14));
    this.moveY(cap(dy * pull, 10));
  }

  protected onPointerLeave(): void {
    const el = this.control()?.nativeElement;
    if (!this.gsap || !el) return;
    this.gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  }

  protected onClick(event: MouseEvent): void {
    if (this.disabled() || this.gsapSvc.prefersReducedMotion() || this.variant() === 'icon') return;
    const el = this.control()?.nativeElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    // Keyboard-triggered clicks report detail 0 and 0,0 coordinates: ripple from the centre.
    const fromKeyboard = event.detail === 0;
    const x = fromKeyboard ? rect.width / 2 : event.clientX - rect.left;
    const y = fromKeyboard ? rect.height / 2 : event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const ripple = document.createElement('span');
    ripple.className = 'app-button__ripple';
    ripple.setAttribute('aria-hidden', 'true');
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px`;
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    el.appendChild(ripple);
  }
}
