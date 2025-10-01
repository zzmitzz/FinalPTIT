import pool from '../configs/postgre_sql.js'

// Create a new event
export const createEvent = async (eventData) => {
    const {
        organizer_id,
        name,
        thumbnail = null,
        logo,
        description = '',
        start_time,
        end_time,
        location,
        category_id,
        tags = [],      
        status = 'PENDING',
        pin_code,
        approver_id = null,
        approved_at = null,
        is_locked = false,
        deleted = false,
    } = eventData

    const query = `
        INSERT INTO events (
            organizer_id, name, thumbnail, logo, description,
            start_time, end_time, location, category_id, tags,
            status, pin_code, approver_id, approved_at, is_locked,
            deleted, created_at, updated_at
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16, NOW(), NOW()
        )
        RETURNING *
    `

    const values = [
        organizer_id,
        name,
        thumbnail,
        logo,
        description,
        start_time,
        end_time,
        location,
        category_id,
        JSON.stringify(tags),
        status,
        pin_code,
        approver_id,
        approved_at,
        is_locked,
        deleted,
    ]

    try {
        const result = await pool.query(query, values)
        return result.rows[0]
    } catch (error) {
        throw new Error(`Failed to create event: ${error.message}`)
    }
}

// Find event by ID
export const findEventById = async (id) => {
    const query = 'SELECT * FROM events WHERE _id = $1'

    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find event by ID: ${error.message}`)
    }
}

// Find event by pin code
export const findEventByPinCode = async (pinCode) => {
    const query = 'SELECT * FROM events WHERE pin_code = $1'

    try {
        const result = await pool.query(query, [pinCode])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find event by pin code: ${error.message}`)
    }
}

// Get all events with pagination
export const findAllEvents = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT * FROM events
        ORDER BY _id DESC
        LIMIT $1 OFFSET $2
    `

    try {
        const result = await pool.query(query, [limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to fetch events: ${error.message}`)
    }
}

// Get total count of events
export const countEvents = async () => {
    const query = 'SELECT COUNT(*) as total FROM events'

    try {
        const result = await pool.query(query)
        return parseInt(result.rows[0].total)
    } catch (error) {
        throw new Error(`Failed to count events: ${error.message}`)
    }
}

// Update event by ID (partial update)
export const updateEventById = async (id, updateData) => {
    const {
        organizer_id,
        name,
        thumbnail,
        logo,
        description,
        start_time,
        end_time,
        location,
        category_id,
        tags,
        status,
        pin_code,
        approver_id,
        approved_at,
        is_locked,
        deleted,
    } = updateData

    const setClause = []
    const values = []
    let paramCount = 1

    if (organizer_id !== undefined) {
        setClause.push(`organizer_id = $${paramCount}`)
        values.push(organizer_id)
        paramCount++
    }
    if (name !== undefined) {
        setClause.push(`name = $${paramCount}`)
        values.push(name)
        paramCount++
    }
    if (thumbnail !== undefined) {
        setClause.push(`thumbnail = $${paramCount}`)
        values.push(thumbnail)
        paramCount++
    }
    if (logo !== undefined) {
        setClause.push(`logo = $${paramCount}`)
        values.push(logo)
        paramCount++
    }
    if (description !== undefined) {
        setClause.push(`description = $${paramCount}`)
        values.push(description)
        paramCount++
    }
    if (start_time !== undefined) {
        setClause.push(`start_time = $${paramCount}`)
        values.push(start_time)
        paramCount++
    }
    if (end_time !== undefined) {
        setClause.push(`end_time = $${paramCount}`)
        values.push(end_time)
        paramCount++
    }
    if (location !== undefined) {
        setClause.push(`location = $${paramCount}`)
        values.push(location)
        paramCount++
    }
    if (category_id !== undefined) {
        setClause.push(`category_id = $${paramCount}`)
        values.push(category_id)
        paramCount++
    }
    if (tags !== undefined) {
        setClause.push(`tags = $${paramCount}`)
        values.push(JSON.stringify(tags))
        paramCount++
    }
    if (status !== undefined) {
        setClause.push(`status = $${paramCount}`)
        values.push(status)
        paramCount++
    }
    if (pin_code !== undefined) {
        setClause.push(`pin_code = $${paramCount}`)
        values.push(pin_code)
        paramCount++
    }
    if (approver_id !== undefined) {
        setClause.push(`approver_id = $${paramCount}`)
        values.push(approver_id)
        paramCount++
    }
    if (approved_at !== undefined) {
        setClause.push(`approved_at = $${paramCount}`)
        values.push(approved_at)
        paramCount++
    }
    if (is_locked !== undefined) {
        setClause.push(`is_locked = $${paramCount}`)
        values.push(is_locked)
        paramCount++
    }
    if (deleted !== undefined) {
        setClause.push(`deleted = $${paramCount}`)
        values.push(deleted)
        paramCount++
    }

    if (setClause.length === 0) {
        throw new Error('No fields to update')
    }

    const query = `
        UPDATE events
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE _id = $${paramCount}
        RETURNING *
    `
    values.push(id)

    try {
        const result = await pool.query(query, values)
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to update event: ${error.message}`)
    }
}

// Delete event by ID
export const deleteEventById = async (id) => {
    const query = 'DELETE FROM events WHERE _id = $1 RETURNING *'

    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to delete event: ${error.message}`)
    }
}

// Search events by name/description/location
export const searchEvents = async (searchTerm, page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT * FROM events
        WHERE name ILIKE $1 OR description ILIKE $1 OR location ILIKE $1
        ORDER BY _id DESC
        LIMIT $2 OFFSET $3
    `
    const searchPattern = `%${searchTerm}%`

    try {
        const result = await pool.query(query, [searchPattern, limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to search events: ${error.message}`)
    }
}
