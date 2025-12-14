import {DataTypes} from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface SystemUserRoleAttributes {
  _id: string
  system_user_id: string
  role_id: string
  organizer_id?: string
  assigned_by?: string
  created_at?: Date
}

const SystemUserRole = sequelize.define(
  'system_user_roles',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    system_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'system_users',
        key: '_id',
      },
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: '_id',
      },
    },
    organizer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizers',
        key: '_id',
      },
      comment: 'NULL for global roles (SUPER_ADMIN), UUID for organizer-scoped roles',
    },
    assigned_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'system_users',
        key: '_id',
      },
      comment: 'System user who assigned this role',
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['system_user_id', 'role_id', 'organizer_id'],
        name: 'unique_system_user_role_organizer',
      },
    ],
  }
)

export default SystemUserRole
