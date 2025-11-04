import * as resourceRepo from '@/db/resource_repository'
import { RESOURCE_TYPE } from '@/configs'
import { FileUpload } from '@/utils/classes'
import { abort } from '@/utils/helpers'

/**
 * Create a new resource with file upload handling
 */
export async function createResource(data) {
    const resourceData = { ...data }

    // Handle file upload for FILE type resources
    if (data.resource_type === RESOURCE_TYPE.FILE && data.file instanceof FileUpload) {
        const file = data.file

        // Save the file
        const filepath = file.save('resources')

        // Set resource data
        resourceData.url_source = filepath
        resourceData.file_size_bytes = Buffer.byteLength(file.buffer)
        resourceData.mime_type = file.mimetype

        // Remove file object from data
        delete resourceData.file
    } else if (data.resource_type === RESOURCE_TYPE.MAPS) {
        // For MAPS type, ensure url_source is provided
        if (!data.url_source) {
            abort(400, 'URL nguồn là bắt buộc cho loại MAPS.')
        }
    }

    return await resourceRepo.createResource(resourceData)
}

/**
 * Get resource by ID
 */
export async function getResourceById(id) {
    return await resourceRepo.findResourceById(id)
}

/**
 * Get resources by session ID
 */
export async function getResourcesBySessionId(sessionId) {
    return await resourceRepo.findResourcesBySessionId(sessionId)
}

/**
 * Get resources by event ID
 */
export async function getResourcesByEventId(eventId) {
    return await resourceRepo.findResourcesByEventId(eventId)
}

/**
 * Get all resources with pagination
 */
export async function getAllResources(page = 1, limit = 10) {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    return await resourceRepo.findAllResources(normalizedPage, normalizedLimit)
}

/**
 * Count total resources
 */
export async function countResources() {
    return await resourceRepo.countResources()
}

/**
 * Update resource with file upload handling
 */
export async function updateResource(id, updateData) {
    const resourceData = { ...updateData }

    // Handle file upload for FILE type resources
    if (updateData.file instanceof FileUpload) {
        const file = updateData.file

        // Get existing resource to delete old file
        const existingResource = await resourceRepo.findResourceById(id)
        if (existingResource && existingResource.resource_type === RESOURCE_TYPE.FILE) {
            // Delete old file if it exists
            try {
                FileUpload.remove(existingResource.url_source)
            } catch (error) {
                // Log error but don't fail the update
                console.error('Failed to delete old file:', error)
            }
        }

        // Save the new file
        const filepath = file.save('resources')

        // Set resource data
        resourceData.url_source = filepath
        resourceData.file_size_bytes = Buffer.byteLength(file.buffer)
        resourceData.mime_type = file.mimetype

        // Remove file object from data
        delete resourceData.file
    }

    const updated = await resourceRepo.updateResourceById(id, resourceData)
    if (!updated) {
        return null
    }
    return await resourceRepo.findResourceById(id)
}

/**
 * Delete resource and associated file
 */
export async function deleteResource(id) {
    const resource = await resourceRepo.findResourceById(id)

    if (!resource) {
        return null
    }

    // Delete file if it's a FILE type resource
    if (resource.resource_type === RESOURCE_TYPE.FILE && resource.url_source) {
        try {
            FileUpload.remove(resource.url_source)
        } catch (error) {
            // Log error but don't fail the deletion
            console.error('Failed to delete file:', error)
        }
    }

    return await resourceRepo.deleteResourceById(id)
}

/**
 * Search resources
 */
export async function searchResources(searchTerm, page = 1, limit = 10) {
    return await resourceRepo.searchResources(searchTerm, page, limit)
}

/**
 * Get resources by type
 */
export async function getResourcesByType(resourceType) {
    return await resourceRepo.findResourcesByType(resourceType)
}

/**
 * Get public resources
 */
export async function getPublicResources(page = 1, limit = 10) {
    return await resourceRepo.findPublicResources(page, limit)
}

/**
 * Get active resources
 */
export async function getActiveResources() {
    return await resourceRepo.findActiveResources()
}

/**
 * Check if resource is active and visible
 */
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

