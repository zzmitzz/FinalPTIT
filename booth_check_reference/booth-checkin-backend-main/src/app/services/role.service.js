import {Admin, ObjectId, Role} from '@/models'
import _ from 'lodash'

function convertToTree(roles) {
    const dfs = (parent_id = null) => {
        const result = roles.filter((role) =>
            role.parent_id ? role.parent_id.equals(parent_id) : !parent_id
        )
        result.forEach(function (item) {
            const children = dfs(item._id)
            if (!_.isEmpty(children)) {
                item.children = children
            }
        })
        return result
    }
    return dfs()
}

export async function tree() {
    const roles = await Role.find({})
        .sort({is_protected: -1, _id: 1})
        .select({
            permission_ids: 0,
            created_at: 0,
            updated_at: 0,
            admin_ids: 0,
        })
        .lean()
    return convertToTree(roles)
}

export async function create(session, {name, parent_id, description}) {
    const role = new Role({name, description, parent_id})
    await role.save({session})
    return role
}

export async function update(session, role, {name, parent_id, description}) {
    role.name = name
    role.parent_id = parent_id || null
    role.description = description
    await role.save({session})
    return role
}

export async function deleteWithChildren(session, role) {
    async function findDescendants(roleId) {
        const descendants = await Role.find({parent_id: roleId}).session(session).lean()
        for (const role of descendants) {
            const children = await findDescendants(role._id)
            descendants.push(...children)
        }
        return descendants
    }

    const descendants = await findDescendants(role._id)
    descendants.push({_id: role._id})

    const idsToDelete = descendants.map((role) => role._id)
    await Role.deleteMany({_id: {$in: idsToDelete}}, {session})

    await Admin.updateMany(
        {role_ids: {$in: idsToDelete}},
        {$pull: {role_ids: {$in: idsToDelete}}},
        {session}
    )
}

export async function switchPermission(session, role, permission) {
    const hasPermission = role.permission_ids.some((id) => id.equals(permission._id))
    if (hasPermission) {
        role.permission_ids = role.permission_ids.filter((id) => !id.equals(permission._id))
    } else {
        role.permission_ids.push(permission._id)
    }
    await role.save({session})
}

export async function readEmployees(role, withRole = true, {q, page, page_size} = {}) {
    if (withRole) {
        const result = await Admin.find({deleted: false, role_ids: role._id}, {name: 1, email: 1})
            .sort({_id: -1})
            .lean()
        return result
    } else {
        const filter = {is_protected: false, deleted: false, role_ids: {$ne: role._id}}
        if (_.isString(q) && q.trim()) {
            q = q.trim()
            filter.name = {$regex: q, $options: 'i'}
            filter.email = {$regex: q, $options: 'i'}
        }
        page = parseInt(page) || 0
        page_size = parseInt(page_size) || 0
        if (page < 1) {
            page = 1
        }
        if (page_size < 1) {
            page_size = 20
        }
        const result = await Admin.find(filter, {name: 1, email: 1})
            .sort({_id: -1})
            .skip((page - 1) * page_size)
            .limit(page_size)
            .lean()
        const total = await Admin.countDocuments(filter)
        return {total, page, page_size, items: result}
    }
}

export async function addAdmin(session, role, adminIds) {
    adminIds = adminIds.map((adminId) => new ObjectId(_.toString(adminId)))
    await Admin.updateMany({_id: {$in: adminIds}}, {$addToSet: {role_ids: role._id}}, {session})
    await Role.findByIdAndUpdate(role._id, {$addToSet: {admin_ids: adminIds}}, {session})
}

export async function deleteAdmin(session, role, admin) {
    await Role.findByIdAndUpdate(role._id, {$pull: {admin_ids: admin._id}}, {session})
    await Admin.findByIdAndUpdate(admin._id, {$pull: {role_ids: role._id}}, {session})
}
