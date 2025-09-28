import {Admin, Permission, Role} from '@/models'
import {abort} from '@/utils/helpers'
import {isValidObjectId} from 'mongoose'

export async function verifyRoleId(req, res, next) {
    if (isValidObjectId(req.params.roleId)) {
        const role = await Role.findById(req.params.roleId)
        if (role) {
            req.role = role
            next()
            return
        }
    }
    abort(404)
}
export async function requireRoleNotProtected(req, res, next) {
    if (req.role.is_protected) {
        abort(403)
    }
    next()
}
export async function verifyPermissionId(req, res, next) {
    if (isValidObjectId(req.params.permissionId)) {
        const permission = await Permission.findById(req.params.permissionId)
        if (permission) {
            req.permission = permission
            next()
            return
        }
    }
    abort(404)
}
export async function verifyAdminId(req, res, next) {
    if (isValidObjectId(req.params.adminId)) {
        const admin = await Admin.findOne({_id: req.params.adminId, deleted: false})
        if (admin) {
            if (admin.is_protected) {
                abort(403)
            }
            req.admin = admin
            next()
            return
        }
    }
    abort(404)
}
