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
import { ThreeSceneService } from '../../../core/services/three-scene.service';

/** Delay after window load before Three.js is fetched, keeping first paint and interactivity fast. */
const START_DELAY_MS = 1800;

interface Pt {
  x: number;
  y: number;
}

/**
 * Owns the hero <canvas>. Three.js is lazy-loaded the first time the hero is
 * about to enter view. If the user prefers reduced motion, WebGL is missing,
 * or the device looks too weak, a static SVG/gradient version stays instead.
 */
@Component({
  selector: 'app-hero-scene',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ThreeSceneService],
  templateUrl: './hero-scene.component.html',
  styleUrl: './hero-scene.component.scss',
})
export class HeroSceneComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly three = inject(ThreeSceneService);
  private readonly motion = inject(GsapService);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  /** 'loading' → static art visible; 'live' → canvas is rendering; 'static' → stay static. */
  protected readonly mode = signal<'loading' | 'live' | 'static'>('loading');

  // Static fallback art: hub + 8 outer nodes in a 100x100 viewBox.
  protected readonly hub: Pt = { x: 50, y: 50 };
  protected readonly outer: Pt[] = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    const r = 30 + (i % 2) * 7;
    return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
  });

  constructor() {
    afterNextRender(() => {
      if (this.motion.prefersReducedMotion() || !ThreeSceneService.isCapable()) {
        this.mode.set('static');
        return;
      }
      this.setup();
    });
  }

  private setup(): void {
    const hostEl = this.host.nativeElement;
    let inView = false;
    let started = false;
    let initStarted = false;
    let disposed = false;

    const sync = () => {
      if (!started) return;
      // Pause the loop whenever the canvas is offscreen or the tab is hidden.
      if (inView && !document.hidden) this.three.start();
      else this.three.pause();
    };

    const onPointer = (e: PointerEvent) => {
      if (!inView) return;
      this.three.setPointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
    };

    const boot = async () => {
      if (initStarted) return;
      initStarted = true;
      const ok = await this.three.init(this.canvas().nativeElement);
      if (disposed) {
        this.three.dispose();
        return;
      }
      if (!ok) {
        this.mode.set('static');
        return;
      }
      const r = hostEl.getBoundingClientRect();
      this.three.resize(r.width, r.height);
      started = true;
      this.mode.set('live');
      sync();
    };

    // The 3D scene is decorative, so it starts only after the page has loaded and
    // settled. The static art is already showing; the canvas then fades in.
    let bootTimer: ReturnType<typeof setTimeout> | undefined;
    let loadListener: (() => void) | undefined;
    const scheduleBoot = () => {
      const kickOff = () => {
        bootTimer = setTimeout(() => {
          const idle = (window as Window & { requestIdleCallback?: typeof requestIdleCallback })
            .requestIdleCallback;
          if (idle) idle(() => void boot(), { timeout: 1500 });
          else void boot();
        }, START_DELAY_MS);
      };
      if (document.readyState === 'complete') kickOff();
      else {
        loadListener = kickOff;
        window.addEventListener('load', kickOff, { once: true });
      }
    };

    let scheduled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !scheduled) {
          scheduled = true;
          scheduleBoot();
        }
        sync();
      },
      { rootMargin: '200px' },
    );
    io.observe(hostEl);

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (started) this.three.resize(width, height);
    });
    ro.observe(hostEl);

    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      if (mq.matches) {
        this.three.pause();
        this.mode.set('static');
      }
    };
    mq.addEventListener('change', onMotionChange);

    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pointermove', onPointer, { passive: true });

    this.destroyRef.onDestroy(() => {
      disposed = true;
      io.disconnect();
      ro.disconnect();
      clearTimeout(bootTimer);
      if (loadListener) window.removeEventListener('load', loadListener);
      mq.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pointermove', onPointer);
      this.three.dispose();
    });
  }
}
