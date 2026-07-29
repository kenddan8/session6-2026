import { isOverdue } from '../overdue';

describe('isOverdue', () => {
  const now = new Date('2026-07-29T10:00:00');

  it('returns false when dueDate is not set (FR-003)', () => {
    const todo = { dueDate: null, completed: 0 };
    expect(isOverdue(todo, now)).toBe(false);
  });

  it('returns false when dueDate is today (FR-004)', () => {
    const todo = { dueDate: '2026-07-29', completed: 0 };
    expect(isOverdue(todo, now)).toBe(false);
  });

  it('returns false when dueDate is in the future (FR-004)', () => {
    const todo = { dueDate: '2026-08-01', completed: 0 };
    expect(isOverdue(todo, now)).toBe(false);
  });

  it('returns true when dueDate is in the past and completed is falsy (FR-001)', () => {
    const todo = { dueDate: '2026-07-01', completed: 0 };
    expect(isOverdue(todo, now)).toBe(true);
  });

  it('returns false when dueDate is in the past and completed is truthy (FR-005)', () => {
    const todo = { dueDate: '2026-07-01', completed: 1 };
    expect(isOverdue(todo, now)).toBe(false);
  });
});
