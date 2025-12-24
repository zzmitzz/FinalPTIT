import { db } from '@/configs'
import chalk from 'chalk'

function seed() {
    return db.transaction(function () {
        console.log(chalk.bold('Initializing data...'))

        console.log(chalk.bold('Data has been initialized!'))
    })
}

db.connect().then(seed).then(db.close)
