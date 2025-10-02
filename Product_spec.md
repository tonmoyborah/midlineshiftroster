
# Technical Specification - Midline Shift Roster

## 1. Overview
This document defines the technical standards, repository conventions, and operational guidelines for the Midline Shift Roster project. It must be updated with every meaningful change to the codebase or process.

## 2. Repository
- Hosting: GitHub
- URL: `https://github.com/tonmoyborah/midlineshiftroster`
- Default branch: `main`
- Visibility: Public (as per current repository state)

## 3. Branching & Version Control
- Default branch: `main`
- Feature branches: `feature/<short-kebab-summary>`
- Fix branches: `fix/<short-kebab-summary>`
- Release branches (if/when applicable): `release/<version>`
- Tagging: Semantic versioning `vMAJOR.MINOR.PATCH` once releases begin

## 4. Commit Conventions
- Conventional Commits format:
  - `feat: ...` new user-facing functionality
  - `fix: ...` bug fixes
  - `chore: ...` tooling, config, or repo maintenance
  - `docs: ...` documentation changes only
  - `refactor: ...` code changes that neither fix a bug nor add a feature
  - `test: ...` adding or correcting tests
- Scope is optional but recommended, e.g., `feat(api): add shift generation endpoint`

## 5. Code Style & Quality
- Follow explicit naming, early returns, and clear control flow.
- Avoid placeholders and mock data without explicit approval.
- Add concise comments for non-trivial logic explaining the "why".
- Keep formatting consistent and avoid unrelated reformatting.

## 6. Tooling
- VCS: Git
- CI/CD: To be defined
- Language/Framework: To be defined (this spec will be updated once chosen)

## 7. Directory Structure (initial)
```
midlineshiftroster/
  README.md
  Tech_spec.md
  .gitignore
```

## 8. Security & Secrets
- Do not commit secrets.
- Use environment-specific secret stores or GitHub Actions secrets when CI/CD is added.

## 9. Next Steps
- Define the project’s language/runtime and initialize the build tooling.
- Establish CI (linting, tests) once the stack is selected.
- Update this `Tech_spec.md` to reflect stack-specific standards and folder structure.

## 10. Product Specification (v1)

A clean, minimal interface focused on showing a specific day's shift status, not a full calendar. No calendar grid, no dashboard — just a streamlined daily shift viewer and editor.

### Staff Management
- Add/edit staff
  - Name
  - Role (Doctor / Dental Assistant)
  - Primary Clinic
  - Standard working days (Mon–Sun flags)
  - Weekly off day

### View Shifts (Day-Wise Clinic-Centric View)
- Select a date (defaults to today)
- View all 3 clinics with assigned Doctor & DA for that date
  - ⚠️ No staff (if no staff assigned)
  - ✅ Present (regular duty)
  - 🟡 Visiting (inter-branch)
- Below, a list of the rest of the staff members with status indicators:
  - ⚠️ Unapproved leave
  - ❌ On weekly off
  - 🟣 Approved leave
- Optional note per staff (e.g., "Camp duty", "Late arrival")

### Auto-Populate Shifts
- Uses standard working days
- Excludes approved leave
- Applies inter-branch overrides
- Ensures minimum staffing per clinic per day

### Leave Management
- Staff can request leave (date range, type: planned/emergency)
- Admin can approve/reject
- Approved leave removes staff from that day’s roster
- Admin can add approved leave manually as well if staff are not able to request

### Inter-Branch Assignment
- Admin can assign a staff member to another clinic on a specific date
- Overrides primary assignment and marks them as visiting

### Manual Shift Override
- Admin can edit Doctor or DA assigned for a clinic on a specific date
- Dropdown selection from eligible staff
- Add optional note

### Filter & Navigation
- Change date to view any past or future roster
- Filter by:
  - Clinic 