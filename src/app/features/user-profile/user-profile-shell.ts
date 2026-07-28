import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { User } from '../../core/user.resolver';

/**
 * PARENT of the `user-profile/:id` route tree — the "shell".
 *
 * Nothing here fetches: `userResolver` ran before this component existed, and
 * `withComponentInputBinding()` assigned `route.data.user` to the `user` input
 * below (matched by NAME — rename the input and it silently stays empty).
 *
 * Watch the console while clicking the two tabs: the logging interceptor prints
 * no new request. Switching children doesn't change `:id`, so the parent route
 * is reused and its resolver does NOT re-run (default `runGuardsAndResolvers:
 * 'paramsChange'`). Hit Prev/Next and it re-runs — one fetch, three consumers.
 */
@Component({
  selector: 'app-user-profile-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <section class="page">
      <p><a routerLink="/users-rx">← Back to users</a></p>

      <header class="card">
        <h1>{{ user().name }}</h1>
        <p class="muted">&#64;{{ user().username }} · {{ user().company.catchPhrase }}</p>
      </header>

      <nav class="pager">
        @if (user().id > 1) {
          <a [routerLink]="['/user-profile', user().id - 1]">‹ Prev user</a>
        }
        <span class="muted">user #{{ user().id }}</span>
        <a [routerLink]="['/user-profile', user().id + 1]">Next user ›</a>
      </nav>

      <!-- Relative links: resolved against THIS component's route (user-profile/:id). -->
      <nav class="tabs">
        <a routerLink="overview" routerLinkActive="active">Overview</a>
        <a routerLink="posts" routerLinkActive="active">Posts</a>
      </nav>

      <router-outlet />
    </section>
  `,
  styles: `
    .page { max-width: 640px; }
    .muted { color: #6b7280; }
    .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; }
    .card h1 { margin: 0 0 0.25rem; }
    .pager { display: flex; align-items: center; gap: 1rem; margin: 1rem 0; }
    .pager a, .page > p a { color: #4f46e5; text-decoration: none; }
    .tabs { display: flex; gap: 0.4rem; margin: 1rem 0; border-bottom: 1px solid #e5e7eb; }
    .tabs a {
      padding: 0.5rem 0.9rem; text-decoration: none; color: #6b7280;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
    }
    .tabs a.active { color: #4f46e5; border-bottom-color: #4f46e5; font-weight: 600; }
  `,
})
export class UserProfileShell {
  // Filled from the parent route's resolved data. Safe as `required` because the
  // router cannot activate this route until the resolver has produced a value.
  readonly user = input.required<User>();
}
