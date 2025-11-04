import sourceMapSupport from 'source-map-support'
import { spawn } from 'child_process'
import { db } from './configs'

import createApp from '.'
import { getInterfaceIp } from './utils/helpers'

// enable source maps
sourceMapSupport.install()

const host = process.env.HOST || 'localhost'
const port = parseInt(process.env.PORT, 10) || 3456

const app = createApp()

async function startServer(){
    try {
    await db.authenticate()
    await db.sync({ alter: true })
    console.log('PostgreSQL: Connection has been established successfully.')
    app.listen(port, host, async function () {
    let displayHostname = host
    if (['0.0.0.0', '::'].includes(host)) {
        if (host === '0.0.0.0') {
            displayHostname = await getInterfaceIp('IPv4')
        } else {
            displayHostname = await getInterfaceIp('IPv6')
        }
    }
    if (host.includes(':')) {
        displayHostname = `[${displayHostname}]`
    }
    console.log(`Server is running on http://${displayHostname}:${port} in ${app.settings.env} mode.`)
})
} catch (error) {
    console.error('PostgreSQL: Unable to connect to the database:', error)
}
}

startServer()
// Run Server


// // scheduled tasks
// // executeScheduledTasks()

// // Eslint
// if (process.env.__ESLINT__ === 'true') {
//     const command = 'npm'
//     const args = ['run', 'lint:fix', '--silent']
//     const options = {stdio: 'inherit', shell: true}
//     const eslintProcess = spawn(command, args, options)

//     eslintProcess.on('close', function (code) {
//         if (code !== 0) process.exit(1)
//     })
// }
