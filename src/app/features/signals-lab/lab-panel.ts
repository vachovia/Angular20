import { ChangeDetectionStrategy, Component, ElementRef, contentChild } from '@angular/core';

/**
 * `contentChild()` — signal-based content query. It reads a `#title` element
 * from the projected (`<ng-content>`) content and echoes its text, showing how
 * a wrapper can inspect what a parent projected into it.
 */
@Component({
  selector: 'app-lab-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <div class="content"><ng-content /></div>
      @if (title()) {
        <small class="echo">contentChild read the heading: "{{ (title()!.nativeElement.textContent || '').trim() }}"</small>
      }
    </div>
  `,
  styles: `
    .panel { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem 1.25rem; }
    .echo { display: block; margin-top: 0.5rem; color: #9ca3af; }
  `,
})
export class LabPanel {
  // Queries the projected element tagged with #title.
  readonly title = contentChild<ElementRef<HTMLElement>>('title');
}
