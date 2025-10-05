import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface SessionRegistrationAttributes {
    id: number
    session_id: number
    user_id: string
    status: string
    registered_at: Date
    check_in_time: Date // Added improvement: track actual attendance
    cancellation_reason: string // Added improvement: track why registrations are cancelled
    created_at: Date
    updated_at: Date
}

const SessionRegistration = sequelize.define('session_registrations', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    session_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'sessions',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'registrations',
            key: '_id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'attending',
        comment: 'Status: attending, waitlist, cancelled, checked_in, no_show'
    },
    registered_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    waitlist_position: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Position in waitlist (null if not on waitlist)'
    },
    check_in_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the user actually checked in to the session'
    },
    cancellation_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason provided for cancellation'
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
    comment: 'User registrations for specific sessions',
    indexes: [
        {
            unique: true,
            fields: ['session_id', 'user_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['registered_at']
        }
    ]
})

export default SessionRegistration
