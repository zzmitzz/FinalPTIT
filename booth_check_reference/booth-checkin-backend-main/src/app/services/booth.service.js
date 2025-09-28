import {Booth} from '@/models'
import moment from 'moment'

export async function getList() {
    const result = await Booth.find()
        .populate({
            path: 'event',
            select: 'name'
        })
        .sort({created_at: -1})
        .lean()
    return result
}

export async function create(session, {name, mac}) {
    const booth = new Booth({name, mac})
    await booth.save({session})
    return booth
}

export async function update(session, booth, {name, mac}) {
    booth.name = name
    booth.mac = mac
    await booth.save({session})
    return booth
}

export async function pingBooth(session, booth) {
    booth.last_time = moment().toDate()
    await booth.save({session})
    return booth
}

export async function remove(session, boothId) {
    await Booth.deleteOne({_id: boothId}).session(session)
}

export async function assignBoothToEvent(session, event, boothIds) {
    let boothsEvent = await Booth.find({event_id: event._id}).select('_id').session(session)
    boothsEvent = boothsEvent.map(({_id}) => _id)

    const newBooths = boothIds.filter((id) => !boothsEvent.some((boothId) => boothId.equals(id)))
    const deletedBooths = boothsEvent.filter((boothId) => !boothIds.some((id) => boothId.equals(id)))

    if (deletedBooths.length > 0) {
        await Booth.updateMany({_id: {$in: deletedBooths}}, {$set: {event_id: null}}, {session})
    }
    if (newBooths.length > 0) {
        await Booth.updateMany({_id: {$in: newBooths}}, {$set: {event_id: event._id}}, {session})
    }

    return [newBooths, deletedBooths]
}

export async function updateSettingBooth(session, booth, {check_in_type, use_print_card, allow_check_in}) {
    booth.setting.check_in_type = check_in_type
    booth.setting.use_print_card = use_print_card
    booth.setting.allow_check_in = allow_check_in

    await booth.save({session})
    return booth.setting
}

export async function updateSettingMultiBooth(session, boothIds, setting) {
    await Booth.updateMany({_id: {$in: boothIds}}, {$set: {setting}}, {session})
}

export async function getListBoothOrganizer(organizer) {
    const result = await Booth.aggregate()
        .lookup({
            from: 'events',
            localField: 'event_id',
            foreignField: '_id',
            as: 'event',
        })
        .unwind('$event')
        .match({
            'event.organizer_id': organizer._id,
        })
        .sort({
            created_at: -1,
            _id: -1,
        })
        .project({
            _id: 1,
            name: 1,
            mac: 1,
            last_time: 1,
            setting: 1,
            event: {
                _id: 1,
                name: 1,
                organizer_id: 1,
                check_in_type: 1,
                use_print_card: 1,
            },
        })

    return result
}
