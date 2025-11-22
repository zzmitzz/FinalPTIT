import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface PlaceAttributes {
    id: string
    event_id: string
    name: string
    created_at: Date
    updated_at: Date
}

const Place = sequelize.define('places', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    event_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'events',
            key: '_id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Places/rooms for events'
})

export default Place
