import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { delay } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
  company: { name: string };
}

/**
 * `rxResource` twin of the `Users` component (which uses `httpResource`).
 * Same screen, same states — built to compare the two async-data APIs.
 *
 *   Users (users.ts)                   UsersRx (this file)
 *   ─────────────────────────          ───────────────────────────
 *   httpResource<User[]>(() => url)    rxResource({ params, stream })
 *   URL string is the request          params() returns the reactive request
 *   built-in HttpClient GET            stream() runs any Observable (HttpClient here)
 *   .value()/.isLoading()/.error()     IDENTICAL — same ResourceRef API
 *   .reload()                          IDENTICAL
 *
 * Both expose the SAME resource signals (`value`, `isLoading`, `error`,
 * `status`, `hasValue`, `reload`). The only difference is how you describe the
 * fetch: `httpResource` takes a URL/request object; `rxResource` takes an
 * Observable via `stream`, so you can use HttpClient, interceptors, RxJS
 * operators, or any other stream.
 *
 * The `limit` selector below drives `params`, demonstrating rxResource's
 * headline feature: change a signal the request depends on and it AUTO-REFETCHES
 * (cancelling any in-flight request via the abort signal). A 600ms delay is
 * added so `isLoading()` is visible.
 */
@Component({
  selector: 'app-users-rx',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section>
      <h1>Users <span class="tag">rxResource</span></h1>
      <p class="lead">
        Live data via <code>rxResource</code> — an Observable (HttpClient) mapped
        to a signal. Compare with <code>/users</code> (<code>httpResource</code>).
      </p>

      <div class="controls">
        <label>
          Show:
          <select [value]="limit()" (change)="setLimit($event)">
            @for (n of limits; track n) {
              <option [value]="n">{{ n }}</option>
            }
          </select>
        </label>
        <button (click)="users.reload()" [disabled]="users.isLoading()">Reload</button>
        <button type="button" class="danger" [class.on]="broken()" (click)="toggleBroken()">
          {{ broken() ? 'Use good URL' : 'Break URL' }}
        </button>
        <span class="status">status: <code>{{ users.status() }}</code></span>
      </div>

      @if (users.isLoading()) {
        <p class="muted">Loading… (isLoading() === true)</p>
      } @else if (users.error()) {
        <p class="error">
          Failed to load users — <code>error()</code> is set.
          <small>{{ errorMessage() }}</small>
        </p>
      } @else {
        <ul class="grid">
          @for (u of users.value(); track u.id) {
            <li class="card">
              <a [routerLink]="['/users', u.id]"><strong>{{ u.name }}</strong></a>
              <span class="muted">{{ u.email }}</span>
              <em>{{ u.company.name }}</em>
            </li>
          } @empty {
            <li class="muted">No users.</li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .tag { font-size: 0.7rem; background: #0ea5e9; color: #fff; padding: 2px 8px; border-radius: 999px; vertical-align: middle; }
    .lead { color: #6b7280; }
    .controls { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .controls select { padding: 0.35rem 0.5rem; border-radius: 8px; border: 1px solid #d1d5db; }
    .status { color: #6b7280; font-size: 0.85rem; }
    button { padding: 0.45rem 0.9rem; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .grid { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
    .card { display: flex; flex-direction: column; gap: 0.2rem; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.85rem; }
    .card a { color: #111827; text-decoration: none; }
    .card a:hover { color: #4f46e5; text-decoration: underline; }
    .muted { color: #6b7280; font-size: 0.85rem; }
    .error { color: #dc2626; display: flex; flex-direction: column; gap: 0.15rem; }
    .error small { color: #9ca3af; font-weight: normal; }
    .danger.on { background: #dc2626; color: #fff; border-color: #dc2626; }
    em { color: #4f46e5; font-size: 0.8rem; }
  `,
})
export class UsersRx {
  private readonly http = inject(HttpClient);

  // Signals the request depends on. Changing either re-runs the resource.
  protected readonly limit = signal(5);
  protected readonly limits = [3, 5, 10] as const;
  protected readonly broken = signal(false); // toggles a bad URL to force error()

  protected readonly users = rxResource<User[], { limit: number; broken: boolean }>({
    // params: the reactive request. Reads both signals → rxResource tracks them.
    // params: () => this.limit(),
    params: () => ({ limit: this.limit(), broken: this.broken() }),

    // stream: given the current params, return an Observable of the value.
    // When any param changes, the previous request is aborted and this re-runs.
    stream: ({ params }) => {
      // A non-existent host → the HttpClient request rejects → resource.error().
      const host = params.broken
        ? 'https://jsonplaceholder.invalid-domain-xyz.test'
        : 'https://jsonplaceholder.typicode.com';
      return this.http
        .get<User[]>(`${host}/users?_limit=${params.limit}`)
        .pipe(delay(600)); // artificial latency so isLoading() is observable
    },

    defaultValue: [], // value() before the first response (instead of undefined)
  });

  // error() holds whatever the stream threw (an HttpErrorResponse here). It's a
  // signal, so this computed re-derives a readable message whenever it changes.
  protected readonly errorMessage = computed(() => {
    const err = this.users.error();
    return err instanceof Error ? err.message : String(err ?? '');
  });

  protected setLimit(event: Event): void {
    this.limit.set(Number((event.target as HTMLSelectElement).value));
  }

  protected toggleBroken(): void {
    this.broken.update((b) => !b);
  }
}
