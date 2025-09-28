import {APP_URL_API, LINK_STATIC_URL} from '@/configs'
import Logger from '@/configs/logger'
import {CheckInHistory, FIELD_TYPE, Registration, RegistrationPrize, RegistrationResponse} from '@/models'
import _ from 'lodash'
import moment from 'moment'

export async function readRegistrationsOfEvent(event, {q, page, per_page, field, sort_order}) {
    const query = Registration.aggregate()
        .match({event_id: event._id})
        .lookup({
            from: 'registration_responses',
            localField: '_id',
            foreignField: 'registration_id',
            as: 'response',
        })
        .project({
            event_id: 0,
            updated_at: 0,
            'response.event_id': 0,
            'response.form_id': 0,
            'response.registration_id': 0,
            'response.created_at': 0,
            'response.updated_at': 0,
        })
        .addFields({
            response: {
                $sortArray: {
                    input: '$response',
                    sortBy: {position: 1},
                },
            },
        })
    if (q) {
        query.match({
            $or: [
                {'response.0.response': {$regex: q, $options: 'i'}},
                {'response.1.response': {$regex: q, $options: 'i'}},
            ],
        })
    }
    query
        .sort({
            [field]: sort_order,
            _id: -1,
        })
        .facet({
            total: [{$count: 'count'}],
            total_checked_in: [{$match: {check_in_at: {$exists: true, $ne: null}}}, {$count: 'count'}],
            items: [{$skip: (page - 1) * per_page}, {$limit: per_page}],
        })
    const [result] = await query.exec()
    const total = _.get(result, 'total[0].count', 0)
    const total_checked_in = _.get(result, 'total_checked_in[0].count', 0)
    let prizes = await RegistrationPrize.find({
        registration_id: {$in: result.items.map(({_id}) => _id)},
    })
        .populate({path:'prize', select:'name picture mini_game'})
        .lean()
    prizes = prizes.map(({registration_id, prize}) => ({
        registration_id,
        ...prize,
    }))
    const items = result.items.map(function (item) {
        item.response.forEach(function (field) {
            if (field.field_type === FIELD_TYPE.FILE || field.field_type === FIELD_TYPE.FACE_ID) {
                field.response = field.response && LINK_STATIC_URL + field.response
            }
        })
        item.qr_img = APP_URL_API + `/registration/${item._id}/generate-qr`
        item.prizes = prizes.filter(({registration_id}) => item._id.equals(registration_id))
        return item
    })

    return {event_name: event.name, total_checked_in, total, page, per_page, items}
}

export async function registerToJoinTheEvent(session, registration, fields) {
    await registration.save({session})
    await RegistrationResponse.insertMany(fields, {session})
    const regCount = Registration.countDocuments({event_id: registration.event_id}).session(session)
    const regResponse = RegistrationResponse.find({
        registration_id: registration._id,
        $or: [{position: {$lte: 1}}, {field_type: FIELD_TYPE.FACE_ID}],
    })
        .sort({position: 1})
        .select({
            event_id: 0,
            form_id: 0,
            registration_id: 0,
            created_at: 0,
            updated_at: 0,
        })
        .session(session)
        .lean()
    const [total, response] = await Promise.all([regCount, regResponse])

    return {
        total,
        registration: {
            _id: registration._id,
            response: response.map(function (item) {
                if (item.field_type === FIELD_TYPE.FACE_ID) {
                    item.response = item.response && LINK_STATIC_URL + item.response
                }
                return item
            }),
        },
    }
}

export async function multipleCheckIn(session, booth, members, event, {check_in_by}) {
    const now = moment().toDate()
    const checkInHistories = []
    const memberUpdates = []
    for (const member of members) {
        if(member.status === 200){
            const registration = member.registration
            if (!registration.check_in_at) {
                registration.check_in_at = now
                registration.check_in_by = check_in_by
                memberUpdates.push(registration.save({session}))
            }
            checkInHistories.push({
                registration_id: registration._id,
                event_id: registration.event_id,
                booth_mac: booth.mac,
                check_in_at: now,
                check_in_by,
            })
        }
        else{
            const registration = null
        }
        
    }
    await Promise.all(memberUpdates)
    await CheckInHistory.insertMany(checkInHistories, {session})


    const regCount = Registration.countDocuments({
        event_id: event._id,
        check_in_at: {$ne: null},
    }).session(session)

    // Find the reg response, aim to get the data registration
    const regResponses = await Promise.all(
        members
            .filter(member => member.status === 200)
            .map(async member => {
                const responses = await RegistrationResponse.find({
                    registration_id: member.registration._id,
                    $or: [{position: {$lte: 1}}, {field_type: FIELD_TYPE.FACE_ID}],
                })
                    .sort({position: 1})
                    .select({})
                    .session(session)
                    .lean()
                return {
                    registration_id: member.registration._id,
                    responses: responses
                }
            })
    )

    const checkInCounts = await Promise.all(
        members
            .filter(member => member.status === 200)
            .map(async member => {
                const count = await CheckInHistory.countDocuments({
                    registration_id: member.registration._id
                }).session(session)
                return {
                    registration_id: member.registration._id,
                    count: count
                }
            })
    )

    const [total_checked_in, responses] = await Promise.all([regCount, regResponses])
    const updatedMembers = members.map(member => {
        if (member.status === 200) {
            const memberResponses = responses.find(response => response.registration_id.equals(member.registration._id))
            const memberCheckInCount = checkInCounts.find(count => count.registration_id.equals(member.registration._id))
            return {
                _id: member.registration._id,
                check_in_at: member.registration.check_in_at,
                check_in_by: member.registration.check_in_by,
                response: memberResponses?.responses.map(item => {
                    if (item.field_type === FIELD_TYPE.FACE_ID) {
                        item.response = item.response && LINK_STATIC_URL + item.response
                    }
                    return item
                }) || [],
                check_in_count: memberCheckInCount?.count || 0,
                index: member.index,
                status: member.status,
                is_vip: member.registration.is_vip
            }
        } else {
            return {
                index: member.index,
                status: member.status,
                msg: member.msg
            }
        }
    })
    updatedMembers.sort((a, b) => a.index - b.index)
    return {
        total_checked_in,
        members: updatedMembers,
    }
}

export async function checkIn(session, booth, member, {check_in_by}) {
    const now = moment().toDate()
    if (!member.check_in_at) {
        member.check_in_at = now
        member.check_in_by = check_in_by
        await member.save({session})
    }
    await CheckInHistory.insertMany(
        {
            registration_id: member._id,
            event_id: member.event_id,
            booth_mac: booth.mac,
            check_in_at: now,
            check_in_by,
        },
        {session}
    )
    const regCount = Registration.countDocuments({
        event_id: member.event_id,
        check_in_at: {$ne: null},
    }).session(session)
    const regResponse = RegistrationResponse.find({
        registration_id: member._id,
        $or: [{position: {$lte: 1}}, {field_type: FIELD_TYPE.FACE_ID}],
    })
        .sort({position: 1})
        .select({
            event_id: 0,
            form_id: 0,
            registration_id: 0,
            created_at: 0,
            updated_at: 0,
        })
        .session(session)
        .lean()
    const checkInCount = CheckInHistory.countDocuments({registration_id: member._id}).session(session)
    const [total_checked_in, response, check_in_count] = await Promise.all([regCount, regResponse, checkInCount])
    return {
        total_checked_in,
        member: {
            _id: member._id,
            check_in_at: now,
            check_in_by: member.check_in_by,
            response: response.map(function (item) {
                if (item.field_type === FIELD_TYPE.FACE_ID) {
                    item.response = item.response && LINK_STATIC_URL + item.response
                }
                return item
            }),
            check_in_count,
        },
    }
}

export async function readRegistrationsCheckInOfEvent(event, booth) {
    const registrationCheckedInIds = await CheckInHistory.find({
        event_id: event._id,
        booth_mac: booth.mac,
    }).distinct('registration_id')
    const query = Registration.aggregate()
        .match({event_id: event._id})
        .lookup({
            from: 'registration_responses',
            localField: '_id',
            foreignField: 'registration_id',
            as: 'response',
        })
        .project({
            event_id: 0,
            updated_at: 0,
            'response.event_id': 0,
            'response.form_id': 0,
            'response.registration_id': 0,
            'response.created_at': 0,
            'response.updated_at': 0,
        })
        .addFields({
            response: {
                $sortArray: {
                    input: '$response',
                    sortBy: {position: 1},
                },
            },
        })
    query
        .sort({
            check_in_at: -1,
            _id: -1,
        })
        .facet({
            total: [{$count: 'count'}],
            total_checked_in: [
                {$match: {check_in_at: {$exists: true, $ne: null}}},
                {$count: 'count'}
            ],
            items: [
                {$match: {_id: {$in: registrationCheckedInIds}}},
            ],
        })
    const [result] = await query.exec()

    const items = result.items.map(function (item) {
        item.response.forEach(function (field) {
            if (field.field_type === FIELD_TYPE.FILE || field.field_type === FIELD_TYPE.FACE_ID) {
                field.response = field.response && LINK_STATIC_URL + field.response
            }
        })

        return item
    })

    return {
        total: _.get(result, 'total[0].count', 0),
        total_checked_in: _.get(result, 'total_checked_in[0].count', 0),
        items,
    }
}

export async function insertMultiRegistration(session, event, registrations, registrationResponses) {
    await Registration.insertMany(registrations, {session})
    await RegistrationResponse.insertMany(registrationResponses, {session})
    const total = await Registration.countDocuments({event_id: event._id}).session(session)
    return {total}
}
