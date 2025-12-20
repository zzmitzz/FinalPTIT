import {DataTypes} from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface SystemUserAttributes {
  _id: string
  name: string
  email: string
  phone: string
  password: string
  avatar_url?: string
  is_active: boolean
  organizer_id?: string
  created_at?: Date
  updated_at?: Date
}

const SystemUser = sequelize.define(
  'system_users',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'bcrypt hashed',
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the system user account is active',
    },
    organizer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizers',
        key: '_id',
      },
      comment: 'NULL for global admins, UUID for organizer staff',
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['email'],
        name: 'system_users_email_unique',
      },
    ],
  }
)

export default SystemUser
