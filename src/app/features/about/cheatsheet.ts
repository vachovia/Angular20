import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Deliberately loaded lazily via @defer to demonstrate deferred loading. */
@Component({
  selector: 'app-cheatsheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sheet">
      <h3>Interview cheat-sheet</h3>
      <ul>
        <li><code>signal()</code> / <code>computed()</code> / <code>effect()</code> — reactive state</li>
        <li><code>input()</code> / <code>output()</code> / <code>model()</code> — signal component I/O</li>
        <li><code>&#64;if</code> / <code>&#64;for</code> / <code>&#64;switch</code> / <code>&#64;defer</code> — built-in control flow</li>
        <li><code>inject()</code> — function-style DI</li>
        <li>Standalone components — no NgModules</li>
        <li>Functional guards &amp; interceptors</li>
        <li><code>httpResource()</code> — reactive async data</li>
        <li><code>provideRouter</code> + lazy <code>loadComponent</code></li>
      </ul>
    </div>
  `,
  styles: `
    .sheet { border: 1px dashed #a5b4fc; border-radius: 12px; padding: 1rem 1.25rem; background: #eef2ff; }
    .sheet h3 { margin-top: 0; }
    .sheet li { margin: 0.3rem 0; }
  `,
})
export class Cheatsheet {}
