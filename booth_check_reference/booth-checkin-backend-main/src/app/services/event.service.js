import {FORM_FIELD_TEMPLATE, LINK_STATIC_URL} from '@/configs'
import {
    EVENT_CHECK_IN_TYPE,
    EVENT_STATUS,
    Event,
    FIELD_TYPE,
    Form,
    FormField,
    EVENT_STATE,
    Organizer,
    Booth,
    EVENT_MINI_GAME,
    LUCKY_WHEEL_CONDITIONS,
    Prize,
    MiniGameSetting,
    CheckInHistory
} from '@/models'
import {FileUpload} from '@/utils/classes'
import _ from 'lodash'
import moment from 'moment'

export const handleStatusEvent = (event) => {
    const now = moment()
    if (event.is_locked) {
        event.state = EVENT_STATE.LOCKED
    } else if (event.status === EVENT_STATUS.PENDING) {
        event.state = EVENT_STATUS.PENDING
    } else if (event.status === EVENT_STATUS.CANCELLED) {
        event.state = EVENT_STATUS.CANCELLED
    } else if (event.status === EVENT_STATUS.APPROVED) {
        if (now.isBefore(event.start_time)) {
            event.state = EVENT_STATE.NOT_STARTED_YET
        } else if (now.isAfter(event.end_time)) {
            event.state = EVENT_STATE.ENDED
        } else {
            event.state = EVENT_STATE.ON_GOING
        }
    }

    return event.state
}

export async function readEventsOfOrganizer(
    organizer,
    {q, page, per_page, field, sort_order, state, start_time, end_time}
) {
    q = q ? {$regex: q, $options: 'i'} : null
    const filter = {
        $and: [
            {deleted: false},
            {organizer_id: organizer._id},
            ...(q
                ? [
                    {
                        $or: [{name: q}, {location: q}, {organizing_unit: q}, {co_organizing_unit: q}],
                    },
                ]
                : []),
            ...(start_time || end_time
                ? [
                    {
                        $or: [
                            {
                                start_time: {
                                    ...(start_time && {$gte: start_time}),
                                    ...(end_time && {$lte: end_time}),
                                },
                            },
                            {
                                end_time: {
                                    ...(start_time && {$gte: start_time}),
                                    ...(end_time && {$lte: end_time}),
                                },
                            },
                        ],
                    },
                ]
                : []),
        ],
    }

    switch (state) {
        case EVENT_STATE.PENDING:
            filter.status = EVENT_STATUS.PENDING
            break
        case EVENT_STATE.NOT_STARTED_YET:
            filter.status = EVENT_STATUS.APPROVED
            filter.start_time = {$gte: moment().toDate()}
            break
        case EVENT_STATE.ON_GOING:
            filter.status = EVENT_STATUS.APPROVED
            filter.start_time = {$lte: moment().toDate()}
            filter.end_time = {$gte: moment().toDate()}
            break
        case EVENT_STATE.ENDED:
            filter.status = EVENT_STATUS.APPROVED
            filter.end_time = {$lte: moment().toDate()}
            break
        case EVENT_STATE.LOCKED:
            filter.is_locked = true
            break
        case EVENT_STATE.CANCELLED:
            filter.status = EVENT_STATUS.CANCELLED
            filter.is_locked = false
            break
        default:
            break
    }

    const items = await Event.find(filter, {deleted: 0, organizer_id: 0, pin_code: 0})
        .skip((page - 1) * per_page)
        .limit(per_page)
        .sort({[field]: sort_order, _id: -1})
        .lean({defaults: true})
    items.forEach(function (item) {
        item.thumbnail = item.thumbnail && LINK_STATIC_URL + item.thumbnail
        item.logo = _.isArray(item.logo) ? item.logo.map((img) => LINK_STATIC_URL + img) : []
        item.state = handleStatusEvent(item)
    })
    const total = await Event.countDocuments(filter)
    return {total, page, per_page, items}
}

async function generateAppPIN(session, length = 6) {
    const checkIfExists = async (code) => {
        const doc = await Event.findOne({pin_code: code}, {_id: 1}, {session})
        return !!doc
    }
    const generateRandomCode = () => {
        const chars = '0123456789'
        let str = ''
        for (let i = 0; i < length; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return str
    }

    for (let i = 0; i < 100; i++) {
        const result = generateRandomCode()
        const exists = await checkIfExists(result)
        if (!exists) {
            return result
        }
    }
    return generateAppPIN(session, length + 1)
}

export async function createEvent(session, organizer, {thumbnail, logo, mini_game, ...requestBody}) {
    thumbnail.save()

    logo = logo.filter((img) => img instanceof FileUpload).map((img) => img.save())

    const event = new Event({
        organizer_id: organizer._id,
        pin_code: await generateAppPIN(session),
        thumbnail,
        logo,
        mini_game,
        ...requestBody,
    })
    await Promise.all([
        event.save({session}),
        MiniGameSetting.insertMany(
            [
                {
                    event_id: event._id,
                    mini_game: EVENT_MINI_GAME.LUCKY_WHEEL,
                    conditions: mini_game?.includes(EVENT_MINI_GAME.LUCKY_WHEEL)
                        ? LUCKY_WHEEL_CONDITIONS.ALL_CHECK_INS
                        : null,
                },
            ],
            {session}
        ),
    ])
}

export async function updateEvent(session, event, requestBody) {
    if (requestBody.thumbnail) {
        FileUpload.remove(event.thumbnail)
        requestBody.thumbnail = requestBody.thumbnail.save()
    }
    if (_.isString(event.logo) && !_.isEmpty(event.logo)) {
        FileUpload.remove(event.logo)
        event.logo = []
    }
    if (!_.isEmpty(requestBody.logo)) {
        const logosToDelete = event.logo.filter((logo) => !requestBody.logo.includes(logo))
        for (const logo of logosToDelete) {
            FileUpload.remove(logo)
        }

        event.logo = event.logo.filter((img) => !logosToDelete.includes(img))
        requestBody.logo = requestBody.logo
            .filter((img) => img instanceof FileUpload || event.logo.includes(img))
            .map((img) => (img instanceof FileUpload ? img.save() : img))
    }

    requestBody.status = EVENT_STATUS.PENDING
    await Event.findByIdAndUpdate(event._id, {$set: requestBody}, {session})
    if (requestBody.mini_game.includes(EVENT_MINI_GAME.LUCKY_WHEEL)) {
        await MiniGameSetting.updateOne(
            {event_id: event._id, mini_game: EVENT_MINI_GAME.LUCKY_WHEEL, conditions: null},
            {$set: {conditions: LUCKY_WHEEL_CONDITIONS.ALL_CHECK_INS}},
            {session}
        )
    }
    const eventForm = await Form.findOne({event_id: event._id}).session(session)
    if (eventForm) {
        const {check_in_type} = requestBody
        if (check_in_type.includes(EVENT_CHECK_IN_TYPE.FACE_ID)) {
            const faceIdField = await FormField.findOne({
                form_id: eventForm._id,
                field_type: FIELD_TYPE.FACE_ID,
            }).session(session)
            if (!faceIdField) {
                await FormField.updateMany(
                    {form_id: eventForm._id, position: {$gte: 2}},
                    {$inc: {position: 1}},
                    {session}
                )
                await FormField.findOneAndUpdate(
                    {form_id: eventForm._id, position: 2},
                    {$set: FORM_FIELD_TEMPLATE.FACE_ID},
                    {upsert: true, session}
                )
            }
        } else {
            await FormField.deleteMany({form_id: eventForm._id, field_type: FIELD_TYPE.FACE_ID}, {session})
        }
    }
}

export async function deleteEvent(session, event) {
    event.deleted = true
    await event.save({session})
}

export async function readEvent(event, hidePin = true) {
    event = await Event.findById(event._id)
        .select({
            ...(hidePin && {pin_code: 0}),
        })
        .lean()
    event.organizer = await Organizer.findById(event.organizer_id).select('name deleted').lean()
    event.state = handleStatusEvent(event)
    event.thumbnail = event.thumbnail && LINK_STATIC_URL + event.thumbnail
    event.logo = _.isArray(event.logo) ? event.logo.map((img) => LINK_STATIC_URL + img) : []
    event.form = await Form.findOne({event_id: event._id})
        .populate({
            path: 'fields',
            select: '-created_at -updated_at',
            options: {sort: {position: 1}},
        })
        .lean()

    return event
}

export async function readEventForBooth(event, session = null) {
    const result = await Event.findOne({_id: event._id})
        .select({
            organizer_id: 0,
            pin_code: 0,
            approver_id: 0,
            approved_at: 0,
            deleted: 0,
        })
        .populate('mini_game_settings')
        .session(session)
        .lean({defaults: true})

    result.state = handleStatusEvent(result)
    result.thumbnail = result.thumbnail && LINK_STATIC_URL + result.thumbnail
    result.logo = _.isArray(result.logo) ? result.logo.map((img) => LINK_STATIC_URL + img) : []

    const settings = result.mini_game_settings
    result.mini_game_settings = {}
    result.prizes = {}
    for (const miniGame of result.mini_game) {
        result.mini_game_settings[miniGame] = settings.find(({mini_game}) => mini_game === miniGame) ?? {
            conditions: null,
        }
        result.prizes[miniGame] = await Prize.find({event_id: event._id, mini_game: miniGame})
            .sort({position: 1, created_at: -1, _id: -1})
            .select('-rate -quantity -distributed_count')
            .session(session)

        result.prizes[miniGame].forEach(function (item) {
            item.picture = item.picture && LINK_STATIC_URL + item.picture
        })
    }

    return result
}
export async function getList({
    q,
    start_time,
    end_time,
    state,
    page = 1,
    per_page = 20,
    field = 'created_at',
    sort_order,
}) {
    const query = q ? {$regex: q, $options: 'i'} : null

    const filter = {
        $and: [
            {deleted: false},
            ...(query
                ? [
                    {
                        $or: [{name: query}, {location: query}, {'organizer.name': query}],
                    },
                ]
                : []),
            ...(start_time || end_time
                ? [
                    {
                        $or: [
                            {
                                start_time: {
                                    ...(start_time && {$gte: start_time}),
                                    ...(end_time && {$lte: end_time}),
                                },
                            },
                            {
                                end_time: {
                                    ...(start_time && {$gte: start_time}),
                                    ...(end_time && {$lte: end_time}),
                                },
                            },
                        ],
                    },
                ]
                : []),
        ],
    }

    switch (state) {
        case EVENT_STATE.PENDING:
            filter.status = EVENT_STATUS.PENDING
            break
        case EVENT_STATE.NOT_STARTED_YET:
            filter.status = EVENT_STATUS.APPROVED
            filter.start_time = {$gte: moment().toDate()}
            break
        case EVENT_STATE.ON_GOING:
            filter.status = EVENT_STATUS.APPROVED
            filter.start_time = {$lte: moment().toDate()}
            filter.end_time = {$gte: moment().toDate()}
            break
        case EVENT_STATE.ENDED:
            filter.status = EVENT_STATUS.APPROVED
            filter.end_time = {$lte: moment().toDate()}
            break
        case EVENT_STATE.LOCKED:
            filter.is_locked = true
            break
        case EVENT_STATE.CANCELLED:
            filter.status = EVENT_STATUS.CANCELLED
            filter.is_locked = false
            break
        default:
            break
    }

    let sortEvent = {
        [field]: sort_order === 'desc' ? -1 : 1,
    }

    if (field === 'organizer') {
        sortEvent = {
            'organizer.name': sort_order === 'desc' ? -1 : 1,
        }
    }

    const queryDB = Event.aggregate()
        .match({deleted: false})
        .lookup({
            from: 'organizers',
            localField: 'organizer_id',
            foreignField: '_id',
            as: 'organizer',
        })
        .unwind({
            path: '$organizer',
            preserveNullAndEmptyArrays: true,
        })
        .addFields({
            organizer: {
                _id: '$organizer._id',
                name: '$organizer.name',
                deleted: '$organizer.deleted',
            },
        })
        .match(filter)
        .facet({
            total: [{$count: 'count'}],
            data: [
                {$sort: sortEvent},
                {$skip: (page - 1) * per_page},
                {$limit: per_page},
                {
                    $project: {
                        deleted: 0,
                        pin_code: 0,
                        approver_id: 0,
                        approved_at: 0,
                    },
                },
                {
                    $lookup: {
                        from: 'booths',
                        localField: '_id',
                        foreignField: 'event_id',
                        as: 'booth_ids',
                    },
                },
                {
                    $addFields: {
                        booth_ids: {
                            $map: {
                                input: '$booth_ids',
                                as: 'item',
                                in: '$$item._id',
                            },
                        },
                    },
                },
            ],
        })
    const [result] = await queryDB.exec()
    const total = _.get(result, 'total[0].count', 0)
    const events = _.get(result, 'data', [])

    events.forEach(function (event) {
        event.thumbnail = event.thumbnail && LINK_STATIC_URL + event.thumbnail
        event.logo = _.isArray(event.logo) ? event.logo.map((img) => LINK_STATIC_URL + img) : []
        event.state = handleStatusEvent(event)
    })

    return {total, page, per_page, events}
}

export async function approvalEvent(session, currentAdmin, event) {
    event.status = EVENT_STATUS.APPROVED
    event.approver_id = currentAdmin._id
    event.approved_at = new Date()
    await event.save({session})
}

export async function cancelEvent(session, currentAdmin, event) {
    event.status = EVENT_STATUS.CANCELLED
    event.approver_id = currentAdmin._id
    event.approved_at = new Date()
    await event.save({session})
}

export async function lockEvent(session, event, action) {
    event.is_locked = action === 'LOCKED'
    await event.save({session})
}

export function handleCheckAction(event, action) {
    switch (action) {
        case 'cancel':
            return (
                event.status === EVENT_STATUS.PENDING ||
                (event.status === EVENT_STATUS.APPROVED && moment().isBefore(event.start_time))
            )

        case 'approval':
            return (
                moment().isBefore(event.start_time) &&
                [EVENT_STATUS.PENDING, EVENT_STATUS.CANCELLED].includes(event.status)
            )

        case 'locked':
            return !(moment().isAfter(event.end_time) && event.status === EVENT_STATUS.APPROVED)

        case 'assign':
            return (
                !event.is_locked &&
                moment().isSameOrBefore(event.end_time) &&
                event.status === EVENT_STATUS.APPROVED
            )

        default:
            return false
    }
}

export async function getEventsCanAssign() {
    const events = await Event.find({
        deleted: false,
        is_locked: false,
        status: EVENT_STATUS.APPROVED,
        end_time: {$gte: moment().toDate()},
    })
        .sort({created_at: -1, _id: -1})
        .select('name organizer_id')
        .populate({path: 'organizer', select: 'name phone'})
        .lean()
    return events
}

export async function getBoothIdsAssignedToEvent(event) {
    const booths = await Booth.find({event_id: event._id}).select('_id')
    return booths.map(({_id}) => _id)
}

export async function getEventStatistics(event) {
    const checkInHistories = await CheckInHistory.aggregate([
        {$match: {event_id: event._id}},
        {$sort: {check_in_at: -1}},
        {
            $group: {
                _id: '$registration_id',
                check_in_at: {$first: '$check_in_at'},
                check_in_by: {$first: '$check_in_by'},
                booth_mac: {$first: '$booth_mac'},
                check_in_count: {$sum: 1},
            },
        },
        {
            $lookup: {
                from: 'registration_responses',
                localField: '_id',
                foreignField: 'registration_id',
                as: 'responses',
            },
        },
        {
            $lookup: {
                from: 'booths',
                localField: 'booth_mac',
                foreignField: 'mac',
                as: 'booth',
            },
        },
        {
            $unwind: {
                path: '$booth',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 0,
                check_in_at: '$check_in_at',
                check_in_by: '$check_in_by',
                booth_name: {$ifNull: ['$booth.name', 'N/A']},
                check_in_count: '$check_in_count',
                responses: '$responses',
            },
        },
    ])

    const result = checkInHistories.map((history) => {
        const registrationData = {
            check_in_at: history.check_in_at,
            check_in_by: history.check_in_by,
            check_in_count: history.check_in_count,
            booth_name: history.booth_name,
        }

        history.responses.forEach((response) => {
            const label = response.field_label.toLowerCase()
            const type = response.field_type

            if (type === 'TEXT' && (label === 'họ và tên' || label === 'full name')) {
                registrationData.name = response.response
            } else if (type === 'PHONE' && (label === 'số điện thoại' || label === 'phone number')) {
                registrationData.phone = response.response
            } else if (type === 'EMAIL' && label === 'email') {
                registrationData.email = response.response
            } else if (type === 'TEXT' && (label === 'chức vụ' || label === 'position')) {
                registrationData.position = response.response
            } else if (type === 'TEXT' && (label === 'đơn vị công tác' || label === 'affiliation')) {
                registrationData.affiliation = response.response
            } else if (type === 'FACE_ID' && (label === 'ảnh chân dung' || label === 'avatar' || label === 'ảnh cá nhân')) {
                registrationData.avatar = response.response ? LINK_STATIC_URL + response.response : null
            }
        })

        return registrationData
    })

    return result
}
