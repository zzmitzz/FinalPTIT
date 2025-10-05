import * as eventService from '../../services/organizor/event.service'
import { EVENT_STATUS } from '@/configs'

export async function createEvent(req, res) {
    // Add organizer_id from authenticated user
    const eventData = {
        ...req.body,
        organizer_id: req.currentOrganizer._id
    }

    const event = await eventService.createEvent(eventData)
    res.status(201).jsonify(event, 'Tạo sự kiện thành công.')
}

export async function getEventById(req, res) {
    const event = await eventService.getEventById(req.params.id)
    if (!event) {
        return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
    }
    res.jsonify(event)
}

export async function updateEvent(req, res) {
    const { status } = req.body
    if (status && !isValidStatus(status)) {
        return res.status(400).jsonify(null, 'Trạng thái không hợp lệ, phải là một trong: ' + Object.values(EVENT_STATUS).join(', '))
    }

    const event = await eventService.updateEvent(req.params.id, req.body)
    if (!event) {
        return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
    }
    res.jsonify(event, 'Cập nhật sự kiện thành công.')
}

export async function deleteEvent(req, res) {
    const result = await eventService.deleteEvent(req.params.id)
    if (!result) {
        return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
    }
    res.status(204).send()
}

const isValidStatus = (value) => {
    return Object.values(EVENT_STATUS).includes(value)
}
  