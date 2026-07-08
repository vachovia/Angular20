import { computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { Priority, Task, TaskFilter } from './models';

/**
 * SignalStore, now with two of @ngrx/signals' headline features:
 *
 *  - `withEntities<Task>()` — normalized entity collection. Instead of a raw
 *    `Task[]`, the store keeps an `entityMap` + `ids` and exposes `entities()`
 *    (the array), plus O(1) updates via `addEntity`/`updateEntity`/`removeEntity`.
 *    This is what you'd reach for once a list grows or needs by-id lookups.
 *
 *  - `rxMethod<T>()` — a reactive method backed by an RxJS pipeline. Here it
 *    loads tasks from a REST API with loading/error state, cancellation
 *    (switchMap), and error handling — no manual subscribe/unsubscribe.
 *
 * Compare with the hand-rolled `task-store.ts`: this is where a library starts
 * paying off — entity helpers and async orchestration you'd otherwise hand-write.
 */

const STORAGE_KEY = 'angular-interview-demo.tasks.ngrx';
const API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=8';

interface ApiTodo {
  id: number;
  title: string;
  completed: boolean;
}

// Extra (non-entity) slice of state lives alongside the entity collection.
interface TaskUiState {
  filter: TaskFilter;
  loading: boolean;
  error: string | null;
}

const initialUi: TaskUiState = { filter: 'all', loading: false, error: null };

const SEED: Task[] = [
  { id: 1, title: 'Compare signal store vs SignalStore', priority: 'high', done: true, createdAt: Date.now() - 8.64e7 },
  { id: 2, title: 'Explain withEntities & patchState', priority: 'medium', done: false, createdAt: Date.now() - 4e7 },
  { id: 3, title: 'Demo rxMethod async loading', priority: 'low', done: false, createdAt: Date.now() },
];

function toTask(todo: ApiTodo): Task {
  const priorities: Priority[] = ['low', 'medium', 'high'];
  return {
    id: todo.id,
    title: todo.title,
    priority: priorities[todo.id % 3],
    done: todo.completed,
    createdAt: Date.now() - todo.id * 3.6e6,
  };
}

function nextId(tasks: Task[]): number {
  return tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

export const TaskSignalStore = signalStore(
  { providedIn: 'root' },

  // Custom UI slice.
  withState<TaskUiState>(initialUi),

  // Entity collection: adds entities() / entityMap() / ids() signals.
  withEntities<Task>(),

  // Derived signals read the entity array just like any other signal.
  withComputed((store) => ({
    visibleTasks: computed(() => {
      const filter = store.filter();
      return store.entities().filter((t) =>
        filter === 'all' ? true : filter === 'done' ? t.done : !t.done,
      );
    }),
    remaining: computed(() => store.entities().filter((t) => !t.done).length),
    total: computed(() => store.entities().length),
    completedPct: computed(() => {
      const total = store.entities().length;
      const done = total - store.entities().filter((t) => !t.done).length;
      return total === 0 ? 0 : Math.round((done / total) * 100);
    }),
  })),

  withMethods((store) => {
    const http = inject(HttpClient);
    return {
      add(title: string, priority: Priority): void {
        const trimmed = title.trim();
        if (!trimmed) return;
        const task: Task = {
          id: nextId(store.entities()),
          title: trimmed,
          priority,
          done: false,
          createdAt: Date.now(),
        };
        // Entity updater — inserts into the normalized collection.
        patchState(store, addEntity(task));
      },
      toggle(id: number): void {
        const current = store.entityMap()[id];
        if (!current) return;
        patchState(store, updateEntity({ id, changes: { done: !current.done } }));
      },
      remove(id: number): void {
        patchState(store, removeEntity(id));
      },
      setFilter(filter: TaskFilter): void {
        patchState(store, { filter });
      },
      clearCompleted(): void {
        for (const t of store.entities()) {
          if (t.done) patchState(store, removeEntity(t.id));
        }
      },
      reset(): void {
        patchState(store, setAllEntities(SEED));
      },

      // Reactive async method. Call it with no args: store.loadFromApi().
      // switchMap cancels a prior in-flight request; catchError keeps the
      // stream alive so the method stays reusable after a failure.
      loadFromApi: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            http.get<ApiTodo[]>(API_URL).pipe(
              map((todos) => todos.map(toTask)),
              tap((tasks) =>
                patchState(store, setAllEntities(tasks), { loading: false }),
              ),
              catchError(() => {
                patchState(store, { loading: false, error: 'Failed to load from API.' });
                return of([]);
              }),
            ),
          ),
        ),
      ),
    };
  }),

  withHooks({
    onInit(store) {
      // Hydrate the entity collection from localStorage, else seed it.
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        patchState(store, setAllEntities(raw ? (JSON.parse(raw) as Task[]) : SEED));
      } catch {
        patchState(store, setAllEntities(SEED));
      }
      // Persist on every change to the collection.
      effect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store.entities()));
      });
    },
  }),
);
