import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Task } from '../../core/models';
import { TimeAgoPipe } from '../../shared/time-ago.pipe';
import { PriorityBadgeDirective } from '../../shared/priority-badge.directive';

/**
 * Presentational child component.
 * - `input.required<Task>()` — signal input (replaces @Input).
 * - `output<number>()` — signal output (replaces @Output/EventEmitter).
 * - OnPush + signals = minimal re-rendering.
 */
@Component({
  selector: 'app-task-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TimeAgoPipe, PriorityBadgeDirective],
  template: `
    <li class="task" [class.done]="task().done">
      <input
        type="checkbox"
        [checked]="task().done"
        (change)="toggle.emit(task().id)"
        [attr.aria-label]="'Toggle ' + task().title"
      />

      <div class="body">
        <span class="title">{{ task().title }}</span>
        <div class="meta">
          <span [appPriorityBadge]="task().priority">{{ task().priority }}</span>
          <small>{{ task().createdAt | timeAgo }}</small>
        </div>
      </div>

      <button class="remove" type="button" (click)="remove.emit(task().id)" aria-label="Remove task">
        ✕
      </button>
    </li>
  `,
  styles: `
    .task {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      background: #fff;
    }
    .task.done .title { text-decoration: line-through; color: #9ca3af; }
    .body { flex: 1; display: flex; flex-direction: column; gap: 0.35rem; }
    .title { font-weight: 500; }
    .meta { display: flex; align-items: center; gap: 0.6rem; }
    .meta small { color: #9ca3af; }
    .remove {
      border: none; background: transparent; cursor: pointer;
      color: #9ca3af; font-size: 1rem; line-height: 1;
    }
    .remove:hover { color: #dc2626; }
  `,
})
export class TaskItem {
  readonly task = input.required<Task>();
  readonly toggle = output<number>();
  readonly remove = output<number>();

  // Example computed derived from an input signal.
  protected readonly isHighPriority = computed(() => this.task().priority === 'high');
}
