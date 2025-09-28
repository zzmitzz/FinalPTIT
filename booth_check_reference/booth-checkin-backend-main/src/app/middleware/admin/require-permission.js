import {Permission, Role} from '@/models'
import {abort} from '@/utils/helpers'
import _ from 'lodash'

function requirePermissions(...permissions) {
    return async function (req, res, next) {
        if (!_.isArray(req.currentAdmin.permissions)) {
            const roles = await Role.find({_id: {$in: req.currentAdmin.role_ids}})
            const permissions = await Permission.find({
                _id: {$in: roles.map((role) => role.permission_ids).flat()},
            })
            req.currentAdmin.permissions = permissions.map(({code}) => code)
        }
        for (const code of permissions) {
            if (req.currentAdmin.permissions.includes(code)) {
                next()
                return
            }
        }
        abort(403)
    }
}

export default requirePermissions
