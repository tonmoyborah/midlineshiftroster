# Automatic Staff Assignment - Implementation Guide

## ✅ Feature: Auto-Assignment on Page Load

Staff are now **automatically assigned** to their primary clinics when:

- The Shifts page loads
- You change to a different date
- The date has no staff assignments yet

**No button click needed!** 🎉

## How It Works

### Trigger Conditions

The auto-assignment runs automatically when ALL of these are true:

1. ✓ The roster has finished loading
2. ✓ No clinics have any staff assigned yet
3. ✓ At least one clinic exists

### Assignment Logic

For each active staff member:

- ✅ **Assign** to `primary_clinic_id` (if not on leave/weekly off)
- ❌ **Skip** if on approved leave for that date
- ❌ **Skip** if it's their weekly off day
- ❌ **Skip** if already assigned to any clinic
- ❌ **Skip** if inactive

### Visual Feedback

Check the browser console to see:

```
No assignments found. Auto-assigning staff...
✅ Auto-assigned 15 staff, skipped 5
```

## User Experience

### Scenario 1: Loading Shifts Page

1. User navigates to Shifts page (Oct 2, 2025)
2. Page loads → Auto-assignment runs
3. All clinics now show assigned staff
4. No action needed from user

### Scenario 2: Changing Dates

1. User is on Oct 2 (staff already assigned)
2. User clicks forward to Oct 3
3. Oct 3 has no assignments → Auto-assignment runs
4. All clinics now show staff for Oct 3

### Scenario 3: Manual Changes Preserved

1. User is on Oct 2 (staff already assigned)
2. User manually removes Dr. Smith
3. User manually adds Dr. Johnson
4. Page refresh → Auto-assignment **DOES NOT RUN** (assignments exist)
5. Manual changes are preserved ✅

## Implementation Details

### Frontend Code (DailyShifts.tsx)

```typescript
// Auto-assign staff when page loads or date changes
useEffect(() => {
  const autoAssignIfNeeded = async () => {
    // Wait for initial roster load
    if (rosterLoading) return;

    // Check if any clinics have staff assigned
    const hasAssignments = roster.some(
      (r) => r.doctors.length > 0 || r.dental_assistants.length > 0,
    );

    // Only auto-assign if no assignments exist for this date
    if (!hasAssignments && roster.length > 0) {
      console.log('No assignments found. Auto-assigning staff...');
      const result = await autoAssign(selectedDate);

      if (result) {
        console.log(
          `✅ Auto-assigned ${result.assigned_count} staff, skipped ${result.skipped_count}`,
        );
        // Refresh data
        await refetchRoster();
        await refetchUnassigned();
      }
    }
  };

  autoAssignIfNeeded();
}, [selectedDate, rosterLoading, roster.length]);
```

### Database Function

```sql
public.auto_assign_staff_to_primary_clinics(p_date DATE)
```

Same function as before, just called automatically instead of via button.

## Benefits

| Benefit                         | Description                                 |
| ------------------------------- | ------------------------------------------- |
| 🚀 **Zero clicks**              | Staff assigned automatically on page load   |
| 💾 **Manual changes preserved** | Only runs when no assignments exist         |
| 🔄 **Works for all dates**      | Auto-assigns when navigating between dates  |
| 🎯 **Smart filtering**          | Respects leave, weekly off, inactive status |
| 📊 **Console feedback**         | See assignment results in browser console   |

## Testing Steps

### 1. Run SQL in Supabase

```sql
-- Copy entire contents of:
supabase/sql/auto_assign_staff.sql
-- Run in Supabase SQL Editor
```

### 2. Run Multi-Staff Function (if not done)

```sql
-- Copy entire contents of:
supabase/sql/roster_function_multi_staff.sql
-- Run in Supabase SQL Editor
```

### 3. Clear Existing Assignments

```sql
-- Optional: Clear assignments for testing
DELETE FROM shift_assignments WHERE shift_date = '2025-10-02';
```

### 4. Test Auto-Assignment

1. Open browser console (F12)
2. Navigate to Shifts page
3. Look for console message: "No assignments found. Auto-assigning staff..."
4. Verify all clinics show assigned staff
5. Check console for: "✅ Auto-assigned X staff, skipped Y"

### 5. Test Date Navigation

1. Clear assignments for Oct 3: `DELETE FROM shift_assignments WHERE shift_date = '2025-10-03';`
2. In app, click forward to Oct 3
3. Console shows auto-assignment message
4. All clinics for Oct 3 now have staff

### 6. Test Manual Changes Preserved

1. Manually remove a doctor from a clinic
2. Refresh the page
3. Doctor stays removed (auto-assignment doesn't run)
4. Manual changes are preserved ✅

## Console Output Examples

### Successful Auto-Assignment

```
No assignments found. Auto-assigning staff...
✅ Auto-assigned 15 staff, skipped 5
```

### No Auto-Assignment Needed

```
(no console messages - assignments already exist)
```

### Auto-Assignment with Many Skipped

```
No assignments found. Auto-assigning staff...
✅ Auto-assigned 10 staff, skipped 10
```

## Edge Cases

### Case 1: All Staff on Leave

**Result:** Auto-assignment runs but assigns 0 staff

```
✅ Auto-assigned 0 staff, skipped 20
```

### Case 2: No Staff Have Primary Clinic

**Result:** Auto-assignment runs but assigns 0 staff

```
✅ Auto-assigned 0 staff, skipped 0
```

### Case 3: Staff Already Manually Assigned

**Result:** Auto-assignment doesn't run (assignments exist)

### Case 4: Partial Manual Assignment

**Result:** Auto-assignment doesn't run (assignments exist)

- Even if only 1 staff assigned, auto-assignment won't run
- This preserves partial manual changes

## Troubleshooting

### Issue: Auto-assignment not running

**Check:**

1. Browser console for errors
2. Verify SQL function exists in Supabase
3. Check if assignments already exist for that date
4. Verify staff have `primary_clinic_id` set

### Issue: Staff assigned twice

**This shouldn't happen** - the function has:

- `ON CONFLICT DO NOTHING` clause
- Check for existing assignments before inserting

### Issue: Wrong staff assigned

**Check:**

1. Staff `primary_clinic_id` values in database
2. Staff `weekly_off_day` values
3. Leave requests for that date

### Issue: Console shows assignment but UI doesn't update

**Solution:**

1. Check network tab for API errors
2. Hard refresh browser (Cmd+Shift+R)
3. Check roster refetch is working

## Configuration

### Disable Auto-Assignment (if needed)

Comment out the useEffect in `DailyShifts.tsx`:

```typescript
// useEffect(() => {
//   const autoAssignIfNeeded = async () => {
//     ...
//   };
//   autoAssignIfNeeded();
// }, [selectedDate, rosterLoading, roster.length]);
```

### Change Auto-Assignment Conditions

Modify the condition in useEffect:

```typescript
// Current: Only if NO assignments
if (!hasAssignments && roster.length > 0)

// Alternative: Always run (overwrites existing)
if (roster.length > 0)

// Alternative: Only if less than 50% assigned
if (assignmentPercentage < 0.5 && roster.length > 0)
```

## Summary

✅ **Automatic:** Staff assigned on page load/date change
✅ **Smart:** Only when no assignments exist
✅ **Safe:** Manual changes are preserved
✅ **Transparent:** Console logs show what happened
✅ **Efficient:** Single database call, batch insert

**No user action required!** Staff are ready when you open the page. 🎉

---

## Files Modified

- `frontend/src/pages/DailyShifts.tsx` - Added useEffect for auto-assignment
- `supabase/sql/auto_assign_staff.sql` - Database function (restored)

## Previous Files (No Longer Needed)

- Auto-assign button removed from UI
- `handleAutoAssign` function removed
- Manual trigger no longer needed
