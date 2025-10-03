# Quick Start Guide

## Running the Application

### Step 1: Set Node Version

```bash
nvm use 20
```

### Step 2: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 3: Install Dependencies (if not already done)

```bash
npm install
```

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Open in Browser

Open your browser and go to: `http://localhost:5173`

## What You'll See

### Shifts Tab (Default View)

- Date navigator with "Thu, Oct 2, 2025" displayed
- Filter options: All, Central Clinic, North Branch, East Branch
- **Clinic Roster** section showing:
  - **Central Clinic** (Downtown) - Present ✅
    - Doctor: Dr. Sarah Chen
    - Dental Assistant: Maya Patel
  - **North Branch** (Northside) - No Staff Assigned ⚠️
    - Doctor: Dr. James Wilson
    - Dental Assistant: Not assigned
  - **East Branch** (Eastwood) - Visiting 🟡
    - Doctor: Dr. Emily Brooks
    - Dental Assistant: Tom Harris
- **Other Staff** section showing unassigned staff with their status

### Staff Tab

- List of all 8 staff members
- Details: Name, Role, Email, Primary Clinic, Weekly Off day
- Active/Inactive status badges
- Edit buttons for each staff member

### Leave Tab

- Filter options: All, Pending, Approved, Rejected
- Leave request cards showing:
  - Staff name
  - Status with color-coded badges
  - Leave type (Planned/Emergency)
  - Date range
  - Reason and notes
  - Approve/Reject buttons for pending requests

## Mock Data Overview

### Clinics (3)

1. Central Clinic - Downtown
2. North Branch - Northside
3. East Branch - Eastwood

### Staff (20)

- **Doctors (10)**

  - Dr. Sarah Chen (Central Clinic)
  - Dr. Michael Smith (Central Clinic)
  - Dr. Rachel Kim (Central Clinic) - On leave Sept 30 - Oct 1
  - Dr. David Patel (Central Clinic)
  - Dr. James Wilson (North Branch)
  - Dr. Emily Brooks (North Branch)
  - Dr. Kevin Lee (North Branch)
  - Dr. Amanda Johnson (East Branch)
  - Dr. Thomas Nguyen (East Branch)
  - Dr. Linda Harris (East Branch)

- **Dental Assistants (10)**
  - Maya Patel (Central Clinic) - Pending leave Oct 5-6
  - Jessica Wong (Central Clinic)
  - Carlos Rivera (Central Clinic)
  - Lisa Brown (North Branch) - On leave Oct 2-3
  - Anna Lee (North Branch)
  - Robert Garcia (North Branch)
  - Sophia Martinez (North Branch)
  - Tom Harris (East Branch)
  - Nicole Anderson (East Branch)
  - Brian Taylor (East Branch)

### Shift Assignments (Oct 2, 2025)

**NONE** - All clinics start empty. Users assign staff through the UI.

### Leave Requests (3)

1. Lisa Brown - Oct 2-3, 2025 (Approved, Planned)
2. Dr. Rachel Kim - Sept 30 - Oct 1, 2025 (Approved, Planned)
3. Maya Patel - Oct 5-6, 2025 (Pending, Planned)

## Navigation

Use the tabs at the top to switch between:

- 📅 **Shifts** - Daily shift roster view
- 👥 **Staff** - Staff management
- 📋 **Leave** - Leave request management

## Testing Features

### Date Navigation

- Click the left arrow (◀) to go to the previous day
- Click the right arrow (▶) to go to the next day
- Click "Go to Today" to return to the current date

### Filtering

- Click "Filter" buttons to show only specific clinics
- Click "All" to show all clinics

### Status Indicators

Watch for these status badges:

- ✅ **Present** (Green) - Staff at their primary clinic
- 🟡 **Visiting** (Orange) - Staff at a non-primary clinic
- ⚠️ **No Staff Assigned** (Red) - Missing doctor or DA
- ❌ **Weekly Off** (Gray) - Staff's day off
- 🟣 **Approved Leave** (Purple) - On approved leave
- ⚠️ **Unapproved Leave** (Yellow) - Pending leave request

## Next Steps

Currently, the application uses mock data. The next phase will include:

1. Backend integration with Supabase
2. Real database operations
3. User authentication
4. Real-time updates
5. Advanced features (auto-populate, notifications, etc.)

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port (5174, 5175, etc.)

### Changes Not Reflecting

- Make sure the dev server is running
- Try refreshing the browser (Cmd+R or Ctrl+R)
- Check the terminal for any errors

### Module Not Found Errors

```bash
cd frontend
rm -rf node_modules
npm install
```

## Support

For issues or questions:

1. Check the console for error messages
2. Review the README.md files
3. Check the Tech_spec.md for implementation details
4. Contact the development team

---

Happy coding! 🚀
