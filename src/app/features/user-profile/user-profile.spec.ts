import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { routes } from '../../app.routes';
import { User } from '../../core/user.resolver';

const USER: User = {
  id: 3,
  name: 'Clementine Bauch',
  username: 'Samantha',
  email: 'Nathan@yesenia.net',
  phone: '1-463-123-4447',
  website: 'ramiro.info',
  company: { name: 'Romaguera-Jacobson', catchPhrase: 'Face to face bifurcated interface' },
};

const isUserRequest = (req: HttpRequest<unknown>) => req.url.endsWith('/users/3');
// NB: an inline query string stays in `req.url`, so match on a substring.
const isPostsRequest = (req: HttpRequest<unknown>) => req.url.includes('/posts');

/** Waits for a request to be issued (the route's lazy chunk + resolver are async), then flushes it. */
async function flushWhenRequested(
  http: HttpTestingController,
  match: (req: HttpRequest<unknown>) => boolean,
  body: object,
): Promise<void> {
  for (let i = 0; i < 50; i++) {
    const [request] = http.match(match);
    if (request) {
      request.flush(body);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('Expected request was never issued');
}

describe('user-profile (parent resolver shared with children)', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        // Mirrors app.config.ts — 'always' is what makes the inheritance work.
        provideRouter(
          routes,
          withComponentInputBinding(),
          withRouterConfig({ paramsInheritanceStrategy: 'always' }),
        ),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  it('resolves the user once and binds it into the shell AND the child', async () => {
    const navigation = harness.navigateByUrl('/user-profile/3/overview');
    await flushWhenRequested(http, isUserRequest, USER);
    await navigation;
    harness.detectChanges();

    const text = harness.routeNativeElement!.textContent!;
    expect(text).toContain('Clementine Bauch'); // shell: from route data
    expect(text).toContain('Nathan@yesenia.net'); // child: INHERITED route data
    expect(text).toContain('id = 3'); // child: INHERITED route param
  });

  it('does not re-run the parent resolver when switching child tabs', async () => {
    const navigation = harness.navigateByUrl('/user-profile/3/overview');
    await flushWhenRequested(http, isUserRequest, USER);
    await navigation;
    harness.detectChanges();

    await harness.navigateByUrl('/user-profile/3/posts');
    harness.detectChanges();

    // :id did not change, so the parent route is reused — one user fetch total.
    http.expectNone(isUserRequest);

    await flushWhenRequested(http, isPostsRequest, [{ id: 1, title: 'A post', body: 'body' }]);
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('A post');
  });

  afterEach(() => http.verify());
});
