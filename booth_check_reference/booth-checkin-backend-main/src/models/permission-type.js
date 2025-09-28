import createModel from './base'

const PermissionType = createModel('PermissionType', 'permission_types', {
    name: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    position: {
        type: Number,
        required: true,
    },
})

export default PermissionType
