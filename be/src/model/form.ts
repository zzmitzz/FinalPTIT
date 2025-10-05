import { DataTypes } from "sequelize"
import sequelize from '../configs/postgre_sql.js'

export interface FormAttributes {
    _id: string
    event_id: string
    title: string
    description: string
    is_public: boolean
    created_at: Date
    updated_at: Date
}

const Form = sequelize.define('forms', {
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
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

export default Form