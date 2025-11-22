import * as placeService from '@/app/services/organizer/place.service'
import * as eventService from '@/app/services/organizer/event.service'
import { abort } from '@/utils/helpers'

export async function createPlace(req, res) {
    try {
        const { event_id, name } = req.body
        if (!event_id || !name) {
            return res.status(400).jsonify(null, 'event_id và name là bắt buộc')
        }

        // verify event ownership
        const event = await eventService.getEventById(event_id)
        if (!event) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
        if (event.organizer_id !== req.currentOrganizer._id) return res.status(403).jsonify(null, 'Bạn không có quyền.')

        const place = await placeService.createPlace({ event_id, name })
        if (!place) return res.status(400).jsonify(null, 'Không thể tạo phòng.')

        res.status(201).jsonify(place, 'Tạo phòng thành công.')
    } catch (err) {
        console.error('Error in createPlace:', err)
        return res.status(500).json({ status: 500, success: false, message: 'Lỗi khi tạo phòng.', error: err.message })
    }
}

export async function listPlacesByEvent(req, res) {
    try {
        const eventId = req.params.eventId
        const event = await eventService.getEventById(eventId)
        if (!event) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
        if (event.organizer_id !== req.currentOrganizer._id) return res.status(403).jsonify(null, 'Bạn không có quyền.')

        const places = await placeService.getPlacesByEventId(eventId)
        res.jsonify(places || [])
    } catch (err) {
        console.error('Error in listPlacesByEvent:', err)
        return res.status(500).json({ status: 500, success: false, message: 'Lỗi khi lấy danh sách phòng.', error: err.message })
    }
}

export async function deletePlace(req, res) {
    try {
        const id = req.params.id
        const place = await placeService.getPlaceById(id)
        if (!place) return res.status(404).jsonify(null, 'Không tìm thấy phòng.')

        const event = await eventService.getEventById(place.event_id)
        if (!event) return res.status(404).jsonify(null, 'Không tìm thấy sự kiện liên quan.')
        if (event.organizer_id !== req.currentOrganizer._id) return res.status(403).jsonify(null, 'Bạn không có quyền.')

        await placeService.deletePlace(id)
        res.jsonify('Xóa phòng thành công.')
    } catch (err) {
        console.error('Error in deletePlace:', err)
        return res.status(500).json({ status: 500, success: false, message: 'Lỗi khi xóa phòng.', error: err.message })
    }
}
