import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface OrganizerDetailsAttributes {
    organizer_id: string
    organization_name: string
    address: string | null
    website: string | null
    description: string | null
    logo_url: string | null
    created_at: Date
    updated_at: Date
}

const OrganizerDetails = sequelize.define('organizer_details', {
    organizer_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'organizers',
            key: '_id'
        },
        comment: 'Primary key and foreign key to organizers table (1-1 relationship)'
    },
    organization_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    logo_url: {
        type: DataTypes.STRING,
        allowNull: true
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
    tableName: 'organizer_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Extended profile information for each organizer (1-1 relationship)'
})

export default OrganizerDetails

