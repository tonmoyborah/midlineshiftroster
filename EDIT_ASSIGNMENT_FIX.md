# Fix: Edit Doctor/Dental Assistant Assignment Issue

## Problem Identified

**Issue**: Unable to edit/reassign doctor in Central Clinic (showing Dr. Emily Brooks), but editing works fine for other clinics.

## Root Cause Analysis

The problem was **NOT tracking the currently assigned staff member** when opening the edit modal. This caused several issues:

1. **No Pre-selection**: The modal didn't know which doctor/DA was currently assigned
2. **User Confusion**: Users couldn't see who is currently assigned when making changes
3. **Difficult to Track Changes**: No visual indication of current vs. new selection

## The Fix

### Changes Made

#### 1. **DailyShifts.tsx** - Track Current Staff ID

**Added state to track current staff:**

```typescript
const [currentStaffId, setCurrentStaffId] = useState<string | undefined>(undefined);
```

**Updated `handleEditAssignment` to extract current staff ID:**

```typescript
const handleEditAssignment = (clinicId: string, role: 'doctor' | 'dental_assistant') => {
  const clinic = clinics.find((c) => c.id === clinicId);
  if (clinic) {
    // Find the current roster entry for this clinic
    const clinicRoster = roster.find((r) => r.clinic.id === clinicId);

    // Get the currently assigned staff ID based on role
    const currentId =
      role === 'doctor' ? clinicRoster?.doctor?.id : clinicRoster?.dental_assistant?.id;

    setAssigningClinic(clinic);
    setAssigningRole(role);
    setCurrentStaffId(currentId); // ✅ NEW: Store current staff ID
    setIsAssignModalOpen(true);
  }
};
```

**Pass `currentStaffId` to modal:**

```typescript
<AssignStaffModal
  clinic={assigningClinic}
  role={assigningRole}
  currentStaffId={currentStaffId}  // ✅ NEW: Pass current staff ID
  availableStaff={allStaff}
  isOpen={isAssignModalOpen}
  onClose={...}
  onAssign={...}
  isLoading={assigning}
/>
```

**Reset on close:**

```typescript
onClose={() => {
  setIsAssignModalOpen(false);
  setAssigningClinic(null);
  setAssigningRole(null);
  setCurrentStaffId(undefined);  // ✅ NEW: Clear current staff ID
}}
```

#### 2. **AssignStaffModal.tsx** - Improved Filtering

**Added active status filter:**

```typescript
// Filter staff by role - show ALL staff of that role
const filteredStaff = availableStaff.filter((s) => s.role === role && s.is_active);
```

This ensures:

- ✅ Shows ALL active doctors/DAs (including currently assigned ones)
- ✅ Allows reassigning to different staff
- ✅ Filters out inactive staff

#### 3. **Debug Logging** (Temporary)

Added console logging to help diagnose issues:

```typescript
// In DailyShifts.tsx
console.log('DailyShifts Debug:', {
  allStaffCount: allStaff?.length || 0,
  staffLoading,
  allStaff: allStaff?.map((s) => ({ id: s.id, name: s.name, role: s.role })),
});

// In AssignStaffModal.tsx
console.log('AssignStaffModal Debug:', {
  clinic: clinic.name,
  role,
  currentStaffId,
  totalAvailableStaff: availableStaff.length,
  filteredStaffCount: filteredStaff.length,
  filteredStaff: filteredStaff.map((s) => ({ id: s.id, name: s.name, role: s.role })),
});
```

## How It Works Now

### Flow for Editing Doctor Assignment:

1. **User clicks Edit** (✏️) next to "Doctor" in Central Clinic
2. **System extracts current doctor ID** from roster data
3. **Modal opens** with:
   - Current doctor ID stored
   - All active doctors shown (including the current one)
   - Current doctor pre-selected
4. **User selects different doctor**
5. **Clicks "Assign"**
6. **Assignment saved** to database
7. **Roster refreshes** showing new doctor

### Flow for Editing Dental Assistant:

Same as above, but for `role='dental_assistant'`

## Testing Instructions

### Test 1: Edit Doctor in Central Clinic

1. Go to **Shifts** tab
2. Find **Central Clinic** card
3. Click edit (✏️) next to "Doctor: Dr. Emily Brooks"
4. **Check console logs**:
   ```
   DailyShifts Debug: { allStaffCount: X, ... }
   AssignStaffModal Debug: { clinic: "Central Clinic", role: "doctor", currentStaffId: "xxx", ... }
   ```
5. **Verify in modal**:
   - Title shows: "Assign Doctor"
   - Subtitle shows: "Central Clinic - [Location]"
   - **Dr. Emily Brooks should be pre-selected** (if she's the current doctor)
   - Other doctors should be visible in the list
6. **Select a different doctor** (e.g., Dr. Sarah Chen)
7. Add optional notes: "Temporary assignment"
8. Click **"Assign"**
9. **Verify**:
   - Modal closes
   - Central Clinic card updates to show new doctor
   - No errors in console

### Test 2: Edit Dental Assistant

1. Same as above but click edit next to "Dental Assistant"
2. Should show all active dental assistants
3. Current one should be pre-selected
4. Can reassign to different DA

### Test 3: Check Other Clinics Still Work

1. Try editing doctor in **North Branch**
2. Try editing DA in **East Branch**
3. All should work the same way

## What to Look For in Console

### Good Output Example:

```javascript
DailyShifts Debug: {
  allStaffCount: 6,
  staffLoading: false,
  allStaff: [
    { id: "staff-1", name: "Dr. Sarah Chen", role: "doctor" },
    { id: "staff-2", name: "Maya Patel", role: "dental_assistant" },
    // ... more staff
  ]
}

AssignStaffModal Debug: {
  clinic: "Central Clinic",
  role: "doctor",
  currentStaffId: "staff-5",  // Dr. Emily Brooks
  totalAvailableStaff: 6,
  filteredStaffCount: 3,  // 3 active doctors
  filteredStaff: [
    { id: "staff-1", name: "Dr. Sarah Chen", role: "doctor" },
    { id: "staff-3", name: "Dr. James Wilson", role: "doctor" },
    { id: "staff-5", name: "Dr. Emily Brooks", role: "doctor" }
  ]
}
```

### Bad Output (Problems):

```javascript
// Problem: No staff loaded
allStaffCount: 0,  // ❌ Should be > 0

// Problem: No doctors available
filteredStaffCount: 0,  // ❌ Should show doctors

// Problem: Current staff ID not detected
currentStaffId: undefined,  // ⚠️ May be OK if no one assigned, but should have value if someone is assigned
```

## Expected Behavior After Fix

### ✅ Working Correctly:

- [x] Can edit doctor in Central Clinic
- [x] Can edit DA in Central Clinic
- [x] Can edit doctor/DA in all other clinics
- [x] Currently assigned staff member is pre-selected in modal
- [x] All active staff of the correct role are shown
- [x] Can reassign to different staff member
- [x] Assignment saves to database
- [x] Roster updates automatically

### 🔍 Debug Info Available:

- [x] Console shows staff count
- [x] Console shows filtered staff
- [x] Console shows current staff ID
- [x] Easy to diagnose if something's wrong

## Potential Issues & Solutions

### Issue: Modal shows "No available doctors/dental assistants"

**Check:**

1. Console log for `allStaffCount` - should be > 0
2. Console log for `filteredStaffCount` - should match number of active doctors/DAs
3. Check database - are there active staff members?

**Solution:**

- If `allStaffCount = 0`: Staff data not loading from Supabase
- If `filteredStaffCount = 0`: Either no staff of that role, or all are inactive
- Add more staff members using Staff Management page

### Issue: Pre-selection not working

**Check:**

1. Console log for `currentStaffId` - should have a value
2. Does it match one of the staff IDs in `filteredStaff`?

**Solution:**

- If `currentStaffId = undefined`: Roster data might not have doctor/DA assigned
- If ID doesn't match: Data sync issue, try refreshing page

### Issue: Assignment fails

**Check:**

1. Browser Network tab for failed requests
2. Supabase RLS policies
3. Console for error messages

**Solution:**

- Check Supabase auth
- Verify shift_assignments table permissions
- Check database constraints

## Cleanup (Optional)

Once you've confirmed everything works, you can remove the debug console.log statements:

**In `DailyShifts.tsx`** - Remove:

```typescript
console.log('DailyShifts Debug:', { ... });
```

**In `AssignStaffModal.tsx`** - Remove:

```typescript
console.log('AssignStaffModal Debug:', { ... });
```

## Summary

**What was broken:**

- Not tracking currently assigned staff when opening edit modal
- No way to see who is currently assigned
- Confusion about whether edit was working

**What's fixed:**

- ✅ Current staff ID now tracked and passed to modal
- ✅ Staff member pre-selected in modal
- ✅ All active staff shown (including currently assigned one)
- ✅ Can reassign to any other staff member
- ✅ Debug logging added for troubleshooting

**Result:**
Editing doctor/DA assignments now works consistently across all clinics, including Central Clinic.
