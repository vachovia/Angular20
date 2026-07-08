import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

/**
 * Functional HTTP interceptor (Angular's modern DI-free interceptor style).
 * Registered in app.config via `withInterceptors([...])`.
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = performance.now();
  return next(req).pipe(
    tap({
      complete: () =>
        console.debug(`[HTTP] ${req.method} ${req.url} — ${Math.round(performance.now() - started)}ms`),
    }),
  );
};
