import { Pipe, PipeTransform } from '@angular/core';

/**
 * Standalone, pure custom pipe. Pure pipes are memoized by Angular and only
 * re-run when their input reference changes — cheap and signal-friendly.
 */
@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(value: number): string {
    const secs = Math.floor((Date.now() - value) / 1000);
    const units: [number, string][] = [
      [60, 'second'],
      [60, 'minute'],
      [24, 'hour'],
      [7, 'day'],
      [4.35, 'week'],
      [12, 'month'],
      [Number.POSITIVE_INFINITY, 'year'],
    ];
    let amount = secs;
    for (const [size, name] of units) {
      if (amount < size) {
        const rounded = Math.floor(amount);
        return rounded <= 0 ? 'just now' : `${rounded} ${name}${rounded === 1 ? '' : 's'} ago`;
      }
      amount /= size;
    }
    return 'just now';
  }
}
