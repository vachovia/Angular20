import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  // provideZoneChangeDetection, // ← previous (Zone-based) approach, see note below
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { loggingInterceptor } from './core/logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // --- Change detection: ZONELESS (current approach) ---
    // No zone.js (removed from angular.json polyfills → smaller bundle, no
    // monkey-patching of async APIs). Angular schedules CD off signal writes,
    // template events, async pipe, router, forms and HttpClient. Works here
    // because every component is OnPush + signal-driven.
    provideZonelessChangeDetection(),

    // --- Previous approach, kept for comparison (Zone-based) ---
    // Advantage of zoneless over this: smaller bundle, better perf, no zone
    // patching. Advantage of Zone: works even with imperative (non-signal)
    // state mutations, so it's the safer default for legacy/mixed code.
    // provideZoneChangeDetection({ eventCoalescing: true }),

    // `withComponentInputBinding()` binds route params/query/data straight
    // into signal `input()`s on the routed component — no ActivatedRoute needed.
    provideRouter(routes, withComponentInputBinding()),

    // Modern HttpClient: fetch backend + a functional interceptor.
    provideHttpClient(withFetch(), withInterceptors([loggingInterceptor])),
  ],
};
