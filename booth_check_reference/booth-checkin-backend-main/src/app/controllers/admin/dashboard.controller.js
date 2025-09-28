import {Event, EVENT_STATUS, Organizer, Registration} from '@/models'
import moment from 'moment'

export async function getStatistical(req, res) {
    const eventIsOpen = Event.countDocuments({
        deleted: false,
        is_locked: false,
        status: EVENT_STATUS.APPROVED,
        start_time: {$lte: moment().toDate()},
        end_time: {$gte: moment().toDate()},
    })
    const completedEvent = Event.countDocuments({
        deleted: false,
        is_locked: false,
        status: EVENT_STATUS.APPROVED,
    })
    const totalOrganizer = Organizer.countDocuments({deleted: false})
    const totalRegistrations = Registration.countDocuments({})
    const [event_is_open, completed_event, total_organizers, total_registrations] = await Promise.all([
        eventIsOpen,
        completedEvent,
        totalOrganizer,
        totalRegistrations,
    ])
    res.jsonify({event_is_open, completed_event, total_organizers, total_registrations})
}

export async function getChartData(req, res) {
    const date = moment(req.query.year, 'YYYY')
    const year = date.isValid() ? date.year() : moment().year()

    const stats = await Event.aggregate()
        .match({
            deleted: false,
            is_locked: false,
            status: EVENT_STATUS.APPROVED,
            start_time: {
                $gte: moment().year(year).startOf('year').toDate(),
                $lte: moment().year(year).endOf('year').toDate(),
            },
        })
        .group({
            _id: {
                month: {$month: '$start_time'},
            },
            total_events: {$sum: 1},
            total_booth_check_in: {$sum: '$booth_check_in'},
        })
        .sort({'_id.month': 1})
    const fullYearStats = Array.from({length: 12}, (v, i) => ({
        month: i + 1,
        total_events: 0,
        total_booth_check_in: 0,
    }))
    stats.forEach(function (stat) {
        fullYearStats[stat._id.month - 1].total_events = stat.total_events
        fullYearStats[stat._id.month - 1].total_booth_check_in = stat.total_booth_check_in
    })
    res.jsonify(fullYearStats)
}
