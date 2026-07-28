import { Routes } from '@angular/router';
import { hasTasksGuard } from './core/has-tasks.guard';
import { tipResolver } from './core/tip.resolver';
import { userResolver } from './core/user.resolver';

/**
 * All routes are lazy-loaded standalone components via `loadComponent`
 * (code-splitting per route — no eager NgModules).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'tasks',
    title: 'Tasks',
    loadComponent: () => import('./features/tasks/tasks').then((m) => m.Tasks),
  },
  {
    path: 'tasks-ngrx-basic',
    title: 'Tasks (SignalStore basic)',
    loadComponent: () =>
      import('./features/tasks-ngrx-basic/tasks-ngrx-basic').then((m) => m.TasksNgrxBasic),
  },
  {
    path: 'tasks-ngrx',
    title: 'Tasks (SignalStore + entities)',
    loadComponent: () => import('./features/tasks-ngrx/tasks-ngrx').then((m) => m.TasksNgrx),
  },
  {
    path: 'stats',
    title: 'Stats',
    canActivate: [hasTasksGuard],
    loadComponent: () => import('./features/stats/stats').then((m) => m.Stats),
  },
  {
    path: 'users',
    title: 'Users',
    loadComponent: () => import('./features/users/users').then((m) => m.Users),
  },
  {
    path: 'users-rx',
    title: 'Users (rxResource)',
    loadComponent: () => import('./features/users-rx/users-rx').then((m) => m.UsersRx),
  },
  {
    path: 'users-crud',
    title: 'Users (CRUD + reload)',
    loadComponent: () => import('./features/users-crud/users-crud').then((m) => m.UsersCrud),
  },
  {
    // Route param bound into UserDetail's id input() via withComponentInputBinding.
    path: 'users/:id',
    title: 'User detail',
    loadComponent: () => import('./features/user-detail/user-detail').then((m) => m.UserDetail),
  },
  {
    // Parent resolver shared with children: `userResolver` runs ONCE here, and
    // both child tabs read the result via route-data inheritance
    // (paramsInheritanceStrategy: 'always' in app.config.ts).
    path: 'user-profile/:id',
    title: 'User profile',
    resolve: { user: userResolver },
    loadComponent: () =>
      import('./features/user-profile/user-profile-shell').then((m) => m.UserProfileShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        title: 'User profile · Overview',
        loadComponent: () =>
          import('./features/user-profile/user-profile-overview').then(
            (m) => m.UserProfileOverview,
          ),
      },
      {
        path: 'posts',
        title: 'User profile · Posts',
        loadComponent: () =>
          import('./features/user-profile/user-profile-posts').then((m) => m.UserProfilePosts),
      },
    ],
  },
  {
    path: 'signals-lab',
    title: 'Signals Lab',
    // Functional resolver → its result binds to the `tip` input (input binding).
    resolve: { tip: tipResolver },
    loadComponent: () => import('./features/signals-lab/signals-lab').then((m) => m.SignalsLab),
  },
  {
    path: 'about',
    title: 'About',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
  },
  { path: '**', redirectTo: 'dashboard' },
];
