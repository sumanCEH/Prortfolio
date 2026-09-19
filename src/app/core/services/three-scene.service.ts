import { Injectable } from '@angular/core';
import type { HeroSceneCore } from './three-scene.core';

/**
 * Thin, Angular-side wrapper around the Three.js scene. Provided per
 * component (not root) so each hero-scene owns and disposes its own instance.
 *
 * Three.js is pulled in by the dynamic import below, so it never ships in the
 * initial bundle; the browser only downloads it when the hero is about to be
 * seen and the device passes the capability check.
 */
@Injectable()
export class ThreeSceneService {
  private core?: HeroSceneCore;

  /** True when WebGL exists and the device isn't obviously too weak for it. */
  static isCapable(): boolean {
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
      if (!gl) return false;
    } catch {
      return false;
    }
    const nav = navigator as Navigator & { deviceMemory?: number };
    if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return false;
    return true;
  }

  /** Resolves to false if the scene could not be created (caller shows fallback). */
  async init(canvas: HTMLCanvasElement): Promise<boolean> {
    try {
      const { HeroSceneCore } = await import('./three-scene.core');
      this.core = new HeroSceneCore(canvas);
      return true;
    } catch (err) {
      console.warn('3D hero unavailable, using static fallback.', err);
      return false;
    }
  }

  resize(w: number, h: number): void {
    this.core?.resize(w, h);
  }

  setPointer(nx: number, ny: number): void {
    this.core?.setPointer(nx, ny);
  }

  start(): void {
    this.core?.start();
  }

  pause(): void {
    this.core?.pause();
  }

  dispose(): void {
    this.core?.dispose();
    this.core = undefined;
  }
}
