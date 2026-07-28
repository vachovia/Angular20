import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResolveFn } from '@angular/router';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string };
}

/**
 * Functional resolver attached to the PARENT route `user-profile/:id`.
 * Unlike `tipResolver` (a synchronous value), this one is async: the router
 * blocks the navigation until the HTTP response arrives, so the shell and its
 * children are created with the user already in hand.
 *
 * `inject()` works here because a ResolveFn runs inside an injection context —
 * the main practical win over the old class-based `Resolve<T>`.
 *
 * The resolved value lands in `route.data.user`, and `paramsInheritanceStrategy:
 * 'always'` (app.config.ts) lets the CHILD routes see it too, so one fetch feeds
 * three components.
 */
export const userResolver: ResolveFn<User> = (route) =>
  inject(HttpClient).get<User>(
    `https://jsonplaceholder.typicode.com/users/${route.paramMap.get('id')}`,
  );

// Real-world variant: catch the error and bail out of the navigation instead of
// activating a broken page — the reason to prefer a resolver over in-component
// fetching. Requires `inject(Router)` + `catchError(() => of(router.createUrlTree(['/users'])))`,
// and returning a UrlTree from a resolver redirects (Angular 15+).
