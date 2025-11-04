import sequelize from '../configs/postgre_sql.js'
import registrationRegisterEventSeeder from './registration-register-event.seeder.js'
import chalk from 'chalk'

/**
 * Standalone script to run the registration_register_event seeder
 * Usage: node src/seeders/run-registration-register-event-seeder.js
 */
async function runSeeder() {
    try {
        console.log(chalk.bold.blue('\n=== Registration Register Event Seeder ===\n'))

        // Test database connection
        await sequelize.authenticate()
        console.log(chalk.green('✓ Database connection established'))

        // Run seeder in a transaction
        await sequelize.transaction(async (transaction) => {
            await registrationRegisterEventSeeder(transaction)
        })

        console.log(chalk.bold.green('\n✓ Seeding completed successfully!\n'))
        process.exit(0)
    } catch (error) {
        console.error(chalk.bold.red('\n✗ Seeding failed:'), error)
        process.exit(1)
    }
}

// Run the seeder
runSeeder()

