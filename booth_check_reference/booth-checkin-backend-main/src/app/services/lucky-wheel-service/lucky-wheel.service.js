import { LINK_STATIC_URL } from '@/configs'
import LuckyWheel from '@/models/lucky_wheel_flow/lucky-wheel'
import LwDetail from '@/models/lucky_wheel_flow/lucky-wheel-detail'
import LwHistory from '@/models/lucky_wheel_flow/luck-wheel-history'
import LwPrize from '@/models/lucky_wheel_flow/lucky_wheel_prize'
import Registration from '@/models/registration'
import _ from 'lodash'

/**
 * Get all lucky wheels for an event
 */
export async function getLuckyWheels(event) {
    const luckyWheels = await LuckyWheel.find({
        event_id: event._id,
    }).sort({ created_at: -1 }).lean()

    return luckyWheels
}

/**
 * Create a new lucky wheel for an event
 */
export async function createLuckyWheel(session, event, organizer, { title, type }) {
    const luckyWheel = new LuckyWheel({
        event_id: event._id,
        title,
        type,
        created_by: organizer._id
    })

    await luckyWheel.save({ session })
    return luckyWheel
}

/**
 * Get a lucky wheel by ID
 */
export async function getLuckyWheel(event, luckyWheelId) {
    const luckyWheel = await LuckyWheel.findOne({
        _id: luckyWheelId,
        event_id: event._id
    }).lean()

    return luckyWheel
}

/**
 * Update a lucky wheel
 */
export async function updateLuckyWheel(session, event, luckyWheelId, { title, type }) {
    const luckyWheel = await LuckyWheel.findOneAndUpdate(
        {
            _id: luckyWheelId,
            event_id: event._id
        },
        {
            title,
            type
        },
        {
            new: true,
            session
        }
    ).lean()

    return luckyWheel
}

/**
 * Delete a lucky wheel
 */
export async function deleteLuckyWheel(session, event, luckyWheelId) {
    // First delete all prize details associated with this wheel
    await LwDetail.deleteMany({
        lucky_wheel_id: luckyWheelId
    }, { session })

    // Then delete the wheel itself
    const luckyWheel = await LuckyWheel.findOneAndDelete({
        _id: luckyWheelId,
        event_id: event._id
    }, { session }).lean()

    return luckyWheel
}

/**
 * Set prizes and quantities for a lucky wheel
 */
export async function setLuckyWheelPrizes(session, event, luckyWheelId, prizes) {
    // First check if lucky wheel exists
    const luckyWheel = await LuckyWheel.findOne({
        _id: luckyWheelId,
        event_id: event._id
    }).session(session)

    if (!luckyWheel) {
        return null
    }

    // Delete existing prize details
    await LwDetail.deleteMany({
        lucky_wheel_id: luckyWheelId
    }, { session })

    // Create new prize details
    const prizeDetails = []
    for (const prize of prizes) {
        const prizeDetail = new LwDetail({
            lucky_wheel_id: luckyWheelId,
            prize_id: prize.prize_id,
            quantity: prize.quantity
        })
        await prizeDetail.save({ session })
        prizeDetails.push(prizeDetail)
    }

    return {
        luckyWheel,
        prizeDetails
    }
}

/**
 * Get prizes and their remaining quantities for a lucky wheel
 */
export async function getLuckyWheelPrizes(event, luckyWheelId) {
    // First check if lucky wheel exists
    const luckyWheel = await LuckyWheel.findOne({
        _id: luckyWheelId,
        event_id: event._id
    })

    if (!luckyWheel) {
        return null
    }

    // Get prize details for this wheel
    const prizeDetails = await LwDetail.find({
        lucky_wheel_id: luckyWheelId
    }).populate('lw_prize').lean()

    // Get history to calculate remaining quantities
    const histories = await LwHistory.find({
        lucky_wheel_id: luckyWheelId
    }).lean()

    const formattedPrizes = []

    for (const detail of prizeDetails) {
        const prize = detail.lw_prize[0]

        if (prize) {
            const usedQuantity = histories.filter(h => h.prize_id?.toString() === prize._id.toString()).length
            const remainingQuantity = detail.quantity - usedQuantity

            formattedPrizes.push({
                ...prize,
                picture: prize.picture ? LINK_STATIC_URL + prize.picture : null,
                initial_quantity: detail.quantity,
                remaining_quantity: remainingQuantity > 0 ? remainingQuantity : 0
            })
        }
    }

    return {
        luckyWheel,
        prizes: formattedPrizes
    }
}

/**
 * Spin the lucky wheel to get a random prize
 */
export async function spinLuckyWheel(session, event, luckyWheelId, registrationId = null) {
    // First check if lucky wheel exists
    const luckyWheel = await LuckyWheel.findOne({
        _id: luckyWheelId,
        event_id: event._id
    }).session(session)

    if (!luckyWheel) {
        return null
    }

    // Get prize details for this wheel
    const prizeDetails = await LwDetail.find({
        lucky_wheel_id: luckyWheelId
    }).populate('lw_prize').session(session)

    // Get history to calculate remaining quantities
    const histories = await LwHistory.find({
        lucky_wheel_id: luckyWheelId
    }).session(session)

    // Calculate available prizes
    const availablePrizes = []

    for (const detail of prizeDetails) {
        const prize = detail.lw_prize[0]
        
        if (prize && prize.availability) {
            const usedQuantity = histories.filter(h =>
                h.prize_id?.toString() === prize._id.toString()
            ).length
            console.log('usedQuantity', usedQuantity)
            const remainingQuantity = detail.quantity - usedQuantity

            if (remainingQuantity > 0) {
                for (let i = 0; i < remainingQuantity; i++) {
                    availablePrizes.push(prize)
                }
            }
        }
    }


    if (availablePrizes.length === 0) {
        return null // No available prizes
    }

    // Select a random prize
    const randomIndex = Math.floor(Math.random() * availablePrizes.length)
    const selectedPrize = availablePrizes[randomIndex]

    // Handle different wheel types
    let selectedRegistration = null
    if (luckyWheel.type === 'LUCKY_CHECKED_IN') {
        // For LUCKY_CHECKED_IN, select a random registration that has checked in
        const registrations = await Registration.find({
            event_id: event._id,
            // Only consider registrations that have checked in
            check_in_at: { $ne: null }
        }).populate('responses').session(session)

        if (registrations.length === 0) {
            return null // No checked-in registrations available
        }

        const randomRegIndex = Math.floor(Math.random() * registrations.length)
        selectedRegistration = registrations[randomRegIndex]
    } else if (registrationId) {
        // For LUCKY_PRIZE with an explicit registration ID
        selectedRegistration = await Registration.findOne({
            _id: registrationId,
            event_id: event._id
        }).populate('responses').session(session)
    }

    // Create history record
    const history = new LwHistory({
        lucky_wheel_id: luckyWheelId,
        registration_id: selectedRegistration?._id,
        prize_id: selectedPrize._id,
        prize_name: selectedPrize.name,
        awared_at: new Date(),
        lucky_wheel_type: luckyWheel.type
    })

    await history.save({ session })

    // Calculate updated remaining quantities for response
    const remainingQuantities = {}

    for (const detail of prizeDetails) {
        const prize = detail.lw_prize[0]

        if (prize) {
            const updatedHistories = [...histories, history]
            const usedQuantity = updatedHistories.filter(h =>
                h.prize_id?.toString() === prize._id.toString()
            ).length

            const remainingQuantity = detail.quantity - usedQuantity
            remainingQuantities[prize._id.toString()] = remainingQuantity > 0 ? remainingQuantity : 0
        }
    }

    return {
        prize: {
            ...selectedPrize.toObject(),
            picture: selectedPrize.picture ? LINK_STATIC_URL + selectedPrize.picture : null
        },
        registration: selectedRegistration ? selectedRegistration.toObject() : null,
        remaining_quantities: remainingQuantities
    }
}

/**
 * Get the history of lucky wheel spins
 */
export async function getLuckyWheelHistory(event, luckyWheelId, { page = 1, per_page = 20, sort_order = 'desc' }) {
    // First check if lucky wheel exists
    const luckyWheel = await LuckyWheel.findOne({
        _id: luckyWheelId,
        event_id: event._id
    })

    if (!luckyWheel) {
        return null
    }

    const skip = (page - 1) * per_page
    const sortDirection = sort_order === 'desc' ? -1 : 1

    // Get history with pagination
    const [histories, totalCount] = await Promise.all([
        LwHistory.find({
            lucky_wheel_id: luckyWheelId
        })
            .sort({ awared_at: sortDirection })
            .skip(skip)
            .limit(per_page)
            .populate('registrations')
            .lean(),

        LwHistory.countDocuments({
            lucky_wheel_id: luckyWheelId
        })
    ])

    return {
        data: histories,
        pagination: {
            total: totalCount,
            count: histories.length,
            per_page: parseInt(per_page),
            current_page: parseInt(page),
            total_pages: Math.ceil(totalCount / per_page)
        }
    }
} 