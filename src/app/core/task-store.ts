import { Injectable, computed, effect, signal } from '@angular/core';
import { Priority, Task, TaskFilter } from './models';

/**
 * Signal-based state store — the modern alternative to a BehaviorSubject/NgRx
 * store for local feature state. State lives in `signal`s, derived state in
 * `computed`s, and side effects (persistence) in an `effect`.
 *
 * Provided in root so any component can `inject(TaskStore)`.
 */
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly STORAGE_KEY = 'angular-interview-demo.tasks';

  // --- Writable state (private setters, public readonly views) ---
  private readonly _tasks = signal<Task[]>(this.load());
  private readonly _filter = signal<TaskFilter>('all');

  /** Public read-only signals — components can read but not mutate directly. */
  readonly tasks = this._tasks.asReadonly();
  readonly filter = this._filter.asReadonly();

  // --- Derived state (recomputed automatically, memoized) ---
  readonly visibleTasks = computed(() => {
    const filter = this._filter();
    return this._tasks().filter((t) =>
      filter === 'all' ? true : filter === 'done' ? t.done : !t.done,
    );
  });

  readonly remaining = computed(() => this._tasks().filter((t) => !t.done).length);
  readonly total = computed(() => this._tasks().length);
  readonly completedPct = computed(() =>
    this.total() === 0 ? 0 : Math.round(((this.total() - this.remaining()) / this.total()) * 100),
  );

  constructor() {
    // `effect` runs whenever any signal it reads changes — here we persist.
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._tasks()));
    });
  }

  // --- Actions (immutable updates via signal.update) ---
  add(title: string, priority: Priority): void {
    const trimmed = title.trim();
    if (!trimmed) return;
    const task: Task = {
      id: this.nextId(),
      title: trimmed,
      priority,
      done: false,
      createdAt: Date.now(),
    };
    this._tasks.update((list) => [task, ...list]);
  }

  toggle(id: number): void {
    this._tasks.update((list) =>
      list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  remove(id: number): void {
    this._tasks.update((list) => list.filter((t) => t.id !== id));
  }

  setFilter(filter: TaskFilter): void {
    this._filter.set(filter);
  }

  clearCompleted(): void {
    this._tasks.update((list) => list.filter((t) => !t.done));
  }

  private nextId(): number {
    return this._tasks().reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }

  private load(): Task[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Task[];
    } catch {
      /* ignore malformed storage */
    }
    // Seed data so the app isn't empty on first run.
    return [
      { id: 1, title: 'Review signals & computed', priority: 'high', done: true, createdAt: Date.now() - 8.64e7 },
      { id: 2, title: 'Practice @defer and @for', priority: 'medium', done: false, createdAt: Date.now() - 4e7 },
      { id: 3, title: 'Explain functional guards', priority: 'low', done: false, createdAt: Date.now() },
    ];
  }
}
