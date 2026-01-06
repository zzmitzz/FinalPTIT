import Event from './event.js'
import Organizer from './organizer.js'
import OrganizerDetails from './organizer_details.js'

Event.belongsTo(Organizer, {
    foreignKey: 'organizer_id',
    targetKey: '_id',
    as: 'organizer'
})

Organizer.hasMany(Event, {
    foreignKey: 'organizer_id',
    sourceKey: '_id',
    as: 'events'
})
