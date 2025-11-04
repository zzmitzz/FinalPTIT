import SessionRegistration from '../model/session_registration'

interface SessionRegistrationData {
    session_id: number
    user_id: string
    status?: string
    registered_at?: Date
    waitlist_position?: number
    check_in_time?: Date
    cancellation_reason?: string
    notification_sent?: boolean
    special_requirements?: string
}

interface SessionRegistrationUpdateData extends Partial<SessionRegistrationData> {}

// Create a new session registration
export const createSessionRegistration = async (registrationData: SessionRegistrationData) => {
    try {
        const newRegistration = await SessionRegistration.create(registrationData as any)
        return newRegistration.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create session registration: ${errorMsg}`)
    }
}

// Find session registration by ID
export const findSessionRegistrationById = async (id: number) => {
    try {
        const registration = await SessionRegistration.findByPk(id)
        return registration?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find session registration by ID: ${errorMsg}`)
    }
}

// Find registrations by session ID
export const findRegistrationsBySessionId = async (sessionId: number) => {
    try {
        const registrations = await SessionRegistration.findAll({
            where: { session_id: sessionId },
            order: [['registered_at', 'ASC']]
        })
        return registrations.map(reg => reg.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registrations by session ID: ${errorMsg}`)
    }
}

// Find registrations by user ID
export const findRegistrationsByUserId = async (userId: string) => {
    try {
        const registrations = await SessionRegistration.findAll({
            where: { user_id: userId },
            order: [['registered_at', 'DESC']]
        })
        return registrations.map(reg => reg.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registrations by user ID: ${errorMsg}`)
    }
}

// Find specific session registration
export const findSessionRegistrationByIds = async (sessionId: number, userId: string) => {
    try {
        const registration = await SessionRegistration.findOne({
            where: { 
                session_id: sessionId,
                user_id: userId 
            }
        })
        return registration?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find session registration: ${errorMsg}`)
    }
}

// Get all session registrations with pagination
export const findAllSessionRegistrations = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const registrations = await SessionRegistration.findAll({
            order: [['registered_at', 'DESC']],
            limit,
            offset
        })
        return registrations.map(reg => reg.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch session registrations: ${errorMsg}`)
    }
}

// Get total count of session registrations
export const countSessionRegistrations = async () => {
    try {
        return await SessionRegistration.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count session registrations: ${errorMsg}`)
    }
}

// Update session registration by ID
export const updateSessionRegistrationById = async (id: number, updateData: SessionRegistrationUpdateData) => {
    try {
        if (Object.keys(updateData).length === 0) {
            throw new Error('No fields to update')
        }

        const [updatedRows] = await SessionRegistration.update(updateData, {
            where: { id }
        })

        if (updatedRows === 0) {
            return null
        }

        return await findSessionRegistrationById(id)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update session registration: ${errorMsg}`)
    }
}

// Delete session registration by ID
export const deleteSessionRegistrationById = async (id: number) => {
    try {
        const registration = await SessionRegistration.findByPk(id)
        if (!registration) return null

        await registration.destroy()
        return registration.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete session registration: ${errorMsg}`)
    }
}

// Cancel session registration
export const cancelSessionRegistration = async (sessionId: number, userId: string, reason?: string) => {
    try {
        const [updatedRows] = await SessionRegistration.update(
            { 
                status: 'cancelled',
                cancellation_reason: reason || null
            },
            { 
                where: { 
                    session_id: sessionId,
                    user_id: userId 
                } 
            }
        )

        if (updatedRows === 0) {
            return null
        }

        return await findSessionRegistrationByIds(sessionId, userId)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to cancel session registration: ${errorMsg}`)
    }
}

// Find registrations by status
export const findRegistrationsByStatus = async (status: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const registrations = await SessionRegistration.findAll({
            where: { status },
            order: [['registered_at', 'DESC']],
            limit,
            offset
        })
        return registrations.map(reg => reg.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registrations by status: ${errorMsg}`)
    }
}

// Get waitlist for a session
export const getSessionWaitlist = async (sessionId: number) => {
    try {
        const waitlist = await SessionRegistration.findAll({
            where: { 
                session_id: sessionId,
                status: 'waitlist'
            },
            order: [['waitlist_position', 'ASC']]
        })
        return waitlist.map(reg => reg.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get session waitlist: ${errorMsg}`)
    }
}

// Check in user to session
export const checkInUser = async (sessionId: number, userId: string) => {
    try {
        const [updatedRows] = await SessionRegistration.update(
            { 
                status: 'checked_in',
                check_in_time: new Date()
            },
            { 
                where: { 
                    session_id: sessionId,
                    user_id: userId,
                    status: 'attending'
                } 
            }
        )

        if (updatedRows === 0) {
            return null
        }

        return await findSessionRegistrationByIds(sessionId, userId)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to check in user: ${errorMsg}`)
    }
}

// Get attendance statistics for a session
export const getSessionAttendanceStats = async (sessionId: number) => {
    try {
        const stats = await SessionRegistration.findAll({
            where: { session_id: sessionId },
            attributes: [
                'status',
                [SessionRegistration.sequelize!.fn('COUNT', SessionRegistration.sequelize!.col('status')), 'count']
            ],
            group: ['status'],
            raw: true
        })
        return stats
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get session attendance stats: ${errorMsg}`)
    }
}

// Move user from waitlist to attending
export const promoteFromWaitlist = async (sessionId: number, userId: string) => {
    try {
        const [updatedRows] = await SessionRegistration.update(
            { 
                status: 'attending',
                waitlist_position: null
            },
            { 
                where: { 
                    session_id: sessionId,
                    user_id: userId,
                    status: 'waitlist'
                } 
            }
        )

        if (updatedRows === 0) {
            return null
        }

        return await findSessionRegistrationByIds(sessionId, userId)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to promote from waitlist: ${errorMsg}`)
    }
}

// Update notification status
export const updateNotificationStatus = async (id: number, notificationSent: boolean) => {
    try {
        const [updatedRows] = await SessionRegistration.update(
            { notification_sent: notificationSent },
            { where: { id } }
        )

        if (updatedRows === 0) {
            return null
        }

        return await findSessionRegistrationById(id)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update notification status: ${errorMsg}`)
    }
}

// Count registrations by session and status
export const countRegistrationsBySessionAndStatus = async (sessionId: number, status: string) => {
    try {
        return await SessionRegistration.count({
            where: {
                session_id: sessionId,
                status: status
            }
        })
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registrations by session and status: ${errorMsg}`)
    }
}

// Find registrations by user ID and status
export const findRegistrationsByUserIdAndStatus = async (userId: string, status: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const registrations = await SessionRegistration.findAll({
            where: {
                user_id: userId,
                status: status
            },
            order: [['registered_at', 'DESC']],
            limit,
            offset
        })
        return registrations.map(reg => reg.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registrations by user ID and status: ${errorMsg}`)
    }
}
