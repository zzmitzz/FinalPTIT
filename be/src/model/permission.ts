const { DataTypes } = require('sequelize')
const sequelize = require('../configs/postgre_sql.js')
const PermissionType = require('./permission_type')

interface PermissionAttributes {
    _id: string
    code: string
    description?: string
    permission_group_code?: string
    permission_type_code: string
    createdAt?: Date
    updatedAt?: Date
}

const Permission = sequelize.define('permissions', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    permission_group_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    permission_type_code: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'permission_types',
            key: 'code'
        }
    }
}, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

// Association: Each Permission belongs to one PermissionType
Permission.belongsTo(PermissionType, {
    foreignKey: 'permission_type_code',
    targetKey: 'code',
    as: 'permissionType'
})

// Enables eager loading and nested queries
PermissionType.hasMany(Permission, {
    foreignKey: 'permission_type_code',
    sourceKey: 'code',
    as: 'permissions'
})

module.exports = Permission
