import {Permission, PermissionGroup, PermissionType} from '@/models'

export async function listPermissionType() {
    const result = await PermissionType.find().sort({position: 1}).select('-created_at -updated_at').lean()
    return result
}
export async function permissionInRole(role) {
    const groups = await PermissionGroup.find({}, {created_at: 0, updated_at: 0}).sort({position: 1}).lean()
    const permissions = await Permission.find({}, {created_at: 0, updated_at: 0}).lean()
    const permissionTypes = await PermissionType.find({}, {created_at: 0, updated_at: 0})
        .sort({position: 1})
        .lean()

    const result = await findGroups(groups, null, permissions, permissionTypes, role)

    return result
}
async function findGroups(groups, parent_code, permissions, types, role) {
    const children = groups.filter((group) => group.parent_code === parent_code)
    for (const child of children) {
        const permissionsOfChild = permissions.filter((item) => item.permission_group_code === child.code)
        if (permissionsOfChild.length > 0) {
            const permissionTypeCodes = types.map(({code}) => code)
            const permissionsByType = []

            for (const type of permissionTypeCodes) {
                permissionsByType.push(
                    permissionsOfChild.find((permission) => permission.permission_type_code === type)
                )
            }

            for (const permission of permissionsByType) {
                if (permission) {
                    permission.active = role.permission_ids.some((permissionId) =>
                        permissionId.equals(permission._id)
                    )
                }
            }

            child.permissions = permissionsByType
        }

        child.children = await findGroups(groups, child.code, permissions, types, role)
    }

    return children
}
