import { DataTypes } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'
import Event from './event'

export interface EventSocialLinkAttributes {
  id: number
  event_id: string
  platform: string
  url: string
  label?: string | null
  position: number
  created_at: Date
  updated_at: Date
}

const EventSocialLink = sequelize.define(
  'event_social_links',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: '_id',
      },
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    comment: 'Social links associated with events',
    indexes: [
      {
        name: 'idx_event_social_links_event_id',
        fields: ['event_id'],
      },
    ],
  }
)

// Associations
Event.hasMany(EventSocialLink, {
  foreignKey: 'event_id',
  as: 'social_links',
})
EventSocialLink.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event',
})

export default EventSocialLink
