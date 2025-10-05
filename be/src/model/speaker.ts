import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface SpeakerAttributes {
    id: number
    full_name: string
    bio: string
    email: string
    phone: string
    event_id: string
    organization: string
    photo_url: string
    title: string // Added improvement: professional title
    linkedin_url: string // Added improvement: social media links
    expertise_areas: string[] // Added improvement: areas of expertise
    is_active: boolean // Added improvement: enable/disable speakers
    created_at: Date
    updated_at: Date
}

const Speaker = sequelize.define('speakers', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    event_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'events',
            key: '_id'
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    organization: {
        type: DataTypes.STRING,
        allowNull: true
    },
    photo_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Professional title or position'
    },
    linkedin_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    expertise_areas: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        comment: 'Areas of expertise or specialization'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the speaker is currently active and available'
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
    comment: 'Speakers who can present at sessions'
})

export default Speaker
