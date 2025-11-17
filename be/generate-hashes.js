// Simple script to generate bcrypt hashes and ready-to-use SQL
// Run with: node generate-hashes.js
// This outputs SQL statements with real bcrypt hashes that you can copy and paste

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function generateHashes() {
    console.log('Generating bcrypt hashes...\n');
    
    const adminHash = await bcrypt.hash('admin123', 10);
    const organizerHash = await bcrypt.hash('organizer123', 10);
    
    console.log('=== Ready-to-use SQL (copy and paste into your database) ===\n');
    
    const sql = `-- SQL Script with real bcrypt hashes for default accounts
-- Generated on: ${new Date().toISOString()}
-- Admin password: admin123
-- Organizer password: organizer123

-- Create Admin Account
INSERT INTO admins (_id, name, email, phone, password, role_ids)
VALUES (
    gen_random_uuid(),
    'Super Admin',
    'admin@example.com',
    '+1234567890',
    '${adminHash}',
    ARRAY[]::UUID[]
)
ON CONFLICT (email) DO NOTHING;

-- Create Organizer Account
INSERT INTO organizers (_id, name, email, phone, password, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Event Organizer',
    'organizer@example.com',
    '+1234567891',
    '${organizerHash}',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
`;

    console.log(sql);
    
    // Also save to a file
    const outputFile = path.join(__dirname, 'src', 'seeders', 'create-default-accounts-with-hashes.sql');
    fs.writeFileSync(outputFile, sql);
    console.log(`\n✓ SQL also saved to: ${outputFile}`);
    console.log('\nYou can now run this SQL directly in your PostgreSQL database!');
}

generateHashes().catch(console.error);

