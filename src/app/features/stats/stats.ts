import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TaskStore } from '../../core/task-store';
import { Priority } from '../../core/models';

/**
 * Reached only through the `hasTasksGuard` functional guard.
 * Shows a breakdown derived purely from store signals via `computed`.
 */
@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h1>Stats</h1>
      <p class="lead">This route is protected by a functional <code>CanActivateFn</code> guard.</p>

      <ul class="bars">
        @for (row of byPriority(); track row.priority) {
          <li>
            <span class="key">{{ row.priority }}</span>
            <div class="track"><div class="bar" [style.width.%]="row.pct"></div></div>
            <span class="val">{{ row.count }}</span>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    .lead { color: #6b7280; }
    .bars { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
    li { display: grid; grid-template-columns: 80px 1fr 40px; align-items: center; gap: 0.75rem; }
    .key { text-transform: capitalize; }
    .track { background: #e5e7eb; border-radius: 999px; height: 12px; overflow: hidden; }
    .bar { height: 100%; background: #4f46e5; }
    .val { text-align: right; color: #6b7280; }
  `,
})
export class Stats {
  private readonly store = inject(TaskStore);

  protected readonly byPriority = computed(() => {
    const tasks = this.store.tasks();
    const max = Math.max(1, tasks.length);
    return (['high', 'medium', 'low'] as Priority[]).map((priority) => {
      const count = tasks.filter((t) => t.priority === priority).length;
      return { priority, count, pct: Math.round((count / max) * 100) };
    });
  });
}
