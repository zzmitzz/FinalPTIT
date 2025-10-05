import CheckinHistory from '../model/checkin_history'
import { Op } from 'sequelize'
import { CHECKIN_TYPE } from '../configs/constants'

interface CheckinHistoryData {
    registration_id: string
    event_id: string
    checkin_type: keyof typeof CHECKIN_TYPE
    checkin?: Date
}

interface CheckinHistoryUpdateData extends Partial<CheckinHistoryData> { }

export const createCheckinHistory = async (data: CheckinHistoryData) => {
    try {
        const checkin = await CheckinHistory.create(data as any)
        return checkin.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create checkin history: ${errorMsg}`)
    }
}

export const findCheckinHistoryById = async (id: number) => {
    try {
        const checkin = await CheckinHistory.findByPk(id)
        return checkin?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find checkin history by ID: ${errorMsg}`)
    }
}

export const findCheckinHistoryByRegistrationId = async (registrationId: string) => {
    try {
        const checkins = await CheckinHistory.findAll({
            where: { registration_id: registrationId },
            order: [['checkin', 'DESC']]
        })
        return checkins.map(c => c.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find checkin history by registration ID: ${errorMsg}`)
    }
}

export const findCheckinHistoryByEventId = async (eventId: string) => {
    try {
        const checkins = await CheckinHistory.findAll({
            where: { event_id: eventId },
            order: [['checkin', 'DESC']]
        })
        return checkins.map(c => c.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find checkin history by event ID: ${errorMsg}`)
    }
}

export const findCheckinHistoryByEventAndRegistration = async (eventId: string, registrationId: string) => {
    try {
        const checkins = await CheckinHistory.findAll({
            where: {
                event_id: eventId,
                registration_id: registrationId
            },
            order: [['checkin', 'DESC']]
        })
        return checkins.map(c => c.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find checkin history by event and registration: ${errorMsg}`)
    }
}

export const findLatestCheckinByEventAndRegistration = async (eventId: string, registrationId: string) => {
    try {
        const checkin = await CheckinHistory.findOne({
            where: {
                event_id: eventId,
                registration_id: registrationId
            },
            order: [['checkin', 'DESC']]
        })
        return checkin?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find latest checkin: ${errorMsg}`)
    }
}

export const findCheckinHistoryByType = async (checkinType: keyof typeof CHECKIN_TYPE) => {
    try {
        const checkins = await CheckinHistory.findAll({
            where: { checkin_type: checkinType },
            order: [['checkin', 'DESC']]
        })
        return checkins.map(c => c.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find checkin history by type: ${errorMsg}`)
    }
}

export const findCheckinHistoryByDateRange = async (
    startDate: Date,
    endDate: Date,
    eventId?: string
) => {
    try {
        const whereClause: any = {
            checkin: {
                [Op.between]: [startDate, endDate]
            }
        }

        if (eventId) {
            whereClause.event_id = eventId
        }

        const checkins = await CheckinHistory.findAll({
            where: whereClause,
            order: [['checkin', 'DESC']]
        })
        return checkins.map(c => c.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find checkin history by date range: ${errorMsg}`)
    }
}

export const findAllCheckinHistory = async (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit
    try {
        const checkins = await CheckinHistory.findAll({
            order: [['checkin', 'DESC']],
            limit,
            offset,
        })
        return checkins.map(c => c.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to list checkin history: ${errorMsg}`)
    }
}

export const countCheckinHistory = async () => {
    try {
        return await CheckinHistory.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count checkin history: ${errorMsg}`)
    }
}

export const countCheckinHistoryByEventId = async (eventId: string) => {
    try {
        return await CheckinHistory.count({ where: { event_id: eventId } })
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count checkin history by event ID: ${errorMsg}`)
    }
}

export const countCheckinHistoryByRegistrationId = async (registrationId: string) => {
    try {
        return await CheckinHistory.count({ where: { registration_id: registrationId } })
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count checkin history by registration ID: ${errorMsg}`)
    }
}

export const countUniqueCheckinsForEvent = async (eventId: string) => {
    try {
        const result = await CheckinHistory.count({
            where: { event_id: eventId },
            distinct: true,
            col: 'registration_id'
        })
        return result
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count unique checkins for event: ${errorMsg}`)
    }
}

export const hasUserCheckedIn = async (eventId: string, registrationId: string): Promise<boolean> => {
    try {
        const count = await CheckinHistory.count({
            where: {
                event_id: eventId,
                registration_id: registrationId
            }
        })
        return count > 0
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to check if user has checked in: ${errorMsg}`)
    }
}

export const updateCheckinHistoryById = async (id: number, updateData: CheckinHistoryUpdateData) => {
    try {
        const [updatedRows] = await CheckinHistory.update(updateData, { where: { _id: id } })
        return updatedRows > 0 ? updatedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update checkin history: ${errorMsg}`)
    }
}

export const deleteCheckinHistoryById = async (id: number) => {
    try {
        const deletedRows = await CheckinHistory.destroy({ where: { _id: id } })
        return deletedRows > 0 ? deletedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete checkin history: ${errorMsg}`)
    }
}

export const deleteCheckinHistoryByEventId = async (eventId: string) => {
    try {
        const deletedRows = await CheckinHistory.destroy({ where: { event_id: eventId } })
        return deletedRows
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete checkin history by event ID: ${errorMsg}`)
    }
}

export const deleteCheckinHistoryByRegistrationId = async (registrationId: string) => {
    try {
        const deletedRows = await CheckinHistory.destroy({ where: { registration_id: registrationId } })
        return deletedRows
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete checkin history by registration ID: ${errorMsg}`)
    }
}

export const bulkCreateCheckinHistory = async (dataArray: CheckinHistoryData[]) => {
    try {
        const checkins = await CheckinHistory.bulkCreate(dataArray as any)
        return checkins.map(c => c.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to bulk create checkin history: ${errorMsg}`)
    }
}

