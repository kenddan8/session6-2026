# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todo-indicator`

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "Support for Overdue Todo Items - As a todo application user, I want to easily identify and distinguish overdue tasks in my todo list, so that I can prioritize my work and quickly see which tasks are past their due date. Users need a clear, visual way to identify which todos have not been completed by their due date. This helps users quickly spot overdue items without having to manually check dates against today's date."

## Clarifications

### Session 2026-07-29

- Q: Should overdue status auto-update live via a timer, or only recompute on the next user-triggered re-render? → A: Timer-based auto-refresh — periodic check (e.g., every minute) re-renders the list so overdue status updates live with zero user interaction.
- Q: What should the overdue visual indicator look like: color alone, or color plus a text label/badge? → A: Text badge + danger color — a small "Overdue" badge/label styled with the Danger color next to or below the due date.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Spot overdue todos at a glance (Priority: P1)

As a user viewing my todo list, I want incomplete todos whose due date has passed to be
visually distinguished from other todos, so that I can immediately identify what needs my
attention without comparing every due date to today's date myself.

**Why this priority**: This is the core value of the feature — without a visual indicator,
users gain no benefit. This alone makes the feature useful and demonstrable.

**Independent Test**: Create a todo with a due date in the past and leave it incomplete;
verify it is visually marked as overdue in the todo list. Can be fully tested by viewing the
list and confirms the primary value of the feature.

**Acceptance Scenarios**:

1. **Given** a todo with a due date earlier than today and status incomplete, **When** the
   user views the todo list, **Then** that todo is visually marked as overdue (e.g., distinct
   color/label) and is clearly distinguishable from non-overdue todos.
2. **Given** a todo with a due date of today, **When** the user views the todo list, **Then**
   that todo is NOT marked as overdue (it is still on time).
3. **Given** a todo with a due date in the future, **When** the user views the todo list,
   **Then** that todo is displayed normally with no overdue marking.
4. **Given** a todo with no due date set, **When** the user views the todo list, **Then**
   that todo is displayed normally with no overdue marking.

---

### User Story 2 - Overdue marking clears once a todo is completed (Priority: P2)

As a user, I want a todo to stop being marked as overdue once I mark it complete, so that
the overdue indicator only reflects work that still genuinely needs attention.

**Why this priority**: Prevents confusing/misleading indicators on tasks the user has already
finished; important for correctness and trust in the feature, but depends on User Story 1
existing first.

**Independent Test**: Create an overdue todo (marked overdue per Story 1), then mark it
complete; verify the overdue marking disappears immediately. Can be tested independently of
other stories once basic overdue marking exists.

**Acceptance Scenarios**:

1. **Given** a todo currently marked as overdue, **When** the user marks the todo as
   complete, **Then** the overdue marking is removed immediately and the todo displays using
   the standard completed-state styling.
2. **Given** a completed todo with a past due date, **When** the user marks it incomplete
   again, **Then** the overdue marking reappears (since the due date is still in the past).

---

### User Story 3 - Overdue status stays current without a page refresh (Priority: P3)

As a user who keeps the todo list open, I want overdue status to reflect the current date
automatically, so that a todo becomes marked overdue as soon as its due date passes, even if
I don't reload the page.

**Why this priority**: A refinement of the core feature that keeps the overdue indicator
trustworthy for users who leave the app open; lower priority than the core marking and
completion behavior since it builds on top of both.

**Independent Test**: Open the todo list with a todo due "today"; without reloading the
page, wait until the due date has passed (or simulate the date change) and verify the todo
becomes marked overdue without requiring a manual refresh.

**Acceptance Scenarios**:

1. **Given** the todo list is open and a todo's due date passes while the page remains open,
   **When** the due date passes, **Then** the todo becomes visually marked as overdue without
   the user needing to refresh the page, via a periodic (e.g., at least once per minute)
   re-evaluation of overdue status while the list is displayed.

---

### Edge Cases

- A todo due date equal to the current day is treated as NOT overdue (overdue only applies
  once the due date has fully passed).
- A todo with no due date is never marked overdue.
- A completed todo is never marked overdue, regardless of its due date.
- Todos remain marked overdue indefinitely (no maximum overdue duration) until completed or
  their due date is edited to a non-past date.
- If a user edits an overdue todo's due date to a future date (or today), the overdue marking
  is removed immediately.
- Time zone / time-of-day: comparisons use the calendar date (not time-of-day), based on the
  user's local date, so a todo due "today" is not overdue until the local date changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST determine a todo to be "overdue" when it has a due date, that
  due date is earlier than the current date, and the todo's status is incomplete.
- **FR-002**: The system MUST visually distinguish overdue todos from other todos in the todo
  list using a text label/badge (e.g., "Overdue") styled with the Danger color, shown next to
  or below the due date, so overdue items are identifiable at a glance without relying on
  color alone.
- **FR-003**: The system MUST NOT mark a todo as overdue if it has no due date set.
- **FR-004**: The system MUST NOT mark a todo as overdue if its due date is today or in the
  future.
- **FR-005**: The system MUST NOT mark a todo as overdue if its status is complete.
- **FR-006**: When a user marks an overdue todo as complete, the system MUST remove the
  overdue marking immediately, using the standard completed-state styling instead.
- **FR-007**: When a user edits a todo's due date, the system MUST re-evaluate and update the
  todo's overdue marking immediately based on the new due date.
- **FR-008**: The system MUST re-evaluate overdue status each time the todo list is viewed or
  refreshed, so that stale overdue markings never persist after a todo's completion status or
  due date has changed.
- **FR-009**: The overdue visual indicator MUST remain distinguishable in both light and dark
  display modes.
- **FR-010**: While the todo list remains open, the system MUST periodically re-evaluate
  overdue status (e.g., at least once per minute) so that a todo becomes marked overdue as
  soon as its due date passes, without requiring the user to refresh the page or take any
  other action.

### Key Entities

- **Todo**: Existing entity representing a task; relevant existing attributes are title, due
  date (optional), and completion status. This feature adds a derived (computed, not stored)
  "overdue" state based on due date and completion status — no new stored fields are
  introduced.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify all overdue todos in their list within 2 seconds of viewing
  it, without checking any date manually.
- **SC-002**: 100% of incomplete todos with a past due date are visually marked as overdue
  every time the list is displayed.
- **SC-003**: 0% of completed todos or todos without a past due date are incorrectly marked
  as overdue.
- **SC-004**: Marking an overdue todo complete removes its overdue marking with no perceptible
  delay (reflected on the next render/view).

## Assumptions

- "Overdue" is a derived/computed state based on comparing a todo's due date to the current
  local date; it is not stored as a separate field on the todo.
- A todo due "today" is considered on-time, not overdue, consistent with the existing due-date
  semantics in the functional requirements.
- The existing "Danger" color already defined in the UI guidelines (used for delete actions)
  is an acceptable basis for the overdue visual treatment, reused for consistency rather than
  introducing a new color, paired with a text label/badge (e.g., "Overdue") so the indicator
  does not rely on color alone.
- A periodic timer (at least once per minute) re-evaluates overdue status while the todo list
  remains open, so User Story 3 (live auto-update without page refresh) is a hard requirement
  of this feature, not a deferred nice-to-have.
- This feature only affects how existing todos are displayed; it does not change the todo data
  model, the create/update/delete API, or the out-of-scope items already defined in
  `docs/functional-requirements.md` (e.g., no notifications/reminders for overdue items).
