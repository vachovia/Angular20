import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { TaskStore } from '../../core/task-store';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <section>
      <h1>Dashboard</h1>
      <p class="lead">A tiny Angular 20 app showcasing the modern feature set.</p>

      <!--
        NgOptimizedImage: use [ngSrc] instead of src. Requires width/height (or
        fill) to reserve layout space (prevents CLS). The "priority" attribute
        preloads the LCP image. A remote image here — in production you'd add an
        image-CDN loader (provideImgixLoader/etc.) for automatic resizing.
      -->
      <img ngSrc="https://picsum.photos/id/180/800/240" width="800" height="240" priority class="hero" alt="Scenic banner" />

      <div class="cards">
        <div class="card">
          <span class="num">{{ store.total() }}</span>
          <span class="label">Total tasks</span>
        </div>
        <div class="card">
          <span class="num">{{ store.remaining() }}</span>
          <span class="label">Remaining</span>
        </div>
        <div class="card">
          <span class="num">{{ store.completedPct() }}%</span>
          <span class="label">Completed</span>
        </div>
      </div>

      <div class="progress" [attr.aria-valuenow]="store.completedPct()">
        <div class="fill" [style.width.%]="store.completedPct()"></div>
      </div>

      <!-- @switch new control flow -->
      @switch (true) {
        @case (store.completedPct() === 100) {
          <p class="status ok">🎉 All done — great work!</p>
        }
        @case (store.completedPct() >= 50) {
          <p class="status">Over halfway there.</p>
        }
        @default {
          <p class="status">Plenty left to do.</p>
        }
      }

      <a routerLink="/tasks" class="cta">Go to tasks →</a>
    </section>
  `,
  styles: `
    .lead { color: #6b7280; }
    .hero { width: 100%; height: auto; border-radius: 12px; margin: 0.5rem 0 1rem; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0; }
    .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; text-align: center; }
    .num { display: block; font-size: 2rem; font-weight: 700; color: #4f46e5; }
    .label { color: #6b7280; font-size: 0.85rem; }
    .progress { height: 10px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
    .fill { height: 100%; background: #4f46e5; transition: width 0.3s ease; }
    .status { margin: 1rem 0; }
    .status.ok { color: #16a34a; font-weight: 600; }
    .cta { display: inline-block; margin-top: 0.5rem; color: #4f46e5; font-weight: 600; text-decoration: none; }
  `,
})
export class Dashboard {
  protected readonly store = inject(TaskStore);
}
