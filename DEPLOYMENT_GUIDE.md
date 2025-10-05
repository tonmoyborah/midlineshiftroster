# Deployment Guide - Vercel + Supabase (100% Free)

## 🎯 Overview

Your application can be deployed **completely free** using:

- **Frontend:** Vercel (React/Vite app)
- **Backend:** Supabase (PostgreSQL database + API)

Both offer generous free tiers that are perfect for your clinic roster application.

## ✅ Free Tier Limits

### Vercel Free Tier

- ✅ Unlimited deployments
- ✅ Automatic SSL certificates
- ✅ Global CDN
- ✅ Automatic Git integration
- ✅ Preview deployments for each PR
- ✅ 100GB bandwidth/month
- ✅ Custom domain support

### Supabase Free Tier

- ✅ 500MB database space
- ✅ 50,000 monthly active users
- ✅ 2GB file storage
- ✅ Social OAuth providers
- ✅ 5GB bandwidth/month
- ✅ Unlimited API requests

**Your clinic app will easily fit within these limits!** 🎉

---

## 📋 Prerequisites

Before deploying, you need:

1. ✅ GitHub account (free)
2. ✅ Vercel account (free - sign up with GitHub)
3. ✅ Supabase account (free - already created)

---

## 🚀 Step-by-Step Deployment

### Part 1: Prepare Your Code

#### 1.1 Create `.env.example` File

Create a file at the root of your project:

```bash
# In project root
touch .env.example
```

Add this content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### 1.2 Update `.gitignore`

Make sure your `.gitignore` includes:

```
# Environment variables
.env
.env.local
.env*.local

# Dependencies
node_modules/

# Build output
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

#### 1.3 Create `vercel.json` Configuration

Create in project root:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 1.4 Update `package.json` (Root Level)

If you don't have one at root, create it:

```json
{
  "name": "midlineshiftroster",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "install": "cd frontend && npm install",
    "build": "cd frontend && npm run build",
    "preview": "cd frontend && npm run preview"
  }
}
```

#### 1.5 Commit and Push to GitHub

```bash
# In your project root
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

### Part 2: Deploy to Vercel

#### 2.1 Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

#### 2.2 Import Your Project

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Select `midlineshiftroster` repository

#### 2.3 Configure Build Settings

Vercel will auto-detect Vite. Verify these settings:

**Framework Preset:** Vite
**Root Directory:** `./` (leave as default)
**Build Command:** `cd frontend && npm install && npm run build`
**Output Directory:** `frontend/dist`

#### 2.4 Add Environment Variables

In the Vercel project settings, add:

| Name                     | Value                                                   |
| ------------------------ | ------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL (from Supabase dashboard)     |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key (from Supabase dashboard) |

**Where to find these:**

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click "Settings" → "API"
4. Copy "Project URL" and "anon/public" key

#### 2.5 Deploy!

1. Click "Deploy"
2. Wait 1-2 minutes
3. Your app is live! 🎉

You'll get a URL like: `https://midlineshiftroster-yourname.vercel.app`

---

### Part 3: Configure Supabase for Production

#### 3.1 Add Vercel Domain to Supabase

1. Go to Supabase dashboard
2. Settings → Authentication → URL Configuration
3. Add your Vercel URL to "Site URL"
4. Add to "Redirect URLs":
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/**`

#### 3.2 Run All SQL Scripts (If Not Done)

In Supabase SQL Editor, run in order:

1. `initial_schema_fixed.sql` (creates tables, RLS, functions)
2. `roster_function_multi_staff.sql` (multi-staff roster function)
3. `auto_assign_staff.sql` (auto-assignment function)

#### 3.3 Verify Database

Check in Supabase Table Editor:

- ✅ `clinics` table has 3 clinics
- ✅ `staff` table has ~20 staff members
- ✅ `leave_requests` table has some leave data
- ✅ `shift_assignments` table exists (may be empty)

---

## 🔧 Custom Domain (Optional)

### Add Your Own Domain

1. Buy a domain (e.g., from Namecheap, Google Domains)
2. In Vercel: Settings → Domains
3. Add your domain (e.g., `clinicroster.com`)
4. Update DNS records as shown by Vercel
5. Wait 24-48 hours for DNS propagation
6. SSL certificate is added automatically! 🎉

Example domains you could use:

- `clinicroster.com`
- `midline-roster.com`
- `dental-shifts.com`

---

## 🔄 Continuous Deployment

Once set up, any push to GitHub will:

1. ✅ Trigger automatic deployment
2. ✅ Build your app
3. ✅ Deploy to Vercel
4. ✅ Notification sent (if configured)

### Deploy Workflow:

```bash
# Make changes locally
npm run dev  # Test locally

# Commit and push
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically deploys! 🚀
```

---

## 🎨 Alternative Free Hosting Options

### Netlify (Alternative to Vercel)

**Pros:**

- Similar to Vercel
- Form handling built-in
- Split testing

**Setup:**

1. Sign up at [netlify.com](https://netlify.com)
2. Connect GitHub repo
3. Build command: `cd frontend && npm run build`
4. Publish directory: `frontend/dist`
5. Add same environment variables

### Render (Alternative - Includes Backend)

**Pros:**

- Can host backend too (if needed later)
- Free PostgreSQL database
- Good for monorepos

**Free Tier:**

- 750 hours/month
- Auto-sleep after 15 min inactivity

---

## 📱 Testing Your Deployed App

### 1. Test Basic Functionality

- [ ] Visit your Vercel URL
- [ ] Navigate to Shifts page
- [ ] Check if clinics load
- [ ] Check if staff auto-assigns
- [ ] Try adding/removing staff
- [ ] Navigate to Staff Management
- [ ] Navigate to Leave Management

### 2. Test on Mobile

- [ ] Open on iPhone/Android
- [ ] Test responsive design
- [ ] Test touch interactions

### 3. Test Across Browsers

- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Common causes:**

1. Missing dependencies in `package.json`
2. TypeScript errors
3. Environment variables not set

**Solution:**

```bash
# Test build locally first
cd frontend
npm run build

# If it works locally, check Vercel logs
```

### Issue: "VITE_SUPABASE_URL is undefined"

**Solution:**

1. Check environment variables in Vercel settings
2. Make sure they start with `VITE_`
3. Redeploy after adding variables

### Issue: Database Queries Fail

**Solution:**

1. Check Supabase URL and key are correct
2. Verify RLS policies in Supabase
3. Check browser console for errors

### Issue: Auto-Assignment Not Working

**Solution:**

1. Check browser console for errors
2. Verify `auto_assign_staff.sql` ran successfully
3. Check staff have `primary_clinic_id` set

### Issue: 404 on Page Refresh

**Already handled by `vercel.json` rewrites!** ✅

---

## 🔐 Security Best Practices

### Environment Variables

✅ **DO:**

- Use Vercel environment variables
- Never commit `.env` to Git
- Use different Supabase projects for dev/prod

❌ **DON'T:**

- Hardcode Supabase keys in code
- Share environment variables publicly
- Use production keys in development

### Supabase Security

✅ **DO:**

- Enable Row Level Security (RLS) on all tables
- Use anon key (not service key) in frontend
- Implement proper auth later

### HTTPS

✅ **Automatic with Vercel!**

- All traffic encrypted
- Free SSL certificate
- Auto-renewal

---

## 💰 Cost Breakdown (Free Forever!)

| Service           | Free Tier       | Your Usage | Cost      |
| ----------------- | --------------- | ---------- | --------- |
| Vercel            | 100GB bandwidth | ~1GB/month | $0        |
| Supabase          | 500MB database  | ~50MB      | $0        |
| Domain (optional) | N/A             | 1 domain   | ~$10/year |

**Total: $0/month (or ~$10/year with custom domain)** 🎉

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Free)

1. Enable in Vercel dashboard
2. See page views, performance
3. Monitor deployments

### Supabase Dashboard (Free)

1. View database usage
2. Monitor API calls
3. Check error logs

---

## 🚀 Quick Deployment Checklist

### Pre-Deployment

- [ ] All code committed to GitHub
- [ ] `.env.example` created
- [ ] `vercel.json` configured
- [ ] `.gitignore` includes `.env`
- [ ] Local build works (`npm run build`)

### Vercel Setup

- [ ] Vercel account created
- [ ] GitHub repo imported
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] First deployment successful

### Supabase Setup

- [ ] All SQL scripts run
- [ ] Tables populated with data
- [ ] Vercel URL added to allowed domains
- [ ] RLS policies enabled

### Testing

- [ ] App loads at Vercel URL
- [ ] Database queries work
- [ ] Auto-assignment works
- [ ] All pages accessible
- [ ] Mobile responsive

---

## 🎓 Next Steps After Deployment

### 1. Add Authentication

```bash
# Supabase has built-in auth!
# Enable in Supabase Dashboard → Authentication
```

### 2. Set Up Backups

Supabase automatically backs up your database daily (free tier).

### 3. Monitor Performance

- Use Vercel Analytics
- Check Supabase dashboard
- Set up alerts

### 4. Share Your App

Send your Vercel URL to users:

- `https://your-app.vercel.app`

---

## 📖 Helpful Resources

### Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

### Support

- [Vercel Discord](https://vercel.com/discord)
- [Supabase Discord](https://discord.supabase.com)

---

## 🎉 Summary

Your clinic roster app is **perfectly suited for free deployment**:

✅ **Vercel:** Hosts your React frontend
✅ **Supabase:** Provides PostgreSQL database + API
✅ **GitHub:** Automatic deployments on push
✅ **Free SSL:** Automatic HTTPS
✅ **Custom Domain:** Optional (~$10/year)

**Total Setup Time:** ~15 minutes
**Monthly Cost:** $0
**Perfect for:** Small to medium clinics

---

## 🤝 Need Help?

If you encounter issues during deployment:

1. Check Vercel build logs
2. Check browser console
3. Check Supabase logs
4. Review this guide's troubleshooting section

**Happy Deploying!** 🚀
