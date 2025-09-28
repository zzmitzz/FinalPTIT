import { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD} from './constants'
import pg from 'pg'

const pool = new pg.Pool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    // Connection pool configuration
    max: 20, // Maximum number of clients in the pool
    min: 5,  // Minimum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    acquireTimeoutMillis: 60000, // Return an error after 60 seconds if a client could not be acquired
})

// Connection state listeners
pool.on('connect', (client) => {
    console.log('PostgreSQL: New client connected to database')
})

pool.on('acquire', (client) => {
    console.log('PostgreSQL: Client acquired from pool')
})

pool.on('remove', (client) => {
    console.log('PostgreSQL: Client removed from pool')
})

pool.on('error', (err, client) => {
    console.error('PostgreSQL: Unexpected error on idle client', err)
    // Don't exit the process, just log the error
})

// Handle process termination gracefully
process.on('SIGINT', async () => {
    console.log('PostgreSQL: Gracefully shutting down connection pool...')
    await pool.end()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    console.log('PostgreSQL: Gracefully shutting down connection pool...')
    await pool.end()
    process.exit(0)
})

// Health check function
export const checkDatabaseHealth = async () => {
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT NOW() as current_time')
        client.release()
        console.log('PostgreSQL: Database health check passed', result.rows[0])
        return true
    } catch (error) {
        console.error('PostgreSQL: Database health check failed', error.message)
        return false
    }
}

// Connection pool statistics
export const getPoolStats = () => {
    return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    }
}

export default pool