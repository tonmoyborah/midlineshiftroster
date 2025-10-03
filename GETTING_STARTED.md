# Getting Started with Shift Manager

This guide will help you get the Shift Manager application up and running with Supabase backend.

## Prerequisites

- Node.js 20.x or higher
- npm or yarn
- A Supabase account (free tier is fine)

## Quick Start

### 1. Set Node Version

```bash
nvm use 20
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Environment

The Supabase credentials are already configured in `frontend/src/lib/supabase.ts`. 

If you need to change them, update the file or create a `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Verify Connection

To test if Supabase is connected properly:

1. Open the browser console (F12)
2. In `frontend/src/App.tsx`, uncomment lines 9-12:

```typescript
useEffect(() => {
  import('./lib/testConnection').then(({ testConnection }) => {
    testConnection();
  });
}, []);
```

3. Refresh the page
4. Check the console for connection test results

## Application Structure

```
frontend/
├── src/
│   ├── components/     # UI components
│   │   ├── common/     # Reusable components
│   │   ├── layout/     # Layout components
│   │   └── shifts/     # Shift-specific components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # Supabase API calls
│   ├── lib/            # Supabase client
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
```

## Features

### ✅ Daily Shifts View
- View clinic rosters for any date
- See assigned doctors and dental assistants
- View unassigned staff with their status
- Filter by clinic
- Navigate between dates

### ✅ Staff Management
- View all staff members
- See staff details (role, clinic, weekly off)
- Active/Inactive status indicators

### ✅ Leave Management
- View all leave requests
- Filter by status (pending/approved/rejected)
- **Approve or reject leave requests**
- View leave details and dates

## Using the Application

### View Shifts

1. Click the **Shifts** tab (default view)
2. Use the date navigator to select a date
3. View clinic rosters and staff assignments
4. Use filters to show specific clinics

### Manage Staff

1. Click the **Staff** tab
2. View all staff members
3. See their details and assignments

### Manage Leave

1. Click the **Leave** tab
2. Filter by status (All, Pending, Approved, Rejected)
3. For pending requests:
   - Click **Approve** to approve
   - Click **Reject** to reject
4. View approved/rejected leave history

## Database

The app connects to Supabase PostgreSQL database with:
- 3 Clinics (Central Clinic, North Branch, East Branch)
- 8 Staff members (4 doctors, 4 dental assistants)
- Shift assignments
- Leave requests

## Troubleshooting

### Cannot see any data

1. Check browser console for errors
2. Verify Supabase connection with test function
3. Ensure database has sample data:
   - Run the SQL scripts from `supabase/sql/initial_schema.sql`
   - Check that clinics and staff tables have data

### "Missing Supabase environment variables" error

1. Check `frontend/src/lib/supabase.ts` has correct values
2. Or create `.env.local` with correct values
3. Restart dev server

### Connection errors

1. Check Supabase project is active
2. Verify API keys are correct
3. Check RLS policies allow read access
4. Look at Network tab in browser dev tools

### Approve/Reject not working

1. Check browser console for errors
2. Verify RLS policies allow updates
3. Check that leave requests exist in database

## Next Steps

### Optional Enhancements

- [ ] Add authentication (admin login)
- [ ] Implement modals for creating/editing staff
- [ ] Add shift assignment modal
- [ ] Create leave request form
- [ ] Enable real-time updates
- [ ] Add PDF export

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Documentation

- **[SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md)** - Complete integration details
- **[QUICKSTART.md](./QUICKSTART.md)** - Original quick start guide with mock data
- **[Tech_spec.md](./Tech_spec.md)** - Technical specifications
- **[Product_spec.md](./Product_spec.md)** - Product requirements

## Support

For issues or questions:
1. Check the browser console for errors
2. Review the integration documentation
3. Verify database setup in Supabase dashboard
4. Check RLS policies and permissions

---

**Status**: ✅ Fully Integrated with Supabase
**Last Updated**: Current Session

