import { DataTypes } from "sequelize"
import sequelize from "../configs/postgre_sql.js"

export interface RegistrationData {
    _id: string,
    email: string,
    password: string,
    phone: string,
    provider_name: string,
    provider_user_id: string,
    full_name?: string,
    dob?: Date,
    gender?: string,
    address?: string,
    avatar_url?: string,
    bio?: string,
    is_active: boolean,
    created_at: Date,
    updated_at: Date
}

const Registration = sequelize.define('registrations', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    provider_name: {
        type: DataTypes.STRING,
    },
    provider_user_id: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Participant profile fields
    full_name: {
        type: DataTypes.STRING,
    },
    dob: {
        type: DataTypes.DATE,
    },
    gender: {
        type: DataTypes.STRING,
    },
    address: {
        type: DataTypes.STRING,
    },
    avatar_url: {
        type: DataTypes.STRING,
    },
    bio: {
        type: DataTypes.TEXT,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: 'created_at'
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: 'updated_at'
    }
})

export default Registration