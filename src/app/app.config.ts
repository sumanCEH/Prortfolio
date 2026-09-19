import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Zoneless: change detection is driven by signals/events, no zone.js overhead
    // during heavy animation and WebGL frames.
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // Reuse the prerendered DOM instead of rebuilding it, and replay early clicks.
    provideClientHydration(withEventReplay()),
  ],
};
