import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskStore } from '../../core/task-store';
import { Priority, TaskFilter } from '../../core/models';
import { TaskItem } from './task-item';

@Component({
  selector: 'app-tasks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TaskItem],
  template: `
    <section class="page">
      <h1>Tasks</h1>

      <!-- Reactive form with validation -->
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

      <!-- Filter tabs -->
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

      <!-- New control flow: @for with track + @empty -->
      <ul class="list">
        @for (task of store.visibleTasks(); track task.id) {
          <app-task-item
            [task]="task"
            (toggle)="toggle($event)"
            (remove)="remove($event)"
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
export class Tasks {
  protected readonly store = inject(TaskStore);
  private readonly fb = inject(FormBuilder);

  protected readonly priorities: Priority[] = ['low', 'medium', 'high'];
  protected readonly filters: TaskFilter[] = ['all', 'active', 'done'];

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    priority: ['medium' as Priority, Validators.required],
  });

  // Kept for demonstration; not strictly needed here.
  protected readonly justAdded = signal<string | null>(null);

  toggle = (id: number) => this.store.toggle(id);

  remove = (id: number) => this.store.remove(id);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, priority } = this.form.getRawValue();
    this.store.add(title, priority);
    this.justAdded.set(title);
    this.form.reset({ title: '', priority: 'medium' });
  }
}
