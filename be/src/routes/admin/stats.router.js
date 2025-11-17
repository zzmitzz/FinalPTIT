import { Router } from 'express'
import requireAuthentication from '@/app/middleware/common/require-authentication'
import * as statsController from '@/app/controllers/admin/stats.controller'

const router = Router()

// GET /admin/stats
router.get('/', requireAuthentication, statsController.getStatistics)

export default router
