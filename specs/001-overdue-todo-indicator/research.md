# Research: Support for Overdue Todo Items

All open questions from the spec were resolved during `/speckit.clarify` (see
[spec.md § Clarifications](./spec.md#clarifications)). This document captures the remaining
implementation-level research needed before design: how to compute "overdue" correctly, how
to keep it live without a refresh, and how to render it consistently with the design system.

## 1. Date comparison strategy (calendar date, not time-of-day)

- **Decision**: Compare only the calendar date portion of `dueDate` against the calendar date
  portion of `new Date()` (both truncated to local midnight), rather than comparing full
  timestamps. A todo is overdue when `dueDateAtLocalMidnight < todayAtLocalMidnight` and
  `completed` is falsy.
- **Rationale**: The spec's edge cases require a due date of "today" to never be overdue,
  regardless of what time of day it currently is. Comparing raw `Date` objects (which include
  time-of-day) would incorrectly mark a todo due "today" as overdue once the current time of
  day passes midnight-equivalent of the stored date string. Truncating both sides to
  local-date-only comparison avoids this and matches "based on the user's local date" in the
  spec's Edge Cases.
- **Alternatives considered**:
  - Comparing full `Date` timestamps directly — rejected, breaks the "due today is not
    overdue" rule depending on time-of-day.
  - Using a date library (`date-fns`, `dayjs`) — rejected as an unnecessary new dependency for
    a single date-truncation comparison; plain `Date` parsing is sufficient and keeps the
    "no new dependencies" constraint intact.

## 2. Where overdue is computed (frontend vs. backend)

- **Decision**: Compute overdue status entirely on the frontend, in a small pure utility
  (`isOverdue(todo, now)`), using the browser's local clock (`new Date()` injectable as `now`
  for testability). No backend/API change.
- **Rationale**: The spec explicitly treats "overdue" as derived and non-stored, and defines
  it in terms of "the user's local date." The server has no reliable knowledge of each
  client's local timezone, and the existing API/data model must not change per FR/Assumptions.
  Frontend computation also lets the periodic timer re-render immediately without any network
  round-trip.
- **Alternatives considered**:
  - Backend computes and returns an `isOverdue` flag — rejected: requires an API/data-model
    change explicitly out of scope, and would use server time zone instead of the user's
    local date.

## 3. Live re-evaluation without page refresh (Story 3 / FR-010)

- **Decision**: Use a single `setInterval` (>= 60s) driven from a `useEffect` in the component
  that owns the todo list rendering (or in `TodoList`), incrementing a lightweight "tick"
  state value that is not otherwise used except to force re-evaluation of `isOverdue` for all
  visible todos on each interval firing. The interval is cleared on unmount.
- **Rationale**: Matches existing React idioms in this codebase (functional components,
  hooks). A once-per-minute cadence is more than sufficient because overdue status only
  changes at most once per calendar day per todo, keeping CPU/battery impact negligible while
  still satisfying "without requiring the user to refresh the page or take any other action."
- **Alternatives considered**:
  - Scheduling a single timer that fires exactly at the next local midnight — more precise but
    more complex to test and reason about across DST/timezone edge cases; rejected in favor of
    the simpler periodic-interval approach given the spec only requires "at least once per
    minute," not exact-midnight precision.
  - No timer, recompute only on other re-renders — rejected per clarification answer (Story 3
    is now a hard requirement, not deferred).

## 4. Visual treatment implementation

- **Decision**: Render a small `<span className="todo-overdue-badge">Overdue</span>` inside
  the existing `.todo-content` block (next to/below the due date text), styled via a new CSS
  rule in `App.css`/`theme.css` using `color: var(--danger-color)` (or a subtle
  background/border using the same token), consistent with existing badge-less text styling
  patterns already in the card.
- **Rationale**: Directly satisfies the clarified answer ("Text badge + danger color") and
  FR-002/FR-009: reuses the existing `--danger-color` token (already defined for both light
  and dark themes in `theme.css`), requires no new color values, and does not rely on color
  alone for meaning (satisfies WCAG 1.4.1 and the constitution's accessibility principle).
- **Alternatives considered**:
  - Coloring the whole card border/background — rejected per clarification answer (not
    selected).
  - Coloring just the due-date text with no separate label — rejected per clarification answer
    (not selected); also weaker for accessibility/scanability than an explicit label.

## 5. Testing approach for time-dependent behavior

- **Decision**: Use Jest fake timers (`jest.useFakeTimers()` / `jest.advanceTimersByTime()`)
  to test the periodic re-evaluation without real waiting, and pass an injectable `now`
  parameter (or mock `Date`) into the `isOverdue` utility so unit tests can exercise past/
  today/future/no-due-date/completed cases deterministically.
- **Rationale**: Matches `docs/testing-guidelines.md` (deterministic, independent tests, mock
  external dependencies including timers) and the constitution's requirement that critical
  workflows have thorough, deterministic coverage.
- **Alternatives considered**: Relying on real elapsed time in tests — rejected as slow and
  non-deterministic.

## Summary

No NEEDS CLARIFICATION markers remain. All decisions above are additive, frontend-only, and
introduce no new runtime dependencies, consistent with the constitution's technology-stack
and functional-scope constraints.
