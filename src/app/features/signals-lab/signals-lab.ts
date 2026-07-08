import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { CounterField } from './counter-field';
import { LabPanel } from './lab-panel';

interface Post {
  id: number;
  title: string;
}

/**
 * A grab-bag page demonstrating modern signal APIs that aren't shown elsewhere:
 * model() two-way binding, linkedSignal, viewChild/contentChild queries,
 * toObservable/toSignal interop, takeUntilDestroyed, @let, and a functional
 * route resolver feeding the `tip` input via router input binding.
 */
@Component({
  selector: 'app-signals-lab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CounterField, LabPanel],
  template: `
    <section>
      <h1>Signals Lab</h1>

      @if (tip(); as t) {
        <p class="tip">💡 <strong>Resolved tip:</strong> {{ t }}</p>
      }

      <!-- model() two-way binding: parent signal <-> child model -->
      <app-lab-panel>
        <h3 #title>model() two-way binding</h3>
        <div class="row">
          <app-counter-field [(value)]="count" />
          <!-- @let creates a local template variable -->
          @let doubled = count() * 2;
          <span class="muted">count = {{ count() }}, doubled = {{ doubled }}</span>
        </div>
      </app-lab-panel>

      <!-- linkedSignal: selection resets when the source list changes -->
      <app-lab-panel>
        <h3 #title>linkedSignal()</h3>
        <p class="muted">
          Selected category: <strong>{{ selectedCategory() }}</strong>
          (auto-reset to first when the list changes)
        </p>
        <div class="chips">
          @for (c of categories(); track c) {
            <button type="button" [class.active]="selectedCategory() === c" (click)="selectedCategory.set(c)">
              {{ c }}
            </button>
          }
        </div>
        <button type="button" class="link" (click)="reverseCategories()">Reverse list →</button>
      </app-lab-panel>

      <!-- viewChild + debounced search via toObservable/toSignal -->
      <app-lab-panel>
        <h3 #title>Debounced search (toObservable → toSignal)</h3>
        <div class="row">
          <input
            #searchBox
            type="text"
            placeholder="Search post titles…"
            (input)="searchTerm.set(searchBox.value)"
          />
          <button type="button" class="link" (click)="focusSearch()">Focus (viewChild)</button>
        </div>
        @let hits = results();
        @if (searchTerm()) {
          <ul class="results">
            @for (post of hits; track post.id) {
              <li>{{ post.title }}</li>
            } @empty {
              <li class="muted">No matches.</li>
            }
          </ul>
        } @else {
          <p class="muted">Type to search — requests debounce 300ms, switchMap cancels stale ones.</p>
        }
      </app-lab-panel>
    </section>
  `,
  styles: `
    .tip { background: #eef2ff; border-radius: 10px; padding: 0.6rem 0.9rem; }
    section { display: flex; flex-direction: column; gap: 1rem; }
    h3 { margin: 0 0 0.5rem; }
    .row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .muted { color: #6b7280; }
    .chips { display: flex; gap: 0.4rem; margin: 0.5rem 0; }
    .chips button { padding: 0.3rem 0.8rem; border-radius: 999px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; }
    .chips button.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }
    input { padding: 0.5rem 0.7rem; border: 1px solid #d1d5db; border-radius: 8px; }
    .link { border: none; background: transparent; color: #4f46e5; cursor: pointer; padding: 0; }
    .results { margin: 0.5rem 0 0; padding-left: 1.1rem; }
    .results li { margin: 0.2rem 0; }
  `,
})
export class SignalsLab {
  private readonly http = inject(HttpClient);

  // Delivered by tipResolver through router input binding.
  readonly tip = input<string>();

  // model() two-way binding target.
  protected readonly count = signal(1);

  // linkedSignal: writable, but recomputes from source when categories change.
  protected readonly categories = signal<string[]>(['Work', 'Personal', 'Urgent']);
  protected readonly selectedCategory = linkedSignal(() => this.categories()[0]);

  // viewChild signal query for the search input element.
  private readonly searchBox = viewChild<ElementRef<HTMLInputElement>>('searchBox');

  // Debounced, cancellable search bridging signals <-> RxJS <-> signals.
  protected readonly searchTerm = signal('');
  protected readonly results = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        const q = term.trim().toLowerCase();
        if (!q) return of<Post[]>([]);
        // A real backend would take ?q=; here we filter client-side to keep to
        // the single JSONPlaceholder API. switchMap still cancels stale calls.
        return this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts').pipe(
          map((posts) => posts.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 5)),
        );
      }),
      takeUntilDestroyed(),
    ),
    { initialValue: [] as Post[] },
  );

  reverseCategories(): void {
    this.categories.update((list) => [...list].reverse());
  }

  focusSearch(): void {
    this.searchBox()?.nativeElement.focus();
  }
}
