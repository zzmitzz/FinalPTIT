import {DataTypes} from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface RolePermissionAttributes {
  _id: string
  role_id: string
  permission_id: string
  created_at?: Date
}

const RolePermission = sequelize.define(
  'role_permissions',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: '_id',
      },
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'permissions',
        key: '_id',
      },
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
        fields: ['role_id', 'permission_id'],
      },
    ],
  }
)

export default RolePermission
