import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface AdminAttributes {
    _id: string
    name: string
    email: string
    phone: string
    password: string
    role_ids: string[]
}

const Admin = sequelize.define('admins', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'bcrypt hashed'
    },
    role_ids: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
        defaultValue: []
    }
}, {
    freezeTableName: true,
    timestamps: false
})

export default Admin