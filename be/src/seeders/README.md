# Seeder Scripts

This directory contains database seeding scripts to populate the database with initial data.

## Creating Default Accounts

### Using the Node.js Seeder (Recommended)

The `create-default-accounts.seeder.js` script creates default admin and organizer accounts with properly hashed passwords.

**Default Accounts Created:**
- **Admin Account:**
  - Email: `admin@example.com`
  - Password: `admin123`

- **Organizer Account:**
  - Email: `organizer@example.com`
  - Password: `organizer123`

**To run the seeder:**

```bash
# From the be directory
npm run seed:accounts
```

Or directly:

```bash
babel-node src/seeders/run-create-default-accounts.js
```

**Auto-seed on startup:**

You can enable automatic seeding when the server starts by setting the environment variable:

```bash
AUTO_SEED_ACCOUNTS=true npm start
```

Or add it to your `.env` file:
```bash
AUTO_SEED_ACCOUNTS=true
```

### Using SQL Script (Alternative)

If you prefer to use SQL directly, use `create-default-accounts.sql`. However, note that this script contains placeholder bcrypt hashes. You'll need to generate proper bcrypt hashes for the passwords.

**To use SQL script:**
1. Connect to your PostgreSQL database
2. Run the SQL script:
   ```sql
   \i src/seeders/create-default-accounts.sql
   ```

**Important:** The SQL script includes placeholder bcrypt hashes. For production use, generate proper hashes using the Node.js seeder or manually hash passwords using bcrypt.

## Notes

- The seeder checks if accounts already exist before creating them to avoid duplicates
- Passwords are hashed using bcrypt with 10 rounds
- The script uses the existing database connection configuration from `src/configs/postgre_sql.js`

