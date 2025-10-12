# Plan 2 - Complete Fix Deployment Guide
**Date:** October 12, 2025
**Status:** Ready to Deploy

## 🎯 What Was Fixed

### Root Causes Identified
1. ❌ **Missing 'available' status in type definition** - TypeScript type didn't include it
2. ❌ **StatusBadge showed "Unknown"** - No case for 'available' status
3. ❌ **Database roster function incomplete** - Didn't return individual staff status
4. ❌ **Data format mismatch** - DB returned wrong format, frontend couldn't parse it

### The Complete Fix
1. ✅ **Added 'available' to StaffStatus type** (`frontend/src/types/models.ts`)
2. ✅ **Updated StatusBadge component** to handle 'available' with blue badge
3. ✅ **Created complete roster function** that returns individual staff status
4. ✅ **All frontend code already correct** - transformation logic works perfectly

## 📋 Required Database Migrations

You need to apply **3 SQL migrations in total**. Here's the complete list:

### Migration 1: Update Staff Status Function ✅ (Already Applied)
**File:** `supabase/sql/fix_staff_status_function.sql`
**Status:** You already applied this

### Migration 2: Add Unapproved Absences Read Policy ✅ (Already Applied)
**File:** `supabase/sql/add_unapproved_absences_read_policy.sql`
**Status:** You already applied this

### Migration 3: Complete Roster Function with Status ⚠️ **REQUIRED NOW**
**File:** `supabase/sql/complete_roster_function_with_status.sql`
**Status:** **YOU MUST APPLY THIS NOW**

This is the critical fix that solves the "Unknown" status issue!

## 🔧 Deployment Steps

### Step 1: Apply Migration 3 (Critical!)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the **entire contents** of `supabase/sql/complete_roster_function_with_status.sql`
6. Paste into the query editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see: ✅ "Complete roster function created with individual staff status!"

**Why this is critical:** This function is what provides the roster data to the frontend. Without it, staff status can't be determined correctly, and you'll see "Unknown" everywhere.

### Step 2: Deploy Frontend Changes

```bash
git add .
git commit -m "fix: add available status type and update StatusBadge component"
git push origin main
```

Vercel will automatically deploy in ~2 minutes.

### Step 3: Clear Browser Cache

After deployment:
1. Open the app in your browser
2. Press **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac) to hard refresh
3. This ensures you get the new code

### Step 4: Verify It Works

Check these scenarios:

**✅ Staff Status Display:**
- Staff on approved leave → Purple "Approved Leave" badge
- Staff with pending leave → Yellow "Unapproved Leave" badge
- Staff on weekly off → Gray "Weekly Off" badge
- Active staff not assigned → Blue "Available" badge
- Staff assigned to primary clinic → Green "Present" badge
- Staff assigned to other clinic → Orange "Visiting" badge

**✅ Clinic Roster:**
- Clinics show assigned doctors and dental assistants
- Each staff member has their individual status badge
- No "Unknown" status anywhere

**✅ Auto-Assignment:**
- When you load a date with no assignments, staff should auto-assign
- Available staff get assigned to their primary clinics
- Staff on leave/weekly off are skipped

## 🔍 What Each Migration Does

### Migration 1: fix_staff_status_function.sql
**Purpose:** Updates the `get_staff_status_for_date()` database function
**What it does:**
- Checks staff status in correct priority order
- Returns: weekly_off → approved_leave → unapproved_leave → present/visiting → available
- Used by Migration 3 to get individual staff status

### Migration 2: add_unapproved_absences_read_policy.sql
**Purpose:** Adds RLS policy for reading unapproved_absences table
**What it does:**
- Allows frontend to query the unapproved_absences table
- Required for status determination logic to work

### Migration 3: complete_roster_function_with_status.sql ⚠️ **THE KEY FIX**
**Purpose:** Returns complete roster data with individual staff status
**What it does:**
- Returns doctors and dental_assistants as JSONB arrays ✅
- For EACH staff member, calls `get_staff_status_for_date()` to get their status ✅
- Includes `is_visiting` flag from shift_assignments ✅
- Frontend transformation code already expects this exact format ✅

**Why you saw "Unknown":**
The old roster function didn't include status for each staff member. When the frontend tried to display status, it got `undefined`, TypeScript fell through to the default case, and showed "Unknown".

## 📊 The Complete Data Flow (After Fix)

1. **Frontend requests roster:**
   ```typescript
   const roster = await ShiftsService.getRosterForDate(date);
   ```

2. **Backend calls database function:**
   ```sql
   SELECT * FROM get_clinic_roster_for_date('2025-10-02');
   ```

3. **Database function returns:**
   ```json
   {
     "clinic_id": "uuid",
     "clinic_name": "Central Clinic",
     "doctors": [
       {
         "id": "uuid",
         "name": "Dr. Sarah Chen",
         "status": "present",  // ← This is now included!
         "is_visiting": false
       }
     ],
     "dental_assistants": [...],
     "status": "present"
   }
   ```

4. **Frontend transforms and displays:**
   - Each staff member has their status
   - StatusBadge component shows correct badge
   - No more "Unknown"!

## 🚨 If You Still See "Unknown" After Applying Migration 3

### Troubleshooting Steps:

1. **Verify the migration applied successfully:**
   ```sql
   -- Run this in Supabase SQL Editor to test:
   SELECT * FROM public.get_clinic_roster_for_date('2025-10-02');
   ```
   - Check that doctors and dental_assistants have 'status' field
   - Check that status values are: present, visiting, weekly_off, approved_leave, unapproved_leave, or available

2. **Check browser console for errors:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for errors or warnings

3. **Verify data in database:**
   ```sql
   -- Check if staff are assigned
   SELECT * FROM shift_assignments WHERE shift_date = '2025-10-02';
   
   -- Check staff status function works
   SELECT 
     s.name,
     public.get_staff_status_for_date(s.id, '2025-10-02') as status
   FROM staff s
   WHERE s.is_active = true
   LIMIT 5;
   ```

4. **Clear all caches:**
   - Browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+Shift+R)
   - Close and reopen browser

## ✅ Success Criteria

After applying all migrations and deploying:

- [ ] No "Unknown" status badges anywhere
- [ ] Staff on leaves show correct colored badges
- [ ] Available staff show blue "Available" badge
- [ ] Assigned staff show green "Present" badge
- [ ] Clinic roster displays all assigned staff correctly
- [ ] Auto-assignment works for new dates
- [ ] Leave management UI works (create leaves, mark absences)

## 📝 Summary

**What you need to do RIGHT NOW:**
1. Apply Migration 3: `complete_roster_function_with_status.sql` in Supabase
2. Git commit and push the frontend changes
3. Hard refresh your browser
4. Test and verify

**Why this works:**
- The database now returns complete data with individual staff status
- Frontend already knows how to handle this data format
- StatusBadge now has a case for 'available' status
- Everything aligns perfectly!

**Time estimate:** 5 minutes to apply migration + 2 minutes for Vercel deploy = 7 minutes total

🚀 You're ready to go! Apply Migration 3 and the problem will be solved!

