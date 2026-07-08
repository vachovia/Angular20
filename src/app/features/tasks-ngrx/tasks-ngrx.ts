import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskSignalStore } from '../../core/task-signal-store';
import { Priority, TaskFilter } from '../../core/models';
import { TaskItem } from '../tasks/task-item';

/**
 * Identical UI to the Tasks page, but backed by the @ngrx/signals SignalStore
 * (`TaskSignalStore`) instead of the hand-rolled `TaskStore`. The component
 * code is essentially the same — the difference is entirely in the store file.
 */
@Component({
  selector: 'app-tasks-ngrx',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TaskItem],
  template: `
    <section class="page">
      <h1>Tasks <span class="tag">SignalStore · entities + rxMethod</span></h1>
      <p class="lead">
        Backed by a <code>signalStore()</code> with <code>withEntities</code>
        (normalized collection) and <code>rxMethod</code> (async loading).
      </p>

      <div class="toolbar">
        <button type="button" (click)="store.loadFromApi()" [disabled]="store.loading()">
          {{ store.loading() ? 'Loading…' : 'Load from API' }}
        </button>
        <button type="button" class="ghost" (click)="store.reset()">Reset to seed</button>
      </div>
      @if (store.error(); as err) {
        <p class="error">{{ err }}</p>
      }

      <form [formGroup]="form" (ngSubmit)="submit()" class="add-form">
        <input formControlName="title" placeholder="What needs doing?" autocomplete="off" />
        <select formControlName="priority">
          @for (p of priorities; track p) {
            <option [value]="p">{{ p }}</option>
          }
        </select>
        <button type="submit" [disabled]="form.invalid">Add</button>
      </form>
      @if (form.controls.title.touched && form.controls.title.invalid) {
        <p class="error">Title is required (min 2 chars).</p>
      }

      <div class="filters">
        @for (f of filters; track f) {
          <button
            type="button"
            [class.active]="store.filter() === f"
            (click)="store.setFilter(f)"
          >
            {{ f }}
          </button>
        }
      </div>

      <ul class="list">
        @for (task of store.visibleTasks(); track task.id) {
          <app-task-item
            [task]="task"
            (toggle)="store.toggle($event)"
            (remove)="store.remove($event)"
          />
        } @empty {
          <li class="empty">No tasks here — add one above 👆</li>
        }
      </ul>

      <footer class="bar">
        <span>{{ store.remaining() }} of {{ store.total() }} remaining</span>
        <button type="button" (click)="store.clearCompleted()">Clear completed</button>
      </footer>
    </section>
  `,
  styles: `
    .page { max-width: 640px; }
    .tag { font-size: 0.7rem; background: #4f46e5; color: #fff; padding: 2px 8px; border-radius: 999px; vertical-align: middle; }
    .lead { color: #6b7280; }
    .toolbar { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .toolbar button { padding: 0.45rem 0.9rem; border-radius: 8px; border: 1px solid #4f46e5; background: #4f46e5; color: #fff; cursor: pointer; }
    .toolbar button:disabled { opacity: 0.5; cursor: not-allowed; }
    .toolbar button.ghost { background: #fff; color: #4f46e5; }
    .add-form { display: flex; gap: 0.5rem; margin-bottom: 0.25rem; }
    .add-form input { flex: 1; padding: 0.55rem 0.7rem; border: 1px solid #d1d5db; border-radius: 8px; }
    .add-form select, .add-form button { padding: 0.55rem 0.7rem; border-radius: 8px; border: 1px solid #d1d5db; }
    .add-form button { background: #4f46e5; color: #fff; border: none; cursor: pointer; }
    .add-form button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #dc2626; font-size: 0.8rem; margin: 0.25rem 0 0; }
    .filters { display: flex; gap: 0.4rem; margin: 1rem 0; }
    .filters button { text-transform: capitalize; padding: 0.35rem 0.85rem; border: 1px solid #d1d5db; background: #fff; border-radius: 999px; cursor: pointer; }
    .filters button.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }
    .list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .empty { text-align: center; color: #9ca3af; padding: 1.5rem; }
    .bar { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; color: #6b7280; font-size: 0.9rem; }
    .bar button { border: none; background: transparent; color: #4f46e5; cursor: pointer; }
  `,
})
export class TasksNgrx {
  // Injected exactly like any other service — SignalStore is a provider.
  protected readonly store = inject(TaskSignalStore);
  private readonly fb = inject(FormBuilder);

  protected readonly priorities: Priority[] = ['low', 'medium', 'high'];
  protected readonly filters: TaskFilter[] = ['all', 'active', 'done'];

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    priority: ['medium' as Priority, Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, priority } = this.form.getRawValue();
    this.store.add(title, priority);
    this.form.reset({ title: '', priority: 'medium' });
  }
}
