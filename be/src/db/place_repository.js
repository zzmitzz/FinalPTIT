import Place from '@/model/place'

export async function createPlace(data) {
    const p = await Place.create(data)
    return p.toJSON ? p.toJSON() : p
}

export async function findPlacesByEventId(eventId) {
    return await Place.findAll({ where: { event_id: eventId }, order: [['name', 'ASC']] })
}

export async function findPlaceById(id) {
    return await Place.findByPk(id)
}

export async function deletePlaceById(id) {
    const p = await findPlaceById(id)
    if (!p) return null
    await p.destroy()
    return true
}
