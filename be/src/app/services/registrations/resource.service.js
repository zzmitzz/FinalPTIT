import * as resourceRepo from '@/db/resource_repository'
import { RESOURCE_TYPE } from '@/configs'
import { FileUpload } from '@/utils/classes'
import { abort } from '@/utils/helpers'

export async function createResource(data) {
    const resourceData = { ...data }
    if (data.resource_type === RESOURCE_TYPE.FILE && data.file instanceof FileUpload) {
        const file = data.file

        const filepath = file.save('resources')

        resourceData.url_source = filepath
        resourceData.file_size_bytes = Buffer.byteLength(file.buffer)
        resourceData.mime_type = file.mimetype

        delete resourceData.file
    } else if (data.resource_type === RESOURCE_TYPE.MAPS) {
        if (!data.maps) {
            abort(400, 'Bản đồ là bắt buộc cho loại MAPS.')
        }
        const mapFile = data.maps
        const filepath = mapFile.save('maps')
        resourceData.url_source = filepath
        resourceData.file_size_bytes = Buffer.byteLength(mapFile.buffer)
        resourceData.mime_type = mapFile.mimetype

        delete resourceData.maps
    }

    return await resourceRepo.createResource(resourceData)
}

export async function getResourceById(id) {
    return await resourceRepo.findResourceById(id)
}

export async function getResourcesBySessionId(sessionId) {
    return await resourceRepo.findResourcesBySessionId(sessionId)
}

export async function getResourcesByEventId(eventId) {
    return await resourceRepo.findResourcesByEventId(eventId)
}

export async function getAllResources(page = 1, limit = 10) {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    return await resourceRepo.findAllResources(normalizedPage, normalizedLimit)
}

export async function countResources() {
    return await resourceRepo.countResources()
}

export async function updateResource(id, updateData) {
    const resourceData = { ...updateData }

    if (updateData.file instanceof FileUpload) {
        const file = updateData.file

        const existingResource = await resourceRepo.findResourceById(id)
        if (existingResource && existingResource.resource_type === RESOURCE_TYPE.FILE) {
            try {
                FileUpload.remove(existingResource.url_source)
            } catch (error) {
                console.error('Failed to delete old file:', error)
            }
        }

        const filepath = file.save('resources')

        resourceData.url_source = filepath
        resourceData.file_size_bytes = Buffer.byteLength(file.buffer)
        resourceData.mime_type = file.mimetype

        delete resourceData.file
    }

    const updated = await resourceRepo.updateResourceById(id, resourceData)
    if (!updated) {
        return null
    }
    return await resourceRepo.findResourceById(id)
}

export async function deleteResource(id) {
    const resource = await resourceRepo.findResourceById(id)

    if (!resource) {
        return null
    }

    if (resource.resource_type === RESOURCE_TYPE.FILE && resource.url_source) {
        try {
            FileUpload.remove(resource.url_source)
        } catch (error) {
            console.error('Failed to delete file:', error)
        }
    }

    return await resourceRepo.deleteResourceById(id)
}

export async function searchResources(searchTerm, page = 1, limit = 10) {
    return await resourceRepo.searchResources(searchTerm, page, limit)
}

export async function getResourcesByType(resourceType) {
    return await resourceRepo.findResourcesByType(resourceType)
}

export async function getPublicResources(page = 1, limit = 10) {
    return await resourceRepo.findPublicResources(page, limit)
}

export async function getActiveResources() {
    return await resourceRepo.findActiveResources()
}

export async function checkResourceActivation(id) {
    const resource = await resourceRepo.findResourceById(id)

    if (!resource) {
        return {
            exists: false,
            is_active: false,
            is_visible: false
        }
    }

    return {
        exists: true,
        is_active: resource.is_active,
        is_visible: resource.is_active && resource.is_public
    }
}

export async function getResourcesByTags(tags) {
    return await resourceRepo.findResourcesByTags(tags)
}

export async function incrementResourceDownloadCount(id) {
    return await resourceRepo.incrementDownloadCount(id)
}

export async function getMostDownloadedResources(limit = 10) {
    return await resourceRepo.getMostDownloadedResources(limit)
}
