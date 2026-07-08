import { ChangeDetectionStrategy, Component } from '@angular/core';
import { httpResource } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  email: string;
  company: { name: string };
}

/**
 * `httpResource` (Angular 20) — reactive async data as a signal.
 * It exposes `.value()`, `.isLoading()`, `.error()` and `.reload()`, and
 * re-fetches automatically when any signal used to build the request changes.
 */
@Component({
  selector: 'app-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h1>Users</h1>
      <p class="lead">Live data via <code>httpResource</code> (fetch backend + interceptor).</p>

      <button (click)="users.reload()" [disabled]="users.isLoading()">Reload</button>

      @if (users.isLoading()) {
        <p class="muted">Loading…</p>
      } @else if (users.error()) {
        <p class="error">Failed to load users. Check your connection.</p>
      } @else {
        <ul class="grid">
          @for (u of users.value(); track u.id) {
            <li class="card">
              <strong>{{ u.name }}</strong>
              <span class="muted">{{ u.email }}</span>
              <em>{{ u.company.name }}</em>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .lead { color: #6b7280; }
    button { padding: 0.45rem 0.9rem; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; margin-bottom: 1rem; }
    .grid { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
    .card { display: flex; flex-direction: column; gap: 0.2rem; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.85rem; }
    .muted { color: #6b7280; font-size: 0.85rem; }
    .error { color: #dc2626; }
    em { color: #4f46e5; font-size: 0.8rem; }
  `,
})
export class Users {
  // Returns a resource signal; no manual subscribe/unsubscribe needed.
  protected readonly users = httpResource<User[]>(
    () => 'https://jsonplaceholder.typicode.com/users',
  );
}
