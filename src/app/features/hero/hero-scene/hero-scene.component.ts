import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { GsapService } from '../../../core/services/gsap.service';
import { TRACE_SERVICES, runTraceSequence } from '../../../core/services/trace-sequence';
import { TraceScene } from '../../../core/services/trace-scene';

interface LogLine {
  service: string;
  message: string;
  ms: string;
}

interface RailRow extends LogLine {
  name: string;
  color: string;
}

/** Steps 1..5 match the services the request reaches; step 6 is the response. */
const LOG: LogLine[] = [
  { service: 'gateway', message: 'route matched · rate ok', ms: '3ms' },
  { service: 'auth', message: 'JWT valid · role USER', ms: '6ms' },
  { service: 'orders', message: 'payload validated', ms: '9ms' },
  { service: 'kafka', message: 'order.created published', ms: '7ms' },
  { service: 'postgres', message: 'transaction committed', ms: '13ms' },
];

/** The phone timeline: same request, laid out as a vertical rail with readable type. */
const RAIL: RailRow[] = [
  { ...LOG[0], name: 'API Gateway', color: '#5b8cff' },
  { ...LOG[1], name: 'Auth Service', color: '#9b7bff' },
  { ...LOG[2], name: 'Order Service', color: '#2dd4bf' },
  { ...LOG[3], name: 'Kafka', color: '#ffb454' },
  { ...LOG[4], name: 'PostgreSQL', color: '#7aa2ff' },
];

/**
 * The hero visual: a live "request trace" through a Java microservice stack.
 *  - Wide screens: a Canvas 2D graph over a pointer-reactive dot grid, plus a log card.
 *  - Phones and small tablets: a vertical timeline card. Pure HTML/CSS, driven by a tiny timer
 *    (no canvas), because a shrunken graph turns into unreadable chips on a phone.
 * Only the active one runs. Both pause offscreen and in a hidden tab, and reduced motion gets
 * one finished still frame.
 */
@Component({
  selector: 'app-hero-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-scene.component.html',
  styleUrl: './hero-scene.component.scss',
})
export class HeroSceneComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly motion = inject(GsapService);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly log = LOG;
  protected readonly rail = RAIL;
  /** How far the current request has got: -1 = idle, 0 = sent, 1..5 = services, 6 = response. */
  protected readonly step = signal(-1);
  /** Which row the timeline's glowing packet sits at (0 = above the first row). */
  protected readonly pos = signal(0);
  protected readonly live = signal(false);
  /** The log card only fits when the scene is wide (not on phones, short laptop screens or the photo layout). */
  protected readonly showLog = signal(false);

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    const hostEl = this.host.nativeElement;
    let scene: TraceScene | undefined;
    try {
      scene = new TraceScene(this.canvas().nativeElement, (s) => this.step.set(s));
    } catch {
      // No canvas support: the CSS dot grid stays as the backdrop on wide screens.
    }

    // The phone timeline replaces the canvas below 900px, except in the small corner-accent layout.
    const narrowMq = matchMedia('(max-width: 899.98px)');
    const useRail = () => narrowMq.matches && !hostEl.closest('.hero--photo');

    let inView = true;
    let stopSequence: (() => void) | undefined;
    const reduced = () => this.motion.prefersReducedMotion();

    const stopRail = () => {
      stopSequence?.();
      stopSequence = undefined;
    };

    const sync = () => {
      if (reduced()) {
        scene?.pause();
        stopRail();
        scene?.renderStatic();
        this.step.set(TRACE_SERVICES + 1);
        this.pos.set(TRACE_SERVICES);
      } else if (!inView || document.hidden) {
        scene?.pause();
        stopRail();
      } else if (useRail()) {
        scene?.pause();
        stopSequence ??= runTraceSequence((s) => {
          this.step.set(s.step);
          this.pos.set(s.pos);
        });
      } else {
        stopRail();
        scene?.start();
      }
    };

    const measure = (width: number, height: number) => {
      if (useRail()) return;
      scene?.resize(width, height);
      this.showLog.set(width >= 900 && height >= 640 && width / height >= 1.05);
    };

    const ro = new ResizeObserver(([entry]) => {
      measure(entry.contentRect.width, entry.contentRect.height);
    });
    ro.observe(hostEl);

    const r = hostEl.getBoundingClientRect();
    measure(r.width, r.height);
    this.live.set(true);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { rootMargin: '100px' },
    );
    io.observe(hostEl);

    const onPointer = (e: PointerEvent) => {
      if (!inView || !scene) return;
      const b = hostEl.getBoundingClientRect();
      scene.setPointer(e.clientX - b.left, e.clientY - b.top);
    };
    const onLeave = () => scene?.setPointer(null);

    // Crossing the 900px line (rotating a tablet, resizing a window) swaps which visual runs.
    const onBreakpoint = () => {
      const b = hostEl.getBoundingClientRect();
      measure(b.width, b.height);
      sync();
    };

    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    document.addEventListener('visibilitychange', sync);
    mq.addEventListener('change', sync);
    narrowMq.addEventListener('change', onBreakpoint);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    // Text metrics change when the web fonts arrive, so measure the chips again.
    void document.fonts?.ready.then(() => scene?.relayout());

    sync();

    this.destroyRef.onDestroy(() => {
      io.disconnect();
      ro.disconnect();
      stopRail();
      document.removeEventListener('visibilitychange', sync);
      mq.removeEventListener('change', sync);
      narrowMq.removeEventListener('change', onBreakpoint);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      scene?.dispose();
    });
  }
}
