# 🚀 Quick Deployment Checklist

## Prerequisites ✅

- [ ] GitHub account created
- [ ] Code pushed to GitHub repository
- [ ] Supabase project created and configured
- [ ] All SQL scripts run in Supabase

## Vercel Deployment (5 minutes) ⚡

### Step 1: Sign Up

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "Sign Up" → "Continue with GitHub"
- [ ] Authorize Vercel

### Step 2: Import Project

- [ ] Click "Add New..." → "Project"
- [ ] Select your GitHub repository
- [ ] Click "Import"

### Step 3: Configure Settings

- [ ] **Framework Preset:** Vite
- [ ] **Root Directory:** `./`
- [ ] **Build Command:** `cd frontend && npm install && npm run build`
- [ ] **Output Directory:** `frontend/dist`

### Step 4: Environment Variables

Add these in Vercel project settings:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Get these from:** Supabase Dashboard → Settings → API

### Step 5: Deploy

- [ ] Click "Deploy"
- [ ] Wait 1-2 minutes
- [ ] Your app is live! 🎉

## Post-Deployment ✅

### Supabase Configuration

- [ ] Go to Supabase → Settings → Authentication → URL Configuration
- [ ] Add your Vercel URL to "Site URL"
- [ ] Add to "Redirect URLs": `https://your-app.vercel.app/**`

### Test Your App

- [ ] Visit your Vercel URL
- [ ] Test Shifts page
- [ ] Test auto-assignment
- [ ] Test adding/removing staff
- [ ] Test Leave Management
- [ ] Test on mobile device

## Environment Variables Reference

```bash
# Local development (.env in frontend/ directory)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Vercel production (add in Vercel dashboard)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Troubleshooting 🔧

### Build Fails

```bash
# Test locally first
cd frontend
npm install
npm run build
```

### Environment Variables Not Working

- Make sure they start with `VITE_`
- Redeploy after adding variables
- Check Vercel → Settings → Environment Variables

### Database Errors

- Verify RLS policies are enabled
- Check Supabase URL and key are correct
- Ensure all SQL scripts ran successfully

## 🎉 You're Done!

Your app is now live at:

```
https://your-app-name.vercel.app
```

## Next Steps

- [ ] Add custom domain (optional)
- [ ] Set up monitoring
- [ ] Share with users
- [ ] Enable authentication (optional)

## Useful Commands

```bash
# Local development
cd frontend
npm run dev

# Local build test
npm run build

# Preview production build
npm run preview

# Deploy (automatic on git push)
git add .
git commit -m "Update"
git push origin main
```

## Support

- **Vercel Issues:** Check build logs in Vercel dashboard
- **Supabase Issues:** Check Supabase logs
- **Code Issues:** Check browser console (F12)

---

**Total Time:** ~15 minutes
**Cost:** $0/month
**Perfect for:** Clinics of any size! 🏥
