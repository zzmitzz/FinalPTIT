import bcrypt from 'bcrypt'
import createModel, {ObjectId} from './base'

const Admin = createModel(
    'Admin',
    'admins',
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },
        phone: {
            type: String,
            trim: true,
            lowercase: true,
            default: '',
        },
        password: {
            type: String,
            required: true,
            set(password) {
                const salt = bcrypt.genSaltSync(10)
                return bcrypt.hashSync(password, salt)
            },
        },
        is_protected: {
            type: Boolean,
            required: true,
            default: false,
        },
        role_ids: {
            type: [ObjectId],
            ref: 'Role',
            default: [],
        },
        deleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        toJSON: {
            virtuals: false,
            transform(doc, ret) {
                // eslint-disable-next-line no-unused-vars
                const {password, deleted, ...result} = ret
                return result
            },
        },
        methods: {
            verifyPassword(password) {
                return bcrypt.compareSync(password, this.password)
            },
        },
    }
)

export default Admin
