import * as roleService from '@/app/services/role.service'
import * as permissionService from '@/app/services/permission.service'

import {db} from '@/configs'

export async function readRoot(req, res) {
    const result = await roleService.tree()
    res.jsonify(result)
}
export async function readPermissionTypes(req, res) {
    const result = await permissionService.listPermissionType()
    res.jsonify(result)
}
export async function createItem(req, res) {
    await db.transaction(async function (session) {
        await roleService.create(session, req.body)
        res.status(201).jsonify()
    })
}
export async function updateItem(req, res) {
    await db.transaction(async function (session) {
        await roleService.update(session, req.role, req.body)
        res.status(201).jsonify()
    })
}
export async function readPermissionOfRole(req, res) {
    const result = await permissionService.permissionInRole(req.role)
    res.jsonify(result)
}
export async function deleteItem(req, res) {
    await db.transaction(async function (session) {
        await roleService.deleteWithChildren(session, req.role)
        res.jsonify()
    })
}
export async function switchPermissionOfRole(req, res) {
    await db.transaction(async function (session) {
        await roleService.switchPermission(session, req.role, req.permission)
        res.status(201).jsonify()
    })
}
export async function readEmployeesWithRole(req, res) {
    const result = await roleService.readEmployees(req.role)
    res.jsonify(result)
}
export async function readEmployeesWithoutRole(req, res) {
    const result = await roleService.readEmployees(req.role, false)
    res.jsonify(result)
}
export async function addAdminForRole(req, res) {
    await db.transaction(async function (session) {
        await roleService.addAdmin(session, req.role, req.body.admin_ids)
        res.status(201).jsonify()
    })
}
export async function deleteAdminInRole(req, res) {
    await db.transaction(async function (session) {
        await roleService.deleteAdmin(session, req.role, req.admin)
        res.status(201).jsonify()
    })
}
