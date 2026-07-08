import { TestBed } from '@angular/core/testing';
import { TaskStore } from './task-store';

/**
 * Testing a signal-based store. Signals read synchronously, so most assertions
 * need no async/detectChanges — just call the action and read the signal.
 * `computed` values recompute on read, so they're trivial to assert.
 */
describe('TaskStore', () => {
  let store: TaskStore;

  beforeEach(() => {
    // Deterministic start: clear persisted state before the store loads.
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(TaskStore);
  });

  it('seeds initial tasks and derives counts', () => {
    expect(store.total()).toBe(3);
    expect(store.remaining()).toBe(2); // one seed task is done
    expect(store.completedPct()).toBe(33);
  });

  it('adds a task at the front and updates totals', () => {
    store.add('New task', 'high');
    expect(store.total()).toBe(4);
    expect(store.tasks()[0].title).toBe('New task');
    expect(store.remaining()).toBe(3);
  });

  it('ignores blank titles', () => {
    store.add('   ', 'low');
    expect(store.total()).toBe(3);
  });

  it('toggles done state', () => {
    const id = store.tasks()[0].id;
    const before = store.tasks()[0].done;
    store.toggle(id);
    expect(store.tasks().find((t) => t.id === id)!.done).toBe(!before);
  });

  it('filters via the visibleTasks computed', () => {
    store.setFilter('done');
    expect(store.visibleTasks().every((t) => t.done)).toBe(true);
    store.setFilter('active');
    expect(store.visibleTasks().every((t) => !t.done)).toBe(true);
  });

  it('clears completed tasks', () => {
    store.clearCompleted();
    expect(store.tasks().every((t) => !t.done)).toBe(true);
  });
});
