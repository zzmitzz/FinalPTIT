import {Admin, Role} from '@/models'
import {AsyncValidate} from '@/utils/classes'
import Joi from 'joi'
import {isValidObjectId} from 'mongoose'
import * as roleService from '@/app/services/role.service'

export const createItem = Joi.object({
    name: Joi.string()
        .trim()
        .max(50)
        .required()
        .label('Tên vai trò')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const role = await Role.findOne({name: value})
                    return !role ? value : helpers.error('any.exists')
                })
        ),
    parent_id: Joi.string()
        .trim()
        .allow(null)
        .label('Vai trò cha')
        .custom(function (value, helpers) {
            if (!isValidObjectId(value)) {
                return helpers.message('{{#label}} không hợp lệ.')
            }
            return new AsyncValidate(value, async function () {
                const role = await Role.findOne({_id: value})
                return role ? value : helpers.message('{{#label}} không hợp lệ.')
            })
        }),
    description: Joi.string().trim().max(100).allow('').label('Mô tả'),
})

export const updateItem = Joi.object({
    name: Joi.string()
        .trim()
        .max(50)
        .required()
        .label('Tên vai trò')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const role = await Role.findOne({name: value, _id: {$ne: req.role._id}})
                    return !role ? value : helpers.error('any.exists')
                })
        ),
    parent_id: Joi.string()
        .trim()
        .allow(null)
        .required()
        .label('Vai trò cha')
        .custom(function (value, helpers) {
            if (!isValidObjectId(value)) {
                return helpers.message('{{#label}} không hợp lệ.')
            }
            return new AsyncValidate(value, async function (req) {
                const role = await Role.findOne({
                    $and: [{_id: value}, {_id: {$ne: req.role._id}}],
                })
                if (role) {
                    const tree = await roleService.tree()
                    if (!isNotValidParentId(tree, req.role._id, role._id)) {
                        return value
                    }
                }
                return helpers.message('{{#label}} không hợp lệ.')
            })
        }),
    description: Joi.string().trim().max(100).allow('').label('Mô tả'),
})

function isNotValidParentId(tree, id, parentId) {
    function findNodeById(node, id) {
        if (node._id.equals(id)) return node
        if (node.children) {
            for (const child of node.children) {
                const result = findNodeById(child, id)
                if (result) return result
            }
        }
        return null
    }

    function checkDescendant(node, parentId) {
        if (node._id.equals(parentId)) return true
        if (node.children) {
            for (const child of node.children) {
                if (checkDescendant(child, parentId)) return true
            }
        }
        return false
    }

    const startNode = findNodeById(tree[0], id)
    if (startNode) {
        return checkDescendant(startNode, parentId)
    }
    return false
}

export const addAdminForRole = Joi.object({
    admin_ids: Joi.array()
        .items(
            Joi.string()
                .trim()
                .label('Nhân viên')
                .custom(function (value, helpers) {
                    if (!isValidObjectId(value)) {
                        return helpers.message('{{#label}} không hợp lệ.')
                    }
                    return new AsyncValidate(value, async function (req) {
                        const admin = await Admin.findOne({
                            _id: value,
                            is_protected: false,
                            role_ids: {$ne: req.role._id},
                        })
                        return admin ? value : helpers.message('{{#label}} không hợp lệ.')
                    })
                })
        )
        .required()
        .label('Nhân viên'),
})
