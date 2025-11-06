import sequelize from '../configs/postgre_sql.js'
import createDefaultAccounts from './create-default-accounts.seeder.js'

async function runSeeder() {
    try {
        await sequelize.authenticate()
        console.log('Database connection established.')
        await createDefaultAccounts()
        await sequelize.close()
        console.log('Seeder completed successfully.')
        process.exit(0)
    } catch (error) {
        console.error('Error running seeder:', error)
        process.exit(1)
    }
}

runSeeder()

