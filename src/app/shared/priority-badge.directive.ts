import { Directive, computed, input } from '@angular/core';
import { Priority } from '../core/models';

/**
 * Attribute directive using signal `input()` plus host bindings driven by a
 * `computed`. Applying [appPriorityBadge]="task.priority" colours the element.
 */
@Directive({
  selector: '[appPriorityBadge]',
  host: {
    '[style.background-color]': 'color()',
    '[style.color]': '"white"',
    '[style.padding]': '"2px 8px"',
    '[style.border-radius]': '"999px"',
    '[style.font-size]': '"0.72rem"',
    '[style.font-weight]': '"600"',
    '[style.text-transform]': '"uppercase"',
  },
})
export class PriorityBadgeDirective {
  readonly appPriorityBadge = input.required<Priority>();

  protected readonly color = computed(() => {
    switch (this.appPriorityBadge()) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#16a34a';
    }
  });
}
