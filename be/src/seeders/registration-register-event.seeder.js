import RegistrationRegisterEvent from '../model/registration_register_event.js'
import Event from '../model/event.js'
import Registration from '../model/registration.js'
import chalk from 'chalk'

/**
 * Seeder for registration_register_event table
 * Creates mock data for testing user event registrations
 */
async function registrationRegisterEventSeeder(transaction) {
    try {
        console.log(chalk.blue('Starting registration_register_event seeder...'))

        // Get existing events and registrations
        const events = await Event.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            transaction
        })

        const registrations = await Registration.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            transaction
        })

        if (events.length === 0) {
            console.log(chalk.yellow('⚠ No events found. Please seed events first.'))
            return
        }

        if (registrations.length === 0) {
            console.log(chalk.yellow('⚠ No registrations found. Please seed registrations first.'))
            return
        }

        console.log(chalk.cyan(`Found ${events.length} events and ${registrations.length} registrations`))

        // Create registration records
        const registrationData = []
        let recordCount = 0

        for (const event of events) {
            // Register 60-80% of users for each event
            const numToRegister = Math.floor(registrations.length * (0.6 + Math.random() * 0.2))
            
            // Shuffle registrations to get random selection
            const shuffled = [...registrations].sort(() => Math.random() - 0.5)
            
            for (let i = 0; i < shuffled.length; i++) {
                const registration = shuffled[i]
                const isRegistered = i < numToRegister
                
                // Create registration with varying dates
                const daysAgo = Math.floor(Math.random() * 30) // Random date within last 30 days
                const createdAt = new Date()
                createdAt.setDate(createdAt.getDate() - daysAgo)
                
                registrationData.push({
                    event_id: event._id,
                    registration_id: registration._id,
                    is_registered: isRegistered,
                    created_at: createdAt,
                    updated_at: createdAt
                })
                
                recordCount++
            }
        }

        // Bulk insert with conflict handling
        const created = await RegistrationRegisterEvent.bulkCreate(registrationData, {
            ignoreDuplicates: true, // Skip duplicates instead of throwing error
            transaction
        })

        console.log(chalk.green(`✓ Created ${created.length} registration_register_event records`))
        
        // Show statistics
        const stats = await getStatistics(transaction)
        console.log(chalk.cyan('\nStatistics:'))
        console.log(chalk.white(`  Total records: ${stats.total}`))
        console.log(chalk.green(`  Registered: ${stats.registered}`))
        console.log(chalk.yellow(`  Unregistered: ${stats.unregistered}`))
        console.log(chalk.blue(`  Registration rate: ${stats.registrationRate}%`))

    } catch (error) {
        console.error(chalk.red('Error in registration_register_event seeder:'), error)
        throw error
    }
}

/**
 * Get statistics about the seeded data
 */
async function getStatistics(transaction) {
    const total = await RegistrationRegisterEvent.count({ transaction })
    const registered = await RegistrationRegisterEvent.count({
        where: { is_registered: true },
        transaction
    })
    const unregistered = total - registered
    const registrationRate = total > 0 ? ((registered / total) * 100).toFixed(2) : 0

    return {
        total,
        registered,
        unregistered,
        registrationRate
    }
}

/**
 * Clear all registration_register_event data
 */
async function clearRegistrationRegisterEventData(transaction) {
    try {
        console.log(chalk.yellow('Clearing registration_register_event data...'))
        const deleted = await RegistrationRegisterEvent.destroy({
            where: {},
            truncate: true,
            transaction
        })
        console.log(chalk.green(`✓ Cleared ${deleted} records`))
    } catch (error) {
        console.error(chalk.red('Error clearing data:'), error)
        throw error
    }
}

export default registrationRegisterEventSeeder
export { clearRegistrationRegisterEventData }

