import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface SessionAttributes {
    id: number
    event_id: string
    title: string
    description: string
    start_time: Date
    end_time: Date
    place: string
    capacity: number
    is_active: boolean // Added improvement: enable/disable sessions
    session_type: string // Added improvement: categorize sessions (workshop, panel, keynote, etc.)
    prerequisites: string // Added improvement: session requirements
    tags: string[] // Added improvement: searchable tags
    created_at: Date
    updated_at: Date
}

const Session = sequelize.define('sessions', {
    id: {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    place: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50
    },
   
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the session is currently active and accepting registrations'
    },
    session_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'general',
        comment: 'Type of session: workshop, panel, keynote, networking, etc.'
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        comment: 'Tags for categorizing and searching sessions'
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
    comment: 'Sessions within events that users can register for'
})

export default Session
