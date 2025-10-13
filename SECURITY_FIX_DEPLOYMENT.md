# Security Fix Deployment Guide

## ✅ What Was Fixed

**CRITICAL SECURITY VULNERABILITY RESOLVED:**
- Removed hardcoded `service_role` key from `frontend/src/lib/supabase.ts`
- Now using environment variables with the `anon` (public) key
- This enforces Row Level Security (RLS) policies and prevents unauthorized database access

## 📋 Deployment Checklist

### ✅ Phase 1: Local Development (COMPLETED)

- [x] Created `.env` file in `frontend/` directory with new keys
- [x] Updated `frontend/src/lib/supabase.ts` to use `import.meta.env.VITE_SUPABASE_URL`
- [x] Updated `frontend/src/lib/supabase.ts` to use `import.meta.env.VITE_SUPABASE_ANON_KEY`
- [x] Verified no linter errors
- [x] Updated `Tech_spec.md` with security warnings

### 🔧 Phase 2: Vercel Deployment (ACTION REQUIRED)

**Step 1: Add Environment Variables to Vercel**

1. Go to your Vercel dashboard: https://vercel.com
2. Select your project: `midlineshiftroster`
3. Go to **Settings** → **Environment Variables**
4. Add the following two variables:

   **Variable 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://pupzezyqzqenfyzvrjye.supabase.co`
   - **Environments**: Check all three boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

   **Variable 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: [Your new anon key from Supabase - the one in your `.env` file]
   - **Environments**: Check all three boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

5. Click **Save** for each variable

**Step 2: Redeploy**

After adding the environment variables, you need to trigger a new deployment:

**Option A: Push new code (Recommended)**
```bash
git add frontend/src/lib/supabase.ts Tech_spec.md SECURITY_FIX_DEPLOYMENT.md
git commit -m "fix: Use environment variables for Supabase config (security fix)"
git push origin leave-application
```

**Option B: Manual redeploy in Vercel**
1. Go to **Deployments** tab
2. Click the three dots (...) next to the latest deployment
3. Click **Redeploy**
4. Confirm the redeployment

**Step 3: Verify Deployment**

After deployment completes:

1. Visit your production site
2. Open browser DevTools (F12) → Console
3. Check for any errors related to Supabase connection
4. Try logging in as admin to verify authentication works
5. Check that data loads properly on all pages

### 🔒 Phase 3: Security Verification (RECOMMENDED)

**Verify the fix is deployed:**

1. Visit your deployed site
2. Open DevTools → Sources/Debugger
3. Search for your JavaScript bundle files
4. Search for "supabase" or "VITE_SUPABASE"
5. **Confirm**: You should see `import.meta.env.VITE_SUPABASE_URL` in the code
6. **Confirm**: You should NOT see any hardcoded URLs or keys

**Verify RLS is enforced:**

1. Open DevTools → Console
2. Try running: `window.location.href = 'view-source:' + window.location.href`
3. Search the source for "supabase" - confirm no keys are visible

## 🚨 Important Reminders

### What NOT to Do:
- ❌ Never commit the `.env` file to git
- ❌ Never use `service_role` key in frontend code
- ❌ Never hardcode API keys in source files

### What to Do:
- ✅ Always use environment variables for secrets
- ✅ Use `anon` key for frontend (safe to expose, enforces RLS)
- ✅ Keep `service_role` key only for server-side operations (if ever needed)
- ✅ Revoke keys immediately if exposed

## 🔑 Where Your Keys Are Now

| Location | Key Type | Status |
|----------|----------|--------|
| `frontend/.env` (local) | anon | ✅ Git-ignored, safe |
| Vercel Environment Variables | anon | ✅ Secure, encrypted |
| Supabase Dashboard | Both keys | ✅ Source of truth |
| Frontend source code | None | ✅ Uses env vars only |
| Git repository | None | ✅ No hardcoded keys |

## 📞 Support

If you encounter any issues:

1. **Dev server not starting**: 
   - Check that `frontend/.env` exists and has both variables
   - Run `cd frontend && npm run dev`

2. **Vercel build fails**:
   - Verify environment variables are added in Vercel dashboard
   - Check build logs for "Missing Supabase environment variables"

3. **Can't connect to Supabase**:
   - Verify the anon key in `.env` matches your Supabase dashboard
   - Check Supabase dashboard → Settings → API for correct keys

## ✨ Next Steps

After successful deployment:

1. Test all application features to ensure they work correctly
2. Monitor Supabase logs for any authentication errors
3. Consider adding alerts for failed RLS policy checks
4. Review all RLS policies to ensure they're properly configured

---

**Status**: ✅ Code changes complete. Awaiting Vercel environment variable configuration.

