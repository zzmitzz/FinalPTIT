import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'
import Event from './event'

export interface RegistrationRegisterEventAttributes {
    _id: number
    event_id: string
    registration_id: string
    is_registered: boolean
    created_at: Date
    updated_at: Date
}

const RegistrationRegisterEvent = sequelize.define('registration_register_event', {
    _id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    event_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'events',
            key: '_id'
        }
    },
    registration_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'registrations',
            key: '_id'
        }
    },
    is_registered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indicates if the user is registered for the event'
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
    tableName: 'registration_register_event',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'User registered event'
})

// Define association with Event
RegistrationRegisterEvent.belongsTo(Event, {
    foreignKey: 'event_id',
    targetKey: '_id',
    as: 'event'
})

export default RegistrationRegisterEvent

