import { EVENT_CATEGORY, EVENT_STATUS, EVENT_STATE } from "../configs/constants.js"
import { DataTypes } from "sequelize"
import sequelize from '../configs/postgre_sql.js'

export interface EventAttributes {
    _id: string,
    organizer_id: string,
    name: string,
    thumbnail: string,
    logo: string,
    description: string,
    start_time: Date,
    end_time: Date,
    location: string,
    lat: number,
    lng: number,
    category_id: typeof EVENT_CATEGORY,
    tags: string[],
    capacity: Number,
    state: typeof EVENT_STATE,
    status: typeof EVENT_STATUS,
    pin_code: string,
    approver_id: string,
    created_at: Date,
    updated_at: Date,
}

const Event = sequelize.define('events', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    organizer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'organizers',
            key: '_id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    logo: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lat: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    lng: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.ENUM(...Object.values(EVENT_CATEGORY)),
        allowNull: false,
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM(...Object.values(EVENT_STATUS)),
        allowNull: false,
    },
    state: {
        type: DataTypes.ENUM(...Object.values(EVENT_STATE)),
        allowNull: false,
    },
    pin_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    approver_id: {
        type: DataTypes.UUID,
        allowNull: true,
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
    },
})

export default Event