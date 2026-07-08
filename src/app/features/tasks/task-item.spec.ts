import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Task } from '../../core/models';
import { TaskItem } from './task-item';

/**
 * Testing a component with signal `input()`/`output()`:
 *  - set a required signal input with `fixture.componentRef.setInput(...)`
 *  - assert on `output()` by subscribing to it like an event.
 */
describe('TaskItem', () => {
  let fixture: ComponentFixture<TaskItem>;

  const sample: Task = {
    id: 42,
    title: 'Write a unit test',
    priority: 'high',
    done: false,
    createdAt: Date.now(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TaskItem] }).compileComponents();
    fixture = TestBed.createComponent(TaskItem);
    fixture.componentRef.setInput('task', sample);
    fixture.detectChanges();
  });

  it('renders the task title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.title')?.textContent).toContain('Write a unit test');
  });

  it('emits toggle with the task id when the checkbox changes', () => {
    let emitted: number | undefined;
    fixture.componentInstance.toggle.subscribe((id) => (emitted = id));

    const checkbox = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    checkbox.dispatchEvent(new Event('change'));

    expect(emitted).toBe(42);
  });

  it('emits remove with the task id when the button is clicked', () => {
    let emitted: number | undefined;
    fixture.componentInstance.remove.subscribe((id) => (emitted = id));

    const button = (fixture.nativeElement as HTMLElement).querySelector('.remove') as HTMLButtonElement;
    button.click();

    expect(emitted).toBe(42);
  });
});
