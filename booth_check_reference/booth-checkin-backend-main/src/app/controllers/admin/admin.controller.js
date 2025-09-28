import * as adminService from '@/app/services/admin.service'
import {db} from '@/configs'
import {abort} from '@/utils/helpers'

export async function createAdmin(req, res) {
    await db.transaction(async function (session) {
        await adminService.create(session, req.body)

        res.status(201).jsonify('Tạo mới người dùng thành công.')
    })
}

export async function updateAdmin(req, res) {
    await db.transaction(async function (session) {
        await adminService.updateAdmin(session, req.admin, req.body)

        res.status(201).jsonify('Cập nhật người dùng thành công.')
    })
}

export async function removeAdmin(req, res) {
    if (req.currentAdmin._id.equals(req.admin._id)) {
        abort(400, 'Không thể xóa chính mình.')
    }

    await db.transaction(async function (session) {
        await adminService.remove(session, req.admin)

        res.status(201).jsonify('Xóa người dùng thành công.')
    })
}

export async function getListAdmin(req, res) {
    res.status(201).jsonify(await adminService.getList(req.query))
}

export async function changePassword(req, res) {
    await db.transaction(async function (session) {
        await adminService.changePassword(session, req.admin, req.body.password)

        res.status(201).jsonify('Cập nhật mật khẩu người dùng thành công.')
    })
}

