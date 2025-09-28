import createModel, {ObjectId} from './base'

const Role = createModel('Role', 'roles', {
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        default: '',
    },
    is_protected: {
        type: Boolean,
        required: true,
        default: false,
    },
    parent_id: {
        type: ObjectId,
        default: null,
    },
    permission_ids: {
        type: [ObjectId],
        ref: 'Permission',
        required: true,
        default: [],
    },
    admin_ids: {
        type: [ObjectId],
        ref: 'Admin',
        required: true,
        default: [],
    },
})

export default Role
