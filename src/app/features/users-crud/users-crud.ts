import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { FakeUserApi } from './fake-user-api';

/**
 * rxResource + reload() after a mutation.
 *
 * The list is an rxResource. Its `stream` runs the GET; calling `.reload()`
 * re-runs that stream, so after a POST/DELETE the server is re-queried and
 * `value()` reflects the new truth.
 *
 * Two independent async operations, two independent states:
 *   - users.isLoading()  → tracks the GET (list)
 *   - saving()           → tracks the POST (add)
 *
 * NOTE: `FakeUserApi` stands in for a real backend so POST actually persists.
 * With a real API you'd inject HttpClient and the stream becomes
 * `() => this.http.get<User[]>('/api/users')` — everything else is the same.
 */
@Component({
  selector: 'app-users-crud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <section>
      <h1>Users <span class="tag">rxResource + reload()</span></h1>
      <p class="lead">
        Add / edit / delete → the mutation resolves → <code>users.reload()</code>
        re-runs the GET → the change appears. <strong>Edit</strong> copies the row
        into a writable <em>draft</em> signal; <code>value()</code> stays the
        server's truth until you Save.
      </p>

      <!-- Add form (its own in-flight flag: saving()) -->
      <form [formGroup]="form" (ngSubmit)="add()" class="add">
        <input formControlName="name" placeholder="Name" autocomplete="off" />
        <input formControlName="email" placeholder="Email" autocomplete="off" />
        <button type="submit" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Saving…' : 'Add user' }}
        </button>
      </form>
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <p class="error">Enter a name and a valid email.</p>
      }

      <div class="bar">
        <button type="button" (click)="users.reload()" [disabled]="users.isLoading()">
          Manual reload
        </button>
        <span class="muted">status: <code>{{ users.status() }}</code></span>
      </div>

      <!-- List (rxResource) -->
      @if (users.isLoading()) {
        <p class="muted">Loading…</p>
      } @else if (users.error()) {
        <p class="error">Failed to load. <button (click)="users.reload()">Retry</button></p>
      } @else {
        <ul class="grid">
          @for (u of users.value(); track u.id) {
            <li class="card">
              @if (editingId() === u.id && draft(); as d) {
                <!-- EDIT MODE: inputs bound to the DRAFT, not to value() -->
                <div class="edit">
                  <input
                    [value]="d.name"
                    (input)="patchDraft('name', $event)"
                    placeholder="Name"
                  />
                  <input
                    [value]="d.email"
                    (input)="patchDraft('email', $event)"
                    placeholder="Email"
                  />
                  <div class="edit-actions">
                    <button type="button" class="primary" [disabled]="saving()" (click)="saveEdit()">
                      {{ saving() ? 'Saving…' : 'Save' }}
                    </button>
                    <button type="button" [disabled]="saving()" (click)="cancelEdit()">Cancel</button>
                  </div>
                </div>
              } @else {
                <!-- DISPLAY MODE: reads value() directly -->
                <div>
                  <strong>{{ u.name }}</strong>
                  <span class="muted">{{ u.email }}</span>
                </div>
                <div class="row-actions">
                  <button type="button" [disabled]="saving()" (click)="startEdit(u)">Edit</button>
                  <button class="remove" type="button" [disabled]="saving()" (click)="remove(u.id)">
                    ✕
                  </button>
                </div>
              }
            </li>
          } @empty {
            <li class="muted">No users yet — add one above.</li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .tag { font-size: 0.7rem; background: #16a34a; color: #fff; padding: 2px 8px; border-radius: 999px; vertical-align: middle; }
    .lead { color: #6b7280; max-width: 560px; }
    .add { display: flex; gap: 0.5rem; margin: 1rem 0 0.25rem; }
    .add input { flex: 1; padding: 0.55rem 0.7rem; border: 1px solid #d1d5db; border-radius: 8px; }
    .add button, .bar button { padding: 0.55rem 0.9rem; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; }
    .add button { background: #4f46e5; color: #fff; border: none; }
    .add button:disabled, .bar button:disabled { opacity: 0.5; cursor: not-allowed; }
    .bar { display: flex; align-items: center; gap: 1rem; margin: 1rem 0; }
    .muted { color: #6b7280; font-size: 0.85rem; }
    .error { color: #dc2626; }
    .grid { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }
    .card { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.85rem; }
    .card > div:first-child { display: flex; flex-direction: column; gap: 0.15rem; }
    .row-actions { display: flex; align-items: center; gap: 0.5rem; }
    .row-actions button { padding: 0.3rem 0.6rem; border-radius: 6px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; font-size: 0.8rem; }
    .remove { border: none !important; background: transparent !important; cursor: pointer; color: #9ca3af; font-size: 1rem; padding: 0.2rem 0.4rem !important; }
    .remove:hover:not(:disabled) { color: #dc2626; }
    .edit { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; }
    .edit input { padding: 0.45rem 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; }
    .edit-actions { display: flex; gap: 0.5rem; }
    .edit-actions button { padding: 0.35rem 0.7rem; border-radius: 6px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; font-size: 0.8rem; }
    .edit-actions .primary { background: #4f46e5; color: #fff; border: none; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  `,
})
export class UsersCrud {
  private readonly api = inject(FakeUserApi);
  private readonly fb = inject(FormBuilder);

  // The list resource. `stream` runs the GET; reload() re-subscribes it.
  protected readonly users = rxResource({
    stream: () => this.api.getUsers(),
    defaultValue: [],
  });

  // The POST/DELETE in-flight flag — the resource only tracks the GET.
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  protected async add(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      // 1. Mutate on the server (a separate Observable from the GET).
      await firstValueFrom(this.api.addUser(this.form.getRawValue()));
      // 2. Re-run the GET → value() now includes the new row.
      this.users.reload();
      this.form.reset({ name: '', email: '' });
    } finally {
      this.saving.set(false);
    }
  }

  protected async remove(id: number): Promise<void> {
    this.saving.set(true);
    try {
      await firstValueFrom(this.api.deleteUser(id));
      this.users.reload(); // same pattern: mutate → reload → server is truth
    } finally {
      this.saving.set(false);
    }
  }

  // ─── Edit-user DRAFT ──────────────────────────────────────────────────────
  // A writable working copy, seeded FROM users.value(). The user edits the
  // draft; value() stays untouched (it's the server's truth) until we save.

  protected readonly editingId = signal<number | null>(null);
  protected readonly draft = signal<{ name: string; email: string } | null>(null);

  /** COPY value() row → writable draft. This is the ONE legit copy of value(). */
  protected startEdit(u: { id: number; name: string; email: string }): void {
    this.editingId.set(u.id);
    this.draft.set({ name: u.name, email: u.email }); // spread copy — edits won't touch value()
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.draft.set(null); // throw the draft away; value() was never modified
  }

  /** Bind the <input>s into the draft without ngModel. */
  protected patchDraft(field: 'name' | 'email', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.draft.update((d) => (d ? { ...d, [field]: value } : d));
  }

  protected async saveEdit(): Promise<void> {
    const id = this.editingId();
    const d = this.draft();
    if (id == null || !d) return;

    this.saving.set(true);
    try {
      await firstValueFrom(this.api.updateUser(id, d)); // 1. push draft → server
      this.users.reload(); // 2. refetch → value() now reflects the saved change
      this.cancelEdit(); // 3. drop the draft; value() is truth again
    } finally {
      this.saving.set(false);
    }
  }
}
