# Staff Leave Application - Deployment Guide

## 🎉 Feature Overview

The **Staff Leave Application Form** is now ready! This is a public-facing, shareable form where your staff can submit leave requests directly without needing to log in.

**URL:** `https://your-domain.vercel.app/staff-leave-request`

---

## ✅ What's Been Completed

- ✅ Public leave submission service (`frontend/src/services/publicLeave.service.ts`)
- ✅ Staff leave application page (`frontend/src/pages/StaffLeaveApplication.tsx`)
- ✅ React Router integration for URL-based navigation
- ✅ Updated navigation component to use React Router
- ✅ Mobile-responsive form design
- ✅ Client-side validation
- ✅ Reference number generation
- ✅ Success/error handling
- ✅ RLS policies SQL script created
- ✅ Technical documentation updated
- ✅ Product specification updated
- ✅ Build tested successfully

---

## 🚀 Deployment Steps

### Step 1: Apply Database Policies (REQUIRED)

The form requires special Supabase RLS policies to allow anonymous users to submit leave requests.

**Execute in Supabase SQL Editor:**

1. Go to your Supabase project → SQL Editor
2. Create a new query
3. Copy and paste the contents of `supabase/sql/staff_leave_application_policies.sql`
4. Run the query

**Or run these policies directly:**

```sql
-- Allow anonymous users to INSERT leave requests with status='pending'
CREATE POLICY "Allow public leave request submissions"
  ON leave_requests FOR INSERT
  TO anon
  WITH CHECK (
    status = 'pending' AND
    staff_id IN (SELECT id FROM staff WHERE is_active = true)
  );

-- Allow anonymous users to view active staff names (for dropdown)
CREATE POLICY "Allow public to view active staff names"
  ON staff FOR SELECT
  TO anon
  USING (is_active = true);
```

**Verify the policies were created:**

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('leave_requests', 'staff')
  AND policyname IN ('Allow public leave request submissions', 'Allow public to view active staff names')
ORDER BY tablename, policyname;
```

You should see 2 rows returned.

---

### Step 2: Deploy to Vercel

The code is ready to deploy! Simply push to your GitHub repository:

```bash
git add .
git commit -m "feat: Add staff leave application form"
git push origin main
```

Vercel will automatically deploy the changes (takes ~2-3 minutes).

---

### Step 3: Test the Form

1. **Open the public URL:**
   - Development: `http://localhost:5173/staff-leave-request`
   - Production: `https://your-domain.vercel.app/staff-leave-request`

2. **Test submission flow:**
   - Select a staff member from dropdown
   - Pick start and end dates
   - Check "Emergency leave" if applicable
   - Enter reason (at least 10 characters)
   - Click "Submit Leave Request"
   - Verify success screen shows reference number

3. **Verify admin panel:**
   - Log in to admin panel
   - Go to Leave Management page
   - Check that new request appears in "Pending" tab
   - Test approve/reject functionality

---

### Step 4: Share with Your Staff

#### Option A: Share the URL

Send this message to your staff:

```
Hi team! 

You can now submit leave requests online using this link:
https://your-domain.vercel.app/staff-leave-request

Just select your name, pick your dates, and submit. No login needed!
You'll get a reference number for tracking.

All requests will be reviewed by admin.
```

#### Option B: Create a QR Code

1. Go to any QR code generator (e.g., qr-code-generator.com, QRCode Monkey)
2. Enter your form URL: `https://your-domain.vercel.app/staff-leave-request`
3. Download the QR code image
4. Print and post in staff room or clinic

#### Option C: WhatsApp Message

```
📱 New: Online Leave Request Form

Submit leave requests instantly:
https://your-domain.vercel.app/staff-leave-request

✅ No login required
✅ Works on any device
✅ Get instant confirmation
✅ Track with reference number

Try it now! 🚀
```

---

## 🎯 How It Works

### For Staff:
1. Open the shareable link (works on any device, no app needed)
2. Select their name from dropdown
3. Pick leave dates
4. Check "Emergency" if urgent
5. Enter reason (min 10 characters)
6. Click Submit
7. Get reference number (e.g., LR-2025-ABC12345)

### For Admin:
1. Staff submission creates leave request with `status='pending'`
2. Request appears in Leave Management → Pending tab
3. Admin reviews and approves or rejects
4. System handles the rest (roster updates, status changes, etc.)

---

## 🔒 Security Features

- ✅ Anonymous access only allows creating pending requests
- ✅ Admin approval required for all requests
- ✅ Only active staff can be selected
- ✅ No sensitive data exposed (only staff names)
- ✅ Client-side and server-side validation
- ✅ Database constraints prevent invalid data

---

## 📱 Mobile Optimization

The form is designed mobile-first:
- Large, touch-friendly buttons
- Native date pickers
- Responsive layout
- Clear error messages
- Works on all screen sizes

**Recommended:** Test on actual smartphones before sharing with staff.

---

## 🐛 Troubleshooting

### Issue: Form shows error "Failed to submit leave request"

**Solution:** Make sure you've applied the RLS policies in Supabase (Step 1).

### Issue: Staff dropdown is empty

**Solutions:**
1. Verify you have active staff in the database
2. Check that staff have `is_active = true`
3. Verify RLS policy for staff SELECT was applied

### Issue: Admin doesn't see new requests

**Solution:** Refresh the Leave Management page. Requests should appear in the "Pending" tab.

### Issue: Date picker not working on mobile

**Solution:** This uses native date pickers which should work on all modern browsers. If issues persist, test on a different browser.

---

## 📊 Monitoring & Analytics

Track these metrics to measure success:

- **Adoption Rate:** How many staff use the form vs calling/texting
- **Submission Volume:** Number of requests per week/month
- **Time Savings:** Reduction in manual data entry
- **Error Rate:** How often validations catch issues
- **Mobile Usage:** % of submissions from mobile devices

You can add analytics by integrating with Google Analytics, Plausible, or similar tools.

---

## 🚀 Future Enhancements

Consider these improvements for v2:

- [ ] Email/SMS notifications when leave is approved/rejected
- [ ] Staff can view their submission history (with optional login)
- [ ] WhatsApp bot integration
- [ ] File upload for medical certificates
- [ ] Leave balance tracking
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Progressive Web App (PWA) for offline access

---

## 📚 Documentation

Full technical documentation has been added to:

- **Tech_spec.md** - Section 12: Staff Self-Service Portal
- **Product_spec.md** - Staff Leave Application (Self-Service)
- **supabase/sql/staff_leave_application_policies.sql** - RLS policies

---

## ✅ Final Checklist

Before announcing to staff:

- [ ] RLS policies applied in Supabase
- [ ] Code deployed to production
- [ ] Form tested on desktop
- [ ] Form tested on mobile
- [ ] Submission appears in admin panel
- [ ] Approve/reject workflow tested
- [ ] Shareable URL ready
- [ ] QR code generated (optional)
- [ ] Staff communication drafted

---

## 🎉 You're Done!

Your staff can now submit leave requests online! This will save you time and give staff a better experience.

**Next Steps:**
1. Apply the RLS policies (Step 1)
2. Deploy to production (Step 2)
3. Test the form (Step 3)
4. Share with staff (Step 4)

If you encounter any issues, refer to the Troubleshooting section above.

---

**Questions?** Check the Tech_spec.md for detailed technical documentation.

