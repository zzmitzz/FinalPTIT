import {DataTypes} from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface NotificationData {
  _id: string
  sender_type: 'system_user' | 'organizer'
  system_user_id?: string
  organizer_id?: string
  title: string
  body: string
  image_url?: string
  action_type?: string
  action_data?: Record<string, any>
  scope: 'all' | 'event' | 'organizer'
  target_event_id?: string
  target_organizer_id?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  scheduled_at?: Date
  sent_at?: Date
  total_recipients: number
  total_sent: number
  total_delivered: number
  total_failed: number
  total_opened: number
  fcm_batch_id?: string
  created_at: Date
  updated_at: Date
}

const Notification = sequelize.define(
  'notifications',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sender_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['system_user', 'organizer']],
      },
    },
    system_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    organizer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    action_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    action_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    scope: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['all', 'event', 'organizer']],
      },
    },
    target_event_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    target_organizer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'scheduled', 'sending', 'sent', 'failed']],
      },
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_recipients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_sent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_delivered: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_failed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_opened: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    fcm_batch_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['sender_type'],
        name: 'idx_notifications_sender_type',
      },
      {
        fields: ['system_user_id'],
        name: 'idx_notifications_system_user',
      },
      {
        fields: ['organizer_id'],
        name: 'idx_notifications_organizer',
      },
      {
        fields: ['status'],
        name: 'idx_notifications_status',
      },
      {
        fields: ['scope'],
        name: 'idx_notifications_scope',
      },
      {
        fields: ['target_event_id'],
        name: 'idx_notifications_target_event',
      },
      {
        fields: ['target_organizer_id'],
        name: 'idx_notifications_target_organizer',
      },
      {
        fields: ['created_at'],
        name: 'idx_notifications_created',
      },
    ],
    validate: {
      senderMustMatch() {
        if (this.sender_type === 'system_user' && !this.system_user_id) {
          throw new Error('system_user_id is required when sender_type is system_user')
        }
        if (this.sender_type === 'organizer' && !this.organizer_id) {
          throw new Error('organizer_id is required when sender_type is organizer')
        }
      },
      scopeMustMatch() {
        if (this.scope === 'event' && !this.target_event_id) {
          throw new Error('target_event_id is required when scope is event')
        }
        if (this.scope === 'organizer' && !this.target_organizer_id) {
          throw new Error('target_organizer_id is required when scope is organizer')
        }
      },
    },
  }
)

export default Notification
