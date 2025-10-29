# Vercel Quick Start - Deploy Now, Add Env Vars Later

## Strategy: Deploy First, Configure After

You can deploy first to get your URL, then add environment variables later. Here's the easiest path:

## Step 1: Initial Deployment

1. **Go to Vercel Dashboard** → [vercel.com](https://vercel.com)
2. **Click "Add New Project"** (if you haven't imported yet)
3. **Import your GitHub repository**
4. **Click "Deploy"** immediately
   - Don't worry about env vars yet
   - The deployment might fail, but you'll get your project URL!

## Step 2: Get Your Project URL

After clicking deploy, Vercel will show:
- **Project Name** (usually your repo name)
- **Preview URL**: `https://your-project-name.vercel.app`

**Copy this URL!** You'll need it for `NEXTAUTH_URL`

## Step 3: Add Environment Variables (After Deployment)

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add these one by one:

### Minimum to Get It Running:

```
DATABASE_URL = file:./prisma/dev.db
```

```
NEXTAUTH_URL = https://your-actual-project-name.vercel.app
(Use the URL from Step 2)
```

```
NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
```

### For Full Functionality:

```
S3_ENDPOINT = <your-s3-endpoint>
S3_REGION = <your-region>
S3_ACCESS_KEY_ID = <your-key>
S3_SECRET_ACCESS_KEY = <your-secret>
S3_BUCKET = <your-bucket>
```

**For each variable:**
- Select all environments: **Production**, **Preview**, **Development**
- Click **Save**

## Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. This will trigger a new build with your environment variables

## Alternative: Add Env Vars During Import

If you haven't imported yet, you CAN add environment variables during the import process:

1. Click **"Add New Project"**
2. Import your repo
3. Before clicking "Deploy", click **"Environment Variables"** (visible in the import screen)
4. Add your variables there
5. Then click "Deploy"

## What Happens If You Deploy Without Env Vars?

- Build might fail (that's okay - you'll still get your URL)
- Or it might build but the app won't work properly
- Either way, you can add env vars and redeploy

## Pro Tip

**Vercel Project Name Pattern:**
- Your project name becomes: `your-repo-name`
- So your URL will be: `https://your-repo-name.vercel.app`

You can use this pattern to set `NEXTAUTH_URL` even before the first deployment if you know your repo name!

