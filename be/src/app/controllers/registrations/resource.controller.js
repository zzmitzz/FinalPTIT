import { abort } from '@/utils/helpers'
import * as resourceService from '@/app/services/registrations/resource.service'
import { transformResourceUrl, transformResourceUrlList } from '@/utils/url-builder'

export async function createItem(req, res) {
    const resource = await resourceService.createResource(req.body)
    const resourceWithUrl = transformResourceUrl(resource)
    res.status(201).jsonify(resourceWithUrl, 'Tạo tài nguyên thành công.')
}

export async function getItem(req, res) {
    const resource = await resourceService.getResourceById(req.params.id)
    if (!resource) {
        abort(404, 'Không tìm thấy tài nguyên.')
    }
    const resourceWithUrl = transformResourceUrl(resource)
    res.jsonify(resourceWithUrl)
}

export async function getListByEventId(req, res) {
    const resources = await resourceService.getResourcesByEventId(req.params.eventId)
    const resourcesWithUrl = transformResourceUrlList(resources)
    const total = resourcesWithUrl.length
    res.jsonify({
        data: resourcesWithUrl,
        total: total,
    })
}

export async function getListBySessionId(req, res) {
    const resources = await resourceService.getResourcesBySessionId(req.params.sessionId)
    const resourcesWithUrl = transformResourceUrlList(resources)
    const total = resourcesWithUrl.length
    res.jsonify({
        data: resourcesWithUrl,
        total: total,
    })
}

export async function getMapOfEventResources(req, res) {
    const resources = await resourceService.getMapResourceByEventId(req.params.eventId)
    const resourcesWithUrl = transformResourceUrlList(resources)
    const total = resourcesWithUrl.length
    res.jsonify({
        data: resourcesWithUrl,
        total: total,
    })
}

export async function updateItem(req, res) {
    const updated = await resourceService.updateResource(req.params.id, req.body)
    if (!updated) {
        abort(404, 'Không tìm thấy tài nguyên.')
    }
    const updatedWithUrl = transformResourceUrl(updated)
    res.jsonify(updatedWithUrl, 'Cập nhật tài nguyên thành công.')
}

export async function deleteItem(req, res) {
    const deleted = await resourceService.deleteResource(req.params.id)
    if (!deleted) {
        abort(404, 'Không tìm thấy tài nguyên.')
    }
    const deletedWithUrl = transformResourceUrl(deleted)
    res.jsonify(deletedWithUrl, 'Xóa tài nguyên thành công.')
}

export async function checkActivation(req, res) {
    const result = await resourceService.checkResourceActivation(req.params.id)
    res.jsonify(result)
}
