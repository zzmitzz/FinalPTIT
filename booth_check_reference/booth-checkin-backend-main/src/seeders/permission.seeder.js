import {PERMISSION, Permission, Role} from '@/models'

const permissionData = [
    {
        code: PERMISSION.DASHBOARD,
        description: 'Theo dõi thống kê nhanh hệ thống',
        permission_group_code: 'dashboard-management',
        permission_type_code: 'list',
    },
    {
        code: PERMISSION.LIST_ADMIN,
        description: 'Xem danh sách người dùng',
        permission_group_code: 'admin-management',
        permission_type_code: 'list',
    },
    {
        code: PERMISSION.CREATE_ADMIN,
        description: 'Tạo mới người dùng',
        permission_group_code: 'admin-management',
        permission_type_code: 'create',
    },
    {
        code: PERMISSION.UPDATE_ADMIN,
        description: 'Chỉnh sửa người dùng',
        permission_group_code: 'admin-management',
        permission_type_code: 'update',
    },
    {
        code: PERMISSION.DELETE_ADMIN,
        description: 'Xoá người dùng',
        permission_group_code: 'admin-management',
        permission_type_code: 'delete',
    },
    {
        code: PERMISSION.LIST_ROLE,
        description: 'Xem danh sách vai trò',
        permission_group_code: 'role-management',
        permission_type_code: 'list',
    },
    {
        code: PERMISSION.CREATE_ROLE,
        description: 'Tạo mới vai trò',
        permission_group_code: 'role-management',
        permission_type_code: 'create',
    },
    {
        code: PERMISSION.UPDATE_ROLE,
        description: 'Chỉnh sửa vai trò',
        permission_group_code: 'role-management',
        permission_type_code: 'update',
    },
    {
        code: PERMISSION.DELETE_ROLE,
        description: 'Xoá vai trò',
        permission_group_code: 'role-management',
        permission_type_code: 'delete',
    },
    {
        code: PERMISSION.UPDATE_PERMISSION_FOR_ROLE,
        description: 'Chỉnh sửa quyền lại cho vai trò',
        permission_group_code: 'permission-management',
        permission_type_code: 'update',
    },
    {
        code: PERMISSION.CREATE_ORGANIZER,
        description: 'Tạo mới đối tác',
        permission_group_code: 'organizer-management',
        permission_type_code: 'create',
    },
    {
        code: PERMISSION.UPDATE_ORGANIZER,
        description: 'Chỉnh sửa đối tác',
        permission_group_code: 'organizer-management',
        permission_type_code: 'update',
    },
    {
        code: PERMISSION.DELETE_ORGANIZER,
        description: 'Xóa đối tác',
        permission_group_code: 'organizer-management',
        permission_type_code: 'delete',
    },
    {
        code: PERMISSION.LIST_ORGANIZER,
        description: 'Xem danh sách đối tác',
        permission_group_code: 'organizer-management',
        permission_type_code: 'list',
    },
    {
        code: PERMISSION.READ_ORGANIZER,
        description: 'Xem chi tiết đối tác',
        permission_group_code: 'organizer-management',
        permission_type_code: 'read',
    },
    {
        code: PERMISSION.UPDATE_EVENT,
        description: 'Chỉnh sửa sự kiện',
        permission_group_code: 'event-management',
        permission_type_code: 'update',
    },
    {
        code: PERMISSION.LIST_EVENT,
        description: 'Xem danh sách sự kiện',
        permission_group_code: 'event-management',
        permission_type_code: 'list',
    },
    {
        code: PERMISSION.READ_EVENT,
        description: 'Xem chi tiết sự kiện',
        permission_group_code: 'event-management',
        permission_type_code: 'read',
    },

    {
        code: PERMISSION.LIST_BOOTH,
        description: 'Xem danh sách Booth Check In',
        permission_group_code: 'booth-management',
        permission_type_code: 'list',
    },
    {
        code: PERMISSION.CREATE_BOOTH,
        description: 'Tạo mới Booth Check In',
        permission_group_code: 'booth-management',
        permission_type_code: 'create',
    },
    {
        code: PERMISSION.UPDATE_BOOTH,
        description: 'Chỉnh sửa Booth Check In',
        permission_group_code: 'booth-management',
        permission_type_code: 'update',
    },
    {
        code: PERMISSION.DELETE_BOOTH,
        description: 'Xoá Booth Check In',
        permission_group_code: 'booth-management',
        permission_type_code: 'delete',
    },
    {
        code: PERMISSION.ASSIGN_BOOTH_TO_EVENT,
        description: 'Phân phối Booth Check In cho sự kiện',
        permission_group_code: 'assign-booth-management',
        permission_type_code: 'update',
    },
]

async function permissionSeeder(session) {
    for (const item of permissionData) {
        const {code, ...rest} = item
        await Permission.findOneAndUpdate({code}, {$set: rest}, {upsert: true, session})
    }
    const permissionCodes = permissionData.map(({code}) => code)
    let permissionRemove = await Permission.find({code: {$nin: permissionCodes}}).session(session)
    permissionRemove = permissionRemove.map(({_id}) => _id)
    if (permissionRemove.length > 0) {
        await Permission.deleteMany({_id: {$in: permissionRemove}}, {session})
        await Role.updateMany(
            {permissions: {$in: permissionRemove}},
            {$pull: {permission_ids: {$in: permissionRemove}}},
            {session}
        )
    }
}

export default permissionSeeder
