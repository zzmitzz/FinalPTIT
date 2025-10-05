import { DataTypes } from "sequelize"
import sequelize from '../configs/postgre_sql.js'

export interface RegistrationResponseAttributes {
    _id: string
    event_id: string
    form_fields_id: string
    registration_id: string
    response: any
    created_at: Date
    updated_at: Date
}

const RegistrationResponses = sequelize.define('registration_responses', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
    form_fields_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'form_fields',
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
    response: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
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
    tableName: 'registration_responses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

export default RegistrationResponses

