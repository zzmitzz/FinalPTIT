import {DataTypes} from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

export interface PermissionTypeAttributes {
  _id: string
  name: string
  code: string
  position: number
  created_at?: Date
  updated_at?: Date
}

const PermissionType = sequelize.define(
  'permission_types',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

export default PermissionType
