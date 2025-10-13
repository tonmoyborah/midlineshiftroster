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
- View all 3 clinics with their status and assigned Doctor & DA for the selected date:
  - ⚠️ No staff (if no staff assigned)
  - ✅ Open (clinic is open and staffed)
  - 🔒 Closed (clinic is closed for the day)

- Below, display the rest of the staff members with status indicators:
  - 🔴 Unapproved leave (leave requested but not approved, or marked absent by admin)
  - 🟣 Weekly off/Holiday
  - 🟣 Approved leave
  - 🟢 Present (on duty at their primary clinic)
  - 🟡 Visiting (assigned to another clinic/inter-branch)
- Optional note per staff (e.g., "Camp duty", "Late arrival")

### Auto-Populate Shifts
- Uses standard working days
- Excludes approved leave
- Applies inter-branch overrides
- Ensures minimum staffing per clinic per day

### Leave Management
- Staff can request leave (date range, type: planned/emergency)
- Admin can approve/reject leave requests
- **Admin can create leaves manually:**
  - Create approved leaves (pre-approved vacations)
  - Create pending/unapproved leaves on behalf of staff
- **Admin can mark unapproved absences:**
  - Mark staff as absent for specific dates (no-show, etc.)
  - Uses separate `unapproved_absences` table
- **Leave Status Hierarchy:**
  1. **Weekly Off**: Staff's designated weekly off day
  2. **Approved Leave**: Admin-approved leave requests (status='approved')
  3. **Unapproved Leave**: Pending leave requests OR manually marked absences
  4. **Rejected Leave**: Makes staff available/active (not on leave)
  5. **Present**: Assigned to primary clinic
  6. **Visiting**: Assigned to non-primary clinic
  7. **Available**: Active staff, not assigned, no leaves (should be auto-assigned)

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

### Homepage & Navigation ✅ NEW

**URL:** `/` (Homepage)

A modern, dual-purpose landing page that serves as the main entry point for both administrators and staff members.

**Purpose:**
- Provide clear, intuitive navigation for two distinct user types
- No confusion about where to go or what to do
- Professional, welcoming first impression

**Two Main Sections:**

1. **Admin Portal Card**
   - Leads to `/admin-login` for secure administrator access
   - Lists key admin features (shift management, staff management, leave approval)
   - Requires authentication credentials
   - Styled with indigo theme to distinguish from staff section

2. **Staff Leave Application Card**
   - Leads to `/staff-leave-request` for public leave requests
   - Highlights no-login-required feature
   - Lists key benefits (quick application, instant reference number)
   - Styled with green theme matching system branding

**Design Features:**
- Modern gradient background with green theme
- Card-based layout with hover effects
- Responsive design for mobile and desktop
- Clear iconography (Lucide React icons)
- Information section showing system capabilities
- Professional footer

**Navigation Flow:**
- Homepage (/) → Admin Login (/admin-login) → Admin Dashboard (/admin/shifts)
- Homepage (/) → Staff Leave Request (/staff-leave-request) → Form submission
- Back-to-home buttons on all public pages for easy navigation

**Benefits:**
- Reduces confusion for first-time users
- Clear separation between admin and staff functions
- Professional appearance for external-facing system
- Easy to share homepage URL with staff
- Mobile-friendly for smartphone access

---

### Staff Leave Application (Self-Service) ✅ NEW

**URL:** `/staff-leave-request`

A public, shareable form where staff can submit leave requests without logging in.

**Features:**
- **No Login Required**: Open access via shareable URL
- **Mobile Optimized**: Designed for smartphone usage (primary use case)
- **Simple Flow**: 
  1. Select your name from dropdown
  2. Pick leave start and end dates
  3. Check if emergency or weekly off
  4. Provide reason (min 10 characters)
  5. Submit
- **Instant Confirmation**: Get unique reference number (e.g., LR-2025-ABC12345)
- **Admin Approval**: All requests appear in admin Leave Management panel
- **Status Tracking**: Requests start as "pending" and require admin approval

**Use Cases:**
- Staff can request leave anytime, anywhere (via smartphone)
- Reduces back-and-forth calls/texts with admin
- Provides paper trail for leave requests
- Reference numbers for tracking and follow-up

**Security:**
- Anonymous submissions only create pending requests
- Admin approval required for all leave requests
- Only active staff can be selected
- No sensitive data exposed (only staff names visible)

**Integration:**
- Submissions flow directly into existing Leave Management page
- Uses existing leave approval/rejection workflow
- No changes to admin interface needed
- Follows same leave status rules as manual entries

**Shareable Link:**
- Can be shared via WhatsApp, SMS, or email
- Can be printed as QR code for staff room
- Works on any device with browser
- No app installation required

---

**End of Product Specification**
