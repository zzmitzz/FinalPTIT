import { DataTypes } from "sequelize"
import sequelize from '../configs/postgre_sql.js'

// Field type constants
export const FIELD_TYPE = {
    EMAIL: 'EMAIL',
    PHONE: 'PHONE',
    FILE: 'FILE',
    FACE_ID: 'FACE_ID',
    RADIO: 'RADIO',
    CHECKBOX: 'CHECKBOX',
    TEXT: 'TEXT',
    TEXTAREA: 'TEXTAREA',
    NUMBER: 'NUMBER',
    DATE: 'DATE',
    TIME_MINUTE: 'TIME_MINUTE'
} as const

export interface FormFieldAttributes {
    _id: string
    form_id: string
    is_primary_key: boolean
    can_edit: boolean
    field_label: string
    field_description?: string
    field_type: keyof typeof FIELD_TYPE
    field_options: string[]
    field_has_other_option: boolean
    field_range: {
        min: number | null
        max: number | null
    }
    field_extensions: string[]
    required: boolean
    position: number
    created_at: Date
    updated_at: Date
}

const FormFields = sequelize.define('form_fields', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    form_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'forms',
            key: '_id'
        }
    },
    is_primary_key: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    can_edit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    field_label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    field_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    field_type: {
        type: DataTypes.ENUM(...Object.values(FIELD_TYPE)),
        allowNull: false
    },
    field_options: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: []
    },
    field_has_other_option: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    field_range: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: { min: null, max: null }
    },
    field_extensions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: []
    },
    required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    tableName: 'form_fields',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

export default FormFields