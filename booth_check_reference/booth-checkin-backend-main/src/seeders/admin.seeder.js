import {Admin} from '@/models'

async function adminSeeder(session) {
    let email = process.env.SUPER_ADMIN_EMAIL
    let password = process.env.SUPER_ADMIN_PASSWORD
    const superAdmin = await Admin.findOne({is_protected: true, deleted: false}, null, {session})

    if (!superAdmin) {
        if (!email || !password) {
            email = 'admin@zent.vn'
            password = 'Z3ntSoft@D3v'
            console.log('---------------------------------------------------------------')
            console.log('"Super Admin" is not configured. Using the default account:')
            console.log(`Email: ${email}`)
            console.log(`Password: ${password}`)
            console.log('---------------------------------------------------------------')
        }
        const admin = new Admin({email, password, name: 'Super Admin', is_protected: true})
        await admin.save({session})
    } else if (email && password) {
        superAdmin.email = email
        superAdmin.password = password
        await superAdmin.save({session})
    }
}

export default adminSeeder
