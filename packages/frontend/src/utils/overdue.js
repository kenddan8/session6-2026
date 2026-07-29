function toLocalMidnight(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    // Date-only strings (e.g. "2026-07-01") are parsed as UTC by `new Date()`,
    // which can shift the calendar date when converted to local time. Parse
    // the year/month/day parts directly so the comparison uses the local
    // calendar date the string represents.
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isOverdue(todo, now = new Date()) {
  if (!todo.dueDate || todo.completed) {
    return false;
  }

  const dueDate = toLocalMidnight(todo.dueDate);
  const today = toLocalMidnight(now);

  return dueDate.getTime() < today.getTime();
}

export { isOverdue };
