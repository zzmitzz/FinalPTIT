import {DataTypes} from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface RoleAttributes {
  _id: string
  name: string
  code: string
  description?: string
  is_system_role: boolean
  scope: 'GLOBAL' | 'ORGANIZER'
  created_at?: Date
  updated_at?: Date
}

const Role = sequelize.define(
  'roles',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Display name of the role',
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Unique code identifier (e.g., SUPER_ADMIN, ORG_OWNER)',
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
      comment: 'Description of what this role can do',
    },
    is_system_role: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'System roles cannot be deleted or modified',
    },
    scope: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'ORGANIZER',
      comment: 'GLOBAL: access all organizers, ORGANIZER: scoped to specific organizer',
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
        fields: ['name'],
        name: 'roles_name_unique',
      },
      {
        unique: true,
        fields: ['code'],
        name: 'roles_code_unique',
      },
    ],
  }
)

export default Role
