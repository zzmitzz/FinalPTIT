import createModel from './base'

const Permission = createModel('Permission', 'permissions', {
    code: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    permission_group_code: {
        type: String,
        required: true,
    },
    permission_type_code: {
        type: String,
        required: true,
    },
})

export default Permission
