# Multi-Staff Implementation - Complete Guide

## Overview

The system has been updated to support **multiple doctors and dental assistants** per clinic per day, replacing the previous one-doctor-one-assistant limitation.

## Key Changes

### 1. Database Changes ✅

**New SQL Function**: `roster_function_multi_staff.sql`

- Returns arrays of doctors and dental assistants (JSONB format)
- Supports multiple staff members per clinic
- Automatically filters inactive staff

**Run this SQL in Supabase:**

```bash
supabase/sql/roster_function_multi_staff.sql
```

### 2. Frontend Changes ✅

**TypeScript Types Updated:**

- `ClinicRoster` now has `doctors: Staff[]` and `dental_assistants: Staff[]` (arrays instead of single objects)

**New Component: `ManageStaffModal`**

- Shows currently assigned staff with "Remove" buttons
- Allows adding multiple staff members
- Shows available staff (filtered by role and status)

**Updated Components:**

- `ClinicCard` - Now displays comma-separated staff names
- `DailyShifts` - Uses new ManageStaffModal with add/remove functionality
- `shifts.service.ts` - Parses JSONB arrays from database

## New Workflow

### How It Works

1. **View Clinics**: Each clinic shows all assigned doctors and assistants comma-separated

   - Example: "Dr. Smith, Dr. Johnson, Dr. Williams"

2. **Manage Staff**: Click the edit button to open the management modal

   - **Top Section**: Shows currently assigned staff with "Remove" buttons
   - **Bottom Section**: Shows dropdown to add new staff

3. **Add Staff**: Select from dropdown and click "Add Doctor" / "Add Dental Assistant"

4. **Remove Staff**: Click the trash icon next to any assigned staff member

### Staff Availability Rules

**Staff CANNOT be assigned if:**

- They are on approved leave for that date
- It's their weekly off day
- They are inactive

**Staff CAN be assigned:**

- They are marked as "available"
- They have pending (unapproved) leave (admin discretion)

## Implementation Details

### Database Structure

```sql
-- Function returns:
{
  clinic_id: UUID,
  clinic_name: VARCHAR,
  clinic_location: VARCHAR,
  doctors: JSONB[],           -- Array: [{id, name}, {id, name}, ...]
  dental_assistants: JSONB[], -- Array: [{id, name}, {id, name}, ...]
  notes: TEXT,
  status: VARCHAR             -- 'present', 'visiting', 'no_staff'
}
```

### Frontend Data Flow

1. `useRosterForDate(date)` → Fetches roster with arrays
2. `shifts.service.ts` → Parses JSONB to Staff objects
3. `ClinicCard` → Displays comma-separated names
4. `ManageStaffModal` → Allows add/remove operations

## Testing Steps

### 1. Run the SQL Function

```sql
-- In Supabase SQL Editor
\i supabase/sql/roster_function_multi_staff.sql
```

### 2. Test the Function

```sql
SELECT * FROM public.get_clinic_roster_for_date('2025-10-02');
```

Expected output: JSONB arrays for doctors and dental_assistants

### 3. Test in UI

**Test Multiple Assignments:**

1. Go to Shifts page (Oct 2, 2025)
2. Click edit button on any clinic
3. Add multiple doctors using the dropdown
4. Verify comma-separated names appear
5. Remove one doctor using trash icon
6. Verify it disappears from the list

**Test Staff Availability:**

1. Try to add Lisa Brown on Oct 2 (she's on approved leave)
2. She should NOT appear in the dropdown
3. Try to add Dr. Kevin Lee on Oct 2 (it's his weekly off)
4. He should NOT appear in the dropdown

### 4. Verify Other Staff Section

- Staff on leave should show "On approved leave" badge
- Staff on weekly off should show "Weekly off" badge
- Available staff should show "Available" badge

## Status Badges

| Status              | Meaning               | Can Assign?         |
| ------------------- | --------------------- | ------------------- |
| Available           | Free to work          | ✅ Yes              |
| On approved leave   | Approved leave period | ❌ No               |
| On unapproved leave | Pending approval      | ⚠️ Admin discretion |
| Weekly off          | Scheduled day off     | ❌ No               |

## Files Modified

### New Files

- `frontend/src/components/shifts/ManageStaffModal.tsx`
- `supabase/sql/roster_function_multi_staff.sql`
- `MULTI_STAFF_IMPLEMENTATION.md` (this file)

### Modified Files

- `frontend/src/types/models.ts` - Updated ClinicRoster interface
- `frontend/src/services/shifts.service.ts` - Parse JSONB arrays
- `frontend/src/components/shifts/ClinicCard.tsx` - Display multiple staff
- `frontend/src/pages/DailyShifts.tsx` - Use ManageStaffModal

### Deprecated Files

- `frontend/src/components/shifts/AssignStaffModal.tsx` - No longer used (kept for reference)

## Future Enhancements

### Suggested Improvements

1. **Auto-Assignment Logic**

   - Add a database trigger or function to auto-assign staff to their primary clinic
   - Respect leave and weekly off constraints
   - Run when viewing a new date

2. **Bulk Assignment**

   - Add "Assign All Available" button
   - Automatically assigns all available staff to their primary clinics

3. **Assignment Templates**

   - Save common assignment patterns
   - Apply templates to multiple days

4. **Staff Workload Balance**

   - Show how many shifts each staff member has this week/month
   - Warn if overworking or underutilizing staff

5. **Drag & Drop**
   - Drag staff from "Other Staff" section directly to clinics
   - Visual assignment interface

## Troubleshooting

### Issue: "doctors is undefined"

**Solution**: Make sure you ran `roster_function_multi_staff.sql` in Supabase

### Issue: Staff showing as comma-separated but can't remove

**Solution**: Hard refresh browser (Cmd+Shift+R) to clear old JavaScript

### Issue: Can't add staff even though they're available

**Solution**: Check the console for errors. Verify `useRemoveAssignment` hook is imported

### Issue: Modal shows "No available staff"

**Solution**: Check if all staff are assigned, on leave, or on weekly off for that date

## API Reference

### New Hooks

```typescript
import { useRemoveAssignment } from '../hooks/useShifts';

const { removeAssignment, loading } = useRemoveAssignment();

// Usage
await removeAssignment(clinicId, staffId, date);
```

### Updated Interfaces

```typescript
interface ClinicRoster {
  clinic: Clinic;
  doctors: Staff[]; // Changed from: doctor: Staff | null
  dental_assistants: Staff[]; // Changed from: dental_assistant: Staff | null
  status: 'present' | 'visiting' | 'no_staff';
  notes: string | null;
}
```

## Summary

✅ **Completed:**

- Multiple staff per clinic support
- Comma-separated display
- Add/Remove staff functionality
- Status-based availability filtering
- Updated database function
- New management modal

⏳ **Next Steps:**

1. Run the SQL function in Supabase
2. Test the new UI
3. Verify staff can't be assigned when on leave/weekly off
4. Consider adding auto-assignment logic

---

**Need Help?** Check the console logs in browser DevTools for debugging information.
