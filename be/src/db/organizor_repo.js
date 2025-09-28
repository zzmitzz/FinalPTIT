import pool from '../configs/postgre_sql.js'

// ==================== ORGANIZERS TABLE ====================

// Create a new organizer
export const createOrganizer = async (organizerData) => {
    const { name, email, phone, password } = organizerData
    const query = `
        INSERT INTO organizers (name, email, phone, password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
    `
    const values = [name, email, phone, password]
    
    try {
        const result = await pool.query(query, values)
        return result.rows[0]
    } catch (error) {
        throw new Error(`Failed to create organizer: ${error.message}`)
    }
}

// Find organizer by ID
export const findOrganizerById = async (id) => {
    const query = 'SELECT * FROM organizers WHERE _id = $1'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find organizer by ID: ${error.message}`)
    }
}

// Find organizer by email
export const findOrganizerByEmail = async (email) => {
    const query = 'SELECT * FROM organizers WHERE email = $1'
    
    try {
        const result = await pool.query(query, [email])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find organizer by email: ${error.message}`)
    }
}

// Get all organizers with pagination
export const findAllOrganizers = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT * FROM organizers 
        ORDER BY _id DESC 
        LIMIT $1 OFFSET $2
    `
    
    try {
        const result = await pool.query(query, [limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to fetch organizers: ${error.message}`)
    }
}

// Get total count of organizers
export const countOrganizers = async () => {
    const query = 'SELECT COUNT(*) as total FROM organizers'
    
    try {
        const result = await pool.query(query)
        return parseInt(result.rows[0].total)
    } catch (error) {
        throw new Error(`Failed to count organizers: ${error.message}`)
    }
}

// Update organizer by ID
export const updateOrganizerById = async (id, updateData) => {
    const { name, email, phone, password } = updateData
    const setClause = []
    const values = []
    let paramCount = 1

    if (name !== undefined) {
        setClause.push(`name = $${paramCount}`)
        values.push(name)
        paramCount++
    }
    if (email !== undefined) {
        setClause.push(`email = $${paramCount}`)
        values.push(email)
        paramCount++
    }
    if (phone !== undefined) {
        setClause.push(`phone = $${paramCount}`)
        values.push(phone)
        paramCount++
    }
    if (password !== undefined) {
        setClause.push(`password = $${paramCount}`)
        values.push(password)
        paramCount++
    }

    if (setClause.length === 0) {
        throw new Error('No fields to update')
    }

    const query = `
        UPDATE organizers 
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE _id = $${paramCount}
        RETURNING *
    `
    values.push(id)

    try {
        const result = await pool.query(query, values)
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to update organizer: ${error.message}`)
    }
}

// Delete organizer by ID
export const deleteOrganizerById = async (id) => {
    const query = 'DELETE FROM organizers WHERE _id = $1 RETURNING *'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to delete organizer: ${error.message}`)
    }
}

// Check if email exists
export const organizerEmailExists = async (email, excludeId = null) => {
    let query = 'SELECT COUNT(*) as count FROM organizers WHERE email = $1'
    const values = [email]
    
    if (excludeId) {
        query += ' AND _id != $2'
        values.push(excludeId)
    }
    
    try {
        const result = await pool.query(query, values)
        return parseInt(result.rows[0].count) > 0
    } catch (error) {
        throw new Error(`Failed to check email existence: ${error.message}`)
    }
}

// Search organizers by name or email
export const searchOrganizers = async (searchTerm, page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT * FROM organizers 
        WHERE name ILIKE $1 OR email ILIKE $1
        ORDER BY _id DESC 
        LIMIT $2 OFFSET $3
    `
    const searchPattern = `%${searchTerm}%`
    
    try {
        const result = await pool.query(query, [searchPattern, limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to search organizers: ${error.message}`)
    }
}

// ==================== ORGANIZER INFORMATION TABLE ====================

// Create organizer information
export const createOrganizerInformation = async (infoData) => {
    const { 
        organizer_id, 
        organization_name, 
        address = null, 
        website = null, 
        description = null, 
        logo_url = null 
    } = infoData
    
    const query = `
        INSERT INTO organizer_information (
            organizer_id, organization_name, address, website, 
            description, logo_url, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
    `
    const values = [organizer_id, organization_name, address, website, description, logo_url]
    
    try {
        const result = await pool.query(query, values)
        return result.rows[0]
    } catch (error) {
        throw new Error(`Failed to create organizer information: ${error.message}`)
    }
}

// Find organizer information by organizer ID
export const findOrganizerInformationByOrganizerId = async (organizerId) => {
    const query = 'SELECT * FROM organizer_information WHERE organizer_id = $1'
    
    try {
        const result = await pool.query(query, [organizerId])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find organizer information: ${error.message}`)
    }
}

// Find organizer information by ID
export const findOrganizerInformationById = async (id) => {
    const query = 'SELECT * FROM organizer_information WHERE _id = $1'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find organizer information by ID: ${error.message}`)
    }
}

// Update organizer information by organizer ID
export const updateOrganizerInformationByOrganizerId = async (organizerId, updateData) => {
    const { 
        organization_name, 
        address, 
        website, 
        description, 
        logo_url 
    } = updateData
    
    const setClause = []
    const values = []
    let paramCount = 1

    if (organization_name !== undefined) {
        setClause.push(`organization_name = $${paramCount}`)
        values.push(organization_name)
        paramCount++
    }
    if (address !== undefined) {
        setClause.push(`address = $${paramCount}`)
        values.push(address)
        paramCount++
    }
    if (website !== undefined) {
        setClause.push(`website = $${paramCount}`)
        values.push(website)
        paramCount++
    }
    if (description !== undefined) {
        setClause.push(`description = $${paramCount}`)
        values.push(description)
        paramCount++
    }
    if (logo_url !== undefined) {
        setClause.push(`logo_url = $${paramCount}`)
        values.push(logo_url)
        paramCount++
    }

    if (setClause.length === 0) {
        throw new Error('No fields to update')
    }

    const query = `
        UPDATE organizer_information 
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE organizer_id = $${paramCount}
        RETURNING *
    `
    values.push(organizerId)

    try {
        const result = await pool.query(query, values)
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to update organizer information: ${error.message}`)
    }
}

// Delete organizer information by organizer ID
export const deleteOrganizerInformationByOrganizerId = async (organizerId) => {
    const query = 'DELETE FROM organizer_information WHERE organizer_id = $1 RETURNING *'
    
    try {
        const result = await pool.query(query, [organizerId])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to delete organizer information: ${error.message}`)
    }
}

// ==================== COMBINED QUERIES ====================

// Get organizer with their information
export const findOrganizerWithInformation = async (organizerId) => {
    const query = `
        SELECT 
            o.*,
            oi.organization_name,
            oi.address,
            oi.website,
            oi.description,
            oi.logo_url,
            oi.created_at as info_created_at,
            oi.updated_at as info_updated_at
        FROM organizers o
        LEFT JOIN organizer_information oi ON o._id = oi.organizer_id
        WHERE o._id = $1
    `
    
    try {
        const result = await pool.query(query, [organizerId])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find organizer with information: ${error.message}`)
    }
}

// Get all organizers with their information (paginated)
export const findAllOrganizersWithInformation = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT 
            o.*,
            oi.organization_name,
            oi.address,
            oi.website,
            oi.description,
            oi.logo_url,
            oi.created_at as info_created_at,
            oi.updated_at as info_updated_at
        FROM organizers o
        LEFT JOIN organizer_information oi ON o._id = oi.organizer_id
        ORDER BY o._id DESC 
        LIMIT $1 OFFSET $2
    `
    
    try {
        const result = await pool.query(query, [limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to fetch organizers with information: ${error.message}`)
    }
}

// Search organizers with their information
export const searchOrganizersWithInformation = async (searchTerm, page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT 
            o.*,
            oi.organization_name,
            oi.address,
            oi.website,
            oi.description,
            oi.logo_url,
            oi.created_at as info_created_at,
            oi.updated_at as info_updated_at
        FROM organizers o
        LEFT JOIN organizer_information oi ON o._id = oi.organizer_id
        WHERE o.name ILIKE $1 OR o.email ILIKE $1 OR oi.organization_name ILIKE $1
        ORDER BY o._id DESC 
        LIMIT $2 OFFSET $3
    `
    const searchPattern = `%${searchTerm}%`
    
    try {
        const result = await pool.query(query, [searchPattern, limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to search organizers with information: ${error.message}`)
    }
}

// Check if organizer has information
export const organizerHasInformation = async (organizerId) => {
    const query = 'SELECT COUNT(*) as count FROM organizer_information WHERE organizer_id = $1'
    
    try {
        const result = await pool.query(query, [organizerId])
        return parseInt(result.rows[0].count) > 0
    } catch (error) {
        throw new Error(`Failed to check organizer information existence: ${error.message}`)
    }
}
