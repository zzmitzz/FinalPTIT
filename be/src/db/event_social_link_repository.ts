import EventSocialLink from '../model/event_social_link'

export type SocialLinkInput = {
  platform: string
  url: string
  label?: string | null
  position?: number
}

export const listByEventId = async (eventId: string) => {
  const rows = await EventSocialLink.findAll({
    where: { event_id: eventId },
    order: [
      ['position', 'ASC'],
      ['id', 'ASC'],
    ],
  })
  return rows.map((r) => (typeof (r as any).toJSON === 'function' ? (r as any).toJSON() : r))
}

export const deleteByEventId = async (eventId: string) => {
  return await EventSocialLink.destroy({ where: { event_id: eventId } })
}

export const bulkCreateForEvent = async (eventId: string, links: SocialLinkInput[]) => {
  if (!Array.isArray(links) || links.length === 0) return []

  const payload = links.map((l, idx) => ({
    event_id: eventId,
    platform: l.platform,
    url: l.url,
    label: l.label ?? null,
    position: Number.isFinite(Number(l.position)) ? Number(l.position) : idx,
  }))

  const rows = await EventSocialLink.bulkCreate(payload as any[])
  return rows.map((r) => (typeof (r as any).toJSON === 'function' ? (r as any).toJSON() : r))
}

export const replaceAllForEvent = async (eventId: string, links: SocialLinkInput[]) => {
  await deleteByEventId(eventId)
  return await bulkCreateForEvent(eventId, links)
}
