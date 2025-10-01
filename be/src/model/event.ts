import { EVENT_STATUS } from "@/configs/constants"
import DataTypes = require("sequelize")
const sequelize = require('../configs/postgre_sql.js')


interface EventAttributes {
    _id: string,
    organizer_id: string,
    name: string,
    thumbnail: string,
    logo: string,
    description: string,
    start_time: Date,
    end_time: Date,
    location: string,
    category_id: string,
    tags: string[],
    status: string,
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
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    thumbnail: {
        type: DataTypes.STRING,
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
    category_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(...Object.values(EVENT_STATUS)),
        allowNull: false,
    },
    pin_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    approver_id: {
        type: DataTypes.UUID,
        allowNull: false,
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

module.exports = Event