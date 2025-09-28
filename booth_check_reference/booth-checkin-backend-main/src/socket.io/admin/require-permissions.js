import {STATUS_DEFAULT_MESSAGE} from '@/configs'
import {Permission, Role} from '@/models'
import _ from 'lodash'

function requirePermissions(...permissions) {
    return async function (socket, next) {
        try {
            if (!_.isArray(socket.currentAdmin.permissions)) {
                const roles = await Role.find({_id: {$in: socket.currentAdmin.role_ids}})
                const permissions = await Permission.find({
                    _id: {$in: roles.map((role) => role.permission_ids).flat()},
                })
                socket.currentAdmin.permissions = permissions.map(({code}) => code)
            }
            for (const code of permissions) {
                if (socket.currentAdmin.permissions.includes(code)) {
                    next()
                    return
                }
            }
            next({message: STATUS_DEFAULT_MESSAGE[403]})
        } catch (error) {
            next({message: STATUS_DEFAULT_MESSAGE[500]})
        }
    }
}

export default requirePermissions
