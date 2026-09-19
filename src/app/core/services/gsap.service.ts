import { Injectable } from '@angular/core';

type GsapModule = typeof import('gsap');
type ScrollTriggerModule = typeof import('gsap/ScrollTrigger');

export interface GsapBundle {
  gsap: GsapModule['gsap'];
  ScrollTrigger: ScrollTriggerModule['ScrollTrigger'];
}

/**
 * Loads GSAP + ScrollTrigger on demand so they stay out of the initial bundle,
 * and shares one promise so the plugin is registered exactly once.
 */
@Injectable({ providedIn: 'root' })
export class GsapService {
  private bundle?: Promise<GsapBundle>;

  load(): Promise<GsapBundle> {
    this.bundle ??= (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    })();
    return this.bundle;
  }

  /** Read at call time so it reflects the user's current OS setting. */
  prefersReducedMotion(): boolean {
    return (
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
