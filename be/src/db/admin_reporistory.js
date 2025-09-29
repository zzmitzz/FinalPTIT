import pool from '../configs/postgre_sql.js'

// Create a new admin
export const createAdmin = async (adminData) => {
    const { name, email, phone = '', password, role_ids = [] } = adminData
    const query = `
        INSERT INTO admins (name, email, phone, password, role_ids)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `
    const values = [name, email, phone, password, JSON.stringify(role_ids)]
    
    try {
        const result = await pool.query(query, values)
        return result.rows[0]
    } catch (error) {
        throw new Error(`Failed to create admin: ${error.message}`)
    }
}

// Find admin by ID
export const findAdminById = async (id) => {
    const query = 'SELECT * FROM admins WHERE _id = $1'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find admin by ID: ${error.message}`)
    }
}

// Find admin by email
export const findAdminByEmail = async (email) => {
    const query = 'SELECT * FROM admins WHERE email = $1'
    
    try {
        const result = await pool.query(query, [email])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find admin by email: ${error.message}`)
    }
}

// Add: Find admin by phone
export const findAdminByPhone = async (phone) => {
    const query = 'SELECT * FROM admins WHERE phone = $1'
    
    try {
        const result = await pool.query(query, [phone])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to find admin by phone: ${error.message}`)
    }
}

// Get all admins with pagination
export const findAllAdmins = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT * FROM admins 
        ORDER BY _id DESC 
        LIMIT $1 OFFSET $2
    `
    
    try {
        const result = await pool.query(query, [limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to fetch admins: ${error.message}`)
    }
}

// Get total count of admins
export const countAdmins = async () => {
    const query = 'SELECT COUNT(*) as total FROM admins'
    
    try {
        const result = await pool.query(query)
        return parseInt(result.rows[0].total)
    } catch (error) {
        throw new Error(`Failed to count admins: ${error.message}`)
    }
}

// Update admin by ID
export const updateAdminById = async (id, updateData) => {
    const { name, email, phone, password, role_ids } = updateData
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
    if (role_ids !== undefined) {
        setClause.push(`role_ids = $${paramCount}`)
        values.push(JSON.stringify(role_ids))
        paramCount++
    }

    if (setClause.length === 0) {
        throw new Error('No fields to update')
    }

    const query = `
        UPDATE admins 
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE _id = $${paramCount}
        RETURNING *
    `
    values.push(id)

    try {
        const result = await pool.query(query, values)
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to update admin: ${error.message}`)
    }
}

// Delete admin by ID
export const deleteAdminById = async (id) => {
    const query = 'DELETE FROM admins WHERE _id = $1 RETURNING *'
    
    try {
        const result = await pool.query(query, [id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to delete admin: ${error.message}`)
    }
}

// Check if email exists
export const adminEmailExists = async (email, excludeId = null) => {
    let query = 'SELECT COUNT(*) as count FROM admins WHERE email = $1'
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

// Search admins by name or email
export const searchAdmins = async (searchTerm, page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const query = `
        SELECT * FROM admins 
        WHERE name ILIKE $1 OR email ILIKE $1
        ORDER BY _id DESC 
        LIMIT $2 OFFSET $3
    `
    const searchPattern = `%${searchTerm}%`
    
    try {
        const result = await pool.query(query, [searchPattern, limit, offset])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to search admins: ${error.message}`)
    }
}

// Get admins by role IDs
export const findAdminsByRoleIds = async (roleIds) => {
    const query = `
        SELECT * FROM admins 
        WHERE role_ids @> $1
        ORDER BY _id DESC
    `
    
    try {
        const result = await pool.query(query, [JSON.stringify(roleIds)])
        return result.rows
    } catch (error) {
        throw new Error(`Failed to find admins by role IDs: ${error.message}`)
    }
}

// Update admin roles
export const updateAdminRoles = async (id, roleIds) => {
    const query = `
        UPDATE admins 
        SET role_ids = $1, updated_at = NOW()
        WHERE _id = $2
        RETURNING *
    `
    
    try {
        const result = await pool.query(query, [JSON.stringify(roleIds), id])
        return result.rows[0] || null
    } catch (error) {
        throw new Error(`Failed to update admin roles: ${error.message}`)
    }
}
