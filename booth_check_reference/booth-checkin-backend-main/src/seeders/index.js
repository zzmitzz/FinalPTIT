import {db} from '@/configs'
import adminSeeder from './admin.fake.seeder'
import permissionTypeSeeder from './permission-type.seeder'
import permissionGroupSeeder from './permission-group.seeder'
import permissionSeeder from './permission.seeder'
import roleSeeder from './role.seeder'

async function seed() {
    await db.transaction(async function (session) {
        console.log('Initializing data...')

        await adminSeeder(session)
        await permissionTypeSeeder(session)
        await permissionGroupSeeder(session)
        await permissionSeeder(session)
        await roleSeeder(session)

        console.log('Data has been initialized!')
    })
}

db.connect().then(seed).then(db.close)
