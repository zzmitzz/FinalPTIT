import {
	createEvent as createEventInRepo,
	findEventById,
	findEventByPinCode,
	findAllEvents,
	countEvents,
	updateEventById,
	deleteEventById,
	searchEvents as searchEventsInRepo,
} from '../../../db/event_repository.js'

export const createEvent = async (eventData) => {
	return await createEventInRepo(eventData)
}

export const getEventById = async (id) => {
	return await findEventById(id)
}

export const getEventByPinCode = async (pinCode) => {
	return await findEventByPinCode(pinCode)
}

export const listEvents = async (page = 1, limit = 10) => {
	const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
	const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

	const [items, total] = await Promise.all([
		findAllEvents(normalizedPage, normalizedLimit),
		countEvents(),
	])

	return {
		items,
		total,
		page: normalizedPage,
		limit: normalizedLimit,
	}
}

export const updateEvent = async (id, updateData) => {
	return await updateEventById(id, updateData)
}

export const deleteEvent = async (id) => {
	return await deleteEventById(id)
}

export const searchEvents = async (searchTerm, page = 1, limit = 10) => {
	const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
	const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

	return await searchEventsInRepo(searchTerm ?? '', normalizedPage, normalizedLimit)
}
