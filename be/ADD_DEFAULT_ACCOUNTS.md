# How to Add Default Admin and Organizer Accounts

This guide provides **3 simple ways** to add default accounts without modifying package.json or using babel.

## Option 1: Standalone Node.js Script (Recommended - Easiest)

Use the standalone script that doesn't require babel or any special setup:

```bash
cd FinalPTIT/be
node create-default-accounts.js
```

This script:
- Uses plain Node.js (no babel needed)
- Reads database config from your `.env` file
- Automatically creates both admin and organizer accounts
- Checks if accounts exist before creating (safe to run multiple times)

**Default Accounts Created:**
- **Admin:** `admin@example.com` / `admin123`
- **Organizer:** `organizer@example.com` / `organizer123`

## Option 2: Use SQL Script Directly

If you prefer SQL, you can run the SQL script directly in your PostgreSQL database:

```bash
# Connect to your database
psql -U your_username -d your_database_name

# Then run:
\i src/seeders/create-default-accounts.sql
```

Or copy the SQL from `src/seeders/create-default-accounts.sql` and run it in your database client.

**Note:** The SQL file has been updated with real bcrypt hashes, so it will work correctly.

## Option 3: Use API Endpoints (If Server is Running)

If your server is already running, you can use the registration endpoints:

### Create Admin Account:
```bash
curl -X POST http://localhost:3456/admin/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@example.com",
    "phone": "+1234567890",
    "password": "admin123"
  }'
```

### Create Organizer Account:
```bash
curl -X POST http://localhost:3456/organizer/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Event Organizer",
    "email": "organizer@example.com",
    "phone": "+1234567891",
    "password": "organizer123"
  }'
```

Or use Postman/Thunder Client to make the POST requests to:
- `POST /admin/auth/register`
- `POST /organizer/auth/register`

## Troubleshooting

### If the standalone script fails:
1. Make sure your `.env` file has the correct database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_database_name
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

2. Make sure you have `dotenv` installed:
   ```bash
   npm install dotenv
   ```

3. Check that your database is running and accessible

### If accounts already exist:
All methods check for existing accounts and won't create duplicates. If you want to recreate them, you'll need to delete the existing accounts first.

## Which Method Should I Use?

- **Option 1 (Standalone Script)**: Best for initial setup, no server needed
- **Option 2 (SQL)**: Best if you're comfortable with SQL and want direct database access
- **Option 3 (API)**: Best if your server is already running and you want to test the registration flow

