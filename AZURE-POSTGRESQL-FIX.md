# Quick Fix: Create PostgreSQL Database (Step 6)

## Are you seeing SQL Server connection strings?

If you see **ADO.NET, JDBC, ODBC** connection strings, you're looking at an **Azure SQL Database**, not PostgreSQL. 

We need **PostgreSQL** for PitchBase!

## Solution: Create PostgreSQL Database

### Option A: Create New PostgreSQL Database

1. **In Azure Portal**, click **"Create a resource"** (top left)
2. Search for: **"Azure Database for PostgreSQL flexible server"**
   - Make sure it says **"flexible server"** - that's the newer version
3. Click **"Create"**

4. Fill in the **Basics** tab:

   **Project details:**
   - **Subscription:** Your subscription
   - **Resource group:** `pitchbase-rg` (use existing)

   **Server details:**
   - **Server name:** `pitchbase-postgres` (must be globally unique)
   - **Region:** Same region as your resource group
   - **PostgreSQL version:** 15
   - **Workload type:** Development
   - **Compute + storage:**
     - Click **"Configure server"**
     - Choose **"Burstable"** tier
     - Select **"Standard_B1ms"** (1 vCore, 2 GB RAM) - cheapest option
     - Click **"Save"**

   **Administrator account:**
   - **Admin username:** `adminuser`
   - **Password:** Create a strong password **AND SAVE IT!**
   - **Confirm password:** Same password

5. Click **"Next: Networking"**

6. **Networking tab:**
   - **Connectivity method:** Public access
   - **Firewall rules:**
     - Click **"+ Add current restaurant IP address"** (or add 0.0.0.0 - 255.255.255.255 for all Azure services)
     - For Azure services, also click **"Allow public access from Azure services within Azure"**

7. Click **"Next: Security"** → **"Next: Additional settings"** → **"Review + create"**

8. Click **"Create"** and wait ~5 minutes

## Get PostgreSQL Connection String

1. Go to **Resource groups** → `pitchbase-rg`
2. Click on your PostgreSQL database (e.g., `pitchbase-postgres`)
3. In the开关 menu, click **"Settings"** → **"Connection strings"**
4. You should see **"PostgreSQL"** connection strings (not ADO.NET!)

5. Look for connection string like:
   ```
   postgresql://adminuser:PASSWORD@pitchbase-postgres.postgres.database.azure.com:5432/postgres?sslmode=require
   ```

6. **Copy this connection string**

7. **Important:** Replace `PASSWORD` with your actual database password

## Format for Environment Variables

You'll need TWO connection strings (they're the same for PostgreSQL):

**DATABASE_URL:**
```
postgresql://adminuser:[YOUR-ACTUAL-PASSWORD]@pitchbase-postgres.postgres.database.azure.com:5432/postgres?sslmode=require
```

**DIRECT_URL:** (same as above)
```
postgresql://adminuser:[YOUR-ACTUAL-PASSWORD]@pitchbase-postgres.postgres.database.azure.com:5432/postgres?sslmode=require
```

Replace `[YOUR-ACTUAL-PASSWORD]` with the password you set when creating the database.

## Continue with Step 7

Once you have the PostgreSQL connection strings, continue with **Step 7: Configure Environment Variables** in the main guide.

---

**Note:** If you created an Azure SQL Database by mistake, you can:
- Delete it (won't charge you if within free tier)
- Or keep it for another project
- Create PostgreSQL as shown above

