import * as statsService from '@/app/services/admin/stats.service'

export async function getStatistics(req, res) {
  try {
    const year = req.query.year ? Number(req.query.year) : undefined
    const month = req.query.month ? Number(req.query.month) : undefined
    const limit = req.query.limit ? Number(req.query.limit) : undefined
    const ttlSeconds = req.query.ttl ? Number(req.query.ttl) : undefined

    const stats = await statsService.getAdminStatistics({ year, month, limit, ttlSeconds })
    res.json({ success: true, data: stats })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}

export default { getStatistics }
