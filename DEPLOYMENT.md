# Deployment Guide - Voter Registration Status Checker

## 🚀 Deploying to Render (FREE - Supports 350K+ Records)

This guide will help you deploy the application to Render with PostgreSQL database support.

### Prerequisites
- GitHub repository (✅ Already done)
- Render account (free) - [Sign up here](https://render.com)

---

## Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `voter-registration-db`
   - **Database:** `voter_registration`
   - **User:** `voter_admin`
   - **Region:** Choose closest to your users
   - **Plan:** **Free** (1 GB storage - enough for 350K records)
4. Click **"Create Database"**
5. **Save the Internal Database URL** (you'll need this)

---

## Step 2: Deploy Backend API

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `voter-registration-api`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/serverPostgres.js`
   - **Plan:** **Free**

4. **Environment Variables** → Add:
   ```
   NODE_ENV=production
   DATABASE_URL=<paste-internal-database-url-from-step-1>
   PORT=3001
   ```

5. Click **"Create Web Service"**

6. Wait for deployment (2-3 minutes)

---

## Step 3: Import Data to PostgreSQL

After backend is deployed:

1. Go to your backend service dashboard
2. Click **"Shell"** tab
3. Run these commands:
   ```bash
   cd /opt/render/project/src/backend
   npm run import-db
   ```

This will import all 21,780 voters (or 350K when you add more data).

**Expected time:**
- 21K records: ~1-2 minutes
- 350K records: ~5-10 minutes

---

## Step 4: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name:** `voter-registration-frontend`
   - **Branch:** `main`
   - **Root Directory:** Leave blank (project root)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Plan:** **Free**

4. **Environment Variables** → Add:
   ```
   VITE_API_URL=https://voter-registration-api.onrender.com/api
   ```
   (Replace with your actual backend URL from Step 2)

5. Click **"Create Static Site"**

---

## Step 5: Test Your Deployment

1. Open your frontend URL (e.g., `https://voter-registration-frontend.onrender.com`)
2. Test searches:
   - Enrollment: `UP10579/13`
   - Name: `आशीष कुमार दुबे` or `AASHEESH`
   - District: Select from dropdown

---

## 🔄 Updating the Application

After making changes locally:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will **auto-deploy** both frontend and backend!

---

## 📊 Database Management

### View Data:
1. Go to PostgreSQL service → **"Connect"** tab
2. Use connection string to connect with tools like:
   - TablePlus
   - pgAdmin
   - psql command line

### Backup Data:
Render automatically backs up your database daily (free tier).

### Add More Data:
```bash
# Locally: Add new Excel files to root directory
# Update backend/src/importToPostgres.js to include new files
# Commit and push
# On Render Shell: Run npm run import-db
```

---

## 🎯 Performance for 350K Records

### With Proper Indexing:
- **Enrollment search:** < 50ms
- **Name search:** < 200ms
- **District search:** < 300ms

### Database Indexes (Already Configured):
```sql
- idx_enrollment_no (UNIQUE)
- idx_name
- idx_name_normalized  
- idx_district
- idx_cop_no
- idx_mobile
```

---

## 💰 Cost Estimate

### Current Setup (21K records):
- **Frontend:** FREE ✅
- **Backend:** FREE ✅
- **Database:** FREE ✅
- **Total:** $0/month

### Scaled to 350K records:
- **Frontend:** FREE ✅
- **Backend:** FREE (750 hours/month) ✅
- **Database:** FREE (1 GB) or $7/month (10 GB if needed)
- **Total:** $0-7/month

---

## 🔧 Alternative: If You Want to Stay with Free JSON

If PostgreSQL is too complex, you can optimize the current JSON approach:

### For 350K Records with JSON:
1. **Split into chunks** (50K per file)
2. **Use SQLite** instead (file-based, easier)
3. **Add caching** layer
4. **Deploy on Vercel Serverless**

But PostgreSQL is **strongly recommended** for 350K+ records!

---

## 🆘 Troubleshooting

### Backend won't start:
- Check DATABASE_URL is set correctly
- Verify PostgreSQL service is running

### Database import fails:
- Check memory limits (upgrade to paid tier if needed)
- Import in batches using LIMIT/OFFSET

### Slow queries:
- Check indexes are created
- Use EXPLAIN ANALYZE on slow queries
- Add more specific indexes

---

## 📝 Next Steps

1. ✅ Code is ready for PostgreSQL
2. ⏳ Set up Render account
3. ⏳ Deploy database
4. ⏳ Deploy backend
5. ⏳ Import 21K records
6. ⏳ Deploy frontend
7. ⏳ Test deployment

Would you like me to help with the deployment process?

