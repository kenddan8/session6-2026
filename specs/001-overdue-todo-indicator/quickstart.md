# Quickstart: Validate Overdue Todo Indicator

This guide validates the feature end-to-end once implemented. It does not include
implementation code — see [data-model.md](./data-model.md) for the derived-value contract and
[plan.md](./plan.md) for the file layout.

## Prerequisites

- Repo dependencies installed: `npm install` at the repo root (installs both workspaces)
- Node.js 16+

## Run the app

```bash
npm run start
```

This starts `packages/backend` (API) and `packages/frontend` (React app) together. Open the
frontend URL printed in the terminal.

## Manual validation scenarios

1. **Overdue todo is visually marked (User Story 1 / FR-001, FR-002)**
   - Create a todo with a due date set to yesterday (or any past date) and leave it
     incomplete.
   - Expected: the todo shows an "Overdue" badge styled in the Danger color, next to/below the
     due date.

2. **Due-today and future todos are not overdue (FR-004)**
   - Create one todo due today and one due next week.
   - Expected: neither shows the "Overdue" badge.

3. **No due date is never overdue (FR-003)**
   - Create a todo with no due date.
   - Expected: no "Overdue" badge, regardless of completion status.

4. **Completing a todo clears the badge (User Story 2 / FR-005, FR-006)**
   - Mark the overdue todo from scenario 1 as complete.
   - Expected: the "Overdue" badge disappears immediately; standard completed styling
     (strike-through, reduced opacity, success-colored checkbox) applies instead.
   - Mark it incomplete again.
   - Expected: the "Overdue" badge reappears (due date is still in the past).

5. **Editing due date re-evaluates overdue status (FR-007)**
   - Edit the overdue todo's due date to tomorrow.
   - Expected: the "Overdue" badge disappears immediately upon saving.

6. **Live update without refresh (User Story 3 / FR-010)**
   - Create a todo due today and leave the page open (no reload).
   - Simulate the date passing (e.g., temporarily change the system clock forward past
     midnight, or wait for it to occur naturally) without refreshing the page.
   - Expected: within about a minute of the due date passing, the todo becomes visually
     marked overdue without any manual refresh or interaction.

7. **Light/dark mode (FR-009)**
   - Toggle dark mode using the theme toggle.
   - Expected: the "Overdue" badge remains clearly visible/distinguishable using the
     dark-mode Danger color token.

## Automated test validation

```bash
npm run test:frontend
```

Expected new/updated test coverage:
- `packages/frontend/src/utils/__tests__/overdue.test.js` — unit tests for all
  `isOverdue` cases (no due date, due today, due future, due past + incomplete, due past +
  completed).
- `packages/frontend/src/components/__tests__/TodoCard.test.js` — renders the "Overdue" badge
  only when expected; badge disappears on toggle-complete and on due-date edit; verifies the
  periodic re-evaluation (using Jest fake timers) marks a todo overdue without a remount.

All tests must pass with no linter errors before this feature is considered complete, per the
constitution's Test-First & Comprehensive Coverage and Monorepo & Workflow Standards
principles.
