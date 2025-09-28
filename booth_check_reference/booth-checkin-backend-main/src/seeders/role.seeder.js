import {Admin, Permission, Role} from '@/models'

async function roleSeeder(session) {
    const permissionIds = await Permission.find({}, null, {session}).distinct('_id')
    const superAdmin = await Admin.find({is_protected: true, deleted: false}, {_id: 1}, {session})
    const superAdminIds = superAdmin.map(({_id}) => _id)
    const role = await Role.findOneAndUpdate(
        {is_protected: true},
        {
            $set: {
                name: 'Super Admin',
                description: 'Có toàn quyền trong hệ thống',
                permission_ids: permissionIds,
                admin_ids: superAdminIds,
            },
        },
        {upsert: true, new: true, session}
    )
    await Admin.updateMany(
        {_id: {$in: superAdminIds}},
        {$addToSet: {role_ids: role._id}},
        {session}
    )
}

export default roleSeeder
