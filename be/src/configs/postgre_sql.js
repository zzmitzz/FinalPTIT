import {DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD} from './constants.js'
import {Sequelize} from 'sequelize'

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
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

export {sequelize}
export default sequelize
