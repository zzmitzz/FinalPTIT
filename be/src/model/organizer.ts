import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface OrganizerAttributes {
    _id: string
    name: string
    email: string
    phone: string
    password: string
    avatar?: string
    created_at: Date
    updated_at: Date
}

const Organizer = sequelize.define('organizers', {
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
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'bcrypt hashed'
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the organizer account is active'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Event organizers who create and manage events'
})

export default Organizer
