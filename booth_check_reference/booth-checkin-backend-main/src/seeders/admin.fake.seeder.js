import {Admin} from '@/models'

async function adminSeeder(session) {
    const email = 'hinhnv@ptit.edu.vn'
    const password = '123456'
    console.log(email, password)
    const admin = await Admin.findOne({email, deleted: false}, null, {session})
    console.log(admin)
    if (!admin) {
        const admin = new Admin({email, password, name: 'Nguyen Van Hinh', is_protected: true})
        console.log(admin)
        await admin.save({session})
    } else if (email && password) {
        admin.email = email
        admin.password = password
        await admin.save({session})
    }
}

export default adminSeeder
