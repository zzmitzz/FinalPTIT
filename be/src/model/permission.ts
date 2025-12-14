import {DataTypes} from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface PermissionAttributes {
  _id: string
  code: string
  name: string
  description?: string
  resource: string
  action: string
  created_at?: Date
  updated_at?: Date
}

const Permission = sequelize.define(
  'permissions',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Unique permission code (e.g., EVENT:CREATE, USER:MANAGE)',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Display name of the permission',
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
      comment: 'Detailed description of what this permission allows',
    },
    resource: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Resource type (EVENT, USER, ORGANIZER, SESSION, etc.)',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Action type (CREATE, READ, UPDATE, DELETE, APPROVE, MANAGE)',
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
        fields: ['code'],
        name: 'permissions_code_unique',
      },
    ],
  }
)

export default Permission
