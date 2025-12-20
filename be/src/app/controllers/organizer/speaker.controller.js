import {abort} from '@/utils/helpers'
import * as speakerService from '@/app/services/organizer/speaker.service'
import { FileUpload } from '@/utils/classes'

export async function createItem(req, res) {
    // If a file upload was provided in photo_url, save it and convert to URL/path
    const payload = { ...req.body }
    if (payload.photo_url && payload.photo_url instanceof FileUpload) {
        try {
            payload.photo_url = payload.photo_url.save()
        } catch (err) {
            console.error('Failed to save speaker photo:', err)
            payload.photo_url = ''
        }
    }

    const speaker = await speakerService.createSpeaker(payload)
    res.status(201).jsonify(speaker, 'Tạo diễn giả thành công.')
}

export async function getItem(req, res) {
    const speaker = await speakerService.getSpeakerById(req.params.id)
    if (!speaker) {
        abort(404, 'Không tìm thấy diễn giả.')
    }
    res.jsonify(speaker)
}

export async function getListByEventId(req, res) {
    const speakers = await speakerService.getSpeakersByEventId(req.params.eventId)
    const total = await speakerService.countSpeakersByEventId(req.params.eventId)
    res.jsonify({
        data: speakers,
        total: total,
    })
}

export async function getAllItems(req, res) {
    const {page = 1, limit = 10} = req.query
    const result = await speakerService.getAllSpeakers(page, limit)
    res.jsonify(result)
}

export async function updateItem(req, res) {
    const speaker = await speakerService.getSpeakerById(req.params.id)
    if (!speaker) {
        abort(404, 'Không tìm thấy diễn giả.')
    }

    // If updating with an uploaded file for photo_url, save it first
    const updatePayload = { ...req.body }
    if (updatePayload.photo_url && updatePayload.photo_url instanceof FileUpload) {
        try {
            updatePayload.photo_url = updatePayload.photo_url.save()
        } catch (err) {
            console.error('Failed to save speaker photo on update:', err)
            updatePayload.photo_url = ''
        }
    }

    const updated = await speakerService.updateSpeaker(req.params.id, updatePayload)
    res.jsonify(updated, 'Cập nhật diễn giả thành công.')
}

export async function updateProperties(req, res) {
    const speaker = await speakerService.getSpeakerById(req.params.id)
    if (!speaker) {
        abort(404, 'Không tìm thấy diễn giả.')
    }

    // Only update specific properties
    const allowedUpdates = {}
    const allowedFields = [
        'full_name', 'bio', 'email', 'phone', 'organization', 
        'photo_url', 'title', 'linkedin_url', 'expertise_areas', 
        'years_experience', 'is_keynote_speaker', 'is_active'
    ]
    
    allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(req.body, field) && req.body[field] !== null) {
            allowedUpdates[field] = req.body[field]
        }
    })

    // Save uploaded photo if present
    if (allowedUpdates.photo_url && allowedUpdates.photo_url instanceof FileUpload) {
        try {
            allowedUpdates.photo_url = allowedUpdates.photo_url.save()
        } catch (err) {
            console.error('Failed to save speaker photo on updateProperties:', err)
            allowedUpdates.photo_url = ''
        }
    }

    const updated = await speakerService.updateSpeaker(req.params.id, allowedUpdates)
    res.jsonify(updated, 'Cập nhật thuộc tính diễn giả thành công.')
}

export async function deleteItem(req, res) {
    const speaker = await speakerService.getSpeakerById(req.params.id)
    if (!speaker) {
        abort(404, 'Không tìm thấy diễn giả.')
    }

    await speakerService.deleteSpeaker(req.params.id)
    res.jsonify('Xóa diễn giả thành công.')
}

export async function searchItems(req, res) {
    const {q = '', page = 1, limit = 10} = req.query
    const result = await speakerService.searchSpeakers(q, page, limit)
    res.jsonify(result)
}

export async function getKeynoteSpeakers(req, res) {
    const speakers = await speakerService.getKeynoteSpeakers()
    res.jsonify({
        data: speakers,
        total: speakers.length,
    })
}

export async function getActiveSpeakers(req, res) {
    const speakers = await speakerService.getActiveSpeakers()
    res.jsonify({
        data: speakers,
        total: speakers.length,
    })
}

export async function getSpeakersByExpertise(req, res) {
    const {expertise} = req.query
    if (!expertise) {
        abort(400, 'Expertise areas là bắt buộc.')
    }
    
    const expertiseAreas = Array.isArray(expertise) ? expertise : [expertise]
    const speakers = await speakerService.getSpeakersByExpertise(expertiseAreas)
    res.jsonify({
        data: speakers,
        total: speakers.length,
    })
}

export async function getSpeakersByOrganization(req, res) {
    const {organization} = req.params
    const speakers = await speakerService.getSpeakersByOrganization(organization)
    res.jsonify({
        data: speakers,
        total: speakers.length,
    })
}

