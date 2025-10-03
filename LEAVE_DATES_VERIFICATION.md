# Leave Dates Verification and Fix Guide

## 🔍 Issue Reported

You noticed inconsistencies in leave dates:

- **Database says**: Lisa Brown - Oct 2 to Oct 3
- **UI might show**: Lisa Brown - Oct 2 to Oct 4 (or other dates)

This guide will help you verify and fix any date inconsistencies.

---

## ✅ Correct Leave Dates (As Per Schema)

| Staff Member       | Start Date    | End Date    | Days   | Status   | Notes             |
| ------------------ | ------------- | ----------- | ------ | -------- | ----------------- |
| **Lisa Brown**     | Oct 2, 2025   | Oct 3, 2025 | 2 days | Approved | Oct 2 AND Oct 3   |
| **Dr. Rachel Kim** | Sept 30, 2025 | Oct 1, 2025 | 2 days | Approved | Sept 30 AND Oct 1 |
| **Maya Patel**     | Oct 5, 2025   | Oct 6, 2025 | 2 days | Pending  | Oct 5 AND Oct 6   |

### Important: Date Ranges are INCLUSIVE

When we say `start_date = '2025-10-02'` and `end_date = '2025-10-03'`:

- ✅ Oct 2: ON LEAVE
- ✅ Oct 3: ON LEAVE
- ❌ Oct 4: NOT on leave

---

## 🧪 How to Verify Your Database

### Step 1: Check Current Leave Dates

Run this query in **Supabase SQL Editor**:

```sql
SELECT
  s.name as staff_name,
  lr.start_date,
  lr.end_date,
  (lr.end_date - lr.start_date + 1) as days_of_leave,
  lr.status,
  lr.reason
FROM leave_requests lr
JOIN staff s ON lr.staff_id = s.id
ORDER BY lr.start_date;
```

**Expected Results:**

| staff_name     | start_date | end_date   | days_of_leave | status   | reason              |
| -------------- | ---------- | ---------- | ------------- | -------- | ------------------- |
| Dr. Rachel Kim | 2025-09-30 | 2025-10-01 | 2             | approved | Medical appointment |
| Lisa Brown     | 2025-10-02 | 2025-10-03 | 2             | approved | Family event        |
| Maya Patel     | 2025-10-05 | 2025-10-06 | 2             | pending  | Personal day        |

### Step 2: If Dates Are Wrong

If you see different dates (e.g., Lisa Brown shows Oct 2 to Oct 4), use the fix script.

---

## 🔧 How to Fix Incorrect Dates

### Option 1: Use the Fix Script

I've created a comprehensive SQL script: **`supabase/sql/verify_and_fix_leaves.sql`**

**Steps:**

1. Open Supabase SQL Editor
2. Copy contents of `verify_and_fix_leaves.sql`
3. Run **STEP 1** first to see current dates
4. Run **STEP 2** to reset to correct dates
5. Run **STEP 3** to verify the fix worked

### Option 2: Manual Fix

Run this in Supabase SQL Editor:

```sql
-- Delete all leave requests
DELETE FROM leave_requests;

-- Re-insert with correct dates
DO $$
DECLARE
  lisa_id UUID;
  rachel_id UUID;
  maya_id UUID;
BEGIN
  SELECT id INTO lisa_id FROM staff WHERE email = 'lisa.brown@clinic.com';
  SELECT id INTO rachel_id FROM staff WHERE email = 'rachel.kim@clinic.com';
  SELECT id INTO maya_id FROM staff WHERE email = 'maya.patel@clinic.com';

  INSERT INTO leave_requests (staff_id, start_date, end_date, leave_type, reason, status, notes) VALUES
    (lisa_id, '2025-10-02', '2025-10-03', 'planned', 'Family event', 'approved', 'Approved by manager'),
    (rachel_id, '2025-09-30', '2025-10-01', 'planned', 'Medical appointment', 'approved', 'Approved - arranged coverage'),
    (maya_id, '2025-10-05', '2025-10-06', 'planned', 'Personal day', 'pending', null);
END $$;
```

---

## 🧪 Test Leave Status on Specific Dates

### Test Oct 2, 2025 (Default date in app)

Run this query:

```sql
SELECT
  s.name,
  s.role,
  CASE
    WHEN '2025-10-02'::date BETWEEN lr.start_date AND lr.end_date AND lr.status = 'approved'
    THEN '🏖️ ON LEAVE'
    ELSE '✅ AVAILABLE'
  END as status_on_oct_2
FROM staff s
LEFT JOIN leave_requests lr ON s.id = lr.staff_id
WHERE s.email IN ('lisa.brown@clinic.com', 'rachel.kim@clinic.com', 'maya.patel@clinic.com')
ORDER BY s.name;
```

**Expected Results for Oct 2:**

| name           | role             | status_on_oct_2                   |
| -------------- | ---------------- | --------------------------------- |
| Dr. Rachel Kim | doctor           | ✅ AVAILABLE (leave ended Oct 1)  |
| Lisa Brown     | dental_assistant | 🏖️ ON LEAVE (Oct 2 is in range)   |
| Maya Patel     | dental_assistant | ✅ AVAILABLE (leave starts Oct 5) |

### Test Other Dates

Change the date in the query:

- `'2025-09-30'` - Should show Rachel Kim on leave
- `'2025-10-01'` - Should show Rachel Kim on leave
- `'2025-10-02'` - Should show Lisa Brown on leave
- `'2025-10-03'` - Should show Lisa Brown on leave
- `'2025-10-04'` - Should show NO ONE on leave
- `'2025-10-05'` - Should show Maya Patel on leave (pending)
- `'2025-10-06'` - Should show Maya Patel on leave (pending)

---

## 🐛 Common Issues & Solutions

### Issue 1: UI Shows Different Dates Than Database

**Cause**: Could be a timezone issue or display bug

**Solution**:

1. Verify database dates with Step 1 above
2. Check browser console for errors
3. Clear browser cache and refresh (Ctrl+Shift+R / Cmd+Shift+R)
4. Check the actual leave request in Leave Management tab

### Issue 2: Staff Showing as "On Leave" on Wrong Dates

**Example**: Lisa Brown shows as on leave on Oct 4, but should only be Oct 2-3

**Cause**: Incorrect end_date in database

**Solution**:

1. Run verification query (Step 1)
2. If `end_date = '2025-10-04'`, it's wrong - should be `'2025-10-03'`
3. Run fix script (Step 2)

### Issue 3: Leave Shows in UI But Not in Database

**Cause**: Frontend might be caching old data

**Solution**:

1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Verify in Supabase dashboard directly
3. Check the Leave Management tab to see actual data

### Issue 4: Date Shows as "Oct 3" but Should Be "Oct 2"

**Cause**: Timezone conversion issue

**Check**:

```sql
-- Check timezone of dates
SELECT
  start_date,
  start_date::timestamptz as with_timezone,
  timezone('UTC', start_date::timestamptz) as utc_time
FROM leave_requests;
```

**Note**: Dates should be stored as DATE type, not TIMESTAMP, to avoid timezone issues.

---

## 📊 Understanding Date Ranges

### Inclusive vs Exclusive

Our system uses **INCLUSIVE** date ranges:

```
start_date = '2025-10-02'
end_date = '2025-10-03'

Timeline:
Oct 1: Not on leave
Oct 2: ✅ ON LEAVE (start_date)
Oct 3: ✅ ON LEAVE (end_date)
Oct 4: Not on leave
```

### How SQL Checks Leave Status

```sql
-- This is how the backend checks if staff is on leave
WHERE current_date BETWEEN start_date AND end_date
```

This means:

- `'2025-10-02' BETWEEN '2025-10-02' AND '2025-10-03'` = TRUE ✅
- `'2025-10-03' BETWEEN '2025-10-02' AND '2025-10-03'` = TRUE ✅
- `'2025-10-04' BETWEEN '2025-10-02' AND '2025-10-03'` = FALSE ❌

---

## 📝 How to Add Leave for Different Durations

### 1 Day Leave (Oct 2 only)

```sql
start_date = '2025-10-02'
end_date = '2025-10-02'
-- On leave: Oct 2
```

### 2 Day Leave (Oct 2-3)

```sql
start_date = '2025-10-02'
end_date = '2025-10-03'
-- On leave: Oct 2, Oct 3
```

### 3 Day Leave (Oct 2-4)

```sql
start_date = '2025-10-02'
end_date = '2025-10-04'
-- On leave: Oct 2, Oct 3, Oct 4
```

### 1 Week Leave (Oct 2-8)

```sql
start_date = '2025-10-02'
end_date = '2025-10-08'
-- On leave: Oct 2, 3, 4, 5, 6, 7, 8 (7 days)
```

---

## ✅ Verification Checklist

After fixing dates, verify:

- [ ] Run verification query - all 3 leave requests show correct dates
- [ ] Lisa Brown: start='2025-10-02', end='2025-10-03'
- [ ] Dr. Rachel Kim: start='2025-09-30', end='2025-10-01'
- [ ] Maya Patel: start='2025-10-05', end='2025-10-06'
- [ ] Test query shows Lisa Brown ON LEAVE on Oct 2
- [ ] Test query shows Lisa Brown ON LEAVE on Oct 3
- [ ] Test query shows Lisa Brown AVAILABLE on Oct 4
- [ ] Frontend Leave Management tab shows correct dates
- [ ] Frontend Shifts tab "Other Staff" shows correct status
- [ ] Browser console shows no errors

---

## 🔄 If You Need to Reset Everything

To completely reset the database to initial state:

```sql
-- Delete all data
DELETE FROM shift_assignments;
DELETE FROM leave_requests;
DELETE FROM staff;
DELETE FROM clinics;

-- Then re-run the entire initial_schema_fixed.sql file
```

---

## 📞 Quick Reference

### Correct Dates Summary

```
Lisa Brown:
  Oct 2 ✅ ON LEAVE
  Oct 3 ✅ ON LEAVE
  Oct 4 ❌ AVAILABLE

Dr. Rachel Kim:
  Sept 30 ✅ ON LEAVE
  Oct 1 ✅ ON LEAVE
  Oct 2 ❌ AVAILABLE

Maya Patel:
  Oct 4 ❌ AVAILABLE
  Oct 5 ✅ ON LEAVE (pending)
  Oct 6 ✅ ON LEAVE (pending)
  Oct 7 ❌ AVAILABLE
```

---

**Files Created:**

- ✅ `supabase/sql/verify_and_fix_leaves.sql` - Complete verification and fix script
- ✅ `initial_schema_fixed.sql` - Updated with clear date comments

**Run the verification script to check your database and fix any inconsistencies!**
