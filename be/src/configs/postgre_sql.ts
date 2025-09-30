import { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD} from './constants'
import { Sequelize } from 'sequelize'

const sequelize: Sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 20,
        min: 5,
        idle: 30000,
    },
})

async function initDB() {
    try {
        await sequelize.authenticate()
        console.log('PostgreSQL: Connection has been established successfully.')
    } catch (error) {
        console.error('PostgreSQL: Unable to connect to the database:', error)
    }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
    console.log('PostgreSQL: Gracefully shutting down connection...')
    await sequelize.close()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    console.log('PostgreSQL: Gracefully shutting down connection...')
    await sequelize.close()
    process.exit(0)
})

export default sequelize