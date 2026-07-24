import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * A stand-in for a real HTTP backend.
 *
 * Why this exists: jsonplaceholder's POST /users is faked — it returns a new id
 * but does NOT persist, so a follow-up GET would show the ORIGINAL list and the
 * reload() demo would look broken. This service keeps an in-memory array so
 * POST actually persists and reload() visibly shows the new row.
 *
 * The method signatures return `Observable<T>` exactly like `HttpClient`, so the
 * component code is identical to what you'd write against a real API — you'd
 * just inject `HttpClient` and call `this.http.get<User[]>('/api/users')`
 * instead of `this.api.getUsers()`.
 */
@Injectable({ providedIn: 'root' })
export class FakeUserApi {
  private users: User[] = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com' },
    { id: 3, name: 'Grace Hopper', email: 'grace@example.com' },
  ];
  private nextId = 4;

  /** GET /api/users — 600ms latency so isLoading() is visible. */
  getUsers(): Observable<User[]> {
    // Return a copy so callers can't mutate our "database" directly.
    return of(this.users.map((u) => ({ ...u }))).pipe(delay(600));
  }

  /** POST /api/users — persists and echoes back the created row (with id). */
  addUser(input: Omit<User, 'id'>): Observable<User> {
    const created: User = { id: this.nextId++, ...input };
    this.users = [...this.users, created];
    return of(created).pipe(delay(400));
  }

  /** PUT /api/users/:id — persists changes and echoes back the updated row. */
  updateUser(id: number, changes: Omit<User, 'id'>): Observable<User> {
    const existing = this.users.find((u) => u.id === id);
    if (!existing) {
      return throwError(() => new Error(`User ${id} not found`)).pipe(delay(400));
    }
    const updated: User = { ...existing, ...changes };
    this.users = this.users.map((u) => (u.id === id ? updated : u));
    return of({ ...updated }).pipe(delay(500));
  }

  /** DELETE /api/users/:id */
  deleteUser(id: number): Observable<void> {
    const existed = this.users.some((u) => u.id === id);
    if (!existed) {
      return throwError(() => new Error(`User ${id} not found`)).pipe(delay(400));
    }
    this.users = this.users.filter((u) => u.id !== id);
    return of(void 0).pipe(delay(400));
  }
}
