import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TaskStore } from './task-store';

/**
 * Functional route guard (replaces the old class-based CanActivate).
 * Uses `inject()` to grab dependencies inside the function body.
 * Demo rule: the /stats page is only reachable once at least one task exists.
 */
export const hasTasksGuard: CanActivateFn = () => {
  const store = inject(TaskStore);
  const router = inject(Router);
  return store.total() > 0 ? true : router.createUrlTree(['/tasks']);
};
