import moment from 'moment'
import {EVENT_STATUS, Event, Booth, CheckInHistory, LUCKY_WHEEL_CONDITIONS, MiniGameSetting, EVENT_MINI_GAME} from '@/models'
import {abort} from '@/utils/helpers'
import { isValidObjectId } from 'mongoose'
import {VALIDATE_MAC_ADDRESS_REGEX} from '@/configs'

export async function verifyBoothMacAddress(req, res, next) {
    const macAddress = req.get('X-MAC-Address')

    if (macAddress && VALIDATE_MAC_ADDRESS_REGEX.test(macAddress)) {
        const booth = await Booth.findOne({mac: macAddress}).populate('event')

        if (booth) {
            req.booth = booth
            next()
            return
        }
    }

    abort(403, 'Địa chỉ MAC không hợp lệ.')
}

export async function verifyEventId(req, res, next) {
    const {eventId} = req.params
    if (isValidObjectId(eventId)) {
        const event = await Event.findOne({_id: eventId, deleted: false})
        if (event) {
            if (event.is_locked) {
                abort(403, 'Sự kiện đã bị khoá.')
            }
            if (event.status !== EVENT_STATUS.APPROVED) {
                abort(403, 'Sự kiện chưa được phê duyệt.')
            }
            req.event = event
            next()
            return
        }
    }
    abort(404, 'Sự kiện không tồn tại hoặc đã bị xoá.')
}

export function requireEventOngoing(req, res, next) {
    const now = moment()
    if (now.isBefore(req.event.end_time)) {
        next()
        return
    }
    abort(403, 'Sự kiện đã kết thúc.')
}

export async function canCheckIn(req, res, next) {
    const histories = await CheckInHistory.findOne({
        registration_id: req.member._id,
        booth_mac: req.booth.mac,
    })
    if (histories) {
        abort(403, 'Bạn đã check-in rồi.')
    }
    next()
}

export function checkMiniGameCode(req, res, next) {
    if (!req.event.mini_game.includes(req.params.MINI_GAME_CODE)) {
        abort(404)
    }
    next()
}
export async function canReceivePrize(req, res, next) {
    if (req.registration.prizes.some(({prize}) => prize.mini_game === req.params.MINI_GAME_CODE)) {
        abort(409, 'Bạn đã được phát quà rồi.')
    }
    if (req.params.MINI_GAME_CODE === EVENT_MINI_GAME.LUCKY_WHEEL) {
        const checkInCount = await CheckInHistory.countDocuments({registration_id: req.registration._id})
        const {conditions} = await MiniGameSetting.findOne({
            event_id: req.event._id,
            mini_game: req.params.MINI_GAME_CODE,
        })
        if (!conditions || (conditions === LUCKY_WHEEL_CONDITIONS.ALL_CHECK_INS && checkInCount < req.event.booth_check_in)) {
            abort(403, 'Bạn chưa đạt đủ điều kiện để nhận quà tặng.')
        }
    }

    next()
}
