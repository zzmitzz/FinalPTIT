import {DataTypes} from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface AdminRoleAttributes {
  _id: string
  admin_id: string
  role_id: string
  created_at?: Date
}

const AdminRole = sequelize.define(
  'admin_roles',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'admins',
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
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['admin_id', 'role_id'],
      },
    ],
  }
)

export default AdminRole
