import { abort } from '@/utils/helpers'
import * as resourceService from '@/app/services/organizer/resource.service'

/**
 * Create a new resource
 */
export async function createItem(req, res) {
    const resource = await resourceService.createResource(req.body)
    res.status(201).jsonify(resource, 'Tạo tài nguyên thành công.')
}

/**
 * Get a single resource by ID
 */
export async function getItem(req, res) {
    const resource = await resourceService.getResourceById(req.params.id)
    if (!resource) {
        abort(404, 'Không tìm thấy tài nguyên.')
    }
    res.jsonify(resource)
}

/**
 * Get all resources for a specific event
 */
export async function getListByEventId(req, res) {
    const resources = await resourceService.getResourcesByEventId(req.params.eventId)
    const total = resources.length
    res.jsonify({
        data: resources,
        total: total,
    })
}

/**
 * Get all resources for a specific session
 */
export async function getListBySessionId(req, res) {
    const resources = await resourceService.getResourcesBySessionId(req.params.sessionId)
    const total = resources.length
    res.jsonify({
        data: resources,
        total: total,
    })
}

/**
 * Update a resource
 */
export async function updateItem(req, res) {
    const updated = await resourceService.updateResource(req.params.id, req.body)
    if (!updated) {
        abort(404, 'Không tìm thấy tài nguyên.')
    }
    res.jsonify(updated, 'Cập nhật tài nguyên thành công.')
}

/**
 * Delete a resource
 */
export async function deleteItem(req, res) {
    const deleted = await resourceService.deleteResource(req.params.id)
    if (!deleted) {
        abort(404, 'Không tìm thấy tài nguyên.')
    }
    res.jsonify(deleted, 'Xóa tài nguyên thành công.')
}

/**
 * Check if a resource is active and visible
 */
export async function checkActivation(req, res) {
    const result = await resourceService.checkResourceActivation(req.params.id)
    res.jsonify(result)
}

