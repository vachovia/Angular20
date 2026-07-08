import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Cheatsheet } from './cheatsheet';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Cheatsheet],
  template: `
    <section>
      <h1>About</h1>
      <p class="lead">Scroll down — the cheat-sheet below is loaded with <code>&#64;defer</code>.</p>

      <div class="spacer">↓ scroll ↓</div>

      <!--
        @defer with viewport trigger: the Cheatsheet component's code is only
        downloaded/rendered when the placeholder scrolls into view.
      -->
      @defer (on viewport) {
        <app-cheatsheet />
      } @placeholder {
        <div class="ph">Cheat-sheet will load when visible…</div>
      } @loading (minimum 300ms) {
        <div class="ph">Loading cheat-sheet…</div>
      }

      <h3>Other &#64;defer triggers</h3>

      <!-- on interaction: loads when the placeholder is clicked/focused -->
      @defer (on interaction) {
        <app-cheatsheet />
      } @placeholder {
        <button type="button" class="ph as-btn">Click to load (on interaction)</button>
      }

      <!-- prefetch on hover, then render when it enters the viewport -->
      @defer (on viewport; prefetch on hover) {
        <app-cheatsheet />
      } @placeholder {
        <div class="ph">Hover to prefetch, renders on viewport</div>
      }
    </section>
  `,
  styles: `
    .lead { color: #6b7280; }
    .spacer { height: 60vh; display: grid; place-items: center; color: #9ca3af; }
    .ph { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; color: #9ca3af; text-align: center; }
    .as-btn { width: 100%; cursor: pointer; background: #fff; }
  `,
})
export class About {}
