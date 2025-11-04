import Resource, {RESOURCE_TYPE} from '../model/resource'
import { Op } from 'sequelize'

interface ResourceData {
    session_id?: number | null
    event_id?: string | null
    resource_type: typeof RESOURCE_TYPE
    name: string
    url_source: string
    description?: string
    file_size_bytes?: number
    mime_type?: string
    is_public?: boolean
    download_count?: number
    upload_date?: Date
    is_active?: boolean
    tags?: string[]
}

interface ResourceUpdateData extends Partial<ResourceData> {}

// Create a new resource
export const createResource = async (resourceData: ResourceData) => {
    try {
        const newResource = await Resource.create(resourceData as any)
        return newResource.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create resource: ${errorMsg}`)
    }
}

// Find resource by ID
export const findResourceById = async (id: number) => {
    try {
        const resource = await Resource.findByPk(id)
        return resource?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find resource by ID: ${errorMsg}`)
    }
}

// Find resources by session ID
export const findResourcesBySessionId = async (sessionId: number) => {
    try {
        const resources = await Resource.findAll({
            where: { session_id: sessionId },
            order: [['created_at', 'DESC']]
        })
        return resources.map(resource => resource.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find resources by session ID: ${errorMsg}`)
    }
}

// Find resources by event ID
export const findResourcesByEventId = async (eventId: string) => {
    try {
        const resources = await Resource.findAll({
            where: { event_id: eventId },
            order: [['created_at', 'DESC']]
        })
        return resources.map(resource => resource.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find resources by event ID: ${errorMsg}`)
    }
}

// Get all resources with pagination
export const findAllResources = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const resources = await Resource.findAll({
            order: [['created_at', 'DESC']],
            limit,
            offset
        })
        return resources.map(resource => resource.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch resources: ${errorMsg}`)
    }
}

// Get total count of resources
export const countResources = async () => {
    try {
        return await Resource.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count resources: ${errorMsg}`)
    }
}

// Update resource by ID
export const updateResourceById = async (id: number, updateData: ResourceUpdateData) => {
    try {
        if (Object.keys(updateData).length === 0) {
            throw new Error('No fields to update')
        }

        const [updatedRows] = await Resource.update(updateData, {
            where: { id }
        })

        if (updatedRows === 0) {
            return null
        }

        return await findResourceById(id)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update resource: ${errorMsg}`)
    }
}

// Delete resource by ID
export const deleteResourceById = async (id: number) => {
    try {
        const resource = await Resource.findByPk(id)
        if (!resource) return null

        await resource.destroy()
        return resource.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete resource: ${errorMsg}`)
    }
}

// Search resources by name, description, or tags
export const searchResources = async (searchTerm: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const resources = await Resource.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchTerm}%` } },
                    { description: { [Op.iLike]: `%${searchTerm}%` } },
                    { tags: { [Op.contains]: [searchTerm] } }
                ]
            },
            order: [['created_at', 'DESC']],
            limit,
            offset
        })
        return resources.map(resource => resource.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to search resources: ${errorMsg}`)
    }
}

// Find resources by type
export const findResourcesByType = async (resourceType: string) => {
    try {
        const resources = await Resource.findAll({
            where: { resource_type: resourceType },
            order: [['created_at', 'DESC']]
        })
        return resources.map(resource => resource.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find resources by type: ${errorMsg}`)
    }
}

// Find public resources
export const findPublicResources = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const resources = await Resource.findAll({
            where: { 
                is_public: true,
                is_active: true 
            },
            order: [['created_at', 'DESC']],
            limit,
            offset
        })
        return resources.map(resource => resource.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find public resources: ${errorMsg}`)
    }
}

// Find active resources
export const findActiveResources = async () => {
    try {
        const resources = await Resource.findAll({
            where: { is_active: true },
            order: [['created_at', 'DESC']]
        })
        return resources.map(resource => resource.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find active resources: ${errorMsg}`)
    }
}

// Find resources by tags
export const findResourcesByTags = async (tags: string[]) => {
    try {
        const resources = await Resource.findAll({
            where: {
                tags: { [Op.overlap]: tags },
                is_active: true
            },
            order: [['created_at', 'DESC']]
        })
        return resources.map(resource => resource.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find resources by tags: ${errorMsg}`)
    }
}

// Increment download count
export const incrementDownloadCount = async (id: number) => {
    try {
        const [updatedRows] = await Resource.update(
            { download_count: Resource.sequelize!.literal('download_count + 1') },
            { where: { id } }
        )

        if (updatedRows === 0) {
            return null
        }

        return await findResourceById(id)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to increment download count: ${errorMsg}`)
    }
}

// Get most downloaded resources
export const getMostDownloadedResources = async (limit: number = 10) => {
    try {
        const resources = await Resource.findAll({
            where: { is_active: true },
            order: [['download_count', 'DESC']],
            limit
        })
        return resources.map(resource => resource.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get most downloaded resources: ${errorMsg}`)
    }
}

// Check if resource name exists within event or session (case-insensitive)
export const resourceNameExists = async (
    name: string,
    eventId: string | null,
    sessionId: number | null,
    excludeId: number | null = null
) => {
    try {
        const whereClause: any = {
            name: { [Op.iLike]: name }
        }

        if (sessionId) {
            whereClause.session_id = sessionId
        } else if (eventId) {
            whereClause.event_id = eventId
        }

        if (excludeId) {
            whereClause.id = { [Op.ne]: excludeId }
        }

        const count = await Resource.count({ where: whereClause })
        return count > 0
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to check resource name existence: ${errorMsg}`)
    }
}
