<!--
Sync Impact Report
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: N/A (initial adoption from placeholder template)
Added sections:
  - Core Principles: I. Code Quality & Consistency, II. Test-First & Comprehensive Coverage,
    III. User Experience Consistency, IV. Functional Scope Discipline,
    V. Monorepo & Workflow Standards
  - Additional Constraints (technology stack & persistence constraints)
  - Development Workflow (review, linting, testing gates)
  - Governance
Removed sections: None (template placeholders replaced with concrete content)
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending manual review (not modified by this command)
  - .specify/templates/spec-template.md ⚠ pending manual review (not modified by this command)
  - .specify/templates/tasks-template.md ⚠ pending manual review (not modified by this command)
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Confirmed as the date this constitution was first authored
    (2026-07-29) since no earlier ratification date exists in project history.
-->

# Todo App Constitution

## Core Principles

### I. Code Quality & Consistency
All code MUST follow the conventions defined in `docs/coding-guidelines.md`. This includes:
2-space indentation, `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants,
and `PascalCase` for React components and classes, with file names matching component names.
Imports MUST be grouped and ordered as external libraries, then internal modules, then styles,
separated by blank lines. Code MUST adhere to DRY, KISS, and SOLID principles: extract
repeated logic into shared utilities, prefer simple readable solutions over premature
optimization, and keep components/functions single-purpose. Error handling MUST be explicit
(try/catch around fallible operations with meaningful user-facing feedback) — silent failures
are NOT permitted. Comments MUST explain "why", not "what"; no stray `console.log` statements
or unresolved linter errors/warnings may be merged.
**Rationale**: Consistent style and disciplined structure keep a multi-package JavaScript
monorepo maintainable as contributors rotate through bootcamp sessions.

### II. Test-First & Comprehensive Coverage
Every new feature or bug fix MUST include automated tests before or alongside implementation,
per `docs/testing-guidelines.md`. Tests are colocated in `__tests__/` directories next to the
code under test and named `{filename}.test.js`. Unit tests MUST isolate the unit under test and
mock external dependencies; integration tests MUST verify real interactions between components
or between frontend and backend. The project targets 80%+ code coverage, with critical user
workflows (create, view, update, delete todo) held to 100% coverage. Tests MUST be independent,
deterministic, and free of shared mutable state between test cases. All tests MUST pass before
a pull request is opened or merged.
**Rationale**: A single-user todo app has a small, well-defined set of critical workflows;
rigorous test coverage on those paths prevents regressions as the app evolves across sessions.

### III. User Experience Consistency
All user-facing UI work MUST conform to `docs/ui-guidelines.md`: the defined light/dark color
palettes, typography scale, and 8px spacing grid, the single-column responsive layout (max
600px on larger screens), and the documented component patterns (todo card, input fields,
buttons, confirmation dialog). Destructive actions (e.g., deleting a todo) MUST show a
confirmation dialog before executing. Accessibility is NON-NEGOTIABLE: interactive elements
MUST be keyboard-accessible, color contrast MUST meet WCAG AA, and icon-only controls MUST have
descriptive `aria-label`s. The dark/light mode preference MUST persist via `localStorage` and
default to system preference on first visit.
**Rationale**: A documented design system prevents visual and interaction drift and keeps the
Halloween-themed todo app accessible and predictable for users.

### IV. Functional Scope Discipline
Feature work MUST stay within the scope defined in `docs/functional-requirements.md`: create,
view, update (status and details), and delete todo items, with title (required, ≤255 chars) and
optional due date, persisted via the backend API. Explicitly out-of-scope capabilities —
authentication, multi-user support, priorities/categories, recurring todos, reminders,
undo/redo, bulk operations, and advanced search/filtering — MUST NOT be added without first
amending `docs/functional-requirements.md` and this constitution. Any change request that
expands scope MUST be raised as a deliberate spec change, not folded silently into unrelated
work.
**Rationale**: A tightly scoped single-user todo app is the intended teaching vehicle for the
bootcamp; uncontrolled scope creep undermines that goal and destabilizes the codebase.

### V. Monorepo & Workflow Standards
The project MUST remain organized as an npm-workspaces monorepo with `packages/frontend` and
`packages/backend`, per `docs/project-overview.md`. Cross-package changes MUST keep both
packages independently runnable via their own scripts and jointly runnable via the root
`npm run start` / `npm test` scripts. Work MUST happen on feature branches (e.g.,
`feature/<short-description>`) with atomic, descriptively-messaged commits, merged via pull
request after review. Every pull request MUST have all tests passing and no outstanding
linter errors before merge.
**Rationale**: Consistent workspace structure and git workflow keep the bootcamp monorepo
approachable for new contributors joining each session.

## Additional Constraints

- **Technology stack**: React (frontend) and Express.js (backend) on Node.js, tested with Jest
  and, for frontend components, `@testing-library/react`. Introducing a new runtime framework
  or test runner requires a constitution amendment.
- **Persistence**: All todo data MUST be persisted through the existing backend API; the
  application remains single-user with no per-user data isolation.
- **No premature infrastructure**: Do not introduce authentication, databases beyond the
  existing persistence mechanism, or deployment tooling unless required by an approved spec.

## Development Workflow

- Code review is required for all pull requests; reviewers verify compliance with the Code
  Review Checklist in `docs/coding-guidelines.md` (naming, imports, DRY/SOLID, error handling,
  tests, commit quality).
- Linting MUST be run and all errors/warnings resolved before requesting review.
- Automated tests MUST be run locally (`npm test`) before opening a pull request; CI test
  failures block merge.
- UI changes MUST be visually verified against `docs/ui-guidelines.md` (light and dark mode)
  before requesting review.

## Governance

This constitution supersedes ad-hoc practices for this repository. All pull requests and code
reviews MUST verify compliance with the principles above; any deviation MUST be explicitly
justified in the pull request description and, if it reflects a lasting change in practice,
followed by a constitution amendment.

**Amendment procedure**: Amendments are proposed via pull request modifying this file, must
include an updated Sync Impact Report, and require review approval before merge, the same as
any other code change.

**Versioning policy**: This constitution follows semantic versioning:
- **MAJOR**: Backward-incompatible removal or redefinition of a principle or governance rule.
- **MINOR**: A new principle or materially expanded section is added.
- **PATCH**: Clarifications, wording fixes, or non-semantic refinements.

**Compliance review**: Any complexity or deviation introduced by a change (e.g., new
dependency, scope expansion, skipped tests) MUST be justified in the pull request and,
where it changes ongoing practice, MUST be reflected back into this constitution and the
relevant `docs/` guideline file.

**Version**: 1.0.0 | **Ratified**: 2026-07-29 | **Last Amended**: 2026-07-29
