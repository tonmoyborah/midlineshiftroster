# Admin User Management - Design Documentation

## Problem Statement

The system requires admin users to exist in **TWO separate tables**:
1. **`staff` table** - Stores the admin as a staff member with role='admin'
2. **`admin_users` table** - Stores login credentials (references `auth.users`)

**The Challenge:**
- Creating a staff member with role='admin' ONLY updates the `staff` table
- It does NOT automatically create the `admin_users` entry or auth credentials
- These tables are NOT linked by foreign keys, only by email
- Creating an incomplete admin (only in `staff` table) results in a non-functional account

## Current Implementation

**Admin creation is DISABLED in the Staff Management UI** to prevent incomplete/broken admin accounts.

### Why Admin Creation is Disabled:

1. **Poor User Experience**
   - Allowing users to select "Admin" role but having nothing work is confusing
   - Users would create an admin, expect it to work, but login would fail
   - No clear feedback about what went wrong

2. **Multi-step Complexity**
   - Requires manual work in Supabase Dashboard
   - Requires understanding of auth system internals
   - Error-prone process (easy to forget steps or mismatch emails)

3. **Current Solution**
   - **StaffFormModal.tsx**: Admin option removed from role dropdown
   - **StaffService.ts**: Blocks creating/updating staff with admin role
   - **StaffManagement.tsx**: Shows existing admin staff as view-only

### Benefits of Current Approach:
- ✅ Prevents creating broken/incomplete admin accounts
- ✅ Clear user expectations - only Doctor and Dental Assistant can be created
- ✅ Existing admin staff are preserved and visible (view-only)
- ✅ Clean UX with no confusing half-working features

## How to Create Admin Users Manually (Current Method)

For now, admin users must be created manually through Supabase Dashboard. Follow all 3 steps:

### Complete Process (3 Steps Required)

#### Step 1: Create Authentication User

1. Open Supabase Dashboard → Your Project
2. Go to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Enter:
   - **Email**: e.g., admin@example.com (remember this!)
   - **Password**: Create a secure password
   - **Auto Confirm User**: ✅ Check this box
5. Click **"Create user"**
6. **Copy the User ID** (UUID) from the created user - you'll need this for Steps 2 & 3

Example User ID: `3fa85f64-5717-4562-b3fc-2c963f66afa6`

#### Step 2: Create Admin Users Table Entry

1. In Supabase Dashboard, go to **Table Editor** → **admin_users**
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   - **id**: Paste the User ID from Step 1
   - **email**: admin@example.com (same as Step 1)
   - **name**: Admin's full name (e.g., "John Admin")
   - **is_super_admin**: false (or true for super admin)
4. Click **"Save"**

**Alternative - Via SQL:**
```sql
-- Replace with actual values from Step 1
INSERT INTO admin_users (id, email, name, is_super_admin)
VALUES (
  '3fa85f64-5717-4562-b3fc-2c963f66afa6',  -- User ID from Step 1
  'admin@example.com',                      -- Email from Step 1
  'John Admin',                             -- Admin name
  false                                     -- Set to true for super admin
);
```

#### Step 3: Create Staff Record

1. In Supabase Dashboard, go to **Table Editor** → **staff**
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   - **id**: Leave blank (auto-generated)
   - **email**: admin@example.com (MUST match Steps 1 & 2)
   - **name**: John Admin (same as Step 2)
   - **role**: admin
   - **primary_clinic_id**: Leave blank (NULL)
   - **weekly_off_day**: 0 (Sunday, or any day)
   - **is_active**: true (checked)
4. Click **"Save"**

**Alternative - Via SQL:**
```sql
-- Replace with actual values matching Steps 1 & 2
INSERT INTO staff (email, name, role, primary_clinic_id, weekly_off_day, is_active)
VALUES (
  'admin@example.com',  -- MUST match Steps 1 & 2
  'John Admin',         -- Same name
  'admin',              -- Role
  NULL,                 -- No primary clinic for admins
  0,                    -- Weekly off (Sunday)
  true                  -- Active
);
```

### Verification

After completing all 3 steps, verify the admin can log in:

1. Log out of your app (if logged in)
2. Go to login page
3. Enter the admin email and password (from Step 1)
4. You should be logged in with admin privileges

### Common Issues

**Issue:** "Admin can't log in"
- **Solution:** Verify email matches in all 3 tables: `auth.users`, `admin_users`, and `staff`

**Issue:** "User not found" error
- **Solution:** Make sure you completed Step 1 (create auth user in Authentication)

**Issue:** "Admin has no privileges" / RLS errors
- **Solution:** Check that `admin_users` entry exists with correct ID from `auth.users`

**Issue:** Email mismatch
- **Solution:** All three locations must have the **exact same email** (case-sensitive):
  - `auth.users` table (Step 1)
  - `admin_users` table (Step 2)
  - `staff` table (Step 3)

## Future Enhancement: Admin User Management UI

If you want a proper admin management interface in the future, here's the recommended approach:

### Option 2: Create Dedicated Admin Management Page

Create a new page: `frontend/src/pages/AdminUserManagement.tsx`

**Features:**
- List all admin users from `admin_users` table
- Create new admin users (creates both `auth.users` and `admin_users` entries)
- Update admin user details
- Deactivate/delete admin users
- Manage super admin privileges

**Implementation Requirements:**

1. **New Service:** `frontend/src/services/adminUsers.service.ts`
```typescript
export class AdminUsersService {
  static async createAdminUser(email: string, password: string, name: string) {
    // 1. Create auth user via supabase.auth.signUp() with admin role
    // 2. Insert into admin_users table
  }
  
  static async listAdminUsers() {
    // Query admin_users table
  }
  
  static async updateAdminUser(id: string, updates: Partial<AdminUser>) {
    // Update admin_users table
  }
  
  static async deleteAdminUser(id: string) {
    // Delete from admin_users (cascade deletes auth.users)
  }
}
```

2. **Database Function:** Create a secure function to handle admin creation
```sql
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email VARCHAR,
  p_name VARCHAR,
  p_is_super_admin BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Only super admins can create new admins
  IF NOT (SELECT is_super_admin FROM admin_users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can create new admin users';
  END IF;
  
  -- Note: Auth user creation must happen via Supabase Auth API
  -- This function only handles the admin_users table entry
  -- Return placeholder for now
  RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. **Update Navigation:**
   - Add "Admin Users" menu item (visible only to super admins)
   - Link to new AdminUserManagement page

4. **Security Considerations:**
   - Only super admins can create/delete admin users
   - Regular admins can only view admin list
   - Require password confirmation for sensitive operations
   - Log all admin user changes for audit trail

## Data Migration Notes

### Handling Existing 'Admin' Role Staff

If you have existing staff with role='admin' in the staff table:

**Option A: Leave as-is (Recommended)**
- They'll show in the legacy "Admins" section
- They cannot be edited through the staff management UI
- They don't have system access (no login credentials)
- Eventually migrate them to proper admin_users if needed

**Option B: Clean up the data**
```sql
-- Find all staff with admin role
SELECT id, email, name FROM staff WHERE role = 'admin';

-- For each one, decide:
-- 1. Delete if not needed
DELETE FROM staff WHERE id = 'staff-id-here' AND role = 'admin';

-- 2. OR convert to doctor/dental_assistant if they're operational staff
UPDATE staff 
SET role = 'doctor'  -- or 'dental_assistant'
WHERE id = 'staff-id-here';

-- 3. OR create proper admin user entry
-- (First create in auth.users via Supabase Dashboard, then:)
INSERT INTO admin_users (id, email, name)
VALUES ('auth-user-id', 'email@example.com', 'Name');
-- Then delete from staff table
DELETE FROM staff WHERE id = 'old-staff-id';
```

## Testing Checklist

- [x] Cannot create new staff with 'admin' role
- [x] Cannot change doctor to admin role
- [x] Cannot change dental_assistant to admin role
- [x] Cannot edit existing staff with admin role
- [x] Clear error messages displayed to users
- [x] Legacy admin staff displayed with appropriate label
- [x] Staff management works normally for doctors and dental assistants
- [x] Technical documentation updated

## Conclusion

This implementation provides a production-grade solution that:
1. Prevents data inconsistency
2. Maintains separation of concerns
3. Provides clear user guidance
4. Preserves data integrity
5. Allows for future enhancement with proper admin management UI

For immediate needs, admins should be created via Supabase Dashboard. For a more user-friendly solution, implement the dedicated Admin User Management page as outlined above.

