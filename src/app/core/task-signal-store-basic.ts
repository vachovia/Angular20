import { computed, effect } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Priority, Task, TaskFilter } from './models';

/**
 * BASIC SignalStore — the first SignalStore approach, kept for comparison.
 * State is a plain `Task[]` held in `withState`, mutated with `patchState`
 * and manual immutable array operations (map/filter/spread).
 *
 * The three approaches in this project, simplest → most capable:
 *   1. `task-store.ts`             — hand-rolled class, no library
 *   2. `task-signal-store-basic.ts`— THIS file: SignalStore + plain `withState`
 *   3. `task-signal-store.ts`      — SignalStore + `withEntities` + `rxMethod`
 *
 * Advantage of this basic version over #3: nothing extra to learn — no entity
 * updaters, no RxJS. Great when the list is small and fully in-memory. You
 * "graduate" to #3 (`withEntities`/`rxMethod`) once you need by-id updates on a
 * larger collection or async loading with cancellation/error state.
 */

const STORAGE_KEY = 'angular-interview-demo.tasks.ngrx-basic';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;
}

function loadInitial(): TaskState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { tasks: JSON.parse(raw) as Task[], filter: 'all' };
  } catch {
    /* ignore malformed storage */
  }
  return {
    filter: 'all',
    tasks: [
      { id: 1, title: 'Learn plain withState + patchState', priority: 'high', done: true, createdAt: Date.now() - 8.64e7 },
      { id: 2, title: 'Immutable updates with map/filter', priority: 'medium', done: false, createdAt: Date.now() - 4e7 },
      { id: 3, title: 'Then compare with withEntities', priority: 'low', done: false, createdAt: Date.now() },
    ],
  };
}

function nextId(tasks: Task[]): number {
  return tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

export const TaskSignalStoreBasic = signalStore(
  { providedIn: 'root' },

  // Whole collection is a single array in state.
  withState<TaskState>(loadInitial()),

  withComputed((store) => ({
    visibleTasks: computed(() => {
      const filter = store.filter();
      return store.tasks().filter((t) =>
        filter === 'all' ? true : filter === 'done' ? t.done : !t.done,
      );
    }),
    remaining: computed(() => store.tasks().filter((t) => !t.done).length),
    total: computed(() => store.tasks().length),
    completedPct: computed(() => {
      const total = store.tasks().length;
      const done = total - store.tasks().filter((t) => !t.done).length;
      return total === 0 ? 0 : Math.round((done / total) * 100);
    }),
  })),

  withMethods((store) => ({
    add(title: string, priority: Priority): void {
      const trimmed = title.trim();
      if (!trimmed) return;
      const task: Task = {
        id: nextId(store.tasks()),
        title: trimmed,
        priority,
        done: false,
        createdAt: Date.now(),
      };
      // Manual immutable insert (compare: entity `addEntity(task)` in #3).
      patchState(store, (state) => ({ tasks: [task, ...state.tasks] }));
    },
    toggle(id: number): void {
      patchState(store, (state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      }));
    },
    remove(id: number): void {
      patchState(store, (state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    },
    setFilter(filter: TaskFilter): void {
      patchState(store, { filter });
    },
    clearCompleted(): void {
      patchState(store, (state) => ({ tasks: state.tasks.filter((t) => !t.done) }));
    },
  })),

  withHooks({
    onInit(store) {
      effect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store.tasks()));
      });
    },
  }),
);
