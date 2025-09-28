import {PermissionGroup} from '@/models'

const permissionGroupData = [
    {
        name: 'Tổng quan',
        code: 'dashboard-management',
        position: 0,
    },
    {
        name: 'Quản lý người dùng',
        code: 'admin-management',
        position: 1,
    },
    {
        name: 'Quản lý vai trò',
        code: 'role-management',
        position: 2,
    },
    {
        name: 'Quản lý quyền hạn',
        code: 'permission-management',
        parent_code: 'role-management',
        position: 3,
    },
    {
        name: 'Quản lý đối tác',
        code: 'organizer-management',
        position: 4,
    },
    {
        name: 'Quản lý sự kiện',
        code: 'event-management',
        position: 5,
    },
    {
        name: 'Quản lý Booth Check In',
        code: 'booth-management',
        position: 6,
    },
    {
        name: 'Phân phối Booth Check In',
        code: 'assign-booth-management',
        parent_code: 'booth-management',
        position: 7,
    },
]

async function permissionGroupSeeder(session) {
    for (const item of permissionGroupData) {
        const {code, ...rest} = item
        await PermissionGroup.findOneAndUpdate(
            {code},
            {$set: rest},
            {upsert: true, session}
        )
    }
    await PermissionGroup.deleteMany({code: {$nin: permissionGroupData.map(({code}) => code)}}, {session})
}

export default permissionGroupSeeder
