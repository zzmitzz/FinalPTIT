import Event from './event.js'
import OrganizerDetails from './organizer_details.js'

Event.belongsTo(OrganizerDetails, {
    foreignKey: 'organizer_id',
    targetKey: 'organizer_id',
    as: 'organizer_detail'
})

OrganizerDetails.hasMany(Event, {
    foreignKey: 'organizer_id',
    sourceKey: 'organizer_id',
    as: 'events'
})
