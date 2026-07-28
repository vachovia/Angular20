import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import { User } from '../../core/user.resolver';

/**
 * CHILD route — receives the parent's resolved data with zero plumbing.
 *
 * This only works because `app.config.ts` sets
 * `paramsInheritanceStrategy: 'always'`. Angular's default is 'emptyOnly',
 * which passes a parent's params/data down only when the parent is
 * COMPONENT-LESS or empty-path. Our parent has both a path (`user-profile/:id`)
 * and a component, so on the default setting both inputs below would stay
 * empty and `input.required` would throw on first read.
 *
 * `id` proves that params are inherited alongside data.
 */
@Component({
  selector: 'app-user-profile-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article>
      <dl>
        <dt>Email</dt><dd>{{ user().email }}</dd>
        <dt>Phone</dt><dd>{{ user().phone }}</dd>
        <dt>Website</dt><dd>{{ user().website }}</dd>
        <dt>Company</dt><dd>{{ user().company.name }}</dd>
      </dl>
      <p class="muted">
        Inherited from the parent route — no fetch, no ActivatedRoute, no input
        chaining. Route param also inherited: id = {{ id() }}.
      </p>
    </article>
  `,
  styles: `
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.35rem 1rem; margin: 0; }
    dt { color: #6b7280; }
    dd { margin: 0; }
    .muted { color: #6b7280; font-size: 0.85rem; margin: 1rem 0 0; }
  `,
})
export class UserProfileOverview {
  // From the PARENT route's `resolve: { user: userResolver }`.
  readonly user = input.required<User>();

  // From the PARENT route's `:id` segment.
  readonly id = input.required({ transform: numberAttribute });
}
