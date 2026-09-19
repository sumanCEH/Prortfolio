import { RenderMode, ServerRoute } from '@angular/ssr';

// Single-page site: prerender everything to static HTML at build time.
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Prerender }];
