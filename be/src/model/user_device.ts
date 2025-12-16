import {DataTypes} from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface UserDeviceData {
  _id: string
  registration_id: string
  fcm_token: string
  device_type: 'ios' | 'android' | 'web'
  device_id?: string
  device_name?: string
  app_version?: string
  os_version?: string
  is_active: boolean
  notifications_enabled: boolean
  last_used_at?: Date
  token_expires_at?: Date
  created_at: Date
  updated_at: Date
}

const UserDevice = sequelize.define(
  'user_devices',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    registration_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    fcm_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    device_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['ios', 'android', 'web']],
      },
    },
    device_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    device_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    app_version: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    os_version: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notifications_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    token_expires_at: {
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
        fields: ['fcm_token'],
        name: 'user_devices_fcm_token_unique',
      },
      {
        unique: true,
        fields: ['registration_id', 'device_id'],
        name: 'user_devices_registration_device_unique',
      },
      {
        fields: ['registration_id'],
        name: 'idx_user_devices_registration',
      },
      {
        fields: ['is_active'],
        name: 'idx_user_devices_active',
        where: {is_active: true},
      },
      {
        fields: ['last_used_at'],
        name: 'idx_user_devices_last_used',
      },
    ],
  }
)

export default UserDevice
