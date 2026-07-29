# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todo-indicator` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-overdue-todo-indicator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Add a derived, non-persisted "overdue" state to the existing Todo display: any incomplete
todo whose due date is earlier than the current local date is shown with an "Overdue" text
badge styled in the existing Danger color. The badge disappears immediately when the todo is
completed or its due date is edited to today/future, and a periodic (>= once per minute)
client-side timer re-evaluates overdue status while the todo list remains open so the badge
appears live without a page refresh. This is a frontend-only, UI-layer change: no new stored
fields, no API changes, and no backend involvement — overdue-ness is computed from the
existing `title`, `dueDate`, and `completed` fields already returned by the API.

## Technical Context

**Language/Version**: JavaScript (ES2020+), Node.js 16+ (existing monorepo runtime)

**Primary Dependencies**: React 18.2 / react-dom (existing); no new dependencies required —
overdue calculation is a plain JS utility function, and the live-update timer uses the
standard `setInterval`/`useEffect` pattern already idiomatic to this codebase

**Storage**: N/A — overdue is a derived/computed UI value, not persisted; existing backend
todo storage (Express API) is unchanged

**Testing**: Jest + `@testing-library/react`, colocated in `__tests__/` per
`docs/testing-guidelines.md`; unit tests for the overdue-calculation utility and
component tests for `TodoCard`/`TodoList` badge rendering and live-update behavior (using
Jest fake timers to simulate the periodic re-evaluation)

**Target Platform**: Web browser (desktop-focused React SPA), existing `packages/frontend`
Create React App build

**Project Type**: Web application (existing `packages/frontend` + `packages/backend`
monorepo) — this feature is frontend-only; `packages/backend` requires no changes

**Performance Goals**: Periodic re-evaluation timer must have negligible CPU/battery impact
(interval >= 60s, single shared timer per list view, cleared on unmount) — no measurable
impact on interaction responsiveness

**Constraints**: No new stored fields or API changes; must reuse the existing
`--danger-color` CSS variable (already defined for light and dark themes in
`packages/frontend/src/styles/theme.css`) rather than introducing new colors; overdue
indicator must not rely on color alone (text badge required) to satisfy WCAG 1.4.1 and the
constitution's accessibility principle; must remain distinguishable in both light and dark
modes (FR-009)

**Scale/Scope**: Single-user application with small todo lists; scope is limited to the
`TodoCard` (and, if needed, `TodoList`) components plus one new shared utility function —
no changes to `todoService.js`, the backend API, or the todo data model

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Result |
|---|---|---|
| I. Code Quality & Consistency | New `isOverdue` utility and `TodoCard` changes follow existing camelCase/PascalCase conventions, import ordering, and explicit error handling patterns already used in the codebase; no new lint warnings introduced | PASS |
| II. Test-First & Comprehensive Coverage | Unit tests planned for the overdue utility (all edge cases: no due date, today, future, past, completed) and component tests for `TodoCard` badge rendering plus the live-update timer (via Jest fake timers), colocated in `__tests__/` | PASS |
| III. User Experience Consistency | Reuses existing Danger color token and 8px spacing/typography scale; badge + color (not color-alone) satisfies accessibility; verified in both light/dark themes; no new confirmation-dialog or destructive-action concerns | PASS |
| IV. Functional Scope Discipline | Purely a derived display feature; no new stored fields, no API/data-model changes, no out-of-scope capability (notifications, filtering, etc.) introduced | PASS |
| V. Monorepo & Workflow Standards | Change is isolated to `packages/frontend`; `packages/backend` remains independently runnable/unchanged; work proceeds on the existing `001-overdue-todo-indicator` branch with atomic commits | PASS |

No violations identified. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todo-indicator/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

No `contracts/` directory is generated: this feature introduces no new/changed API endpoints
or other external interfaces (it is purely a client-side derived-display feature over data
the frontend already receives).

### Source Code (repository root)

```text
packages/frontend/
├── src/
│   ├── components/
│   │   ├── TodoCard.js              # MODIFIED: render "Overdue" badge next to/below due date
│   │   ├── TodoList.js              # Unchanged (renders TodoCard; no reordering)
│   │   └── __tests__/
│   │       └── TodoCard.test.js     # MODIFIED: add overdue badge + live-update test cases
│   ├── utils/
│   │   ├── overdue.js               # NEW: isOverdue(todo, now) pure helper function
│   │   └── __tests__/
│   │       └── overdue.test.js      # NEW: unit tests for all FR-001/003/004/005 cases
│   └── styles/
│       └── theme.css                # Unchanged: reuse existing --danger-color variable
└── package.json                     # Unchanged

packages/backend/                    # No changes required for this feature
```

**Structure Decision**: This is a frontend-only change within the existing
`packages/frontend` web app. A new `src/utils/overdue.js` pure function centralizes the
overdue calculation (used by `TodoCard`, and testable in isolation), and `TodoCard.js` gains
the badge markup plus the periodic re-evaluation timer. `packages/backend` and the todo data
model are untouched, consistent with the spec's Key Entities note that "overdue" is derived,
not stored.

## Complexity Tracking

*No constitution violations identified — this section is not applicable.*

