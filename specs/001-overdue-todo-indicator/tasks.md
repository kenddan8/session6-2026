---

description: "Task list for Support for Overdue Todo Items"
---

# Tasks: Support for Overdue Todo Items

**Input**: Design documents from `/specs/001-overdue-todo-indicator/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Included. `docs/testing-guidelines.md` mandates test-first development and comprehensive coverage for this codebase, and plan.md/quickstart.md both call out specific unit and component test cases, so test tasks are included and MUST be written (and observed failing) before their corresponding implementation task.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing. This is a frontend-only change confined to `packages/frontend`; `packages/backend` requires no changes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

## Path Conventions

Web app (existing monorepo): `packages/frontend/src/...` (per plan.md Project Structure). No `packages/backend` paths are used by this feature.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish a clean baseline and the new file locations before making changes

- [X] T001 Run `npm run test:frontend` from the repo root to confirm the existing frontend test suite passes before starting (clean baseline)
- [X] T002 [P] Create the `packages/frontend/src/utils/` and `packages/frontend/src/utils/__tests__/` directories per plan.md Project Structure (no files yet)

**Checkpoint**: Baseline verified, new directories exist

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `isOverdue` derived-value utility is the single source of truth for overdue calculation used by every user story (badge rendering in US1, re-evaluation on toggle/edit in US2, and periodic re-evaluation in US3). It MUST exist and be correct before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Write unit tests for `isOverdue(todo, now)` in `packages/frontend/src/utils/__tests__/overdue.test.js` covering: no `dueDate` set (FR-003, expect `false`), `dueDate` equal to today (FR-004, expect `false`), `dueDate` in the future (FR-004, expect `false`), `dueDate` in the past with `completed` falsy (FR-001, expect `true`), and `dueDate` in the past with `completed` truthy (FR-005, expect `false`); pass an injectable `now` argument for deterministic dates. Run the tests and confirm they FAIL (no implementation exists yet).
- [X] T004 Implement `isOverdue(todo, now = new Date())` as a pure function in `packages/frontend/src/utils/overdue.js`, comparing only the calendar-date portion of `todo.dueDate` and `now` (both truncated to local midnight) per research.md decision 1, so that T003 tests pass

**Checkpoint**: `isOverdue` utility complete and fully unit-tested — user story implementation can now begin

---

## Phase 3: User Story 1 - Spot overdue todos at a glance (Priority: P1) 🎯 MVP

**Goal**: Incomplete todos with a past due date show a text "Overdue" badge in the Danger color next to/below the due date; todos due today, due in the future, or with no due date show no badge.

**Independent Test**: Create a todo with a due date in the past and leave it incomplete; verify it shows the "Overdue" badge in the todo list, while todos due today/future/no-date do not.

### Tests for User Story 1 ⚠️

> Write these tests FIRST, ensure they FAIL before implementation

- [X] T005 [P] [US1] Add test cases to `packages/frontend/src/components/__tests__/TodoCard.test.js`: renders the "Overdue" badge for a todo with a past `dueDate` and `completed: 0`; does NOT render the badge for a todo due today; does NOT render the badge for a todo due in the future; does NOT render the badge for a todo with no `dueDate` (FR-001, FR-003, FR-004). Run and confirm these new cases FAIL.

### Implementation for User Story 1

- [X] T006 [US1] In `packages/frontend/src/components/TodoCard.js`, import `isOverdue` from `../utils/overdue` and conditionally render `<span className="todo-overdue-badge">Overdue</span>` inside the `.todo-content` block, next to/below the due date text, only when `isOverdue(todo)` is `true` (depends on T004)
- [X] T007 [P] [US1] Add a `.todo-overdue-badge` CSS rule to `packages/frontend/src/App.css` using `color: var(--danger-color)` (reusing the existing token, no new colors), consistent with existing text styling in the card and verified visually distinguishable in both light and dark theme tokens defined in `packages/frontend/src/styles/theme.css` (FR-002, FR-009)
- [X] T008 [US1] Run `npm run test:frontend` and confirm the T005 test cases now pass with no regressions in existing `TodoCard.test.js` cases (depends on T006, T007)

**Checkpoint**: User Story 1 is fully functional and independently testable — this is the MVP

---

## Phase 4: User Story 2 - Overdue marking clears once a todo is completed (Priority: P2)

**Goal**: The "Overdue" badge disappears immediately when a todo is marked complete, reappears if marked incomplete again (while still past due), and is re-evaluated immediately when a todo's due date is edited.

**Independent Test**: Create an overdue todo (per US1), mark it complete and verify the badge disappears immediately; mark it incomplete again and verify it reappears; edit its due date to tomorrow and verify the badge disappears immediately.

### Tests for User Story 2 ⚠️

> Write these tests FIRST, ensure they FAIL before implementation

- [X] T009 [P] [US2] Add test cases to `packages/frontend/src/components/__tests__/TodoCard.test.js`: the "Overdue" badge is absent when an overdue todo's `completed` prop becomes truthy, and reappears when `completed` becomes falsy again while `dueDate` is still in the past (FR-005, FR-006). Run and confirm these new cases FAIL.
- [X] T010 [P] [US2] Add a test case to `packages/frontend/src/components/__tests__/TodoCard.test.js`: editing an overdue todo's due date to tomorrow via the edit form and submitting causes `onEdit` to be called with the new date and the badge to disappear once the component re-renders with the updated `dueDate` prop (FR-007). Run and confirm this new case FAILS.

### Implementation for User Story 2

- [X] T011 [US2] In `packages/frontend/src/components/TodoCard.js`, verify/adjust the badge rendering from T006 so `isOverdue(todo)` is recomputed directly from the current `todo` prop on every render (no stale memoization), ensuring toggling `completed` and updating `dueDate` immediately change the badge with no extra state needed (depends on T006)
- [X] T012 [US2] Run `npm run test:frontend` and confirm the T009 and T010 test cases now pass with no regressions (depends on T011)

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Overdue status stays current without a page refresh (Priority: P3)

**Goal**: While the todo list remains open, overdue status is re-evaluated at least once per minute so a todo becomes marked overdue as soon as its due date passes, with no page refresh.

**Independent Test**: Render a todo due "today" with the list open; advance time (via fake timers in tests, or the system clock manually per quickstart.md) past midnight without remounting; verify the todo becomes marked overdue without any refresh.

### Tests for User Story 3 ⚠️

> Write these tests FIRST, ensure they FAIL before implementation

- [X] T013 [P] [US3] Add a test case to `packages/frontend/src/components/__tests__/TodoCard.test.js` using `jest.useFakeTimers()`: render a `TodoCard` for a todo due "today", advance the mocked date/timer past the interval (`jest.advanceTimersByTime`) so the due date is now in the past, and verify the "Overdue" badge appears without remounting the component (FR-010). Run and confirm this new case FAILS.

### Implementation for User Story 3

- [X] T014 [US3] In `packages/frontend/src/components/TodoCard.js`, add a `useEffect` that starts a `setInterval` (>= 60000ms) incrementing a local "tick" state used only to force re-evaluation of `isOverdue` on each interval firing, and clears the interval on unmount, per research.md decision 3 (depends on T006, T011)
- [X] T015 [US3] Run `npm run test:frontend` and confirm the T013 test case now passes and the full frontend suite is green (depends on T014)

**Checkpoint**: All three user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories

- [X] T016 [P] Manually verify Overdue badge visibility/contrast in both light and dark themes using the `ThemeToggle` component, per quickstart.md scenario 7 (FR-009)
- [X] T017 [P] Manually run quickstart.md validation scenarios 1–7 in `specs/001-overdue-todo-indicator/quickstart.md` against `npm run start`
- [X] T018 Run `npm run test:frontend -- --coverage` and confirm no new lint errors and coverage remains consistent with `docs/testing-guidelines.md` (80%+ target)
- [X] T019 Confirm no changes were made to `packages/backend`, `packages/frontend/src/services/todoService.js`, or any todo data model/API contract, per plan.md constraints

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories (the `isOverdue` utility is shared by US1, US2, US3)
- **User Story 1 (Phase 3)**: Depends only on Foundational — delivers the MVP
- **User Story 2 (Phase 4)**: Depends on Foundational; builds on the badge rendering added in US1 (T006), so should follow Phase 3 in practice even though it targets different assertions
- **User Story 3 (Phase 5)**: Depends on Foundational; builds on the badge rendering added in US1 (T006) and the recompute behavior confirmed in US2 (T011)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Within Each User Story

- Tests are written first and confirmed failing before the corresponding implementation task
- `TodoCard.js` changes (T006, T011, T014) are sequential since they modify the same file/behavior in sequence
- Each story's checkpoint task (test run) validates the story before moving to the next

### Parallel Opportunities

- T001 and T002 (Setup) can run in parallel
- T005 (US1 tests) can be written in parallel with T007 (CSS), since they touch different files, but both must land before T008
- T009 and T010 (US2 tests) can be written in parallel with each other
- T016 and T017 (Polish) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch these two in parallel once Foundational (T003, T004) is done:
Task: "Add Overdue badge test cases to packages/frontend/src/components/__tests__/TodoCard.test.js"
Task: "Add .todo-overdue-badge CSS rule to packages/frontend/src/App.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (`isOverdue` utility — CRITICAL, blocks all stories)
3. Complete Phase 3: User Story 1 (badge rendering)
4. **STOP and VALIDATE**: Run `npm run test:frontend` and manually verify quickstart.md scenarios 1–3
5. Demo if ready — this alone satisfies the feature's core value (SC-001, SC-002, SC-003)

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → validate independently → MVP demo-ready
3. Add User Story 2 → validate independently (toggle-complete and edit-due-date clear the badge)
4. Add User Story 3 → validate independently (live update via fake timers / manual clock test)
5. Polish → full quickstart.md pass, coverage check, confirm no backend/API drift

### Notes

- [P] tasks = different files, no dependencies
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
- No new dependencies, no backend changes, and no new stored fields are introduced anywhere in this task list, consistent with plan.md's constraints
