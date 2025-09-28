import createModel from './base'

const PermissionGroup = createModel('PermissionGroup', 'permission_groups', {
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
    description: {
        type: String,
        default: '',
    },
    parent_code: {
        type: String,
        default: null,
    },
    position: {
        type: Number,
        required: true,
    }
})

export default PermissionGroup
