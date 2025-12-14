/**
 * RBAC Model Associations
 *
 * This file defines all relationships between RBAC entities:
 * - SystemUsers ↔ Roles (Many-to-Many via SystemUserRole junction table)
 * - Roles ↔ Permissions (Many-to-Many via RolePermission junction table)
 * - SystemUsers → Organizers (Many-to-One)
 * - SystemUserRoles → Organizers (Many-to-One for scoping)
 */

import SystemUser from './system_user.js'
import Role from './role.js'
import Permission from './permission.js'
import Organizer from './organizer.js'
import SystemUserRole from './system_user_role.js'
import RolePermission from './role_permission.js'

// ==========================================
// SystemUser ↔ Role (Many-to-Many)
// ==========================================

SystemUser.belongsToMany(Role, {
  through: SystemUserRole,
  foreignKey: 'system_user_id',
  otherKey: 'role_id',
  as: 'roles',
})

Role.belongsToMany(SystemUser, {
  through: SystemUserRole,
  foreignKey: 'role_id',
  otherKey: 'system_user_id',
  as: 'systemUsers',
})

// Direct associations for junction table
SystemUser.hasMany(SystemUserRole, {
  foreignKey: 'system_user_id',
  as: 'systemUserRoles',
})

SystemUserRole.belongsTo(SystemUser, {
  foreignKey: 'system_user_id',
  as: 'systemUser',
})

Role.hasMany(SystemUserRole, {
  foreignKey: 'role_id',
  as: 'systemUserRoles',
})

SystemUserRole.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
})

// ==========================================
// Role ↔ Permission (Many-to-Many)
// ==========================================

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
})

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
})

// Direct associations for junction table
Role.hasMany(RolePermission, {
  foreignKey: 'role_id',
  as: 'rolePermissions',
})

RolePermission.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role',
})

Permission.hasMany(RolePermission, {
  foreignKey: 'permission_id',
  as: 'rolePermissions',
})

RolePermission.belongsTo(Permission, {
  foreignKey: 'permission_id',
  as: 'permission',
})

// ==========================================
// SystemUser → Organizer (Many-to-One)
// ==========================================

SystemUser.belongsTo(Organizer, {
  foreignKey: 'organizer_id',
  as: 'organizer',
})

Organizer.hasMany(SystemUser, {
  foreignKey: 'organizer_id',
  as: 'systemUsers',
})

// ==========================================
// SystemUserRole → Organizer (For scoping)
// ==========================================

SystemUserRole.belongsTo(Organizer, {
  foreignKey: 'organizer_id',
  as: 'organizer',
})

Organizer.hasMany(SystemUserRole, {
  foreignKey: 'organizer_id',
  as: 'systemUserRoles',
})

// ==========================================
// SystemUserRole → SystemUser (Who assigned)
// ==========================================

SystemUserRole.belongsTo(SystemUser, {
  foreignKey: 'assigned_by',
  as: 'assignedByUser',
})

export {SystemUser, Role, Permission, Organizer, SystemUserRole, RolePermission}
