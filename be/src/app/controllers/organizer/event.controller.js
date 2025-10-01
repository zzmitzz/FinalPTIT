import * as eventService from '../../services/organizor/event.service'


export async function createEvent(req, res) {
    const event = await eventService.createEvent(req.body)
    res.status(201).json(event)
}

export async function getEventById(req, res) {
    const event = await eventService.getEventById(req.params.id)
    res.json(event)
}

export async function updateEvent(req, res) {
    const { status } = req.body
    if(status && !isValidStatus(status)) {
        return res.status(400).json({ error: 'Invalid status, should be one of ' + Object.values(EVENT_STATUS).join(', ') })
    }
    const event = await eventService.updateEvent(req.params.id, req.body)
    res.json(event)
}

export async function deleteEvent(req, res) {
    await eventService.deleteEvent(req.params.id)
    res.status(204).send()
}

const isValidStatus = (value) => {
    return Object.values(EVENT_STATUS).includes(value);
  };
  