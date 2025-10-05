import * as organizerDetailsService from '../../services/organizor/organizer-details.service'

export async function createOrganizerDetails(req, res) {
    // Add organizer_id from authenticated user
    const detailsData = {
        ...req.body,
        organizer_id: req.currentOrganizer._id
    }

    // Check if details already exist
    const exists = await organizerDetailsService.organizerDetailsExists(req.currentOrganizer._id)
    if (exists) {
        return res.status(409).jsonify(null, 'Thông tin chi tiết của tổ chức đã tồn tại. Vui lòng sử dụng API cập nhật.')
    }

    const details = await organizerDetailsService.createOrganizerDetails(detailsData)
    res.status(201).jsonify(details, 'Tạo thông tin chi tiết tổ chức thành công.')
}

export async function getOrganizerDetails(req, res) {
    // Get details for the authenticated organizer
    const details = await organizerDetailsService.getOrganizerDetailsByOrganizerId(req.currentOrganizer._id)
    
    if (!details) {
        return res.status(404).jsonify(null, 'Không tìm thấy thông tin chi tiết tổ chức.')
    }
    
    res.jsonify(details)
}

export async function getOrganizerDetailsById(req, res) {
    // Get details for a specific organizer (by ID in params)
    const details = await organizerDetailsService.getOrganizerDetailsByOrganizerId(req.params.organizerId)
    
    if (!details) {
        return res.status(404).jsonify(null, 'Không tìm thấy thông tin chi tiết tổ chức.')
    }
    
    res.jsonify(details)
}

export async function getAllOrganizerDetails(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    const details = await organizerDetailsService.getAllOrganizerDetails(page, limit)
    const total = await organizerDetailsService.countOrganizerDetails()

    res.jsonify({
        data: details,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    })
}

export async function updateOrganizerDetails(req, res) {
    // Update details for the authenticated organizer
    const details = await organizerDetailsService.updateOrganizerDetails(
        req.currentOrganizer._id,
        req.body
    )
    
    if (!details) {
        return res.status(404).jsonify(null, 'Không tìm thấy thông tin chi tiết tổ chức.')
    }
    
    res.jsonify(details, 'Cập nhật thông tin chi tiết tổ chức thành công.')
}

export async function deleteOrganizerDetails(req, res) {
    // Delete details for the authenticated organizer
    const result = await organizerDetailsService.deleteOrganizerDetails(req.currentOrganizer._id)
    
    if (!result) {
        return res.status(404).jsonify(null, 'Không tìm thấy thông tin chi tiết tổ chức.')
    }
    
    res.status(204).send()
}

export async function upsertOrganizerDetails(req, res) {
    // Create or update details for the authenticated organizer
    const detailsData = {
        ...req.body,
        organizer_id: req.currentOrganizer._id
    }

    const details = await organizerDetailsService.upsertOrganizerDetails(detailsData)
    res.jsonify(details, 'Lưu thông tin chi tiết tổ chức thành công.')
}

