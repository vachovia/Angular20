import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

/**
 * Tiny directive used to demonstrate DIRECTIVE COMPOSITION: it is applied to a
 * component via `hostDirectives: [Autofocus]` (see CounterField) rather than in
 * a template. Focuses its host element once the view is ready.
 */
@Directive({ selector: '[appAutofocus]' })
export class Autofocus implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    // Focus the first focusable element inside the host (or the host itself).
    const el = this.host.nativeElement;
    const focusable = el.querySelector<HTMLElement>('input, button, [tabindex]') ?? el;
    focusable.focus?.();
  }
}
