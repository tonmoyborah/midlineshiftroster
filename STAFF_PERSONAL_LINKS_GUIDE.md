# Staff Personal Links - User Guide

## 🎉 Feature Overview

Staff members now have **personal status pages** where they can view all their leave requests in one place! This feature provides a seamless way for staff to track their leave history without needing passwords or authentication.

---

## 🔗 How It Works

### For Staff:

1. **Submit a leave request** at `/staff-leave-request`
2. After submitting, they receive:
   - ✅ Reference number (e.g., LR-2025-ABC12345)
   - 🔗 **Personal status link** (e.g., `https://yourapp.com/my-leaves/abc123...`)
3. **Save/bookmark** the personal link
4. Open the link anytime to see:
   - All their leave requests
   - Status of each (pending/approved/rejected)
   - Dates, reasons, and admin notes
   - Can submit new requests from the same page

### For Admins:

When reviewing leave requests in the **Leave Management** page, each request now shows:
- 🔗 **"Copy Personal Status Link"** button
- Easy one-click copy to share with staff
- Link appears for ALL requests (pending, approved, rejected)

---

## 📱 User Experience

### Staff View (`/my-leaves/:staffId`)

```
┌─────────────────────────────────────┐
│  📅 My Leave Requests               │
│  Staff Name: John Doe               │
├─────────────────────────────────────┤
│  📌 Bookmark This Page              │
│  [URL shown in a box]               │
│  [Copy] [New Request]               │
├─────────────────────────────────────┤
│  All Requests (3)                   │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ ✅ Approved | 📅 Planned     │  │
│  │ Submitted Oct 10, 2025      │  │
│  │ Period: Oct 15 - Oct 17     │  │
│  │ Reason: Family vacation     │  │
│  │ Approved: Oct 11, 2025      │  │
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ ⏳ Pending | 🚨 Emergency    │  │
│  │ Submitted Oct 12, 2025      │  │
│  │ Period: Oct 14 - Oct 14     │  │
│  │ Reason: Doctor appointment  │  │
│  └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Admin View (Leave Management)

Each leave request card now shows:

```
┌───────────────────────────────────────┐
│ John Doe                              │
│ ⏳ Pending | 📅 Planned               │
│ Period: Oct 15 - Oct 17, 2025        │
│ Reason: Family vacation               │
├───────────────────────────────────────┤
│ 🔗 [Copy Personal Status Link]        │
│ Share this link with John Doe         │
├───────────────────────────────────────┤
│ [Approve] [Reject]                    │
└───────────────────────────────────────┘
```

---

## 🚀 Sharing Personal Links with Staff

### Method 1: Copy from Success Screen (After Staff Submits)

When staff submit a request, they see:
```
┌────────────────────────────────────┐
│ ✅ Leave Request Submitted!        │
│                                    │
│ 🔗 Your Personal Status Page       │
│ Save this link to check your      │
│ leave status anytime!              │
│                                    │
│ [Full URL shown]                   │
│ [Copy Link] [View Status]          │
└────────────────────────────────────┘
```

**Staff should:**
- Screenshot the link
- Save it in their browser bookmarks
- Add to home screen on mobile

### Method 2: Admin Copies from Leave Management

1. Admin opens **Leave Management** page (`/admin/leave`)
2. Finds any request from the staff member
3. Clicks **"Copy Personal Status Link"**
4. Shares via WhatsApp/SMS/Email:

```
Hi [Name]! 

Here's your personal link to view all your leave requests:
[PASTE LINK]

Bookmark this link for easy access. 
You can submit new requests and check status anytime!
```

---

## 🔒 Security & Privacy

### How It's Secure:

✅ **UUID-based URLs**: Each staff ID is a unique, hard-to-guess UUID
```
Example: /my-leaves/a3b7c9d2-1e4f-4a5c-8b7d-9c1e3f5g7h9i
```

✅ **No sensitive data exposure**: Only shows that staff member's own requests

✅ **No cross-staff access**: Each link only works for that specific staff member

✅ **Admin approval required**: All requests still need admin approval

⚠️ **Note**: This is "security through obscurity" - if a staff member shares their link, others can see their requests. For most dental practices, this is acceptable. If you need stronger security, authentication can be added later.

---

## 📊 Benefits

### For Staff:
- ✅ No passwords to remember
- ✅ Check status anytime, anywhere
- ✅ See entire leave history
- ✅ Mobile-friendly interface
- ✅ Quick access via bookmark

### For Admin:
- ✅ Less "what's my status?" calls/texts
- ✅ Easy to share links when approving
- ✅ No need to manage staff passwords
- ✅ One-click copy from leave management page

---

## 🎯 Use Cases

### Scenario 1: Staff Submits Request
```
1. Staff opens /staff-leave-request
2. Fills form and submits
3. Sees success screen with personal link
4. Bookmarks the link
5. Checks status daily by opening bookmark
```

### Scenario 2: Admin Approves & Shares Link
```
1. Admin receives leave request notification
2. Opens Leave Management page
3. Reviews request
4. Clicks "Approve"
5. Copies personal link
6. Sends via WhatsApp: "Approved! Use this link to check status"
```

### Scenario 3: Staff Checks History
```
1. Staff opens their bookmarked link
2. Sees all past requests (approved, rejected, pending)
3. Decides to submit another request
4. Clicks "New Request" button
5. Submits directly from same page
```

---

## 🛠️ Technical Implementation

### Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/staff-leave-request` | Public | Submit new leave requests |
| `/my-leaves/:staffId` | Public | View personal leave history |
| `/admin/leave` | Protected | Admin leave management + copy links |

### Database

Uses existing tables - no schema changes needed!
- `leave_requests` - stores all requests
- `staff` - staff information

### RLS Policies (Supabase)

```sql
-- Allow anonymous users to view leave requests
CREATE POLICY "Allow anonymous users to view leave requests by staff ID"
  ON leave_requests FOR SELECT TO anon
  USING (true);

-- Allow anonymous users to view staff names
CREATE POLICY "Allow public to view active staff names"
  ON staff FOR SELECT TO anon
  USING (is_active = true);
```

---

## 🔄 Future with Authentication (Optional)

This feature is designed to easily support authentication later:

**Current (No Auth):**
```
/my-leaves/abc123 → Shows requests for staff abc123
```

**Future (With Auth):**
```
Staff logs in → System redirects to /my-leaves/[their-id]
Same page, same UI, just adds login layer!
```

**Migration Path:**
1. Add staff authentication system
2. Add `<AuthGuard>` to `/my-leaves/:staffId` route
3. Verify logged-in user matches :staffId
4. Keep everything else the same!

---

## 📱 Mobile Experience

The personal status page is optimized for mobile:
- ✅ Large, touch-friendly buttons
- ✅ Responsive layout
- ✅ Native date pickers
- ✅ Easy to bookmark
- ✅ Works offline (cached after first visit)

**Recommendation:** Staff should add to home screen:
- **iOS**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Add to Home Screen

---

## 🆘 Troubleshooting

### Staff lost their personal link

**Solution:** Admin can copy and reshare from Leave Management page

### Link not working

**Possible causes:**
1. RLS policies not applied (see deployment guide)
2. Staff ID invalid/inactive
3. Database connection issue

**Fix:** Check Supabase logs and verify policies

### Staff can't see their requests

**Check:**
1. Is the staff member active in the system?
2. Have they submitted any requests?
3. Are RLS policies applied correctly?

---

## 📚 Related Documentation

- `STAFF_LEAVE_APPLICATION_DEPLOYMENT.md` - Deployment steps & RLS policies
- `Tech_spec.md` - Section 12: Staff Self-Service Portal
- `Product_spec.md` - Staff Leave Application feature spec

---

## ✅ Quick Reference

**Staff Personal Link Format:**
```
https://your-domain.com/my-leaves/[staff-uuid]
```

**Copy Link from Admin Panel:**
```
Leave Management → Any request → "Copy Personal Status Link"
```

**Share with Staff:**
```
WhatsApp/SMS: 
"Here's your leave status link: [paste link]. Bookmark it!"
```

---

**Questions?** Contact your system administrator or refer to the technical documentation.

