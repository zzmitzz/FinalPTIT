import bcrypt from 'bcrypt'
import {findAdminByEmail, createAdmin} from '@/db/admin_reporistory'
import {findOrganizerByEmail, createOrganizer} from '@/db/organizer_repo'

/**
 * Seeder to create default admin and organizer accounts
 * Run this script to create initial accounts for testing
 */
async function createDefaultAccounts() {
    try {
        console.log('Starting to create default accounts...')

        // Check if admin account already exists
        const adminEmail = 'admin@example.com'
        const existingAdmin = await findAdminByEmail(adminEmail)
        if (!existingAdmin) {
            const adminPassword = await bcrypt.hash('admin123', 10)
            await createAdmin({
                name: 'Super Admin',
                email: adminEmail,
                phone: '+1234567890',
                password: adminPassword,
                role_ids: [],
            })
            console.log('✓ Admin account created:')
            console.log(`  Email: ${adminEmail}`)
            console.log('  Password: admin123')
        } else {
            console.log(`⚠ Admin account already exists: ${adminEmail}`)
        }

        // Check if organizer account already exists
        const organizerEmail = 'organizer@example.com'
        const existingOrganizer = await findOrganizerByEmail(organizerEmail)
        if (!existingOrganizer) {
            const organizerPassword = await bcrypt.hash('organizer123', 10)
            await createOrganizer({
                name: 'Event Organizer',
                email: organizerEmail,
                phone: '+1234567891',
                password: organizerPassword,
            })
            console.log('✓ Organizer account created:')
            console.log(`  Email: ${organizerEmail}`)
            console.log('  Password: organizer123')
        } else {
            console.log(`⚠ Organizer account already exists: ${organizerEmail}`)
        }

        console.log('\n✅ Default accounts seeding completed!')
    } catch (error) {
        console.error('❌ Error creating default accounts:', error)
        throw error
    }
}

// Run seeder if called directly
// Use: node -r ts-node/register src/seeders/create-default-accounts.seeder.js
// Or: babel-node src/seeders/create-default-accounts.seeder.js
if (
    import.meta.url === `file://${process.argv[1]}` ||
    process.argv[1]?.includes('create-default-accounts.seeder')
) {
    import('../configs/postgre_sql.js').then(async ({default: sequelize}) => {
        try {
            await sequelize.authenticate()
            console.log('Database connection established.')
            await createDefaultAccounts()
            await sequelize.close()
            process.exit(0)
        } catch (error) {
            console.error('Error:', error)
            process.exit(1)
        }
    })
}

export default createDefaultAccounts
