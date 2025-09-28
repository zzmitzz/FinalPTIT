import sourceMapSupport from 'source-map-support'
import {spawn} from 'child_process'
import {db} from './configs'
import createApp from '.'
import executeScheduledTasks from './tasks'
import io from './socket.io'

// enable source maps
sourceMapSupport.install()

const host = process.env.HOST || 'localhost'
const port = parseInt(process.env.PORT, 10) || 3456

const app = createApp()
db.connect()

// Run Server
const server = app.listen(port, host, function () {
    console.log(`Server is running on http://${host}:${port} in ${app.settings.env} mode.`)
})

// socket.io
io.attach(server)

// scheduled tasks
executeScheduledTasks()

// Eslint
if (process.env.__ESLINT__ === 'true') {
    const command = 'npm'
    const args = ['run', 'lint', '--silent']
    const options = {stdio: 'inherit', shell: true}
    const eslintProcess = spawn(command, args, options)

    eslintProcess.on('close', function (code) {
        if (code === 0) {
            return
        }
        console.log('Server is gracefully shutting down...')
        db.close(true).then(function () {
            server.close(function () {
                console.log('Server has been closed. Goodbye!')
            })
        })
    })
}
