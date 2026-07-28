import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { User } from '../../core/user.resolver';

interface Post {
  id: number;
  title: string;
  body: string;
}

/**
 * The other CHILD — same inherited `user`, plus its own async work on top.
 *
 * Shows the split worth copying: the resolver blocks navigation only for the
 * data the whole subtree needs (the user), while tab-specific data loads
 * non-blocking via `rxResource` with a visible loading state. Putting the posts
 * in a resolver too would stall the tab switch behind a second request.
 */
@Component({
  selector: 'app-user-profile-posts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article>
      <p class="muted">Posts by {{ user().name }} — fetched by this child, not resolved.</p>

      @if (posts.isLoading()) {
        <p class="muted">Loading posts…</p>
      } @else if (posts.error()) {
        <p class="error">Couldn't load posts.</p>
      } @else {
        <ul class="list">
          @for (p of posts.value(); track p.id) {
            <li>
              <strong>{{ p.title }}</strong>
              <span class="muted">{{ p.body }}</span>
            </li>
          } @empty {
            <li class="muted">No posts.</li>
          }
        </ul>
      }
    </article>
  `,
  styles: `
    .muted { color: #6b7280; }
    .error { color: #dc2626; }
    .list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
    .list li { display: flex; flex-direction: column; gap: 0.2rem; }
    .list span { font-size: 0.85rem; }
  `,
})
export class UserProfilePosts {
  private readonly http = inject(HttpClient);

  // Inherited from the parent route (see UserProfileOverview for why this works).
  readonly user = input.required<User>();

  // Alternative without input binding or the inheritance setting — read the
  // parent route explicitly. Works anywhere, but hard-codes this component's
  // position in the route tree, which is why the input above is preferred:
  /*
    private readonly route = inject(ActivatedRoute);
    readonly user = toSignal(this.route.parent!.data.pipe(map((d) => d['user'] as User)));
  */

  // Reacts to the input signal: Prev/Next re-resolves the user, which refetches these.
  protected readonly posts = rxResource<Post[], number>({
    params: () => this.user().id,
    stream: ({ params }) =>
      this.http.get<Post[]>(`https://jsonplaceholder.typicode.com/posts?userId=${params}`),
  });
}
