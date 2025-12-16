import {DataTypes} from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface NotificationRecipientData {
  _id: string
  notification_id: string
  registration_id: string
  device_id?: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened'
  fcm_message_id?: string
  error_message?: string
  error_code?: string
  sent_at?: Date
  delivered_at?: Date
  opened_at?: Date
  failed_at?: Date
  created_at: Date
  updated_at: Date
}

const NotificationRecipient = sequelize.define(
  'notification_recipients',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    notification_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    registration_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    device_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'sent', 'delivered', 'failed', 'opened']],
      },
    },
    fcm_message_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    error_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    opened_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failed_at: {
      type: DataTypes.DATE,
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
        unique: true,
        fields: ['notification_id', 'registration_id', 'device_id'],
        name: 'notif_recipients_notification_registration_device_unique',
      },
      {
        fields: ['notification_id'],
        name: 'idx_notif_recipients_notification',
      },
      {
        fields: ['registration_id'],
        name: 'idx_notif_recipients_registration',
      },
      {
        fields: ['device_id'],
        name: 'idx_notif_recipients_device',
      },
      {
        fields: ['status'],
        name: 'idx_notif_recipients_status',
      },
      {
        fields: ['fcm_message_id'],
        name: 'idx_notif_recipients_fcm_message',
      },
    ],
  }
)

export default NotificationRecipient
