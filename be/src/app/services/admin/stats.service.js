import sequelize from '@/configs/postgre_sql.js'
import * as organizerRepo from '@/db/organizer_repo'
import * as eventRepo from '@/db/event_repository'
import { cache, EVENT_CATEGORY } from '@/configs'

const toISOStringUTC = (d) => new Date(d).toISOString()

// map event category codes to friendly Vietnamese labels
const CATEGORY_LABELS = {
    [EVENT_CATEGORY.ENVIRONMENT]: 'Môi trường',
    [EVENT_CATEGORY.ECONOMY]: 'Kinh tế',
    [EVENT_CATEGORY.EDUCATION]: 'Giáo dục',
    [EVENT_CATEGORY.HEALTH]: 'Y tế',
    [EVENT_CATEGORY.TECHNOLOGY]: 'Công nghệ',
}

const statsCache = cache.create('admin-stats')

/**
 * options: { year?: number, month?: number, limit?: number, ttlSeconds?: number }
 */
export async function getAdminStatistics(options = {}) {
    const now = new Date()
    const year = Number(options.year) || now.getFullYear()
    const month = Number(options.month) || (now.getMonth() + 1) // 1-based
    const limit = Number(options.limit) || 3
    const ttlSeconds = Number(options.ttlSeconds) || 60 // default 60s cache TTL

    const cacheKey = `stats:${year}:${month}:${limit}`
    try {
        const cached = await statsCache.get(cacheKey)
        if (cached) return cached
    } catch (e) {
    // ignore cache read errors and continue
    }

    // Month range (start of month -> end of month)
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)

    // Pie chart: count of events grouped by category in the requested month
    const pieQuery = `
    SELECT category_id AS name, COUNT(*)::int AS value
    FROM events
    WHERE start_time BETWEEN :start AND :end
    GROUP BY category_id
  `

    // Bar chart: number of events per month for the requested year
    const barQuery = `
    SELECT EXTRACT(MONTH FROM start_time)::int AS month, COUNT(*)::int AS value
    FROM events
    WHERE EXTRACT(YEAR FROM start_time) = :year
    GROUP BY month
    ORDER BY month
  `

    // Leaderboard: top N events in this month by number of registrations
    // include events with zero registrations by left-joining registrations
    const leaderboardQuery = `
    SELECT e._id AS event_id, e.name, e.thumbnail, COALESCE(COUNT(rre.*), 0)::int AS registrations
    FROM events e
    LEFT JOIN registration_register_event rre
      ON e._id = rre.event_id AND rre.is_registered = true
    WHERE e.start_time BETWEEN :start AND :end
    GROUP BY e._id, e.name, e.thumbnail
    ORDER BY registrations DESC
    LIMIT :limit
  `

    try {
        const pieRows = await sequelize.query(pieQuery, { replacements: { start: toISOStringUTC(monthStart), end: toISOStringUTC(monthEnd) }, type: sequelize.QueryTypes.SELECT })

        const barRows = await sequelize.query(barQuery, { replacements: { year }, type: sequelize.QueryTypes.SELECT })

        const leaderboardRows = await sequelize.query(leaderboardQuery, { replacements: { start: toISOStringUTC(monthStart), end: toISOStringUTC(monthEnd), limit }, type: sequelize.QueryTypes.SELECT })

        // Normalize bar data to 12 months
        const barData = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value: 0 }))
        for (const r of barRows) {
            const m = Number(r.month)
            if (m >= 1 && m <= 12) barData[m - 1].value = Number(r.value)
        }

        // Pie data: map category ids to friendly labels
        const pieData = pieRows.map(r => ({ name: CATEGORY_LABELS[r.name] || r.name, value: Number(r.value) }))

        // Stats
        const ongoingQuery = `
      SELECT COUNT(*)::int AS ongoing
      FROM events
      WHERE start_time <= :now AND end_time >= :now
    `
        const ongoingRows = await sequelize.query(ongoingQuery, { replacements: { now: toISOStringUTC(now) }, type: sequelize.QueryTypes.SELECT })
        const ongoing = ongoingRows?.[0]?.ongoing ? Number(ongoingRows[0].ongoing) : 0

        const organizers = await organizerRepo.countOrganizers()
        const totalEvents = await eventRepo.countEvents()

        // Leaderboard mapping
        const leaderboard = leaderboardRows.map(r => ({ event_id: r.event_id, name: r.name, thumbnail: r.thumbnail, registrations: Number(r.registrations) }))

        const result = {
            pie: pieData,
            bar: barData,
            stats: {
                ongoing,
                organizers: Number(organizers),
                total_events: Number(totalEvents),
            },
            leaderboard,
        }

        // cache result
        try {
            await statsCache.set(cacheKey, result, ttlSeconds)
        } catch (e) {
            // ignore cache write errors
        }

        return result
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to compute admin statistics: ${msg}`)
    }
}

export default { getAdminStatistics }
