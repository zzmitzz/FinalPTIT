import { abort } from '@/utils/helpers'
import * as checkinHistoryRepo from '@/db/checkin_history_repository'
import { CHECKIN_TYPE } from '@/configs/constants'

/**
 * Create a check-in record for a user at an event
 * POST /organizer/checkins
 */
export async function createCheckin(req, res) {
    const { event_id, registration_id } = req.body

    // Check if user has already checked in for this event
    const existingCheckins = await checkinHistoryRepo.findCheckinHistoryByEventAndRegistration(
        event_id,
        registration_id
    )

    if (existingCheckins && existingCheckins.length > 0) {
        abort(400, 'Người dùng đã check-in cho sự kiện này rồi.')
    }

    // Create check-in record with current time
    const checkinData = {
        registration_id,
        event_id,
        checkin_type: CHECKIN_TYPE.QR_SCAN,
        checkin: new Date() // Current time
    }

    const checkin = await checkinHistoryRepo.createCheckinHistory(checkinData)

    res.status(201).jsonify(checkin, 'Check-in thành công.')
}

