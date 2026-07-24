import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly links = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/tasks', label: 'Tasks' },
    { path: '/tasks-ngrx-basic', label: 'NgRx (basic)' },
    { path: '/tasks-ngrx', label: 'NgRx (entities)' },
    { path: '/stats', label: 'Stats' },
    { path: '/users', label: 'Users' },
    { path: '/users-rx', label: 'Users (rxResource)' },
    { path: '/users-crud', label: 'Users (CRUD)' },
    { path: '/signals-lab', label: 'Signals Lab' },
    { path: '/about', label: 'About' },
  ];
}
