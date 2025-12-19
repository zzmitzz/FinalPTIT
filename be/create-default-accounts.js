// Standalone script to create default admin and organizer accounts
// Run with: node create-default-accounts.js
// No babel or special setup required - uses CommonJS

require('dotenv').config()
const bcrypt = require('bcrypt')
const { Sequelize } = require('sequelize')

// Get database config from environment
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: 'postgres',
        logging: false,
    }
)

async function createDefaultAccounts() {
    try {
        await sequelize.authenticate()
        console.log('✓ Database connection established.\n')

        // Create Admin Account
        const adminEmail = 'admin@example.com'
        const adminPassword = await bcrypt.hash('admin123', 10)
        
        const [adminResult] = await sequelize.query(`
            INSERT INTO admins (_id, name, email, phone, password, role_ids)
            VALUES (
                gen_random_uuid(),
                'Super Admin',
                :email,
                '+1234567890',
                :password,
                ARRAY[]::UUID[]
            )
            ON CONFLICT (email) DO NOTHING
            RETURNING email;
        `, {
            replacements: { email: adminEmail, password: adminPassword }
        })

        if (adminResult.length > 0) {
            console.log('✓ Admin account created:')
            console.log(`  Email: ${adminEmail}`)
            console.log('  Password: admin123\n')
        } else {
            console.log(`⚠ Admin account already exists: ${adminEmail}\n`)
        }

        // Create Organizer Account
        const organizerEmail = 'organizer@example.com'
        const organizerPassword = await bcrypt.hash('organizer123', 10)
        
        const [organizerResult] = await sequelize.query(`
            INSERT INTO organizers (_id, name, email, phone, password, created_at, updated_at)
            VALUES (
                gen_random_uuid(),
                'Event Organizer',
                :email,
                '+1234567891',
                :password,
                NOW(),
                NOW()
            )
            ON CONFLICT (email) DO NOTHING
            RETURNING email;
        `, {
            replacements: { email: organizerEmail, password: organizerPassword }
        })

        if (organizerResult.length > 0) {
            console.log('✓ Organizer account created:')
            console.log(`  Email: ${organizerEmail}`)
            console.log('  Password: organizer123\n')
        } else {
            console.log(`⚠ Organizer account already exists: ${organizerEmail}\n`)
        }

        console.log('✅ Default accounts seeding completed!')
        await sequelize.close()
        process.exit(0)
    } catch (error) {
        console.error('❌ Error creating default accounts:', error.message)
        console.error(error)
        await sequelize.close()
        process.exit(1)
    }
}

createDefaultAccounts()

