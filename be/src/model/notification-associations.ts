/**
 * Notification System Model Associations
 *
 * This file defines all relationships between notification entities:
 * - Registrations ↔ UserDevices (One-to-Many)
 * - Notifications ↔ NotificationRecipients (One-to-Many)
 * - Registrations ↔ NotificationRecipients (One-to-Many)
 * - UserDevices ↔ NotificationRecipients (One-to-Many)
 * - SystemUsers → Notifications (One-to-Many)
 * - Organizers → Notifications (One-to-Many)
 * - Events → Notifications (One-to-Many)
 */

import Registration from './registration.js'
import SystemUser from './system_user.js'
import Organizer from './organizer.js'
import Event from './event.js'
import UserDevice from './user_device.js'
import Notification from './notification.js'
import NotificationRecipient from './notification_recipient.js'
import RegistrationRegisterEvent from './registration_register_event.js'

// ==========================================
// Registration ↔ UserDevice (One-to-Many)
// ==========================================

Registration.hasMany(UserDevice, {
  foreignKey: 'registration_id',
  as: 'devices',
})

UserDevice.belongsTo(Registration, {
  foreignKey: 'registration_id',
  as: 'registration',
})

// ==========================================
// SystemUser → Notification (One-to-Many)
// ==========================================

SystemUser.hasMany(Notification, {
  foreignKey: 'system_user_id',
  as: 'sentNotifications',
})

Notification.belongsTo(SystemUser, {
  foreignKey: 'system_user_id',
  as: 'systemUser',
})

// ==========================================
// Organizer → Notification (One-to-Many)
// ==========================================

Organizer.hasMany(Notification, {
  foreignKey: 'organizer_id',
  as: 'sentNotifications',
})

Notification.belongsTo(Organizer, {
  foreignKey: 'organizer_id',
  as: 'organizer',
})

// ==========================================
// Event → Notification (One-to-Many for target)
// ==========================================

Event.hasMany(Notification, {
  foreignKey: 'target_event_id',
  as: 'notifications',
})

Notification.belongsTo(Event, {
  foreignKey: 'target_event_id',
  as: 'targetEvent',
})

// ==========================================
// Organizer → Notification (One-to-Many for target)
// ==========================================

Organizer.hasMany(Notification, {
  foreignKey: 'target_organizer_id',
  as: 'receivedNotifications',
})

Notification.belongsTo(Organizer, {
  foreignKey: 'target_organizer_id',
  as: 'targetOrganizer',
})

// ==========================================
// Notification ↔ NotificationRecipient (One-to-Many)
// ==========================================

Notification.hasMany(NotificationRecipient, {
  foreignKey: 'notification_id',
  as: 'recipients',
})

NotificationRecipient.belongsTo(Notification, {
  foreignKey: 'notification_id',
  as: 'notification',
})

// ==========================================
// Registration ↔ NotificationRecipient (One-to-Many)
// ==========================================

Registration.hasMany(NotificationRecipient, {
  foreignKey: 'registration_id',
  as: 'receivedNotifications',
})

NotificationRecipient.belongsTo(Registration, {
  foreignKey: 'registration_id',
  as: 'registration',
})

// ==========================================
// UserDevice ↔ NotificationRecipient (One-to-Many)
// ==========================================

UserDevice.hasMany(NotificationRecipient, {
  foreignKey: 'device_id',
  as: 'deliveries',
})

NotificationRecipient.belongsTo(UserDevice, {
  foreignKey: 'device_id',
  as: 'device',
})

// ==========================================
// Registration ↔ RegistrationRegisterEvent (One-to-Many)
// ==========================================

Registration.hasMany(RegistrationRegisterEvent, {
  foreignKey: 'registration_id',
  as: 'registeredEvents',
})

RegistrationRegisterEvent.belongsTo(Registration, {
  foreignKey: 'registration_id',
  as: 'registration',
})

console.log('✅ Notification system model associations loaded')
