import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'
import { CHECKIN_TYPE } from '../configs/constants.js'

export interface CheckinHistoryAttributes {
    _id: number
    registration_id: string
    event_id: string
    checkin_type: keyof typeof CHECKIN_TYPE
    checkin: Date
    created_at: Date
    updated_at: Date
}

const CheckinHistory = sequelize.define('checkin_history', {
    _id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    registration_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'registrations',
            key: '_id'
        }
    },
    event_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'events',
            key: '_id'
        }
    },
    checkin_type: {
        type: DataTypes.ENUM(...Object.values(CHECKIN_TYPE)),
        allowNull: false,
        comment: 'Type of check-in: QR_SCAN, FACE_ID, or LOCATION'
    },
    checkin: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Timestamp when the user checked in'
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
}, {
    tableName: 'checkin_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'History of user check-ins to events'
})

export default CheckinHistory

