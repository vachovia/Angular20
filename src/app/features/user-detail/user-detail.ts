import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string };
}

/**
 * Route-param demo for `withComponentInputBinding()` (see app.config.ts).
 *
 * The route is `users/:id`. Because component input binding is enabled, the
 * `:id` path segment is bound straight into the `id` input() below — no
 * ActivatedRoute, no params subscription. `numberAttribute` coerces the string
 * segment ("5") to a number as it binds.
 *
 * `id` is a signal, so wiring it into rxResource's `params` means navigating
 * from /users/5 to /users/6 AUTO-REFETCHES the detail — the router just updates
 * the input, the resource reacts.
 */
@Component({
  selector: 'app-user-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <p><a routerLink="/users-rx">← Back to users</a></p>

      <nav class="pager">
        @if (id() > 1) {
          <a [routerLink]="['/users', id() - 1]">‹ Prev</a>
        }
        <span class="muted">user #{{ id() }}</span>
        <a [routerLink]="['/users', id() + 1]">Next ›</a>
      </nav>

      @if (user.isLoading()) {
        <p class="muted">Loading user #{{ id() }}…</p>
      } @else if (user.error()) {
        <p class="error">Couldn't load user #{{ id() }}.</p>
      } @else if (user.value(); as u) {
        <article class="card">
          <h1>{{ u.name }}</h1>
          <p class="muted">{{ u.company.catchPhrase }}</p>
          <dl>
            <dt>Email</dt><dd>{{ u.email }}</dd>
            <dt>Phone</dt><dd>{{ u.phone }}</dd>
            <dt>Website</dt><dd>{{ u.website }}</dd>
            <dt>Company</dt><dd>{{ u.company.name }}</dd>
          </dl>
        </article>
      }
    </section>
  `,
  styles: `
    .pager { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .pager a { color: #4f46e5; text-decoration: none; }
    .muted { color: #6b7280; }
    .error { color: #dc2626; }
    .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; max-width: 480px; }
    .card h1 { margin: 0 0 0.25rem; }
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.35rem 1rem; margin: 1rem 0 0; }
    dt { color: #6b7280; }
    dd { margin: 0; }
  `,
})
export class UserDetail {
  private readonly http = inject(HttpClient);

  // Bound from the `:id` route segment by withComponentInputBinding().
  // numberAttribute coerces the "5" string → number 5.
  readonly id = input.required({ transform: numberAttribute });

  // Refetches automatically whenever id() changes (i.e. on navigation).
  protected readonly user = rxResource<User, number>({
    params: () => this.id(),
    stream: ({ params }) =>
      this.http.get<User>(`https://jsonplaceholder.typicode.com/users/${params}`),
  });
}
