import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface SessionSpeakerAttributes {
    id: number
    session_id: number
    speaker_id: number
    role: string
    speaking_order: number // Added improvement: order of speakers in session
    speaking_duration_minutes: number // Added improvement: allocated time for each speaker
    notes: string // Added improvement: internal notes about the speaker's participation
    created_at: Date
    updated_at: Date
}

const SessionSpeaker = sequelize.define('session_speakers', {
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
    
    speaker_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'speakers',
            key: 'id'
        }
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'speaker',
        comment: 'Role in session: main_speaker, panelist, moderator, co_speaker, etc.'
    },
    speaking_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Order in which the speaker will present (1, 2, 3, etc.)'
    },
    speaking_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Allocated speaking time in minutes'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Internal notes about the speaker participation'
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
    comment: 'Junction table linking sessions with their speakers',
    indexes: [
        {
            unique: true,
            fields: ['session_id', 'speaker_id']
        }
    ]
})

// Associations: link session_speakers to sessions and speakers for eager loading
try {
    // Require models dynamically to avoid circular import issues
    // and only set associations if models are available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Speaker = require('./speaker').default
    const Session = require('./session').default

    SessionSpeaker.belongsTo(Speaker, {
        foreignKey: 'speaker_id',
        targetKey: 'id',
        as: 'speaker'
    })

    SessionSpeaker.belongsTo(Session, {
        foreignKey: 'session_id',
        targetKey: 'id',
        as: 'session'
    })

    // Also add reverse associations for convenience
    if (Speaker && typeof Speaker.hasMany === 'function') {
        Speaker.hasMany(SessionSpeaker, {
            foreignKey: 'speaker_id',
            sourceKey: 'id',
            as: 'sessionSpeakers'
        })
    }
    if (Session && typeof Session.hasMany === 'function') {
        Session.hasMany(SessionSpeaker, {
            foreignKey: 'session_id',
            sourceKey: 'id',
            as: 'sessionSpeakers'
        })
    }
} catch (err) {
    // If models aren't ready yet, skip association setup — associations may be set elsewhere
}

export default SessionSpeaker
