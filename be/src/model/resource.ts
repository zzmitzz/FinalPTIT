import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

// Resource type enum
export const RESOURCE_TYPE = {
    MAPS: 'MAPS',
    FILE: 'FILE'
} as const


export interface ResourceAttributes {
    id: number
    session_id: number | null
    event_id: string | null
    resource_type: typeof RESOURCE_TYPE
    name: string
    url_source: string
    description: string
    file_size_bytes: number // Added improvement: track file sizes
    mime_type: string // Added improvement: track file types
    is_public: boolean // Added improvement: control public access
    upload_date: Date // Added improvement: separate upload tracking
    is_active: boolean // Added improvement: enable/disable resources
    tags: string[] // Added improvement: searchable tags
    created_at: Date
    updated_at: Date
}

const Resource = sequelize.define('resources', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    session_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'sessions',
            key: 'id'
        },
        comment: 'Can be null if resource belongs to event'
    },
    event_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'events',
            key: '_id'
        },
        comment: 'Can be null if resource belongs to session'
    },
    resource_type: {
        type: DataTypes.ENUM(...Object.values(RESOURCE_TYPE)),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url_source: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    file_size_bytes: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: 'File size in bytes for uploaded files'
    },
    mime_type: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'MIME type of the resource (e.g., application/pdf, image/jpeg)'
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the resource is publicly accessible'
    },
    download_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of times the resource has been downloaded'
    },
    upload_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'When the resource was uploaded'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the resource is currently active and accessible'
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        comment: 'Tags for categorizing and searching resources'
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
    comment: 'Resources associated with events or sessions',
    validate: {
        eitherSessionOrEvent() {
            console.log(this.session_id, this.event_id)
            console.log((this.session_id === null) === (this.event_id === null))
            if ((this.session_id === null) && (this.event_id === null)) {
                throw new Error('Resource must belong to either a session or an event, but not both')
            }
        }
    }
})

export default Resource
