import pool from '../configs/postgre_sql.js'

// ==================== REGISTRATION TABLE ====================

// Create a new registration (user)
export const createRegistration = async (registrationData) => {
    const { email, phone = '', provider_name = null, provider_user_id = null, password } = registrationData
    const query = `
        INSERT INTO registration (email, phone, provider_name, provider_user_id, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `
    const values = [email, phone, provider_name, provider_user_id, password]
    
    try {
        const result = await pool.query(query, values)
        return result.rows[0]
    } catch (error) {
        throw new Error(`Failed to create registration: ${error.message}`)
    }
}

// Find registration by ID
export const findRegistrationById = async (id) => {
    const query = 'SELECT * FROM registration WHERE _id = $1'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find registration by ID: ${error.message}`)
    }
}

// Find registration by email
export const findRegistrationByEmail = async (email) => {
    const query = 'SELECT * FROM registration WHERE email = $1'
    
    try {
        const result = await pool.query(query, [email])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find registration by email: ${error.message}`)
    }
}

// Find registration by provider
export const findRegistrationByProvider = async (providerName, providerUserId) => {
    const query = 'SELECT * FROM registration WHERE provider_name = $1 AND provider_user_id = $2'
    
    try {
        const result = await pool.query(query, [providerName, providerUserId])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find registration by provider: ${error.message}`)
    }
}

// Get all registrations with pagination
export const findAllRegistrations = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT * FROM registration 
        ORDER BY _id DESC 
        LIMIT $1 OFFSET $2
    `
    
    try {
        const result = await pool.query(query, [limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to fetch registrations: ${error.message}`)
    }
}

// Get total count of registrations
export const countRegistrations = async () => {
    const query = 'SELECT COUNT(*) as total FROM registration'
    
    try {
        const result = await pool.query(query)
        return parseInt(result.rows[0].total)
    } catch (error) {
        throw new Error(`Failed to count registrations: ${error.message}`)
    }
}

// Update registration by ID
export const updateRegistrationById = async (id, updateData) => {
    const { email, phone, provider_name, provider_user_id, password } = updateData
    const setClause = []
    const values = []
    let paramCount = 1

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
    if (provider_name !== undefined) {
        setClause.push(`provider_name = $${paramCount}`)
        values.push(provider_name)
        paramCount++
    }
    if (provider_user_id !== undefined) {
        setClause.push(`provider_user_id = $${paramCount}`)
        values.push(provider_user_id)
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
        UPDATE registration 
        SET ${setClause.join(', ')}
        WHERE _id = $${paramCount}
        RETURNING *
    `
    values.push(id)

    try {
        const result = await pool.query(query, values)
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to update registration: ${error.message}`)
    }
}

// Delete registration by ID
export const deleteRegistrationById = async (id) => {
    const query = 'DELETE FROM registration WHERE _id = $1 RETURNING *'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to delete registration: ${error.message}`)
    }
}

// Check if email exists
export const registrationEmailExists = async (email, excludeId = null) => {
    let query = 'SELECT COUNT(*) as count FROM registration WHERE email = $1'
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

// Search registrations by email or phone
export const searchRegistrations = async (searchTerm, page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT * FROM registration 
        WHERE email ILIKE $1 OR phone ILIKE $1
        ORDER BY _id DESC 
        LIMIT $2 OFFSET $3
    `
    const searchPattern = `%${searchTerm}%`
    
    try {
        const result = await pool.query(query, [searchPattern, limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to search registrations: ${error.message}`)
    }
}

// ==================== REGISTRATION INFORMATION TABLE ====================

// Create registration information
export const createRegistrationInformation = async (infoData) => {
    const { 
        user_id, 
        field_code, 
        field_name, 
        field_value, 
        visibility = 'PRIVATE' 
    } = infoData
    
    const query = `
        INSERT INTO registration_information (
            user_id, field_code, field_name, field_value, visibility, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
    `
    const values = [user_id, field_code, field_name, field_value, visibility]
    
    try {
        const result = await pool.query(query, values)
        return result.rows[0]
    } catch (error) {
        throw new Error(`Failed to create registration information: ${error.message}`)
    }
}

// Find registration information by ID
export const findRegistrationInformationById = async (id) => {
    const query = 'SELECT * FROM registration_information WHERE id = $1'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find registration information by ID: ${error.message}`)
    }
}

// Find registration information by user ID
export const findRegistrationInformationByUserId = async (userId) => {
    const query = 'SELECT * FROM registration_information WHERE user_id = $1 ORDER BY created_at ASC'
    
    try {
        const result = await pool.query(query, [userId])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to find registration information by user ID: ${error.message}`)
    }
}

// Find registration information by user ID and field code
export const findRegistrationInformationByUserAndField = async (userId, fieldCode) => {
    const query = 'SELECT * FROM registration_information WHERE user_id = $1 AND field_code = $2'
    
    try {
        const result = await pool.query(query, [userId, fieldCode])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find registration information by user and field: ${error.message}`)
    }
}

// Update registration information by ID
export const updateRegistrationInformationById = async (id, updateData) => {
    const { field_name, field_value, visibility } = updateData
    const setClause = []
    const values = []
    let paramCount = 1

    if (field_name !== undefined) {
        setClause.push(`field_name = $${paramCount}`)
        values.push(field_name)
        paramCount++
    }
    if (field_value !== undefined) {
        setClause.push(`field_value = $${paramCount}`)
        values.push(field_value)
        paramCount++
    }
    if (visibility !== undefined) {
        setClause.push(`visibility = $${paramCount}`)
        values.push(visibility)
        paramCount++
    }

    if (setClause.length === 0) {
        throw new Error('No fields to update')
    }

    const query = `
        UPDATE registration_information 
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount}
        RETURNING *
    `
    values.push(id)

    try {
        const result = await pool.query(query, values)
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to update registration information: ${error.message}`)
    }
}

// Delete registration information by ID
export const deleteRegistrationInformationById = async (id) => {
    const query = 'DELETE FROM registration_information WHERE id = $1 RETURNING *'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to delete registration information: ${error.message}`)
    }
}

// Delete all registration information by user ID
export const deleteRegistrationInformationByUserId = async (userId) => {
    const query = 'DELETE FROM registration_information WHERE user_id = $1 RETURNING *'
    
    try {
        const result = await pool.query(query, [userId])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to delete registration information by user ID: ${error.message}`)
    }
}

// Get registration information by visibility
export const findRegistrationInformationByVisibility = async (visibility, page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT * FROM registration_information 
        WHERE visibility = $1
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
    `
    
    try {
        const result = await pool.query(query, [visibility, limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to find registration information by visibility: ${error.message}`)
    }
}

// ==================== REGISTRATION FIELD PERMISSION TABLE ====================

// Create registration field permission
export const createRegistrationFieldPermission = async (permissionData) => {
    const { registration_info_id, organizer_id, can_view = false } = permissionData
    
    const query = `
        INSERT INTO registration_field_permission (
            registration_info_id, organizer_id, can_view, created_at
        )
        VALUES ($1, $2, $3, NOW())
        RETURNING *
    `
    const values = [registration_info_id, organizer_id, can_view]
    
    try {
        const result = await pool.query(query, values)
        return result.rows[0]
    } catch (error) {
        throw new Error(`Failed to create registration field permission: ${error.message}`)
    }
}

// Find registration field permission by ID
export const findRegistrationFieldPermissionById = async (id) => {
    const query = 'SELECT * FROM registration_field_permission WHERE id = $1'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find registration field permission by ID: ${error.message}`)
    }
}

// Find registration field permission by registration info and organizer
export const findRegistrationFieldPermissionByInfoAndOrganizer = async (registrationInfoId, organizerId) => {
    const query = 'SELECT * FROM registration_field_permission WHERE registration_info_id = $1 AND organizer_id = $2'
    
    try {
        const result = await pool.query(query, [registrationInfoId, organizerId])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find registration field permission: ${error.message}`)
    }
}

// Find all permissions for an organizer
export const findRegistrationFieldPermissionsByOrganizer = async (organizerId) => {
    const query = `
        SELECT rfp.*, ri.field_code, ri.field_name, ri.field_value, ri.visibility
        FROM registration_field_permission rfp
        JOIN registration_information ri ON rfp.registration_info_id = ri.id
        WHERE rfp.organizer_id = $1 AND rfp.can_view = true
        ORDER BY ri.created_at DESC
    `
    
    try {
        const result = await pool.query(query, [organizerId])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to find registration field permissions by organizer: ${error.message}`)
    }
}

// Find all permissions for a registration info
export const findRegistrationFieldPermissionsByInfo = async (registrationInfoId) => {
    const query = `
        SELECT rfp.*, o.name as organizer_name, o.email as organizer_email
        FROM registration_field_permission rfp
        JOIN organizers o ON rfp.organizer_id = o._id
        WHERE rfp.registration_info_id = $1
        ORDER BY rfp.created_at DESC
    `
    
    try {
        const result = await pool.query(query, [registrationInfoId])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to find registration field permissions by info: ${error.message}`)
    }
}

// Update registration field permission by ID
export const updateRegistrationFieldPermissionById = async (id, updateData) => {
    const { can_view } = updateData
    const query = `
        UPDATE registration_field_permission 
        SET can_view = $1
        WHERE id = $2
        RETURNING *
    `
    
    try {
        const result = await pool.query(query, [can_view, id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to update registration field permission: ${error.message}`)
    }
}

// Delete registration field permission by ID
export const deleteRegistrationFieldPermissionById = async (id) => {
    const query = 'DELETE FROM registration_field_permission WHERE id = $1 RETURNING *'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to delete registration field permission: ${error.message}`)
    }
}

// Delete all permissions for a registration info
export const deleteRegistrationFieldPermissionsByInfo = async (registrationInfoId) => {
    const query = 'DELETE FROM registration_field_permission WHERE registration_info_id = $1 RETURNING *'
    
    try {
        const result = await pool.query(query, [registrationInfoId])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to delete registration field permissions by info: ${error.message}`)
    }
}

// Delete all permissions for an organizer
export const deleteRegistrationFieldPermissionsByOrganizer = async (organizerId) => {
    const query = 'DELETE FROM registration_field_permission WHERE organizer_id = $1 RETURNING *'
    
    try {
        const result = await pool.query(query, [organizerId])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to delete registration field permissions by organizer: ${error.message}`)
    }
}

// ==================== COMBINED QUERIES ====================

// Get registration with all information
export const findRegistrationWithInformation = async (userId) => {
    const query = `
        SELECT 
            r.*,
            ri.id as info_id,
            ri.field_code,
            ri.field_name,
            ri.field_value,
            ri.visibility,
            ri.created_at as info_created_at,
            ri.updated_at as info_updated_at
        FROM registration r
        LEFT JOIN registration_information ri ON r._id = ri.user_id
        WHERE r._id = $1
        ORDER BY ri.created_at ASC
    `
    
    try {
        const result = await pool.query(query, [userId])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to find registration with information: ${error.message}`)
    }
}

// Get registration information accessible to organizer
export const findRegistrationInformationAccessibleToOrganizer = async (organizerId, userId = null) => {
    let query = `
        SELECT DISTINCT
            ri.id,
            ri.user_id,
            ri.field_code,
            ri.field_name,
            ri.field_value,
            ri.visibility,
            ri.created_at,
            ri.updated_at,
            r.email as user_email
        FROM registration_information ri
        JOIN registration r ON ri.user_id = r._id
        LEFT JOIN registration_field_permission rfp ON ri.id = rfp.registration_info_id AND rfp.organizer_id = $1
        WHERE ri.visibility = 'PUBLIC' 
           OR (rfp.can_view = true)
    `
    const values = [organizerId]
    
    if (userId) {
        query += ' AND ri.user_id = $2'
        values.push(userId)
    }
    
    query += ' ORDER BY ri.created_at DESC'
    
    try {
        const result = await pool.query(query, values)
        return result.rows
    } catch (error) {
        throw new Error(`Failed to find accessible registration information: ${error.message}`)
    }
}

// Get organizer's accessible user profiles
export const findUsersAccessibleToOrganizer = async (organizerId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT DISTINCT
            r._id,
            r.email,
            r.phone,
            r.provider_name,
            COUNT(ri.id) as field_count,
            COUNT(CASE WHEN ri.visibility = 'PUBLIC' OR rfp.can_view = true THEN 1 END) as accessible_field_count
        FROM registration r
        LEFT JOIN registration_information ri ON r._id = ri.user_id
        LEFT JOIN registration_field_permission rfp ON ri.id = rfp.registration_info_id AND rfp.organizer_id = $1
        WHERE ri.visibility = 'PUBLIC' OR rfp.can_view = true
        GROUP BY r._id, r.email, r.phone, r.provider_name
        ORDER BY r._id DESC
        LIMIT $2 OFFSET $3
    `
    
    try {
        const result = await pool.query(query, [organizerId, limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to find users accessible to organizer: ${error.message}`)
    }
}

// Grant organizer access to user field
export const grantOrganizerAccessToField = async (registrationInfoId, organizerId, canView = true) => {
    // Check if permission already exists
    const existingPermission = await findRegistrationFieldPermissionByInfoAndOrganizer(registrationInfoId, organizerId)
    
    if (existingPermission) {
        // Update existing permission
        return await updateRegistrationFieldPermissionById(existingPermission.id, { can_view: canView })
    } else {
        // Create new permission
        return await createRegistrationFieldPermission({
            registration_info_id: registrationInfoId,
            organizer_id: organizerId,
            can_view: canView
        })
    }
}

// Revoke organizer access to user field
export const revokeOrganizerAccessToField = async (registrationInfoId, organizerId) => {
    const permission = await findRegistrationFieldPermissionByInfoAndOrganizer(registrationInfoId, organizerId)
    
    if (permission) {
        return await deleteRegistrationFieldPermissionById(permission.id)
    }
    
    return null
}

// Check if organizer can view field
export const canOrganizerViewField = async (registrationInfoId, organizerId) => {
    const query = `
        SELECT 
            ri.visibility,
            rfp.can_view
        FROM registration_information ri
        LEFT JOIN registration_field_permission rfp ON ri.id = rfp.registration_info_id AND rfp.organizer_id = $2
        WHERE ri.id = $1
    `
    
    try {
        const result = await pool.query(query, [registrationInfoId, organizerId])
        const row = result.rows[0]
        
        if (!row) return false
        
        // Public fields are always accessible
        if (row.visibility === 'PUBLIC') return true
        
        // Check explicit permission
        return row.can_view === true
    } catch (error) {
        throw new Error(`Failed to check organizer field access: ${error.message}`)
    }
}
