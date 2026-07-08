import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { Autofocus } from '../../shared/autofocus.directive';

/**
 * `model()` — a two-way–bindable signal (input + output in one). A parent binds
 * with `[(value)]="count"`; writing `value.set(...)` here updates the parent.
 *
 * `hostDirectives: [Autofocus]` — DIRECTIVE COMPOSITION: this component gains the
 * Autofocus behaviour without the parent applying it in the template.
 */
@Component({
  selector: 'app-counter-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [Autofocus],
  template: `
    <div class="counter">
      <button type="button" (click)="dec()" aria-label="Decrement">−</button>
      <span class="val">{{ value() }}</span>
      <button type="button" (click)="inc()" aria-label="Increment">+</button>
    </div>
  `,
  styles: `
    .counter { display: inline-flex; align-items: center; gap: 0.75rem; }
    button { width: 2rem; height: 2rem; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; font-size: 1.1rem; cursor: pointer; }
    .val { min-width: 2ch; text-align: center; font-weight: 700; font-size: 1.2rem; }
  `,
})
export class CounterField {
  // Two-way bindable signal with a default.
  readonly value = model<number>(0);

  inc(): void {
    this.value.update((v) => v + 1);
  }
  dec(): void {
    this.value.update((v) => v - 1);
  }
}
