import OrganizerDetails from '../model/organizer_details'

interface OrganizerDetailsData {
    organizer_id: string
    organization_name: string
    address?: string
    website?: string
    description?: string
    logo_url?: string
}

interface OrganizerDetailsUpdateData extends Partial<Omit<OrganizerDetailsData, 'organizer_id'>> { }

const normalizeOptionalString = (value?: string) => {
    if (value === undefined || value === null) return undefined
    const trimmed = String(value).trim()
    return trimmed === '' ? undefined : trimmed
}

export const createOrganizerDetails = async (data: OrganizerDetailsData) => {
    try {
        const details = await OrganizerDetails.create(data as any)
        return details.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create organizer details: ${errorMsg}`)
    }
}

export const findOrganizerDetailsByOrganizerId = async (organizerId: string) => {
    try {
        const details = await OrganizerDetails.findByPk(organizerId)
        return details?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find organizer details by organizer ID: ${errorMsg}`)
    }
}

export const findAllOrganizerDetails = async (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit
    try {
        const details = await OrganizerDetails.findAll({
            order: [['created_at', 'DESC']],
            limit,
            offset,
        })
        return details.map(d => d.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to list organizer details: ${errorMsg}`)
    }
}

export const countOrganizerDetails = async () => {
    try {
        return await OrganizerDetails.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count organizer details: ${errorMsg}`)
    }
}

export const updateOrganizerDetailsByOrganizerId = async (
    organizerId: string,
    updateData: OrganizerDetailsUpdateData
) => {
    try {
        const [updatedRows] = await OrganizerDetails.update(updateData, {
            where: { organizer_id: organizerId }
        })
        return updatedRows > 0 ? updatedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update organizer details: ${errorMsg}`)
    }
}

export const deleteOrganizerDetailsByOrganizerId = async (organizerId: string) => {
    try {
        const deletedRows = await OrganizerDetails.destroy({
            where: { organizer_id: organizerId }
        })
        return deletedRows > 0 ? deletedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete organizer details: ${errorMsg}`)
    }
}

export const organizerDetailsExists = async (organizerId: string): Promise<boolean> => {
    try {
        const count = await OrganizerDetails.count({
            where: { organizer_id: organizerId }
        })
        return count > 0
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to check if organizer details exist: ${errorMsg}`)
    }
}

export const upsertOrganizerDetails = async (data: OrganizerDetailsData) => {
    try {
        const exists = await organizerDetailsExists(data.organizer_id)

        const updatePayload: OrganizerDetailsUpdateData = {
            organization_name: data.organization_name,
            address: normalizeOptionalString(data.address),
            website: normalizeOptionalString(data.website),
            description: normalizeOptionalString(data.description),
            logo_url: normalizeOptionalString(data.logo_url)
        }
        
        if (exists) {
            await updateOrganizerDetailsByOrganizerId(data.organizer_id, updatePayload)
            return await findOrganizerDetailsByOrganizerId(data.organizer_id)
        } else {
            return await createOrganizerDetails({
                ...data,
                address: normalizeOptionalString(data.address),
                website: normalizeOptionalString(data.website),
                description: normalizeOptionalString(data.description),
                logo_url: normalizeOptionalString(data.logo_url)
            })
        }
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to upsert organizer details: ${errorMsg}`)
    }
}

