import {PermissionType} from '@/models'

const permissionTypeData = [
    {
        name: 'Truy cập',
        code: 'list',
        position: 0,
    },
    {
        name: 'Tạo mới',
        code: 'create',
        position: 1,
    },
    {
        name: 'Chỉnh sửa',
        code: 'update',
        position: 2,
    },
    {
        name: 'Xoá',
        code: 'delete',
        position: 3,
    },
    {
        name: 'Xem chi tiết',
        code: 'read',
        position: 4,
    },
]

async function permissionTypeSeeder(session) {
    for (const item of permissionTypeData) {
        const {code, ...rest} = item
        await PermissionType.findOneAndUpdate(
            {code},
            {$set: rest},
            {upsert: true, session}
        )
    }
    await PermissionType.deleteMany({code: {$nin: permissionTypeData.map(({code}) => code)}}, {session})
}

export default permissionTypeSeeder
