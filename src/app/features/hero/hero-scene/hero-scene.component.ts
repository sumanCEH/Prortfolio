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
import { TraceScene } from '../../../core/services/trace-scene';

interface LogLine {
  service: string;
  message: string;
  ms: string;
}

/** Steps 1..5 match the services the request reaches; step 6 is the response. */
const LOG: LogLine[] = [
  { service: 'gateway', message: 'route matched · rate ok', ms: '3ms' },
  { service: 'auth', message: 'JWT valid · role USER', ms: '6ms' },
  { service: 'orders', message: 'payload validated', ms: '9ms' },
  { service: 'kafka', message: 'order.created published', ms: '7ms' },
  { service: 'postgres', message: 'transaction committed', ms: '13ms' },
];

/**
 * Owns the hero <canvas>: a live "request trace" through a Java microservice stack, drawn with
 * Canvas 2D (no WebGL, no extra download). Paused while offscreen or in a hidden tab. Reduced
 * motion gets one finished still frame instead of an animation.
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
  /** How far the current request has got: -1 = idle, 0 = sent, 1..5 = services, 6 = response. */
  protected readonly step = signal(-1);
  protected readonly live = signal(false);
  /** The log card only fits when the scene is wide (not on phones, short laptop screens or the photo layout). */
  protected readonly showLog = signal(false);

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    const hostEl = this.host.nativeElement;
    let scene: TraceScene;
    try {
      scene = new TraceScene(this.canvas().nativeElement, (s) => this.step.set(s));
    } catch {
      return; // no canvas support: the CSS dot grid stays as the backdrop
    }

    let inView = true;
    const reduced = () => this.motion.prefersReducedMotion();

    const sync = () => {
      if (reduced()) {
        scene.pause();
        scene.renderStatic();
        this.step.set(6);
      } else if (inView && !document.hidden) scene.start();
      else scene.pause();
    };

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      scene.resize(width, height);
      this.showLog.set(width >= 900 && height >= 640 && width / height >= 1.05);
    });
    ro.observe(hostEl);

    const r = hostEl.getBoundingClientRect();
    scene.resize(r.width, r.height);
    this.showLog.set(r.width >= 900 && r.height >= 640 && r.width / r.height >= 1.05);
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
      if (!inView) return;
      const b = hostEl.getBoundingClientRect();
      scene.setPointer(e.clientX - b.left, e.clientY - b.top);
    };
    const onLeave = () => scene.setPointer(null);

    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    document.addEventListener('visibilitychange', sync);
    mq.addEventListener('change', sync);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    // Text metrics change when the web fonts arrive, so measure the chips again.
    void document.fonts?.ready.then(() => scene.relayout());

    sync();

    this.destroyRef.onDestroy(() => {
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', sync);
      mq.removeEventListener('change', sync);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      scene.dispose();
    });
  }
}
