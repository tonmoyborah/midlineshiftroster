# Initial Database State Reference

## Overview

This document describes the **initial state** of the database after running `initial_schema_fixed.sql`. This is your clean starting point with sample data ready for use.

---

## 📊 Summary

| Entity                | Count | Description                              |
| --------------------- | ----- | ---------------------------------------- |
| **Clinics**           | 3     | Central, North, East                     |
| **Staff**             | 20    | 10 Doctors + 10 Dental Assistants        |
| **Shift Assignments** | 0     | All clinics empty (ready for assignment) |
| **Leave Requests**    | 3     | 2 Approved + 1 Pending                   |

---

## 🏥 Clinics (3 Total)

| Clinic Name    | Location  | Initial Assignments |
| -------------- | --------- | ------------------- |
| Central Clinic | Downtown  | None (empty)        |
| North Branch   | Northside | None (empty)        |
| East Branch    | Eastwood  | None (empty)        |

---

## 👥 Staff Members (20 Total)

### Central Clinic Staff (7 members)

#### Doctors (4):

| Name              | Email                    | Weekly Off | Status                         |
| ----------------- | ------------------------ | ---------- | ------------------------------ |
| Dr. Sarah Chen    | sarah.chen@clinic.com    | Sunday     | Available                      |
| Dr. Michael Smith | michael.smith@clinic.com | Monday     | Available                      |
| Dr. Rachel Kim    | rachel.kim@clinic.com    | Tuesday    | **On Leave** (Sept 30 - Oct 1) |
| Dr. David Patel   | david.patel@clinic.com   | Sunday     | Available                      |

#### Dental Assistants (3):

| Name          | Email                    | Weekly Off | Status                            |
| ------------- | ------------------------ | ---------- | --------------------------------- |
| Maya Patel    | maya.patel@clinic.com    | Wednesday  | Available (pending leave Oct 5-6) |
| Jessica Wong  | jessica.wong@clinic.com  | Sunday     | Available                         |
| Carlos Rivera | carlos.rivera@clinic.com | Friday     | Available                         |

### North Branch Staff (7 members)

#### Doctors (3):

| Name             | Email                   | Weekly Off | Status    |
| ---------------- | ----------------------- | ---------- | --------- |
| Dr. James Wilson | james.wilson@clinic.com | Monday     | Available |
| Dr. Emily Brooks | emily.brooks@clinic.com | Tuesday    | Available |
| Dr. Kevin Lee    | kevin.lee@clinic.com    | Thursday   | Available |

#### Dental Assistants (4):

| Name            | Email                      | Weekly Off | Status                 |
| --------------- | -------------------------- | ---------- | ---------------------- |
| Lisa Brown      | lisa.brown@clinic.com      | Sunday     | **On Leave** (Oct 2-3) |
| Anna Lee        | anna.lee@clinic.com        | Friday     | Available              |
| Robert Garcia   | robert.garcia@clinic.com   | Monday     | Available              |
| Sophia Martinez | sophia.martinez@clinic.com | Saturday   | Available              |

### East Branch Staff (6 members)

#### Doctors (3):

| Name               | Email                     | Weekly Off | Status    |
| ------------------ | ------------------------- | ---------- | --------- |
| Dr. Amanda Johnson | amanda.johnson@clinic.com | Sunday     | Available |
| Dr. Thomas Nguyen  | thomas.nguyen@clinic.com  | Wednesday  | Available |
| Dr. Linda Harris   | linda.harris@clinic.com   | Monday     | Available |

#### Dental Assistants (3):

| Name            | Email                      | Weekly Off | Status    |
| --------------- | -------------------------- | ---------- | --------- |
| Tom Harris      | tom.harris@clinic.com      | Tuesday    | Available |
| Nicole Anderson | nicole.anderson@clinic.com | Sunday     | Available |
| Brian Taylor    | brian.taylor@clinic.com    | Thursday   | Available |

---

## 📅 Leave Requests (3 Total)

| Staff Member   | Role   | Clinic  | Dates                 | Type    | Reason              | Status          | Notes                        |
| -------------- | ------ | ------- | --------------------- | ------- | ------------------- | --------------- | ---------------------------- |
| Lisa Brown     | DA     | North   | Oct 2-3, 2025         | Planned | Family event        | ✅ **Approved** | Approved by manager          |
| Dr. Rachel Kim | Doctor | Central | Sept 30 - Oct 1, 2025 | Planned | Medical appointment | ✅ **Approved** | Approved - arranged coverage |
| Maya Patel     | DA     | Central | Oct 5-6, 2025         | Planned | Personal day        | ⏳ **Pending**  | -                            |

---

## 🗓️ Shift Assignments (0 Total)

**All clinics start with NO staff assigned for any date.**

This means on the initial app load (Oct 2, 2025):

- ✅ All 3 clinics will show "⚠️ No staff assigned"
- ✅ All available staff will appear in "Other Staff" section

---

## 🎯 Expected Initial App Behavior

### On Shifts Tab (Oct 2, 2025)

#### Clinic Roster Section:

```
Central Clinic ⚠️
└─ No staff assigned
   Doctor: [Edit] → Assign Doctor
   Dental Assistant: [Edit] → Assign DA

North Branch ⚠️
└─ No staff assigned
   Doctor: [Edit] → Assign Doctor
   Dental Assistant: [Edit] → Assign DA

East Branch ⚠️
└─ No staff assigned
   Doctor: [Edit] → Assign Doctor
   Dental Assistant: [Edit] → Assign DA
```

#### Other Staff Section:

Should show **18 staff members** (20 total - 2 on approved leave for Oct 2):

**Available Staff:**

- ✅ Dr. Sarah Chen (Central)
- ✅ Dr. Michael Smith (Central)
- ✅ Dr. David Patel (Central)
- ✅ Maya Patel (Central) - DA
- ✅ Jessica Wong (Central) - DA
- ✅ Carlos Rivera (Central) - DA
- ✅ Dr. James Wilson (North)
- ✅ Dr. Emily Brooks (North)
- ✅ Dr. Kevin Lee (North)
- ✅ Anna Lee (North) - DA
- ✅ Robert Garcia (North) - DA
- ✅ Sophia Martinez (North) - DA
- ✅ Dr. Amanda Johnson (East)
- ✅ Dr. Thomas Nguyen (East)
- ✅ Dr. Linda Harris (East)
- ✅ Tom Harris (East) - DA
- ✅ Nicole Anderson (East) - DA
- ✅ Brian Taylor (East) - DA

**On Leave (Won't Show):**

- 🏖️ Lisa Brown (North) - DA - Approved leave Oct 2-3
- 🏖️ Dr. Rachel Kim (Central) - Approved leave Sept 30 - Oct 1
  - Note: Dr. Rachel Kim's leave ends Oct 1, so she might show as available on Oct 2, depending on the logic

### On Leave Tab

Should show **3 leave requests:**

| Staff          | Dates                 | Reason              | Status      |
| -------------- | --------------------- | ------------------- | ----------- |
| Lisa Brown     | Oct 2-3, 2025         | Family event        | ✅ Approved |
| Dr. Rachel Kim | Sept 30 - Oct 1, 2025 | Medical appointment | ✅ Approved |
| Maya Patel     | Oct 5-6, 2025         | Personal day        | ⏳ Pending  |

### On Staff Tab

Should show **all 20 staff members** with their details:

- Name
- Role (Doctor / Dental Assistant)
- Email
- Primary Clinic
- Weekly Off Day
- Active status

---

## 🧪 Testing Scenarios

### Scenario 1: Assign Staff to Clinic

**Steps:**

1. Go to Shifts tab (Oct 2, 2025)
2. Click edit (✏️) next to "Doctor" in Central Clinic
3. Select "Dr. Sarah Chen"
4. Click "Assign"

**Expected Result:**

- ✅ Central Clinic shows "Dr. Sarah Chen"
- ✅ Other Staff count decreases from 18 to 17
- ✅ Dr. Sarah Chen removed from "Other Staff" list

### Scenario 2: View Staff on Leave

**Steps:**

1. Go to Shifts tab (Oct 2, 2025)
2. Scroll to "Other Staff" section

**Expected Result:**

- ❌ Lisa Brown should NOT appear (on approved leave Oct 2-3)
- ✅ Maya Patel should appear (her leave is Oct 5-6, not today)

### Scenario 3: Check Leave Management

**Steps:**

1. Go to Leave tab
2. Filter by "Approved"

**Expected Result:**

- ✅ Shows 2 leave requests (Lisa Brown, Dr. Rachel Kim)

**Steps:**

1. Filter by "Pending"

**Expected Result:**

- ✅ Shows 1 leave request (Maya Patel)

### Scenario 4: Add New Leave Request

**Steps:**

1. Go to Leave tab
2. Click "Request Leave"
3. Fill in details for any staff member
4. Submit

**Expected Result:**

- ✅ New leave request added
- ✅ Total count increases to 4

---

## 📈 Staff Distribution Analysis

### By Clinic:

- **Central Clinic**: 7 staff (4 doctors + 3 DAs)
- **North Branch**: 7 staff (3 doctors + 4 DAs)
- **East Branch**: 6 staff (3 doctors + 3 DAs)
- **Total**: 20 staff

### By Role:

- **Doctors**: 10 (50%)
- **Dental Assistants**: 10 (50%)

### By Weekly Off Day:

- **Sunday (0)**: 7 staff
- **Monday (1)**: 4 staff
- **Tuesday (2)**: 3 staff
- **Wednesday (3)**: 2 staff
- **Thursday (4)**: 2 staff
- **Friday (5)**: 2 staff
- **Saturday (6)**: 1 staff

This distribution ensures there are staff available every day of the week.

---

## 🔄 Resetting to Initial State

If you need to reset the database to this initial state:

### Option 1: Delete Data Only

```sql
-- Delete all shift assignments
DELETE FROM shift_assignments;

-- Delete all leave requests except the initial 3
DELETE FROM leave_requests
WHERE staff_id NOT IN (
  SELECT id FROM staff WHERE email IN (
    'lisa.brown@clinic.com',
    'rachel.kim@clinic.com',
    'maya.patel@clinic.com'
  )
);

-- Reset leave requests to initial state
UPDATE leave_requests SET
  status = 'approved',
  notes = 'Approved by manager'
WHERE staff_id = (SELECT id FROM staff WHERE email = 'lisa.brown@clinic.com');

UPDATE leave_requests SET
  status = 'approved',
  notes = 'Approved - arranged coverage'
WHERE staff_id = (SELECT id FROM staff WHERE email = 'rachel.kim@clinic.com');

UPDATE leave_requests SET
  status = 'pending',
  notes = null
WHERE staff_id = (SELECT id FROM staff WHERE email = 'maya.patel@clinic.com');
```

### Option 2: Complete Reset (Nuclear Option)

```sql
-- WARNING: This deletes ALL data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Then re-run initial_schema_fixed.sql
```

---

## 🎨 Visual Summary

```
┌─────────────────────────────────────────────────────────┐
│                  INITIAL DATABASE STATE                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🏥 CLINICS: 3                                          │
│     ├─ Central Clinic (Downtown)                        │
│     ├─ North Branch (Northside)                         │
│     └─ East Branch (Eastwood)                           │
│                                                         │
│  👥 STAFF: 20                                           │
│     ├─ Central: 7 (4 docs + 3 DAs)                      │
│     ├─ North: 7 (3 docs + 4 DAs)                        │
│     └─ East: 6 (3 docs + 3 DAs)                         │
│                                                         │
│  📅 SHIFT ASSIGNMENTS: 0                                │
│     └─ All clinics empty (ready to assign)             │
│                                                         │
│  🏖️ LEAVE REQUESTS: 3                                   │
│     ├─ Lisa Brown: Oct 2-3 (Approved)                   │
│     ├─ Dr. Rachel Kim: Sept 30 - Oct 1 (Approved)       │
│     └─ Maya Patel: Oct 5-6 (Pending)                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

After running `initial_schema_fixed.sql`, verify:

- [ ] 3 clinics exist in the database
- [ ] 20 staff members exist (10 doctors + 10 DAs)
- [ ] All staff are marked as `is_active = true`
- [ ] Staff are distributed across 3 clinics
- [ ] Weekly off days are varied (not all on the same day)
- [ ] 3 leave requests exist
- [ ] 2 leave requests are approved
- [ ] 1 leave request is pending
- [ ] 0 shift assignments exist
- [ ] All clinics show as empty in the UI
- [ ] "Other Staff" section shows ~18 staff on Oct 2, 2025
- [ ] Leave tab shows all 3 leave requests

---

## 🚀 Next Steps

1. **Run the SQL script** in Supabase SQL Editor
2. **Refresh your frontend** application
3. **Go to Shifts tab** - Should see empty clinics
4. **Check "Other Staff"** - Should see ~18 available staff
5. **Start assigning staff** to clinics using the UI
6. **Go to Leave tab** - Should see 3 leave requests
7. **Go to Staff tab** - Should see all 20 staff members

---

**Ready to use!** Your database is now in a clean initial state with realistic sample data. 🎉
